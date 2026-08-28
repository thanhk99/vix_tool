import apiClient from './client';
import { SignatureFormData } from '@/types/funding.types';

export const signatureApi = {
  // Lấy danh sách chữ ký của đối tác
  getSignatures: async (partnerId: string, page = 0, size = 10) => {
    return apiClient.get(`/v1/capital-source/partners/${partnerId}/signatures`, {
      params: { page, size },
    });
  },

  // Generic methods
  create: async (partnerId: string, data: any) => {
    return apiClient.post(`/v1/capital-source/partners/${partnerId}/signatures`, data);
  },

  update: async (partnerId: string, signatureId: string, data: any) => {
    return apiClient.put(`/v1/capital-source/partners/${partnerId}/signatures/${signatureId}`, data);
  },

  uploadFile: async (partnerId: string, signatureId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/v1/capital-source/partners/${partnerId}/signatures/${signatureId}/upload`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'X-Company-Id': '00000000-0000-0000-0000-000000000000'
      },
    });
  },

  delete: async (partnerId: string, signatureId: string) => {
    return apiClient.delete(`/v1/capital-source/partners/${partnerId}/signatures/${signatureId}`);
  },

  // Thêm mới chữ ký
  createSignature: async (partnerId: string, data: SignatureFormData, file?: File | null) => {
    const response = await apiClient.post(`/v1/capital-source/partners/${partnerId}/signatures`, data);
    const signatureId = response.data?.data?.id || response.data?.id || (response as any).id;

    if (file && signatureId) {
      await signatureApi.uploadSignatureFile(partnerId, signatureId, file);
    }
    return response;
  },

  // Cập nhật chữ ký
  updateSignature: async (partnerId: string, signatureId: string, data: SignatureFormData, file?: File | null) => {
    const response = await apiClient.put(`/v1/capital-source/partners/${partnerId}/signatures/${signatureId}`, data);
    
    if (file) {
      await signatureApi.uploadSignatureFile(partnerId, signatureId, file);
    }
    return response;
  },

  // Upload file chữ ký
  uploadSignatureFile: async (partnerId: string, signatureId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/v1/capital-source/partners/${partnerId}/signatures/${signatureId}/upload`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'X-Company-Id': '00000000-0000-0000-0000-000000000000'
      },
    });
  },

  // Xóa chữ ký
  deleteSignature: async (partnerId: string, signatureId: string) => {
    return apiClient.delete(`/v1/capital-source/partners/${partnerId}/signatures/${signatureId}`);
  },

  // Lấy URL xem trước chữ ký
  getSignaturePreviewUrl: async (partnerId: string, signatureId: string) => {
    return apiClient.get(`/v1/capital-source/partners/${partnerId}/signatures/${signatureId}/preview`, {
      headers: {
        'X-Company-Id': '00000000-0000-0000-0000-000000000000'
      }
    });
  },

  // Tải file chữ ký trực tiếp dạng blob
  downloadSignatureBlob: async (partnerId: string, signatureId: string) => {
    return apiClient.get(`/v1/capital-source/partners/${partnerId}/signatures/${signatureId}/download`, {
      responseType: 'blob'
    });
  },
};
