import apiClient from './client';
import { AuthResponse, LoginRequest, SelectDepartmentRequest } from '@/types/auth.types';
import { ApiResponse } from '@/types/api.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post('/v1/identity/auth/login', data);
  },

  selectDepartment: async (data: SelectDepartmentRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post('/v1/identity/auth/select-department', data);
  },

  getMe: async (): Promise<ApiResponse<AuthResponse['user']>> => {
    return apiClient.get('/v1/identity/auth/me');
  },
};
