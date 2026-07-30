'use client';

import { useParams } from 'next/navigation';
import { mockPartners } from '@/mock/partner';
import PartnerView from '@/components/nv/Partner/PartnerView';
import styles from './page.module.css';

export default function PartnerViewPage() {
  const params = useParams();
  const id = params.id as string;

  const partner = mockPartners.find(p => p.id === id);

  if (!partner) {
    return (
      <div className={styles.notFound}>
        <h2>Không tìm thấy đối tác</h2>
        <p>Đối tác với ID <strong>{id}</strong> không tồn tại.</p>
      </div>
    );
  }

  return <PartnerView partner={partner} />;
}