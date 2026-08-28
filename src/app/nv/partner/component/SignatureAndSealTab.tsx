'use client';

import { useState, useEffect, useRef } from "react";
import Table, { TableColumn } from "@/components/shared/Table/Table";
import Button from "@/components/shared/Button/Button";
import Modal from "@/components/shared/Modal/Modal";
import Input from "@/components/shared/Input/Input";
import Select, { SelectOption } from "@/components/shared/Select/Select";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { getStatusDisplay } from "@/constants/status";
import { Image as ImageIcon, FileText, ExternalLink, Download } from "lucide-react";
import styles from "./SignatureTab.module.css";
import { signatureApi } from "@/lib/api/signature.api";
import { sealApi } from "@/lib/api/seal.api";

export interface UnifiedItem {
    id: string;
    fileName: string;
    typeId: string;
    typeLabel: string;
    description: string;
    effectiveDate: string;
    expiryDate: string;
    status: string;
    updatedBy: string;
    isSignature: boolean;
    file?: File | null;
    fileUrl?: string | null;
    documentId?: string;
}

const TYPE_OPTIONS: SelectOption[] = [
    { label: "Chữ ký số", value: "DIGITAL" },
    { label: "Chữ ký điện tử", value: "ELECTRONIC" },
    { label: "Dấu", value: "SEAL" }
];

const STATUS_OPTIONS: SelectOption[] = [
    { label: "Hiệu lực", value: "ACTIVE" },
    { label: "Hết hiệu lực", value: "INACTIVE" },
];

interface SignatureAndSealTabProps {
    partnerId: string;
    isView?: boolean;
    pendingItems?: UnifiedItem[];
    setPendingItems?: React.Dispatch<React.SetStateAction<UnifiedItem[]>>;
}

