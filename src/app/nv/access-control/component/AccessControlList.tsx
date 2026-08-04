'use client';

import { useEffect, useState } from 'react';
import styles from './AccessControlList.module.css';
import Button from '@/components/shared/Button/Button';
import Table from '@/components/shared/Table/Table';
import PermissionForm from './PermissionForm';
import apiClient from '@/lib/api/client';
import { ActionCode, CreateRoleGroupRequest, ResourceCode, RoleGroupResponse } from '@/types/permission.types';
import { useNotification } from '@/hooks/useNotification';

export default function AccessControlList() {
    const [roleGroups, setRoleGroups] = useState<RoleGroupResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const { notifyWarning, notifySuccess, notifyError } = useNotification();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [selectedRoleGroup, setSelectedRoleGroup] = useState<RoleGroupResponse | null>(null);
    const [formData, setFormData] = useState<CreateRoleGroupRequest>({
        name: "",
        description: "",
        permissions: [
          {
            resource: ResourceCode.DASHBOARD,
            actions: [ActionCode.VIEW],
          }
        ],
        active: true,
    });

    // ==========================
    // GET ROLE GROUPS
    // ==========================
    const fetchRoleGroups = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/v1/permissions/role-groups');
            setRoleGroups(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoleGroups();
    }, []);

    // ==========================
    // MODAL
    // ==========================

    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
      setShowAddModal(false);
      setFormData({
          name: "",
          description: "",
          permissions: [
            {
                resource: ResourceCode.DASHBOARD,
                actions: [ActionCode.VIEW],
            }
          ],
          active: true,
      });
    };

    const handleOpenPermissionModal = (
        roleGroup: RoleGroupResponse
    ) => {
        setSelectedRoleGroup(roleGroup);
        setShowPermissionModal(true);
    };

    const handleClosePermissionModal = () => {
        setSelectedRoleGroup(null);
        setShowPermissionModal(false);
    };

    // Xu ly thay doi
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const {name, value} = e.target;
      setFormData((prev) => ({
        ...prev, [name]:value
      }))
    }

    const handleActive = (checked:boolean) => {
      setFormData((prev) => ({...prev, active:checked}))
    }

    // Validate
    const validate = () => {
      if(!formData.name.trim()) {
        notifyWarning("Cảnh báo", "Tên nhóm quyền không được để trống!"); return false
      }
      return true;
    }

    // POST 
    const handleCreateRoleGroup = async () => {
      if(!validate()) return;
      try {
        await apiClient.post("/v1/permissions/role-groups", formData);
        notifySuccess("Thành công", "Tạo nhóm quyền thành công!");
        fetchRoleGroups();
        handleCloseModal();
      } catch (error) {
        notifyError("Lỗi", "Không thể tạo nhóm quyền!")
      }
    }
    // ==========================
    // TABLE
    // ==========================

    const columns = [
        {
            key: 'name',
            title: 'Tên nhóm quyền',
        },
        {
            key: 'description',
            title: 'Mô tả',
        },
        {
            key: 'isActive',
            title: 'Trạng thái',
            render: (value: unknown,
                    row: RoleGroupResponse,
                    rowIndex: number) =>
                row.isActive ? 'Hoạt động' : 'Ngừng hoạt động',
        },
        {
            key: 'actions',
            title: 'Hành động',
            render: (value: unknown,
                    row: RoleGroupResponse,
                    rowIndex: number) => (
                <div className={styles.actionButtons}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            handleOpenPermissionModal(row)
                        }
                    >
                        Sửa
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                    >
                        Xóa
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button onClick={handleShowAddModal}>
                    Thêm nhóm quyền
                </Button>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    data={roleGroups}
                    rowKey="id"
                    isLoading={loading}
                />
            </div>

            {/* Modal thêm nhóm quyền */}
            {showAddModal && (
                <div
                    className={styles.modalOverlay}
                    onClick={handleCloseModal}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Thêm nhóm quyền</h3>

                        <div className={styles.formGroup}>
                            <label>Tên nhóm quyền</label>

                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Mô tả</label>

                            <textarea
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Trạng thái</label>

                            <div className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) =>
                                        handleActive(e.target.checked)
                                    }
                                />

                                <span>Hoạt động</span>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                          <Button
                              variant="secondary"
                              onClick={handleCloseModal}
                          >
                              Hủy
                          </Button>

                          <Button
                              onClick={handleCreateRoleGroup}
                          >
                              Lưu
                          </Button>
                      </div>
                    </div>
                </div>
            )}

            {/* Modal chỉnh sửa quyền */}
            {showPermissionModal && selectedRoleGroup && (
                <PermissionForm
                    isOpen={showPermissionModal}
                    onClose={handleClosePermissionModal}
                    departmentId={selectedRoleGroup.deptId}
                />
            )}
        </div>
    );
}