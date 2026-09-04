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
import { ArrowLeft, Check, X, Trash2, RefreshCw } from "lucide-react";
import { formatDate } from "@/utils/format";


interface ContractCreditLimitProps {
    contractId: string;
    partnerId: string;
    onBack: () => void;
}

export default function ContractCreditLimit({ contractId, onBack }: ContractCreditLimitProps) {
    const [creditLimits, setCreditLimits] = useState<CreditLimitItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { notifyError, notifyWarning, notifySuccess } = useNotification();
    const [isCreating, setIsCreating] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [pageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    
    const totalItems = creditLimits.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = creditLimits.slice(startIndex, startIndex + pageSize);

    const [formData, setFormData] = useState({
        limitId: "",
        poolName: "",
        currency: "VND",
        poolType: "",
        totalPool: "",
        startDate: "",
        endDate: "",
    });

    const fetchCreditLimits = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/v1/capital-source/contracts/${contractId}/credit-limits`);
            const payload = res.data?.data || res.data;
            if (payload && payload.content !== undefined) {
                setCreditLimits(payload.content || []);
            } else if (Array.isArray(payload)) {
                setCreditLimits(payload);
            } else {
                setCreditLimits([]);
            }
        } catch (err) {
            notifyError('Lỗi', 'Không thể tải danh sách hạn mức!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contractId) {
            fetchCreditLimits();
        }
    }, [contractId]);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreate = async () => {
        if (!contractId) {
            notifyError("Lỗi", "Không tìm thấy hợp đồng");
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
            notifyWarning("Cảnh báo", "Vui lòng nhập loại hạn mức");
            return;
        }
        if (!formData.totalPool) {
            notifyWarning("Cảnh báo", "Vui lòng nhập hạn mức tổng");
            return;
        }

        const totalPool = Number(formData.totalPool);
        if (!Number.isInteger(totalPool) || totalPool <= 0) {
            notifyWarning("Cảnh báo", "Hạn mức tổng phải là số nguyên dương");
            return;
        }
        if (!formData.startDate || !formData.endDate) {
            notifyWarning("Cảnh báo", "Vui lòng nhập ngày bắt đầu và ngày hết hạn");
            return;
        }
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            notifyWarning("Cảnh báo", "Ngày hết hạn phải sau ngày bắt đầu");
            return;
        }

        try {
            setSaving(true);
            const payload = {
                limitId: formData.limitId.trim(),
                poolName: formData.poolName.trim(),
                currency: formData.currency,
                poolType: formData.poolType.trim(),
                totalPool,
                startDate: formData.startDate,
                endDate: formData.endDate,
            };

            const res = await apiClient.post(
                `/v1/capital-source/contracts/${contractId}/credit-limits`,
                payload
            );

            if (res.data.success || res.status === 200 || res.status === 201) {
                notifySuccess("Thành công", "Đã tạo hạn mức chi tiết");
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
                await fetchCreditLimits();
            } else {
                notifyError("Lỗi", res.data.message || "Không thể tạo hạn mức");
            }
        } catch (err: any) {
            notifyError("Lỗi", err.response?.data?.message || "Không thể tạo hạn mức");
        } finally {
            setSaving(false);
        }
    };

    const handleApproveLimit = async (limitId: string) => {
        if (!window.confirm("Xác nhận duyệt hạn mức này?")) return;
        try {
            setLoading(true);
            const res: any = await apiClient.put(`/v1/capital-source/contracts/${contractId}/credit-limits/${limitId}/approve`);
            if (res && res.success === false) {
                notifyError("Lỗi", res.message || "Không thể duyệt hạn mức");
                setLoading(false);
                return;
            }
            notifySuccess("Thành công", "Đã duyệt hạn mức");
            fetchCreditLimits();
        } catch (err: any) {
            notifyError("Lỗi", err.message || err.response?.data?.message || "Không thể duyệt hạn mức");
            setLoading(false);
        }
    };

    const handleRejectLimit = async (limitId: string) => {
        if (!window.confirm("Xác nhận từ chối hạn mức này?")) return;
        try {
            setLoading(true);
            const res: any = await apiClient.put(`/v1/capital-source/contracts/${contractId}/credit-limits/${limitId}/reject`);
            if (res && res.success === false) {
                notifyError("Lỗi", res.message || "Không thể từ chối hạn mức");
                setLoading(false);
                return;
            }
            notifySuccess("Thành công", "Đã từ chối hạn mức");
            fetchCreditLimits();
        } catch (err: any) {
            notifyError("Lỗi", err.message || err.response?.data?.message || "Không thể từ chối hạn mức");
            setLoading(false);
        }
    };

    const handleApproveDelete = async (limitId: string) => {
        if (!window.confirm("Xác nhận đồng ý xoá hạn mức này?")) return;
        try {
            setLoading(true);
            const res: any = await apiClient.put(`/v1/capital-source/contracts/${contractId}/credit-limits/${limitId}/approve-delete`);
            if (res && res.success === false) {
                notifyError("Lỗi", res.message || "Không thể duyệt xoá hạn mức");
                setLoading(false);
                return;
            }
            notifySuccess("Thành công", "Đã duyệt xoá hạn mức");
            fetchCreditLimits();
        } catch (err: any) {
            notifyError("Lỗi", err.message || err.response?.data?.message || "Không thể duyệt xoá hạn mức");
            setLoading(false);
        }
    };

    const handleRejectDelete = async (limitId: string) => {
        if (!window.confirm("Xác nhận từ chối xoá (khôi phục) hạn mức này?")) return;
        try {
            setLoading(true);
            const res: any = await apiClient.put(`/v1/capital-source/contracts/${contractId}/credit-limits/${limitId}/reject-delete`);
            if (res && res.success === false) {
                notifyError("Lỗi", res.message || "Không thể khôi phục hạn mức");
                setLoading(false);
                return;
            }
            notifySuccess("Thành công", "Đã khôi phục hạn mức");
            fetchCreditLimits();
        } catch (err: any) {
            notifyError("Lỗi", err.message || err.response?.data?.message || "Không thể khôi phục hạn mức");
            setLoading(false);
        }
    };

    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const handlePageChange = (page: number) => { setCurrentPage(page); };

    const columns: TableColumn<CreditLimitItem>[] = [
        {
            key: "stt",
            title: "STT",
            render: (_value, _row, index) => startIndex + index + 1,
            width: 60,
        },
        { key: "limitId", title: "Mã hạn mức" },
        { key: "poolName", title: "Tên hạn mức" },
        { key: "poolType", title: "Loại hạn mức" },
        { key: "currency", title: "Đơn vị tiền tệ" },
        {
            key: "totalPool",
            title: "Hạn mức tổng",
            render: (value) => value !== null && value !== undefined ? Number(value).toLocaleString("vi-VN") : "-",
        },
        {
            key: "usedPool",
            title: "Đã sử dụng",
            render: (value) => value !== null && value !== undefined ? Number(value).toLocaleString("vi-VN") : "-",
        },
        {
            key: "remainPool",
            title: "Còn lại",
            render: (value) => {
                const remain = Number(value);
                return (
                    <span className={remain < 0 ? styles.statusInactive : styles.statusActive}>
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
            align: 'center',
            render: (value, row) => {
                const today = new Date();
                if (row.endDate && new Date(row.endDate) < today) {
                    return <span className={styles.statusDuedate}>Close</span>;
                }
                if (value === "CLOSE") {
                    return <span className={styles.statusDuedate}>Close</span>;
                }
                const { label, className } = getStatusDisplay(value as string);
                return (
                    <span className={styles[className] || styles.statusPending}>
                        {label || (value as string)}
                    </span>
                );
            },
        },
        {
            key: "actions",
            title: "Thao tác",
            align: 'center',
            render: (_value, row) => {
                const status = row.status;
                return (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {status === 'PENDING_APPROVAL' && (
                            <>
                                <Button 
                                    variant="primary" 
                                    style={{ background: '#16a34a', borderColor: '#16a34a', padding: '4px 8px' }}
                                    onClick={() => handleApproveLimit(row.id)}
                                    title="Duyệt"
                                >
                                    <Check size={16} />
                                </Button>
                                <Button 
                                    variant="primary" 
                                    style={{ background: '#dc2626', borderColor: '#dc2626', padding: '4px 8px' }}
                                    onClick={() => handleRejectLimit(row.id)}
                                    title="Từ chối"
                                >
                                    <X size={16} />
                                </Button>
                            </>
                        )}
                        {status === 'PENDING_DELETE' && (
                            <>
                                <Button 
                                    variant="primary" 
                                    style={{ background: '#dc2626', borderColor: '#dc2626', padding: '4px 8px' }}
                                    onClick={() => handleApproveDelete(row.id)}
                                    title="Duyệt xoá"
                                >
                                    <Trash2 size={16} />
                                </Button>
                                <Button 
                                    variant="primary" 
                                    style={{ background: '#f59e0b', borderColor: '#f59e0b', padding: '4px 8px' }}
                                    onClick={() => handleRejectDelete(row.id)}
                                    title="Từ chối xoá (Khôi phục)"
                                >
                                    <RefreshCw size={16} />
                                </Button>
                            </>
                        )}
                        {status === 'APPROVED' && (
                            <Button 
                                variant="outline" 
                                style={{ color: '#dc2626', borderColor: '#dc2626', padding: '4px 8px' }}
                                onClick={async () => {
                                    if (!window.confirm("Bạn có chắc chắn muốn xoá hạn mức này?")) return;
                                    try {
                                        setLoading(true);
                                        await apiClient.delete(`/v1/capital-source/contracts/${contractId}/credit-limits/${row.id}`);
                                        notifySuccess("Thành công", "Đã gửi yêu cầu xoá hạn mức");
                                        fetchCreditLimits();
                                    } catch (err: any) {
                                        notifyError("Lỗi", err.response?.data?.message || "Không thể xoá hạn mức");
                                        setLoading(false);
                                    }
                                }}
                                title="Xoá Hạn mức"
                            >
                                <Trash2 size={16} />
                            </Button>
                        )}
                    </div>
                );
            }
        }
    ];

    if (loading && creditLimits.length === 0) return <div className={styles.loading}>Đang tải dữ liệu...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft size={16} /> Quay lại
                    </Button>
                    <h2 className={styles.title} style={{ margin: 0 }}>
                        CHI TIẾT HẠN MỨC
                    </h2>
                </div>
                <Button variant="primary" onClick={() => setIsCreating(true)}>
                    Thêm tiểu mục hạn mức
                </Button>
            </div>

            <div className={styles.content}>
                <Table
                    columns={columns}
                    data={currentData}
                    isLoading={loading}
                    rowKey="id"
                    emptyText="Không có dữ liệu hạn mức"
                />
            </div>

            {isCreating && (
                <Modal
                    isOpen={isCreating}
                    onClose={() => { if (!saving) setIsCreating(false); }}
                    title="THÊM MỚI TIỂU MỤC HẠN MỨC"
                >
                    <div className={styles.formGrid}>
                        <Input
                            label="Mã hạn mức"
                            value={formData.limitId}
                            onChange={(e) => handleChange("limitId", e.target.value)}
                            placeholder="Nhập mã hạn mức..."
                            disabled={saving}
                            fullWidth
                        />
                        <Input
                            label="Tên hạn mức"
                            value={formData.poolName}
                            onChange={(e) => handleChange("poolName", e.target.value)}
                            placeholder="Nhập tên hạn mức..."
                            disabled={saving}
                            fullWidth
                        />
                        <Input
                            label="Loại hạn mức"
                            value={formData.poolType}
                            onChange={(e) => handleChange("poolType", e.target.value)}
                            placeholder="Ví dụ: CLEAN, SECURED..."
                            disabled={saving}
                            fullWidth
                        />
                        <Select
                            label="Đơn vị tiền tệ"
                            value={formData.currency}
                            onChange={(value) => handleChange("currency", value)}
                            options={[
                                { label: "VND", value: "VND" },
                                { label: "USD", value: "USD" },
                                { label: "EUR", value: "EUR" },
                            ]}
                            disabled={saving}
                            fullWidth
                        />
                        <Input
                            label="Hạn mức tổng"
                            type="number"
                            min="1"
                            step="1"
                            value={formData.totalPool}
                            onChange={(e) => handleChange("totalPool", e.target.value)}
                            placeholder="Nhập hạn mức tổng..."
                            disabled={saving}
                            fullWidth
                        />
                        <Input
                            label="Ngày bắt đầu"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleChange("startDate", e.target.value)}
                            disabled={saving}
                            fullWidth
                        />
                        <Input
                            label="Ngày hết hạn"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleChange("endDate", e.target.value)}
                            disabled={saving}
                            fullWidth
                        />
                    </div>

                    <div className={styles.formActions}>
                        <Button type="button" variant="outline" onClick={() => setIsCreating(false)} disabled={saving}>
                            Hủy
                        </Button>
                        <Button type="button" variant="primary" onClick={handleCreate} isLoading={saving}>
                            Lưu
                        </Button>
                    </div>
                </Modal>
            )}

            {totalItems > 0 && (
                <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                        Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} của {totalItems} bản ghi
                    </div>
                    <div className={styles.paginationButtons}>
                        <button className={styles.pageBtn} disabled={currentPage === 1} onClick={handlePrevPage}>&lt;</button>
                        {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`${styles.pageBtn} ${currentPage === page ? styles.pageActive : ""}`}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button className={styles.pageBtn} disabled={currentPage === totalPages} onClick={handleNextPage}>&gt;</button>
                    </div>
                </div>
            )}
        </div>
    );
}
