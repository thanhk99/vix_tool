'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  X, 
  UsersRound,
  Upload,
  Plus
} from 'lucide-react';
import styles from './PartnerCreate.module.css';
import Button from '@/components/shared/Button/Button';
import { PartnerItem } from '@/mock/partner';

interface PartnerCreateProps {
  onSave?: (partner: PartnerItem) => void;
  onCancel?: () => void;
}

export default function PartnerCreate({ onSave, onCancel }: PartnerCreateProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'signature' | 'authorization' | 'customerType' | 'limit' | 'asset'>('info');
  const [formData, setFormData] = useState<PartnerItem>({
    id: '',
    stt: 0,
    partnerCode: '',
    customerCode: '',
    partnerName: '',
    taxCode: '',
    issuedDate: '',
    expiredDate: '',
    issuedPlace: '',
    contractNumber: '',
    createdDate: '',
    phone: '',
    email: '',
    website: '',
    tvlkCode: '',
    customerType: '',
    economicType: '',
    isProfessionalInvestor: 'Không',
    startDate: '',
    endDate: '',
    status: 'Chờ duyệt',
    userCreate: 'admin01',
    userApprove: '',
    approvedDate: '',
    note: '',
    changeCount: 0,
    shortName: '',
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Validate các trường bắt buộc
    if (!formData.partnerCode || !formData.customerCode || !formData.partnerName || 
        !formData.taxCode || !formData.issuedDate || !formData.expiredDate ||
        !formData.issuedPlace || !formData.contractNumber || !formData.createdDate) {
      alert('Vui lòng nhập đầy đủ các trường bắt buộc (có dấu *)');
      return;
    }

    const newPartner: PartnerItem = {
      ...formData,
      id: Date.now().toString(),
      stt: 0,
      status: 'Chờ duyệt',
      userCreate: 'admin01',
      approvedDate: new Date().toLocaleDateString('vi-VN'),
    };
    onSave?.(newPartner);
    router.back();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={handleCancel}>
            <ArrowLeft size={20} />
          </button>
          <div className={styles.title}>
            <UsersRound size={24} />
            <h2>Thêm mới đối tác</h2>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button onClick={handleCancel}>
            <X size={16} />
            Hủy
          </button>
          <button onClick={handleSave}>
            <Save size={16} />
            Lưu
          </button>
        </div>
      </div>

      {/* Tabs */}

      {/* Tab Content */}
      <div className={styles.tabContent}>
        <div className={styles.modalTabs}>
          Thông tin chung
        </div>
        {/* ===== TAB 1: THÔNG TIN CHUNG ===== */}
        {activeTab === 'info' && (
          <div className={styles.infoTab}>
            <div className={styles.formGrid}>
              {/* Mã KH - Bắt buộc */}
              <div className={styles.formGroup}>
                <label>Mã KH <span className={styles.required}>*</span></label>
                <input
                  name="partnerCode"
                  value={formData.partnerCode}
                  onChange={handleChange}
                  placeholder="Nhập mã khách hàng"
                />
              </div>

              {/* Mã đơn vị GD - Bắt buộc */}
              <div className={styles.formGroup}>
                <label>Mã đơn vị GD <span className={styles.required}>*</span></label>
                <input
                  name="customerCode"
                  value={formData.customerCode}
                  onChange={handleChange}
                  placeholder="Nhập mã đơn vị giao dịch"
                />
              </div>

              {/* Tên KH - Bắt buộc */}
              <div className={styles.formGroup}>
                <label>Tên KH <span className={styles.required}>*</span></label>
                <input
                  name="partnerName"
                  value={formData.partnerName}
                  onChange={handleChange}
                  placeholder="Nhập tên khách hàng"
                />
              </div>

              {/* Tên viết tắt */}
              <div className={styles.formGroup}>
                <label>Tên viết tắt</label>
                <input
                  name="shortName"
                  value={formData.shortName || ''}
                  onChange={handleChange}
                  placeholder="Nhập tên viết tắt"
                />
              </div>

              {/* Địa chỉ */}
              <div className={styles.formGroup}>
                <label>Địa chỉ</label>
                <input
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ"
                />
              </div>

              {/* Số ĐKKD/CCCD - Bắt buộc */}
              <div className={styles.formGroup}>
                <label>Số ĐKKD/CCCD <span className={styles.required}>*</span></label>
                <input
                  name="taxCode"
                  value={formData.taxCode}
                  onChange={handleChange}
                  placeholder="Nhập số ĐKKD/CCCD"
                />
              </div>

              {/* Ngày cấp lần đầu - Bắt buộc */}
              <div className={styles.formGroup}>
                <label>Ngày cấp lần đầu <span className={styles.required}>*</span></label>
                <input
                  type="date"
                  name="issuedDate"
                  value={formData.issuedDate}
                  onChange={handleChange}
                />
              </div>

              {/* Ngày cấp cuối - Bắt buộc */}
              <div className={styles.formGroup}>
                <label>Ngày cấp cuối <span className={styles.required}>*</span></label>
                <input
                  type="date"
                  name="expiredDate"
                  value={formData.expiredDate}
                  onChange={handleChange}
                />
              </div>

              {/* Nơi cấp - Bắt buộc */}
              <div className={styles.formGroup}>
                <label>Nơi cấp <span className={styles.required}>*</span></label>
                <input
                  name="issuedPlace"
                  value={formData.issuedPlace}
                  onChange={handleChange}
                  placeholder="Nhập nơi cấp"
                />
              </div>

              {/* Số lần thay đổi */}
              <div className={styles.formGroup}>
                <label>Số lần thay đổi</label>
                <input
                  type="number"
                  name="changeCount"
                  value={formData.changeCount || 0}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* GP hoạt động - Bắt buộc */}
              <div className={styles.formGroup}>
                <label>GP hoạt động <span className={styles.required}>*</span></label>
                <input
                  name="contractNumber"
                  value={formData.contractNumber}
                  onChange={handleChange}
                  placeholder="Nhập GP hoạt động"
                />
              </div>

              {/* Ngày cấp GP - Bắt buộc */}
              <div className={styles.formGroup}>
                <label>Ngày cấp GP <span className={styles.required}>*</span></label>
                <input
                  type="date"
                  name="createdDate"
                  value={formData.createdDate}
                  onChange={handleChange}
                />
              </div>

              {/* Điện thoại */}
              <div className={styles.formGroup}>
                <label>Điện thoại</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@domain.com"
                />
              </div>

              {/* Website */}
              <div className={styles.formGroup}>
                <label>Website</label>
                <input
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="www.example.com"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}