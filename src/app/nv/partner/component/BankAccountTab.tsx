'use client';

import Table, { TableColumn } from "@/components/shared/Table/Table";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { BankAccountItem } from "@/types/funding.types";
import { useEffect, useState, useMemo } from "react";
import Button from "@/components/shared/Button/Button";
import Modal from "@/components/shared/Modal/Modal";
import BankAccountForm from "./BankAccountForm";
import { getStatusDisplay } from "@/constants/status";

interface BankAccountTabProps {
    partnerId: string;
    isView?: boolean;
    pendingItems?: BankAccountItem[];
    setPendingItems?: React.Dispatch<React.SetStateAction<BankAccountItem[]>>;
}

export default function BankAccountTab({partnerId, isView, pendingItems, setPendingItems}: BankAccountTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<'BANK' | 'CHANNEL'>('BANK');
    const [allAccounts, setAllAccounts] = useState<BankAccountItem[]>(pendingItems || []);
    const [loading, setLoading] = useState(false);
    const { notifyError, notifySuccess } = useNotification();
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editData, setEditData] = useState<BankAccountItem | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const startIndex = (currentPage - 1) * pageSize;

    const fetchAccounts = async() => {
        try {
            setLoading(true);
            const res = await apiClient.get('/v1/capital-source/partners/' + partnerId + '/bank-accounts?page=0&size=1000');
            const payload = res.data?.data || res.data;
            if (payload && payload.content !== undefined) {
                setAllAccounts(payload.content || []);
            } else if (Array.isArray(payload)) {
                setAllAccounts(payload);
            } else {
                setAllAccounts([]);
            }
        } catch(error:any) {
            console.error("Không thể tải danh sách", error);
            setAllAccounts([]);
        } finally {
            setLoading(false);
        };
    };

    useEffect(() => {
        if(partnerId) {
            fetchAccounts();
        } else if (pendingItems) {
            setAllAccounts(pendingItems);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [partnerId, pendingItems]);

    const filteredAccounts = useMemo(() => {
        let list = allAccounts.filter(acc => {
            if (activeSubTab === 'BANK') {
                return acc.accountType === 'BANK' || !acc.accountType || acc.accountNumber;
            } else {
                return acc.accountType === 'CHANNEL' || acc.tradingGateway;
            }
        });

        if (searchTerm.trim()) {
            const lower = searchTerm.toLowerCase();
            list = list.filter(acc => 
                (acc.accountNumber && acc.accountNumber.toLowerCase().includes(lower)) ||
                (acc.accountName && acc.accountName.toLowerCase().includes(lower)) ||
                (acc.openPlace && acc.openPlace.toLowerCase().includes(lower)) ||
                (acc.branch && acc.branch.toLowerCase().includes(lower)) ||
                (acc.tradingGateway && acc.tradingGateway.toLowerCase().includes(lower)) ||
                (acc.purpose && acc.purpose.toLowerCase().includes(lower))
            );
        }

        return list;
    }, [allAccounts, activeSubTab, searchTerm]);

    const totalItems = filteredAccounts.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paginatedData = filteredAccounts.slice(startIndex, startIndex + pageSize);

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) return;

        if (!partnerId) {
            const updated = allAccounts.filter(x => x.id !== id);
            setAllAccounts(updated);
            if (setPendingItems) setPendingItems(updated);
            notifySuccess('Thành công', 'Đã xóa bản ghi');
            return;
        }

        try {
            await apiClient.delete('/v1/capital-source/partners/' + partnerId + '/bank-accounts/' + id);
            notifySuccess('Thành công', 'Đã xóa bản ghi');
            fetchAccounts();
        } catch (error: any) {
            notifyError('Lỗi', 'Không thể xóa bản ghi');
        }
    };

    const handleSaveLocal = (item: BankAccountItem) => {
        let updated: BankAccountItem[];
        if (editData && editData.id) {
            updated = allAccounts.map(x => x.id === editData.id ? item : x);
        } else {
            updated = [item, ...allAccounts];
        }
        setAllAccounts(updated);
        if (setPendingItems) setPendingItems(updated);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleTabChange = (tab: 'BANK' | 'CHANNEL') => {
        setActiveSubTab(tab);
        setCurrentPage(1);
    };

    const bankColumns: TableColumn<BankAccountItem>[] = [
        {
            key: "id",
            title: "STT",
            width: 40,
            render: (value, row, index) => {
                return startIndex + index + 1;
            },
        },
        { key: "accountNumber", title: "Số tài khoản" },
        { 
            key: "openPlace", 
            title: "Ngân hàng mở tại",
            render: (val, row) => (val as string) || row.branch || ''
        },
        { key: "accountName", title: "Chủ tài khoản" },
        { key: "purpose", title: "Mục đích" },
        { 
            key: "status", 
            title: "Trạng thái",
            render: (val) => val === 'ACTIVE' || !val ? 'Hiệu lực' : 'Hết hiệu lực'
        },
        {
            key: "action",
            title: "Thao tác",
            width: 120,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {!isView && (
                        <>
                            <Button variant="outline" onClick={() => { setEditData(row); setIsOpenModal(true); }} style={{ padding: '4px 8px', fontSize: '12px' }}>Sửa</Button>
                            <Button variant="danger" onClick={() => handleDelete(row.id as string)} style={{ padding: '4px 8px', fontSize: '12px' }}>Xóa</Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    const channelColumns: TableColumn<BankAccountItem>[] = [
        {
            key: "id",
            title: "STT",
            width: 40,
            render: (value, row, index) => {
                return startIndex + index + 1;
            },
        },
        { key: "tradingGateway", title: "Kênh đặt lệnh" },
        { key: "purpose", title: "Mục đích đặt lệnh" },
        { 
            key: "status", 
            title: "Trạng thái",
            render: (val) => getStatusDisplay(String(val)).label
        },
        {
            key: "action",
            title: "Thao tác",
            width: 120,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {!isView && (
                        <>
                            <Button variant="outline" onClick={() => { setEditData(row); setIsOpenModal(true); }} style={{ padding: '4px 8px', fontSize: '12px' }}>Sửa</Button>
                            <Button variant="danger" onClick={() => handleDelete(row.id as string)} style={{ padding: '4px 8px', fontSize: '12px' }}>Xóa</Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e5e7eb', marginBottom: '16px' }}>
                <div 
                    onClick={() => handleTabChange('BANK')}
                    style={{ padding: '8px 16px', cursor: 'pointer', borderBottom: activeSubTab === 'BANK' ? '2px solid #3b82f6' : 'none', color: activeSubTab === 'BANK' ? '#3b82f6' : '#6b7280', fontWeight: activeSubTab === 'BANK' ? 500 : 400 }}
                >
                    Tài khoản ngân hàng
                </div>
                <div 
                    onClick={() => handleTabChange('CHANNEL')}
                    style={{ padding: '8px 16px', cursor: 'pointer', borderBottom: activeSubTab === 'CHANNEL' ? '2px solid #3b82f6' : 'none', color: activeSubTab === 'CHANNEL' ? '#3b82f6' : '#6b7280', fontWeight: activeSubTab === 'CHANNEL' ? 500 : 400 }}
                >
                    Kênh đặt lệnh
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                {!isView ? (
                    <Button variant="primary" onClick={() => { setEditData(null); setIsOpenModal(true); }}>
                        {activeSubTab === 'BANK' ? '+ Thêm tài khoản ngân hàng' : '+ Thêm kênh đặt lệnh'}
                    </Button>
                ) : <div />}
                <div style={{ position: 'relative' }}>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Nhập từ khóa tìm kiếm..." 
                        style={{ padding: '6px 32px 6px 12px', border: '1px solid #e5e7eb', borderRadius: '4px', outline: 'none', width: '250px' }}
                    />
                    <svg style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>
            
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <Table
                    columns={activeSubTab === 'BANK' ? bankColumns as any : channelColumns as any}
                    data={paginatedData}
                    rowKey="id"
                    isLoading={loading}
                    emptyText="Chưa có dữ liệu"
                />
                
                {!loading && totalItems > pageSize && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                        <Button 
                            variant="outline" 
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            style={{ padding: '4px 8px', fontSize: '13px' }}
                        >
                            Trang trước
                        </Button>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            Trang {currentPage} / {totalPages}
                        </span>
                        <Button 
                            variant="outline" 
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            style={{ padding: '4px 8px', fontSize: '13px' }}
                        >
                            Trang sau
                        </Button>
                    </div>
                )}
            </div>

            {isOpenModal && (
                <Modal 
                    isOpen={isOpenModal} 
                    onClose={() => setIsOpenModal(false)}
                    title={editData ? (activeSubTab === 'BANK' ? 'Cập nhật tài khoản' : 'Cập nhật kênh đặt lệnh') : (activeSubTab === 'BANK' ? 'Thêm mới tài khoản' : 'Thêm mới kênh đặt lệnh')}
                    size="lg"
                >
                    <BankAccountForm 
                        partnerId={partnerId}
                        initialData={editData}
                        activeSubTab={activeSubTab}
                        onClose={() => setIsOpenModal(false)}
                        onSaveLocal={handleSaveLocal}
                        onSuccess={() => {
                            setIsOpenModal(false);
                            if (partnerId) fetchAccounts();
                        }}
                    />
                </Modal>
            )}
        </div>
    );
}
