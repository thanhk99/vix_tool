"use client";

import { useEffect, useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { AssetFormData, AssetItem, AssetResponse } from "@/types/funding.types";
import styles from "./AssetTab.module.css";
import Table, {TableColumn,} from "@/components/shared/Table/Table";
import Button from "@/components/shared/Button/Button";
import Modal from "@/components/shared/Modal/Modal";
import Input from "@/components/shared/Input/Input";
import Select from "@/components/shared/Select/Select";

interface AssetTabProps {
    partnerId: string;
}

const initialFormData: AssetFormData = {
    assetId: "",
    assetType: "",
    issuer: "",
    issuerCode: "",
    parValue: "",
    issueDate: "",
    maturityDate: "",
    callDate: "",
    couponType: "",
    couponRate: "",
    interestPayTerm: "",
};

export default function AssetTab({ partnerId }: AssetTabProps) {
    const [assets, setAssets] = useState<AssetItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<AssetFormData>(initialFormData);
    const {notifyError, notifySuccess, notifyWarning} = useNotification();
    const [saving, setSaving] = useState(false);
    const [pageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    // Tinh toan cho phan trang
    const totalItems = assets.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const startIndex = (currentPage - 1) * pageSize;

    const currentData = assets.slice(
    startIndex,
    startIndex + pageSize
    );

    const fetchAssets = async () => {
        if (!partnerId) return;

        try {
            setLoading(true);

            const res = await apiClient.get<AssetResponse>(
                `/v1/capital-source/partners/${partnerId}/collateral-assets`
            );
            if (res.data.success) {
                setAssets(res.data.data ?? []);
            } else {
                notifyError(
                    "Lỗi",
                    res.data.message || "Không thể tải danh sách tài sản bảo đảm"
                );
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

    const handleChange = (
        field: keyof AssetFormData,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleOpenCreate = () => {
        setFormData({
            ...initialFormData,
            issuer: partnerId,
        });

        setIsCreating(true);
    };

    const validateForm = (): boolean => {
        if (!formData.assetId.trim()) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng nhập Mã TSĐB"
            );
            return false;
        }

        if (!formData.assetType) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng chọn Loại TSĐB"
            );
            return false;
        }

        if (!formData.issuer) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng chọn Tổ chức phát hành"
            );
            return false;
        }

        if (!formData.issuerCode.trim()) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng nhập Mã TCPH"
            );
            return false;
        }

        if (!formData.parValue) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng nhập Mệnh giá"
            );
            return false;
        }

        if (!formData.issueDate) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng nhập Ngày phát hành"
            );
            return false;
        }

        if (!formData.maturityDate) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng nhập Ngày đáo hạn"
            );
            return false;
        }

        if (
            new Date(formData.maturityDate) <=
            new Date(formData.issueDate)
        ) {
            notifyWarning(
                "Cảnh báo",
                "Ngày đáo hạn phải sau ngày phát hành"
            );
            return false;
        }

        if (!formData.couponType.trim()) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng nhập Loại lãi suất"
            );
            return false;
        }

        if (!formData.couponRate) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng nhập Lãi suất coupon"
            );
            return false;
        }

        if (!formData.interestPayTerm) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng nhập Kỳ trả lãi"
            );
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const payload = {
                assetId: formData.assetId.trim(),
                assetType: formData.assetType,
                issuer: formData.issuer,
                issuerCode: formData.issuerCode.trim(),
                parValue: Number(formData.parValue),
                issueDate: formData.issueDate,
                maturityDate: formData.maturityDate,
                callDate: formData.callDate || null,
                couponType: formData.couponType.trim(),
                couponRate: Number(formData.couponRate),
                interestPayTerm: Number(formData.interestPayTerm),
            };
            const res = await apiClient.post(
                `/v1/capital-source/partners/${partnerId}/collateral-assets`,
                payload
            );
            if (res.data.success) {
                notifySuccess(
                    "Thành công",
                    "Đã thêm tài sản bảo đảm"
                );

                setIsCreating(false);

                setFormData({
                    ...initialFormData,
                    issuer: partnerId,
                });

                await fetchAssets();
            } else {
                notifyError(
                    "Lỗi",
                    res.data.message ||
                        "Không thể thêm tài sản bảo đảm"
                );
            }
        } catch (error: any) {
            notifyError(
                "Lỗi",
                error.response?.data?.message ||
                    "Không thể thêm tài sản bảo đảm"
            );
        } finally {
            setSaving(false);
        }
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
            render: (value) =>
                value
                    ? new Date(value as string).toLocaleDateString("vi-VN")
                    : "-",
        },
        {
            key: "maturityDate",
            title: "Ngày đáo hạn",
            render: (value) =>
                value
                    ? new Date(value as string).toLocaleDateString("vi-VN")
                    : "-",
        },
        {
            key: "callDate",
            title: "Ngày mua lại trước hạn",
            render: (value) =>
                value
                    ? new Date(value as string).toLocaleDateString("vi-VN")
                    : "-",
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
            <div className={styles.title}>
                <h2>THÔNG TIN TÀI SẢN ĐẢM BẢO</h2>
            </div>
            <div className={styles.header}>
                <Button
                    type="button"
                    variant="primary"
                    onClick={() => setIsCreating(true)}
                >Thêm mới</Button>
            </div>
            {/*Table*/}
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
            {isCreating && (
                <Modal
                    isOpen={isCreating}
                    onClose={() => {
                        if (!saving) {
                            setIsCreating(false);
                        }
                    }}
                    title="THÊM MỚI TÀI SẢN BẢO ĐẢM"
                    size="lg"
                    closeOnOverlayClick={!saving}>
                    <div className={styles.assetForm}>
                        <div className={styles.formGrid}>

                            <Input
                                label="Mã TSĐB"
                                value={formData.assetId}
                                onChange={(e) =>
                                    handleChange("assetId", e.target.value)
                                }
                                placeholder="Nhập mã TSĐB"
                                disabled={saving}
                                fullWidth
                            />

                            <Select
                                label="Loại TSĐB"
                                value={formData.assetType}
                                onChange={(value) =>
                                    handleChange("assetType", value)
                                }
                                placeholder="-- Chọn loại TSĐB --"
                                options={[
                                    {
                                        label: "Cổ phiếu",
                                        value: "STOCK",
                                    },
                                    {
                                        label: "TPCP",
                                        value: "GOVERNMENT_BOND",
                                    },
                                    {
                                        label: "TPTCTD",
                                        value: "CREDIT_INSTITUTION_BOND",
                                    },
                                    {
                                        label: "TPDN",
                                        value: "CORPORATE_BOND",
                                    },
                                    {
                                        label: "CCTG",
                                        value: "CERTIFICATE_OF_DEPOSIT",
                                    },
                                    {
                                        label: "HĐTG",
                                        value: "DEPOSIT_CONTRACT",
                                    },
                                ]}
                                disabled={saving}
                                fullWidth
                            />

                            <Select
                                label="Tổ chức phát hành"
                                value={formData.issuer}
                                onChange={(value) =>
                                    handleChange("issuer", value)
                                }
                                options={[
                                    {
                                        label: "Đối tác hiện tại",
                                        value: partnerId,
                                    },
                                ]}
                                disabled={saving}
                                fullWidth
                            />

                            <Input
                                label="Mã TCPH"
                                value={formData.issuerCode}
                                onChange={(e) =>
                                    handleChange("issuerCode", e.target.value)
                                }
                                placeholder="Nhập mã TCPH"
                                disabled={saving}
                                fullWidth
                            />

                            <Input
                                label="Mệnh giá"
                                type="number"
                                value={formData.parValue}
                                onChange={(e) =>
                                    handleChange("parValue", e.target.value)
                                }
                                placeholder="Nhập mệnh giá"
                                min="0"
                                disabled={saving}
                                fullWidth
                            />

                            <Input
                                label="Ngày phát hành"
                                type="date"
                                value={formData.issueDate}
                                onChange={(e) =>
                                    handleChange("issueDate", e.target.value)
                                }
                                disabled={saving}
                                fullWidth
                            />

                            <Input
                                label="Ngày đáo hạn"
                                type="date"
                                value={formData.maturityDate}
                                onChange={(e) =>
                                    handleChange("maturityDate", e.target.value)
                                }
                                disabled={saving}
                                fullWidth
                            />

                            <Input
                                label="Ngày mua lại trước hạn"
                                type="date"
                                value={formData.callDate}
                                onChange={(e) =>
                                    handleChange("callDate", e.target.value)
                                }
                                disabled={saving}
                                fullWidth
                            />

                            <Input
                                label="Loại lãi suất"
                                value={formData.couponType}
                                onChange={(e) =>
                                    handleChange("couponType", e.target.value)
                                }
                                placeholder="Nhập loại lãi suất"
                                disabled={saving}
                                fullWidth
                            />

                            <Input
                                label="Lãi suất coupon (%)"
                                type="number"
                                value={formData.couponRate}
                                onChange={(e) =>
                                    handleChange("couponRate", e.target.value)
                                }
                                placeholder="Nhập lãi suất"
                                min="0"
                                step="0.0001"
                                disabled={saving}
                                fullWidth
                            />

                            <Input
                                label="Kỳ trả lãi (Tháng)"
                                type="number"
                                value={formData.interestPayTerm}
                                onChange={(e) =>
                                    handleChange(
                                        "interestPayTerm",
                                        e.target.value
                                    )
                                }
                                placeholder="Nhập kỳ trả lãi"
                                min="1"
                                step="1"
                                disabled={saving}
                                fullWidth
                            />

                        </div>

                        <div className={styles.formActions}>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreating(false)}
                                disabled={saving}
                            >
                                Hủy bỏ
                            </Button>

                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleSave}
                                isLoading={saving}
                            >
                                Lưu
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

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

