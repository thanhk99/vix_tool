import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  deptId: string | null;
  route: string | null;
  userId: string | null;
  fullName: string | null;
  setAuth: (token: string, route?: string, userId?: string, fullName?:string) => void;
  setDeptId: (deptId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      deptId: null,
      route: null,
      userId: null,
      fullName: null,
      setAuth: (token, route, userId, fullName) => set((state) => ({ token, route: route !== undefined ? route : state.route, userId: userId ?? state.userId, fullName: fullName ?? state.fullName,})),
      setDeptId: (deptId) => set({ deptId }),
      clearAuth: () => set({ token: null, deptId: null, route: null, userId: null, fullName: null }),
    }),
    {
      name: 'auth-storage', // saves to localStorage
    }
  )
);
