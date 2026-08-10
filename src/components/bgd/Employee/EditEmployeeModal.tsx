'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal/Modal';
import Input from '@/components/shared/Input/Input';
import Select, { SelectOption } from '@/components/shared/Select/Select';
import Button from '@/components/shared/Button/Button';
import { hrApi, departmentApi } from '@/lib/api/hr.api';
import { UpdateEmployeeRequest, EmployeeListItemResponse } from '@/types/hr.types';
import styles from './CreateEmployeeModal.module.css'; // Reuse styles

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeData: EmployeeListItemResponse | null;
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

export default function EditEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
  employeeData,
  notifyError,
  notifySuccess,
}: EditEmployeeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const [formData, setFormData] = useState<UpdateEmployeeRequest>({
    fullName: '',
    role: 'MEMBER',
  });

  const [departmentId, setDepartmentId] = useState<string>('');
  const [originalDepartmentId, setOriginalDepartmentId] = useState<string>('');
  const [deptOptions, setDeptOptions] = useState<SelectOption[]>([]);

  // Fetch full details when modal opens
  useEffect(() => {
    if (isOpen && employeeData) {
      const loadDetails = async () => {
        setIsLoadingDetails(true);
        try {
          // Fetch departments for dropdown
          const deptRes = await departmentApi.getAll();
          if (deptRes.success && deptRes.data) {
            setDeptOptions(
              deptRes.data.map((d) => ({ label: `${d.name} (${d.code})`, value: d.id })),
            );
          }

          // Fetch employee details
          const res = await hrApi.getEmployeeDetail(employeeData.id);
          if (res.success && res.data) {
            setFormData({
              fullName: res.data.fullName,
              phone: res.data.phone || undefined,
              gender: (res.data.gender as 'MALE' | 'FEMALE' | 'OTHER') || undefined,
              positionId: res.data.positionId || undefined,
              birthDate: res.data.birthDate || undefined,
              address: res.data.address || undefined,
              idCardNumber: res.data.idCardNumber || undefined,
              idCardIssuedDate: res.data.idCardIssuedDate || undefined,
              idCardIssuedPlace: res.data.idCardIssuedPlace || undefined,
              joinDate: res.data.joinDate || undefined,
              avatarUrl: res.data.avatarUrl || undefined,
              role: res.data.role || 'MEMBER',
            });
            setDepartmentId(res.data.departmentId || '');
            setOriginalDepartmentId(res.data.departmentId || '');
          } else {
            notifyError('Lỗi', 'Không thể tải chi tiết nhân viên');
          }
        } catch {
          notifyError('Lỗi', 'Đã xảy ra lỗi khi kết nối tới máy chủ');
        } finally {
          setIsLoadingDetails(false);
        }
      };

      loadDetails();
    }
  }, [isOpen, employeeData, notifyError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeData) return;

    setIsSubmitting(true);
    try {
      // 1. Update basic info
      const res = await hrApi.updateEmployee(employeeData.id, formData);
      if (!res.success) {
        notifyError('Lỗi', res.message || 'Không thể cập nhật thông tin nhân viên');
        setIsSubmitting(false);
        return;
      }

      // 2. Transfer department if changed
      if (departmentId !== originalDepartmentId && departmentId) {
        const transferRes = await hrApi.transferDepartment(employeeData.id, {
          newDepartmentId: departmentId,
        });
        if (!transferRes.success) {
          notifyError('Lỗi', transferRes.message || 'Chuyển phòng ban thất bại');
          setIsSubmitting(false);
          return;
        }
      }

      notifySuccess('Thành công', 'Đã cập nhật thông tin nhân viên');
      onSuccess();
      onClose();
    } catch {
      notifyError('Lỗi', 'Đã xảy ra lỗi khi kết nối tới máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTerminate = async () => {
    if (!employeeData) return;
    if (!confirm('Bạn có chắc chắn muốn báo nghỉ việc nhân viên này? Hành động này không thể hoàn tác.')) return;

    setIsSubmitting(true);
    try {
      const res = await hrApi.terminateEmployee(employeeData.id);
      if (res.success) {
        notifySuccess('Thành công', 'Đã cập nhật trạng thái Nghỉ việc');
        onSuccess();
        onClose();
      } else {
        notifyError('Lỗi', res.message || 'Không thể báo nghỉ việc');
      }
    } catch {
      notifyError('Lỗi', 'Lỗi kết nối');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!employeeData) return;
    if (!confirm('Bạn có chắc chắn muốn tạm nghỉ (vô hiệu hóa) nhân viên này?')) return;

    setIsSubmitting(true);
    try {
      const res = await hrApi.deactivateEmployee(employeeData.id);
      if (res.success) {
        notifySuccess('Thành công', 'Đã cập nhật trạng thái Tạm nghỉ');
        onSuccess();
        onClose();
      } else {
        notifyError('Lỗi', res.message || 'Không thể tạm nghỉ');
      }
    } catch {
      notifyError('Lỗi', 'Lỗi kết nối');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isActiveOrInactive = employeeData?.status === 'ACTIVE' || employeeData?.status === 'INACTIVE';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chỉnh sửa nhân viên: ${employeeData?.fullName || ''}`}
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
             {isActiveOrInactive && (
                <>
                  <Button variant="danger" onClick={handleTerminate} disabled={isSubmitting || isLoadingDetails}>
                    Nghỉ việc
                  </Button>
                  {employeeData?.status === 'ACTIVE' && (
                     <Button variant="outline" onClick={handleDeactivate} disabled={isSubmitting || isLoadingDetails}>
                       Tạm nghỉ
                     </Button>
                  )}
                </>
             )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting || isLoadingDetails}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting} disabled={isLoadingDetails || !isActiveOrInactive}>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      }
    >
      {isLoadingDetails ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</div>
      ) : (
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
              disabled={!isActiveOrInactive}
            />
          </div>

          <div className={styles.row}>
            <Select
              label="Phòng ban"
              options={deptOptions}
              value={departmentId}
              onChange={(val) => setDepartmentId(val)}
              required
              fullWidth
              disabled={!isActiveOrInactive}
            />
          </div>
          <div className={styles.row}>
            <Select
              label="Chức vụ"
              options={ROLE_OPTIONS}
              value={formData.role ?? 'MEMBER'}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  role: value as 'DEPT_ADMIN' | 'MEMBER',
                }))
              }
              fullWidth
              disabled={!isActiveOrInactive}
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
                  gender: value as UpdateEmployeeRequest['gender'],
                }))
              }
              placeholder="-- Chọn giới tính --"
              fullWidth
              disabled={!isActiveOrInactive}
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
              disabled={!isActiveOrInactive}
            />
          </div>
          
          <div className={styles.row}>
            <Input
              label="Địa chỉ"
              name="address"
              value={formData.address ?? ''}
              onChange={handleChange}
              placeholder="123 ABC, TP.HCM"
              fullWidth
              disabled={!isActiveOrInactive}
            />
          </div>
          
          <div className={styles.row}>
            <Input
              label="CCCD / CMND"
              name="idCardNumber"
              value={formData.idCardNumber ?? ''}
              onChange={handleChange}
              placeholder="00109xxxxxxxx"
              fullWidth
              disabled={!isActiveOrInactive}
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
