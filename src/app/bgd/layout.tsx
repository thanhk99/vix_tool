'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import Sidebar from '@/components/bgd/Sidebar/Sidebar';
import Header from '@/components/bgd/Header/Header';
import styles from './layout.module.css';

export default function BGDLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { token, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    if (!token) {
      clearAuth();
      router.push('/');
      return;
    }
    // Optional: verify token or role here
    setLoading(false);
  }, [token, isMounted, clearAuth, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.mainContent}>
        <Header />
        <div className={styles.contentWrapper}>{children}</div>
      </main>
    </div>
  );
}
