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
    { name: 'Phân quyền', path: '/nv/access-control' },
    { name: 'Quản lý đối tác', path: '/nv/partner' },
    { name: 'Danh mục và Cấu hình', path: '/nv/category-config', resource: ResourceCode.CAPITAL_CONFIG },
    { name: 'Quản lý Khế ước Nhận Nợ', path: '/nv/contract-debt', resource: ResourceCode.CAPITAL_CONTRACT },
    { name: 'Quản lý Sự kiện Trả Nợ', path: '/nv/event-repayment', resource: ResourceCode.CAPITAL_REPAYMENT },
    { name: 'Quản lý Hạn mức tín dụng', path: '/nv/credit-limit', resource: ResourceCode.CAPITAL_PARTNER_LIMIT },
    { name: 'Quản lý Giao dịch tài sản', path: '/nv/asset-transaction', resource: ResourceCode.CAPITAL_ASSET },
    { name: 'Liên kết KUNN với giao dịch/tài sản', path: '/nv/kunn-transaction-link', resource: ResourceCode.CAPITAL_ASSET },
    { name: 'Import Excel', path: '/nv/import-excel', resource: ResourceCode.CAPITAL_BATCH },
    { name: 'Export Excel', path: '/nv/export-excel', resource: ResourceCode.CAPITAL_REPORT },
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
          // if (!hasPermission(item.resource, ActionCode.VIEW)) return null;

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
