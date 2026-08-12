'use client';

import { useEffect, useState, useMemo } from 'react';
import styles from './PartnerList.module.css';
import Button from '@/components/shared/Button/Button';
import Table, { TableColumn } from '@/components/shared/Table/Table';
import Input from '@/components/shared/Input/Input';
import { CreatePartnerRequest, PartnersItem } from '@/types/funding.types';
import apiClient from '@/lib/api/client';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
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
      width: 60,
      render: (_, __, index) => startIndex + index + 1,
    },
    {
      key: "cusId",
      title: "Mã KH",
    },
    {
      key: "branchCusId",
      title: "Mã đơn vị GD",
    },
    {
      key: "cusName",
      title: "Tên KH",
    },
    {
      key: "idCode",
      title: "Số ĐKKD/CCCD",
    },
    {
      key: "fistIssueDate",
      title: "Ngày cấp lần đầu",
    },
    {
      key: "lastIssueDate",
      title: "Ngày cấp cuối",
    },
    {
      key: "issueBy",
      title: "Nơi cấp",
    },
    {
      key: "opLiscenseNo",
      title: "GP hoạt động",
    },
    {
      key: "opIssueDate",
      title: "Ngày cấp",
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (value) => (
        <span className={`${styles.status} ${getStatusClass(value as string) ?? ""}`}>
          {value as string}
        </span>
      ),
    },
    {
      key: "lastUpdated",
      title: "Ngày chỉnh sửa",
    },
    {
      key: "updatedBy",
      title: "User thực hiện",
    },
    {
      key: "actions",
      title: "Thao tác",
      width: 150,
      render: (_, record) => (
        <div className={styles.actionButtons}>
          <Button variant="outline" size="sm" onClick={() => router.push(`/nv/partner/edit/${record.id}`)} >Sửa</Button>
          <Button variant="danger" size="sm" style={{ marginLeft: 3 }}>Xóa</Button>
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
        </div>
      </div>
      
      {/*Table */}
      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          data={currentData}
          rowKey="id"
          isLoading={loading}
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
    </div>
  );
}