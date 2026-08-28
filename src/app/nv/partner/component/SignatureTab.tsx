"use client";

import Button from "@/components/shared/Button/Button";
import styles from "./SignatureTab.module.css";
import { useState, useEffect } from "react";
import Table, { TableColumn } from "@/components/shared/Table/Table";
import Modal from "@/components/shared/Modal/Modal";
import Input from "@/components/shared/Input/Input";
import Select, { SelectOption } from "@/components/shared/Select/Select";
import { useNotification } from "@/hooks/useNotification";
import { SignatureFormData } from "@/types/funding.types";
import { signatureApi } from "@/lib/api/signature.api";
import { getStatusDisplay } from "@/constants/status";
import { Eye, FileText, Image as ImageIcon } from "lucide-react";


const INITIAL_FORM: SignatureFormData = {
  signFileName: "",
  signType: "",
  description: "",
  effectiveDate: "",
  expiryDate: "",
  status: "ACTIVE",
};

const SIGNATURE_TYPE_OPTIONS: SelectOption[] = [
  { label: "Chữ ký số", value: "DIGITAL" },
  { label: "Chữ ký điện tử", value: "ELECTRONIC" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { label: getStatusDisplay("ACTIVE").label, value: "ACTIVE" },
  { label: getStatusDisplay("INACTIVE").label, value: "INACTIVE" },
];

export default function SignatureTab({ partnerId, isView }: { partnerId: string; isView?: boolean }) {
  const [signatures, setSignatures] = useState<SignatureFormData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SignatureFormData>(INITIAL_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  // Modal Xem trước chữ ký
  const [previewItem, setPreviewItem] = useState<SignatureFormData | null>(null);

  const { notifyError, notifyWarning, notifySuccess } = useNotification();
  const startIndex = (currentPage - 1) * pageSize;

  // Lấy danh sách chữ ký từ backend
  const fetchSignatures = async () => {
    try {
      const res = await signatureApi.getSignatures(partnerId, currentPage - 1, pageSize);
      const payload = res.data?.data || res.data;
      if (payload && payload.content !== undefined) {
        setSignatures(payload.content || []);
        setTotalItems(payload.totalElements || 0);
        setTotalPages(payload.totalPages || 1);
      } else if (Array.isArray(payload)) {
        setSignatures(payload);
        setTotalItems(payload.length);
        setTotalPages(1);
      } else {
        setSignatures([]);
      }
    } catch (error: any) {
      console.error("Fetch signatures error:", error);
      notifyError("Lỗi", "Không thể tải danh sách chữ ký!");
    }
  };

  useEffect(() => {
    if (partnerId) {
      fetchSignatures();
    }
  }, [partnerId, currentPage]);

  // Clean up object URL khi unmount hoặc đổi tệp
  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const handleChange = (field: keyof SignatureFormData, value: string) => {
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

  const handleOpenEdit = (item: SignatureFormData) => {
    setFormData({
      signFileName: item.signFileName || "",
      signType: item.signType || "",
      description: item.description || "",
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

  const handleOpenPreview = async (item: SignatureFormData) => {
    try {
      if (item.id) {
        const res: any = await signatureApi.getSignaturePreviewUrl(partnerId, item.id);
        const url = res?.data?.data || res?.data || (typeof res === 'string' ? res : null);
        
        if (url && typeof url === 'string') {
          // Bỏ qua nếu backend trả về mock data "dummy-url"
          if (url === 'dummy-url' || url.includes('dummy')) {
            throw new Error("Backend trả về URL giả (dummy-url)");
          }

          // Presigned URL của MinIO/S3 tự xác thực qua X-Amz-Signature trong query string
          // KHÔNG thêm bất kỳ Authorization header nào, sẽ gây 400 Bad Request
          const fetchRes = await fetch(url);
          if (!fetchRes.ok) throw new Error("Fetch failed: " + fetchRes.statusText);
          const blob = await fetchRes.blob();
          const objectUrl = URL.createObjectURL(blob);
          setPreviewItem({ ...item, fileUrl: objectUrl, fileType: blob.type });
          return;
        }
      }
      setPreviewItem(item);
    } catch (error) {
      console.error("Lỗi lấy URL xem trước chữ ký:", error);
      setPreviewItem(item); // Vẫn mở với các thông tin cơ bản
    }
  };

  const handleClosePreview = () => {
    if (previewItem?.fileUrl && previewItem.fileUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewItem.fileUrl);
    }
    setPreviewItem(null);
  };

  const validateForm = (): boolean => {
    if (!formData.signFileName.trim()) {
      notifyWarning("Cảnh báo", "Vui lòng chọn file chữ ký");
      return false;
    }
    if (!formData.signType) {
      notifyWarning("Cảnh báo", "Vui lòng chọn loại chữ ký");
      return false;
    }
    if (!formData.effectiveDate) {
      notifyWarning("Cảnh báo", "Vui lòng chọn ngày hiệu lực");
      return false;
    }
    if (formData.expiryDate && new Date(formData.expiryDate) <= new Date(formData.effectiveDate)) {
      notifyWarning("Cảnh báo", "Ngày hết hạn phải sau ngày hiệu lực");
      return false;
    }
    if (!formData.status) {
      notifyWarning("Cảnh báo", "Vui lòng chọn trạng thái");
      return false;
    }
    return true;
  };

  // Lưu chữ ký (Thêm mới hoặc Cập nhật)
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const payload: SignatureFormData = {
        signFileName: formData.signFileName.trim(),
        signType: formData.signType,
        description: formData.description.trim(),
        effectiveDate: formData.effectiveDate,
        expiryDate: formData.expiryDate,
        status: formData.status,
      };

      if (editingId) {
        await signatureApi.updateSignature(partnerId, editingId, payload, selectedFile);
        notifySuccess("Thành công", "Đã cập nhật chữ ký");
      } else {
        await signatureApi.createSignature(partnerId, payload, selectedFile);
        notifySuccess("Thành công", "Đã thêm chữ ký mới");
      }

      handleCloseModal();
      setCurrentPage(1);
      await fetchSignatures();
    } catch (error: any) {
      console.error("Save signature error:", error);
      const errorMessage = error?.message || error?.response?.data?.message || (editingId ? "Không thể cập nhật chữ ký" : "Không thể thêm chữ ký");
      notifyError("Lỗi", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Xóa chữ ký
  const handleDeleteSignature = async (id?: string) => {
    if (!id) return;
    if (!confirm("Bạn có chắc chắn muốn xóa chữ ký này?")) return;

    try {
      await signatureApi.deleteSignature(partnerId, id);
      notifySuccess("Thành công", "Đã gửi yêu cầu xóa chữ ký");
      await fetchSignatures();
    } catch (error: any) {
      console.error("Delete signature error:", error);
      notifyError("Lỗi", "Không thể xóa chữ ký");
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

  // Kiểm tra file preview có phải hình ảnh không
  const isImageFile = (signFileName: string, url?: string | null, fileType?: string) => {
    if (fileType && fileType.startsWith('image/')) return true;
    const name = (signFileName || url || "").toLowerCase();
    return name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".webp") || name.endsWith(".gif");
  };

  // Kiểm tra file preview có phải PDF không
  const isPdfFile = (signFileName: string, url?: string | null, fileType?: string) => {
    if (fileType === 'application/pdf') return true;
    const name = (signFileName || url || "").toLowerCase();
    return name.endsWith(".pdf");
  };

  const columns: TableColumn<SignatureFormData>[] = [
    {
      key: "stt",
      title: "STT",
      render: (_, __, index) => startIndex + index + 1,
    },
    {
      key: "signFileName",
      title: "Tên file",
    },
    {
      key: "signType",
      title: "Loại chữ ký",
      render: (value) => {
        const option = SIGNATURE_TYPE_OPTIONS.find((item) => item.value === String(value));
        return option?.label ?? String(value);
      },
    },
    {
      key: "description",
      title: "Mô tả",
    },
    {
      key: "effectiveDate",
      title: "Ngày hiệu lực",
    },
    {
      key: "expiryDate",
      title: "Ngày hết hạn",
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
          <Button variant="outline" size="sm" onClick={() => handleOpenPreview(row)}>
            <Eye size={14} style={{ marginRight: 4 }} /> Xem
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(row)}>
            Sửa
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteSignature(row.id)}
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
        <h2 className={styles.title}>DANH SÁCH CHỮ KÝ</h2>
        {!isView && <Button variant="primary" onClick={handleOpenCreate}>
          Thêm mới
        </Button>}
      </div>

      <div className={styles.table}>
        <Table
          columns={columns}
          data={signatures}
          rowKey={(row) => row.id || row.signFileName}
          emptyText="Không có dữ liệu chữ ký"
        />
      </div>

      {/* Modal Xem trước chữ ký */}
      {previewItem && (
        <Modal
          isOpen={!!previewItem}
          onClose={handleClosePreview}
          title={`XEM TRƯỚC CHỮ KÝ - ${previewItem.signFileName}`}
          size="lg"
        >
          <div className={styles.previewContainer}>
            <div className={styles.previewBox}>
              {previewItem.fileUrl ? (
                isImageFile(previewItem.signFileName, previewItem.fileUrl, previewItem.fileType) ? (
                  <img
                    src={previewItem.fileUrl}
                    alt="Preview Chữ ký"
                    className={styles.previewImage}
                  />
                ) : isPdfFile(previewItem.signFileName, previewItem.fileUrl, previewItem.fileType) ? (
                  <iframe
                    src={previewItem.fileUrl}
                    title="PDF Preview"
                    className={styles.previewIframe}
                  />
                ) : (
                  <div className={styles.previewPlaceholder}>
                    <FileText size={48} color="#6b7280" />
                    <span>{previewItem.signFileName}</span>
                    <a
                      href={previewItem.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--primary)", textDecoration: "underline", marginTop: 8 }}
                    >
                      Tải về / Mở tệp trong cửa sổ mới
                    </a>
                  </div>
                )
              ) : (
                <div className={styles.previewPlaceholder}>
                  {isImageFile(previewItem.signFileName, undefined, previewItem.fileType) ? (
                    <ImageIcon size={48} color="#6b7280" />
                  ) : (
                    <FileText size={48} color="#6b7280" />
                  )}
                  <span>Xem trước file chữ ký: <strong>{previewItem.signFileName}</strong></span>
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>
                    (Tệp tin đã tải lên thành công trên hệ thống)
                  </span>
                </div>
              )}
            </div>

            {/* Thông tin chi tiết */}
            <div className={styles.previewMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Tên tệp:</span>
                <span className={styles.metaValue}>{previewItem.signFileName}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Loại chữ ký:</span>
                <span className={styles.metaValue}>
                  {SIGNATURE_TYPE_OPTIONS.find((opt) => opt.value === previewItem.signType)?.label || previewItem.signType}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Ngày hiệu lực:</span>
                <span className={styles.metaValue}>{previewItem.effectiveDate || "---"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Ngày hết hạn:</span>
                <span className={styles.metaValue}>{previewItem.expiryDate || "---"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Trạng thái:</span>
                <span className={styles.metaValue}>
                  {STATUS_OPTIONS.find((opt) => opt.value === previewItem.status)?.label || previewItem.status}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Mô tả:</span>
                <span className={styles.metaValue}>{previewItem.description || "---"}</span>
              </div>
            </div>

            <div className={styles.formActions} style={{ width: "100%" }}>
              <Button type="button" variant="primary" onClick={handleClosePreview}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingId ? "CẬP NHẬT CHỮ KÝ" : "THÊM MỚI CHỮ KÝ"}
          size="md"
          closeOnOverlayClick={!saving}
        >
          <div className={styles.signatureForm}>
            <div className={styles.formGrid}>
              {/* Tên file */}
              <div className={styles.fileInputWrapper}>
                <label className={styles.fileInputLabel}>
                  Tên file <span>*</span>
                </label>
                <div className={styles.fileInputBox}>
                  <label htmlFor="signature-file" className={styles.fileChooseButton}>
                    Chọn tệp
                  </label>
                  <span className={styles.signFileName}>
                    {formData.signFileName || "Chưa có tệp nào được chọn"}
                  </span>
                  <input
                    id="signature-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setFormData((prev) => ({
                          ...prev,
                          signFileName: file.name,
                        }));
                        if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
                        setLocalPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    disabled={saving}
                    className={styles.hiddenFileInput}
                  />
                </div>

                {/* Xem trước thumbnail tệp tin vừa chọn */}
                {localPreviewUrl && (
                  <div className={styles.filePreviewThumb}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#4b5563" }}>Xem trước tệp chọn:</span>
                    {isImageFile(formData.signFileName, localPreviewUrl) ? (
                      <img src={localPreviewUrl} alt="Thumbnail preview" className={styles.thumbImage} />
                    ) : isPdfFile(formData.signFileName, localPreviewUrl) ? (
                      <iframe
                        src={localPreviewUrl}
                        title="PDF Preview"
                        className={styles.thumbIframe}
                      />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                        <FileText size={20} color="#2563eb" />
                        <span>{formData.signFileName}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Loại chữ ký */}
              <Select
                label="Loại chữ ký"
                value={formData.signType}
                onChange={(value) => handleChange("signType", value)}
                options={SIGNATURE_TYPE_OPTIONS}
                placeholder="-- Chọn loại chữ ký --"
                disabled={saving}
                required
                fullWidth
              />

              {/* Mô tả */}
              <Input
                label="Mô tả"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Nhập mô tả"
                disabled={saving}
                fullWidth
              />

              {/* Ngày hiệu lực */}
              <Input
                label="Ngày hiệu lực"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => handleChange("effectiveDate", e.target.value)}
                disabled={saving}
                required
                fullWidth
              />

              {/* Ngày hết hạn */}
              <Input
                label="Ngày hết hạn"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleChange("expiryDate", e.target.value)}
                disabled={saving}
                fullWidth
              />

              {/* Trạng thái */}
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

            {/* Form actions */}
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

      {/* Phân trang */}
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
              className={`${styles.pageBtn} ${currentPage === page ? styles.pageActive : ""}`}
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