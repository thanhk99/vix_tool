'use client';

import { useRouter } from 'next/navigation';
import PartnerCreate from '@/components/nv/Partner/PartnerCreate';
import { PartnerItem } from '@/mock/partner';

export default function PartnerCreatePage() {
  const router = useRouter();

  const handleSave = (newPartner: PartnerItem) => {
    // TODO: Gọi API hoặc update state
    console.log('New partner:', newPartner);
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