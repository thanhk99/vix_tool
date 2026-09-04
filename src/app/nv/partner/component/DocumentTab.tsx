'use client';

import Table, { TableColumn } from "@/components/shared/Table/Table";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { PartnerDocumentItem } from "@/types/funding.types";
import { useEffect, useState, useRef } from "react";
import styles from "./PartnerList.module.css";
import Button from "@/components/shared/Button/Button";
import { formatDateTime } from "@/utils/format";


export interface UnifiedDocumentItem extends PartnerDocumentItem {
    file?: File;
}

interface DocumentTabProps {
    partnerId: string;
    isView?: boolean;
    pendingItems?: UnifiedDocumentItem[];
    setPendingItems?: React.Dispatch<React.SetStateAction<UnifiedDocumentItem[]>>;
}

export default function DocumentTab({ partnerId, isView, pendingItems, setPendingItems }: DocumentTabProps) {
    const [documents, setDocuments] = useState<UnifiedDocumentItem[]>(pendingItems || []);
    const [loading, setLoading] = useState(false);
    const { notifyError, notifySuccess, notifyWarning } = useNotification();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/v1/capital-source/partners/${partnerId}/documents`);
            const payload = res.data?.data || res.data;
            if (Array.isArray(payload)) {
                setDocuments(payload);
            } else {
                setDocuments([]);
            }
        } catch (error: any) {
            notifyError("Lỗi", "Không thể tải danh sách tài liệu!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (partnerId) {
            fetchDocuments();
        } else if (pendingItems) {
            setDocuments(pendingItems);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [partnerId, pendingItems]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!partnerId) {
            // Local mode
            const newDoc: UnifiedDocumentItem = {
                id: "temp_" + Date.now(),
                partnerId: "",
                name: file.name,
                mimeType: file.type,
                size: file.size,
                createdAt: new Date().toISOString(),
                uploadedBy: "user",
                file: file
            };
            const updated = [newDoc, ...documents];
            setDocuments(updated);
            if (setPendingItems) setPendingItems(updated);
            notifySuccess("Thành công", "Đã thêm tài liệu vào danh sách");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            await apiClient.post(`/v1/capital-source/partners/${partnerId}/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            notifySuccess("Thành công", "Đã tải lên tài liệu");
            await fetchDocuments();
        } catch (error: any) {
            notifyError("Lỗi", error.response?.data?.message || "Không thể tải lên tài liệu");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDownload = async (row: UnifiedDocumentItem) => {
        if (row.file) {
            const url = URL.createObjectURL(row.file);
            const a = document.createElement("a");
            a.href = url;
            a.download = row.name || row.file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }

        try {
            const res = await apiClient.get(`/v1/capital-source/partners/${partnerId}/documents/${row.id}/url`);
            const url = res.data?.data || res.data;
            if (url) {
                window.open(url, "_blank");
            }
        } catch (error: any) {
            notifyError("Lỗi", "Không thể lấy link tải xuống");
        }
    };

    const handleDelete = async (row: UnifiedDocumentItem) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;

        if (!partnerId) {
            const updated = documents.filter(x => x.id !== row.id);
            setDocuments(updated);
            if (setPendingItems) setPendingItems(updated);
            notifySuccess("Thành công", "Đã xóa tài liệu");
            return;
        }

        try {
            await apiClient.delete(`/v1/capital-source/partners/${partnerId}/documents/${row.id}`);
            notifySuccess("Thành công", "Đã xóa tài liệu");
            await fetchDocuments();
        } catch (error: any) {
            notifyError("Lỗi", "Không thể xóa tài liệu");
        }
    };

    const columns: TableColumn<UnifiedDocumentItem>[] = [
        {
            key: "name",
            title: "Tên file",
        },
        {
            key: "createdAt",
            title: "Ngày tải lên",
            render: (value) => formatDateTime(value as string),
        },
        {
            key: "uploadedBy",
            title: "Người thực hiện",
        },
        {
            key: "actions",
            title: "Thao tác",
            width: 150,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="outline" onClick={() => handleDownload(row)} style={{ padding: '4px 8px', fontSize: '13px' }}>
                        Tải xuống
                    </Button>
                    {!isView && (
                        <Button variant="outline" onClick={() => handleDelete(row)} style={{ padding: '4px 8px', fontSize: '13px', color: 'red', borderColor: 'red' }}>
                            Xóa
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!isView && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange} 
                    />
                    <Button 
                        variant="primary" 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={uploading}
                    >
                        {uploading ? "Đang tải..." : "+ Tải lên"}
                    </Button>
                </div>
            )}
            
            <Table 
                columns={columns}
                rowKey="id" 
                data={documents}  
                isLoading={loading}  
                emptyText="Không có tài liệu nào"            
            />
        </div>
    );
}
