import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  deptId: string | null;
  route: string | null;
  userId: string | null;
  fullName: string | null;
  roles: string[];
  setAuth: (token: string, route?: string, userId?: string, fullName?:string, roles?: string[], refreshToken?: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setDeptId: (deptId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      deptId: null,
      route: null,
      userId: null,
      fullName: null,
      roles: [],
      setAuth: (token, route, userId, fullName, roles, refreshToken) => set((state) => ({ 
        token, 
        route: route !== undefined ? route : state.route, 
        userId: userId ?? state.userId, 
        fullName: fullName ?? state.fullName,
        roles: roles ?? state.roles,
        refreshToken: refreshToken ?? state.refreshToken
      })),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      setDeptId: (deptId) => set({ deptId }),
      clearAuth: () => set({ token: null, refreshToken: null, deptId: null, route: null, userId: null, fullName: null, roles: [] }),
    }),
    {
      name: 'auth-storage', // saves to localStorage
    }
  )
);
