'use client';

import Table, { TableColumn } from "@/components/shared/Table/Table";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { AuthorizationItem, CreateAuthorization } from "@/types/funding.types";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "./AuthorizationTab.module.css";
import Button from "@/components/shared/Button/Button";
import Modal from "@/components/shared/Modal/Modal";
import AuthorizationForm from "./AuthorizationForm";

interface AuthorizationTabProps {
    partnerId: string
};

export default function AuthorizationTab({partnerId}: AuthorizationTabProps) {
    const [author, setAuthor] = useState<AuthorizationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { notifyError, notifySuccess, notifyInfo, notifyWarning } = useNotification();
    const [isOpenModal, setIsOpenModal] = useState(false);
    // const params = useParams();
    // const partnerId = params.id as string;
    
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 3;
    const totalItems = author.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = author.slice(
        startIndex,
        startIndex + pageSize
    );

    const fetchAuthor = async() => {
        try {
            const res = await apiClient.get(`/v1/capital-source/partners/${partnerId}/authorizations`);
            setAuthor(res.data.data || []);
        } catch(error:any) {
            notifyError("Không thể tải danh sách ủy quyền!");
        } finally {
            setLoading(false);
        };
    };

    useEffect(() => {
        if(partnerId) {
            fetchAuthor();
        }
    }, [partnerId]);

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

    const columns: TableColumn<AuthorizationItem>[] = [
        {
            key: "seqId",
            title: "STT",
            width: 40,
            render: (value, row, index) => {
                return row.seqId ?? startIndex + index + 1;
            },
        },
        {
            key: "authName",
            title: "Tên người UQ",
        },
        {
            key: "authidNo",
            title: "CCCD người UQ",
        },
        {
            key: "authissueDate",
            title: "Ngày cấp",
            render: (value) =>
                value
                    ? new Date(value as string).toLocaleDateString("vi-VN")
                    : "-",
        },
        {
            key: "issuePlace",
            title: "Nơi cấp",
        },
        {
            key: "authedName",
            title: "Tên người được UQ",
        },
        {
            key: "authedIdNo",
            title: "CCCD người được UQ",
        },
        {
            key: "authedIssueDate",
            title: "Ngày cấp",
            render: (value) =>
                value
                    ? new Date(value as string).toLocaleDateString("vi-VN")
                    : "-",
        },
        {
            key: "authNo",
            title: "Số giấy tờ UQ",
        },
        {
            key: "effDate",
            title: "Ngày hiệu lực",
            render: (value) =>
                value
                    ? new Date(value as string).toLocaleDateString("vi-VN")
                    : "-",
        },
        {
            key: "expiryDate",
            title: "Ngày hết hạn",
            render: (value) =>
                value
                    ? new Date(value as string).toLocaleDateString("vi-VN")
                    : "-",
        },
        {
            key: "authedPosition",
            title: "Chức vụ người được UQ",
        },
        {
            key: "scope",
            title: "Phạm vi UQ",
        },
        {
            key: "status",
            title: "Trạng thái",
            render: (value, row) => {
                const today = new Date();

                if (!row.expiryDate) {
                    return <span>{String(value)}</span>;
                }

                const expiryDate = new Date(row.expiryDate);

                if (value === "INACTIVE") {
                    return (
                        <span className={styles.statusInactive}>
                            Inactive
                        </span>
                    );
                }

                if (expiryDate > today) {
                    return (
                        <span className={styles.statusActive}>
                            Active
                        </span>
                    );
                }

                return (
                    <span className={styles.statusDuedate}>
                        Duedate
                    </span>
                );
            },
        },
        {
            key: "phone",
            title: "SĐT",
        },
        {
            key: "email",
            title: "Email",
        },
    ];

    const nextSeqId = useMemo(() => {
        if(author.length === 0) return 1;
        const maxSeqId = Math.max(...author.map(item => item.seqId || 0));
        return maxSeqId + 1;
    }, [author]);

    const handleCreate = async(data: CreateAuthorization) => {
        try {
            const payload = {
                ...data, 
                seqId: nextSeqId,
            }
            await apiClient.post(`/v1/capital-source/partners/${partnerId}/authorizations`, payload);
            notifySuccess('Thành công', 'Đã thêm thành công!');
            setIsOpenModal(false);
            await fetchAuthor();
        } catch (err:any){
            notifyError(err.response?.data?.message || "Có lỗi xảy ra!");
        }
    }
    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <h2>DANH SÁCH ỦY QUYỀN/NGƯỜI ĐẠI DIỆN PHÁP LUẬT</h2>
            </div>
            <div className={styles.header}>
                <Button variant="primary" onClick={() => setIsOpenModal(true)}>Thêm mới</Button>
            </div>
            {/*Table */}
            <div className={styles.table}>
                <Table 
                    columns={columns}
                    rowKey="id" 
                    data={currentData}  
                    isLoading={loading}  
                    emptyText="Không có dữ liệu ủy quyền"            
                />
            </div>
            {isOpenModal && (
                <Modal
                    isOpen={isOpenModal}
                    onClose={() => setIsOpenModal(false)}
                    title="Thêm mới Ủy quyền"
                    size="lg"
                    footer={<>
                        <Button
                            variant="outline"
                            onClick={() => setIsOpenModal(false)}
                        >
                            Hủy
                        </Button>

                        <Button
                            variant="primary" 
                            type="submit"
                            form="authorization-form"
                        >
                            Lưu
                        </Button>
                    
                    </>}
                >
                    <AuthorizationForm onSubmit={handleCreate} nextSeqId={nextSeqId}/>
                </Modal>
            )}
            {/*Phân trang */}
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
            {/* )}  */}
        </div>
    )
} 
	
