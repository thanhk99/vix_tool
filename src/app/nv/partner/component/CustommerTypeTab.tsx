import { useEffect, useState } from 'react';
import styles from './CustommerTypeTab.module.css';
import { useNotification } from '@/hooks/useNotification';
import apiClient from '@/lib/api/client';
import Button from '@/components/shared/Button/Button';
import Input from '@/components/shared/Input/Input';
import Select, { SelectOption } from '@/components/shared/Select/Select';

interface CustommerTypeTabProps {
  partnerId: string;
  isView?: boolean;
  parentFormData?: any;
  setParentFormData?: React.Dispatch<React.SetStateAction<any>>;
}

const CUS_TYPE_OPTIONS: SelectOption[] = [
  {
    label: 'Cá nhân trong nước',
    value: 'DOMESTIC_INDIVIDUAL',
  },
  {
    label: 'Cá nhân nước ngoài',
    value: 'FOREIGN_INDIVIDUAL',
  },
  {
    label: 'Tổ chức trong nước',
    value: 'DOMESTIC_ORGANIZATION',
  },
  {
    label: 'Tổ chức nước ngoài',
    value: 'FOREIGN_ORGANIZATION',
  },
];

const BUSINESS_TYPE_OPTIONS: SelectOption[] = [
  {
    label: 'Cá nhân',
    value: 'INDIVIDUAL',
  },
  {
    label: 'CT bảo hiểm',
    value: 'INSURANCE',
  },
  {
    label: 'Quỹ đầu tư',
    value: 'INVESTMENT_FUND',
  },
  {
    label: 'CT tài chính',
    value: 'FINANCE',
  },
  {
    label: 'Tổ chức khác',
    value: 'OTHER',
  },
];

const PROFESSIONAL_INVESTOR_OPTIONS: SelectOption[] = [
  {
    label: 'Có',
    value: 'Y',
  },
  {
    label: 'Không',
    value: 'N',
  },
];

