'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/shared/Button/Button';
import Input from '@/components/shared/Input/Input';
import Select from '@/components/shared/Select/Select';
import Table, { TableColumn } from '@/components/shared/Table/Table';
import { ContractDebt } from '@/types/contract-debt';
import Pagination from '@/components/shared/Pagination/Pagination';
import apiClient from '@/lib/api/client';
import { useNotification } from '@/hooks/useNotification';
import { getStatusDisplay } from '@/constants/status';
import { Plus, Edit2, Trash2, FileBox, Check, X, Download } from 'lucide-react';
import { formatDate } from '@/utils/format';
import styles from './ContractDebtList.module.css';


export default function ContractDebtList() {
  const router = useRouter();
  const { notifyError, notifySuccess } = useNotification();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [contractDebts, setContractDebts] = useState<ContractDebt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  useEffect(() => {
    const fetchKunns = async () => {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get(`/v1/capital-source/kunns?page=${currentPage - 1}&size=${pageSize}`);
        let data: any[] = [];
        if (res?.data?.content) {
          data = res.data.content;
          setTotalItems(res.data.totalElements || 0);
        } else if (res?.content) {
          data = res.content;
          setTotalItems(res.totalElements || 0);
        } else if (Array.isArray(res)) {
          data = res;
          setTotalItems(data.length);
        }
        
        // Fetch partners to map cusId -> cusCode
        let partners: any[] = [];
        try {
          const pRes: any = await apiClient.get('/v1/capital-source/partners?page=0&size=1000');
          if (pRes?.content) partners = pRes.content;
          else if (pRes?.data?.content) partners = pRes.data.content;
          else if (pRes?.data?.data) partners = pRes.data.data;
          else if (Array.isArray(pRes)) partners = pRes;
          else if (Array.isArray(pRes?.data)) partners = pRes.data;
        } catch (e) {
          console.error('Failed to fetch partners', e);
        }
        if (!Array.isArray(partners)) partners = [];
        const partnerMap = new Map();
        partners.forEach(p => {
          if (p.id) partnerMap.set(p.id, p);
          if (p.cusId) partnerMap.set(p.cusId, p);
        });

        // Fetch limits for all KUNNs globally to map limitId -> limitCode
        let globalLimits = [];
        try {
          const lRes: any = await apiClient.get('/v1/capital-source/credit-limits?page=0&size=2000');
          if (lRes?.content) globalLimits = lRes.content;
          else if (lRes?.data?.content) globalLimits = lRes.data.content;
          else if (Array.isArray(lRes)) globalLimits = lRes;
          else if (Array.isArray(lRes?.data)) globalLimits = lRes.data;
        } catch (e) {
          console.error('Failed to fetch global limits', e);
        }
        
        const limitsMap = new Map();
        if (Array.isArray(globalLimits)) {
          globalLimits.forEach(l => {
            if (l.id) limitsMap.set(l.id, l);
            if (l.limitId) limitsMap.set(l.limitId, l);
            if (l.poolName) limitsMap.set(l.poolName, l);
          });
        }

        const enrichedData = data.map(kunn => {
          const partner = partnerMap.get(kunn.cusId);
          const limit = limitsMap.get(kunn.limitId);
          return {
            ...kunn,
            cusCode: partner?.cusId || kunn.cusId,
            limitCode: limit?.limitId || limit?.poolName || kunn.limitId
          };
        });
        
        setContractDebts(enrichedData);
      } catch (error) {
        console.error('Failed to fetch kunns:', error);
        notifyError('Lỗi', 'Không thể tải danh sách hợp đồng vay (KUNN)');
      } finally {
        setIsLoading(false);
      }
    };
    fetchKunns();
  }, [currentPage, pageSize]);

  const sortedData = useMemo(() => {
    return [...contractDebts].sort((a, b) => {
      const dateA = new Date(a.createdDate || 0).getTime();
      const dateB = new Date(b.createdDate || 0).getTime();
      return dateB - dateA;
    });
  }, [contractDebts]);

  const filteredData = useMemo(
    () => {
    return sortedData.filter(item => {
      const matchSearch = (item.contactNo && item.contactNo.includes(searchTerm)) 
        || (item.lnContactNo && item.lnContactNo.includes(searchTerm)) 
        || (item.limitId && item.limitId.includes(searchTerm))
        || (item.purpose && item.purpose.includes(searchTerm));
      
      const matchStatus = statusFilter === 'All' || (() => {
        // Find the standardized key from the item's status using our mapping logic
        const upper = (item.status || '').toUpperCase();
        let std = upper;
        if (['PENDING', 'CHỜ DUYỆT', 'CHO_DUYET', 'WAIT_APPROVE', 'WAITING'].includes(upper)) std = 'PENDING_APPROVAL';
        else if (['ACTIVE', 'ĐÃ DUYỆT', 'DA_DUYET'].includes(upper)) std = 'APPROVED';
        else if (['REJECT'].includes(upper)) std = 'REJECTED';
        else if (['INACTIVE'].includes(upper)) std = 'DELETED';
        return std === statusFilter;
      })();
      
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

  const selectedRow = useMemo(
    () => contractDebts.find(d => d.id === selectedRowId), [contractDebts, selectedRowId]);

  const canApproveReject = selectedRow && ['PENDING', 'PENDING_APPROVAL', 'CHỜ DUYỆT', 'PENDING_DELETE'].includes((selectedRow.status || '').toUpperCase());
  const canEdit = selectedRow && ['PENDING', 'PENDING_APPROVAL', 'CHỜ DUYỆT'].includes((selectedRow.status || '').toUpperCase());

  const handleApprove = async () => {
    if (!selectedRowId) return;
    const selectedRow = contractDebts.find(d => d.id === selectedRowId);
    if (!selectedRow) return;

    try {
      setIsLoading(true);
      const isDelete = selectedRow.status === 'PENDING_DELETE';
      const endpoint = isDelete ? `/v1/capital-source/kunns/${selectedRowId}/approve-delete` : `/v1/capital-source/kunns/${selectedRowId}/approve`;
      
      await apiClient.put(endpoint);
      notifySuccess('Thành công', 'Phê duyệt thành công');
      window.location.reload();
    } catch (error) {
      console.error(error);
      notifyError('Lỗi', 'Có lỗi xảy ra khi phê duyệt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRowId) return;
    const selectedRow = contractDebts.find(d => d.id === selectedRowId);
    if (!selectedRow) return;
    
    try {
      setIsLoading(true);
      const isDelete = selectedRow.status === 'PENDING_DELETE';
      const endpoint = isDelete ? `/v1/capital-source/kunns/${selectedRowId}/reject-delete` : `/v1/capital-source/kunns/${selectedRowId}/reject`;
      
      await apiClient.put(endpoint);
      notifySuccess('Thành công', 'Từ chối thành công');
      window.location.reload();
    } catch (error) {
      console.error(error);
      notifyError('Lỗi', 'Có lỗi xảy ra khi từ chối');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRowId) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa khế ước này không?')) return;

    try {
      setIsLoading(true);
      await apiClient.delete(`/v1/capital-source/kunns/${selectedRowId}`);
      notifySuccess('Thành công', 'Dữ liệu đã chuyển trạng thái Xóa nháp');
      window.location.reload();
    } catch (error) {
      console.error(error);
      notifyError('Lỗi', 'Có lỗi xảy ra khi xóa');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: TableColumn<ContractDebt>[] = [
    { key: 'cusCode', title: 'Mã Đối tác' },
    { key: 'contactNo', title: 'Số HĐ tín dụng' },
    { key: 'limitCode', title: 'Mã hạn mức' },
    { key: 'lnContactNo', title: 'Số HĐ giải ngân' },
    { key: 'lnContactDate', title: 'Ngày khế ước', render: (val) => formatDate(val as string) },
    { key: 'lnAmt', title: 'Số tiền giải ngân', render: (val) => Number(val).toLocaleString() },
    {
      key: 'lnDate',
      title: 'Ngày giải ngân',
      render: (value: unknown) => formatDate(value as string)
    },
    { key: 'contractIntRate', title: 'Lãi HĐ (%)' },
    { key: 'actIntRate', title: 'Lãi thực tế (%)' },
    { key: 'reason', title: 'Lý do chênh lệch' },
    { key: 'casaRate', title: 'Tỷ lệ duy trì CASA (%)' },
    { key: 'maturityAmt', title: 'Số tiền đáo hạn', render: (val) => val ? Number(val).toLocaleString() : '-' },
    { key: 'settDate', title: 'Ngày tất toán', render: (val) => formatDate(val as string) },
    { key: 'term', title: 'Kỳ hạn (tháng)' },
    { key: 'currency', title: 'Đơn vị tiền tệ' },
    { key: 'purpose', title: 'Mục đích' },
    { key: 'intTerm', title: 'Kỳ trả lãi' },
    { key: 'prinTerm', title: 'Kỳ trả gốc' },
    { 
      key: 'status', 
      title: 'Trạng thái',
      render: (val) => {
        const status = (val as string) || '';
        const { label, className } = getStatusDisplay(status);
        return <div className={`${styles.statusTag} ${styles[className] || className}`}>{label}</div>;
      }
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Danh sách hợp đồng vay</div>
        <div className={styles.actions}>
          <Button variant="primary" onClick={() => router.push('/nv/contract-debt/create')}>
            <Plus size={16} style={{ marginRight: 6, display: 'inline' }} /> Thêm mới
          </Button>
          <Button variant="outline" onClick={() => router.push(`/nv/contract-debt/edit/${selectedRowId}`)} disabled={!canEdit}>
            <Edit2 size={16} style={{ marginRight: 6, display: 'inline' }} /> Sửa
          </Button>
          <Button variant="outline" onClick={handleDelete} disabled={!selectedRowId}>
            <Trash2 size={16} style={{ marginRight: 6, display: 'inline', color: 'red' }} /> <span style={{color: 'red'}}>Xóa</span>
          </Button>
          <Button variant="outline" onClick={() => router.push(`/nv/contract-debt/view/${selectedRowId}`)} disabled={!selectedRowId}>
            <FileBox size={16} style={{ marginRight: 6, display: 'inline' }} /> Chi tiết
          </Button>
          <Button variant="outline" onClick={handleApprove} disabled={!canApproveReject || isLoading} style={{ borderColor: 'green' }}>
            <Check size={16} style={{ marginRight: 6, display: 'inline', color: 'green' }} /> <span style={{color: 'green'}}>Phê duyệt</span>
          </Button>
          <Button variant="outline" onClick={handleReject} disabled={!canApproveReject || isLoading} style={{ borderColor: 'orange' }}>
            <X size={16} style={{ marginRight: 6, display: 'inline', color: 'orange' }} /> <span style={{color: 'orange'}}>Từ chối</span>
          </Button>
          <Button variant="outline">
            <Download size={16} style={{ marginRight: 6, display: 'inline', color: 'green' }} /> <span style={{color: 'green'}}>Xuất Excel</span>
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
              { value: 'PENDING_APPROVAL', label: getStatusDisplay('PENDING_APPROVAL').label },
              { value: 'APPROVED', label: getStatusDisplay('APPROVED').label },
              { value: 'PENDING_DELETE', label: getStatusDisplay('PENDING_DELETE').label },
              { value: 'REJECTED', label: getStatusDisplay('REJECTED').label },
              { value: 'DELETED', label: getStatusDisplay('DELETED').label }
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
        isLoading={isLoading}
        selectedRowkey={selectedRowId}
        onRowClick={(row: any) => setSelectedRowId(row.id)}
      />
      <Pagination 
        currentPage={currentPage} 
        pageSize={pageSize} 
        totalItems={totalItems} 
        onPageChange={setCurrentPage} 
        onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} 
        styles={styles} 
      />
    </div>
  );
}
