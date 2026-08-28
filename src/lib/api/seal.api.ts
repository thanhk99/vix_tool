import apiClient from './client';
import { SealFormData } from '@/types/funding.types';

export const sealApi = {
  create: async (partnerId: string, data: Partial<SealFormData>) => {
    return apiClient.post(`/v1/capital-source/partners/${partnerId}/seals`, data);
  },
  update: async (partnerId: string, sealId: string, data: Partial<SealFormData>) => {
    return apiClient.put(`/v1/capital-source/partners/${partnerId}/seals/${sealId}`, data);
  },
  uploadFile: async (partnerId: string, sealId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/v1/capital-source/partners/${partnerId}/seals/${sealId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Company-Id': '00000000-0000-0000-0000-000000000000'
      }
    });
  },
  delete: async (partnerId: string, sealId: string) => {
    return apiClient.delete(`/v1/capital-source/partners/${partnerId}/seals/${sealId}`);
  }
};
