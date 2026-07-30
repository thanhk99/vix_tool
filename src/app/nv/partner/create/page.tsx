'use client';

import { useRouter } from 'next/navigation';
import { PartnerItem } from '@/mock/partner';
import PartnerCreate from '../../component/Partner/PartnerCreate';

export default function PartnerCreatePage() {
  const router = useRouter();

  const handleSave = (newPartner: PartnerItem) => {
    router.push('/nv/partner');
  };

  const handleCancel = () => {
    router.push('/nv/partner');
  };

  return (
    <PartnerCreate 
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}