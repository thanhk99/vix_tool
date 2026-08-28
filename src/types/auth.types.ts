export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  // companyId: string;
  currentDepartmentId: string;
  roles: string[];
}

export interface DepartmentInfo {
  deptId: string;
  deptName: string;
  deptCode: string;
  schemaTarget: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: UserInfo;
  departments?: DepartmentInfo[];
  route?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface SelectDepartmentRequest {
  deptId: string;
}

export interface ApiRespone<T>{
  success: boolean;
  message: string;
  data: T
}


