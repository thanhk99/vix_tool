import { usePermissionStore } from '@/stores/permission.store';
import { ActionCode, ResourceCode } from '@/types/permission.types';

export const usePermission = () => {
  const hasPermission = usePermissionStore((state) => state.hasPermission);
  const setPermissions = usePermissionStore((state) => state.setPermissions);

  return { hasPermission, setPermissions };
};
