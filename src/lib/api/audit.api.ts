import apiClient from './client';
import { ApiResponse } from '@/types/api.types';

export interface AuditLog {
  id: string;
  action: string;
  module: string;
  description: string;
  performedBy: string;
  departmentId: string | null;
  ipAddress: string;
  timestamp: string;
}

export const auditApi = {
  getMyLogs: async (): Promise<ApiResponse<AuditLog[]>> => {
    return apiClient.get('/v1/audits/me');
  },
};
