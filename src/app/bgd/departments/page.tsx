'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { departmentApi } from '@/lib/api/hr.api';
import { DepartmentResponse, CreateDepartmentRequest } from '@/types/hr.types';
import Table, { TableColumn } from '@/components/shared/Table/Table';
import Button from '@/components/shared/Button/Button';
import Input from '@/components/shared/Input/Input';
import Modal from '@/components/shared/Modal/Modal';
import { useNotification } from '@/hooks/useNotification';
import NotificationContainer from '@/components/shared/Notification/Notification';
import styles from './page.module.css';

const INITIAL_FORM: CreateDepartmentRequest = {
  name: '',
  code: '',
  description: '',
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateDepartmentRequest>(INITIAL_FORM);

  const { notifications, removeNotification, notifyError, notifySuccess } = useNotification();

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await departmentApi.getAll();
      if (res.success && res.data) {
        setDepartments(res.data);
      } else {
        notifyError('Lỗi', 'Không thể tải danh sách phòng ban');
      }
    } catch {
      notifyError('Lỗi', 'Đã xảy ra lỗi khi kết nối tới máy chủ');
    } finally {
      setIsLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await departmentApi.create(formData);
      if (res.success) {
        notifySuccess('Thành công', 'Đã tạo phòng ban mới');
        setIsModalOpen(false);
        setFormData(INITIAL_FORM);
        fetchDepartments();
      } else {
        notifyError('Lỗi', res.message || 'Không thể tạo phòng ban');
      }
    } catch {
      notifyError('Lỗi', 'Đã xảy ra lỗi khi kết nối tới máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Xác nhận vô hiệu hóa phòng ban "${name}"?`)) return;
    try {
      const res = await departmentApi.deactivate(id);
      if (res.success) {
        notifySuccess('Đã vô hiệu hóa', `Phòng ban "${name}" đã bị vô hiệu hóa`);
        fetchDepartments();
      } else {
        notifyError('Lỗi', res.message || 'Không thể vô hiệu hóa phòng ban');
      }
    } catch {
      notifyError('Lỗi', 'Đã xảy ra lỗi khi kết nối tới máy chủ');
    }
  };

  const columns: TableColumn<DepartmentResponse>[] = [
    { key: 'code', title: 'Mã PB', width: '100px' },
    {
      key: 'name',
      title: 'Tên phòng ban',
      render: (_, row) => <strong>{row.name}</strong>,
    },
    {
      key: 'description',
      title: 'Mô tả',
      render: (_, row) => <span>{row.description || '—'}</span>,
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '130px',
      render: (_, row) => {
        const isActive = row.status === 'ACTIVE';
        return (
          <span
            className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusInactive}`}
          >
            {isActive ? 'Hoạt động' : 'Vô hiệu'}
          </span>
        );
      },
    },
    {
      key: 'id',
      title: '',
      width: '100px',
      align: 'right',
      render: (_, row) =>
        row.status === 'ACTIVE' ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeactivate(row.id, row.name)}
          >
            Vô hiệu hóa
          </Button>
        ) : null,
    },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý phòng ban</h1>
          <p className={styles.subtitle}>Quản lý cơ cấu tổ chức và danh sách phòng ban</p>
        </div>
        <div className={styles.actions}>
          <Button variant="outline" onClick={fetchDepartments}>
            Làm mới
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Tạo phòng ban
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={departments}
        rowKey="id"
        isLoading={isLoading}
        emptyText="Chưa có phòng ban nào."
        caption={`Tổng: ${departments.length} phòng ban`}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo phòng ban mới"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleCreate} isLoading={isSubmitting}>
              Tạo phòng ban
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className={styles.form}>
          <Input
            label="Tên phòng ban"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ban Giám đốc"
            required
            fullWidth
          />
          <Input
            label="Mã phòng ban"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="BGD"
            required
            fullWidth
            hint="Viết hoa, không dấu, không khoảng cách"
          />
          <Input
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Mô tả ngắn về phòng ban..."
            fullWidth
          />
        </form>
      </Modal>

    </div>
  );
}
