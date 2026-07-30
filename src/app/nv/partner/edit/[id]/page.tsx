'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { mockPartners, PartnerItem } from '@/mock/partner';
import PartnerEdit from '@/components/nv/Partner/PartnerEdit';
import styles from './page.module.css';

export default function PartnerEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [partners, setPartners] = useState<PartnerItem[]>(mockPartners);
  const partner = partners.find(p => p.id === id);

  if (!partner) {
    return (
      <div className={styles.notFound}>
        <h2>Không tìm thấy đối tác</h2>
        <p>Đối tác với ID <strong>{id}</strong> không tồn tại.</p>
        <button className={styles.backBtn} onClick={() => router.push('/nv/partner')}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const handleSave = (updatedPartner: PartnerItem) => {
    // Cập nhật trong state (hoặc gọi API)
    setPartners(prev =>
      prev.map(p => p.id === updatedPartner.id ? updatedPartner : p)
    );
    alert('Cập nhật đối tác thành công!');
    router.push('/nv/partner');
  };

  const handleCancel = () => {
    router.push('/nv/partner');
  };

  return (
    <PartnerEdit
      partner={partner}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}