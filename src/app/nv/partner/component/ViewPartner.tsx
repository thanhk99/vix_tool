// ViewPartner.tsx
'use client';

import { useState } from "react";
import styles from "./ViewPartner.module.css";
import { UsersRound, Printer } from "lucide-react";
import { PartnersItem } from "@/types/funding.types";
import SignatureTab from "./SignatureTab";
import CustommerTypeTab from "./CustommerTypeTab";
import AuthorizationTab from "./AuthorizationTab";
import AssetTab from "./AssetTab";
import CrelimitTab from "./CrelimitTab";
import Button from "@/components/shared/Button/Button";

const STATUS_MAP: Record<string, string> = {
  ACTIVE: 'Đã duyệt',
  APPROVED: 'Đã duyệt',
  PENDING: 'Chờ duyệt',
  PENDING_APPROVAL: 'Chờ duyệt',
  INACTIVE: 'Ngừng hoạt động'
};

interface ViewPartnerProps {
  partner: PartnersItem | null;
  partnerId: string;
  getStatusClass: (status: string) => string;
  onClose?: () => void;
}

export default function ViewPartner({
  partner,
  partnerId,
  getStatusClass,
  onClose,
}: ViewPartnerProps) {
  const [activeTab, setActiveTab] = useState<'signature' | 'authorization' | 'custommertype' | 'asset' | 'limit'>('signature');

  if (!partner) {
    return <div className={styles.error}>Không tìm thấy đối tác</div>;
  }

  return (
    <div className={styles.container}>
      {/* Title */}
      <div className={styles.title}>
        <UsersRound size={25}/>
        <h1>Thông tin chung</h1>
      </div>

      {/* Detail Information */}
      <div className={styles.content}>
        <div className={styles.row}>
          <div className={styles.label}>Mã KH</div>
          <div className={styles.value}>{partner.cusId || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Mã đơn vị GD</div>
          <div className={styles.value}>{partner.branchCusId || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Tên KH</div>
          <div className={styles.value}>{partner.cusName || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Tên viết tắt</div>
          <div className={styles.value}>{partner.shortName || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Địa chỉ</div>
          <div className={styles.value}>{partner.address || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Số ĐKKD/CCCD</div>
          <div className={styles.value}>{partner.idCode || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Ngày cấp lần đầu</div>
          <div className={styles.value}>{partner.fistIssueDate || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Ngày cấp cuối</div>
          <div className={styles.value}>{partner.lastIssueDate || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Nơi cấp</div>
          <div className={styles.value}>{partner.issueBy || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Số lần thay đổi</div>
          <div className={styles.value}>{partner.changeCount ?? 0}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>GP hoạt động</div>
          <div className={styles.value}>{partner.opLiscenseNo || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Ngày cấp GP</div>
          <div className={styles.value}>{partner.opIssueDate || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Điện thoại</div>
          <div className={styles.value}>{partner.mobile || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Email</div>
          <div className={styles.value}>{partner.email || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Website</div>
          <div className={styles.value}>{partner.website || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Loại khách hàng</div>
          <div className={styles.value}>{partner.cusType || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Loại hình kinh doanh</div>
          <div className={styles.value}>{partner.businessType || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Nhà đầu tư chuyên nghiệp</div>
          <div className={styles.value}>{partner.professionalInvestor ? "Có" : "Không"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Ngày bắt đầu NĐT chuyên nghiệp</div>
          <div className={styles.value}>{partner.professionalStartDate || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Ngày kết thúc NĐT chuyên nghiệp</div>
          <div className={styles.value}>{partner.professionalEndDate || "-"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Trạng thái</div>
          <div className={styles.value}>
            <span className={`${styles.status} ${getStatusClass(partner.status)}`}>
              {partner.status ? (STATUS_MAP[partner.status] || partner.status) : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <Button variant="bordernone"
          className={`${styles.tab} ${activeTab === 'signature' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('signature')}
        >
          Chữ ký
        </Button>
        <Button variant="bordernone"
          className={`${styles.tab} ${activeTab === 'authorization' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('authorization')}
        >
          UQ / Người đại diện PL
        </Button>
        <Button variant="bordernone"
          className={`${styles.tab} ${activeTab === 'custommertype' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('custommertype')}
        >
          Loại hình KH
        </Button>
        <Button variant="bordernone"
          className={`${styles.tab} ${activeTab === 'asset' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('asset')}
        >
          Tài sản đảm bảo
        </Button>
        <Button variant="bordernone"
          className={`${styles.tab} ${activeTab === 'limit' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('limit')}
        >
          Hạn mức
        </Button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'signature' && <SignatureTab partnerId={partnerId} />}
        {activeTab === 'authorization' && <AuthorizationTab partnerId={partnerId} />}
        {activeTab === 'custommertype' && <CustommerTypeTab partnerId={partnerId} />}
        {activeTab === 'asset' && <AssetTab partnerId={partnerId} />}
        {activeTab === 'limit' && <CrelimitTab partnerId={partnerId} />}
      </div>

      {/* Footer */}
      <div className={styles.footer} style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer size={16} style={{ marginRight: 4 }} /> In HĐ
        </Button>
        <Button variant="primary" onClick={onClose} className={styles.backBtn}>
          Đóng
        </Button>
      </div>
    </div>
  );
}