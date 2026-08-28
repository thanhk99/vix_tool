'use client';

import Table, { TableColumn } from "@/components/shared/Table/Table";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { ContactItem } from "@/types/funding.types";
import { useEffect, useState, useMemo } from "react";
import Button from "@/components/shared/Button/Button";
import Modal from "@/components/shared/Modal/Modal";
import ContactForm from "./ContactForm";
import { Search } from "lucide-react";

interface ContactTabProps {
    partnerId: string;
    isView?: boolean;
    pendingItems?: ContactItem[];
    setPendingItems?: React.Dispatch<React.SetStateAction<ContactItem[]>>;
}

export default function ContactTab({ partnerId, isView = false, pendingItems, setPendingItems }: ContactTabProps) {
    const [contacts, setContacts] = useState<ContactItem[]>(pendingItems || []);
    const [loading, setLoading] = useState(false);
    const { notifyError, notifySuccess } = useNotification();
    
    // Modal states
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editData, setEditData] = useState<ContactItem | null>(null);
    const [isFormViewOnly, setIsFormViewOnly] = useState(false);

    // Search and pagination states
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/v1/capital-source/partners/${partnerId}/contacts?page=0&size=100`);
            const payload = res.data?.data?.content || res.data?.data || res.data?.content || res.data;
            if (Array.isArray(payload)) {
                setContacts(payload);
                setTotalItems(payload.length);
            } else {
                setContacts([]);
                setTotalItems(0);
            }
        } catch (error: any) {
            console.error("Không thể tải danh sách người liên hệ", error);
            setContacts([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (partnerId) {
            fetchContacts();
        } else if (pendingItems) {
            setContacts(pendingItems);
            setTotalItems(pendingItems.length);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [partnerId, pendingItems]);

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa người liên hệ này?')) return;

        if (!partnerId) {
            const updated = contacts.filter(x => x.id !== id);
            setContacts(updated);
            setTotalItems(updated.length);
            if (setPendingItems) setPendingItems(updated);
            notifySuccess('Thành công', 'Đã xóa người liên hệ');
            return;
        }

        try {
            await apiClient.delete(`/v1/capital-source/partners/${partnerId}/contacts/${id}`);
            notifySuccess('Thành công', 'Đã xóa người liên hệ');
            fetchContacts();
        } catch (error: any) {
            notifyError('Lỗi', error?.response?.data?.message || error?.message || 'Không thể xóa người liên hệ');
        }
    };

    const handleSaveLocal = (item: ContactItem) => {
        let updated: ContactItem[];
        if (editData && editData.id) {
            updated = contacts.map(x => x.id === editData.id ? item : x);
        } else {
            updated = [item, ...contacts];
        }
        setContacts(updated);
        setTotalItems(updated.length);
        if (setPendingItems) setPendingItems(updated);
    };

    // Filter contacts based on searchTerm
    const filteredContacts = useMemo(() => {
        if (!searchTerm.trim()) return contacts;
        const lower = searchTerm.toLowerCase();
        return contacts.filter(c => 
            (c.name && c.name.toLowerCase().includes(lower)) ||
            (c.position && c.position.toLowerCase().includes(lower)) ||
            (c.department && c.department.toLowerCase().includes(lower)) ||
            (c.phone && c.phone.toLowerCase().includes(lower)) ||
            (c.email && c.email.toLowerCase().includes(lower)) ||
            (c.role && c.role.toLowerCase().includes(lower))
        );
    }, [contacts, searchTerm]);

    // Paginated slice
    const paginatedContacts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredContacts.slice(start, start + pageSize);
    }, [filteredContacts, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredContacts.length / pageSize) || 1;

    const handleOpenAdd = () => {
        setEditData(null);
        setIsFormViewOnly(false);
        setIsOpenModal(true);
    };

    const handleOpenEdit = (item: ContactItem) => {
        setEditData(item);
        setIsFormViewOnly(false);
        setIsOpenModal(true);
    };

    const handleOpenView = (item: ContactItem) => {
        setEditData(item);
        setIsFormViewOnly(true);
        setIsOpenModal(true);
    };

    const columns: TableColumn<ContactItem>[] = [
        {
            key: "stt",
            title: "STT",
            width: 50,
            render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
        },
        { 
            key: "name", 
            title: "Tên",
            render: (val) => <span style={{ fontWeight: 500, color: '#1e293b' }}>{val as string || '-'}</span>
        },
        { key: "position", title: "Vị trí", render: (val) => (val as string) || '-' },
        { key: "department", title: "Phòng ban", render: (val) => (val as string) || '-' },
        { key: "role", title: "Nội dung phụ trách", render: (val) => (val as string) || '-' },
        { 
            key: "transactionFee", 
            title: "Phí GD", 
            render: (val: unknown) => {
                if (!val) return '—';
                const str = String(val).trim();
                return str.includes('%') ? str : `${str}%`;
            } 
        },
        { key: "phone", title: "SĐT", render: (val) => (val as string) || '-' },
        { key: "email", title: "Email", render: (val) => (val as string) || '-' },
        {
            key: "status",
            title: "Trạng thái",
            render: (val) => {
                const isActive = val === 'ACTIVE' || !val;
                return (
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
                        color: isActive ? '#16a34a' : '#dc2626',
                        display: 'inline-block',
                        whiteSpace: 'nowrap'
                    }}>
                        {isActive ? 'Hiệu lực' : 'Hết hiệu lực'}
                    </span>
                );
            }
        },
        {
            key: "action",
            title: "Thao tác",
            width: 170,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '6px' }}>
                    <Button 
                        variant="outline" 
                        onClick={() => handleOpenView(row)} 
                        style={{ padding: '4px 8px', fontSize: '12px', color: '#2563eb', borderColor: '#bfdbfe' }}
                    >
                        Xem
                    </Button>
                    {!isView && (
                        <>
                            <Button 
                                variant="outline" 
                                onClick={() => handleOpenEdit(row)} 
                                style={{ padding: '4px 8px', fontSize: '12px', color: '#16a34a', borderColor: '#bbf7d0' }}
                            >
                                Sửa
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => handleDelete(row.id as string)} 
                                style={{ padding: '4px 8px', fontSize: '12px', color: '#dc2626', borderColor: '#fecaca' }}
                            >
                                Xóa
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    {!isView && (
                        <Button variant="primary" onClick={handleOpenAdd}>
                            + Thêm mới
                        </Button>
                    )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '280px' }}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Nhập từ khóa tìm kiếm..."
                        style={{
                            width: '100%',
                            padding: '7px 34px 7px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />
                    <Search size={16} color="#9ca3af" style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }} />
                </div>
            </div>
            
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <Table
                    columns={columns as any}
                    data={paginatedContacts}
                    rowKey="id"
                    isLoading={loading}
                    emptyText="Chưa có dữ liệu người liên hệ"
                />
                
                {filteredContacts.length > 0 && (
                    <div style={{ 
                        padding: '12px 16px', 
                        borderTop: '1px solid var(--border)', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        backgroundColor: '#fff'
                    }}>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                            Hiển thị {Math.min((currentPage - 1) * pageSize + 1, filteredContacts.length)} - {Math.min(currentPage * pageSize, filteredContacts.length)} của {filteredContacts.length} bản ghi
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>10 bản ghi/trang</span>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    style={{ padding: '4px 8px', fontSize: '13px', minWidth: '32px' }}
                                >
                                    &lt;
                                </Button>
                                <Button 
                                    variant="primary" 
                                    style={{ padding: '4px 10px', fontSize: '13px', minWidth: '32px' }}
                                >
                                    {currentPage}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    style={{ padding: '4px 8px', fontSize: '13px', minWidth: '32px' }}
                                >
                                    &gt;
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isOpenModal && (
                <Modal 
                    isOpen={isOpenModal} 
                    onClose={() => setIsOpenModal(false)}
                    title={isFormViewOnly ? "Xem thông tin người liên hệ" : (editData ? "Cập nhật người liên hệ" : "Thêm mới người liên hệ")}
                    size="lg"
                >
                    <ContactForm 
                        partnerId={partnerId}
                        initialData={editData}
                        isView={isFormViewOnly}
                        onClose={() => setIsOpenModal(false)}
                        onSaveLocal={handleSaveLocal}
                        onSuccess={() => {
                            setIsOpenModal(false);
                            if (partnerId) fetchContacts();
                        }}
                    />
                </Modal>
            )}
        </div>
    );
}
