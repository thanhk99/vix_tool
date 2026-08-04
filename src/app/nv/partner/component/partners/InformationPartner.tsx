'use client';

import styles from './InformationPartner.module.css';
import { PartnersItem } from '@/types/funding.types';

interface PartnerDetailProps {
  partner: PartnersItem | null;
  onClose?: () => void;
}

export default function PartnerDetail({ partner, onClose }: PartnerDetailProps) {
  if (!partner) return null;

  return (
    <div className={styles.container}>

      <div className={styles.leftPanel}>

        <h3 className={styles.title}>
          THÔNG TIN CHI TIẾT ĐỐI TÁC
        </h3>

        <div className={styles.grid}>

          <div className={styles.field}>
            <label>Mã KH</label>
            <input value={partner.cusId || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>Mã đơn vị GD</label>
            <input value={partner.branchCusId || ''} readOnly />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label>Tên KH</label>
            <input value={partner.cusName || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>Tên viết tắt</label>
            <input value={partner.shortName || ''} readOnly />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label>Địa chỉ</label>
            <input value={partner.address || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>Số ĐKKD/CCCD</label>
            <input value={partner.idCode || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>Ngày cấp lần đầu</label>
            <input value={partner.fistIssueDate || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>Ngày cấp cuối</label>
            <input value={partner.lastIssueDate || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>Nơi cấp</label>
            <input value={partner.issueBy || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>GP hoạt động</label>
            <input value={partner.opLiscenseNo || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>Ngày cấp GP</label>
            <input value={partner.opIssueDate || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>Điện thoại</label>
            <input value={partner.mobile || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <input value={partner.email || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>Website</label>
            <input value={partner.website || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>Phân loại KH</label>
            <input value={partner.cusType || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>Loại hình KH</label>
            <input value={partner.businessType || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>NĐT chuyên nghiệp</label>
            <input value={partner.professionalInvestor ? 'Có' : 'Không'} readOnly />
          </div>

          <div className={styles.field}>
            <label>Ngày bắt đầu CN</label>
            <input value={partner.professionalStartDate || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label>Ngày kết thúc CN</label>
            <input value={partner.professionalEndDate || ''} readOnly />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label>Trạng thái</label>
            <input value={partner.status || ''} readOnly />
          </div>

        </div>

      </div>

      <div className={styles.rightPanel}>

        <h3 className={styles.title}>
          THÔNG TIN QUẢN LÝ
        </h3>

        <div className={styles.field}>
          <label>User thực hiện</label>
          <input value={partner.createdBy || ''} readOnly />
        </div>

        <div className={styles.field}>
          <label>User duyệt</label>
          <input value={partner.updatedBy || ''} readOnly />
        </div>

        <div className={styles.field}>
          <label>Ngày chỉnh sửa</label>
          <input value={partner.lastUpdated || ''} readOnly />
        </div>
      </div>

    </div>
  );
}