"use client";

import React, { useState, useEffect } from 'react';
import styles from './AssetCatalogTab.module.css';
import Button from '@/components/shared/Button/Button';
import Input from '@/components/shared/Input/Input';
import Table, { TableColumn } from '@/components/shared/Table/Table';
import { AssetPledgeItem, AssetPledgeReleaseItem } from '@/types/funding.types';
import apiClient from '@/lib/api/client';
import { useNotification } from '@/hooks/useNotification';
import { Plus, Check, X, Search, Unlock, ShieldAlert, FileText } from 'lucide-react';
import PledgeFormModal from './PledgeFormModal';
import ReleaseFormModal from './ReleaseFormModal';

export default function AssetPledgeTab() {
    const [subTab, setSubTab] = useState<'PLEDGE' | 'RELEASE'>('PLEDGE');
    
    // Pledge State
    const [pledges, setPledges] = useState<AssetPledgeItem[]>([]);
    const [loadingPledges, setLoadingPledges] = useState(false);
    const [currentPledgePage, setCurrentPledgePage] = useState(1);
    const [totalPledges, setTotalPledges] = useState(0);
    const [searchFilters, setSearchFilters] = useState({
        cusId: '',
        contractNo: '',
        limitId: '',
        assetId: '',
        status: ''
    });

    // Release State
    const [releases, setReleases] = useState<AssetPledgeReleaseItem[]>([]);
    const [loadingReleases, setLoadingReleases] = useState(false);
    const [currentReleasePage, setCurrentReleasePage] = useState(1);
    const [totalReleases, setTotalReleases] = useState(0);

    const pageSize = 10;
    const { notifyError, notifySuccess } = useNotification();

    const [isPledgeFormOpen, setIsPledgeFormOpen] = useState(false);
    const [isReleaseFormOpen, setIsReleaseFormOpen] = useState(false);
    const [selectedPledgeId, setSelectedPledgeId] = useState<number | null>(null);
    const [selectedPledgeData, setSelectedPledgeData] = useState<any>(null);

    // Fetch Pledges
    const fetchPledges = async (page = currentPledgePage) => {
        setLoadingPledges(true);
        try {
            const params = new URLSearchParams({
                page: String(page - 1),
                size: String(pageSize)
            });
            if (searchFilters.cusId) params.append('cusId', searchFilters.cusId.trim());
            if (searchFilters.contractNo) params.append('contractNo', searchFilters.contractNo.trim());
            if (searchFilters.limitId) params.append('limitId', searchFilters.limitId.trim());
            if (searchFilters.assetId) params.append('assetId', searchFilters.assetId.trim());
            if (searchFilters.status) params.append('status', searchFilters.status.trim());

            const res: any = await apiClient.get(`/v1/capital-source/asset-pledges?${params.toString()}`);
            const content = res?.data?.content || res?.content || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
            const total = res?.data?.totalElements ?? res?.totalElements ?? content.length;
            
            setPledges(content);
            setTotalPledges(total);
        } catch (error: any) {
            notifyError(error.message || 'Lỗi khi tải danh sách cầm cố');
        } finally {
            setLoadingPledges(false);
        }
    };

    // Fetch Releases
    const fetchReleases = async (page = currentReleasePage) => {
        setLoadingReleases(true);
        try {
            const params = new URLSearchParams({
                page: String(page - 1),
                size: String(pageSize)
            });
            const res: any = await apiClient.get(`/v1/capital-source/asset-pledges/releases?${params.toString()}`);
            const content = res?.data?.content || res?.content || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
            const total = res?.data?.totalElements ?? res?.totalElements ?? content.length;
            
            setReleases(content);
            setTotalReleases(total);
        } catch (error: any) {
            notifyError(error.message || 'Lỗi khi tải danh sách yêu cầu giải tỏa');
        } finally {
            setLoadingReleases(false);
        }
    };

    useEffect(() => {
        if (subTab === 'PLEDGE') {
            fetchPledges();
        } else {
            fetchReleases();
        }
    }, [subTab, currentPledgePage, currentReleasePage]);

    const handleSearch = () => {
        if (currentPledgePage === 1) {
            fetchPledges(1);
        } else {
            setCurrentPledgePage(1);
        }
    };

    // Actions for Pledge
    const handleApprovePledge = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn duyệt giao dịch này? Hạn mức tín dụng sẽ được tự động tăng tương ứng.')) return;
        try {
            const res: any = await apiClient.put(`/v1/capital-source/asset-pledges/${id}/approve`, {});
            if (res?.data?.success || res?.success || res?.id) {
                notifySuccess('Duyệt cầm cố thành công. Hạn mức tín dụng đã được cập nhật.');
                fetchPledges();
            } else {
                notifyError(res?.message || 'Lỗi duyệt');
            }
        } catch (error: any) {
            notifyError(error.response?.data?.message || error.message || 'Lỗi duyệt');
        }
    };

    const handleRejectPledge = async (id: number) => {
        const reason = prompt('Nhập lý do từ chối:');
        if (reason === null) return;
        try {
            const res: any = await apiClient.put(`/v1/capital-source/asset-pledges/${id}/reject`, { reason });
            if (res?.data?.success || res?.success || res?.id) {
                notifySuccess('Từ chối thành công');
                fetchPledges();
            } else {
                notifyError(res?.message || 'Lỗi từ chối');
            }
        } catch (error: any) {
            notifyError(error.response?.data?.message || error.message || 'Lỗi từ chối');
        }
    };

    const handleOpenReleaseModal = (record: any) => {
        setSelectedPledgeId(record.id);
        setSelectedPledgeData(record);
        setIsReleaseFormOpen(true);
    };

    // Actions for Release
    const handleApproveRelease = async (releaseId: number) => {
        if (!confirm('Bạn có chắc chắn muốn DUYỆT yêu cầu giải tỏa này? Hạn mức tín dụng và số lượng khả dụng của tài sản sẽ được cập nhật.')) return;
        try {
            const res: any = await apiClient.put(`/v1/capital-source/asset-pledges/releases/${releaseId}/approve`, {});
            if (res?.data?.success || res?.success || res?.id) {
                notifySuccess('Duyệt giải tỏa thành công. Hạn mức và TSBĐ đã được cập nhật.');
                fetchReleases();
                fetchPledges();
            } else {
                notifyError(res?.message || 'Lỗi duyệt giải tỏa');
            }
        } catch (error: any) {
            notifyError(error.response?.data?.message || error.message || 'Lỗi duyệt giải tỏa');
        }
    };

    const handleRejectRelease = async (releaseId: number) => {
        const reason = prompt('Nhập lý do từ chối giải tỏa:');
        if (reason === null) return;
        try {
            const res: any = await apiClient.put(`/v1/capital-source/asset-pledges/releases/${releaseId}/reject`, { reason });
            if (res?.data?.success || res?.success || res?.id) {
                notifySuccess('Từ chối yêu cầu giải tỏa thành công');
                fetchReleases();
            } else {
                notifyError(res?.message || 'Lỗi từ chối giải tỏa');
            }
        } catch (error: any) {
            notifyError(error.response?.data?.message || error.message || 'Lỗi từ chối giải tỏa');
        }
    };

    // Columns for Pledge Table
    const pledgeColumns: TableColumn<AssetPledgeItem>[] = [
        {
            key: "stt",
            title: "STT",
            width: 50,
            render: (_, __, index) => (currentPledgePage - 1) * pageSize + index + 1,
        },
        {
            key: "assetId",
            title: "Mã TS",
            width: 100,
            render: (val: any) => <strong>{String(val || '-')}</strong>
        },
        {
            key: "cusId",
            title: "Mã KH",
            width: 100,
            render: (val: any) => String(val || '-')
        },
        {
            key: "limitId",
            title: "Hạn mức",
            width: 120,
            render: (val: any) => String(val || '-')
        },
        {
            key: "pledgeDate",
            title: "Ngày CC",
            width: 100,
            render: (val: any) => String(val || '-')
        },
        {
            key: "pledgeQty",
            title: "SL Cầm cố",
            width: 100,
            render: (val: any) => val != null ? Number(val).toLocaleString() : '0'
        },
        {
            key: "releasedQty",
            title: "Đã giải tỏa",
            width: 100,
            render: (val: any) => val != null ? Number(val).toLocaleString() : '0'
        },
        {
            key: "collateralValue",
            title: "Giá trị TSBĐ",
            width: 120,
            render: (val: any) => val != null ? Number(val).toLocaleString('vi-VN') + ' đ' : '0 đ'
        },
        {
            key: "status",
            title: "Trạng thái",
            width: 120,
            render: (status: any) => {
                const badgeStyle = { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 };
                if (status === 'APPROVED') {
                    return <span style={{ ...badgeStyle, backgroundColor: '#dcfce7', color: '#166534' }}>Hiệu lực</span>;
                } else if (status === 'PENDING') {
                    return <span style={{ ...badgeStyle, backgroundColor: '#fef9c3', color: '#854d0e' }}>Chờ duyệt</span>;
                } else if (status === 'PARTIALLY_RELEASED') {
                    return <span style={{ ...badgeStyle, backgroundColor: '#e0f2fe', color: '#0369a1' }}>Giải tỏa 1 phần</span>;
                } else if (status === 'RELEASED') {
                    return <span style={{ ...badgeStyle, backgroundColor: '#f3f4f6', color: '#4b5563' }}>Đã giải tỏa hết</span>;
                } else if (status === 'REJECTED') {
                    return <span style={{ ...badgeStyle, backgroundColor: '#fee2e2', color: '#991b1b' }}>Từ chối</span>;
                }
                return String(status || '');
            }
        },
        {
            key: "action",
            title: "Thao tác",
            width: 130,
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {record.status === 'PENDING' && (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => handleApprovePledge(record.id)} title="Duyệt cầm cố">
                                <Check size={16} color="green" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleRejectPledge(record.id)} title="Từ chối">
                                <X size={16} color="red" />
                            </Button>
                        </>
                    )}
                    {(record.status === 'APPROVED' || record.status === 'PARTIALLY_RELEASED') && (
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handleOpenReleaseModal(record)} 
                            title="Tạo yêu cầu Giải tỏa TSĐB"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                        >
                            <Unlock size={14} color="#0284c7" /> Giải tỏa
                        </Button>
                    )}
                </div>
            )
        }
    ];

    // Columns for Release Table
    const releaseColumns: TableColumn<AssetPledgeReleaseItem>[] = [
        {
            key: "stt",
            title: "STT",
            width: 50,
            render: (_, __, index) => (currentReleasePage - 1) * pageSize + index + 1,
        },
        {
            key: "assetId",
            title: "Mã TSĐB",
            width: 100,
            render: (val: any) => <strong>{String(val || '-')}</strong>
        },
        {
            key: "contractNo",
            title: "Số HĐ Tín dụng",
            width: 120,
            render: (val: any) => String(val || '-')
        },
        {
            key: "limitId",
            title: "Mã Hạn mức",
            width: 120,
            render: (val: any) => String(val || '-')
        },
        {
            key: "releaseDate",
            title: "Ngày giải tỏa",
            width: 100,
            render: (val: any) => String(val || '-')
        },
        {
            key: "releaseQty",
            title: "SL Giải tỏa",
            width: 100,
            render: (val: any) => val != null ? <strong>{Number(val).toLocaleString()}</strong> : '0'
        },
        {
            key: "releaseValue",
            title: "Giá trị giải tỏa",
            width: 130,
            render: (val: any) => val != null ? <span style={{ color: '#dc2626', fontWeight: 600 }}>-{Number(val).toLocaleString('vi-VN')} đ</span> : '-'
        },
        {
            key: "reason",
            title: "Lý do giải tỏa",
            width: 150,
            render: (val: any, record) => (
                <div>
                    <div>{String(val || '-')}</div>
                    {record.isExceptionApproved && (
                        <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <ShieldAlert size={12} /> Ngoại lệ ({record.exceptionApprover || 'Đã duyệt'})
                        </div>
                    )}
                </div>
            )
        },
        {
            key: "status",
            title: "Trạng thái",
            width: 110,
            render: (status: any) => {
                const badgeStyle = { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 };
                if (status === 'APPROVED') {
                    return <span style={{ ...badgeStyle, backgroundColor: '#dcfce7', color: '#166534' }}>Đã duyệt</span>;
                } else if (status === 'PENDING') {
                    return <span style={{ ...badgeStyle, backgroundColor: '#fef9c3', color: '#854d0e' }}>Chờ duyệt</span>;
                } else if (status === 'REJECTED') {
                    return <span style={{ ...badgeStyle, backgroundColor: '#fee2e2', color: '#991b1b' }}>Từ chối</span>;
                }
                return String(status || '');
            }
        },
        {
            key: "action",
            title: "Thao tác",
            width: 110,
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {record.status === 'PENDING' ? (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => handleApproveRelease(record.id)} title="Phê duyệt giải tỏa">
                                <Check size={16} color="green" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleRejectRelease(record.id)} title="Từ chối giải tỏa">
                                <X size={16} color="red" />
                            </Button>
                        </>
                    ) : (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>-</span>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className={styles.container}>
            {/* Sub-tab switcher */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <button
                    onClick={() => setSubTab('PLEDGE')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        backgroundColor: subTab === 'PLEDGE' ? '#3b82f6' : '#f1f5f9',
                        color: subTab === 'PLEDGE' ? '#ffffff' : '#475569',
                        transition: 'all 0.2s ease'
                    }}
                >
                    📋 Danh sách HĐ Cầm cố TSĐB ({totalPledges})
                </button>
                <button
                    onClick={() => setSubTab('RELEASE')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        backgroundColor: subTab === 'RELEASE' ? '#3b82f6' : '#f1f5f9',
                        color: subTab === 'RELEASE' ? '#ffffff' : '#475569',
                        transition: 'all 0.2s ease'
                    }}
                >
                    🔓 Yêu cầu Giải tỏa TSĐB ({totalReleases})
                </button>
            </div>

            {subTab === 'PLEDGE' ? (
                <>
                    <div className={styles.searchBar}>
                        <Input 
                            placeholder="Mã tài sản" 
                            value={searchFilters.assetId}
                            onChange={(e) => setSearchFilters(prev => ({...prev, assetId: e.target.value}))}
                        />
                        <Input 
                            placeholder="Mã đối tác (CusId)" 
                            value={searchFilters.cusId}
                            onChange={(e) => setSearchFilters(prev => ({...prev, cusId: e.target.value}))}
                        />
                        <Input 
                            placeholder="Mã hạn mức" 
                            value={searchFilters.limitId}
                            onChange={(e) => setSearchFilters(prev => ({...prev, limitId: e.target.value}))}
                        />
                        <Button onClick={handleSearch}><Search size={16} style={{marginRight: 8}}/> Tìm kiếm</Button>
                        <div style={{ flex: 1 }}></div>
                        <Button variant="primary" onClick={() => setIsPledgeFormOpen(true)}>
                            <Plus size={16} style={{marginRight: 8}}/> Gán TSBĐ
                        </Button>
                    </div>
                    
                    <div className={styles.tableWrapper}>
                        <Table 
                            columns={pledgeColumns}
                            data={pledges}
                            isLoading={loadingPledges}
                            rowKey="id"
                            emptyText="Không có dữ liệu cầm cố"
                        />
                        <div className={styles.pagination}>
                            <span>Tổng số: {totalPledges}</span>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className={styles.tableWrapper}>
                        <Table 
                            columns={releaseColumns}
                            data={releases}
                            isLoading={loadingReleases}
                            rowKey="id"
                            emptyText="Chưa có yêu cầu giải tỏa tài sản nào"
                        />
                        <div className={styles.pagination}>
                            <span>Tổng số: {totalReleases}</span>
                        </div>
                    </div>
                </>
            )}

            {isPledgeFormOpen && (
                <PledgeFormModal 
                    isOpen={isPledgeFormOpen} 
                    onClose={() => setIsPledgeFormOpen(false)} 
                    onSuccess={() => fetchPledges()} 
                />
            )}

            {isReleaseFormOpen && selectedPledgeId && (
                <ReleaseFormModal 
                    isOpen={isReleaseFormOpen} 
                    onClose={() => setIsReleaseFormOpen(false)} 
                    pledgeId={selectedPledgeId} 
                    pledgeData={selectedPledgeData} 
                    onSuccess={() => {
                        fetchPledges();
                        fetchReleases();
                    }} 
                />
            )}
        </div>
    );
}