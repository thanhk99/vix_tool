'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermission } from '@/hooks/usePermission';
import { ResourceCode, ActionCode } from '@/types/permission.types';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { hasPermission } = usePermission();
  const pathname = usePathname();

  // Define NV-specific menu items
    const menuItems = [
      { name: 'Dashboard', path: '/nv/dashboard', resource: ResourceCode.DASHBOARD },
      // Specific resources for NV could be added later
    { name: 'Phân quyền', path: '/nv/access-control', resource: ResourceCode.MANAGE_ROLE_GROUP },
    { name: 'Danh mục và Cấu hình', path: '/nv/category-config', resource: ResourceCode.CAPITAL_CONFIG },
    { name: 'Quản lý đối tác', path: '/nv/partner', resource: ResourceCode.CAPITAL_PARTNER },
    { name: 'Quản lý Khế ước Nhận Nợ', path: '/nv/contract-debt', resource: ResourceCode.CAPITAL_CONTRACT },
    { name: 'Quản lý Sự kiện Trả Nợ', path: '/nv/event-repayment', resource: ResourceCode.CAPITAL_REPAYMENT },
    { name: 'Quản lý Hạn mức tín dụng', path: '/nv/credit-limit', resource: ResourceCode.CAPITAL_LIMIT },
    { name: 'Quản lý Tài sản đảm bảo', path: '/nv/asset-transaction', resource: ResourceCode.CAPITAL_ASSET },
    { name: 'Liên kết KUNN với giao dịch/tài sản', path: '/nv/kunn-transaction-link', resource: ResourceCode.CAPITAL_ASSET },
    { name: 'Lịch sử thay đổi', path: '/nv/history', resource: ResourceCode.AUDIT_LOG },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        VIX NV Portal
      </div>
      <nav className={styles.nav}>
        {menuItems.map((item) => {
          // If the user lacks permission for this item's resource, hide it
          // Wait, is resource check strict? Yes, let's keep it.
          // Note: If you want to bypass permission for testing, comment out the next line
          if (!hasPermission(item.resource, ActionCode.VIEW)) return null;

          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
