"use client";

import Button from "@/components/shared/Button/Button";
import styles from "./SealTab.module.css";
import { useState, useEffect } from "react";
import Table, { TableColumn } from "@/components/shared/Table/Table";
import Modal from "@/components/shared/Modal/Modal";
import Input from "@/components/shared/Input/Input";
import Select, { SelectOption } from "@/components/shared/Select/Select";
import { useNotification } from "@/hooks/useNotification";
import { SealFormData } from "@/types/funding.types";
import apiClient from "@/lib/api/client";
import { getStatusDisplay } from "@/constants/status";
import { Eye, FileText, Image as ImageIcon } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { formatDate } from "@/utils/format";


const INITIAL_FORM: SealFormData = {
  sealFileName: "",
  effectiveDate: "",
  expiryDate: "",
  status: "ACTIVE",
};

const STATUS_OPTIONS: SelectOption[] = [
  { label: getStatusDisplay("ACTIVE").label, value: "ACTIVE" },
  { label: getStatusDisplay("INACTIVE").label, value: "INACTIVE" },
];

export default function SealTab({ partnerId, isView }: { partnerId: string; isView?: boolean }) {
  const [seals, setSeals] = useState<SealFormData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SealFormData>(INITIAL_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const [previewItem, setPreviewItem] = useState<SealFormData | null>(null);

  const { notifyError, notifyWarning, notifySuccess } = useNotification();
  const startIndex = (currentPage - 1) * pageSize;

  const fetchSeals = async () => {
    try {
      const res = await apiClient.get(`/v1/capital-source/partners/${partnerId}/seals?page=${currentPage - 1}&size=${pageSize}`);
      const payload = res.data?.data || res.data;
      if (payload && payload.content !== undefined) {
        setSeals(payload.content || []);
        setTotalItems(payload.totalElements || 0);
        setTotalPages(payload.totalPages || 1);
      } else if (Array.isArray(payload)) {
        setSeals(payload);
        setTotalItems(payload.length);
        setTotalPages(1);
      } else {
        setSeals([]);
      }
    } catch (error: any) {
      console.error("Fetch seals error:", error);
      notifyError("Lỗi", "Không thể tải danh sách con dấu!");
    }
  };

  useEffect(() => {
    if (partnerId) {
      fetchSeals();
    }
  }, [partnerId, currentPage]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const handleChange = (field: keyof SealFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenCreate = () => {
    setFormData({ ...INITIAL_FORM });
    setSelectedFile(null);
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(null);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SealFormData) => {
    setFormData({
      sealFileName: item.sealFileName || "",
      effectiveDate: item.effectiveDate || "",
      expiryDate: item.expiryDate || "",
      status: item.status || "ACTIVE",
    });
    setSelectedFile(null);
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(item.fileUrl || null);
    setEditingId(item.id || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setFormData({ ...INITIAL_FORM });
    setSelectedFile(null);
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(null);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleOpenPreview = async (item: SealFormData) => {
    setPreviewItem(item);
  };

  const handleClosePreview = () => {
    if (previewItem?.fileUrl && previewItem.fileUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewItem.fileUrl);
    }
    setPreviewItem(null);
  };

  const validateForm = (): boolean => {
    if (!formData.sealFileName.trim()) {
      notifyWarning("Cảnh báo", "Vui lòng chọn file con dấu");
      return false;
    }
    if (!formData.effectiveDate) {
      notifyWarning("Cảnh báo", "Vui lòng chọn ngày hiệu lực");
      return false;
    }
    if (formData.expiryDate && formData.expiryDate <= formData.effectiveDate) {
      notifyWarning("Cảnh báo", "Ngày hết hạn phải lớn hơn ngày hiệu lực");
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
        sealFileName: formData.sealFileName.trim(),
        effectiveDate: formData.effectiveDate,
        expiryDate: formData.expiryDate || null,
        status: formData.status,
      };

      if (editingId) {
        await apiClient.put(`/v1/capital-source/partners/${partnerId}/seals/${editingId}`, payload);
        notifySuccess("Thành công", "Đã cập nhật con dấu");
      } else {
        await apiClient.post(`/v1/capital-source/partners/${partnerId}/seals`, payload);
        notifySuccess("Thành công", "Đã thêm con dấu mới");
      }

      handleCloseModal();
      setCurrentPage(1);
      await fetchSeals();
    } catch (error: any) {
      console.error("Save seal error:", error);
      notifyError("Lỗi", "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSeal = async (id?: string) => {
    if (!id) return;
    if (!confirm("Bạn có chắc chắn muốn xóa con dấu này?")) return;

    try {
      await apiClient.delete(`/v1/capital-source/partners/${partnerId}/seals/${id}`);
      notifySuccess("Thành công", "Đã gửi yêu cầu xóa con dấu");
      await fetchSeals();
    } catch (error: any) {
      console.error("Delete seal error:", error);
      notifyError("Lỗi", "Không thể xóa con dấu");
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

  const columns: TableColumn<SealFormData>[] = [
    {
      key: "stt",
      title: "STT",
      render: (_, __, index) => startIndex + index + 1,
    },
    {
      key: "sealFileName",
      title: "Tên file",
    },
    {
      key: "effectiveDate",
      title: "Ngày hiệu lực",
      render: (value) => formatDate(value as string),
    },
    {
      key: "expiryDate",
      title: "Ngày hết hạn",
      render: (value) => formatDate(value as string),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (value) => getStatusDisplay(String(value)).label,
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
            onClick={() => handleDeleteSeal(row.id)}
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
        <h2 className={styles.title}>DANH SÁCH CON DẤU</h2>
        {!isView && <Button variant="primary" onClick={handleOpenCreate}>
          Thêm mới
        </Button>}
      </div>

      <div className={styles.table}>
        <Table
          columns={columns}
          data={seals}
          rowKey={(row) => row.id || row.sealFileName}
          emptyText="Không có dữ liệu con dấu"
        />
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingId ? "CẬP NHẬT CON DẤU" : "THÊM MỚI CON DẤU"}
          size="md"
          closeOnOverlayClick={!saving}
        >
          <div className={styles.signatureForm}>
            <div className={styles.formGrid}>
              <div className={styles.fileInputWrapper}>
                <label className={styles.fileInputLabel}>
                  Tên file <span>*</span>
                </label>
                <div className={styles.fileInputBox}>
                  <label htmlFor="seal-file" className={styles.fileChooseButton}>
                    Chọn tệp
                  </label>
                  <span className={styles.signFileName}>
                    {formData.sealFileName || "Chưa có tệp nào được chọn"}
                  </span>
                  <input
                    id="seal-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setFormData((prev) => ({
                          ...prev,
                          sealFileName: file.name,
                        }));
                      }
                    }}
                    disabled={saving}
                    className={styles.hiddenFileInput}
                  />
                </div>
              </div>

              <Input
                label="Ngày hiệu lực"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => handleChange("effectiveDate", e.target.value)}
                disabled={saving}
                required
                fullWidth
              />

              <Input
                label="Ngày hết hạn"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleChange("expiryDate", e.target.value)}
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
