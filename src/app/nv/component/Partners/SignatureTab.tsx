import { useEffect, useState } from "react";
import styles from "./SignatureTab.module.css";
import apiClient from '@/lib/api/client';
import { useNotification } from '@/hooks/useNotification';
import Modal from "@/components/shared/Modal/Modal";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface SignatureItem {
    id: string;
    fileName: string;
    signatureType: string;
    description: string;
    effectiveDate: string;
    expiryDate: string;
    status: 'Active' | 'Expired' | 'Pending';
    updatedBy: string;
    fileUrl?: string;
}

interface SignatureTabProps {
    partnerId: string;
    isReadOnly?: boolean;
}
export default function SignatureTab ({ partnerId, isReadOnly = false }: SignatureTabProps) {
    // State cho dữ liệu
    const [signatures, setSignatures] = useState<SignatureItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // State cho selection và modal
    const [selectedSignature, setSelectedSignature] = useState<SignatureItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    
    // State cho form và file
    const [formData, setFormData] = useState<Partial<SignatureItem>>({});
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 3;

    const { notifySuccess, notifyError } = useNotification();
    const fetchSignatures = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/v1/capital-source/partners/${partnerId}/signatures`);
            setSignatures(res.data.data || res.data);
        } catch (error) {
            notifyError('Không thể tải danh sách chữ ký');
        } finally {
            setLoading(false);
        }
    };

    // Gọi khi component mount
    useEffect(() => {
        if (partnerId) {
            fetchSignatures();
        }
    }, [partnerId]);

    const totalPage = Math.ceil(signatures.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, signatures.length);
    const paginatedData = signatures.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleOpenCreate = () => {
        setModalMode('create');
        setFormData({});
        setUploadedFile(null);
        setPreviewUrl(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (signature: SignatureItem) => {
        if (isReadOnly) return;
        setModalMode('edit');
        setSelectedSignature(signature);
        setFormData(signature);
        setIsModalOpen(true);
    };

    const handleOpenView = (signature: SignatureItem) => {
        setModalMode('view');
        setSelectedSignature(signature);
        setFormData(signature);
        setIsModalOpen(true);
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const [dragActive, setDragActive] = useState(false);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files) {
            setDragActive(true);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    
    const file = e.dataTransfer.files[0];
        if (file) {
            // Kiểm tra định dạng
            const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                notifyError('Chỉ hỗ trợ JPG, PNG, PDF');
                return;
            }
            // Kiểm tra kích thước (5MB)
            if (file.size > 5 * 1024 * 1024) {
                notifyError('File không được quá 5MB');
                return;
            }
            setUploadedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setFormData(prev => ({ ...prev, fileName: file.name }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setFormData(prev => ({ ...prev, fileName: file.name }));
        }
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        setPreviewUrl(null);
        setFormData(prev => ({ ...prev, fileName: '' }));
    };
    const handleSave = async () => {
        try {
            const submitData = { ...formData };
            if (uploadedFile) {
                submitData.fileUrl = URL.createObjectURL(uploadedFile);
            }
            
            if (modalMode === 'create') {
                await apiClient.post(`/v1/capital-source/partners/${partnerId}/signatures`, submitData);
                notifySuccess('Thêm mới thành công');
            } else if (modalMode === 'edit' && selectedSignature) {
                await apiClient.put(`/v1/capital-source/partners/${partnerId}/signatures/${selectedSignature.id}`, submitData);
                notifySuccess('Cập nhật thành công');
            }
            setIsModalOpen(false);
            fetchSignatures();
        } catch (error) {
            notifyError('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (signature: SignatureItem) => {
        if (!confirm('Xóa chữ ký này?')) return;
            try {
                await apiClient.delete(`/v1/capital-source/partners/${partnerId}/signatures/${signature.id}`);
                notifySuccess('Xóa thành công');
                fetchSignatures();
            } catch (error) {
                notifyError('Có lỗi xảy ra khi xóa');
            }
        };
        const getStatusBadge = (status: string) => {
        const map = {
            Active: styles.statusActive,
            Expired: styles.statusExpired,
            Pending: styles.statusPending
        };
        return map[status as keyof typeof map] || '';
    };

    const getStatusLabel = (status: string) => {
        const map = {
            Active: 'Hiệu lực',
            Expired: 'Hết hạn',
            Pending: 'Chờ duyệt'
        };
        return map[status as keyof typeof map] || status;
    };
    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <h1>Danh sách chữ ký</h1>
            </div>
            <div className={styles.header}>
                <button onClick={handleOpenCreate}>Thêm mới</button>
                <button onClick={() => selectedSignature && handleOpenEdit(selectedSignature)} disabled={!selectedSignature || isReadOnly}>Sửa</button>
                <button onClick={() => selectedSignature && handleDelete(selectedSignature)} disabled={!selectedSignature || isReadOnly}>Xóa</button>
                <button onClick={() => selectedSignature && handleOpenView(selectedSignature)} disabled={!selectedSignature}>Xem</button>
            </div>
            <div className={styles.table}>
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên file</th>
                            <th>Loại chữ ký</th>
                            <th>Mô tả</th>
                            <th>Ngày hiệu lực</th>
                            <th>Ngày hết hạn</th>
                            <th>Trạng thái</th>
                            <th>Người cập nhật</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, index) => (
                            <tr key={item.id} onClick={() => setSelectedSignature(item)}>
                                <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                <td>{item.fileName}</td>
                                <td>{item.signatureType}</td>
                                <td>{item.description}</td>
                                <td>{item.effectiveDate}</td>
                                <td>{item.expiryDate}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${getStatusBadge(item.status)}`}>
                                        {getStatusLabel(item.status)}
                                    </span>
                                </td>
                                <td>{item.updatedBy}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {signatures.length > 0 && (
                    <div className={styles.pagination}>
                        <div className={styles.pageInfo}>
                            Hiển thị {startIndex} - {endIndex} của {signatures.length} bản ghi
                        </div>
                        <div className={styles.pageControls}>
                            <button 
                                className={styles.pageBtn}
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                <ChevronLeft/>
                            </button>
                            <span className={styles.pageNumber}>{currentPage}</span>
                            <span className={styles.pageTotal}>/ {totalPage}</span>
                            <button 
                                className={styles.pageBtn}
                                disabled={currentPage === totalPage}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                <ChevronRight/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* ===== MODAL ===== */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setUploadedFile(null);
                    setPreviewUrl(null);
                }}
                title={
                    modalMode === 'create' ? 'Thêm mới chữ ký' :
                    modalMode === 'edit' ? 'Chỉnh sửa chữ ký' :
                    'Thông tin chữ ký'
                }
                size="md"
            >
                <div className={styles.modalContent}>
                    {/* Drag & Drop Zone */}
                    {modalMode !== 'view' && (
                        <div 
                            className={`${styles.dropZone} ${dragActive ? styles.dropActive : ''}`}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {uploadedFile ? (
                                <div className={styles.fileInfo}>
                                    <div className={styles.filePreview}>
                                        {previewUrl && (
                                            <img 
                                                src={previewUrl} 
                                                alt="Preview" 
                                                className={styles.previewThumb}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.fileDetails}>
                                        <p className={styles.fileName}>{uploadedFile.name}</p>
                                        <p className={styles.fileSize}>
                                            {(uploadedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                        <button 
                                            className={styles.removeFileBtn}
                                            onClick={handleRemoveFile}
                                        >
                                            Xóa file
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.dropIcon}>📄</div>
                                    <p className={styles.dropText}>
                                        Kéo thả file vào đây hoặc <span className={styles.browseLink}>chọn file</span>
                                    </p>
                                    <p className={styles.dropHint}>Hỗ trợ: JPG, PNG, PDF (tối đa 5MB)</p>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={handleFileChange}
                                        className={styles.fileInputHidden}
                                        id="fileInput"
                                    />
                                    <label htmlFor="fileInput" className={styles.browseBtn}>
                                        Chọn file
                                    </label>
                                </>
                            )}
                        </div>
                    )}

                    {/* Form fields */}
                    <div className={styles.formGroup}>
                        <label>Tên file <span className={styles.required}>*</span></label>
                        <input
                            name="fileName"
                            value={formData.fileName || ''}
                            onChange={handleChange}
                            disabled={modalMode === 'view'}
                            placeholder="Nhập tên file"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Loại chữ ký <span className={styles.required}>*</span></label>
                        <select
                            name="signatureType"
                            value={formData.signatureType || ''}
                            onChange={handleChange}
                            disabled={modalMode === 'view'}
                        >
                            <option value="">-- Chọn --</option>
                            <option value="Chữ ký số">Chữ ký số</option>
                            <option value="Chữ ký tay">Chữ ký tay</option>
                            <option value="Mẫu dấu">Mẫu dấu</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Mô tả</label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            disabled={modalMode === 'view'}
                            rows={2}
                            placeholder="Nhập mô tả"
                        />
                    </div>

                    <div className={styles.row2}>
                        <div className={styles.formGroup}>
                            <label>Ngày hiệu lực</label>
                            <input
                                type="date"
                                name="effectiveDate"
                                value={formData.effectiveDate || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Ngày hết hạn</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Trạng thái</label>
                        <select
                            name="status"
                            value={formData.status || 'Active'}
                            onChange={handleChange}
                            disabled={modalMode === 'view'}
                        >
                            <option value="Active">Hiệu lực</option>
                            <option value="Pending">Chờ duyệt</option>
                            <option value="Expired">Hết hạn</option>
                        </select>
                    </div>

                    {modalMode === 'view' && formData.fileUrl && (
                        <div className={styles.filePreview}>
                            <img 
                                src={formData.fileUrl} 
                                alt="Chữ ký" 
                                className={styles.previewImage}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button 
                        className={styles.cancelBtn} 
                        onClick={() => {
                            setIsModalOpen(false);
                            setUploadedFile(null);
                            setPreviewUrl(null);
                        }}
                    >
                        {modalMode === 'view' ? 'Đóng' : 'Hủy'}
                    </button>
                    {modalMode !== 'view' && (
                        <button 
                            className={styles.saveBtn} 
                            onClick={handleSave}
                            disabled={!uploadedFile || !formData.signatureType}
                        >
                            {modalMode === 'create' ? 'Lưu' : 'Cập nhật'}
                        </button>
                    )}
                </div>
            </Modal>
        </div>
    )
}