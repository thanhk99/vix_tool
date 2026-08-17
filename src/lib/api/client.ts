import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
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
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle logout or token refresh here
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
        const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;
        if (baseDomain && window.location.hostname !== baseDomain) {
          window.location.href = `${window.location.protocol}//${baseDomain}${window.location.port ? ':' + window.location.port : ''}`;
        } else {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);



export default apiClient;
