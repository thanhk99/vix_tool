import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  deptId: string | null;
  route: string | null;
  setAuth: (token: string, route?: string) => void;
  setDeptId: (deptId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      deptId: null,
      route: null,
      setAuth: (token, route) => set((state) => ({ token, route: route !== undefined ? route : state.route })),
      setDeptId: (deptId) => set({ deptId }),
      clearAuth: () => set({ token: null, deptId: null, route: null }),
    }),
    {
      name: 'auth-storage', // saves to localStorage
    }
  )
);
