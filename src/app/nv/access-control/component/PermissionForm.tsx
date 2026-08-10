'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal/Modal';
import Button from '@/components/shared/Button/Button';
import styles from './AccessControlList.module.css';
import { EmployeeListItemResponse } from '@/types/hr.types';

interface PermissionFormData {
  [resource: string]: {
    [action: string]: boolean;
  };
}

interface PermissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId?: string;
  employee: EmployeeListItemResponse
}

export default function PermissionForm({
  isOpen,
  onClose,
  departmentId
}: PermissionFormProps) {
  const [formData, setFormData] = useState<PermissionFormData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available actions
  const actionOptions = [
    { key: 'VIEW', label: 'Xem' },
    { key: 'CREATE', label: 'Tạo' },
    { key: 'UPDATE', label: 'Cập nhật' },
    { key: 'DELETE', label: 'Xóa' },
    { key: 'APPROVE', label: 'Duyệt' },
    { key: 'EXPORT', label: 'Xuất khẩu' }
  ];

  // Available resources
  const resourceOptions = [
    { key: 'CAPITAL_CONFIG', label: 'Danh mục và Cấu hình' },
    { key: 'CAPITAL_PARTNER_LIMIT', label: 'QL Hạn mức tín dụng' },
    { key: 'CAPITAL_CONTRACT', label: 'QL Khế ước Nhận Nợ' },
    { key: 'CAPITAL_REPAYMENT', label: 'QL Sự kiện Trả Nợ' },
    { key: 'CAPITAL_ASSET', label: 'QL Giao dịch tài sản' },
    { key: 'CAPITAL_REPORT', label: 'Export Excel' },
    { key: 'CAPITAL_BATCH', label: 'Import Excel' },
    { key: 'MANAGE_ROLE_GROUP', label: 'QL Nhóm Vai Trò' },
    { key: 'AUDIT_LOG', label: 'Lịch sử thay đổi' }
  ];

  // Load existing permissions when modal opens
  useEffect(() => {
    if (isOpen && departmentId) {
      loadPermissions();
    }
  }, [isOpen, departmentId]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current permissions for this resource and department
      const response = await fetch(
        `http://localhost:8888/v1/permissions/departments/${departmentId}/screens`
      );

      if (!response.ok) {
        throw new Error('Failed to load permissions');
      }

      const data = await response.json();

      // Initialize form with current permissions
      const initialData: PermissionFormData = {};

      // Create a matrix structure for all resources and actions
      resourceOptions.forEach(res => {
        initialData[res.key] = {};
        actionOptions.forEach(action => {
          initialData[res.key][action.key] = false;
        });
      });

      // Update with actual permissions from API response
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          if (item.resource && Array.isArray(item.actions)) {
            // Ensure resource exists in our structure
            if (initialData.hasOwnProperty(item.resource)) {
              item.actions.forEach((action: string) => {
                if (initialData[item.resource].hasOwnProperty(action)) {
                  initialData[item.resource][action] = true;
                }
              });
            }
          }
        });
      }

      setFormData(initialData);
    } catch (err) {
      setError('Không thể tải quyền. Vui lòng thử lại sau.');
      console.error('Error loading permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (resource: string, action: string) => {
    setFormData(prev => ({
      ...prev,
      [resource]: {
        ...(prev[resource] || {}),
        [action]: !(prev[resource]?.[action] ?? false),
      },
    }));
  };

  const handleSelectAllInResource = (resource: string) => {
    setFormData(prev => {
      const newFormState = { ...prev };
      const allSelected = actionOptions.every(
  action => prev[resource][action.key]
);

      // If all are selected, deselect all; otherwise select all
      actionOptions.forEach(action => {
        newFormState[resource] = {
        ...(newFormState[resource] || {}),
      };
    });
      actionOptions.forEach(action => {
        newFormState[resource][action.key] = !allSelected;
      });

      return newFormState;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!departmentId) return;

    try {
      setLoading(true);

      // Prepare data for API - convert matrix format to array of {resource, actions}
      const permissionsToSave = [];

      for (const resourceKey in formData) {
        const actions = actionOptions
          .filter(action => formData[resourceKey][action.key])
          .map(action => action.key);

        if (actions.length > 0) {
          permissionsToSave.push({
            resource: resourceKey,
            actions
          });
        }
      }

      // Send to API endpoint
      const response = await fetch(
        `http://localhost:8888/v1/permissions/departments/${departmentId}/screens`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(permissionsToSave)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save permissions');
      }

      // Close modal on success
      onClose();
    } catch (err) {
      setError('Không thể lưu quyền. Vui lòng thử lại sau.');
      console.error('Error saving permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isOpen) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Quản lý quyền"
      >
        <div className={styles.loading}>
          Đang tải...
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quản lý quyền"
      size="xl"
    >
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.matrixPermissionForm}>
        <div className={styles.matrixContainer}>
          <table className={styles.permissionMatrixTable}>
            <thead>
              <tr>
                <th className={styles.resourceHeader}>Hành động</th>
                {resourceOptions.map(res => (
                  <th key={res.key} className={styles.actionHeader}>
                    <div className={styles.resourceHeaderContent}>
                      <span>{res.label}</span>
                      <button
                        type="button"
                        onClick={() => handleSelectAllInResource(res.key)}
                        className={styles.selectAllButton}
                        title="Chọn tất cả quyền cho tài nguyên này"
                      >
                        Chọn tất cả
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {actionOptions.map(action => (
                <tr key={action.key}>
                  <td className={styles.actionCell}>{action.label}</td>
                  {resourceOptions.map(res => (
                    <td key={`${res.key}-${action.key}`} className={styles.cell}>
                      <label className={styles.checkboxLabelMatrix}>
                        <input
                          type="checkbox"
                          checked={!!formData[res.key]?.[action.key]}
                          onChange={() => handleCellChange(res.key, action.key)}
                          className={styles.checkboxMatrix}
                        />
                        &nbsp;
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.formFooter}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
          >
            Lưu quyền
          </Button>
        </div>
      </form>
    </Modal>
  );
}