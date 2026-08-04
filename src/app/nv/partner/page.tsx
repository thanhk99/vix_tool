'use client';

import PartnerList from './component/PartnerList';
import styles from './component/PartnerList.module.css';

export default function PartnerPage() {
  return (
    <div className={styles.partnerPage}>
      <h1>Quản Lý Đối Tác</h1>
      <PartnerList />
    </div>
  );
}