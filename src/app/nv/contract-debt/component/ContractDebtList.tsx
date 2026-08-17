'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/shared/Button/Button';
import Input from '@/components/shared/Input/Input';
import Select from '@/components/shared/Select/Select';
import Table, { TableColumn } from '@/components/shared/Table/Table';
import { ContractDebt } from '@/types/contract-debt';
import styles from './ContractDebtList.module.css';

export default function ContractDebtList() {
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [contractDebts, setContractDebts] = useState<ContractDebt[]>([]);

  // Rules: Theo đối tác (Mới nhất trước), Theo KUNN (Mới nhất trước)
  const sortedData = useMemo(() => {
    return [...contractDebts].sort((a, b) => {
      // Sort by createdDate desc
      const dateA = new Date(a.createdDate || 0).getTime();
      const dateB = new Date(b.createdDate || 0).getTime();
      return dateB - dateA;
    });
  }, [contractDebts]);

  const filteredData = useMemo(() => {
    return sortedData.filter(item => {
      const matchSearch = item.contactNo.includes(searchTerm) 
        || item.lnContactNo.includes(searchTerm) 
        || item.limitId.includes(searchTerm)
        || item.purpose.includes(searchTerm);
      
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      
      let matchDate = true;
      if (fromDate) {
        matchDate = matchDate && new Date(item.lnContactDate) >= new Date(fromDate);
      }
      if (toDate) {
        matchDate = matchDate && new Date(item.lnContactDate) <= new Date(toDate);
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [sortedData, searchTerm, statusFilter, fromDate, toDate]);

  const columns: TableColumn<ContractDebt>[] = [
    { key: 'cusId', title: 'Mã đối tác' },
    { key: 'contactNo', title: 'Số HĐ tín dụng' },
    { key: 'limitId', title: 'Mã hạn mức' },
    { key: 'lnContactNo', title: 'Số HĐ khế ước' },
    { key: 'lnContactDate', title: 'Ngày khế ước' },
    { key: 'lnAmt', title: 'Số tiền giải ngân', render: (val) => Number(val).toLocaleString() },
    {
      key: 'lnDate',
      title: 'Ngày giải ngân',
      render: (value: unknown) => value ? new Date(value as string).toLocaleDateString('vi-VN') : '-'
    },
    { key: 'contractIntRate', title: 'Lãi HĐ (%)' },
    { key: 'actIntRate', title: 'Lãi thực tế (%)' },
    { key: 'reason', title: 'Lý do chênh lệch' },
    { key: 'casaRate', title: 'Tỷ lệ duy trì CASA (%)' },
    { key: 'maturityAmt', title: 'Số tiền đáo hạn', render: (val) => val ? Number(val).toLocaleString() : '-' },
    { key: 'settDate', title: 'Ngày tất toán', render: (val) => (val as string) || '-' },
    { key: 'term', title: 'Kỳ hạn (tháng)' },
    { key: 'currency', title: 'Đơn vị tiền tệ' },
    { key: 'purpose', title: 'Mục đích' },
    { key: 'intTerm', title: 'Kỳ trả lãi' },
    { key: 'prinTerm', title: 'Kỳ trả gốc' },
    { 
      key: 'status', 
      title: 'Trạng thái',
      render: (val) => {
        const status = val as string;
        let styleClass = styles.statusPending;
        if (status === 'Active') styleClass = styles.statusActive;
        else if (status === 'Cancel') styleClass = styles.statusCancel;
        else if (status === 'Close') styleClass = styles.statusClose;
        else if (status === 'Overdue') styleClass = styles.statusOverdue;
        
        return <div className={`${styles.statusTag} ${styleClass}`}>{status}</div>;
      }
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Danh sách hợp đồng vay</div>
        <div className={styles.actions}>
          <Button variant="primary" onClick={() => router.push('/nv/contract-debt/create')}>
            + Thêm mới
          </Button>
          <Button variant="outline">
            Xuất Excel
          </Button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <Input 
            placeholder="Tìm kiếm số HĐ..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <span>Trạng thái:</span>
          <Select 
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: 'All', label: 'Tất cả' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Active', label: 'Active' },
              { value: 'Cancel', label: 'Cancel' },
              { value: 'Close', label: 'Close' },
              { value: 'Overdue', label: 'Overdue' },
            ]}
          />
        </div>
        <div className={styles.filterGroup}>
          <span>Từ ngày khế ước:</span>
          <Input 
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <span>Đến ngày:</span>
          <Input 
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      <Table 
        columns={columns}
        data={filteredData}
        rowKey="id"
      />
    </div>
  );
}