export default function CustommerTypeTab({ partnerId, isView, parentFormData, setParentFormData }: CustommerTypeTabProps) {
  const isCreating = !partnerId;
  const [isEditing, setIsEditing] = useState(false);
  const { notifyError, notifySuccess, notifyWarning } = useNotification();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    cusType: parentFormData?.cusType || '',
    businessType: parentFormData?.businessType || '',
    professionalInvestor: parentFormData?.professionalInvestor || false,
    professionalStartDate: parentFormData?.professionalStartDate || '',
    professionalEndDate: parentFormData?.professionalEndDate || '',
    note: parentFormData?.note || '',
  });

  const fetchCusType = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/v1/capital-source/partners/${partnerId}`);
      const data = res.data?.data || res.data || {};
      setFormData({
        cusType: data.cusType || '',
        businessType: data.businessType || '',
        professionalInvestor: data.professionalInvestor || false,
        professionalStartDate: data.professionalStartDate || '',
        professionalEndDate: data.professionalEndDate || '',
        note: data.note || '',
      });
    } catch (err: any) {
      notifyError('Lỗi', err.response?.data?.message || 'Không thể tải thông tin!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (partnerId) {
      fetchCusType();
    }
  }, [partnerId]);

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (setParentFormData) {
      setParentFormData((prev: any) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleProfessionalChange = (value: 'Y' | 'N') => {
    const isProfessional = value === 'Y';
    const startDate = isProfessional ? formData.professionalStartDate : '';
    const endDate = isProfessional ? formData.professionalEndDate : '';

    setFormData((prev) => ({
      ...prev,
      professionalInvestor: isProfessional,
      professionalStartDate: startDate,
      professionalEndDate: endDate,
    }));

    if (setParentFormData) {
      setParentFormData((prev: any) => ({
        ...prev,
        professionalInvestor: isProfessional,
        professionalStartDate: startDate,
        professionalEndDate: endDate,
      }));
    }
  };

  const validateForm = (): boolean => {
    if (formData.professionalInvestor) {
      if (!formData.professionalStartDate) {
        notifyWarning('Cảnh báo', 'Vui lòng nhập Ngày bắt đầu cho nhà đầu tư chuyên nghiệp');
        return false;
      }
      if (!formData.professionalEndDate) {
        notifyWarning('Cảnh báo', 'Vui lòng nhập Ngày kết thúc cho nhà đầu tư chuyên nghiệp');
        return false;
      }
      if (new Date(formData.professionalEndDate) <= new Date(formData.professionalStartDate)) {
        notifyWarning('Cảnh báo', 'Ngày kết thúc phải sau ngày bắt đầu');
        return false;
      }
    }

    if (!formData.cusType) {
      notifyWarning('Cảnh báo', 'Vui lòng chọn Phân loại khách hàng');
      return false;
    }

    if (!formData.businessType) {
      notifyWarning('Cảnh báo', 'Vui lòng chọn Loại hình kinh tế');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const res: any = await apiClient.patch(`/v1/capital-source/partners/${partnerId}/customer-type`, {
        cusType: formData.cusType,
        businessType: formData.businessType,
        professionalInvestor: formData.professionalInvestor,
        professionalStartDate: formData.professionalInvestor ? formData.professionalStartDate : null,
        professionalEndDate: formData.professionalInvestor ? formData.professionalEndDate : null,
        note: formData.note,
      });

      if (res && res.success === false) {
        notifyError('Lỗi', res.message || 'Không thể cập nhật thông tin');
        return;
      }

      notifySuccess('Thành công', 'Đã cập nhật thông tin loại hình khách hàng');
      setIsEditing(false);
      await fetchCusType();
    } catch (err: any) {
      notifyError('Lỗi', err?.message || err?.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchCusType();
  };

  const canEdit = !isView && (isCreating || isEditing);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>THÔNG TIN LOẠI HÌNH KHÁCH HÀNG</h2>
        
        {isCreating ? (
          <Button type="button" variant="primary" disabled={true}>
            Sửa
          </Button>
        ) : !isEditing ? (
          <Button type="button" variant="primary" disabled={isView} onClick={() => setIsEditing(true)}>
            Sửa
          </Button>
        ) : (
          <div className={styles.editing}>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
              Hủy
            </Button>
            <Button type="button" variant="primary" onClick={handleSave} isLoading={saving}>
              Lưu
            </Button>
          </div>
        )}
      </div>

      <div className={styles.form}>
        {/* Phân loại KH */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Phân loại KH</label>
          <Select 
            options={CUS_TYPE_OPTIONS}
            value={formData.cusType}
            disabled={!canEdit || saving}
            onChange={(value) => handleChange('cusType', value)}
            placeholder="-- Chọn --"
            fullWidth
          />
        </div>

        {/* Ngày bắt đầu */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Ngày bắt đầu</label>
          <Input
            type="date"
            className={styles.input}
            value={formData.professionalStartDate}
            disabled={!canEdit || !formData.professionalInvestor || saving}
            onChange={(e) => handleChange('professionalStartDate', e.target.value)}
            fullWidth
          />
        </div>

        {/* NĐT chuyên nghiệp */}
        <div className={styles.formGroup}>
          <label className={styles.label}>NĐT chuyên nghiệp</label>
          <Select
            options={PROFESSIONAL_INVESTOR_OPTIONS}
            value={formData.professionalInvestor ? 'Y' : 'N'}
            disabled={!canEdit || saving}
            onChange={(value) => handleProfessionalChange(value as 'Y' | 'N')}
            fullWidth
          />
        </div>

        {/* Ngày kết thúc */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Ngày kết thúc</label>
          <Input
            type="date"
            className={styles.input}
            value={formData.professionalEndDate}
            disabled={!canEdit || !formData.professionalInvestor || saving}
            onChange={(e) => handleChange('professionalEndDate', e.target.value)}
            fullWidth
          />
        </div>

        {/* Loại hình kinh tế */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Loại hình kinh tế</label>
          <Select
            options={BUSINESS_TYPE_OPTIONS}
            value={formData.businessType}
            disabled={!canEdit || saving}
            onChange={(value) => handleChange('businessType', value)}
            placeholder="-- Chọn --"
            fullWidth
          />
        </div>

        {/* Ghi chú */}
        <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
          <label className={styles.label}>Ghi chú</label>
          <Input
            type="text"
            className={styles.input}
            value={formData.note}
            disabled={!canEdit || saving}
            onChange={(e) => handleChange('note', e.target.value)}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}