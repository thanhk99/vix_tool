'use client';

import AccessControlList from './component/AccessControlList';
import styles from './page.module.css';

export default function AccessControlPage() {
  return (
    <div className={styles.accessControlPage}>
      <h1>Quản Lý Quyền Truy Cập</h1>
      <AccessControlList />
    </div>
  );
}