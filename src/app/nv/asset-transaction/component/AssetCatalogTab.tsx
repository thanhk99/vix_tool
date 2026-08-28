"use client";

import React, { useState, useEffect } from 'react';
import styles from './AssetCatalogTab.module.css';
import Button from '@/components/shared/Button/Button';
import Input from '@/components/shared/Input/Input';
import Table, { TableColumn } from '@/components/shared/Table/Table';
import { AssetItem } from '@/types/funding.types';
import apiClient from '@/lib/api/client';
import { useNotification } from '@/hooks/useNotification';
import { Plus, Edit, DollarSign, Search } from 'lucide-react';
import AssetCatalogFormModal from './AssetCatalogFormModal';
import UpdatePriceModal from './UpdatePriceModal';

export default function AssetCatalogTab() {
    const [assets, setAssets] = useState<AssetItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { notifyError } = useNotification();
    
    // Pagination & Search
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchFilters, setSearchFilters] = useState({
        assetId: '',
        assetType: '',
        symbol: '',
        status: ''
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPriceOpen, setIsPriceOpen] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

    const fetchAssets = async (page = currentPage) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page - 1),
                size: String(pageSize)
            });
            if (searchFilters.assetId) params.append('assetId', searchFilters.assetId.trim());
            if (searchFilters.assetType) params.append('assetType', searchFilters.assetType.trim());
            if (searchFilters.symbol) params.append('symbol', searchFilters.symbol.trim());
            if (searchFilters.status) params.append('status', searchFilters.status.trim());

            const res: any = await apiClient.get(`/v1/capital-source/assets?${params.toString()}`);
            const content = res?.data?.content || res?.content || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
            const total = res?.data?.totalElements ?? res?.totalElements ?? content.length;
            
            setAssets(content);
            setTotalItems(total);
        } catch (error: any) {
            notifyError(error.message || 'Lỗi khi tải danh sách tài sản');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, [currentPage, pageSize]);

    const handleSearch = () => {
        if (currentPage === 1) {
            fetchAssets(1);
        } else {
            setCurrentPage(1);
        }
    };

    const handleAdd = () => {
        setSelectedAssetId(null);
        setIsFormOpen(true);
    };

    const handleEdit = (assetId: string) => {
        setSelectedAssetId(assetId);
        setIsFormOpen(true);
    };

    const handleUpdatePrice = (assetId: string) => {
        setSelectedAssetId(assetId);
        setIsPriceOpen(true);
    };

    const assetTypeLabels: Record<string, string> = {
        STOCK: "Cổ phiếu",
        BOND: "Trái phiếu",
        FUND: "Chứng chỉ quỹ",
        DEPOSIT: "Tiền gửi"
    };

    const columns: TableColumn<AssetItem>[] = [
        {
            key: "stt",
            title: "STT",
            width: 50,
            render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
        },
        {
            key: "assetId",
            title: "Mã TS",
            width: 110,
            render: (val: any) => <strong>{String(val || '-')}</strong>
        },
        {
            key: "assetType",
            title: "Loại TS",
            width: 120,
            render: (val: any) => assetTypeLabels[String(val)] || String(val || '-')
        },
        {
            key: "symbol",
            title: "Mã CK",
            width: 100,
            render: (val: any) => String(val || '-')
        },
        {
            key: "issuer",
            title: "Tổ chức phát hành",
            width: 220,
            render: (val: any) => String(val || '-')
        },
        {
            key: "totalQuantity",
            title: "Tổng khối lượng",
            width: 120,
            render: (val) => val != null ? Number(val).toLocaleString() : '0'
        },
        {
            key: "availQuantity",
            title: "Khả dụng",
            width: 100,
            render: (val) => val != null ? Number(val).toLocaleString() : '0'
        },
        {
            key: "marketPrice",
            title: "Giá TT",
            width: 120,
            render: (val) => val != null ? Number(val).toLocaleString('vi-VN') + ' đ' : '-'
        },
        {
            key: "status",
            title: "Trạng thái",
            width: 110,
            render: (status: any) => {
                const badgeStyle = { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 };
                if (status === 'AVAILABLE' || status === 'ACTIVE') {
                    return <span style={{ ...badgeStyle, backgroundColor: '#dcfce7', color: '#166534' }}>Khả dụng</span>;
                }
                return String(status || '');
            }
        },
        {
            key: "action",
            title: "Thao tác",
            width: 120,
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(record.assetId)} title="Sửa">
                        <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleUpdatePrice(record.assetId)} title="Cập nhật giá">
                        <DollarSign size={16} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.searchBar}>
                <Input 
                    placeholder="Mã tài sản" 
                    value={searchFilters.assetId}
                    onChange={(e) => setSearchFilters(prev => ({...prev, assetId: e.target.value}))}
                />
                <Input 
                    placeholder="Loại tài sản" 
                    value={searchFilters.assetType}
                    onChange={(e) => setSearchFilters(prev => ({...prev, assetType: e.target.value}))}
                />
                <Input 
                    placeholder="Mã CK" 
                    value={searchFilters.symbol}
                    onChange={(e) => setSearchFilters(prev => ({...prev, symbol: e.target.value}))}
                />
                <Button onClick={handleSearch} ><Search size={16} style={{marginRight: 8}}/> Tìm kiếm</Button>
                <div style={{ flex: 1 }}></div>
                <Button variant="primary" onClick={handleAdd}><Plus size={16} style={{marginRight: 8}}/> Thêm mới</Button>
            </div>
            
            <div className={styles.tableWrapper}>
                <Table 
                    columns={columns}
                    data={assets}
                    isLoading={loading}
                    rowKey="id"
                    emptyText="Không có dữ liệu tài sản"
                />
                <div className={styles.pagination}>
                    <span>Tổng số: {totalItems}</span>
                </div>
            </div>
            
            {isFormOpen && (
                <AssetCatalogFormModal 
                    isOpen={isFormOpen} 
                    onClose={() => setIsFormOpen(false)} 
                    assetId={selectedAssetId} 
                    onSuccess={() => fetchAssets()} 
                />
            )}

            {isPriceOpen && selectedAssetId && (
                <UpdatePriceModal 
                    isOpen={isPriceOpen} 
                    onClose={() => setIsPriceOpen(false)} 
                    assetId={selectedAssetId} 
                    onSuccess={() => fetchAssets()} 
                />
            )}
        </div>
    );
}