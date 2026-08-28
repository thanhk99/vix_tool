"use client";

import { useState } from "react";
import styles from "./ViewPartner.module.css";
import { UsersRound } from "lucide-react";
import { PartnersItem } from "@/types/funding.types";
import SignatureAndSealTab from "./SignatureAndSealTab";
import CustommerTypeTab from "./CustommerTypeTab";
import ContactTab from "./ContactTab";
import BankAccountTab from "./BankAccountTab";
import DocumentTab from "./DocumentTab";
import AuthorizationTab from "./AuthorizationTab";
import { formatCurrency } from "@/utils/format";

interface ViewPartnerProps {
  partner: PartnersItem | null;
  partnerId: string;
  getStatusClass: (status: string) => string;
  onClose?: () => void;
}

type TabKey =
  | "signature"
  | "authorization"
  | "custommertype"
  | "document"
  | "bank_account"
  | "contact";

export default function ViewPartner({
  partner,
  partnerId,
  getStatusClass,
  onClose,
}: ViewPartnerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("signature");

  if (!partner) {
    return <div>Không tìm thấy đối tác</div>;
  }

  const mkTab = (key: TabKey, label: string) => (
    <button
      className={`${styles.tab} ${activeTab === key ? styles.tabActive : ""}`}
      onClick={() => setActiveTab(key)}
    >
      {label}
    </button>
  );

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <UsersRound size={25} />
        <h1>Thông tin chung</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.row}><div className={styles.label}>Mã KH</div><div className={styles.value}>{partner.cusId || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Mã đơn vị GD</div><div className={styles.value}>{partner.branchCusId || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Tên KH</div><div className={styles.value}>{partner.cusName || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Tên viết tắt</div><div className={styles.value}>{partner.shortName || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Địa chỉ</div><div className={styles.value}>{partner.address || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Điện thoại</div><div className={styles.value}>{partner.mobile || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Email</div><div className={styles.value}>{partner.email || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Website</div><div className={styles.value}>{partner.website || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Số ĐKKD/CCCD</div><div className={styles.value}>{partner.idCode || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Ngày cấp lần đầu</div><div className={styles.value}>{partner.fistIssueDate || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Số lần thay đổi</div><div className={styles.value}>{partner.changeCount ?? 0}</div></div>
        <div className={styles.row}><div className={styles.label}>Ngày thay đổi gần nhất</div><div className={styles.value}>{partner.lastIssueDate || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Nơi cấp</div><div className={styles.value}>{partner.issueBy || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Lý do thay đổi</div><div className={styles.value}>{partner.changeReason || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>GP hoạt động</div><div className={styles.value}>{partner.opLiscenseNo || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Ngày cấp GP</div><div className={styles.value}>{partner.opIssueDate || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Mã TVLK (VSDC Code)</div><div className={styles.value}>{partner.depositoryMemberCode || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Nơi mở</div><div className={styles.value}>{partner.tradingGateway || "-"}</div></div>
        <div className={styles.row}><div className={styles.label}>Tổng hạn mức (Cấp 1)</div><div className={styles.value} style={{ color: "#2563eb", fontWeight: 600 }}>{formatCurrency(partner.totalPool as number)}</div></div>
        <div className={styles.row}><div className={styles.label}>HM Đã sử dụng</div><div className={styles.value} style={{ color: "#dc2626", fontWeight: 600 }}>{formatCurrency(partner.usedPool as number)}</div></div>
        <div className={styles.row}><div className={styles.label}>HM Còn lại</div><div className={styles.value} style={{ color: "#16a34a", fontWeight: 600 }}>{formatCurrency(partner.remainPool as number)}</div></div>
      </div>

      <div className={styles.tabs}>
        {mkTab("signature", "Chữ ký")}
        {mkTab("authorization", "UQ / Người đại diện PL")}
        {mkTab("custommertype", "Loại hình KH")}
        {mkTab("document", "Tài liệu")}
        {mkTab("bank_account", "Tài khoản ngân hàng/kênh đặt lệnh")}
        {mkTab("contact", "Liên hệ")}
      </div>

      <div className={styles.tabContent}>
        {activeTab === "signature" && <SignatureAndSealTab partnerId={partnerId} isView={true} />}
        {activeTab === "authorization" && <AuthorizationTab partnerId={partnerId} isView={true} />}
        {activeTab === "custommertype" && <CustommerTypeTab partnerId={partnerId} isView={true} />}
        {activeTab === "document" && <DocumentTab partnerId={partnerId} isView={true} />}
        {activeTab === "bank_account" && <BankAccountTab partnerId={partnerId} isView={true} />}
        {activeTab === "contact" && <ContactTab partnerId={partnerId} isView={true} />}
      </div>

      <div className={styles.footer}>
        <button className={styles.backBtn} onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
}
