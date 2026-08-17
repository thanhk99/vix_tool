'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Download } from 'lucide-react';
import { LimitHistory } from '../../types/credit-limit';
import { LIMIT_TYPES } from '../../constants/credit-limit';
import Modal from '@/components/shared/Modal/Modal';
import Button from '@/components/shared/Button/Button';
import Table, { TableColumn } from '@/components/shared/Table/Table';
import Input from '@/components/shared/Input/Input';
import styles from './CreditLimitTable.module.css';
import apiClient from '@/lib/api/client';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [data, setData] = useState<LimitHistory[]>([]);
  const [partnerOptions, setPartnerOptions] = useState<any[]>([]);

  const fetchPartners = useCallback(async () => {
    try {
      const res = await apiClient.get('/v1/capital-source/partners?size=100');
      if (res?.content) {
        setPartnerOptions(res.content);
      } else if (res?.data?.content) {
        setPartnerOptions(res.data.content);
      }
    } catch (error) {
      console.error('Failed to load partners', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPartners();
      // Since there is no global history API, data starts empty.
      // A specific limitId is required by backend to fetch history: /v1/capital-source/partners/{partnerId}/credit-limits/{limitId}/transactions/history
      setData([]); 
    }
  }, [isOpen, fetchPartners]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN');
  };

  const columns: TableColumn<LimitHistory>[] = [
    { key: 'stt', title: 'STT', align: 'center', render: (_, __, idx) => idx + 1 },
    { key: 'date', title: 'Ngày', align: 'center', render: (val) => new Date(val as string).toLocaleDateString('en-GB') },
    { key: 'contactNo', title: 'Số HĐ HM', align: 'center' },
    { key: 'limitType', title: 'Loại HM', align: 'center' },
    { key: 'initialLimit', title: 'Hạn mức ban đầu (VND)', align: 'right', render: (val) => formatCurrency(val as number) },
    { key: 'increaseAmount', title: 'Phát sinh tăng (VND)', align: 'right', render: (val) => <span style={{ color: 'var(--success)' }}>{(val as number) > 0 ? formatCurrency(val as number) : '-'}</span> },
    { key: 'decreaseAmount', title: 'Phát sinh giảm (VND)', align: 'right', render: (val) => <span style={{ color: 'var(--danger)' }}>{(val as number) > 0 ? formatCurrency(val as number) : '-'}</span> },
    { key: 'remainLimit', title: 'Hạn mức còn lại (VND)', align: 'right', render: (val) => formatCurrency(val as number) },
    { key: 'reason', title: 'Lý do' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)' }}>
          <RefreshCw size={20} /> Lịch sử tăng giảm hạn mức tín dụng
        </div>
      }
      size="xl"
      footer={
        <Button variant="outline" onClick={onClose}>Đóng</Button>
      }
    >
      <div className={styles.filterBox}>
        <div className={styles.filterTitle}>BỘ LỌC TRA CỨU</div>
        <div className={styles.filterGrid} style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Mã đơn vị GD</span>
            <select className={styles.select}>
              <option value="">Chọn mã đơn vị GD</option>
              {partnerOptions.map(p => (
                <option key={p.id} value={p.id}>{p.branchCusId || p.cusName}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Số HĐ hạn mức</span>
            <Input type="text" placeholder="Nhập số HĐ" />
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Loại hạn mức</span>
            <select className={styles.select}>
              <option value="">Chọn loại hạn mức</option>
              {LIMIT_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Từ ngày</span>
            <Input type="date" />
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Đến ngày</span>
            <Input type="date" />
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Lý do</span>
            <select className={styles.select}>
              <option value="">Chọn lý do</option>
              <option value="Thiết lập hạn mức ban đầu">Thiết lập hạn mức ban đầu</option>
              <option value="Tăng hạn mức manual">Tăng hạn mức manual</option>
            </select>
          </div>
        </div>
        <div className={styles.actions} style={{ marginTop: 16 }}>
          <Button variant="outline">
            <RefreshCw size={14} style={{ marginRight: 6, display: 'inline' }} /> Làm mới
          </Button>
          <Button variant="primary" onClick={() => setData([])}>
            <Search size={14} style={{ marginRight: 6, display: 'inline' }} /> Tra cứu
          </Button>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div className={styles.header} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 32, fontSize: 'var(--font-size-sm)' }}>
            <span>Mã đơn vị GD: <strong>-</strong></span>
            <span>Số HĐ hạn mức: <strong>-</strong></span>
            <span>Đơn vị tiền tệ: <strong>VND</strong></span>
          </div>
          <Button variant="outline">
            <Download size={14} style={{ marginRight: 6, display: 'inline' }} /> Xuất Excel
          </Button>
        </div>

        <div className={styles.tableContainer}>
          <Table columns={columns} data={data} rowKey="id" />
        </div>
      </div>
    </Modal>
  );
}
