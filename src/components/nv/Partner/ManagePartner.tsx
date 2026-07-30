'use client';

import { CircleCheck,Eye,Pen,Plus,UsersRound,RefreshCcw,FileSpreadsheet,X,Check,Search,StepForward,StepBack,} from 'lucide-react';
import styles from './ManagePartner.module.css';
import { useEffect, useState } from 'react';
import Button from '@/components/shared/Button/Button';
import Modal from '@/components/shared/Modal/Modal';
import {mockPartners, PartnerItem} from '@/mock/partner'
import DetailPartner from './DetailPartner';
import { useRouter } from 'next/navigation';

export default function ManagePartner() {
  const [partners, setPartners] = useState<PartnerItem[]>(mockPartners);
  const [filteredPartners, setFilteredPartners] = useState(mockPartners);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'approve'>('create');
  const [selectedPartner, setSelectedPartner] = useState<PartnerItem | null>(null);
  const sizePage = 10;
  const [formData, setFormData] = useState<PartnerItem>({
      id: '',
      partnerCode: '',
      customerCode: '',
      partnerName: '',
      taxCode: '',
      issuedDate: '',
      expiredDate: '',
      issuedPlace: '',
      contractNumber: '',
      createdDate: '',
      phone: '',                    
      email: '',                    
      website: '',                  
      tvlkCode: '',                 
      customerType: '',             
      economicType: '',            
      isProfessionalInvestor: '', 
      startDate: '',                
      endDate: '',                 
      status: 'Chờ duyệt',
      userCreate: '',               
      userApprove: '',             
      approvedDate: '',
      stt: 0,
      note: '',
      changeCount: 0,
      shortName: '',
      address: ''

  });
  const router = useRouter(); 

  // Phan trang
  const totalPage = Math.ceil(filteredPartners.length / sizePage);
  const paginatedData = filteredPartners.slice(
    (currentPage - 1) * sizePage,
    currentPage * sizePage
  );

  // ===== HANDLERS =====
  const handleOpenCreate = () => {
    router.push('/nv/partner/create')
  };

  const handleOpenEdit = (partner: PartnerItem) => {
    router.push(`/nv/partner/edit/${partner.id}`);
  };

  const handleOpenView = (partner: PartnerItem) => {
    router.push(`/nv/partner/view/${partner.id}`); 
  };

  const handleOpenApprove = (partner: PartnerItem) => {
    setModalMode('approve');
    setSelectedPartner(partner);
    setFormData(partner);
    setIsOpenModal(true);
  };

  // Search
  useEffect(() => {
    const keyword = search.toLowerCase();
    setFilteredPartners(
      partners.filter(
        (item) =>
          item.partnerName.toLowerCase().includes(keyword) ||
          item.partnerCode.toLowerCase().includes(keyword) ||
          item.customerCode.toLowerCase().includes(keyword)
      )
    );
    setCurrentPage(1);
  }, [search, partners]);

  // Refresh
  const handleRefresh = () => {
    setPartners(mockPartners);
    setFilteredPartners(mockPartners);
    setSelectedPartner(null);
    setSearch('');
  };

  // Export Excel
  const handleExportExcel = () => {
    alert('Xuất file Excel');
  };

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save
  const handleSave = () => {
    if (modalMode === 'create') {
      const newPartner: PartnerItem = {
        ...formData,
        id: Date.now().toString(),
      };
      setPartners((prev) => [...prev, newPartner]);
    }

    if (modalMode === 'edit') {
      setPartners((prev) =>
        prev.map((item) => (item.id === formData.id ? formData : item))
      );
    }

    setIsOpenModal(false);
  };

  // Approve
  const handleApprove = () => {
    if (!selectedPartner) return;

    setPartners((prev) =>
      prev.map((item) =>
        item.id === selectedPartner.id
          ? {
              ...item,
              status: 'Đã duyệt',
              approvedDate: new Date().toLocaleDateString('vi-VN'),
              approvedBy: 'admin',
            }
          : item
      )
    );

    setIsOpenModal(false);
  };

  const handleRowClick = (partner: PartnerItem) => {
    setSelectedPartner(partner);
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.title}>
        <UsersRound size={24} />
        <h2>Quản lý đối tác</h2>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${modalMode === 'create' ? styles.tabActive : ''}`}
            onClick={handleOpenCreate}
          >
            <Plus size={16} />
            Thêm mới
          </button>
          <button
            className={`${styles.tab} ${modalMode === 'edit' ? styles.tabActive : ''}`}
            onClick={() => selectedPartner && handleOpenEdit(selectedPartner)}
            disabled={!selectedPartner}
          >
            <Pen size={16} />
            Sửa
          </button>
          <button
            className={`${styles.tab} ${modalMode === 'view' ? styles.tabActive : ''}`}
            onClick={() => selectedPartner && handleOpenView(selectedPartner)}
            disabled={!selectedPartner}
          >
            <Eye size={16} />
            Xem
          </button>
          <button
            className={`${styles.tab} ${modalMode === 'approve' ? styles.tabActive : ''}`}
            onClick={() => selectedPartner && handleOpenApprove(selectedPartner)}
            disabled={!selectedPartner || selectedPartner.status === 'Đã duyệt'}
          >
            <CircleCheck size={16} />
            Duyệt
          </button>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.clearBtn} onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <button className={styles.refreshBtn} onClick={handleRefresh} title="Làm mới">
            <RefreshCcw size={16} />
          </button>
          <button className={styles.exportBtn} onClick={handleExportExcel} title="Xuất Excel">
            <FileSpreadsheet size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.table}>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã KH</th>
              <th>Mã đơn vị GD</th>
              <th>Tên KH</th>
              <th>Số ĐKKD/CCCD</th>
              <th>Ngày cấp lần đầu</th>
              <th>Ngày cấp cuối</th>
              <th>Nơi cấp</th>
              <th>GP hoạt động</th>
              <th>Ngày cấp</th>
              <th>Trạng thái</th>
              <th>Ngày chỉnh sửa</th>
              <th>User thực hiện</th>
              {/* <th>Thao tác</th> */}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((partner, index) => (
                <tr
                  key={partner.id}
                  onClick={() => setSelectedPartner(partner)}
                  className={selectedPartner?.id === partner.id ? styles.activeRow : ''}
                >
                  <td>{(currentPage - 1) * sizePage + index + 1}</td>
                  <td className={styles.partnerCode}>{partner.partnerCode}</td>
                  <td>{partner.customerCode}</td>
                  <td className={styles.partnerName}>{partner.partnerName}</td>
                  <td>{partner.taxCode}</td>
                  <td>{partner.issuedDate}</td>
                  <td>{partner.expiredDate}</td>
                  <td>{partner.issuedPlace}</td>
                  <td>{partner.contractNumber}</td>
                  <td>{partner.createdDate}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        partner.status === 'Đã duyệt'
                          ? styles.statusApproved
                          : partner.status === 'Chờ duyệt'
                          ? styles.statusPending
                          : styles.statusInactive
                      }`}
                    >
                      {partner.status === 'Đã duyệt'}
                      {partner.status}
                    </span>
                  </td>
                  <td>{partner.approvedDate}</td>
                  <td>{partner.userApprove}</td>
                  {/* <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.viewBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenView(partner);
                        }}
                        title="Xem"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className={styles.editBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(partner);
                        }}
                        title="Sửa"
                      >
                        <Pen size={16} />
                      </button>
                      {partner.status === 'Chờ duyệt' && (
                        <button
                          className={styles.approveBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenApprove(partner);
                          }}
                          title="Duyệt"
                        >
                          <CircleCheck size={16} />
                        </button>
                      )}
                    </div>
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={14} className={styles.emptyRow}>
                  <div className={styles.emptyState}>
                    <UsersRound size={48} />
                    <p>Không tìm thấy đối tác nào</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredPartners.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            {filteredPartners.length} bản ghi
          </div>
          <div className={styles.pageControls}>
            <button
              className={styles.pageBtn}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <StepBack/>
            </button>
            {Array.from({ length: Math.min(totalPage, 10) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageBtn} ${currentPage === page ? styles.pageActive : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              disabled={currentPage === totalPage}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <StepForward/>
            </button>
          </div>
        </div>
      )}

      {/*Detail partner */}
        {selectedPartner && (
          <DetailPartner partner={selectedPartner}
          onClose = {() => setSelectedPartner(null)} />
        )}

      {/* Modal */}
      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title={
          modalMode === 'create'
            ? 'Thêm mới đối tác'
            : modalMode === 'edit'
            ? 'Chỉnh sửa đối tác'
            : modalMode === 'view'
            ? 'Thông tin đối tác'
            : 'Duyệt đối tác'
        }
        size="xl"
      >
        <div className={styles.modalContent}>
          <h3 className={styles.sectionTitle}>Thông tin chung</h3>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Mã khách hàng</label>
              <input
                name="partnerCode"
                value={formData.partnerCode}
                onChange={handleChange}
                disabled={modalMode === 'view'}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Mã đơn vị giao dịch</label>
              <input
                name="customerCode"
                value={formData.customerCode}
                onChange={handleChange}
                disabled={modalMode === 'view'}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Tên khách hàng</label>
              <input
                name="partnerName"
                value={formData.partnerName}
                onChange={handleChange}
                disabled={modalMode === 'view'}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Số ĐKKD/CCCD</label>
              <input
                name="taxCode"
                value={formData.taxCode}
                onChange={handleChange}
                disabled={modalMode === 'view'}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Ngày cấp lần đầu</label>
              <input
                type="date"
                name="issuedDate"
                value={formData.issuedDate}
                onChange={handleChange}
                disabled={modalMode === 'view'}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Ngày cấp cuối</label>
              <input
                type="date"
                name="expiredDate"
                value={formData.expiredDate}
                onChange={handleChange}
                disabled={modalMode === 'view'}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Nơi cấp</label>
              <input
                name="issuedPlace"
                value={formData.issuedPlace}
                onChange={handleChange}
                disabled={modalMode === 'view'}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Giấy phép hoạt động</label>
              <input
                name="contractNumber"
                value={formData.contractNumber}
                onChange={handleChange}
                disabled={modalMode === 'view'}
              />
            </div>
          </div>

          <div className={styles.tabs}>
            <button className={styles.activeTab}>Chữ ký</button>
            <button>UQ / Người đại diện PL</button>
            <button>Loại hình KH</button>
            <button>QL hạn mức</button>
            <button>TSĐB</button>
          </div>

          <div className={styles.tabContent}>
            <p>Mock dữ liệu của tab Chữ ký.</p>
          </div>

          <div className={styles.modalFooter}>
            {modalMode === 'view' ? (
              <Button variant="secondary" onClick={() => setIsOpenModal(false)}>
                Đóng
              </Button>
            ) : modalMode === 'approve' ? (
              <>
                <Button variant="secondary" onClick={() => setIsOpenModal(false)}>
                  Hủy
                </Button>
                <Button variant="primary" onClick={handleApprove}>
                  <Check size={16} />
                  Duyệt
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setIsOpenModal(false)}>
                  Hủy
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  {modalMode === 'create' ? 'Lưu' : 'Cập nhật'}
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}