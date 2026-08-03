"use client";

import { useState } from "react";
import styles from "./AccountList.module.css";
import { Eye, Pen } from "lucide-react";

interface Account {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  status: "ACTIVE" | "INACTIVE";
  permissions: {
    functionName: string;
    maker: string;
    checker: string;
    manager: string;
    riskAudit: string;
    admin: string;
  }[];
}

const mockAccounts: Account[] = [
  {
    id: "1",
    username: "admin",
    fullName: "Administrator",
    email: "admin@vix.local",
    role: "ADMIN",
    department: "Phòng Nhân sự",
    status: "ACTIVE",
    permissions: [
      { functionName: "Danh mục cấu hình", maker: "R", checker: "A", manager: "R", riskAudit: "R", admin: "CRUD+A" },
      { functionName: "Đối tác", maker: "CRUD", checker: "A", manager: "R", riskAudit: "R", admin: "R" },
    ]
  },
  {
    id: "2",
    username: "maker1",
    fullName: "Nguyễn Văn A",
    email: "maker1@vix.local",
    role: "MAKER",
    department: "Phòng Quản lý vốn",
    status: "ACTIVE",
    permissions: [
      { functionName: "Đối tác", maker: "CRUD", checker: "A", manager: "R", riskAudit: "R", admin: "R" },
      { functionName: "Hạn mức", maker: "CRUD", checker: "A", manager: "R", riskAudit: "R", admin: "R" },
    ]
  },
  {
    id: "3",
    username: "checker1",
    fullName: "Lê Văn C",
    email: "checker1@vix.local",
    role: "CHECKER",
    department: "Phòng Quản lý vốn",
    status: "ACTIVE",
    permissions: [
      { functionName: "Đối tác", maker: "CRUD", checker: "A", manager: "R", riskAudit: "R", admin: "R" },
    ]
  },
  {
    id: "4",
    username: "manager1",
    fullName: "Phạm Văn D",
    email: "manager1@vix.local",
    role: "MANAGER",
    department: "Phòng Công nghệ thông tin",
    status: "INACTIVE",
    permissions: []
  },
];

interface AccountListProps {
  onViewPermissions?: (account: Account) => void;
  onEditPermissions?: (account: Account) => void;
  onDisableAccount?: (account: Account) => void;
}

export default function AccountList({ 
  onViewPermissions,
  onEditPermissions,
  onDisableAccount
}: AccountListProps) {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td className={styles.username}>{account.username}</td>
                <td>{account.fullName}</td>
                <td>{account.email}</td>
                <td>
                  <span className={`${styles.statusBadge} ${account.status === "ACTIVE" ? styles.statusActive : styles.statusInactive}`}>
                    {account.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnView}`}
                      onClick={() => onViewPermissions?.(account)}
                      disabled={account.status === "INACTIVE"}
                      title={account.status === "INACTIVE" ? "Tài khoản không hoạt động" : "Xem quyền"}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                      onClick={() => onEditPermissions?.(account)}
                      disabled={account.status === "INACTIVE"}
                      title={account.status === "INACTIVE" ? "Tài khoản không hoạt động" : "Sửa quyền"}
                    >
                      <Pen size={16} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDisable} ${
                        account.status === "INACTIVE" 
                          ? styles.actionBtnDisableInactive 
                          : styles.actionBtnDisableActive
                      }`}
                      onClick={() => onDisableAccount?.(account)}
                      title={account.status === "ACTIVE" ? "Vô hiệu hóa tài khoản" : "Kích hoạt lại tài khoản"}
                    >
                      {account.status === "ACTIVE" ? "Vô hiệu" : "Kích hoạt"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}