import apiClient from './client';
import { ApiResponse } from '@/types/api.types';
import { PagedResponse, EmployeeListItemResponse, EmployeeDetailResponse, CreateEmployeeRequest, UpdateEmployeeRequest, TransferDepartmentRequest, DepartmentResponse, CreateDepartmentRequest } from '@/types/hr.types';

export const hrApi = {
  getEmployees: async (params: {
    page: number;
    size: number;
    keyword?: string;
    departmentId?: string;
  }): Promise<ApiResponse<PagedResponse<EmployeeListItemResponse>>> => {
    return apiClient.get('/v1/hr/employees', { params });
  },

  getEmployeeDetail: async (id: string): Promise<ApiResponse<EmployeeDetailResponse>> => {
    return apiClient.get(`/v1/hr/employees/${id}`);
  },

  createEmployee: async (data: CreateEmployeeRequest): Promise<ApiResponse<EmployeeDetailResponse>> => {
    return apiClient.post('/v1/hr/employees', data);
  },

  updateEmployee: async (id: string, data: UpdateEmployeeRequest): Promise<ApiResponse<EmployeeDetailResponse>> => {
    return apiClient.put(`/v1/hr/employees/${id}`, data);
  },

  transferDepartment: async (id: string, data: TransferDepartmentRequest): Promise<ApiResponse<EmployeeDetailResponse>> => {
    return apiClient.patch(`/v1/hr/employees/${id}/transfer`, data);
  },

  terminateEmployee: async (id: string): Promise<ApiResponse<EmployeeDetailResponse>> => {
    return apiClient.patch(`/v1/hr/employees/${id}/terminate`);
  },

  deactivateEmployee: async (id: string): Promise<ApiResponse<EmployeeDetailResponse>> => {
    return apiClient.patch(`/v1/hr/employees/${id}/deactivate`);
  },
};

export const departmentApi = {
  getAll: async (): Promise<ApiResponse<DepartmentResponse[]>> => {
    return apiClient.get('/v1/hr/departments');
  },

  create: async (data: CreateDepartmentRequest): Promise<ApiResponse<DepartmentResponse>> => {
    return apiClient.post('/v1/hr/departments', data);
  },

  deactivate: async (id: string): Promise<ApiResponse<DepartmentResponse>> => {
    return apiClient.patch(`/v1/hr/departments/${id}/deactivate`);
  },
};
