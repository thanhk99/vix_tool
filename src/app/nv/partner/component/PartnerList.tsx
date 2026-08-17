'use client';

import { useEffect, useState, useMemo } from 'react';
import styles from './PartnerList.module.css';
import Button from '@/components/shared/Button/Button';
import Table, { TableColumn } from '@/components/shared/Table/Table';
import Input from '@/components/shared/Input/Input';
import { CreatePartnerRequest, PartnersItem } from '@/types/funding.types';
import apiClient from '@/lib/api/client';
import { ChevronLeft, ChevronRight, Pen, Trash2, X, MoreVertical, CheckCircle, Plus, RefreshCw, FileSpreadsheet, Eye } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useNotification } from '@/hooks/useNotification';
import { useRouter } from 'next/navigation';
import Modal from '@/components/shared/Modal/Modal';
import ViewPartner from './ViewPartner';
import PartnerFormModal from './PartnerFormModal';

export default function PartnerList() {
  const [partners, setPartners] = useState<PartnersItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { notifyError, notifySuccess, notifyWarning, notifyInfo } = useNotification();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [totalItems, setTotalItems] = useState(0);

  const [editPartnerId, setEditPartnerId] = useState<string | null>(null);
  const userId = useAuthStore((state) => state.userId);

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
      const res = await apiClient.get(`/v1/capital-source/partners?page=${currentPage - 1}&size=${pageSize}${keywordQuery}`);
      
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
      
      setPartners(Array.isArray(data) ? data : []);
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

  const STATUS_MAP: Record<string, string> = {
    ACTIVE: 'Đã duyệt',
    APPROVED: 'Đã duyệt',
    PENDING: 'Chờ duyệt',
    PENDING_APPROVAL: 'Chờ duyệt',
    INACTIVE: 'Ngừng hoạt động'
  };

  // getStatusClass 
  const STATUS_CLASS: Record<string, string> = {
    ACTIVE: styles.active,
    APPROVED: styles.active,
    PENDING: styles.pending,
    PENDING_APPROVAL: styles.pending,
    INACTIVE: styles.inactive,
  };

  const getStatusClass = (status: string) => STATUS_CLASS[status as keyof typeof STATUS_CLASS] ?? "";

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      setLoading(true);
      await apiClient.delete(`/v1/capital-source/partners/${id}`);
      notifySuccess("Thành công", "Đã xóa đối tác");
      fetchPartners();
    } catch (e) {
      notifyError("Lỗi", "Không thể xóa đối tác");
    } finally {
      setLoading(false);
      setOpenActionMenuId(null);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      // Giả định API approve. Nếu API khác, hãy điều chỉnh
      await apiClient.put(`/v1/capital-source/partners/${id}/approve`, {});
      notifySuccess("Thành công", "Đã phê duyệt đối tác");
      fetchPartners();
    } catch (e) {
      notifyError("Lỗi", "Không thể phê duyệt đối tác");
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
      width: 250
    },
    {
      key: "idCode",
      title: "ĐKKD/CCCD",
      width: 100
    },
    {
      key: "fistIssueDate",
      title: "Cấp lần đầu",
      width: 100
    },
    {
      key: "lastIssueDate",
      title: "Cấp cuối",
      width: 100
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
      width: 100
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (value) => {
        const statusVal = value as string;
        const displayStatus = STATUS_MAP[statusVal] || statusVal;
        return (
          <span className={`${styles.status} ${getStatusClass(statusVal) ?? ""}`}>
            {displayStatus}
          </span>
        );
      },
      width: 90
    },
    {
      key: "lastUpdated",
      title: "Ngày sửa",
      width: 90
    },
    {
      key: "updatedBy",
      title: "Người sửa",
      width: 90
    },
    {
      key: "actions",
      title: "Thao tác",
      width: 60,
      render: (_, record) => (
        <div className={styles.actionButtons}>
          <button 
            className={styles.moreBtn}
            onClick={(e) => {
              e.stopPropagation();
              if (openActionMenuId === record.id) {
                setOpenActionMenuId(null);
                setMenuPosition(null);
              } else {
                const rect = e.currentTarget.getBoundingClientRect();
                setOpenActionMenuId(record.id);
                setMenuPosition({
                  top: rect.bottom,
                  right: window.innerWidth - rect.right,
                });
              }
            }}
          >
            <MoreVertical size={16} />
          </button>
          
          {openActionMenuId === record.id && menuPosition && (() => {
            const statusVal = String(record.status || '').trim().toUpperCase();
            const isPending = ['PENDING', 'PENDING_APPROVAL', 'CHỜ DUYỆT', 'CHO_DUYET', 'WAIT_APPROVE', 'WAITING'].includes(statusVal);
            const isActive = ['ACTIVE', 'ĐÃ DUYỆT', 'DA_DUYET', 'APPROVED'].includes(statusVal);

            return (
              <div 
                className={styles.dropdownMenu}
                style={{
                  position: 'fixed',
                  top: menuPosition.top + 'px',
                  right: menuPosition.right + 'px',
                  zIndex: 9999
                }}
              >
                <button onClick={(e) => {
                  e.stopPropagation();
                  setEditPartnerId(record.id);
                  setIsOpenModal(true);
                  setOpenActionMenuId(null);
                }}>
                  <Pen size={14} /> Sửa
                </button>
                
                <button 
                  disabled={!isPending}
                  className={!isPending ? styles.disabledBtn : ''}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isPending) return;
                    handleApprove(record.id);
                  }}
                >
                  <CheckCircle size={14} /> Phê duyệt
                </button>

                <button 
                  disabled={!isActive}
                  className={!isActive ? styles.disabledBtn : styles.dangerBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isActive) return;
                    handleDelete(record.id);
                  }}
                >
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            );
          })()}
        </div>
      ),
    },
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
    if (!currentData || currentData.length === 0) {
      notifyWarning('Cảnh báo', 'Không có dữ liệu để xuất Excel!');
      return;
    }
    
    const headers = ["Mã đối tác", "Tên đối tác", "Tên viết tắt", "Địa chỉ", "Mã số thuế / CMND", "Loại khách hàng", "Trạng thái"];
    const rows = currentData.map(p => [
      p.cusId || '',
      p.cusName || '',
      p.shortName || '',
      p.address || '',
      p.idCode || '',
      p.cusType || '',
      STATUS_MAP[p.status as keyof typeof STATUS_MAP] || p.status || ''
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Danh_sach_doi_tac_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    notifySuccess('Thành công', 'Đã xuất file Excel!');
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>

      {/*Header */}
      <div className={styles.header}>
        <div className={styles.actions}>
          {/* SEARCH  */}
          <div className={styles.searchWrapper}>
            <Input
              type="text"
              placeholder="Tìm kiếm theo mã, tên KH,..."
              value={searchKeyword}
              onChange={handleSearch}
            />
            {searchKeyword && (
              <button className={styles.clearBtn} onClick={handleClearSearch}>
                <X size={14} />
              </button>
            )}
          </div>

          <Button variant="primary" onClick={fetchPartners}>
            <RefreshCw size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />
            Làm mới
          </Button>
          <Button variant='primary' onClick={handleOpenCreateModal}>
            <Plus size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />
            Thêm mới
          </Button>
          <Button variant='primary' onClick={handleExportExcel}>
            <FileSpreadsheet size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />
            Xuất Excel
          </Button>

          <Button variant='primary' disabled={!selectedPartner}
          onClick={() => {
            if(!selectedPartner) return;
            handleViewPartner(selectedPartner);
          }}>
            <Eye size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />
            Xem
          </Button>

          <Button variant='primary' disabled={!selectedPartner}
            onClick={() => {
              if(!selectedPartner) return;
            }}
          >
            <Trash2 size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />
            Xóa
          </Button>
        </div>
      </div>
      
      {/*Table */}
      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          data={currentData}
          rowKey="id"
          isLoading={loading}
          // onRowClick={(partners) => {setSelectedPartner(partners), handleRowClick}}
          onRowClick={handleRowClick}
          selectedRowkey={selectedRowId}
        />
      </div>
      
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
        <Modal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          title={
            <>
              <Eye size={22} color="var(--primary)" /> Chi tiết đối tác
            </>
          }
          size="xl"
        >
          <ViewPartner
            partner={viewingPartner}
            partnerId={viewingPartner.id}
            getStatusClass={getStatusClass}
            onClose={handleCloseViewModal}
          />
        </Modal>
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

      {/*Chi tiet */}
      {selectedPartner && (
      <div className={styles.partnerDetail}>
        <div className={styles.detailGrid}>
          {/* CỘT TRÁI - Thông tin đối tác */}
          <div className={styles.detailColumn}>
            <div className={styles.detailHeader}>
              <h3>THÔNG TIN CHI TIẾT ĐỐI TÁC</h3>
              <button
                type="button"
                onClick={handleCloseDetail}
                className={styles.closeDetail}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.detailGrid3Col}>
              <Input label="Mã KH" value={selectedPartner.cusId || ""} readOnly />
              <Input label="Mã đơn vị GD" value={selectedPartner.branchCusId || ""} readOnly />
              <Input label="Tên KH" value={selectedPartner.cusName || ""} readOnly />
              <Input label="Số ĐKKD/CCCD" value={selectedPartner.idCode || ""} readOnly />
              <Input label="Ngày cấp lần đầu" value={selectedPartner.fistIssueDate || ""} readOnly />
              <Input label="Ngày cấp cuối" value={selectedPartner.lastIssueDate || ""} readOnly />
              <Input label="Nơi cấp" value={selectedPartner.issueBy || ""} readOnly />
              <Input label="Giấy phép hoạt động" value={selectedPartner.opLiscenseNo || ""} readOnly />
              <Input label="Ngày cấp giấy phép" value={selectedPartner.opIssueDate || ""} readOnly />
              <Input label="Điện thoại" value={selectedPartner.mobile || ""} readOnly />
              <Input label="Email" value={selectedPartner.email || ""} readOnly />
              <Input label="Website" value={selectedPartner.website || ""} readOnly />
              <Input label="Phân loại KH" value={selectedPartner.cusType || ""} readOnly />
              <Input label="Loại hình kinh doanh" value={selectedPartner.businessType || ""} readOnly />
              <Input label="NĐT chuyên nghiệp" value={selectedPartner.professionalInvestor ? "Có" : "Không"} readOnly />
              <Input label="Ngày bắt đầu NĐT CN" value={selectedPartner.professionalStartDate || ""} readOnly />
              <Input label="Ngày kết thúc NĐT CN" value={selectedPartner.professionalEndDate || ""} readOnly />
              
              <div className={styles.formGroupReadOnly}>
                 <label>Trạng thái</label>
                 <div className={`${styles.statusText} ${getStatusClass(selectedPartner.status)}`}>
                    {selectedPartner.status ? (STATUS_MAP[selectedPartner.status as keyof typeof STATUS_MAP] || selectedPartner.status) : "-"}
                 </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI - Thông tin quản lý */}
          <div className={styles.detailColumn}>
            <div className={styles.detailSectionTitle}>
              <h3 style={{fontSize:'var(--text-md)', margin:0, color:'var(--primary-color)'}}>THÔNG TIN QUẢN LÝ</h3>
            </div>
            <div className={styles.managementGrid}>
               <Input label="User thực hiện" value={selectedPartner.updatedBy || ""} readOnly />
               <Input label="Ngày chỉnh sửa" value={selectedPartner.lastUpdated || ""} readOnly />
               <Input label="User duyệt" value={selectedPartner.approvedBy || "N/A"} readOnly />
               <Input label="Thời gian duyệt" value={selectedPartner.approvedAt ? selectedPartner.approvedAt.substring(0, 19).replace('T', ' ') : "N/A"} readOnly />
               <div className={styles.formGroupReadOnly}>
                  <label>Ghi chú</label>
                  <textarea readOnly value="Hồ sơ đã được duyệt." className={styles.readOnlyTextarea} />
               </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}