'use client';

import Table, { TableColumn } from "@/components/shared/Table/Table";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { AuthorizationItem, CreateAuthorization } from "@/types/funding.types";
import { useEffect, useMemo, useState } from "react";
import styles from "./AuthorizationTab.module.css";
import Button from "@/components/shared/Button/Button";
import Modal from "@/components/shared/Modal/Modal";
import AuthorizationForm from "./AuthorizationForm";
import { formatDate } from "@/utils/format";
import { Eye, Edit2, Trash2 } from "lucide-react";


interface AuthorizationTabProps {
    partnerId: string;
    isView?: boolean;
    pendingItems?: AuthorizationItem[];
    setPendingItems?: React.Dispatch<React.SetStateAction<AuthorizationItem[]>>;
}

export default function AuthorizationTab({ partnerId, isView, pendingItems, setPendingItems }: AuthorizationTabProps) {
    const [allAuths, setAllAuths] = useState<AuthorizationItem[]>(pendingItems || []);
    const [loading, setLoading] = useState(false);
    const { notifyError, notifySuccess } = useNotification();
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<AuthorizationItem | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');
    
    // 'LEGAL_REP' or 'AUTHORIZATION'
    const [activeSubTab, setActiveSubTab] = useState<'LEGAL_REP' | 'AUTHORIZATION'>('LEGAL_REP');

    // Pagination specific to current sub-tab
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const fetchAuthor = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/v1/capital-source/partners/${partnerId}/authorizations?page=0&size=1000`);
            const payload = res.data?.data || res.data;
            if (payload && payload.content !== undefined) {
                setAllAuths(payload.content || []);
            } else if (Array.isArray(payload)) {
                setAllAuths(payload);
            } else {
                setAllAuths([]);
            }
        } catch (error: any) {
            console.error("Lỗi tải danh sách ủy quyền", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (partnerId) {
            fetchAuthor();
        } else if (pendingItems) {
            setAllAuths(pendingItems);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [partnerId, pendingItems]);

    // Derived states
    const legalReps = useMemo(() => {
        return allAuths.filter(a => a.authType === 'LEGAL_REP' || (!a.authType && !a.authedName));
    }, [allAuths]);

    const authorizations = useMemo(() => {
        return allAuths.filter(a => a.authType === 'AUTHORIZATION' || (!a.authType && !!a.authedName));
    }, [allAuths]);

    const filteredAuths = useMemo(() => {
        return activeSubTab === 'LEGAL_REP' ? legalReps : authorizations;
    }, [activeSubTab, legalReps, authorizations]);

    const totalItems = filteredAuths.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = filteredAuths.slice(startIndex, startIndex + pageSize);

    const handleSubTabChange = (tab: 'LEGAL_REP' | 'AUTHORIZATION') => {
        setActiveSubTab(tab);
        setCurrentPage(1);
    };

    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

    // --- COLUMNS ---
    const renderStatus = (value: unknown, row: AuthorizationItem) => {
        const valStr = String(value || '');
        if (activeSubTab === 'LEGAL_REP') {
            if (valStr === "ACTIVE" || !valStr || valStr === "Hiệu lực") return <span className={styles.statusActive}>Hiệu lực</span>;
            if (valStr === "INACTIVE" || valStr === "Hết hiệu lực") return <span className={styles.statusInactive}>Hết hiệu lực</span>;
            return <span className={styles.statusActive}>Hiệu lực</span>;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!row.expiryDate) return <span className={styles.statusActive}>Hiệu lực</span>;
        
        const expiry = new Date(row.expiryDate);
        expiry.setHours(0, 0, 0, 0);

        if (value === "DELETED") return <span className={styles.statusInactive}>Đã xóa</span>;
        
        if (expiry >= today) {
            return <span className={styles.statusActive}>Hiệu lực</span>;
        } else {
            return <span className={styles.statusInactive}>Hết hiệu lực</span>;
        }
    };

    const handleView = (row: AuthorizationItem) => {
        setSelectedItem(row);
        setModalMode('view');
        setIsOpenModal(true);
    };

    const handleEdit = (row: AuthorizationItem) => {
        setSelectedItem(row);
        setModalMode('edit');
        setIsOpenModal(true);
    };

    const handleDelete = async (row: AuthorizationItem) => {
        const itemType = activeSubTab === 'LEGAL_REP' ? 'Người đại diện pháp luật' : 'Ủy quyền';
        if (!confirm(`Bạn có chắc chắn muốn xóa ${itemType} này?`)) return;

        if (!partnerId || (row.id && row.id.startsWith('temp_'))) {
            const updated = allAuths.filter(a => a.id !== row.id);
            setAllAuths(updated);
            if (setPendingItems) setPendingItems(updated);
            notifySuccess('Thành công', `Đã xóa ${itemType}`);
            return;
        }

        try {
            await apiClient.delete(`/v1/capital-source/partners/${partnerId}/authorizations/${row.id}`);
            notifySuccess('Thành công', `Đã xóa ${itemType}`);
            await fetchAuthor();
        } catch (err: any) {
            notifyError("Lỗi", err.response?.data?.message || "Không thể xóa!");
        }
    };

    const legalRepColumns: TableColumn<AuthorizationItem>[] = [
        { key: "seqId", title: "STT", width: 50, render: (_, __, i) => startIndex + i + 1 },
        { key: "authName", title: "Tên" },
        { key: "authidNo", title: "Số CCCD" },
        { key: "authissueDate", title: "Ngày cấp", render: (v) => formatDate(v as string) },
        { key: "issuePlace", title: "Nơi cấp" },
        { key: "authPosition", title: "Chức vụ" },
        { key: "status", title: "Trạng thái", render: renderStatus },
        {
            key: "actions",
            title: "Thao tác",
            width: 170,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleView(row)}
                        style={{ padding: '3px 8px', fontSize: '12px' }}
                    >
                        <Eye size={13} style={{ marginRight: 3 }} /> Xem
                    </Button>
                    {!isView && (
                        <>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEdit(row)}
                                style={{ padding: '3px 8px', fontSize: '12px' }}
                            >
                                <Edit2 size={13} style={{ marginRight: 3 }} /> Sửa
                            </Button>
                            <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleDelete(row)}
                                style={{ padding: '3px 8px', fontSize: '12px' }}
                            >
                                <Trash2 size={13} style={{ marginRight: 3 }} /> Xóa
                            </Button>
                        </>
                    )}
                </div>
            )
        },
    ];

    const authorizationColumns: TableColumn<AuthorizationItem>[] = [
        { key: "seqId", title: "Cấp UQ", width: 60, render: (v, _, i) => (v as number) || (startIndex + i + 1) },
        { key: "authName", title: "Người UQ" },
        { key: "authidNo", title: "CCCD người UQ" },
        { key: "authissueDate", title: "Ngày cấp", render: (v) => formatDate(v as string) },
        { key: "issuePlace", title: "Nơi cấp" },
        { key: "authPosition", title: "Chức vụ người UQ" },
        { key: "authedName", title: "Người nhận UQ" },
        { key: "authedIdNo", title: "CCCD người nhận UQ" },
        { key: "authedIssueDate", title: "Ngày cấp (Nhận)", render: (v) => formatDate(v as string) },
        { key: "authedIssuePlace", title: "Nơi cấp (Nhận)", render: (v) => (v as string) || "-" },
        { key: "authedPosition", title: "Chức vụ người nhận UQ" },
        { key: "authNo", title: "Số giấy UQ" },
        { key: "effDate", title: "Ngày hiệu lực", render: (v) => formatDate(v as string) },
        { key: "expiryDate", title: "Ngày hết hạn", render: (v) => formatDate(v as string) },
        { key: "scope", title: "Nội dung UQ" },
        { key: "note", title: "Ghi chú", render: (v) => (v as string) || "-" },
        { key: "status", title: "Trạng thái", render: renderStatus },
        {
            key: "actions",
            title: "Thao tác",
            width: 170,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleView(row)}
                        style={{ padding: '3px 8px', fontSize: '12px' }}
                    >
                        <Eye size={13} style={{ marginRight: 3 }} /> Xem
                    </Button>
                    {!isView && (
                        <>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEdit(row)}
                                style={{ padding: '3px 8px', fontSize: '12px' }}
                            >
                                <Edit2 size={13} style={{ marginRight: 3 }} /> Sửa
                            </Button>
                            <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleDelete(row)}
                                style={{ padding: '3px 8px', fontSize: '12px' }}
                            >
                                <Trash2 size={13} style={{ marginRight: 3 }} /> Xóa
                            </Button>
                        </>
                    )}
                </div>
            )
        },
    ];

    const nextSeqId = useMemo(() => {
        if (activeSubTab === 'LEGAL_REP') {
            return legalReps.length + 1;
        }
        return authorizations.length + 1;
    }, [activeSubTab, legalReps, authorizations]);

    const handleSave = async (data: CreateAuthorization) => {
        if (modalMode === 'edit' && selectedItem) {
            if (!partnerId || (selectedItem.id && selectedItem.id.startsWith('temp_'))) {
                const updated = allAuths.map(a => a.id === selectedItem.id ? { ...a, ...data } : a);
                setAllAuths(updated);
                if (setPendingItems) setPendingItems(updated);
                notifySuccess('Thành công', 'Đã cập nhật thành công!');
                setIsOpenModal(false);
                return;
            }

            try {
                const apiPayload = {
                    seqId: data.seqId || selectedItem.seqId,
                    authType: activeSubTab,
                    authName: data.authName || '',
                    authidNo: data.authidNo || '',
                    authPosition: data.authPosition || '',
                    authissueDate: data.authissueDate || null,
                    issuePlace: data.issuePlace || '',
                    authedName: data.authedName || '',
                    authedIdNo: data.authedIdNo || '',
                    authedIssueDate: data.authedIssueDate || null,
                    authedIssuePlace: data.authedIssuePlace || '',
                    authedPosition: data.authedPosition || '',
                    authNo: data.authNo || '',
                    effDate: data.effDate || null,
                    expiryDate: data.expiryDate || null,
                    scope: data.scope || '',
                    note: data.note || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    status: data.status || selectedItem.status || 'ACTIVE',
                    parentAuthId: (data.parentAuthId && !data.parentAuthId.startsWith('temp_')) ? data.parentAuthId : null,
                };
                await apiClient.put(`/v1/capital-source/partners/${partnerId}/authorizations/${selectedItem.id}`, apiPayload);
                notifySuccess('Thành công', 'Đã cập nhật thành công!');
                setIsOpenModal(false);
                await fetchAuthor();
            } catch (err: any) {
                notifyError("Lỗi", err.response?.data?.message || "Có lỗi xảy ra!");
            }
            return;
        }

        const payload: AuthorizationItem = { 
            ...data, 
            id: "temp_" + Date.now(),
            partnerId: partnerId || "",
            seqId: data.seqId || nextSeqId,
            authType: activeSubTab,
            authName: data.authName,
            authidNo: data.authidNo,
            authPosition: data.authPosition,
            authissueDate: data.authissueDate,
            issuePlace: data.issuePlace,
            authedName: data.authedName || "",
            authedIdNo: data.authedIdNo || "",
            authedIssueDate: data.authedIssueDate || "",
            authedIssuePlace: data.authedIssuePlace || "",
            authedPosition: data.authedPosition || "",
            authNo: data.authNo || "",
            effDate: data.effDate || "",
            expiryDate: data.expiryDate || "",
            scope: data.scope || "",
            note: data.note || "",
            status: "ACTIVE"
        };

        if (!partnerId) {
            const updated = [...allAuths, payload];
            setAllAuths(updated);
            if (setPendingItems) setPendingItems(updated);
            notifySuccess('Thành công', activeSubTab === 'LEGAL_REP' ? 'Đã lưu Người đại diện pháp luật' : 'Đã lưu thông tin Ủy quyền');
            setIsOpenModal(false);
            return;
        }

        try {
            const apiPayload = {
                seqId: data.seqId || nextSeqId,
                authType: activeSubTab,
                authName: data.authName || '',
                authidNo: data.authidNo || '',
                authPosition: data.authPosition || '',
                authissueDate: data.authissueDate || null,
                issuePlace: data.issuePlace || '',
                authedName: data.authedName || '',
                authedIdNo: data.authedIdNo || '',
                authedIssueDate: data.authedIssueDate || null,
                authedIssuePlace: data.authedIssuePlace || '',
                authedPosition: data.authedPosition || '',
                authNo: data.authNo || '',
                effDate: data.effDate || null,
                expiryDate: data.expiryDate || null,
                scope: data.scope || '',
                note: data.note || '',
                phone: data.phone || '',
                email: data.email || '',
                status: 'ACTIVE',
                parentAuthId: (data.parentAuthId && !data.parentAuthId.startsWith('temp_')) ? data.parentAuthId : null,
            };
            await apiClient.post(`/v1/capital-source/partners/${partnerId}/authorizations`, apiPayload);
            notifySuccess('Thành công', 'Đã thêm thành công!');
            setIsOpenModal(false);
            await fetchAuthor();
        } catch (err: any) {
            notifyError("Lỗi", err.response?.data?.message || "Có lỗi xảy ra!");
        }
    };

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e5e7eb', marginBottom: '20px', paddingBottom: '10px' }}>
                <span 
                    style={{ 
                        fontWeight: activeSubTab === 'LEGAL_REP' ? '600' : '400', 
                        color: activeSubTab === 'LEGAL_REP' ? '#2563eb' : '#6b7280', 
                        cursor: 'pointer',
                        borderBottom: activeSubTab === 'LEGAL_REP' ? '2px solid #2563eb' : 'none',
                        paddingBottom: '8px'
                    }}
                    onClick={() => handleSubTabChange('LEGAL_REP')}
                >
                    Người đại diện pháp luật ({legalReps.length})
                </span>
                <span 
                    style={{ 
                        fontWeight: activeSubTab === 'AUTHORIZATION' ? '600' : '400', 
                        color: activeSubTab === 'AUTHORIZATION' ? '#2563eb' : '#6b7280', 
                        cursor: 'pointer',
                        borderBottom: activeSubTab === 'AUTHORIZATION' ? '2px solid #2563eb' : 'none',
                        paddingBottom: '8px'
                    }}
                    onClick={() => handleSubTabChange('AUTHORIZATION')}
                >
                    Ủy quyền ({authorizations.length})
                </span>
            </div>

            <div className={styles.header}>
                {!isView && (
                    <Button variant="primary" onClick={() => {
                        setSelectedItem(null);
                        setModalMode('create');
                        setIsOpenModal(true);
                    }}>
                        + Thêm mới
                    </Button>
                )}
            </div>
            
            <div className={styles.table}>
                <Table 
                    columns={activeSubTab === 'LEGAL_REP' ? legalRepColumns : authorizationColumns}
                    rowKey="id" 
                    data={currentData}  
                    isLoading={loading}  
                    emptyText="Không có dữ liệu"            
                />
            </div>
            
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button 
                        className={styles.pageBtn} 
                        onClick={handlePrevPage} 
                        disabled={currentPage === 1}
                    >
                        &lt;
                    </button>
                    <span className={styles.pageInfo}>
                        Trang {currentPage} / {totalPages}
                    </span>
                    <button 
                        className={styles.pageBtn} 
                        onClick={handleNextPage} 
                        disabled={currentPage === totalPages}
                    >
                        &gt;
                    </button>
                </div>
            )}

            {isOpenModal && (
                <Modal 
                    isOpen={isOpenModal} 
                    onClose={() => setIsOpenModal(false)}
                    title={
                        modalMode === 'view' 
                            ? (activeSubTab === 'LEGAL_REP' ? "Chi tiết người đại diện pháp luật" : "Chi tiết ủy quyền")
                            : modalMode === 'edit'
                            ? (activeSubTab === 'LEGAL_REP' ? "Chỉnh sửa người đại diện pháp luật" : "Chỉnh sửa ủy quyền")
                            : (activeSubTab === 'LEGAL_REP' ? "Thêm mới người đại diện pháp luật" : "Thêm mới ủy quyền")
                    }
                    size="lg"
                >
                    <AuthorizationForm 
                        initialData={selectedItem}
                        isView={modalMode === 'view'}
                        onSubmit={handleSave} 
                        onClose={() => setIsOpenModal(false)}
                        nextSeqId={selectedItem?.seqId || nextSeqId} 
                        existingAuths={allAuths}
                        legalReps={legalReps}
                        authType={activeSubTab}
                    />
                </Modal>
            )}
        </div>
    );
}
