// export interface EmployeeListItemResponse {
//   id: string;
//   email: string;
//   fullName: string;
//   employeeCode: string;
//   departmentId: string | null;
//   positionId: string | null;
//   status: string;
//   avatarUrl: string | null;
// }

// export interface EmployeeDetailResponse extends EmployeeListItemResponse {
//   phone: string | null;
//   gender: string | null;
//   birthDate: string | null; // ISO Date string
//   address: string | null;
//   idCardNumber: string | null;
//   idCardIssuedDate: string | null;
//   idCardIssuedPlace: string | null;
//   joinDate: string | null;
//   terminateDate: string | null;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface PagedResponse<T> {
//   content: T[];
//   pageNumber: number;
//   pageSize: number;
//   totalElements: number;
//   totalPages: number;
//   isLast: boolean;
// }

// export interface CreateEmployeeRequest {
//   email: string;
//   fullName: string;
//   password?: string;
//   departmentId: string;
//   positionId?: string;
//   phone?: string;
//   gender?: 'MALE' | 'FEMALE' | 'OTHER';
//   birthDate?: string;
//   address?: string;
//   idCardNumber?: string;
//   idCardIssuedDate?: string;
//   idCardIssuedPlace?: string;
//   joinDate?: string;
//   avatarUrl?: string;
// }

// export interface UpdateEmployeeRequest {
//   fullName: string;
//   positionId?: string;
//   phone?: string;
//   gender?: 'MALE' | 'FEMALE' | 'OTHER';
//   birthDate?: string;
//   address?: string;
//   idCardNumber?: string;
//   idCardIssuedDate?: string;
//   idCardIssuedPlace?: string;
//   joinDate?: string;
//   avatarUrl?: string;
// }

// export interface TransferDepartmentRequest {
//   newDepartmentId: string;
// }

// export interface DepartmentResponse {
//   id: string;
//   name: string;
//   code: string;
//   managerId: string | null;
//   description: string | null;
//   status: string;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CreateDepartmentRequest {
//   name: string;
//   code: string;
//   description?: string;
//   managerId?: string;
// }

// @/types/hr.types.ts

// ============================================
// POSITION / CHỨC DANH
// ============================================
export interface PositionResponse {
  id: string;
  name: string;        // "Trưởng phòng", "Nhân viên", "Giám đốc", ...
  code: string;        // "HEAD", "STAFF", "DIRECTOR", ...
  description: string | null;
  status: string;      // "ACTIVE", "INACTIVE"
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionRequest {
  name: string;
  code: string;
  description?: string;
}

export interface UpdatePositionRequest {
  name?: string;
  code?: string;
  description?: string;
  status?: string;
}

export interface PositionListResponse {
  content: PositionResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

// ============================================
// DEPARTMENT / PHÒNG BAN
// ============================================
export interface DepartmentResponse {
  id: string;
  name: string;
  code: string;
  managerId: string | null;
  managerName?: string;        
  description: string | null;
  status: string;              // "ACTIVE", "INACTIVE"
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  managerId?: string;          
}

export interface UpdateDepartmentRequest {
  name?: string;
  code?: string;
  description?: string;
  managerId?: string;          
  status?: string;
}

// ============================================
// EMPLOYEE / NHÂN VIÊN
// ============================================
export interface EmployeeListItemResponse {
  id: string;
  email: string;
  fullName: string;
  employeeCode: string;
  departmentId: string | null;
  departmentName?: string;     
  positionId: string | null;
  positionName?: string;       
  status: string;              // "ACTIVE", "INACTIVE", "TERMINATED"
  avatarUrl: string | null;
}

export interface EmployeeDetailResponse extends EmployeeListItemResponse {
  phone: string | null;
  gender: string | null;       // "MALE", "FEMALE", "OTHER"
  birthDate: string | null;
  address: string | null;
  idCardNumber: string | null;
  idCardIssuedDate: string | null;
  idCardIssuedPlace: string | null;
  joinDate: string | null;
  terminateDate: string | null;
  createdAt: string;
  updatedAt: string;
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
  fullName?: string;
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
  status?: string;            
}

export interface TransferDepartmentRequest {
  newDepartmentId: string;
  newPositionId?: string;      
}

// ============================================
// COMMON / DÙNG CHUNG
// ============================================
export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// ============================================
// FILTER / BỘ LỌC
// ============================================
export interface EmployeeFilterParams {
  page: number;
  size: number;
  keyword?: string;
  departmentId?: string;
  positionId?: string;        
  status?: string;             
  fromDate?: string;
  toDate?: string;
}

export interface DepartmentFilterParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
}

export interface PositionFilterParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
}
