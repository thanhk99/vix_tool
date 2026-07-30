'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X, UsersRound, Upload, Plus } from 'lucide-react';
import styles from './PartnerEdit.module.css';
import { PartnerItem } from '@/mock/partner';

interface PartnerEditProps {
  partner: PartnerItem;
  onSave?: (partner: PartnerItem) => void;
  onCancel?: () => void;
}

export default function PartnerEdit({ partner, onSave, onCancel }: PartnerEditProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'signature' | 'authorization' | 'customerType' | 'limit' | 'asset'>('info');
  const [formData, setFormData] = useState<PartnerItem>({ ...partner });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Validate các trường bắt buộc
    if (!formData.partnerCode || !formData.customerCode || !formData.partnerName || 
        !formData.taxCode || !formData.issuedDate || !formData.expiredDate ||
        !formData.issuedPlace || !formData.contractNumber || !formData.createdDate) {
      alert('Vui lòng nhập đầy đủ các trường bắt buộc (có dấu *)');
      return;
    }

    if (onSave) {
      onSave(formData);
    } else {
      // Nếu không có onSave, quay lại trang danh sách
      router.push('/nv/partner');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/nv/partner');
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
            <h2>Chỉnh sửa đối tác</h2>
          </div>
        </div>
      </div>

      {/* ===== THÔNG TIN CHUNG (Phần trên - chỉ đọc) ===== */}
      <div className={styles.infoCard}>
        <h3 className={styles.infoTitle}>THÔNG TIN CHUNG</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Mã KH</span>
            <span className={styles.infoValue}>{partner.partnerCode}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Mã đơn vị GD</span>
            <span className={styles.infoValue}>{partner.customerCode}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Tên KH</span>
            <span className={styles.infoValue}>{partner.partnerName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Tên viết tắt</span>
            <span className={styles.infoValue}>{partner.shortName || '---'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Địa chỉ</span>
            <span className={styles.infoValue}>{partner.address || '---'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Điện thoại</span>
            <span className={styles.infoValue}>{partner.phone || '---'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{partner.email || '---'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Website</span>
            <span className={styles.infoValue}>{partner.website || '---'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Số ĐKKD/CCCD</span>
            <span className={styles.infoValue}>{partner.taxCode}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Ngày cấp lần đầu</span>
            <span className={styles.infoValue}>{partner.issuedDate}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Ngày cấp cuối</span>
            <span className={styles.infoValue}>{partner.expiredDate}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Nơi cấp</span>
            <span className={styles.infoValue}>{partner.issuedPlace}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Số lần thay đổi GPKD</span>
            <span className={styles.infoValue}>{partner.changeCount || 0}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>GP hoạt động</span>
            <span className={styles.infoValue}>{partner.contractNumber}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Ngày cấp GP</span>
            <span className={styles.infoValue}>{partner.createdDate}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Trạng thái</span>
            <span className={`${styles.statusBadge} ${
              partner.status === 'Đã duyệt'
                ? styles.statusApproved
                : partner.status === 'Chờ duyệt'
                ? styles.statusPending
                : styles.statusInactive
            }`}>
              {partner.status}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>User thực hiện</span>
            <span className={styles.infoValue}>{partner.userCreate || '---'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>User duyệt</span>
            <span className={styles.infoValue}>{partner.userApprove || '---'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Ngày chỉnh sửa</span>
            <span className={styles.infoValue}>{partner.approvedDate || '---'}</span>
          </div>
        </div>
      </div>

      {/* ===== TABS (Phần dưới - có thể chỉnh sửa) ===== */}
      <div className={styles.modalTabs}>
        <button
          className={`${styles.modalTab} ${activeTab === 'info' ? styles.modalTabActive : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Thông tin chung
        </button>
        <button
          className={`${styles.modalTab} ${activeTab === 'signature' ? styles.modalTabActive : ''}`}
          onClick={() => setActiveTab('signature')}
        >
          Chữ ký
        </button>
        <button
          className={`${styles.modalTab} ${activeTab === 'authorization' ? styles.modalTabActive : ''}`}
          onClick={() => setActiveTab('authorization')}
        >
          UQ / Người đại diện PL
        </button>
        <button
          className={`${styles.modalTab} ${activeTab === 'customerType' ? styles.modalTabActive : ''}`}
          onClick={() => setActiveTab('customerType')}
        >
          Loại hình KH
        </button>
        <button
          className={`${styles.modalTab} ${activeTab === 'limit' ? styles.modalTabActive : ''}`}
          onClick={() => setActiveTab('limit')}
        >
          QL hạn mức
        </button>
        <button
          className={`${styles.modalTab} ${activeTab === 'asset' ? styles.modalTabActive : ''}`}
          onClick={() => setActiveTab('asset')}
        >
          TSĐB
        </button>
      </div>

      <div className={styles.tabContent}>
        {/* Tab 1: Thông tin chung (có thể sửa) */}
        {activeTab === 'info' && (
          <div className={styles.infoTab}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Mã KH <span className={styles.required}>*</span></label>
                <input
                  name="partnerCode"
                  value={formData.partnerCode}
                  onChange={handleChange}
                  placeholder="Nhập mã khách hàng"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mã đơn vị GD <span className={styles.required}>*</span></label>
                <input
                  name="customerCode"
                  value={formData.customerCode}
                  onChange={handleChange}
                  placeholder="Nhập mã đơn vị giao dịch"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tên KH <span className={styles.required}>*</span></label>
                <input
                  name="partnerName"
                  value={formData.partnerName}
                  onChange={handleChange}
                  placeholder="Nhập tên khách hàng"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tên viết tắt</label>
                <input
                  name="shortName"
                  value={formData.shortName || ''}
                  onChange={handleChange}
                  placeholder="Nhập tên viết tắt"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Địa chỉ</label>
                <input
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Số ĐKKD/CCCD <span className={styles.required}>*</span></label>
                <input
                  name="taxCode"
                  value={formData.taxCode}
                  onChange={handleChange}
                  placeholder="Nhập số ĐKKD/CCCD"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Ngày cấp lần đầu <span className={styles.required}>*</span></label>
                <input
                  type="date"
                  name="issuedDate"
                  value={formData.issuedDate}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Ngày cấp cuối <span className={styles.required}>*</span></label>
                <input
                  type="date"
                  name="expiredDate"
                  value={formData.expiredDate}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Nơi cấp <span className={styles.required}>*</span></label>
                <input
                  name="issuedPlace"
                  value={formData.issuedPlace}
                  onChange={handleChange}
                  placeholder="Nhập nơi cấp"
                />
              </div>
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
              <div className={styles.formGroup}>
                <label>GP hoạt động <span className={styles.required}>*</span></label>
                <input
                  name="contractNumber"
                  value={formData.contractNumber}
                  onChange={handleChange}
                  placeholder="Nhập GP hoạt động"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Ngày cấp GP <span className={styles.required}>*</span></label>
                <input
                  type="date"
                  name="createdDate"
                  value={formData.createdDate}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Điện thoại</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                />
              </div>
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
            <div className={styles.actions}>
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
        )}

        {/* Tab 2: Chữ ký */}
        {activeTab === 'signature' && (
          <div className={styles.signatureTab}>
            <div className={styles.signaturePlaceholder}>
              <Upload size={48} className={styles.signatureIcon} />
              <p>Chưa có chữ ký / mẫu dấu</p>
              <p className={styles.signatureHint}>Hỗ trợ định dạng: JPG, PNG, PDF (tối đa 5MB)</p>
              <button>
                <Upload size={16} />
                Tải lên chữ ký
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: UQ / Người đại diện PL */}
        {activeTab === 'authorization' && (
          <div className={styles.authorizationTab}>
            <div className={styles.tabHeader}>
              <h4>Danh sách ủy quyền</h4>
              <button>
                <Plus size={16} />
                Thêm ủy quyền
              </button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên người UQ</th>
                    <th>CCCD</th>
                    <th>Chức vụ</th>
                    <th>Ngày hiệu lực</th>
                    <th>Ngày hết hạn</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} className={styles.emptyRow}>
                      <p>Chưa có dữ liệu ủy quyền</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Loại hình KH */}
        {activeTab === 'customerType' && (
          <div className={styles.customerTypeTab}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Phân loại KH <span className={styles.required}>*</span></label>
                <select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleSelectChange}
                  className={styles.select}
                >
                  <option value="">-- Chọn phân loại --</option>
                  <option value="Cá nhân trong nước">Cá nhân trong nước</option>
                  <option value="Cá nhân nước ngoài">Cá nhân nước ngoài</option>
                  <option value="Tổ chức trong nước">Tổ chức trong nước</option>
                  <option value="Tổ chức nước ngoài">Tổ chức nước ngoài</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Loại hình kinh tế <span className={styles.required}>*</span></label>
                <select
                  name="economicType"
                  value={formData.economicType}
                  onChange={handleSelectChange}
                  className={styles.select}
                >
                  <option value="">-- Chọn loại hình --</option>
                  <option value="Cá nhân">Cá nhân</option>
                  <option value="Ngân hàng">Ngân hàng</option>
                  <option value="CT bảo hiểm">CT bảo hiểm</option>
                  <option value="Quỹ đầu tư">Quỹ đầu tư</option>
                  <option value="CT tài chính">CT tài chính</option>
                  <option value="Tổ chức khác">Tổ chức khác</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>NĐT chuyên nghiệp</label>
                <select
                  name="isProfessionalInvestor"
                  value={formData.isProfessionalInvestor}
                  onChange={handleSelectChange}
                  className={styles.select}
                >
                  <option value="Không">Không</option>
                  <option value="Có">Có</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Ngày bắt đầu CN</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  disabled={formData.isProfessionalInvestor !== 'Có'}
                />
                {formData.isProfessionalInvestor !== 'Có' && (
                  <span className={styles.hint}>Chọn NĐT chuyên nghiệp = Có</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label>Ngày kết thúc CN</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={formData.isProfessionalInvestor !== 'Có'}
                />
                {formData.isProfessionalInvestor !== 'Có' && (
                  <span className={styles.hint}>Chọn NĐT chuyên nghiệp = Có</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder="Nhập ghi chú..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: QL hạn mức */}
        {activeTab === 'limit' && (
          <div className={styles.limitTab}>
            <div className={styles.tabHeader}>
              <h4>Danh sách hạn mức</h4>
              <button>
                <Plus size={16} />
                Thêm hạn mức
              </button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã hạn mức</th>
                    <th>Tên hạn mức</th>
                    <th>Loại hạn mức</th>
                    <th>Hạn mức tổng</th>
                    <th>Đã sử dụng</th>
                    <th>Còn lại</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} className={styles.emptyRow}>
                      <p>Chưa có dữ liệu hạn mức</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: TSĐB */}
        {activeTab === 'asset' && (
          <div className={styles.assetTab}>
            <div className={styles.tabHeader}>
              <h4>Danh sách tài sản bảo đảm</h4>
              <button>
                <Plus size={16} />
                Thêm TSĐB
              </button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã TSĐB</th>
                    <th>Loại TSĐB</th>
                    <th>Tổ chức phát hành</th>
                    <th>Mệnh giá</th>
                    <th>Ngày phát hành</th>
                    <th>Ngày đáo hạn</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} className={styles.emptyRow}>
                      <p>Chưa có dữ liệu tài sản bảo đảm</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}