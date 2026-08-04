'use client';

import { useState } from 'react';
import styles from './AccessControlList.module.css';
import Button from '@/components/shared/Button/Button'; // Dùng lại component button đã có
import Table from '@/components/shared/Table/Table'; // Dùng lại component table đã có
import PermissionForm from './PermissionForm';

export default function AccessControlList() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyen.van.a@example.com', role: 'Admin' },
    { id: 2, name: 'Trần Thị B', email: 'tran.thi.b@example.com', role: 'User' },
    { id: 3, name: 'Lê Văn C', email: 'le.van.c@example.com', role: 'Editor' },
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'User'
  });

  // Trạng thái để điều khiển việc hiển thị modal thêm
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const user = {
        id: users.length + 1,
        ...newUser
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', role: 'User' });
      setShowAddModal(false); // Sau khi thêm xong thì đóng modal
    }
  };

  const handleShowAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewUser({ name: '', email: '', role: 'User' });
  };

  // Handle opening permission form for a specific resource
  const handleOpenPermissionForm = (resource: string) => {
    setSelectedResource(resource);
    setShowPermissionModal(true);
  };

  const handleClosePermissionModal = () => {
    setShowPermissionModal(false);
    setSelectedResource(null);
    setSelectedUser(null);
  };

  // Handle opening permission form for a specific user
  const handleOpenUserPermissionModal = (user: any) => {
    setSelectedUser(user);
    setShowPermissionModal(true);
  };

  // Định nghĩa các cột cho table
  const columns = [
    {
      key: 'id',
      title: 'ID',
      width: '50px'
    },
    {
      key: 'name',
      title: 'Tên'
    },
    {
      key: 'email',
      title: 'Email'
    },
    {
      key: 'role',
      title: 'Vai Trò'
    },
    {
      key: 'actions',
      title: 'Hành Động',
      width: '150px',
      render: (row: any) => (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenUserPermissionModal(row)}
          >
            Sửa
          </Button>
          <Button variant="secondary" size="sm">Vô hiệu</Button>
        </div >
      )
    }
  ];

  // Resources that will have permission forms
  const resourcePermissions = [
    { name: 'Danh mục và Cấu hình', resource: 'CAPITAL_CONFIG' },
    { name: 'Quản lý Khế ước Nhận Nợ', resource: 'CAPITAL_CONTRACT' },
    { name: 'Quản lý Sự kiện Trả Nợ', resource: 'CAPITAL_REPAYMENT' },
    { name: 'Quản lý Hạn mức tín dụng', resource: 'CAPITAL_PARTNER_LIMIT' },
    { name: 'Quản lý Giao dịch tài sản', resource: 'CAPITAL_ASSET' },
    { name: 'Liên kết KUNN với giao dịch/tài sản', resource: 'CAPITAL_ASSET' },
    { name: 'Import Excel', resource: 'CAPITAL_BATCH' },
    { name: 'Export Excel', resource: 'CAPITAL_REPORT' },
    { name: 'Lịch sử thay đổi', resource: 'AUDIT_LOG' },
  ];

  return (
    <div className={styles.accessControl}>

      {/* Modal thêm người dùng */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Thêm Người Dùng Mới</h3>
            <div className={styles.addUserForm}>
              <input
                type="text"
                placeholder="Tên người dùng"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className={styles.input}
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className={styles.input}
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className={styles.select}
              >
                <option value="User">Người Dùng</option>
                <option value="Editor">Biên Tập Viên</option>
                <option value="Admin">Quản Trị Viên</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa quyền */}
      {showPermissionModal && (
        <PermissionForm
          isOpen={showPermissionModal}
          onClose={handleClosePermissionModal}
          departmentId="NV" // In a real app, this would come from user context or session
        />
      )}

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          data={users}
          rowKey="id"
        />
      </div>
    </div>
  );
}