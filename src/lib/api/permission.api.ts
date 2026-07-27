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

  // other api methods can be added later
};
