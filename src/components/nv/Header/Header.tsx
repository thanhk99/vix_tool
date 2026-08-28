'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { usePathname, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';
import styles from './Header.module.css';

export default function Header() {
    const { clearAuth, fullName, setAuth, token, route, userId, roles } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await authApi.getMe();
                if (res.success && res.data) {
                    setAuth(token as string, route as string, res.data.id, res.data.fullName, roles);
                }
            } catch (err) {
                console.error('Failed to fetch user profile:', err);
            }
        }
        if (token && !fullName) {
            fetchProfile();
        }
    }, [token, fullName, route, roles, setAuth]);

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
        if (pathname.startsWith('/nv/credit-limit')) {
            return 'QUẢN LÝ HẠN MỨC TÍN DỤNG';
        }
        if (pathname.startsWith('/nv/asset-transaction')) {
            return 'QUẢN LÝ TÀI SẢN ĐẢM BẢO';
        }
        if (pathname.startsWith('/nv/contract-debt')) {
            return 'QUẢN LÝ KHẾ ƯỚC NHẬN NỢ';
        }
        if (pathname.startsWith('/nv/event-repayment')) {
            return 'QUẢN LÝ SỰ KIỆN TRẢ NỢ';
        }
        if (pathname.startsWith('/nv/category-config')) {
            return 'DANH MỤC VÀ CẤU HÌNH';
        }
        if (pathname.startsWith('/nv/history')) {
            return 'LỊCH SỬ THAY ĐỔI';
        }
        return 'HỆ THỐNG';
    };

    return (
        <header className={styles.header}>
            <div className={styles.title}>
                {getTitle()}
            </div>

            <div className={styles.userInfo} ref={dropdownRef}>
                <div 
                    className={styles.userProfile} 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <span className={styles.greeting}>
                        Xin chào,{' '}
                        <span className={styles.name}>
                            {fullName || 'Người dùng'}
                        </span>
                    </span>
                    <span className={styles.arrow}>▼</span>
                </div>

                {isDropdownOpen && (
                    <div className={styles.dropdownMenu}>
                        <button 
                            className={styles.dropdownItem}
                            onClick={() => {
                                setIsDropdownOpen(false);
                                router.push('/nv/profile');
                            }}
                        >
                            Hồ sơ cá nhân
                        </button>
                        <button
                            onClick={() => {
                                setIsDropdownOpen(false);
                                handleLogout();
                            }}
                            className={`${styles.dropdownItem} ${styles.logoutText}`}
                        >
                            Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}