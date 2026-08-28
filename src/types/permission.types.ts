export enum ActionCode {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  EXPORT = 'EXPORT'
}

export enum ResourceCode {
  DASHBOARD = 'DASHBOARD',
  DOCUMENT = 'DOCUMENT',
  AUDIT_LOG = 'AUDIT_LOG',
  HR_USER = 'HR_USER',
  HR_DEPARTMENT = 'HR_DEPARTMENT',
  REPORT = 'REPORT',
  PAYROLL = 'PAYROLL',
  MEETING = 'MEETING',
  MANAGE_ROLE_GROUP = 'MANAGE_ROLE_GROUP',
  CAPITAL_CONFIG = 'CAPITAL_CONFIG',
  CAPITAL_PARTNER = 'CAPITAL_PARTNER',
  CAPITAL_LIMIT = 'CAPITAL_LIMIT',
  CAPITAL_CONTRACT = 'CAPITAL_CONTRACT',
  CAPITAL_REPAYMENT = 'CAPITAL_REPAYMENT',
  CAPITAL_ASSET = 'CAPITAL_ASSET',
  CAPITAL_REPORT = 'CAPITAL_REPORT',
  CAPITAL_BATCH = 'CAPITAL_BATCH'
}

export interface PermissionDto {
  resource: ResourceCode;
  actions: ActionCode[];
}

export interface RoleGroupResponse {
  id: string;
  deptId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: PermissionDto[];
}

export interface CreateRoleGroupRequest {
    name: string;
    description: string;
    permissions: PermissionDto[];
    active: boolean;
}