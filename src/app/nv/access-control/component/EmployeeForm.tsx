"use client";

import { useState } from "react";

import Modal from "@/components/shared/Modal/Modal";
import Input from "@/components/shared/Input/Input";
import Select, {
    SelectOption,
} from "@/components/shared/Select/Select";
import Button from "@/components/shared/Button/Button";

import { hrApi } from "@/lib/api/hr.api";
import { CreateEmployeeRequest } from "@/types/hr.types";

import styles from "./EmployeeForm.module.css";
import { useNotification } from "@/hooks/useNotification";

interface EmployeeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const GENDER_OPTIONS: SelectOption[] = [
    {
        label: "Nam",
        value: "MALE",
    },
    {
        label: "Nữ",
        value: "FEMALE",
    },
    {
        label: "Khác",
        value: "OTHER",
    },
];

const ROLE_OPTIONS: SelectOption[] = [
    {
        label: "Trưởng phòng",
        value: "DEPT_ADMIN",
    },
    {
        label: "Nhân viên",
        value: "MEMBER",
    },
];

const INITIAL_FORM: CreateEmployeeRequest = {
    email: "",
    fullName: "",
    password: "",
    departmentId: "",
    role: "MEMBER",
    phone: "",
    gender: undefined,
};

export default function EmployeeForm({
    isOpen,
    onClose,
    onSuccess,
}: EmployeeFormProps) {
    const [formData, setFormData] =
        useState<CreateEmployeeRequest>(INITIAL_FORM);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const {
        notifyError,
        notifySuccess,
    } = useNotification();

    const resetForm = () => {
        setFormData(INITIAL_FORM);
    };

    const handleClose = () => {
        if (isSubmitting) return;

        resetForm();
        onClose();
    };

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.email.trim()) {
            notifyError(
                "Lỗi",
                "Vui lòng nhập email"
            );
            return false;
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailRegex.test(
                formData.email.trim()
            )
        ) {
            notifyError(
                "Lỗi",
                "Email không đúng định dạng"
            );
            return false;
        }

        if (!formData.fullName.trim()) {
            notifyError(
                "Lỗi",
                "Vui lòng nhập họ tên"
            );
            return false;
        }

        if (!formData.password?.trim()) {
            notifyError(
                "Lỗi",
                "Vui lòng nhập mật khẩu"
            );
            return false;
        }

        if (
            formData.password &&
            formData.password.length < 6
        ) {
            notifyError(
                "Lỗi",
                "Mật khẩu phải có ít nhất 6 ký tự"
            );
            return false;
        }

        if (!formData.role) {
            notifyError(
                "Lỗi",
                "Vui lòng chọn chức vụ"
            );
            return false;
        }

        return true;
    };

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);

            const payload: CreateEmployeeRequest = {
                email: formData.email.trim(),
                fullName: formData.fullName.trim(),
                password: formData.password?.trim(),
                role: formData.role,
                phone:
                    formData.phone?.trim() ||
                    undefined,
                gender: formData.gender,
            };

            const res =
                await hrApi.createEmployee(payload);

            if (res.success) {
                notifySuccess(
                    "Thành công",
                    "Đã thêm nhân viên mới"
                );

                resetForm();
                onClose();
                onSuccess();
            } else {
                notifyError(
                    "Lỗi",
                    res.message ||
                        "Không thể tạo nhân viên"
                );
            }
        } catch {
            notifyError(
                "Lỗi",
                "Đã xảy ra lỗi khi tạo nhân viên"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="THÊM MỚI NHÂN VIÊN"
            size="md"
            closeOnOverlayClick={!isSubmitting}
        >
            <form
                className={styles.form}
                onSubmit={handleSubmit}
            >
                <div className={styles.row}>
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ten@vix.local"
                        required
                        disabled={isSubmitting}
                        fullWidth
                    />
                </div>

                <div className={styles.row}>
                    <Input
                        label="Họ tên"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Nhập họ tên nhân viên"
                        required
                        disabled={isSubmitting}
                        fullWidth
                    />
                </div>

                <div className={styles.row}>
                    <Input
                        label="Mật khẩu"
                        name="password"
                        type="password"
                        value={formData.password ?? ""}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        disabled={isSubmitting}
                        fullWidth
                    />
                </div>

                <div className={styles.row}>
                    <Select
                        label="Chức vụ"
                        options={ROLE_OPTIONS}
                        value={formData.role ?? ""}
                        onChange={(value) =>
                            setFormData((prev) => ({
                                ...prev,
                                role:
                                    value as CreateEmployeeRequest["role"],
                            }))
                        }
                        placeholder="-- Chọn chức vụ --"
                        required
                        disabled={isSubmitting}
                        fullWidth
                    />
                </div>

                <div className={styles.row}>
                    <Select
                        label="Giới tính"
                        options={GENDER_OPTIONS}
                        value={formData.gender ?? ""}
                        onChange={(value) =>
                            setFormData((prev) => ({
                                ...prev,
                                gender:
                                    value as CreateEmployeeRequest["gender"],
                            }))
                        }
                        placeholder="-- Chọn giới tính --"
                        disabled={isSubmitting}
                        fullWidth
                    />
                </div>

                <div className={styles.row}>
                    <Input
                        label="Số điện thoại"
                        name="phone"
                        type="tel"
                        value={formData.phone ?? ""}
                        onChange={handleChange}
                        placeholder="0901234567"
                        disabled={isSubmitting}
                        fullWidth
                    />
                </div>

                <div className={styles.formActions}>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>

                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        Tạo nhân viên
                    </Button>
                </div>
            </form>
        </Modal>
    );
}