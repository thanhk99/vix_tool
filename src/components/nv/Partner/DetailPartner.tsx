'use client';

import { PartnerItem } from '@/mock/partner';
import styles from './DetailPartner.module.css';

interface PartnerDetailProps {
  partner: PartnerItem | null;
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
                <input value={partner.partnerCode} readOnly />
            </div>

            <div className={styles.field}>
                <label>Mã đơn vị GD</label>
                <input value={partner.customerCode} readOnly />
            </div>

            <div className={`${styles.field} ${styles.full}`}>
                <label>Tên KH</label>
                <input value={partner.partnerName} readOnly />
            </div>

            <div className={styles.field}>
                <label>Số ĐKKD/CCCD</label>
                <input value={partner.taxCode} readOnly />
            </div>

            <div className={styles.field}>
                <label>Ngày cấp lần đầu</label>
                <input value={partner.issuedDate} readOnly />
            </div>

            <div className={styles.field}>
                <label>Ngày cấp cuối</label>
                <input value={partner.expiredDate} readOnly />
            </div>

            <div className={styles.field}>
                <label>Nơi cấp</label>
                <input value={partner.issuedPlace} readOnly />
            </div>

            <div className={styles.field}>
                <label>GP hoạt động</label>
                <input value={partner.contractNumber} readOnly />
            </div>

            <div className={styles.field}>
                <label>Ngày cấp</label>
                <input value={partner.createdDate} readOnly />
            </div>

            <div className={styles.field}>
                <label>Điện thoại</label>
                <input value={partner.phone} readOnly />
            </div>

            <div className={styles.field}>
                <label>Email</label>
                <input value={partner.email} readOnly />
            </div>

            <div className={styles.field}>
                <label>Website</label>
                <input value={partner.website} readOnly />
            </div>

            <div className={styles.field}>
                <label>Mã TVLK</label>
                <input value={partner.tvlkCode} readOnly />
            </div>

            <div className={styles.field}>
                <label>Phân loại KH</label>
                <input value={partner.customerType} readOnly />
            </div>

            <div className={styles.field}>
                <label>Loại hình KH</label>
                <input value={partner.economicType} readOnly />
            </div>

            <div className={styles.field}>
                <label>NĐT chuyên nghiệp</label>
                <input value={partner.isProfessionalInvestor} readOnly />
            </div>

            <div className={styles.field}>
                <label>Ngày bắt đầu CN</label>
                <input value={partner.startDate} readOnly />
            </div>

            <div className={styles.field}>
                <label>Ngày kết thúc CN</label>
                <input value={partner.endDate} readOnly />
            </div>

            <div className={`${styles.field} ${styles.full}`}>
                <label>Trạng thái</label>
                <input value={partner.status} readOnly />
            </div>

        </div>

    </div>

    <div className={styles.rightPanel}>

        <h3 className={styles.title}>
            THÔNG TIN QUẢN LÝ
        </h3>

        <div className={styles.field}>
            <label>User thực hiện</label>
            <input value={partner.userCreate} readOnly />
        </div>

        <div className={styles.field}>
            <label>User duyệt</label>
            <input value={partner.userApprove} readOnly />
        </div>

        <div className={styles.field}>
            <label>Ngày chỉnh sửa</label>
            <input value={partner.approvedDate} readOnly />
        </div>

        <h3 className={styles.title}>
            GHI CHÚ
        </h3>

        <textarea
            className={styles.note}
            value={partner.note}
            readOnly
        />

    </div>

</div>
  );
}