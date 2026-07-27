import { create } from 'zustand';
import { ActionCode, ResourceCode } from '@/types/permission.types';

interface PermissionStore {
  permissions: Map<ResourceCode, Set<ActionCode>>;
  setPermissions: (permissionsData: { resource: ResourceCode; actions: ActionCode[] }[]) => void;
  hasPermission: (resource: ResourceCode, action: ActionCode) => boolean;
}

export const usePermissionStore = create<PermissionStore>((set, get) => ({
  permissions: new Map(),
  setPermissions: (permissionsData) => {
    const permMap = new Map<ResourceCode, Set<ActionCode>>();
    permissionsData.forEach((p) => {
      permMap.set(p.resource, new Set(p.actions));
    });
    set({ permissions: permMap });
  },
  hasPermission: (resource, action) => {
    const permSet = get().permissions.get(resource);
    if (!permSet) return false;
    return permSet.has(action);
  },
}));
