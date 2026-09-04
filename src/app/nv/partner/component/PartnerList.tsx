'use client';

import { useEffect, useState, useMemo } from 'react';
import { getStatusDisplay } from '@/constants/status';
import styles from './PartnerList.module.css';
import Button from '@/components/shared/Button/Button';
import Table, { TableColumn } from '@/components/shared/Table/Table';
import Input from '@/components/shared/Input/Input';
import { CreatePartnerRequest, PartnersItem } from '@/types/funding.types';
import apiClient from '@/lib/api/client';
import { ChevronLeft, ChevronRight, Pen, Trash2, X, MoreVertical, CheckCircle, Plus, RefreshCw, FileSpreadsheet, Eye, Clock, FileText, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useNotification } from '@/hooks/useNotification';
import { useRouter } from 'next/navigation';
import Modal from '@/components/shared/Modal/Modal';
import ViewPartner from './ViewPartner';
import PartnerFormModal from './PartnerFormModal';
import PartnerApprovalModal from './PartnerApprovalModal';
import { usePermission } from '@/hooks/usePermission';
import { ResourceCode, ActionCode } from '@/types/permission.types';
import { useExportJob } from '@/hooks/useExportJob';
import { formatDate } from '@/utils/format';

export default function PartnerList() {
  const [partners, setPartners] = useState<PartnersItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { notifyError, notifySuccess, notifyWarning, notifyInfo } = useNotification();
  const { isExporting, triggerExport } = useExportJob();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [totalItems, setTotalItems] = useState(0);

  const [editPartnerId, setEditPartnerId] = useState<string | null>(null);
  const userId = useAuthStore((state) => state.userId);

  const { hasPermission } = usePermission();
  const canApprove = hasPermission(ResourceCode.CAPITAL_PARTNER, ActionCode.APPROVE);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalPartner, setApprovalPartner] = useState<PartnersItem | null>(null);

  // Tinh toan cho phan trang (Server-side)
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = partners;
  // Router 
  const router = useRouter();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingPartner, setViewingPartner] = useState<PartnersItem | null>(null);
  const handleViewPartner = (partner: PartnersItem) => {
    setViewingPartner(partner);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingPartner(null);
  };
  
  // Action menu state
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenActionMenuId(null);
    };
    if (openActionMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openActionMenuId]);

  // Click row
  const [selectedPartner, setSelectedPartner] = useState<PartnersItem | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  
  // Click vao dong
  const handleRowClick = (record: PartnersItem) => {
    // Nếu bấm vào row thì ẩn menu
    setOpenActionMenuId(null);
    if(selectedPartner?.id === record.id) {
      setSelectedRowId(null);
      setSelectedPartner(null);
    } else {
      setSelectedRowId(record.id);
      setSelectedPartner(record);
    }
  };

  // click X detail
  const handleCloseDetail = () => {
    setSelectedRowId(null);
    setSelectedPartner(null);
  };
  // GET
  const fetchPartners = async () => {
    try {
      setLoading(true);
      // Giả định backend dùng page (0-indexed) hoặc page (1-indexed)
      // Hiện tại gửi page=currentPage - 1 cho chuẩn Spring Boot mặc định
      const keywordQuery = searchKeyword ? `&keyword=${encodeURIComponent(searchKeyword)}` : '';
      const res: any = await apiClient.get(`/v1/capital-source/partners?page=${currentPage - 1}&size=${pageSize}${keywordQuery}`);
      
      let data = [];
      let total = 0;
      
      if (res?.content) {
         data = res.content;
         total = res.totalElements || 0;
      } else if (res?.data?.content) {
         data = res.data.content;
         total = res.data.totalElements || 0;
      } else if (res?.data?.data) {
         data = res.data.data;
         total = res.data.total || res.data.totalElements || 0;
      } else {
         data = Array.isArray(res) ? res : (res?.data || []);
         total = Array.isArray(data) ? data.length : 0;
      }
      
      const rawList = Array.isArray(data) ? data : [];
      const filteredData = rawList.filter(
        (item: any) => item.status !== 'DRAFT' && !item.cusId?.startsWith('DRAFT_') && item.cusName !== 'Bản nháp'
      );
      
      if (typeof window !== 'undefined') {
        filteredData.forEach((p: any) => {
          const key = `partner_snapshot_${p.id}`;
          const isApproved = ['ACTIVE', 'APPROVED', 'ĐÃ DUYỆT', 'HOẠT ĐỘNG'].includes(String(p.status || '').toUpperCase());
          if (isApproved || !localStorage.getItem(key)) {
            // Only update baseline if approved or not set yet
            if (isApproved) {
              localStorage.setItem(key, JSON.stringify(p));
            }
          }
        });
      }

      setPartners(filteredData);
      setTotalItems(total);
    } catch (error) {
      notifyError('Lỗi', 'Không tải được dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPartners();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, pageSize, searchKeyword]);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword]);

  // Cập nhật lại thông tin chi tiết nếu dữ liệu trong bảng thay đổi (VD: sau khi duyệt)
  useEffect(() => {
    if (selectedPartner) {
      const updated = partners.find(p => p.id === selectedPartner.id);
      if (updated) {
        setSelectedPartner(updated);
      }
    }
  }, [partners, selectedPartner?.id]);

  // Xu ly tim kiem
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
  };

  const getStatusClass = (status: string) => {
    const { className } = getStatusDisplay(status);
    return styles[className] || className;
  };

  const getStatusLabel = (status: string) => {
    return getStatusDisplay(status).label;
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      setLoading(true);
      await apiClient.delete(`/v1/capital-source/partners/${id}`);
      notifySuccess("Thành công", "Đã gửi yêu cầu xóa đối tác");
      fetchPartners();
    } catch (e) {
      notifyError("Lỗi", "Không thể xóa đối tác");
    } finally {
      setLoading(false);
      setOpenActionMenuId(null);
    }
  };

  const handleApprove = async (id: string, currentStatus?: string) => {
    try {
      setLoading(true);
      if (currentStatus === 'PENDING_DELETE' || currentStatus === 'Chờ duyệt xoá') {
        await apiClient.put(`/v1/capital-source/partners/${id}/approve-delete`, {});
      } else {
        await apiClient.put(`/v1/capital-source/partners/${id}/approve`, {});
      }
      notifySuccess("Thành công", "Đã phê duyệt đối tác");
      fetchPartners();
    } catch (e) {
      notifyError("Lỗi", "Không thể phê duyệt đối tác");
    } finally {
      setLoading(false);
      setOpenActionMenuId(null);
    }
  };

  const handleReject = async (id: string, currentStatus?: string) => {
    try {
      if (!confirm("Bạn có chắc chắn muốn từ chối đối tác này?")) return;
      setLoading(true);
      if (currentStatus === 'PENDING_DELETE' || currentStatus === 'Chờ duyệt xoá') {
        await apiClient.put(`/v1/capital-source/partners/${id}/reject-delete`, {});
        notifySuccess("Thành công", "Đã từ chối xóa đối tác");
      } else {
        await apiClient.put(`/v1/capital-source/partners/${id}/reject`, {});
        notifySuccess("Thành công", "Đã từ chối đối tác");
      }
      fetchPartners();
    } catch (e) {
      notifyError("Lỗi", "Không thể từ chối đối tác");
    } finally {
      setLoading(false);
      setOpenActionMenuId(null);
    }
  };


  const columns: TableColumn<PartnersItem>[] = [
    {
      key: "stt",
      title: "STT",
      width: 40,
      render: (_, __, index) => startIndex + index + 1,
    },
    {
      key: "cusId",
      title: "Mã KH",
      width: 80
    },
    {
      key: "branchCusId",
      title: "Đơn vị GD",
      width: 90
    },
    {
      key: "cusName",
      title: "Tên KH",
      width: 230
    },
    {
      key: "idCode",
      title: "ĐKKD/CCCD",
      width: 100
    },
    {
      key: "fistIssueDate",
      title: "Cấp lần đầu",
      width: 95,
      render: (val) => formatDate(val)
    },
    {
      key: "lastIssueDate",
      title: "Cấp cuối",
      width: 95,
      render: (val, record) => {
        const isNeverChanged = Number(record.changeCount ?? 0) === 0;
        const lastDate = (isNeverChanged && record.fistIssueDate) ? record.fistIssueDate : (val || record.fistIssueDate);
        return formatDate(lastDate);
      }
    },
    {
      key: "issueBy",
      title: "Nơi cấp",
      width: 100
    },
    {
      key: "opLiscenseNo",
      title: "GP HĐ",
      width: 90
    },
    {
      key: "opIssueDate",
      title: "Ngày cấp GP",
      width: 95,
      render: (val) => formatDate(val)
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (value) => {
        const statusVal = value as string;
        const displayStatus = getStatusLabel(statusVal);
        return (
          <span className={`${styles.status} ${getStatusClass(statusVal) ?? ""}`}>
            {displayStatus}
          </span>
        );
      },
      width: 90
    },
    {
      key: "updatedBy",
      title: "User thực hiện",
      render: (val) => (val as string) || "-",
      width: 100
    },
    {
      key: "lastUpdated",
      title: "Ngày sửa",
      render: (val) => formatDate(val),
      width: 95
    },
    {
      key: "approvedBy",
      title: "User duyệt",
      render: (val) => (val as string) || "-",
      width: 100
    },
    {
      key: "approvedAt",
      title: "Ngày duyệt",
      render: (val) => formatDate(val),
      width: 95
    }
  ];

  // Xu ly phan trang
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  // POST is now handled in PartnerFormModal
  const handleOpenCreateModal = () => {
    setEditPartnerId(null);
    setIsOpenModal(true);
  };

  const handleExportExcel = () => {
    triggerExport('EXPORT_PARTNER', { keyword: searchKeyword }, 'Danh_sach_doi_tac.xlsx');
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>

      {/*Header */}
      <div className={styles.header}>
        <div className={styles.actions} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', width: '100%' }}>
          
          <Button variant='primary' onClick={handleOpenCreateModal}>
            <Plus size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />
            Thêm mới
          </Button>

          {(() => {
            const statusVal = String(selectedPartner?.status || '').trim().toUpperCase();
            const isPending = selectedPartner && ['PENDING', 'PENDING_APPROVAL', 'CHỜ DUYỆT', 'CHO_DUYET', 'WAIT_APPROVE', 'WAITING', 'PENDING_DELETE'].includes(statusVal);
            const isActive = selectedPartner && ['ACTIVE', 'ĐÃ DUYỆT', 'DA_DUYET', 'APPROVED'].includes(statusVal);

            return (
              <>
                <Button 
                  variant='outline' 
                  disabled={!selectedPartner}
                  style={{ borderColor: selectedPartner ? '#3b82f6' : '#e5e7eb', color: selectedPartner ? '#3b82f6' : '#9ca3af', padding: '4px 12px' }}
                  onClick={() => {
                    if(!selectedPartner) return;
                    setEditPartnerId(selectedPartner.id);
                    setIsOpenModal(true);
                  }}>
                  <Pen size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />
                  Sửa
                </Button>

                <Button 
                  variant='outline' 
                  disabled={!isActive}
                  style={{ borderColor: isActive ? '#ef4444' : '#e5e7eb', color: isActive ? '#ef4444' : '#9ca3af', padding: '4px 12px' }}
                  onClick={() => {
                    if(!isActive || !selectedPartner) return;
                    handleDelete(selectedPartner.id);
                  }}>
                  <Trash2 size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />
                  Xóa
                </Button>

                <Button 
                  variant='outline' 
                  disabled={!isPending || !canApprove}
                  title={!canApprove ? "Bạn không có quyền phê duyệt" : ""}
                  style={{ borderColor: (isPending && canApprove) ? '#22c55e' : '#e5e7eb', color: (isPending && canApprove) ? '#22c55e' : '#9ca3af', padding: '4px 12px' }}
                  onClick={() => {
                    if(!isPending || !selectedPartner) return;
                    if(!canApprove) {
                      notifyWarning("Cảnh báo", "Bạn không có quyền phê duyệt đối tác!");
                      return;
                    }
                    setApprovalPartner(selectedPartner);
                    setIsApprovalModalOpen(true);
                  }}>
                  <Check size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />
                  Phê duyệt
                </Button>

                <Button 
                  variant='outline' 
                  disabled={!selectedPartner}
                  style={{ borderColor: selectedPartner ? '#60a5fa' : '#e5e7eb', color: selectedPartner ? '#60a5fa' : '#9ca3af', padding: '4px 12px' }}
                  onClick={() => {
                    if(!selectedPartner) return;
                    handleViewPartner(selectedPartner);
                  }}>
                  <FileText size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />
                  Chi tiết
                </Button>
                
                <Button 
                  variant='outline' 
                  disabled={!selectedPartner}
                  style={{ borderColor: selectedPartner ? '#1e3a8a' : '#e5e7eb', color: selectedPartner ? '#1e3a8a' : '#9ca3af', padding: '4px 12px' }}
                  onClick={() => {
                    if(!selectedPartner) return;
                    notifyInfo('Thông báo', 'Chức năng lịch sử thay đổi đang được phát triển');
                  }}>
                  <Clock size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />
                  Lịch sử thay đổi
                </Button>
              </>
            );
          })()}

          <Button 
            variant='outline' 
            disabled={isExporting}
            style={{ 
              borderColor: isExporting ? '#9ca3af' : '#22c55e', 
              color: isExporting ? '#9ca3af' : '#22c55e', 
              padding: '4px 12px' 
            }}
            onClick={handleExportExcel}>
            <FileSpreadsheet size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />
            {isExporting ? 'Đang xuất file trong nền...' : 'Xuất Excel'}
          </Button>
          
          <div style={{ flex: 1 }}></div>

          <div className={styles.searchWrapper}>
            <Input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchKeyword}
              onChange={handleSearch}
            />
            {searchKeyword && (
              <button className={styles.clearBtn} onClick={handleClearSearch}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/*Table */}
      <Table
        columns={columns}
        data={currentData}
        rowKey="id"
        isLoading={loading}
        onRowClick={handleRowClick}
        selectedRowkey={selectedRowId}
      />
      
      {/*Modal */}
      {isOpenModal && (
          <PartnerFormModal
              isOpen={isOpenModal}
              onClose={() => setIsOpenModal(false)}
              partnerId={editPartnerId}
              onSuccess={fetchPartners}
          />
      )}

      {isViewModalOpen && viewingPartner && (
          <PartnerFormModal
              isOpen={isViewModalOpen}
              onClose={handleCloseViewModal}
              partnerId={viewingPartner.id}
              onSuccess={fetchPartners}
              isView={true}
          />
      )}

      {isApprovalModalOpen && approvalPartner && (
          <PartnerApprovalModal
              isOpen={isApprovalModalOpen}
              partner={approvalPartner}
              onClose={() => {
                  setIsApprovalModalOpen(false);
                  setApprovalPartner(null);
              }}
              onSuccess={() => {
                  setSelectedPartner(null);
                  setSelectedRowId(null);
                  fetchPartners();
              }}
          />
      )}

      {/* PHÂN TRANG */}
      {totalItems > 0 && (
        <div className={styles.pagination}>
          <div className={styles.pageInfo} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} của {totalItems} bản ghi {searchKeyword && `(kết quả tìm kiếm)`}</span>
            <select 
              value={pageSize} 
              onChange={handlePageSizeChange}
              style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', cursor: 'pointer' }}
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>
          </div>
          <div className={styles.pageControls}>
            <button
              className={styles.pageBtn}
              disabled={currentPage === 1}
              onClick={handlePrevPage}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageBtn} ${currentPage === page ? styles.pageActive : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
