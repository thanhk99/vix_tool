'use client';

import { useEffect, useState, useMemo } from 'react';
import styles from './PartnerList.module.css';
import Button from '@/components/shared/Button/Button';
import Table, { TableColumn } from '@/components/shared/Table/Table';
import Input from '@/components/shared/Input/Input';
import { CreatePartnerRequest, PartnersItem } from '@/types/funding.types';
import apiClient from '@/lib/api/client';
import { ChevronLeft, ChevronRight, Pen, Search, Trash2, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useNotification } from '@/hooks/useNotification';
import { useRouter } from 'next/navigation';
import Modal from '@/components/shared/Modal/Modal';

export default function PartnerList() {
  const [partners, setPartners] = useState<PartnersItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { notifyError, notifySuccess, notifyWarning, notifyInfo } = useNotification();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const filteredPartners = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();
    if (!keyword) return partners;
    
    return partners.filter(item =>
      item.cusId?.toLowerCase().includes(keyword) ||
      item.cusName?.toLowerCase().includes(keyword) ||
      item.branchCusId?.toLowerCase().includes(keyword) ||
      item.idCode?.toLowerCase().includes(keyword) ||
      item.email?.toLowerCase().includes(keyword)
    );
  }, [partners, searchKeyword]);

  // Du lieu cho them moi doi tac
  const [formData, setFormData] = useState<CreatePartnerRequest>({
    cusId: "",
    branchCusId: "",
    cusName: "",
    shortName: "",
    address: "",
    idCode: "",
    fistIssueDate: "",
    lastIssueDate: "",
    issueBy: "",
    changeCount: 0,
    opLiscenseNo: "",
    opIssueDate: "",
    mobile: "",
    email: "",
    website: "",
    cusType: "",
    businessType: "",
    professionalInvestor: false,
    professionalStartDate: "",
    professionalEndDate: "",
    status: "ACTIVE",
});
  const userId = useAuthStore((state) => state.userId);

  // Tinh toan cho phan trang
  const totalItems = filteredPartners.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredPartners.slice(startIndex, startIndex + pageSize);
  // Router 
  const router = useRouter();
  
  // Click row
  const [selectedPartner, setSelectedPartner] = useState<PartnersItem | null>(null);
  // GET
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/v1/capital-source/partners");
      const data = Array.isArray(res) ? res : (res?.data || []);
      setPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      notifyError('Lỗi', 'Không tải được dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword]);

  // Xu ly tim kiem
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
  };

  // getStatusClass 
  const STATUS_CLASS = {
    ACTIVE: styles.active,
    PENDING: styles.pending,
    INACTIVE: styles.inactive,
  };

  const getStatusClass = (status: string) => STATUS_CLASS[status as keyof typeof STATUS_CLASS] ?? "";

  // Định nghĩa các cột cho table
  const columns: TableColumn<PartnersItem>[] = [
    {
      key: "stt",
      title: "STT",
      width:40,
      render: (_, __, index) => startIndex + index + 1,
    },
    {
      key: "cusId",
      title: "Mã KH",
      width:100
    },
    {
      key: "branchCusId",
      title: "Mã đơn vị GD",
      width:120
    },
    {
      key: "cusName",
      title: "Tên KH",
      width:300
    },
    {
      key: "idCode",
      title: "Số ĐKKD/CCCD",
      width:120

    },
    {
      key: "fistIssueDate",
      title: "Ngày cấp lần đầu",
      width:120
    },
    {
      key: "lastIssueDate",
      title: "Ngày cấp cuối",
      width:120
    },
    {
      key: "issueBy",
      title: "Nơi cấp",
      width:100
    },
    {
      key: "opLiscenseNo",
      title: "GP hoạt động",
      width: 100

    },
    {
      key: "opIssueDate",
      title: "Ngày cấp",
      width:120
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (value) => (
        <span className={`${styles.status} ${getStatusClass(value as string) ?? ""}`}>
          {value as string}
        </span>
      ),
      width:100
    },
    {
      key: "lastUpdated",
      title: "Ngày chỉnh sửa",
      width: 120
    },
    {
      key: "updatedBy",
      title: "User thực hiện",
      width:120
    },
    {
      key: "actions",
      title: "Thao tác",
      width: 50,
      render: (_, record) => (
        <div className={styles.actionButtons}>
          {/* <Button variant="outline" size="sm" onClick={() => router.push(`/nv/partner/edit/${record.id}`)} >Sửa</Button>
          <Button variant="danger" size="sm" style={{ marginLeft: 3 }}>Xóa</Button> */}
          <Pen size={18} className={styles.pen} onClick={() => router.push(`/nv/partner/edit/${record.id}`)}/>
          <Trash2 size={18} className={styles.delete}/>
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

  // POST
  const handleCreatePartner = async () => {
    try {
      setLoading(true);
      const payload = {
        id: crypto.randomUUID(),
        ...formData,
        createdBy: userId,
        updatedBy: userId,
        lastUpdated: new Date().toISOString().split("T")[0],
      };
      await apiClient.post("/v1/capital-source/partners", payload);
      fetchPartners();
    } catch (error){
      notifyError('Lỗi', 'Không tải được dữ liệu');
      notifyError("Lỗi", "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  }

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
            Làm mới
          </Button>
          <Button variant='primary' onClick={() => setIsOpenModal(true)}>
            Thêm mới
          </Button>

          <Button variant='primary' disabled={!selectedPartner}
          onClick={() => {
            if(!selectedPartner) return;
            router.push(`/nv/partner/view/${selectedPartner.id}`)
          }}>Xem</Button>

          <Button variant='primary' disabled={!selectedPartner}
            onClick={() => {
              if(!selectedPartner) return;
            }}
          >Xóa</Button>
        </div>
      </div>
      
      {/*Table */}
      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          data={currentData}
          rowKey="id"
          isLoading={loading}
          onRowClick={(partners) => setSelectedPartner(partners)}
        />
      </div>
      
      {/*Modal */}
      {isOpenModal && (
          <Modal
              isOpen={isOpenModal}
              onClose={() => setIsOpenModal(false)}
              title="Thêm mới đối tác"
              size="lg"
              footer={
                  <>
                      <Button
                          variant="outline"
                          onClick={() => setIsOpenModal(false)}
                      >
                          Hủy
                      </Button>

                      <Button
                          variant="primary"
                          onClick={handleCreatePartner}
                      >
                          Lưu
                      </Button>
                  </>
              }
          >
              <div className={styles.formGrid}>

                  {/* Mã KH */}
                  <Input
                      label="Mã KH"
                      value={formData.cusId}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              cusId: e.target.value,
                          })
                      }
                  />

                  {/* Mã đơn vị GD */}
                  <Input
                      label="Mã đơn vị GD"
                      value={formData.branchCusId}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              branchCusId: e.target.value,
                          })
                      }
                  />

                  {/* Tên KH */}
                  <Input
                      label="Tên KH"
                      value={formData.cusName}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              cusName: e.target.value,
                          })
                      }
                  />

                  {/* Tên viết tắt */}
                  <Input
                      label="Tên viết tắt"
                      value={formData.shortName}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              shortName: e.target.value,
                          })
                      }
                  />

                  {/* Địa chỉ */}
                  <Input
                      label="Địa chỉ"
                      value={formData.address}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              address: e.target.value,
                          })
                      }
                  />

                  {/* Số ĐKKD/CCCD */}
                  <Input
                      label="Số ĐKKD/CCCD"
                      value={formData.idCode}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              idCode: e.target.value,
                          })
                      }
                  />

                  {/* Ngày cấp lần đầu */}
                  <Input
                      label="Ngày cấp lần đầu"
                      type="date"
                      value={formData.fistIssueDate}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              fistIssueDate: e.target.value,
                          })
                      }
                  />

                  {/* Ngày cấp cuối */}
                  <Input
                      label="Ngày cấp cuối"
                      type="date"
                      value={formData.lastIssueDate}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              lastIssueDate: e.target.value,
                          })
                      }
                  />

                  {/* Nơi cấp */}
                  <Input
                      label="Nơi cấp"
                      value={formData.issueBy}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              issueBy: e.target.value,
                          })
                      }
                  />

                  {/* Số lần thay đổi */}
                  <Input
                      label="Số lần thay đổi"
                      type="number"
                      value={formData.changeCount}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              changeCount: Number(e.target.value),
                          })
                      }
                  />

                  {/* Giấy phép hoạt động */}
                  <Input
                      label="Giấy phép hoạt động"
                      value={formData.opLiscenseNo}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              opLiscenseNo: e.target.value,
                          })
                      }
                  />

                  {/* Ngày cấp giấy phép */}
                  <Input
                      label="Ngày cấp giấy phép"
                      type="date"
                      value={formData.opIssueDate}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              opIssueDate: e.target.value,
                          })
                      }
                  />

                  {/* Số điện thoại */}
                  <Input
                      label="Số điện thoại"
                      value={formData.mobile}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              mobile: e.target.value,
                          })
                      }
                  />

                  {/* Email */}
                  <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              email: e.target.value,
                          })
                      }
                  />

                  {/* Website */}
                  <Input
                      label="Website"
                      value={formData.website}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              website: e.target.value,
                          })
                      }
                  />

                  {/* Loại khách hàng */}
                  <Input
                      label="Loại khách hàng"
                      value={formData.cusType}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              cusType: e.target.value,
                          })
                      }
                  />

                  {/* Loại hình kinh doanh */}
                  <Input
                      label="Loại hình kinh doanh"
                      value={formData.businessType}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              businessType: e.target.value,
                          })
                      }
                  />

                  {/* Nhà đầu tư chuyên nghiệp */}
                  <div className={styles.checkboxField}>
                      <label>
                          <input
                              type="checkbox"
                              checked={formData.professionalInvestor}
                              onChange={(e) =>
                                  setFormData({
                                      ...formData,
                                      professionalInvestor:
                                          e.target.checked,
                                  })
                              }
                          />

                          <span>
                              Nhà đầu tư chuyên nghiệp
                          </span>
                      </label>
                  </div>

                  {/* Ngày bắt đầu NĐT chuyên nghiệp */}
                  <Input
                      label="Ngày bắt đầu NĐT chuyên nghiệp"
                      type="date"
                      value={formData.professionalStartDate}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              professionalStartDate: e.target.value,
                          })
                      }
                  />

                  {/* Ngày kết thúc NĐT chuyên nghiệp */}
                  <Input
                      label="Ngày kết thúc NĐT chuyên nghiệp"
                      type="date"
                      value={formData.professionalEndDate}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              professionalEndDate: e.target.value,
                          })
                      }
                  />

                  {/* Trạng thái */}
                  <Input
                      label="Trạng thái"
                      value={formData.status}
                      onChange={(e) =>
                          setFormData({
                              ...formData,
                              status: e.target.value,
                          })
                      }
                  />

              </div>
          </Modal>
      )}

      {/* PHÂN TRANG */}
      {totalItems > 0 && (
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} của {totalItems} bản ghi
            {searchKeyword && ` (kết quả tìm kiếm)`}
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
              <h3>THÔNG TIN ĐỐI TÁC</h3>
              <button
                type="button"
                onClick={() => setSelectedPartner(null)}
                className={styles.closeDetail}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.detailGrid3Col}>
              <div className={styles.detailItem}>
                <span>Mã KH</span>
                <strong>{selectedPartner.cusId || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Mã đơn vị GD</span>
                <strong>{selectedPartner.branchCusId || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Tên KH</span>
                <strong>{selectedPartner.cusName || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Tên viết tắt</span>
                <strong>{selectedPartner.shortName || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Số ĐKKD/CCCD</span>
                <strong>{selectedPartner.idCode || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Địa chỉ</span>
                <strong>{selectedPartner.address || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Ngày cấp lần đầu</span>
                <strong>{selectedPartner.fistIssueDate || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Ngày cấp cuối</span>
                <strong>{selectedPartner.lastIssueDate || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Nơi cấp</span>
                <strong>{selectedPartner.issueBy || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Giấy phép hoạt động</span>
                <strong>{selectedPartner.opLiscenseNo || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Ngày cấp giấy phép</span>
                <strong>{selectedPartner.opIssueDate || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Số điện thoại</span>
                <strong>{selectedPartner.mobile || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Email</span>
                <strong>{selectedPartner.email || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Website</span>
                <strong>{selectedPartner.website || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Loại khách hàng</span>
                <strong>{selectedPartner.cusType || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Loại hình kinh doanh</span>
                <strong>{selectedPartner.businessType || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Nhà đầu tư chuyên nghiệp</span>
                <strong>
                  {selectedPartner.professionalInvestor ? "Có" : "Không"}
                </strong>
              </div>

              <div className={styles.detailItem}>
                <span>Ngày bắt đầu NĐT chuyên nghiệp</span>
                <strong>
                  {selectedPartner.professionalStartDate || "-"}
                </strong>
              </div>

              <div className={styles.detailItem}>
                <span>Ngày kết thúc NĐT chuyên nghiệp</span>
                <strong>
                  {selectedPartner.professionalEndDate || "-"}
                </strong>
              </div>

              <div className={styles.detailItem}>
                <span>Trạng thái</span>
                <strong className={`${styles.statusText} ${getStatusClass(selectedPartner.status)}`}>
                  {selectedPartner.status || "-"}
                </strong>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI - Thông tin quản lý */}
          <div className={styles.detailColumn}>
            <div className={styles.detailSectionTitle}>
              <h4>THÔNG TIN QUẢN LÝ</h4>
            </div>
            <div className={styles.detailItem}>
              <span>Ngày chỉnh sửa</span>
              <strong>{selectedPartner.lastUpdated || "-"}</strong>
            </div>
            <div className={styles.detailItem}>
              <span>User thực hiện</span>
              <strong>{selectedPartner.updatedBy || "-"}</strong>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}