export default function SignatureAndSealTab({ partnerId, isView, pendingItems, setPendingItems }: SignatureAndSealTabProps) {
    const [items, setItems] = useState<UnifiedItem[]>(pendingItems || []);
    const [loading, setLoading] = useState(false);
    const { notifyError, notifySuccess } = useNotification();
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string>("DIGITAL");
    const [formData, setFormData] = useState<any>({
        fileName: "",
        description: "",
        effectiveDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        status: "ACTIVE"
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Preview
    const [previewItem, setPreviewItem] = useState<UnifiedItem | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const sigRes: any = await apiClient.get(`/v1/capital-source/partners/${partnerId}/signatures?page=0&size=100`);
            const sealRes: any = await apiClient.get(`/v1/capital-source/partners/${partnerId}/seals?page=0&size=100`);
            
            const extractList = (res: any) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.content)) return res.content;
                if (Array.isArray(res.data?.content)) return res.data.content;
                if (Array.isArray(res.data?.data?.content)) return res.data.data.content;
                if (Array.isArray(res.data)) return res.data;
                if (Array.isArray(res.data?.data)) return res.data.data;
                return [];
            };

            const sigs = extractList(sigRes);
            const seals = extractList(sealRes);

            let combined: UnifiedItem[] = [];

            sigs.forEach((s: any) => {
                combined.push({
                    id: s.id,
                    fileName: s.signFileName,
                    typeId: s.signType,
                    typeLabel: s.signType === 'DIGITAL' ? 'Chữ ký số' : 'Chữ ký điện tử',
                    description: s.description || "-",
                    effectiveDate: s.effectiveDate,
                    expiryDate: s.expiryDate,
                    status: s.status,
                    updatedBy: s.updatedBy || 'system',
                    isSignature: true,
                    documentId: s.documentId
                });
            });

            seals.forEach((s: any) => {
                combined.push({
                    id: s.id,
                    fileName: s.sealFileName,
                    typeId: "SEAL",
                    typeLabel: "Dấu",
                    description: s.description || "-",
                    effectiveDate: s.effectiveDate,
                    expiryDate: s.expiryDate,
                    status: s.status,
                    updatedBy: s.updatedBy || 'system',
                    isSignature: false
                });
            });

            combined.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
            
            setTotalItems(combined.length);
            setItems(combined);
        } catch (e) {
            console.error("Lỗi tải danh sách chữ ký/dấu", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (partnerId) {
            fetchAll();
        } else if (pendingItems) {
            setItems(pendingItems);
            setTotalItems(pendingItems.length);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [partnerId, pendingItems]);

    const handleOpenAdd = () => {
        setEditingId(null);
        setSelectedType("DIGITAL");
        setFormData({
            fileName: "",
            description: "",
            effectiveDate: new Date().toISOString().split("T")[0],
            expiryDate: "",
            status: "ACTIVE"
        });
        setSelectedFile(null);
        setLocalPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: UnifiedItem) => {
        setEditingId(item.id);
        setSelectedType(item.isSignature ? item.typeId : "SEAL");
        setFormData({
            fileName: item.fileName,
            description: item.description === "-" ? "" : item.description,
            effectiveDate: item.effectiveDate,
            expiryDate: item.expiryDate || "",
            status: item.status
        });
        setSelectedFile(item.file || null);
        setLocalPreviewUrl(item.fileUrl || null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setIsModalOpen(true);
    };

    const handleDelete = async (item: UnifiedItem) => {
        if (!window.confirm("Bạn có chắc muốn xoá mục này?")) return;
        
        if (!partnerId) {
            // Local mode
            const updated = items.filter(x => x.id !== item.id);
            setItems(updated);
            setTotalItems(updated.length);
            if (setPendingItems) setPendingItems(updated);
            notifySuccess("Thành công", "Đã xoá thành công");
            return;
        }

        try {
            if (item.isSignature) {
                await signatureApi.delete(partnerId, item.id);
            } else {
                await sealApi.delete(partnerId, item.id);
            }
            notifySuccess("Thành công", "Đã xoá thành công");
            fetchAll();
        } catch (e) {
            notifyError("Lỗi", "Không thể xoá");
        }
    };

    const handlePreview = async (item: UnifiedItem) => {
        if (item.fileUrl) {
            setPreviewItem(item);
            return;
        }

        if (item.file) {
            const url = URL.createObjectURL(item.file);
            setPreviewItem({ ...item, fileUrl: url });
            return;
        }

        if (partnerId && item.isSignature) {
            try {
                setPreviewLoading(true);
                setPreviewItem(item);
                
                // 1. Try fetching binary blob directly from backend download endpoint
                try {
                    const blobRes: any = await apiClient.get(
                        `/v1/capital-source/partners/${partnerId}/signatures/${item.id}/download`,
                        { responseType: 'blob' }
                    );
                    if (blobRes) {
                        const mime = item.fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/png';
                        const blob = new Blob([blobRes], { type: blobRes.type || mime });
                        const blobUrl = URL.createObjectURL(blob);
                        setPreviewItem({ ...item, fileUrl: blobUrl });
                        return;
                    }
                } catch (blobErr) {
                    console.warn("Direct blob download failed, trying presigned url", blobErr);
                }

                // 2. Fallback to presigned URL
                const res: any = await signatureApi.getSignaturePreviewUrl(partnerId, item.id);
                let url = res?.data?.data || res?.data || res;
                if (typeof url === 'string' && url.startsWith('http')) {
                    try {
                        const apiBase = apiClient.defaults.baseURL || "";
                        if (apiBase.startsWith("http")) {
                            const apiHostname = new URL(apiBase).hostname;
                            if (apiHostname && apiHostname !== "localhost" && apiHostname !== "127.0.0.1") {
                                url = url.replace("localhost:9000", `${apiHostname}:9000`).replace("127.0.0.1:9000", `${apiHostname}:9000`);
                            }
                        }
                    } catch (e) {}
                    setPreviewItem({ ...item, fileUrl: url });
                    return;
                }
            } catch (err) {
                console.error("Failed to load preview URL", err);
            } finally {
                setPreviewLoading(false);
            }
        }
        
        setPreviewItem(item);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (!formData.fileName) {
                setFormData((prev: any) => ({ ...prev, fileName: file.name }));
            }
            const url = URL.createObjectURL(file);
            setLocalPreviewUrl(url);
        }
    };

    const handleSave = async () => {
        if (!formData.fileName || !formData.effectiveDate) {
            notifyError("Lỗi", "Vui lòng nhập Tên file và Ngày hiệu lực");
            return;
        }

        const isSig = selectedType !== "SEAL";
        const typeLabel = selectedType === 'DIGITAL' ? 'Chữ ký số' : (selectedType === 'ELECTRONIC' ? 'Chữ ký điện tử' : 'Dấu');

        if (!partnerId) {
            // Local mode
            const objUrl = localPreviewUrl || (selectedFile ? URL.createObjectURL(selectedFile) : undefined);
            if (editingId) {
                const updated = items.map(x => x.id === editingId ? {
                    ...x,
                    fileName: formData.fileName,
                    typeId: selectedType,
                    typeLabel,
                    description: formData.description || "-",
                    effectiveDate: formData.effectiveDate,
                    expiryDate: formData.expiryDate || "",
                    status: formData.status,
                    file: selectedFile || x.file,
                    fileUrl: objUrl || x.fileUrl,
                    isSignature: isSig
                } : x);
                setItems(updated);
                setTotalItems(updated.length);
                if (setPendingItems) setPendingItems(updated);
            } else {
                const newItem: UnifiedItem = {
                    id: "temp_" + Date.now(),
                    fileName: formData.fileName,
                    typeId: selectedType,
                    typeLabel,
                    description: formData.description || "-",
                    effectiveDate: formData.effectiveDate,
                    expiryDate: formData.expiryDate || "",
                    status: formData.status,
                    updatedBy: "user",
                    isSignature: isSig,
                    file: selectedFile || undefined,
                    fileUrl: objUrl
                };
                const updated = [newItem, ...items];
                setItems(updated);
                setTotalItems(updated.length);
                if (setPendingItems) setPendingItems(updated);
            }
            notifySuccess("Thành công", "Đã lưu thông tin chữ ký/dấu");
            setIsModalOpen(false);
            return;
        }

        try {
            setSaving(true);
            let createdId = editingId;

            if (isSig) {
                const payload = {
                    signFileName: formData.fileName,
                    signType: selectedType,
                    description: formData.description,
                    effectiveDate: formData.effectiveDate,
                    expiryDate: formData.expiryDate || null,
                    status: formData.status
                };

                if (editingId && !editingId.startsWith('temp_')) {
                    await signatureApi.update(partnerId, editingId, payload);
                } else {
                    const res: any = await signatureApi.create(partnerId, payload);
                    createdId = res?.data?.id || res?.data?.data?.id || res?.id;
                }

                if (selectedFile && createdId) {
                    await signatureApi.uploadFile(partnerId, createdId, selectedFile);
                }
            } else {
                const payload = {
                    sealFileName: formData.fileName,
                    description: formData.description,
                    effectiveDate: formData.effectiveDate,
                    expiryDate: formData.expiryDate || null,
                    status: formData.status
                };

                if (editingId && !editingId.startsWith('temp_')) {
                    await sealApi.update(partnerId, editingId, payload);
                } else {
                    const res: any = await sealApi.create(partnerId, payload);
                    createdId = res?.data?.id || res?.data?.data?.id || res?.id;
                }

                if (selectedFile && createdId) {
                    await sealApi.uploadFile(partnerId, createdId, selectedFile);
                }
            }

            notifySuccess("Thành công", "Đã lưu thành công");
            setIsModalOpen(false);
            fetchAll();
        } catch (e: any) {
            notifyError("Lỗi", e.response?.data?.message || "Không thể lưu thông tin");
        } finally {
            setSaving(false);
        }
    };

    const paginatedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const getTagStyle = (typeId: string) => {
        switch (typeId) {
            case "DIGITAL":
                return { backgroundColor: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" };
            case "ELECTRONIC":
                return { backgroundColor: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" };
            case "SEAL":
                return { backgroundColor: "#f3e8ff", color: "#7e22ce", border: "1px solid #e9d5ff" };
            default:
                return { backgroundColor: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" };
        }
    };

    const columns: TableColumn<UnifiedItem>[] = [
        {
            key: "stt",
            title: "STT",
            width: 50,
            render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
        },
        {
            key: "fileName",
            title: "Tên File / Chữ ký",
            render: (val) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#4b5563" />
                    <span style={{ fontWeight: 500 }}>{val as string}</span>
                </div>
            )
        },
        {
            key: "typeLabel",
            title: "Loại",
            render: (val, row) => {
                const style = getTagStyle(row.typeId);
                return (
                    <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 500,
                        ...style
                    }}>
                        {val as string}
                    </span>
                );
            }
        },
        { key: "description", title: "Mô tả", render: (val) => (val as string) || "-" },
        {
            key: "effectiveDate",
            title: "Ngày hiệu lực",
            render: (val) => val ? new Date(val as string).toLocaleDateString('vi-VN') : "-"
        },
        {
            key: "expiryDate",
            title: "Ngày hết hạn",
            render: (val) => val ? new Date(val as string).toLocaleDateString('vi-VN') : "-"
        },
        {
            key: "status",
            title: "Trạng thái",
            render: (val, row) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isExpired = row.expiryDate ? new Date(row.expiryDate) < today : false;
                const isInactive = val === 'INACTIVE' || val === 'DUEDATE' || val === 'DELETED' || isExpired;
                const isActive = !isInactive;
                return (
                    <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor: isActive ? "#dcfce7" : "#fee2e2",
                        color: isActive ? "#16a34a" : "#dc2626",
                        fontWeight: 500
                    }}>
                        {isActive ? "Hiệu lực" : "Hết hiệu lực"}
                    </span>
                );
            }
        },
        { key: "updatedBy", title: "Người cập nhật" },
        {
            key: "actions",
            title: "Thao tác",
            width: 180,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="outline" onClick={() => handlePreview(row)} style={{ padding: '4px 8px', fontSize: '13px' }}>
                        Xem
                    </Button>
                    {!isView && (
                        <>
                            <Button variant="outline" onClick={() => handleOpenEdit(row)} style={{ padding: '4px 8px', fontSize: '13px' }}>
                                Sửa
                            </Button>
                            <Button variant="danger" onClick={() => handleDelete(row)} style={{ padding: '4px 8px', fontSize: '13px' }}>
                                Xóa
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                    Danh sách Chữ ký & Con dấu ({totalItems})
                </h3>
                {!isView && (
                    <Button variant="primary" onClick={handleOpenAdd}>
                        + Thêm chữ ký / dấu
                    </Button>
                )}
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <Table
                    columns={columns}
                    data={paginatedItems}
                    isLoading={loading}
                    rowKey="id"
                    emptyText="Chưa có chữ ký hoặc dấu nào"
                />

                {totalItems > pageSize && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                            Trang {currentPage} / {Math.ceil(totalItems / pageSize)}
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button 
                                variant="outline" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                style={{ padding: '4px 8px', fontSize: '13px' }}
                            >
                                Trước
                            </Button>
                            <Button 
                                variant="outline" 
                                disabled={currentPage >= Math.ceil(totalItems / pageSize)}
                                onClick={() => setCurrentPage(p => p + 1)}
                                style={{ padding: '4px 8px', fontSize: '13px' }}
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Thêm/Sửa */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Cập nhật chữ ký / dấu" : "Thêm mới chữ ký / dấu"}
                size="lg"
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                            Loại <span style={{ color: 'red' }}>*</span>
                        </label>
                        <Select 
                            value={selectedType}
                            onChange={(val) => setSelectedType(val)}
                            options={TYPE_OPTIONS}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                            Tên File / Chữ ký <span style={{ color: 'red' }}>*</span>
                        </label>
                        <Input 
                            value={formData.fileName}
                            onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                            placeholder="Nhập tên file / chữ ký"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                            Ngày hiệu lực <span style={{ color: 'red' }}>*</span>
                        </label>
                        <Input 
                            type="date"
                            value={formData.effectiveDate}
                            onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                            Ngày hết hạn
                        </label>
                        <Input 
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                            Trạng thái <span style={{ color: 'red' }}>*</span>
                        </label>
                        <Select 
                            value={formData.status}
                            onChange={(val) => setFormData({ ...formData, status: val })}
                            options={STATUS_OPTIONS}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                            Mô tả
                        </label>
                        <Input 
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Nhập mô tả"
                        />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                            File đính kèm (Hình ảnh/Tài liệu chữ ký)
                        </label>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={handleFileChange}
                            accept="image/*,application/pdf"
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px' }}>
                                Chọn file
                            </Button>
                            <span style={{ fontSize: '13px', color: '#666' }}>
                                {selectedFile ? selectedFile.name : (editingId ? "Đã có file" : "Chưa chọn file")}
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>Đóng</Button>
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                        {saving ? "Đang lưu..." : "Lưu"}
                    </Button>
                </div>
            </Modal>

            {/* Preview Modal */}
            <Modal 
                isOpen={!!previewItem}
                onClose={() => setPreviewItem(null)}
                title={`Xem trước: ${previewItem?.fileName || ''}`}
                size="lg"
            >
                <div style={{ minHeight: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
                    {previewLoading ? (
                        <div style={{ textAlign: 'center', color: '#6b7280' }}>Đang tải file xem trước...</div>
                    ) : previewItem?.fileUrl ? (
                        previewItem.fileName.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={previewItem.fileUrl} style={{ width: '100%', height: '500px', border: 'none' }} title="PDF Preview" />
                        ) : (
                            <img src={previewItem.fileUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
                        )
                    ) : (
                        <div style={{ textAlign: 'center', color: '#6b7280' }}>
                            <ImageIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                            <p style={{ fontWeight: 500, fontSize: '15px' }}>{previewItem?.fileName}</p>
                            <p style={{ fontSize: '13px', marginTop: '6px', color: '#9ca3af' }}>Không có hình ảnh hoặc file đính kèm để xem trước</p>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                    {previewItem?.fileUrl && (
                        <Button 
                            variant="outline" 
                            onClick={() => window.open(previewItem.fileUrl!, '_blank')}
                        >
                            Mở trong tab mới
                        </Button>
                    )}
                    <Button variant="primary" onClick={() => setPreviewItem(null)}>Đóng</Button>
                </div>
            </Modal>
        </div>
    );
}
