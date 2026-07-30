'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UsersRound, Pen } from 'lucide-react';
import styles from './PartnerView.module.css';
import { PartnerItem } from '@/mock/partner';

interface PartnerViewProps {
  partner: PartnerItem;
}

export default function PartnerView({ partner }: PartnerViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'signature' | 'authorization' | 'customerType' | 'limit' | 'asset'>('info');

  const handleBack = () => {
    router.push('/nv/partner');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={handleBack}>
            <ArrowLeft size={20} />
          </button>
          <div className={styles.title}>
            <UsersRound size={24} />
            <h2>Thông tin đối tác</h2>
          </div>
        </div>
      </div>

      {/* ===== THÔNG TIN CHUNG (Phần trên) ===== */}
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

      {/* ===== TABS (Phần dưới) ===== */}
      <div className={styles.modalTabs}>
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
        {activeTab === 'signature' && (
          <div className={styles.tabPlaceholder}>
            <p>Chưa có chữ ký / mẫu dấu</p>
          </div>
        )}
        {activeTab === 'authorization' && (
          <div className={styles.tabPlaceholder}>
            <p>Danh sách người ủy quyền / đại diện pháp luật</p>
            <p className={styles.emptyText}>Chưa có dữ liệu</p>
          </div>
        )}
        {activeTab === 'customerType' && (
          <div className={styles.customerTypeTab}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Phân loại KH</span>
                <span className={styles.infoValue}>{partner.customerType || '---'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Loại hình kinh tế</span>
                <span className={styles.infoValue}>{partner.economicType || '---'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>NĐT chuyên nghiệp</span>
                <span className={styles.infoValue}>{partner.isProfessionalInvestor || 'Không'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Ngày bắt đầu CN</span>
                <span className={styles.infoValue}>{partner.startDate || '---'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Ngày kết thúc CN</span>
                <span className={styles.infoValue}>{partner.endDate || '---'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Ghi chú</span>
                <span className={styles.infoValue}>{partner.note || '---'}</span>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'limit' && (
          <div className={styles.tabPlaceholder}>
            <p>Danh sách hạn mức tín dụng</p>
            <p className={styles.emptyText}>Chưa có dữ liệu</p>
          </div>
        )}
        {activeTab === 'asset' && (
          <div className={styles.tabPlaceholder}>
            <p>Danh sách tài sản bảo đảm</p>
            <p className={styles.emptyText}>Chưa có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
}