import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Hàm xác định Base URL của Backend API một cách linh hoạt:
 * 1. Nếu biến NEXT_PUBLIC_API_URL được cấu hình cụ thể (không phải localhost mặc định), ưu tiên sử dụng.
 * 2. Nếu đang chạy trên trình duyệt (client-side), tự động phát hiện hostname hiện tại (ví dụ: dhcd.vix.local, 10.16.7.73)
 *    và trỏ về cổng 8888 của chính host đó.
 * 3. Fallback về NEXT_PUBLIC_API_URL hoặc http://localhost:8888.
 */
export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost:8888') && !envUrl.includes('127.0.0.1:8888')) {
    return envUrl;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${window.location.protocol}//${hostname}:8888`;
    }
  }

  return envUrl || 'http://dhcd.vix.local:8888';
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    // Luôn đảm bảo baseURL chính xác theo môi trường hiện tại
    config.baseURL = getApiBaseUrl();

    if (typeof window !== "undefined") {
      const { token, deptId } = useAuthStore.getState();
      if (token) {
        config.headers.set(
          "Authorization",
          `Bearer ${token}`
        );
      }

      if (deptId) {
        config.headers.set(
          "X-Department-Id",
          deptId
        );
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken } = useAuthStore.getState();

      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'vix.local';
          if (baseDomain && window.location.hostname !== baseDomain && !window.location.hostname.endsWith(`.${baseDomain}`)) {
            window.location.href = `${window.location.protocol}//${baseDomain}${window.location.port ? ':' + window.location.port : ''}`;
          } else {
            window.location.href = '/';
          }
        }
        return Promise.reject(error.response?.data || error);
      }

      try {
        const { data } = await axios.post(`${getApiBaseUrl()}/v1/identity/auth/refresh-token`, { refreshToken });
        
        // Extract new tokens based on expected API response format
        const newAccessToken = data?.data?.accessToken || data?.accessToken;
        const newRefreshToken = data?.data?.refreshToken || data?.refreshToken;

        if (!newAccessToken) {
           throw new Error('Không nhận được access token mới từ server');
        }

        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);
        
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return apiClient(originalRequest);
      } catch (err: any) {
        processQueue(err, null);
        useAuthStore.getState().clearAuth();
        
        if (typeof window !== 'undefined') {
          const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'vix.local';
          if (baseDomain && window.location.hostname !== baseDomain && !window.location.hostname.endsWith(`.${baseDomain}`)) {
            window.location.href = `${window.location.protocol}//${baseDomain}${window.location.port ? ':' + window.location.port : ''}`;
          } else {
            window.location.href = '/';
          }
        }
        
        return Promise.reject(err.response?.data || err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
