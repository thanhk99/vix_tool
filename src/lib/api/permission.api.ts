import apiClient from './client';
import { ApiResponse } from '@/types/api.types';
import { PermissionDto, RoleGroupResponse } from '@/types/permission.types';

export const permissionApi = {
  getMetadata: async (): Promise<ApiResponse<{ resource: string, allowedActions: string[] }[]>> => {
    return apiClient.get('/v1/permissions/metadata');
  },

  getRoleGroups: async (): Promise<ApiResponse<RoleGroupResponse[]>> => {
    return apiClient.get('/v1/permissions/role-groups');
  },

  getMyPermissions: async (): Promise<ApiResponse<PermissionDto[]>> => {
    return apiClient.get('/v1/permissions/my-permissions');
  },

  getUserPermissions: async (userId: string): Promise<ApiResponse<PermissionDto[]>> => {
    return apiClient.get(`/v1/permissions/users/${userId}`);
  },

  saveUserPermissions: async (userId: string, permissions: PermissionDto[]): Promise<ApiResponse<void>> => {
    return apiClient.post(`/v1/permissions/users/${userId}`, permissions);
  },
};
