import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { useEffect, useState } from "react";
import styles from './CrelimitTab.module.css';
import Table, { TableColumn } from "@/components/shared/Table/Table";
import Button from "@/components/shared/Button/Button";
import ContractFormModal from "./ContractFormModal";
import ContractCreditLimit from "./ContractCreditLimit";
import { Eye, Edit2, Check, X, Trash2 } from "lucide-react";
import { getStatusDisplay } from "@/constants/status";
import { formatDate } from "@/utils/format";


interface ContractTabProps {
    partnerId: string;
isView?: boolean;
}

export default function ContractTab({ partnerId, isView }: ContractTabProps) {
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { notifyError, notifySuccess } = useNotification();
    const [isCreating, setIsCreating] = useState(false);
    const [editingContract, setEditingContract] = useState<any>(null);
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

    const [pageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = contracts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = contracts.slice(startIndex, startIndex + pageSize);

    const fetchContracts = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/v1/capital-source/partners/${partnerId}/contracts`);
            const payload = res.data?.data || res.data;
            if (payload && payload.content !== undefined) {
                setContracts(payload.content || []);
            } else if (Array.isArray(payload)) {
                setContracts(payload);
            } else {
                setContracts([]);
            }
        } catch (err) {
            notifyError('Lỗi', 'Không thể tải danh sách hợp đồng!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (partnerId) {
            fetchContracts();
        }
    }, [partnerId]);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleApproveContract = async (contractId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn duyệt hợp đồng này?")) return;
        
        try {
            setLoading(true);
            const res: any = await apiClient.put(`/v1/capital-source/contracts/${contractId}/approve`);
            if (res && res.success === false) {
                notifyError('Lỗi', res.message || 'Không thể duyệt hợp đồng');
                setLoading(false);
                return;
            }
            notifySuccess('Thành công', 'Đã duyệt hợp đồng');
            fetchContracts();
        } catch (err: any) {
            notifyError('Lỗi', err.message || err.response?.data?.message || 'Không thể duyệt hợp đồng');
            setLoading(false);
        }
    };

    const handleRejectContract = async (contractId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn từ chối hợp đồng này?")) return;
        
        try {
            setLoading(true);
            const res: any = await apiClient.put(`/v1/capital-source/contracts/${contractId}/reject`);
            if (res && res.success === false) {
                notifyError('Lỗi', res.message || 'Không thể từ chối hợp đồng');
                setLoading(false);
                return;
            }
            notifySuccess('Thành công', 'Đã từ chối hợp đồng');
            fetchContracts();
        } catch (err: any) {
            notifyError('Lỗi', err.message || err.response?.data?.message || 'Không thể từ chối hợp đồng');
            setLoading(false);
        }
    };

    const handleDeleteContract = async (contractId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xoá hợp đồng này?")) return;
        
        try {
            setLoading(true);
            const res: any = await apiClient.delete(`/v1/capital-source/contracts/${contractId}`);
            if (res && res.success === false) {
                notifyError('Lỗi', res.message || 'Không thể xoá hợp đồng');
                setLoading(false);
                return;
            }
            notifySuccess('Thành công', 'Đã xoá hợp đồng');
            fetchContracts();
        } catch (err: any) {
            notifyError('Lỗi', err.message || err.response?.data?.message || 'Không thể xoá hợp đồng');
            setLoading(false);
        }
    };

    const columns: TableColumn<any>[] = [
        {
            key: "stt",
            title: "STT",
            render: (_value, _row, index) => startIndex + index + 1,
            width: 60,
        },
        {
            key: "contractNo",
            title: "Số hợp đồng",
        },
        {
            key: "totalLimit",
            title: "Tổng hạn mức",
            align: 'right',
            render: (value) =>
                value !== null && value !== undefined
                    ? Number(value).toLocaleString("vi-VN")
                    : "-",
        },
        {
            key: "purpose",
            title: "Mục đích vay vốn",
        },
        {
            key: "startDate",
            title: "Ngày bắt đầu",
            align: 'center',
            render: (value) => formatDate(value as string),
        },
        {
            key: "endDate",
            title: "Ngày hết hạn",
            align: 'center',
            render: (value) => formatDate(value as string),
        },
        {
            key: "status",
            title: "Trạng thái",
            align: 'center',
            render: (value, row) => {
                const today = new Date();
                if (row.endDate) {
                    const endDate = new Date(row.endDate);
                    if (endDate < today) {
                        return <span className={styles.statusDuedate}>Close</span>;
                    }
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
            render: (_value, row) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {row.status === 'PENDING_APPROVAL' && (
                        <>
                            <Button 
                                variant="primary" 
                                style={{ background: '#16a34a', borderColor: '#16a34a', padding: '4px 8px' }}
                                onClick={() => handleApproveContract(row.id)}
                                title="Duyệt"
                            >
                                <Check size={16} />
                            </Button>
                            <Button 
                                variant="primary" 
                                style={{ background: '#dc2626', borderColor: '#dc2626', padding: '4px 8px' }}
                                onClick={() => handleRejectContract(row.id)}
                                title="Từ chối"
                            >
                                <X size={16} />
                            </Button>
                        </>
                    )}
                    <Button 
                        variant="outline" 
                        style={{ padding: '4px 8px' }}
                        onClick={() => setEditingContract(row)}
                        title="Sửa Hợp đồng"
                    >
                        <Edit2 size={16} />
                    </Button>
                    <Button 
                        variant="outline" 
                        style={{ color: '#dc2626', borderColor: '#dc2626', padding: '4px 8px' }}
                        onClick={() => handleDeleteContract(row.id)}
                        title="Xoá Hợp đồng"
                    >
                        <Trash2 size={16} />
                    </Button>
                    <Button 
                        variant="primary" 
                        style={{ padding: '4px 8px' }}
                        onClick={() => setSelectedContractId(row.id)}
                        title="Xem Hạn mức chi tiết"
                    >
                        <Eye size={16} style={{marginRight: 4}} /> Hạn mức
                    </Button>
                </div>
            )
        }
    ];

    if (loading && contracts.length === 0) return <div className={styles.loading}>Đang tải dữ liệu...</div>;

    if (selectedContractId) {
        return (
            <ContractCreditLimit 
                contractId={selectedContractId} 
                partnerId={partnerId}
                onBack={() => setSelectedContractId(null)} 
            />
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    DANH SÁCH HỢP ĐỒNG
                </h2>
                <Button
                    variant="primary"
                    onClick={() => setIsCreating(true)}
                >
                    Thêm mới Hợp đồng
                </Button>
            </div>

            <div className={styles.content}>
                <Table
                    columns={columns}
                    data={currentData}
                    isLoading={loading}
                    rowKey="id"
                    emptyText="Không có dữ liệu hợp đồng"
                />
            </div>

            {(isCreating || editingContract) && (
                <ContractFormModal
                    isOpen={isCreating || !!editingContract}
                    onClose={() => {
                        setIsCreating(false);
                        setEditingContract(null);
                    }}
                    partnerId={partnerId}
                    contractData={editingContract}
                    onSuccess={fetchContracts}
                />
            )}

            {totalItems > 0 && (
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
            )}
        </div>
    );
}
