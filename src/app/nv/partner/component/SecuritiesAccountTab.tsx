"use client";

import Button from "@/components/shared/Button/Button";
import styles from "./SecuritiesAccountTab.module.css";
import { useState, useEffect } from "react";
import Table, { TableColumn } from "@/components/shared/Table/Table";
import Modal from "@/components/shared/Modal/Modal";
import Input from "@/components/shared/Input/Input";
import Select, { SelectOption } from "@/components/shared/Select/Select";
import { useNotification } from "@/hooks/useNotification";
import { SecuritiesAccountFormData } from "@/types/funding.types";
import apiClient from "@/lib/api/client";
import { getStatusDisplay } from "@/constants/status";

const INITIAL_FORM: SecuritiesAccountFormData = {
  accountNumber: "",
  accountName: "",
  tradingGateways: "",
  status: "ACTIVE",
};

const STATUS_OPTIONS: SelectOption[] = [
  { label: getStatusDisplay("ACTIVE").label, value: "ACTIVE" },
  { label: getStatusDisplay("INACTIVE").label, value: "INACTIVE" },
];

export default function SecuritiesAccountTab({ partnerId, isView }: { partnerId: string; isView?: boolean }) {
  const [accounts, setAccounts] = useState<SecuritiesAccountFormData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SecuritiesAccountFormData>(INITIAL_FORM);

  const { notifyError, notifyWarning, notifySuccess } = useNotification();
  const startIndex = (currentPage - 1) * pageSize;

  const fetchAccounts = async () => {
    try {
      const res = await apiClient.get(`/v1/capital-source/partners/${partnerId}/securities-accounts?page=${currentPage - 1}&size=${pageSize}`);
      const payload = res.data?.data || res.data;
      if (payload && payload.content !== undefined) {
        setAccounts(payload.content || []);
        setTotalItems(payload.totalElements || 0);
        setTotalPages(payload.totalPages || 1);
      } else if (Array.isArray(payload)) {
        setAccounts(payload);
        setTotalItems(payload.length);
        setTotalPages(1);
      } else {
        setAccounts([]);
      }
    } catch (error: any) {
      console.error("Fetch accounts error:", error);
      notifyError("Lỗi", "Không thể tải danh sách tài khoản CK!");
    }
  };

  useEffect(() => {
    if (partnerId) {
      fetchAccounts();
    }
  }, [partnerId, currentPage]);

  const handleChange = (field: keyof SecuritiesAccountFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenCreate = () => {
    setFormData({ ...INITIAL_FORM });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SecuritiesAccountFormData) => {
    setFormData({
      accountNumber: item.accountNumber || "",
      accountName: item.accountName || "",
      tradingGateways: item.tradingGateways || "",
      status: item.status || "ACTIVE",
    });
    setEditingId(item.id || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setFormData({ ...INITIAL_FORM });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const validateForm = (): boolean => {
    if (!formData.accountNumber.trim()) {
      notifyWarning("Cảnh báo", "Vui lòng nhập số tài khoản");
      return false;
    }
    if (!formData.accountName.trim()) {
      notifyWarning("Cảnh báo", "Vui lòng nhập tên tài khoản");
      return false;
    }
    if (!formData.status) {
      notifyWarning("Cảnh báo", "Vui lòng chọn trạng thái");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const payload = {
        accountNumber: formData.accountNumber.trim(),
        accountName: formData.accountName.trim(),
        tradingGateways: formData.tradingGateways.trim(),
        status: formData.status,
      };

      if (editingId) {
        await apiClient.put(`/v1/capital-source/partners/${partnerId}/securities-accounts/${editingId}`, payload);
        notifySuccess("Thành công", "Đã cập nhật TK chứng khoán");
      } else {
        await apiClient.post(`/v1/capital-source/partners/${partnerId}/securities-accounts`, payload);
        notifySuccess("Thành công", "Đã thêm TK chứng khoán mới");
      }

      handleCloseModal();
      setCurrentPage(1);
      await fetchAccounts();
    } catch (error: any) {
      console.error("Save account error:", error);
      notifyError("Lỗi", "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (id?: string) => {
    if (!id) return;
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;

    try {
      await apiClient.delete(`/v1/capital-source/partners/${partnerId}/securities-accounts/${id}`);
      notifySuccess("Thành công", "Đã gửi yêu cầu xóa TK chứng khoán");
      await fetchAccounts();
    } catch (error: any) {
      console.error("Delete account error:", error);
      notifyError("Lỗi", "Không thể xóa tài khoản");
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: TableColumn<SecuritiesAccountFormData>[] = [
    {
      key: "stt",
      title: "STT",
      render: (_, __, index) => startIndex + index + 1,
    },
    {
      key: "accountNumber",
      title: "Số tài khoản",
    },
    {
      key: "accountName",
      title: "Tên tài khoản",
    },
    {
      key: "tradingGateways",
      title: "Cổng đặt lệnh",
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (value) => {
        const option = STATUS_OPTIONS.find((item) => item.value === String(value));
        return option?.label ?? String(value);
      },
    },
    {
      key: "action",
      title: "Hành động",
      render: (_, row) => (
        <div className={styles.actionButtons}>
          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(row)}>
            Sửa
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteAccount(row.id)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>DANH SÁCH TÀI KHOẢN CHỨNG KHOÁN</h2>
        {!isView && <Button variant="primary" onClick={handleOpenCreate}>
          Thêm mới
        </Button>}
      </div>

      <div className={styles.table}>
        <Table
          columns={columns}
          data={accounts}
          rowKey={(row) => row.id || row.accountNumber}
          emptyText="Không có dữ liệu tài khoản chứng khoán"
        />
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingId ? "CẬP NHẬT TÀI KHOẢN" : "THÊM MỚI TÀI KHOẢN"}
          size="md"
          closeOnOverlayClick={!saving}
        >
          <div className={styles.signatureForm}>
            <div className={styles.formGrid}>
              <Input
                label="Số tài khoản"
                value={formData.accountNumber}
                onChange={(e) => handleChange("accountNumber", e.target.value)}
                disabled={saving}
                required
                fullWidth
              />

              <Input
                label="Tên tài khoản"
                value={formData.accountName}
                onChange={(e) => handleChange("accountName", e.target.value)}
                disabled={saving}
                required
                fullWidth
              />

              <Input
                label="Cổng đặt lệnh"
                value={formData.tradingGateways}
                onChange={(e) => handleChange("tradingGateways", e.target.value)}
                disabled={saving}
                fullWidth
              />

              <Select
                label="Trạng thái"
                value={formData.status}
                onChange={(value) => handleChange("status", value)}
                options={STATUS_OPTIONS}
                disabled={saving}
                required
                fullWidth
              />
            </div>

            <div className={styles.formActions}>
              <Button type="button" variant="outline" onClick={handleCloseModal} disabled={saving}>
                Hủy bỏ
              </Button>
              <Button type="button" variant="primary" onClick={handleSave} isLoading={saving}>
                Lưu
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} của {totalItems} bản ghi
        </div>
        <div className={styles.paginationButtons}>
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={handlePrevPage}
          >
            &lt;
          </button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.pageBtn} ${currentPage === page ? styles.active : ""}`}
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
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
