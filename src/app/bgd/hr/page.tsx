'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { hrApi } from '@/lib/api/hr.api';
import { EmployeeListItemResponse, PagedResponse } from '@/types/hr.types';
import Table, { TableColumn } from '@/components/shared/Table/Table';
import Input from '@/components/shared/Input/Input';
import Button from '@/components/shared/Button/Button';
import { useNotification } from '@/hooks/useNotification';
import CreateEmployeeModal from '@/components/bgd/Employee/CreateEmployeeModal';
import EditEmployeeModal from '@/components/bgd/Employee/EditEmployeeModal';
import styles from './page.module.css';
import NotificationContainer from '@/components/shared/Notification/Notification';

export default function HrPage() {
  const [data, setData] = useState<PagedResponse<EmployeeListItemResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<EmployeeListItemResponse | null>(null);

  // Filters and Pagination
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  // Notification hook
  const { notifications, removeNotification, notifyError, notifySuccess } = useNotification();

  const fetchEmployees = useCallback(async (currentPage: number, searchKeyword: string) => {
    setIsLoading(true);
    try {
      const res = await hrApi.getEmployees({
        page: currentPage,
        size,
        keyword: searchKeyword || undefined,
      });
      if (res.success && res.data) {
        setData(res.data);
      } else {
        notifyError('Lỗi', res.message || 'Không thể tải danh sách nhân sự');
      }
    } catch (err: unknown) {
      notifyError('Lỗi', 'Đã xảy ra lỗi khi kết nối tới máy chủ');
    } finally {
      setIsLoading(false);
    }
  }, [size, notifyError]);

  useEffect(() => {
    // Initial fetch
    fetchEmployees(page, keyword);
  }, [fetchEmployees, page]); // Only refetch on page change automatically

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // Reset page on new search
    fetchEmployees(0, keyword);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (data && !data.isLast) setPage(page + 1);
  };

  const columns: TableColumn<EmployeeListItemResponse>[] = [
    { key: 'employeeCode', title: 'Mã NV', width: '120px' },
    {
      key: 'fullName',
      title: 'Họ tên',
      render: (_, row) => (
        <div style={{ fontWeight: 500 }}>{row.fullName}</div>
      ),
    },
    { key: 'email', title: 'Email' },
    {
      key: 'departmentName',
      title: 'Phòng ban',
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '140px',
      render: (_, row) => {
        const isActive = row.status === 'ACTIVE';
        return (
          <span className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusInactive}`}>
            {isActive ? 'Đang làm việc' : 'Nghỉ việc'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Hành động',
      width: '100px',
      render: (_, row) => (
        <Button variant="outline" size="sm" onClick={() => setEditEmployee(row)}>
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý nhân sự</h1>
          <p className={styles.subtitle}>Xem và quản lý danh sách nhân viên trong hệ thống</p>
        </div>
        <div className={styles.actions}>
          <Button variant="outline" onClick={() => fetchEmployees(page, keyword)}>
            Làm mới
          </Button>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <form className={styles.searchBox} onSubmit={handleSearch}>
          <Input
            placeholder="Tìm theo tên, email, mã NV..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            fullWidth
          />
        </form>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={data?.content || []}
        rowKey="id"
        isLoading={isLoading}
        emptyText="Không tìm thấy nhân viên nào."
      />

      {/* Pagination */}
      {data && data.totalElements > 0 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Hiển thị {page * size + 1} - {Math.min((page + 1) * size, data.totalElements)} trong tổng số {data.totalElements} nhân viên
          </span>
          <div className={styles.pageControls}>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={page === 0 || isLoading}
            >
              Trang trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={data.isLast || isLoading}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateEmployeeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchEmployees(page, keyword)}
        notifyError={notifyError}
        notifySuccess={notifySuccess}
      />

      <EditEmployeeModal
        isOpen={editEmployee !== null}
        onClose={() => setEditEmployee(null)}
        onSuccess={() => fetchEmployees(page, keyword)}
        employeeData={editEmployee}
        notifyError={notifyError}
        notifySuccess={notifySuccess}
      />

    </div>
  );
}
