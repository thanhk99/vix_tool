'use client';

import PartnerList from './component/PartnerList';
import styles from './component/PartnerList.module.css';

export default function PartnerPage() {
  return (
    <div className={styles.partnerPage}>
      <PartnerList />
    </div>
  );
}