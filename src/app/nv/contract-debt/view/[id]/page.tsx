import React from 'react';
import ContractDebtForm from '../../component/ContractDebtForm';

export default async function ViewContractDebtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContractDebtForm id={id} mode="view" />;
}
