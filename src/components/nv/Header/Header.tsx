'use client';

import { useAuthStore } from '@/stores/auth.store';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
    const { clearAuth } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        clearAuth();
        router.push('/');
    };

    const getTitle = () => {
        if (pathname.startsWith('/nv/dashboard')) {
            return 'DASHBOARD';
        }
        if (pathname.startsWith('/nv/access-control')) {
            return 'QUẢN LÝ PHÂN QUYỀN';
        }
        if (pathname.startsWith('/nv/partner')) {
            return 'QUẢN LÝ ĐỐI TÁC';
        }
        return 'HỆ THỐNG';
    };

    return (
        <header className={styles.header}>
            <div className={styles.title}>
                {getTitle()}
            </div>

            <div className={styles.userInfo}>
                <span className={styles.greeting}>
                    Xin chào,{' '}
                    <span className={styles.name}>
                        Trưởng phòng
                    </span>
                </span>

                <button
                    onClick={handleLogout}
                    className={styles.logoutBtn}
                >
                    Đăng xuất
                </button>
            </div>
        </header>
    );
}