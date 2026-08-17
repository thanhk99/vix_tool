import { useEffect, useState } from 'react';
import styles from './CustommerTypeTab.module.css';
import { useNotification } from '@/hooks/useNotification';
import apiClient from '@/lib/api/client';
import Button from '@/components/shared/Button/Button';
import Input from '@/components/shared/Input/Input';
import Select, {
  SelectOption,
} from '@/components/shared/Select/Select';

interface CustommerTypeTabProps {
  partnerId: string;
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

export default function CustommerTypeTab({ partnerId }: CustommerTypeTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { notifyError, notifySuccess, notifyWarning } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    cusType: '',
    businessType: '',
    professionalInvestor: false,
    professionalStartDate: '',
    professionalEndDate: '',
    note: '',
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
  };

  const handleProfessionalChange = (value: 'Y' | 'N') => {
    const isProfessional = value === 'Y';

    setFormData((prev) => ({
      ...prev,
      professionalInvestor: isProfessional,
      professionalStartDate: isProfessional ? prev.professionalStartDate : '',
      professionalEndDate: isProfessional ? prev.professionalEndDate : '',
    }));
  };

  const validateForm = (): boolean => {
    // Nếu là nhà đầu tư chuyên nghiệp, bắt buộc phải có ngày bắt đầu và kết thúc
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

    // Kiểm tra loại hình khách hàng
    if (!formData.cusType) {
      notifyWarning('Cảnh báo', 'Vui lòng chọn Phân loại khách hàng');
      return false;
    }

    // Kiểm tra loại hình kinh tế
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

      await apiClient.patch(`/v1/capital-source/partners/${partnerId}/customer-type`, {
        cusType: formData.cusType,
        businessType: formData.businessType,
        professionalInvestor: formData.professionalInvestor,
        professionalStartDate: formData.professionalInvestor ? formData.professionalStartDate : null,
        professionalEndDate: formData.professionalInvestor ? formData.professionalEndDate : null,
        note: formData.note,
      });

      notifySuccess('Thành công', 'Đã cập nhật thông tin loại hình khách hàng');
      setIsEditing(false);
      await fetchCusType();
    } catch (err: any) {
      notifyError('Lỗi', err.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchCusType(); // Reset về dữ liệu cũ
  };

  // if (loading) {
  //   return (
  //     <div className={styles.loading}>
  //       <span>Đang tải dữ liệu...</span>
  //     </div>
  //   );
  // }

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <h2>THÔNG TIN LOẠI HÌNH KHÁCH HÀNG</h2>
      </div>

      <div className={styles.header}>
        {!isEditing ? (
          <Button type="button" variant="primary" onClick={() => setIsEditing(true)}>
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
            disabled={!isEditing || saving}
            onChange={(value) =>
              handleChange('cusType', value)
            }
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
            disabled={!isEditing || !formData.professionalInvestor || saving}
            onChange={(e) => handleChange('professionalStartDate', e.target.value)}
            fullWidth
          />
        </div>
        

        {/* NĐT chuyên nghiệp */}
        <div className={styles.formGroup}>
          <label className={styles.label}>NĐT chuyên nghiệp</label>
          <Select
              options={PROFESSIONAL_INVESTOR_OPTIONS}
              value={
                formData.professionalInvestor
                  ? 'Y'
                  : 'N'
              }
              disabled={!isEditing || saving}
              onChange={(value) =>
                handleProfessionalChange(
                  value as 'Y' | 'N'
                )
              }
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
            disabled={!isEditing || !formData.professionalInvestor || saving}
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
            disabled={!isEditing || saving}
            onChange={(value) =>
              handleChange('businessType', value)
            }
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
            disabled={!isEditing || saving}
            onChange={(e) => handleChange('note', e.target.value)}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}