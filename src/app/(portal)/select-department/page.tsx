'use client';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { DepartmentInfo } from '@/types/auth.types';
import apiClient from '@/lib/api/client';

export default function SelectDepartmentPage() {
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setDeptId = useAuthStore((state) => state.setDeptId);

  useEffect(() => {
    // In a real app, we might get departments from the token or an endpoint
    // Because authApi.login returns them, we should pass them via context/state.
    // For simplicity, assume we can fetch user profile or it's stored.
    // This is a placeholder since the backend returns departments during login.

    const token = localStorage.getItem('access_token');
    if (token) {
    }
  }, []);

  const handleSelect = async (deptId: string) => {
    try {
      const res = await authApi.selectDepartment({ deptId });
      if (res.success && res.data) {
        const payload = JSON.parse(atob(res.data.accessToken.split(".")[1]));
        setAuth(res.data.accessToken, res.data.route, res.data?.user?.id, res.data?.user?.fullName, payload.roles, res.data.refreshToken);
        if (payload.deptId) {
            setDeptId(payload.deptId);
        }
        if (res.data.route) {
          window.location.href = '/' + res.data.route;
        }
      } else {
        console.error('Failed to select department:', res.message);
      }
    } catch (err: any) {
      console.error('Error selecting department:', err);
      alert(err.message || 'Failed to select department');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Select Department</h2>
        <div className="space-y-4">
          {departments.map((dept) => (
            <button
              key={dept.deptId}
              onClick={() => handleSelect(dept.deptId)}
              className="w-full rounded border p-4 text-left hover:bg-blue-50 focus:outline-none"
            >
              <div className="font-bold">{dept.deptName}</div>
              <div className="text-sm text-gray-500">{dept.deptCode}</div>
            </button>
          ))}
          {departments.length === 0 && (
            <p className="text-center text-gray-500">No departments available (placeholder)</p>
          )}
        </div>
      </div>
    </div>
  );
}
