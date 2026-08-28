'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { permissionApi } from '@/lib/api/permission.api';
import { usePermissionStore } from '@/stores/permission.store';
import { useAuthStore } from '@/stores/auth.store';
import { ActionCode, ResourceCode } from '@/types/permission.types';

const routePermissions = [
    { path: '/nv/access-control', resource: ResourceCode.MANAGE_ROLE_GROUP },
    { path: '/nv/partner', resource: ResourceCode.CAPITAL_PARTNER },
    { path: '/nv/category-config', resource: ResourceCode.CAPITAL_CONFIG },
    { path: '/nv/contract-debt', resource: ResourceCode.CAPITAL_CONTRACT },
    { path: '/nv/event-repayment', resource: ResourceCode.CAPITAL_REPAYMENT },
    { path: '/nv/credit-limit', resource: ResourceCode.CAPITAL_LIMIT },
    { path: '/nv/asset-transaction', resource: ResourceCode.CAPITAL_ASSET },
    { path: '/nv/kunn-transaction-link', resource: ResourceCode.CAPITAL_ASSET },
    { path: '/nv/import-excel', resource: ResourceCode.CAPITAL_BATCH },
    { path: '/nv/export-excel', resource: ResourceCode.CAPITAL_REPORT },
    { path: '/nv/history', resource: ResourceCode.AUDIT_LOG },
];

export default function PermissionGuard({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const setPermissions = usePermissionStore((state) => state.setPermissions);
    const hasPermission = usePermissionStore((state) => state.hasPermission);
    const permissions = usePermissionStore((state) => state.permissions);
    const roles = useAuthStore((state) => state.roles);
    
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const res = await permissionApi.getMyPermissions();
                if (res.success && res.data) {
                    setPermissions(res.data);
                }
            } catch (error) {
                console.error("Failed to load permissions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, [setPermissions]);

    useEffect(() => {
        if (!loading) {
            // Find if current path requires a permission
            const requiredPerm = routePermissions.find(r => pathname.startsWith(r.path));
            
            if (requiredPerm && requiredPerm.resource !== ResourceCode.DASHBOARD) {
                const isDeptAdmin = roles?.some(r => r === 'DEPT_ADMIN' || r === 'ROLE_DEPT_ADMIN');
                if (!isDeptAdmin && !hasPermission(requiredPerm.resource, ActionCode.VIEW)) {
                    router.replace('/nv/dashboard');
                }
            }
        }
    }, [loading, pathname, permissions, hasPermission, router, roles]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
        );
    }

    return <>{children}</>;
}
