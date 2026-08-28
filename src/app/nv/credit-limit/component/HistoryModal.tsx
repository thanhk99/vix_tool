'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, RefreshCw, Download, Clock } from 'lucide-react';
import { LIMIT_TYPES } from '@/constants/credit-limit';
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

export interface LimitHistoryItem {
  id: string;
  creditLimitId?: string;
  transactionDate?: string;
  createdAt?: string;
  contactNo?: string;
  limitType?: string;
  branchCusId?: string;
  cusName?: string;
  initialLimit?: number;
  increaseAmount?: number;
  decreaseAmount?: number;
  remainLimit?: number;
  reason?: string;
  createdBy?: string;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [partnerOptions, setPartnerOptions] = useState<any[]>([]);
  const [activeContracts, setActiveContracts] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<LimitHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters State
  const [filterPartnerId, setFilterPartnerId] = useState('');
  const [filterContractNo, setFilterContractNo] = useState('');
  const [filterLimitType, setFilterLimitType] = useState('');
  const [filterReason, setFilterReason] = useState('');
  
  // Rule: Default fromDate = today - 6 days, toDate = today
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  const resetDefaultDates = useCallback(() => {
    const today = new Date();
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(today.getDate() - 6);

    const formatYmd = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setFilterFromDate(formatYmd(sixDaysAgo));
    setFilterToDate(formatYmd(today));
  }, []);

  // Fetch active partners and active contracts
  const fetchDataSources = useCallback(async () => {
    try {
      // 1. Partners
      const partnerRes: any = await apiClient.get('/v1/capital-source/partners?size=100');
      const pList = partnerRes?.content || partnerRes?.data?.content || [];
      const approvedPartners = pList.filter((p: any) => 
        p.status === 'APPROVED' || p.status === 'Hoạt động' || p.isActive === true
      );
      setPartnerOptions(approvedPartners);

      // 2. Active Credit Limits / Contracts (Only Active / Approved)
      const limitsRes: any = await apiClient.get('/v1/capital-source/credit-limits?size=100');
      const lList = limitsRes?.content || limitsRes?.data?.content || [];
      const activeLimits = lList.filter((l: any) => 
        l.status === 'APPROVED' || l.status === 'ACTIVE' || l.status === 'Hoạt động'
      );
      
      // Extract unique active contract numbers
      const contractsMap = new Map<string, any>();
      activeLimits.forEach((l: any) => {
        if (l.contractNo && !contractsMap.has(l.contractNo)) {
          contractsMap.set(l.contractNo, {
            contractNo: l.contractNo,
            partnerId: l.partnerId,
            branchCusId: l.branchCusId,
            poolType: l.poolType
          });
        }
      });

      setActiveContracts(Array.from(contractsMap.values()));
    } catch (error) {
      console.error('Failed to load data sources for history', error);
    }
  }, []);

