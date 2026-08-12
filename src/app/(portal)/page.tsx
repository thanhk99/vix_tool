'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import Button from '@/components/shared/Button/Button';
import Input from '@/components/shared/Input/Input';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setDeptId = useAuthStore((state) => state.setDeptId);
  const token = useAuthStore((state) => state.token);
  const route = useAuthStore((state) => state.route);

  useEffect(() => {
    if (token) {
      router.replace(route ? '/' + route : '/dashboard');
    }
  }, [token, route, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await authApi.login({ email, password });

      if (res.success && res.data) {
        if (res.data.departments && res.data.departments.length > 1) {
          setAuth(res.data.accessToken);
          router.push('/select-department');
        } else if (res.data.accessToken) {
          setAuth(res.data.accessToken, res.data.route, res.data.user?.id, res.data.user?.fullName);
          const payload = JSON.parse(
          atob(res.data.accessToken.split(".")[1])
      );
      if (payload.deptId) {
          setDeptId(payload.deptId);
      }
          router.push(res.data.route ? '/' + res.data.route : '/dashboard');
        }
      } else {
        setErrorMessage('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Đã xảy ra lỗi. Vui lòng thử lại.';
      console.error('Login error:', message);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        {/* Logo / Brand */}
        <div className={styles.brand}>
          <div className={styles.logoMark} aria-hidden="true" />
          <h1 className={styles.brandName}>VIX Tool</h1>
        </div>

        <div className={styles.heading}>
          <h2 className={styles.title}>Đăng nhập</h2>
          <p className={styles.subtitle}>Nhập thông tin tài khoản để tiếp tục</p>
        </div>

        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ten@congty.vn"
            autoComplete="email"
            required
            fullWidth
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            fullWidth
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isLoading}
          >
            Đăng nhập
          </Button>
        </form>
      </div>
    </main>
  );
}
