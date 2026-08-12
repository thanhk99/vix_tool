"use client";

import Button from "@/components/shared/Button/Button";
import styles from "./SignatureTab.module.css";
import { useState } from "react";
import Table, { TableColumn } from "@/components/shared/Table/Table";
import Modal from "@/components/shared/Modal/Modal";
import Input from "@/components/shared/Input/Input";
import Select, {
    SelectOption,
} from "@/components/shared/Select/Select";
import { useNotification } from "@/hooks/useNotification";
import { SignatureFormData } from "@/types/funding.types";

const INITIAL_FORM: SignatureFormData = {
    fileName: "",
    typeSignature: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
};

const SIGNATURE_TYPE_OPTIONS: SelectOption[] = [
    {
        label: "Chữ ký số",
        value: "DIGITAL",
    },
    {
        label: "Chữ ký điện tử",
        value: "ELECTRONIC",
    },
];

const STATUS_OPTIONS: SelectOption[] = [
    {
        label: "Hoạt động",
        value: "ACTIVE",
    },
    {
        label: "Không hoạt động",
        value: "INACTIVE",
    },
];

export default function SignatureTab() {
    const [signatures, setSignatures] = useState<SignatureFormData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [isCreating, setIsCreating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<SignatureFormData>(INITIAL_FORM);
     
    const totalItems = signatures.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = signatures.slice(
        startIndex,
        startIndex + pageSize
    );

    const {
        notifyError,
        notifyWarning,
        notifySuccess,
    } = useNotification();

    // =========================
    // Form
    // =========================

    const handleChange = (
        field: keyof SignatureFormData,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleOpenCreate = () => {
        setFormData({
            ...INITIAL_FORM,
        });

        setIsCreating(true);
    };

    const handleCloseCreate = () => {
        if (saving) return;

        setFormData({
            ...INITIAL_FORM,
        });

        setIsCreating(false);
    };

    // =========================
    // Validation
    // =========================

    const validateForm = (): boolean => {
        if (!formData.fileName.trim()) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng chọn file"
            );

            return false;
        }

        if (!formData.typeSignature) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng chọn loại chữ ký"
            );

            return false;
        }

        if (!formData.startDate) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng chọn ngày hiệu lực"
            );

            return false;
        }

        if (!formData.endDate) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng chọn ngày hết hạn"
            );

            return false;
        }

        if (
            new Date(formData.endDate) <=
            new Date(formData.startDate)
        ) {
            notifyWarning(
                "Cảnh báo",
                "Ngày hết hạn phải sau ngày hiệu lực"
            );

            return false;
        }

        if (!formData.status) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng chọn trạng thái"
            );

            return false;
        }

        return true;
    };

    // =========================
    // Save
    // =========================

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const newSignature: SignatureFormData = {
                fileName:
                    formData.fileName.trim(),

                typeSignature:
                    formData.typeSignature,

                description:
                    formData.description.trim(),

                startDate:
                    formData.startDate,

                endDate:
                    formData.endDate,

                status:
                    formData.status,
            };

            setSignatures((prev) => [
                ...prev,
                newSignature,
            ]);

            notifySuccess(
                "Thành công",
                "Đã thêm chữ ký mới"
            );

            setFormData({
                ...INITIAL_FORM,
            });

            setIsCreating(false);

            setCurrentPage(1);
        } catch (error) {
            console.error(
                "Create signature error:",
                error
            );

            notifyError(
                "Lỗi",
                "Không thể thêm chữ ký"
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // Pagination handlers
    // =========================

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(
                currentPage - 1
            );
        }
    };

    const handleNextPage = () => {
        if (
            currentPage < totalPages
        ) {
            setCurrentPage(
                currentPage + 1
            );
        }
    };

    const handlePageChange = (
        page: number
    ) => {
        setCurrentPage(page);
    };

    // =========================
    // Table columns
    // =========================

    const columns: TableColumn<SignatureFormData>[] =
        [
            {
                key: "stt",
                title: "STT",
                render: (
                    _value,
                    _row,
                    index
                ) =>
                    startIndex +
                    index +
                    1,
            },

            {
                key: "fileName",
                title: "Tên file",
            },

            {
                key: "typeSignature",
                title: "Loại chữ ký",

                render: (value) => {
                    const signatureType =
                        String(value);

                    const option =
                        SIGNATURE_TYPE_OPTIONS.find(
                            (item) =>
                                item.value ===
                                signatureType
                        );

                    return (
                        option?.label ??
                        signatureType
                    );
                },
            },

            {
                key: "description",
                title: "Mô tả",
            },

            {
                key: "startDate",
                title: "Ngày hiệu lực",
            },

            {
                key: "endDate",
                title: "Ngày hết hạn",
            },

            {
                key: "status",
                title: "Trạng thái",

                render: (value) => {
                    const status =
                        String(value);

                    const option =
                        STATUS_OPTIONS.find(
                            (item) =>
                                item.value ===
                                status
                        );

                    return (
                        option?.label ??
                        status
                    );
                },
            },

            {
                key: "action",
                title: "Hành động",

                render: () => (
                    <div
                        className={
                            styles.actionButtons
                        }
                    >
                        <Button
                            variant="outline"
                            size="sm"
                        >
                            Sửa
                        </Button>

                        <Button
                            variant="danger"
                            size="sm"
                            style={{
                                marginLeft: 8,
                            }}
                        >
                            Xóa
                        </Button>
                    </div>
                ),
            },
        ];

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <h2>
                    DANH SÁCH CHỮ KÝ
                </h2>
            </div>

            <div className={styles.header}>
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
                    data={currentData}
                    rowKey="fileName"
                    emptyText="Không có dữ liệu chữ ký"
                />
            </div>
                        {/* =========================
                Create Modal
            ========================= */}

            {isCreating && (
                <Modal
                    isOpen={isCreating}
                    onClose={
                        handleCloseCreate
                    }
                    title="THÊM MỚI CHỮ KÝ"
                    size="md"
                    closeOnOverlayClick={
                        !saving
                    }
                >
                    <div
                        className={
                            styles.signatureForm
                        }
                    >
                        <div
                            className={
                                styles.formGrid
                            }
                        >
                            {/* Tên file */}
                        <div className={styles.fileInputWrapper}>
                            <label className={styles.fileInputLabel}>
                                Tên file <span>*</span>
                            </label>

                            <div className={styles.fileInputBox}>
                                <label
                                    htmlFor="signature-file"
                                    className={styles.fileChooseButton}
                                >
                                    Chọn tệp
                                </label>

                                <span className={styles.fileName}>
                                    {formData.fileName || "Chưa có tệp nào được chọn"}
                                </span>

                                <input
                                    id="signature-file"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];

                                        if (file) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                fileName: file.name,
                                            }));
                                        }
                                    }}
                                    disabled={saving}
                                    required
                                    className={styles.hiddenFileInput}
                                />
                            </div>
                        </div>
                            {/* Loại chữ ký */}

                            <Select
                                label="Loại chữ ký"
                                value={
                                    formData.typeSignature
                                }
                                onChange={(
                                    value
                                ) =>
                                    handleChange(
                                        "typeSignature",
                                        value
                                    )
                                }
                                options={
                                    SIGNATURE_TYPE_OPTIONS
                                }
                                placeholder="-- Chọn loại chữ ký --"
                                disabled={
                                    saving
                                }
                                required
                                fullWidth
                            />

                            {/* Mô tả */}

                            <Input
                                label="Mô tả"
                                value={
                                    formData.description
                                }
                                onChange={(
                                    e
                                ) =>
                                    handleChange(
                                        "description",
                                        e
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Nhập mô tả"
                                disabled={
                                    saving
                                }
                                fullWidth
                            />

                            {/* Ngày hiệu lực */}

                            <Input
                                label="Ngày hiệu lực"
                                type="date"
                                value={
                                    formData.startDate
                                }
                                onChange={(
                                    e
                                ) =>
                                    handleChange(
                                        "startDate",
                                        e
                                            .target
                                            .value
                                    )
                                }
                                disabled={
                                    saving
                                }
                                required
                                fullWidth
                            />

                            {/* Ngày hết hạn */}

                            <Input
                                label="Ngày hết hạn"
                                type="date"
                                value={
                                    formData.endDate
                                }
                                onChange={(
                                    e
                                ) =>
                                    handleChange(
                                        "endDate",
                                        e
                                            .target
                                            .value
                                    )
                                }
                                disabled={
                                    saving
                                }
                                required
                                fullWidth
                            />

                            {/* Trạng thái */}

                            <Select
                                label="Trạng thái"
                                value={
                                    formData.status
                                }
                                onChange={(
                                    value
                                ) =>
                                    handleChange(
                                        "status",
                                        value
                                    )
                                }
                                options={
                                    STATUS_OPTIONS
                                }
                                disabled={
                                    saving
                                }
                                required
                                fullWidth
                            />
                        </div>

                        {/* Form actions */}

                        <div
                            className={
                                styles.formActions
                            }
                        >
                            <Button
                                type="button"
                                variant="outline"
                                onClick={
                                    handleCloseCreate
                                }
                                disabled={
                                    saving
                                }
                            >
                                Hủy bỏ
                            </Button>

                            <Button
                                type="button"
                                variant="primary"
                                onClick={
                                    handleSave
                                }
                                isLoading={
                                    saving
                                }
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