  // Query REAL history data from Backend PostgreSQL
  const fetchRealHistory = useCallback(async (
    pId = filterPartnerId,
    cNo = filterContractNo,
    lType = filterLimitType,
    rs = filterReason,
    fDate = filterFromDate,
    tDate = filterToDate
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (pId) params.append('partnerId', pId);
      if (cNo) params.append('contractNo', cNo);
      if (lType) params.append('limitType', lType);
      if (rs) params.append('reason', rs);
      if (fDate) params.append('fromDate', fDate);
      if (tDate) params.append('toDate', tDate);
      params.append('page', '0');
      params.append('size', '50');

      const res: any = await apiClient.get(`/v1/capital-source/credit-limits/global-history?${params.toString()}`);
      const content = res?.content || res?.data?.content || [];
      setHistoryList(content);
    } catch (error) {
      console.error('Failed to fetch real credit limit history', error);
      setHistoryList([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterPartnerId, filterContractNo, filterLimitType, filterReason, filterFromDate, filterToDate]);

  const handleSearch = () => {
    fetchRealHistory();
  };

  const handleReset = () => {
    setFilterPartnerId('');
    setFilterContractNo('');
    setFilterLimitType('');
    setFilterReason('');
    resetDefaultDates();

    const today = new Date();
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(today.getDate() - 6);
    const formatYmd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    fetchRealHistory('', '', '', '', formatYmd(sixDaysAgo), formatYmd(today));
  };

  useEffect(() => {
    if (isOpen) {
      resetDefaultDates();
      fetchDataSources();
      
      const today = new Date();
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(today.getDate() - 6);
      const formatYmd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      fetchRealHistory('', '', '', '', formatYmd(sixDaysAgo), formatYmd(today));
    }
  }, [isOpen, resetDefaultDates, fetchDataSources, fetchRealHistory]);

  // Filter available contracts dropdown based on selected partner
  const filteredContractsDropdown = useMemo(() => {
    if (!filterPartnerId) return activeContracts;
    return activeContracts.filter(c => c.partnerId === filterPartnerId);
  }, [activeContracts, filterPartnerId]);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '-';
    return val.toLocaleString('vi-VN');
  };

  const columns: TableColumn<LimitHistoryItem>[] = [
    { key: 'stt', title: 'STT', align: 'center', width: 50, render: (_, __, idx) => idx + 1 },
    { 
      key: 'transactionDate', 
      title: 'Ngày giao dịch', 
      align: 'center', 
      render: (val, record) => {
        const d = val || record.createdAt;
        return d ? new Date(d as string).toLocaleDateString('en-GB') : '-';
      }
    },
    { key: 'contactNo', title: 'Số HĐ hạn mức', align: 'center', render: (val) => <strong>{val ? String(val) : '-'}</strong> },
    { key: 'limitType', title: 'Loại HM', align: 'center', render: (val) => val ? String(val) : '-' },
    { 
      key: 'initialLimit', 
      title: 'Hạn mức ban đầu (VND)', 
      align: 'right', 
      render: (val) => formatCurrency(val as number) 
    },
    { 
      key: 'increaseAmount', 
      title: 'Phát sinh tăng (VND)', 
      align: 'right', 
      render: (val) => {
        const num = Number(val);
        return num > 0 ? (
          <span style={{ color: '#16a34a', fontWeight: 600 }}>+{formatCurrency(num)}</span>
        ) : '-';
      }
    },
    { 
      key: 'decreaseAmount', 
      title: 'Phát sinh giảm (VND)', 
      align: 'right', 
      render: (val) => {
        const num = Number(val);
        return num > 0 ? (
          <span style={{ color: '#dc2626', fontWeight: 600 }}>-{formatCurrency(num)}</span>
        ) : '-';
      }
    },
    { 
      key: 'remainLimit', 
      title: 'Hạn mức còn lại (VND)', 
      align: 'right', 
      render: (val) => {
        const num = Number(val);
        const isNegative = num < 0;
        return (
          <span style={{ color: isNegative ? '#dc2626' : '#2563eb', fontWeight: 600 }}>
            {formatCurrency(num)}
          </span>
        );
      }
    },
    { key: 'reason', title: 'Lý do biến động', render: (val) => <span style={{ color: '#374151' }}>{val ? String(val) : '-'}</span> }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1d4ed8', fontWeight: 700 }}>
          <Clock size={20} /> Tra cứu lịch sử tăng giảm hạn mức tín dụng
        </div>
      }
      size="xl"
      footer={
        <Button variant="outline" onClick={onClose}>Đóng</Button>
      }
    >
      {/* Filter Box */}
      <div className={styles.filterBox}>
        <div className={styles.filterTitleContainer}>
          <div className={styles.filterTitleBar}></div>
          <div className={styles.filterTitle}>BỘ LỌC TRA CỨU</div>
        </div>

        <div className={styles.filterRow1} style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
          {/* 1. Mã đơn vị GD */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Mã đơn vị GD</span>
            <select 
              className={styles.select}
              value={filterPartnerId}
              onChange={(e) => {
                setFilterPartnerId(e.target.value);
                setFilterContractNo('');
              }}
            >
              <option value="">-- Tất cả đơn vị --</option>
              {partnerOptions.map(p => (
                <option key={p.id} value={p.id}>{p.branchCusId || p.shortName} - {p.cusName}</option>
              ))}
            </select>
          </div>

          {/* 2. Số HĐ hạn mức (Dạng Select - Không cần nhập) */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Số HĐ hạn mức (Active)</span>
            <select 
              className={styles.select}
              value={filterContractNo}
              onChange={(e) => setFilterContractNo(e.target.value)}
            >
              <option value="">-- Tất cả HĐ Active --</option>
              {filteredContractsDropdown.map((c, idx) => (
                <option key={c.contractNo || idx} value={c.contractNo}>
                  {c.contractNo} {c.branchCusId ? `(${c.branchCusId})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Loại hạn mức */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Loại hạn mức</span>
            <select 
              className={styles.select}
              value={filterLimitType}
              onChange={(e) => setFilterLimitType(e.target.value)}
            >
              <option value="">-- Tất cả loại HM --</option>
              {LIMIT_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* 4. Từ ngày (Mặc định: Ngày hiện tại - 6) */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Từ ngày</span>
            <Input 
              type="date" 
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
            />
          </div>

          {/* 5. Đến ngày (Mặc định: Ngày hiện tại) */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Đến ngày</span>
            <Input 
              type="date" 
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
            />
          </div>

          {/* 6. Lý do */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Lý do biến động</span>
            <select 
              className={styles.select}
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
            >
              <option value="">-- Tất cả lý do --</option>
              <option value="INITIAL_SETUP">Thiết lập hạn mức ban đầu</option>
              <option value="MANUAL_INC">Tăng hạn mức manual</option>
              <option value="MANUAL_DEC">Giảm hạn mức manual</option>
              <option value="NEW_LOAN">Phát sinh KUNN (Giải ngân)</option>
              <option value="DEBT_REPAY">Giao dịch trả nợ</option>
              <option value="ASSET_MORTGAGE">Cầm cố thế chấp thêm TSĐB</option>
              <option value="ASSET_RELEASE">Giải tỏa TSĐB</option>
              <option value="ASSET_REVAL_INC">Đánh giá tăng giá TSĐB</option>
              <option value="ASSET_REVAL_DEC">Đánh giá giảm giá TSĐB</option>
            </select>
          </div>
        </div>

        {/* Filter Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw size={14} style={{ marginRight: 6, display: 'inline' }} /> Làm mới
          </Button>
          <Button variant="primary" onClick={handleSearch}>
            <Search size={14} style={{ marginRight: 6, display: 'inline' }} /> Tra cứu
          </Button>
        </div>
      </div>

      {/* Result Section */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 24, fontSize: '13px', color: '#4b5563' }}>
            <span>Số HĐ đang xem: <strong style={{ color: '#1d4ed8' }}>{filterContractNo || 'Tất cả'}</strong></span>
            <span>Khoảng thời gian: <strong>{filterFromDate || '-'} đến {filterToDate || '-'}</strong></span>
            <span>Đơn vị tiền tệ: <strong>VND</strong></span>
          </div>
          <Button variant="outline">
            <Download size={14} style={{ marginRight: 6, display: 'inline', color: '#16a34a' }} />
            <span style={{ color: '#16a34a', fontWeight: 500 }}>Xuất Excel</span>
          </Button>
        </div>

        <div className={styles.tableContainer}>
          <Table 
            columns={columns} 
            data={historyList} 
            rowKey="id" 
            isLoading={isLoading}
            emptyText="Không tìm thấy lịch sử tăng giảm hạn mức phù hợp"
          />
        </div>
      </div>
    </Modal>
  );
}
