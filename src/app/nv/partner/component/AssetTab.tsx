"use client";

import { useEffect, useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { AssetFormData, AssetItem, AssetResponse } from "@/types/funding.types";
import styles from "./AssetTab.module.css";
import Table, {TableColumn,} from "@/components/shared/Table/Table";
import Button from "@/components/shared/Button/Button";
import AssetFormModal from "@/components/shared/AssetFormModal/AssetFormModal";
import { formatDate } from "@/utils/format";


interface AssetTabProps {
    partnerId: string;
isView?: boolean;
}



export default function AssetTab({ partnerId, isView }: AssetTabProps) {
    const [assets, setAssets] = useState<AssetItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const {notifyError, notifySuccess, notifyWarning} = useNotification();
    const [saving, setSaving] = useState(false);
    const [pageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    // Tinh toan cho phan trang
     const totalItems = assets.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = assets.slice(
        startIndex,
        startIndex + pageSize
    );

    const fetchAssets = async () => {
        if (!partnerId) return;

        try {
            setLoading(true);

            const res = await apiClient.get<AssetResponse>(`/v1/capital-source/partners/${partnerId}/assets`);
            const payload: any = res.data?.data || res.data;
            if (Array.isArray(payload)) {
                setAssets(payload);
            } else if (payload && Array.isArray(payload.content)) {
                setAssets(payload.content);
            } else {
                setAssets([]);
            }
        } catch (error: any) {
            notifyError(
                "Lỗi",
                error.response?.data?.message ||
                    "Không thể tải danh sách tài sản bảo đảm"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, [partnerId]);

    const handleOpenCreate = () => {
        setIsCreating(true);
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    
    const columns: TableColumn<AssetItem>[] = [
        {
            key: "stt",
            title: "STT",
            width: 60,
            render: (_value, _row, index) => index + 1,
        },
        {
            key: "assetId",
            title: "Mã TSĐB",
        },
        {
            key: "assetType",
            title: "Loại TSĐB",
        },
        {
            key: "issuer",
            title: "Tổ chức phát hành",
        },
        {
            key: "issuerCode",
            title: "Mã TCPH",
        },
        {
            key: "parValue",
            title: "Mệnh giá",
            render: (value) =>
                value !== null && value !== undefined
                    ? Number(value).toLocaleString("vi-VN")
                    : "-",
        },
        {
            key: "issueDate",
            title: "Ngày phát hành",
            render: (value) => formatDate(value as string),
        },
        {
            key: "maturityDate",
            title: "Ngày đáo hạn",
            render: (value) => formatDate(value as string),
        },
        {
            key: "callDate",
            title: "Ngày mua lại trước hạn",
            render: (value) => formatDate(value as string),
        },
        {
            key: "couponType",
            title: "Loại lãi suất",
        },
        {
            key: "couponRate",
            title: "Lãi suất coupon",
            render: (value) =>
                value !== null && value !== undefined
                    ? Number(value).toLocaleString("vi-VN", {
                        maximumFractionDigits: 4,
                    })
                    : "-",
        },
        {
            key: "interestPayTerm",
            title: "Kỳ trả lãi",
        },
    ];

    if (loading) {
        return <div>Đang tải dữ liệu...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    DANH SÁCH TÀI SẢN
                </h2>
                <Button
                    variant="primary"
                    onClick={
                        handleOpenCreate
                    }
                >
                    Thêm mới
                </Button>
            </div>
            <div className={styles.table}>
                <Table
                    columns={columns}
                    data={assets}
                    isLoading={loading}
                    rowKey="id"
                    emptyText="Không có dữ liệu tài sản bảo đảm"
                />
            </div>

            {/*Modal*/}
            <AssetFormModal 
                isOpen={isCreating} 
                onClose={() => setIsCreating(false)} 
                partnerId={partnerId} 
                onSuccess={fetchAssets} 
            />

            {/* Phan trang  */}
            {/* {totalItems > 0 && ( */}
                <div className={styles.pagination}>

                    <div className={styles.paginationInfo}>
                        Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)}
                        {" "}của {totalItems} bản ghi
                    </div>

                    <div className={styles.paginationButtons}>

                        <button
                            className={styles.pageBtn}
                            disabled={currentPage === 1}
                            onClick={handlePrevPage}
                        >
                            &lt;
                        </button>

                        {Array.from(
                            { length: Math.min(totalPages, 10) },
                            (_, i) => i + 1
                        ).map((page) => (
                            <button
                                key={page}
                                className={`${styles.pageBtn} ${
                                    currentPage === page ? styles.pageActive : ""
                                }`}
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
            {/* )} */}
            
        </div>
    );
}

