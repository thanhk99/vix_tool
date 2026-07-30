"use client";

import { useState } from "react";
import styles from "./PermissionModal.module.css";
import Button from "@/components/shared/Button/Button";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  accounts?: { id: string; username: string; fullName: string; email: string; role: string; department: string }[];
}

interface Permission {
  id: string;
  name: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
}

const defaultPermissions: Permission[] = [
  { id: "1", name: "Danh mục cấu trúc", view: false, add: false, edit: false, delete: false, approve: false },
  { id: "2", name: "Đối tác", view: false, add: false, edit: false, delete: false, approve: false },
  { id: "3", name: "Hạn mức", view: false, add: false, edit: false, delete: false, approve: false },
  { id: "4", name: "Hợp đồng/KUNN", view: false, add: false, edit: false, delete: false, approve: false },
  { id: "5", name: "Trả nợ/Điều chỉnh", view: false, add: false, edit: false, delete: false, approve: false },
  { id: "6", name: "Tài sản/TSĐB", view: false, add: false, edit: false, delete: false, approve: false },
  { id: "9", name: "Báo cáo", view: false, add: false, edit: false, delete: false, approve: false },
  { id: "10", name: "Batch Monitor", view: false, add: false, edit: false, delete: false, approve: false } 
];

export default function PermissionModal({ isOpen, onClose, onSave, accounts }: PermissionModalProps) {
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  if (!isOpen) return null;

  const totalPermissions = permissions.length * 5;
  const checkedPermissions = permissions.reduce((count, p) => {
    return count + 
      (p.view ? 1 : 0) + 
      (p.add ? 1 : 0) + 
      (p.edit ? 1 : 0) + 
      (p.delete ? 1 : 0) + 
      (p.approve ? 1 : 0);
  }, 0);

  const handleCheckboxChange = (id: string, field: keyof Omit<Permission, 'id' | 'name'>) => {
    setPermissions(prev =>
      prev.map(p =>
        p.id === id ? { ...p, [field]: !p[field] } : p
      )
    );
  };

  const handleSelectAll = () => {
    const newState = !selectAll;
    setSelectAll(newState);
    setPermissions(prev =>
      prev.map(p => ({
        ...p,
        view: newState,
        add: newState,
        edit: newState,
        delete: newState,
        approve: newState,
      }))
    );
  };

  const handleSave = () => {
    onSave({
      accountId: selectedAccountId,
      permissions: permissions
    });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Phân quyền chi tiết</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.selectAccountWrapper}>
          <div className={styles.selectAccount}>
            <label className={styles.selectLabel}>Chọn tài khoản</label>
            <select
              className={styles.select}
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            >
              <option value="">-- Chọn tài khoản --</option>
              {accounts?.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.username} - {acc.fullName} ({acc.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colScreen}>Màn hình</th>
                <th className={styles.colCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <span className={styles.thLabel}>Chọn tất cả</span>
                </th>
                <th><span className={styles.thLabel}>Xem</span></th>
                <th><span className={styles.thLabel}>Thêm</span></th>
                <th><span className={styles.thLabel}>Sửa</span></th>
                <th><span className={styles.thLabel}>Xoá</span></th>
                <th><span className={styles.thLabel}>Duyệt</span></th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((item) => (
                <tr key={item.id}>
                  <td className={styles.screenName}>{item.name}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.view && item.add && item.edit && item.delete && item.approve}
                      onChange={() => {
                        const allChecked = !(item.view && item.add && item.edit && item.delete && item.approve);
                        setPermissions(prev =>
                          prev.map(p =>
                            p.id === item.id ? {
                              ...p,
                              view: allChecked,
                              add: allChecked,
                              edit: allChecked,
                              delete: allChecked,
                              approve: allChecked,
                            } : p
                          )
                        );
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.view}
                      onChange={() => handleCheckboxChange(item.id, 'view')}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.add}
                      onChange={() => handleCheckboxChange(item.id, 'add')}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.edit}
                      onChange={() => handleCheckboxChange(item.id, 'edit')}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.delete}
                      onChange={() => handleCheckboxChange(item.id, 'delete')}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.approve}
                      onChange={() => handleCheckboxChange(item.id, 'approve')}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <div className={styles.stats}>
            <span className={styles.count}>{checkedPermissions}/{totalPermissions} quyền</span>
            <button className={styles.selectAllBtn} onClick={handleSelectAll}>
              Chọn tất cả
            </button>
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose}>
              Huỷ
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Lưu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}