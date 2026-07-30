"use client";

import styles from "./page.module.css";
import Button from "@/components/shared/Button/Button";
import {useState} from "react";
import PermissionModal from "@/components/nv/AccessControl/PermissionModal";
import AccountList from "@/components/nv/AccessControl/AccountList";

export default function AccessControlPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleSave = (data: any) => {
    console.log("Saved permissions:", data);
    alert("Lưu phân quyền thành công!");
  };
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý phân quyền và kiểm soát</h1>
          <p className={styles.subtitle}>Quản lý phân quyền người dùng</p>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Tạo phân quyền
          </Button>
        </div>
      </div>

      {/* table */}
      <AccountList/>

      {/* Modal */}
      <PermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}