export interface EmployeeListItemResponse {
  id: string;
  email: string;
  fullName: string;
  employeeCode: string;
  departmentId: string | null;
  positionId: string | null;
  status: string;
  avatarUrl: string | null;
}

export interface EmployeeDetailResponse extends EmployeeListItemResponse {
  phone: string | null;
  gender: string | null;
  birthDate: string | null; // ISO Date string
  address: string | null;
  idCardNumber: string | null;
  idCardIssuedDate: string | null;
  idCardIssuedPlace: string | null;
  joinDate: string | null;
  terminateDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface CreateEmployeeRequest {
  email: string;
  fullName: string;
  password?: string;
  departmentId: string;
  positionId?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate?: string;
  address?: string;
  idCardNumber?: string;
  idCardIssuedDate?: string;
  idCardIssuedPlace?: string;
  joinDate?: string;
  avatarUrl?: string;
}

export interface UpdateEmployeeRequest {
  fullName: string;
  positionId?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate?: string;
  address?: string;
  idCardNumber?: string;
  idCardIssuedDate?: string;
  idCardIssuedPlace?: string;
  joinDate?: string;
  avatarUrl?: string;
}

export interface TransferDepartmentRequest {
  newDepartmentId: string;
}

export interface DepartmentResponse {
  id: string;
  name: string;
  code: string;
  managerId: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  managerId?: string;
}
