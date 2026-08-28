import React from 'react';
import ContractDebtForm from '../../component/ContractDebtForm';

export default async function EditContractDebtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContractDebtForm id={id} mode="edit" />;
}
