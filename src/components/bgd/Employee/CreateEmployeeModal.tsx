'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal/Modal';
import Input from '@/components/shared/Input/Input';
import Select, { SelectOption } from '@/components/shared/Select/Select';
import Button from '@/components/shared/Button/Button';
import { hrApi, departmentApi} from '@/lib/api/hr.api';
import { CreateEmployeeRequest } from '@/types/hr.types';
import styles from './CreateEmployeeModal.module.css';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  notifyError: (title: string, message?: string) => void;
  notifySuccess: (title: string, message?: string) => void;
}

const GENDER_OPTIONS: SelectOption[] = [
  { label: 'Nam', value: 'MALE' },
  { label: 'Nữ', value: 'FEMALE' },
  { label: 'Khác', value: 'OTHER' },
];

const ROLE_OPTIONS: SelectOption[] = [
  {
    label: 'Trưởng phòng',
    value: 'DEPT_ADMIN',
  },
  {
    label: 'Nhân viên',
    value: 'MEMBER',
  },
];

const INITIAL_FORM: CreateEmployeeRequest = {
  email: '',
  fullName: '',
  password: '',
  departmentId: '',
  role: 'MEMBER',
};

export default function CreateEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
  notifyError,
  notifySuccess,
}: CreateEmployeeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateEmployeeRequest>(INITIAL_FORM);
  const [deptOptions, setDeptOptions] = useState<SelectOption[]>([]);
  /* Load department list when modal opens */
  useEffect(() => {
    if (!isOpen) return;

    async function loadDepartments() {
      try {
        const res = await departmentApi.getAll();
        if (res.success && res.data) {
          setDeptOptions(
            res.data.map((d) => ({ label: `${d.name} (${d.code})`, value: d.id })),
          );
        }
      } catch {
        notifyError('Lỗi', 'Không thể tải danh sách phòng ban');
      }
    }

    loadDepartments();
  }, [isOpen, notifyError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.departmentId) {
      notifyError('Lỗi', 'Vui lòng chọn phòng ban');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateEmployeeRequest = {
        ...formData,
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        password: formData.password?.trim(),
        role: formData.role || 'MEMBER',
        phone: formData.phone?.trim() || undefined,
      };
      const res = await hrApi.createEmployee(payload);
      if (res.success) {
        notifySuccess('Thành công', 'Đã thêm nhân viên mới');
        onSuccess();
        onClose();
        setFormData(INITIAL_FORM);
      } else {
        notifyError('Lỗi', res.message || 'Không thể tạo nhân viên');
      }
    } catch {
      notifyError('Lỗi', 'Đã xảy ra lỗi khi kết nối tới máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm nhân viên mới"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting} >
            Tạo nhân viên
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <Input
            label="Họ và tên"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            required
            fullWidth
          />
        </div>

        <div className={styles.row}>
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ten@vix.local"
            required
            fullWidth
          />
        </div>

        <div className={styles.row}>
          <Input
            label="Mật khẩu"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            fullWidth
          />
        </div>

        <div className={styles.row}>
          <Select
            label="Phòng ban"
            options={deptOptions}
            value={formData.departmentId}
            onChange={(value) => setFormData((prev) => ({ ...prev, departmentId: value }))}
            placeholder="-- Chọn phòng ban --"
            required
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
                      role: value as "DEPT_ADMIN" | "MEMBER",
                  }))
              }
              placeholder="-- Chọn chức vụ --"
              required
              fullWidth
          />
        </div>

        <div className={styles.row}>
          <Select
            label="Giới tính"
            options={GENDER_OPTIONS}
            value={formData.gender ?? ''}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                gender: value as CreateEmployeeRequest['gender'],
              }))
            }
            placeholder="-- Chọn giới tính --"
            fullWidth
          />
        </div>

        <div className={styles.row}>
          <Input
            label="Số điện thoại"
            name="phone"
            type="tel"
            value={formData.phone ?? ''}
            onChange={handleChange}
            placeholder="0901234567"
            fullWidth
          />
        </div>
      </form>
    </Modal>
  );
}
