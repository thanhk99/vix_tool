'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const { clearAuth, fullName } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.userInfo}>
        <span className={styles.greeting}>
          Xin chào, <span className={styles.name}>{fullName || 'Giám đốc'}</span>
        </span>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
