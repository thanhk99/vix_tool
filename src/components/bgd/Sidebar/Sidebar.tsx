'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Tổng quan', path: '/bgd' },
    { name: 'Phòng ban', path: '/bgd/departments' },
    { name: 'Nhân sự', path: '/bgd/hr' },
    { name: 'Phân quyền', path: '/bgd/access-control' },
    { name: 'Duyệt văn bản', path: '/bgd/documents' },
    { name: 'Báo cáo', path: '/bgd/reports' },
    { name: 'Cuộc họp', path: '/bgd/meetings' },
    { name: 'Cài đặt', path: '/bgd/settings' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span>BGD Portal</span>
      </div>
      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/bgd' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
