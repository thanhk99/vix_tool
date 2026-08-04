'use client';

import { useState } from 'react';
import styles from './PartnerList.module.css';
import Button from '@/components/shared/Button/Button';
import Table from '@/components/shared/Table/Table';
import Input from '@/components/shared/Input/Input';

export default function PartnerList() {
  const [partners, setPartners] = useState([
    { id: 1, name: 'Công ty ABC', type: 'Đối tác chính', status: 'Hoạt động' },
    { id: 2, name: 'Công ty XYZ', type: 'Đối tác tiềm năng', status: 'Chờ duyệt' },
    { id: 3, name: 'Công ty DEF', type: 'Đối tác lâu năm', status: 'Hoạt động' },
  ]);

  const [newPartner, setNewPartner] = useState({
    name: '',
    type: 'Đối tác chính',
    status: 'Chờ duyệt'
  });

  const handleAddPartner = () => {
    if (newPartner.name) {
      const partner = {
        id: partners.length + 1,
        ...newPartner
      };
      setPartners([...partners, partner]);
      setNewPartner({ name: '', type: 'Đối tác chính', status: 'Chờ duyệt' });
    }
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
      title: 'Tên Đối Tác'
    },
    {
      key: 'type',
      title: 'Loại'
    },
    {
      key: 'status',
      title: 'Trạng Thái',
      render: (value: unknown) => {
        const statusValue = value as string;
        return (
          <span className={`${styles.status} ${styles[statusValue.toLowerCase().replace(' ', '-')]}`}>
            {statusValue}
          </span>
        );
      }
    },
    {
      key: 'actions',
      title: 'Hành Động',
      width: '150px',
      render: () => (
        <div>
          <Button variant="outline" size="sm">Sửa</Button>
          <Button variant="danger" size="sm" style={{ marginLeft: '8px' }}>Xóa</Button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.partnerList}>
      <div className={styles.header}>
        <h2>Quản Lý Đối Tác</h2>
        <Button variant="primary">Thêm Đối Tác Mới</Button>
      </div>

      <div className={styles.addPartnerForm}>
        <Input
          type="text"
          placeholder="Tên đối tác"
          value={newPartner.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPartner({ ...newPartner, name: e.target.value })}
        />
        <select
          value={newPartner.type}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewPartner({ ...newPartner, type: e.target.value })}
          className={styles.select}
        >
          <option value="Đối tác chính">Đối tác chính</option>
          <option value="Đối tác tiềm năng">Đối tác tiềm năng</option>
          <option value="Đối tác lâu năm">Đối tác lâu năm</option>
        </select>
        <select
          value={newPartner.status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewPartner({ ...newPartner, status: e.target.value })}
          className={styles.select}
        >
          <option value="Hoạt động">Hoạt động</option>
          <option value="Chờ duyệt">Chờ duyệt</option>
          <option value="Ngừng hoạt động">Ngừng hoạt động</option>
        </select>
        <Button variant="primary" onClick={handleAddPartner}>Thêm</Button>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          data={partners}
          rowKey="id"
        />
      </div>
    </div>
  );
}