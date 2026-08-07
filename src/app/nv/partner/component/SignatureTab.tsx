'use client';

import Button from "@/components/shared/Button/Button";
import styles from "./SignatureTab.module.css";
import { useState } from "react";
import Table from "@/components/shared/Table/Table";

interface Signature {
    fileName: string;
    typeSignature: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
}

export default function SignatureTab() {
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    
    // Tinh toan cho phan trang
    const totalItems = signatures.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const startIndex = (currentPage - 1) * pageSize;

    const currentData = signatures.slice(
    startIndex,
    startIndex + pageSize
    );

    const columns = [
        {
            key: 'stt',
            title: 'STT',
            render: (_: any, __: any, index: number) => startIndex + index + 1
        },
        {
            key: 'fileName',
            title: 'Tên file',
        },
        {
            key: 'typeSignature',
            title: 'Loại chữ ký'
        },
        {
            key: 'description',
            title: 'Mô tả'
        },
        {
            key: 'startDate',
            title: 'Ngày hiệu lực'
        },
        {
            key: 'endDate',
            title: 'Ngày hết hạn'
        },
        {
            key: 'status',
            title: 'Trạng thái'
        },
        {
            key: 'action',
            title: 'Hành động',
            render: (_:any, record:any) => (
                <div className={styles.actionButtons}>
                    <Button variant="outline" size="sm" >Sửa</Button>
                    <Button variant="danger" size="sm" style={{ marginLeft: 8 }}>Xóa</Button>
                </div>
            )
        }
    ];

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
    return (
        <div className={styles.container}>
            <div className={styles.title}><h2>DANH SÁCH CHỮ KÝ</h2></div>
            <div className={styles.header}>
                <Button variant="primary">Thêm mới</Button>
            </div>
            {/*Table */}
            <div className={styles.table}>
                <Table
                    columns={columns}
                    data={currentData}
                    rowKey="fileName"
                />
            </div>

            {/* Phan trang  */}
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
    )
}