import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { CreditLimitItem } from "@/types/funding.types";
import { useEffect, useState } from "react";
import styles from './CrelimitTab.module.css';
import Table, { TableColumn } from "@/components/shared/Table/Table";
import Button from "@/components/shared/Button/Button";
import Input from "@/components/shared/Input/Input";
import Select from "@/components/shared/Select/Select";
import Modal from "@/components/shared/Modal/Modal";
import { getStatusDisplay } from "@/constants/status";
import { formatDate } from "@/utils/format";


interface CrelimitTabProps {
    partnerId: string;
    isView?: boolean;
}export default function CrelimitTab({partnerId, isView}: CrelimitTabProps) {
    const [creditLimits, setCreditLimits] = useState<CreditLimitItem[]>([]);
    const [loading, setLoading] = useState(false);
    const {notifyError, notifyWarning, notifySuccess} = useNotification();
    const [isCreating, setIsCreating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [pageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    // Tinh toan cho phan trang
    const totalItems = creditLimits.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = creditLimits.slice(
        startIndex,
        startIndex + pageSize
    );

    const [formData, setFormData] = useState({
        limitId: "",
        poolName: "",
        currency: "VND",
        poolType: "",
        totalPool: "",
        startDate: "",
        endDate: "",
    });

    const fetchCreditLimits = async() => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/v1/capital-source/credit-limits?partnerId=${partnerId}&size=100`);
            const payload = res.data?.data || res.data;
            if (payload && payload.content !== undefined) {
                setCreditLimits(payload.content || []);
            } else if (Array.isArray(payload)) {
                setCreditLimits(payload);
            } else {
                setCreditLimits([]);
            }
        } catch(err) {
            notifyError('Lỗi', 'Không thể tải danh sách hạn mức!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(partnerId) {
            fetchCreditLimits();
        }
    }, [partnerId]);

    const handleChange = (
        field: keyof typeof formData,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCreate = async () => {
    if (!partnerId) {
        notifyError("Lỗi", "Không tìm thấy đối tác");
        return;
    }

    if (!formData.limitId.trim()) {
        notifyWarning("Cảnh báo", "Vui lòng nhập mã hạn mức");
        return;
    }

    if (!formData.poolName.trim()) {
        notifyWarning("Cảnh báo", "Vui lòng nhập tên hạn mức");
        return;
    }

    if (!formData.poolType.trim()) {
        notifyWarning("Cảnh báo", "Vui lòng nhập số HĐ tín dụng");
        return;
    }

    if (!formData.totalPool) {
        notifyWarning("Cảnh báo", "Vui lòng nhập hạn mức tổng");
        return;
    }

    const totalPool = Number(formData.totalPool);

        if (!Number.isInteger(totalPool) || totalPool <= 0) {
            notifyWarning(
                "Cảnh báo",
                "Hạn mức tổng phải là số nguyên dương"
            );
            return;
        }

        if (!formData.startDate || !formData.endDate) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng nhập ngày bắt đầu và ngày hết hạn"
            );
            return;
        }

        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            notifyWarning(
                "Cảnh báo",
                "Ngày hết hạn phải sau ngày bắt đầu"
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                partnerId: partnerId,
                limitId: formData.limitId.trim(),
                poolName: formData.poolName.trim(),
                currency: formData.currency,
                poolType: formData.poolType.trim(),
                totalPool,
                startDate: formData.startDate,
                endDate: formData.endDate,
            };

            const res = await apiClient.post(
                `/v1/capital-source/partners/${partnerId}/credit-limits`,
                payload
            );

            if (res.data.success) {
                notifySuccess(
                    "Thành công",
                    "Đã tạo hạn mức"
                );

                setIsCreating(false);

                setFormData({
                    limitId: "",
                    poolName: "",
                    currency: "VND",
                    poolType: "",
                    totalPool: "",
                    startDate: "",
                    endDate: "",
                });

                // Load lại danh sách
                await fetchCreditLimits();
            } else {
                notifyError(
                    "Lỗi",
                    res.data.message || "Không thể tạo hạn mức"
                );
            }
        } catch (err: any) {
            notifyError(
                "Lỗi",
                err.response?.data?.message ||
                "Không thể tạo hạn mức"
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

    const columns: TableColumn<CreditLimitItem>[] = [
    {
        key: "stt",
        title: "STT",
        render: (_value, _row, index) => index + 1,
        width: 60,
    },
    {
        key: "limitId",
        title: "Mã hạn mức",
    },
    {
        key: "poolName",
        title: "Tên hạn mức",
    },
    {
        key: "poolType",
        title: "Số HĐ tín dụng",
    },
    {
        key: "currency",
        title: "Đơn vị tiền tệ",
    },
    {
        key: "totalPool",
        title: "Hạn mức tổng",
        render: (value) =>
            value !== null && value !== undefined
                ? Number(value).toLocaleString("vi-VN")
                : "-",
    },
    {
        key: "usedPool",
        title: "Đã sử dụng",
        render: (value) =>
            value !== null && value !== undefined
                ? Number(value).toLocaleString("vi-VN")
                : "-",
    },
    {
        key: "remainPool",
        title: "Còn lại",
        render: (value) => {
            const remain = Number(value);

            return (
                <span
                    className={
                        remain < 0
                            ? styles.statusInactive
                            : styles.statusActive
                    }
                >
                    {remain.toLocaleString("vi-VN")}
                </span>
            );
        },
    },
    {
        key: "startDate",
        title: "Ngày bắt đầu",
        render: (value) => formatDate(value as string),
    },
    {
        key: "endDate",
        title: "Ngày hết hạn",
        render: (value) => formatDate(value as string),
    },
    {
        key: "status",
        title: "Trạng thái",
        render: (value, row) => {
            const today = new Date();

            // EndDate đã qua => Close
            if (row.endDate) {
                const endDate = new Date(row.endDate);

                if (endDate < today) {
                    return (
                        <span className={styles.statusDuedate}>
                            Close
                        </span>
                    );
                }
            }

            if (value === "CLOSE") {
                return (
                    <span className={styles.statusDuedate}>
                        Close
                    </span>
                );
            }

            const { label, className } = getStatusDisplay(value as string);
            return (
                <span className={styles[className] || styles.statusPending}>
                    {label}
                </span>
            );
        },
    },
    ];

    if(loading) return <div className={styles.loading}>Đang tải dữ liệu...</div>
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    DANH SÁCH HẠN MỨC
                </h2>
                <Button
                    variant="primary"
                    onClick={() => setIsCreating(true)}
                >
                    Thêm mới
                </Button>
            </div>

            <div className={styles.content}>
                <Table
                    columns={columns}
                    data={creditLimits}
                    isLoading={loading} 
                    rowKey="id"
                    emptyText="Không có dữ liệu hạn mức"                
                />
            </div>

            {/*Modal */}
            {isCreating && (
                <Modal
                    isOpen={isCreating}
                    onClose={() => {
                        if (!saving) {
                            setIsCreating(false);
                        }
                    }}
                    title="THÊM MỚI HẠN MỨC"
                >
                    <div className={styles.formGrid}>
                        {/* Mã hạn mức */}
                        <Input
                            label="Mã hạn mức"
                            value={formData.limitId}
                            onChange={(e) =>
                                handleChange("limitId", e.target.value)
                            }
                            placeholder="Nhập mã hạn mức..."
                            disabled={saving}
                            fullWidth
                        />

                        {/* Tên hạn mức */}
                        <Input
                            label="Tên hạn mức"
                            value={formData.poolName}
                            onChange={(e) =>
                                handleChange("poolName", e.target.value)
                            }
                            placeholder="Nhập tên hạn mức..."
                            disabled={saving}
                            fullWidth
                        />

                        {/* Số HĐ tín dụng */}
                        <Input
                            label="Số HĐ tín dụng"
                            value={formData.poolType}
                            onChange={(e) =>
                                handleChange("poolType", e.target.value)
                            }
                            placeholder="Nhập Số HĐ tín dụng..."
                            disabled={saving}
                            fullWidth
                        />

                        {/* Đơn vị tiền tệ */}
                        <Select
                            label="Đơn vị tiền tệ"
                            value={formData.currency}
                            onChange={(value) =>
                                handleChange("currency", value)
                            }
                            options={[
                                {
                                    label: "VND",
                                    value: "VND",
                                },
                                {
                                    label: "USD",
                                    value: "USD",
                                },
                                {
                                    label: "EUR",
                                    value: "EUR",
                                },
                            ]}
                            disabled={saving}
                            fullWidth
                        />

                        {/* Hạn mức tổng */}
                        <Input
                            label="Hạn mức tổng"
                            type="number"
                            min="1"
                            step="1"
                            value={formData.totalPool}
                            onChange={(e) =>
                                handleChange(
                                    "totalPool",
                                    e.target.value
                                )
                            }
                            placeholder="Nhập hạn mức tổng..."
                            disabled={saving}
                            fullWidth
                        />

                        {/* Ngày bắt đầu */}
                        <Input
                            label="Ngày bắt đầu"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) =>
                                handleChange(
                                    "startDate",
                                    e.target.value
                                )
                            }
                            disabled={saving}
                            fullWidth
                        />

                        {/* Ngày hết hạn */}
                        <Input
                            label="Ngày hết hạn"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) =>
                                handleChange(
                                    "endDate",
                                    e.target.value
                                )
                            }
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
                            Hủy
                        </Button>

                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleCreate}
                            isLoading={saving}
                        >
                            Lưu
                        </Button>
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