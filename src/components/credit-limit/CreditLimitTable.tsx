'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, Download, Edit2, Eye, RefreshCw, X, Filter, Trash2, FileBox, Clock, ChevronRight, ChevronDown, List, Check } from 'lucide-react';
import { CreditLimit } from '../../types/credit-limit';
import { LIMIT_TYPES } from '../../constants/credit-limit';
import CreditLimitModal from './CreditLimitModal';
import HistoryModal from './HistoryModal';
import styles from './CreditLimitTable.module.css';
import apiClient from '@/lib/api/client';
import { usePermission } from '@/hooks/usePermission';
import { ActionCode, ResourceCode } from '@/types/permission.types';
import Button from '@/components/shared/Button/Button';
import Table, { TableColumn } from '@/components/shared/Table/Table';
import Input from '@/components/shared/Input/Input';
import { useNotification } from '@/hooks/useNotification';

export default function CreditLimitTable() {
  const [data, setData] = useState<CreditLimit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination (For global backend list, flat)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [isCreditLimitModalOpen, setIsCreditLimitModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState<CreditLimit | null>(null);
  const [initialModalTab, setInitialModalTab] = useState<1 | 2>(1);

  // Selected row tracking
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Filters
  const [searchPartnerId, setSearchPartnerId] = useState('');
  const [searchContactNo, setSearchContactNo] = useState('');
  const [searchLimitType, setSearchLimitType] = useState('');
  const [searchLimitId, setSearchLimitId] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [searchAsset, setSearchAsset] = useState('');

  // Dropdown data
  const [partnerOptions, setPartnerOptions] = useState<any[]>([]);

  // Permission hooks
  const { hasPermission } = usePermission();
  const canView = hasPermission(ResourceCode.CAPITAL_LIMIT, ActionCode.VIEW);
  const canCreate = hasPermission(ResourceCode.CAPITAL_LIMIT, ActionCode.CREATE);
  const canUpdate = hasPermission(ResourceCode.CAPITAL_LIMIT, ActionCode.UPDATE);
  const canExport = hasPermission(ResourceCode.CAPITAL_LIMIT, ActionCode.EXPORT);
  const canDelete = hasPermission(ResourceCode.CAPITAL_LIMIT, ActionCode.DELETE);
  
  const { notifyError, notifySuccess } = useNotification();

  const fetchPartners = useCallback(async () => {
    try {
      const res: any = await apiClient.get('/v1/capital-source/partners?size=100');
      if (res?.content) {
        setPartnerOptions(res.content);
      } else if (res?.data?.content) {
        setPartnerOptions(res.data.content);
      }
    } catch (error) {
      console.error('Failed to load partners', error);
    }
  }, []);

  const fetchCreditLimits = useCallback(async () => {
    if (!canView) return;
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage - 1),
        size: String(pageSize),
      });

      if (searchPartnerId) params.append('partnerId', searchPartnerId);
      if (searchContactNo) params.append('contactNo', searchContactNo);
      if (searchLimitType) params.append('poolType', searchLimitType);
      if (searchLimitId) params.append('limitId', searchLimitId);
      if (searchStatus) params.append('status', searchStatus);
      if (searchStartDate) params.append('startDate', searchStartDate);
      if (searchEndDate) params.append('endDate', searchEndDate);
      
      const res: any = await apiClient.get(`/v1/capital-source/credit-limits?${params.toString()}`);
      
      if (res?.content) {
        setData(res.content);
        setTotalItems(res.totalElements || 0);
      } else if (res?.data?.content) {
        setData(res.data.content);
        setTotalItems(res.data.totalElements || 0);
      } else {
        setData([]);
        setTotalItems(0);
      }
    } catch (error) {
      notifyError('Lỗi', 'Không tải được danh sách hạn mức!');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchPartnerId, searchContactNo, searchLimitType, canView]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  useEffect(() => {
    fetchCreditLimits();
  }, [fetchCreditLimits]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCreditLimits();
  };

  const handleClearSearch = () => {
    setSearchPartnerId('');
    setSearchContactNo('');
    setSearchLimitType('');
    setSearchLimitId('');
    setSearchStatus('');
    setSearchStartDate('');
    setSearchEndDate('');
    setSearchAsset('');
    setCurrentPage(1);
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '-';
    return val.toLocaleString('vi-VN');
  };

  const getStatusDisplay = (status?: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING' || s === 'PENDING_APPROVAL' || s === 'CHỜ DUYỆT') {
      return { text: 'Chờ duyệt', className: styles.pending };
    }
    if (s === 'APPROVED' || s === 'ACTIVE' || s === 'ĐÃ DUYỆT') {
      return { text: 'Đã duyệt', className: styles.active }; // .active is green
    }
    if (s === 'INACTIVE' || s === 'NGỪNG HOẠT ĐỘNG') {
      return { text: 'Ngừng hoạt động', className: styles.close };
    }
    return { text: status || 'Không xác định', className: styles.close };
  };

  // --- Tree Logic ---
  // Currently backend returns a flat list. We will pseudo-group by contactNo.
  // Grouping: The first item with a given contactNo is the parent, or we group them into a folder.
  // To match the mockup visually, we will sort and map them to parent-children structure.
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleExpand = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setExpandedRows(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const treeData = useMemo(() => {
    const flattened: any[] = [];
    let groupIndex = 1;

    (data as any[]).forEach((parent, index) => {
      const parentKey = parent.id || String(index);
      const hasChildren = parent.children && Array.isArray(parent.children) && parent.children.length > 0;
      
      flattened.push({
        ...parent,
        _treeInfo: {
          stt: String(groupIndex),
          isRoot: true,
          hasChildren: hasChildren,
          isExpanded: !!expandedRows[parentKey],
          groupKey: parentKey
        }
      });

      if (hasChildren && expandedRows[parentKey]) {
        parent.children.forEach((child: any, childIdx: number) => {
          flattened.push({
            ...child,
            _treeInfo: {
              stt: `${groupIndex}.${childIdx + 1}`,
              isRoot: false,
              hasChildren: false,
              parentId: parentKey
            }
          });
        });
      }
      groupIndex++;
    });

    return flattened;
  }, [data, expandedRows]);


  const columns: TableColumn<any>[] = [
    {
      key: 'stt',
      title: 'STT',
      width: 80,
      render: (_, record) => {
        const info = record._treeInfo;
        if (info.hasChildren) {
          return (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <button 
                className={styles.treeToggle} 
                onClick={(e) => toggleExpand(e, info.groupKey)}
              >
                {info.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {info.stt}
            </span>
          );
        }
        if (!info.isRoot) {
          return (
            <span>
              <span className={styles.treeIndent}></span>
              <span style={{ marginLeft: '12px' }}>{info.stt}</span>
            </span>
          );
        }
        return <span style={{ marginLeft: '16px' }}>{info.stt}</span>;
      },
    },
    {
      key: 'partnerId',
      title: 'Mã đơn vị GD',
      render: (val) => {
        // Fallback to searching partnerOptions to show code instead of UUID
        const p = partnerOptions.find(opt => opt.id === val);
        return p ? p.branchCusId || p.cusName : val;
      }
    },
    { key: 'contactNo', title: 'Số HĐ tín dụng' },
    { key: 'limitId', title: 'Mã hạn mức' },
    { key: 'poolType', title: 'Loại hạn mức' },
    { key: 'currency', title: 'Đơn vị tiền tệ', align: 'center' },
    {
      key: 'totalPool',
      title: 'Hạn mức tổng',
      align: 'right',
      render: (val) => formatCurrency(val as number),
    },
    {
      key: 'usedPool',
      title: 'HM đã sử dụng',
      align: 'right',
      render: (val) => <span className={styles.textRed}>{formatCurrency(val as number)}</span>,
    },
    {
      key: 'remainPool',
      title: 'HM còn lại',
      align: 'right',
      render: (val) => <span className={styles.textBlue}>{formatCurrency(val as number)}</span>,
    },
    {
      key: 'startDate',
      title: 'Ngày bắt đầu',
      align: 'center',
      render: (val) => val ? new Date(val as string).toLocaleDateString('en-GB') : '-',
    },
    {
      key: 'endDate',
      title: 'Ngày hết hạn',
      align: 'center',
      render: (val) => val ? new Date(val as string).toLocaleDateString('en-GB') : '-',
    },
    {
      key: 'creditRatio',
      title: 'TL Tài trợ/PA vay (%)',
      align: 'center',
      render: (val) => `${val || 0}%`,
    },
    { key: 'purpose', title: 'Mục đích vay vốn' },
    {
      key: 'collateral',
      title: 'Danh mục TSĐB',
      align: 'center',
      render: (_, record) => (
        <button 
          className={styles.iconBtn} 
          title="Xem danh mục"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLimit(record);
            setInitialModalTab(2);
            setIsCreditLimitModalOpen(true);
          }}
        >
          <Eye size={16} />
        </button>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      align: 'center',
      render: (val) => {
        const { text, className } = getStatusDisplay(val as string);
        return (
          <span className={`${styles.status} ${className}`}>
            {text}
          </span>
        );
      }
    }
  ];

  // Toolbar actions
  const handleOpenAdd = () => {
    setSelectedLimit(null);
    setInitialModalTab(1);
    setIsCreditLimitModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedRowId) return notifyError('Lỗi', 'Vui lòng chọn một hợp đồng để sửa');
    const limit = data.find(item => item.id === selectedRowId);
    if (!limit) return;
    setSelectedLimit(limit);
    setInitialModalTab(1);
    setIsCreditLimitModalOpen(true);
  };

  const handleDelete = () => {
    if (!selectedRowId) return notifyError('Lỗi', 'Vui lòng chọn một hợp đồng để xóa');
    // Implement delete logic here
    notifyError('Thông báo', 'Tính năng xóa đang được phát triển');
  };

  const handleOpenDetails = () => {
    if (!selectedRowId) return notifyError('Lỗi', 'Vui lòng chọn một hợp đồng để xem chi tiết');
    // Same as Edit for now but maybe readonly in future
    const limit = data.find(item => item.id === selectedRowId);
    if (!limit) return;
    setSelectedLimit(limit);
    setInitialModalTab(1);
    setIsCreditLimitModalOpen(true); 
  };

  const canApproveReject = useMemo(() => {
    if (!selectedRowId) return false;
    const limit = treeData.find((item: any) => item.id === selectedRowId);
    if (!limit) return false;
    return limit.status === 'PENDING_APPROVAL' || limit.status === 'PENDING';
  }, [selectedRowId, treeData]);

  const handleApprove = async () => {
    if (!selectedRowId) return notifyError('Lỗi', 'Vui lòng chọn một hạn mức để duyệt');
    try {
      setIsLoading(true);
      await apiClient.put(`/v1/capital-source/credit-limits/${selectedRowId}/approve`);
      notifySuccess('Thành công', 'Đã duyệt toàn bộ hạn mức của đối tác');
      fetchCreditLimits();
      setSelectedRowId(null);
    } catch (error: any) {
      notifyError('Lỗi', error.response?.data?.message || 'Không thể phê duyệt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRowId) return notifyError('Lỗi', 'Vui lòng chọn một hạn mức để từ chối');
    try {
      setIsLoading(true);
      await apiClient.put(`/v1/capital-source/credit-limits/${selectedRowId}/reject`);
      notifySuccess('Thành công', 'Đã từ chối toàn bộ hạn mức của đối tác');
      fetchCreditLimits();
      setSelectedRowId(null);
    } catch (error: any) {
      notifyError('Lỗi', error.response?.data?.message || 'Không thể từ chối');
    } finally {
      setIsLoading(false);
    }
  };

  if (!canView) {
    return <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', color: '#2563eb' }}>
          <List size={24} />
        </div>
        <h1 className={styles.pageTitle}>Danh sách hạn mức</h1>
      </div>

      {/* Filter Box */}
      <div className={styles.filterBox}>
        <div className={styles.filterTitleContainer}>
          <div className={styles.filterTitleBar}></div>
          <div className={styles.filterTitle}>BỘ LỌC TÌM KIẾM</div>
        </div>
        
        <div className={styles.filterRow1}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Mã đơn vị GD</span>
            <select className={styles.select} value={searchPartnerId} onChange={(e) => setSearchPartnerId(e.target.value)}>
              <option value="">Chọn mã đơn vị GD</option>
              {partnerOptions.map(p => (
                <option key={p.id} value={p.id}>{p.branchCusId || p.cusName}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Mã hạn mức</span>
            <Input type="text" placeholder="Nhập mã hạn mức" value={searchLimitId} onChange={(e) => setSearchLimitId(e.target.value)} />
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Số HĐ tín dụng</span>
            <Input type="text" placeholder="Nhập số HĐ tín dụng" value={searchContactNo} onChange={(e) => setSearchContactNo(e.target.value)} />
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Loại hạn mức</span>
            <select className={styles.select} value={searchLimitType} onChange={(e) => setSearchLimitType(e.target.value)}>
              <option value="">Chọn loại hạn mức</option>
              {LIMIT_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Trạng thái</span>
            <select className={styles.select} value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
              <option value="">Chọn trạng thái</option>
              <option value="ACTIVE">Đã duyệt</option>
              <option value="PENDING_APPROVAL">Chờ duyệt</option>
            </select>
          </div>
        </div>

        <div className={styles.filterRow2}>
          <div className={styles.filterRow2Inputs}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Ngày bắt đầu</span>
              <Input type="date" value={searchStartDate} onChange={(e) => setSearchStartDate(e.target.value)} />
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Ngày kết thúc</span>
              <Input type="date" value={searchEndDate} onChange={(e) => setSearchEndDate(e.target.value)} />
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Danh mục TSĐB</span>
              <select className={styles.select} value={searchAsset} onChange={(e) => setSearchAsset(e.target.value)}>
                <option value="">Chọn danh mục TSĐB</option>
              </select>
            </div>
          </div>
          
          <div className={styles.filterActions}>
            <Button variant="outline" onClick={handleClearSearch}>
              <RefreshCw size={16} style={{ marginRight: 8, display: 'inline' }} />
              Làm mới
            </Button>
            <Button variant="primary" onClick={handleSearch}>
              <Search size={16} style={{ marginRight: 8, display: 'inline' }} />
              Tra cứu
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar & Table */}
      <div className={styles.tableContainer}>
        <div style={{ padding: '16px' }}>
          <div className={styles.toolbar}>
            <div>
              <div className={styles.toolbarTitle}>
                <div className={styles.filterTitleBar}></div>
                <div className={styles.filterTitle}>DANH SÁCH HẠN MỨC</div>
              </div>
              <div className={styles.toolbarActions}>
                {canCreate && (
                  <Button variant="primary" onClick={handleOpenAdd}>
                    <Plus size={16} style={{ marginRight: 6, display: 'inline' }} />
                    Thêm mới
                  </Button>
                )}
                <Button variant="outline" onClick={handleOpenEdit} disabled={!selectedRowId}>
                  <Edit2 size={16} style={{ marginRight: 6, display: 'inline' }} /> Sửa
                </Button>
                <Button variant="outline" onClick={handleDelete} disabled={!selectedRowId}>
                  <Trash2 size={16} style={{ marginRight: 6, display: 'inline', color: 'red' }} /> <span style={{color: 'red'}}>Xóa</span>
                </Button>
                <Button variant="outline" onClick={handleOpenDetails} disabled={!selectedRowId}>
                  <FileBox size={16} style={{ marginRight: 6, display: 'inline' }} /> Chi tiết
                </Button>
                <Button variant="outline" onClick={() => setIsHistoryModalOpen(true)}>
                  <Clock size={16} style={{ marginRight: 6, display: 'inline' }} /> Lịch sử thay đổi
                </Button>
                {canExport && (
                  <Button variant="outline">
                    <Download size={16} style={{ marginRight: 6, display: 'inline', color: 'green' }} /> <span style={{color: 'green'}}>Xuất Excel</span>
                  </Button>
                )}
              </div>
            </div>

            <div className={styles.toolbarSearch}>
              <div className={styles.searchInputWrapper}>
                <input 
                  type="text" 
                  className={styles.searchInput} 
                  placeholder="Nhập mã hoặc số HĐ tín dụng..." 
                />
                <Search size={16} className={styles.searchIcon} />
              </div>
              <Button variant="outline">
                <Filter size={18} />
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            data={treeData}
            rowKey="id"
            isLoading={isLoading}
            onRowClick={(row) => setSelectedRowId(row.id)}
            highlightRow={true}
            selectedRowkey={selectedRowId}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <div>Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} của {totalItems} bản ghi</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select className={styles.select} style={{ width: 'auto', padding: '4px 8px' }}>
                <option>10 bản ghi/trang</option>
              </select>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className={styles.iconBtn} style={{ border: '1px solid var(--border)', padding: '4px 8px' }}>K</button>
                <button className={styles.iconBtn} style={{ border: '1px solid var(--border)', padding: '4px 8px' }}>&lt;</button>
                <button className={styles.iconBtn} style={{ border: '1px solid var(--border)', padding: '4px 8px', background: '#eff6ff', color: '#2563eb' }}>1</button>
                <button className={styles.iconBtn} style={{ border: '1px solid var(--border)', padding: '4px 8px' }}>&gt;</button>
                <button className={styles.iconBtn} style={{ border: '1px solid var(--border)', padding: '4px 8px' }}>&gt;|</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCreditLimitModalOpen && (
        <CreditLimitModal 
          isOpen={isCreditLimitModalOpen} 
          onClose={() => {
            setIsCreditLimitModalOpen(false);
            fetchCreditLimits(); 
          }} 
          limitData={selectedLimit}
          initialTab={initialModalTab}
        />
      )}

      {isHistoryModalOpen && (
        <HistoryModal 
          isOpen={isHistoryModalOpen} 
          onClose={() => setIsHistoryModalOpen(false)} 
        />
      )}
    </div>
  );
}
