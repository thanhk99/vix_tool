'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal/Modal';
import Button from '@/components/shared/Button/Button';
import styles from './AccessControlList.module.css';
import { EmployeeListItemResponse } from '@/types/hr.types';
import { permissionApi } from '@/lib/api/permission.api';

interface PermissionFormData {
  [resource: string]: {
    [action: string]: boolean;
  };
}

interface PermissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeListItemResponse
}

export default function PermissionForm({
  isOpen,
  onClose,
  employee
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

  // Available resources and their allowed actions (sync with Backend ResourceCode)
  const resourceOptions = [
    { key: 'CAPITAL_CONFIG', label: 'Danh mục và Cấu hình', allowedActions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'] },
    { key: 'CAPITAL_PARTNER', label: 'Quản lý đối tác', allowedActions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'] },
    { key: 'CAPITAL_LIMIT', label: 'QL Hạn mức tín dụng', allowedActions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'] },
    { key: 'CAPITAL_CONTRACT', label: 'QL Khế ước Nhận Nợ', allowedActions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'] },
    { key: 'CAPITAL_REPAYMENT', label: 'QL Sự kiện Trả Nợ', allowedActions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'] },
    { key: 'CAPITAL_ASSET', label: 'QL Giao dịch tài sản', allowedActions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'] },
    { key: 'CAPITAL_REPORT', label: 'Export Excel', allowedActions: ['VIEW', 'EXPORT'] },
    { key: 'CAPITAL_BATCH', label: 'Import Excel', allowedActions: ['VIEW'] },
    { key: 'MANAGE_ROLE_GROUP', label: 'QL Nhóm Vai Trò', allowedActions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'] },
    { key: 'AUDIT_LOG', label: 'Lịch sử thay đổi', allowedActions: ['VIEW', 'EXPORT'] }
  ];

  // Load existing permissions when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPermissions();
    }
  }, [isOpen]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current permissions for this resource and department
      const res = await permissionApi.getUserPermissions(employee.id);

      if (!res.success) {
        throw new Error('Failed to load permissions');
      }

      const data = res.data;

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

    try {
      setLoading(true);

      // Prepare data for API - convert matrix format to array of {resource, actions}
      const permissionsToSave = [];

      for (const resourceKey in formData) {
        const actions = actionOptions
          .filter(action => formData[resourceKey][action.key])
          .map(action => action.key as any); // Cast or just as any

        if (actions.length > 0) {
          permissionsToSave.push({
            resource: resourceKey as any,
            actions: actions
          });
        }
      }

      // Send to API endpoint
      const res = await permissionApi.saveUserPermissions(employee.id, permissionsToSave);

      if (!res.success) {
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
                  {resourceOptions.map(res => {
                    const isAllowed = res.allowedActions.includes(action.key);
                    return (
                      <td key={`${res.key}-${action.key}`} className={styles.cell}>
                        {isAllowed && (
                          <label className={styles.checkboxLabelMatrix}>
                            <input
                              type="checkbox"
                              checked={!!formData[res.key]?.[action.key]}
                              onChange={() => handleCellChange(res.key, action.key)}
                              className={styles.checkboxMatrix}
                            />
                            &nbsp;
                          </label>
                        )}
                      </td>
                    );
                  })}
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