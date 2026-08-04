'use client';

import { useEffect, useState, useMemo } from 'react';
import styles from './PartnerList.module.css';
import Button from '@/components/shared/Button/Button';
import Table, { TableColumn } from '@/components/shared/Table/Table';
import Input from '@/components/shared/Input/Input';
import { PartnersItem } from '@/types/funding.types';
import apiClient from '@/lib/api/client';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

export default function PartnerList() {
  const [partners, setPartners] = useState<PartnersItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const filteredPartners = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();
    if (!keyword) return partners;
    
    return partners.filter(item =>
      item.cusId?.toLowerCase().includes(keyword) ||
      item.cusName?.toLowerCase().includes(keyword) ||
      item.branchCusId?.toLowerCase().includes(keyword) ||
      item.idCode?.toLowerCase().includes(keyword) ||
      item.email?.toLowerCase().includes(keyword)
    );
  }, [partners, searchKeyword]);

  // Tinh toan cho phan trang
  const totalItems = filteredPartners.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredPartners.slice(startIndex, startIndex + pageSize);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/v1/capital-source/partners");
      const data = res.data.data || res.data;
      setPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword]);

  // Xu ly tim kiem
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
  };

  // getStatusClass 
  const STATUS_CLASS = {
    Active: styles.active,
    Pending: styles.pending,
    Inactive: styles.inactive,
  };

  const getStatusClass = (status: string) => STATUS_CLASS[status as keyof typeof STATUS_CLASS] ?? "";

  // Định nghĩa các cột cho table
  const columns: TableColumn<PartnersItem>[] = [
    {
      key: "stt",
      title: "STT",
      width: 60,
      render: (_, __, index) => startIndex + index + 1,
    },
    {
      key: "cusId",
      title: "Mã KH",
    },
    {
      key: "branchCusId",
      title: "Mã đơn vị GD",
    },
    {
      key: "cusName",
      title: "Tên KH",
    },
    {
      key: "idCode",
      title: "Số ĐKKD/CCCD",
    },
    {
      key: "fistIssueDate",
      title: "Ngày cấp lần đầu",
    },
    {
      key: "lastIssueDate",
      title: "Ngày cấp cuối",
    },
    {
      key: "issueBy",
      title: "Nơi cấp",
    },
    {
      key: "opLiscenseNo",
      title: "GP hoạt động",
    },
    {
      key: "opIssueDate",
      title: "Ngày cấp",
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (value) => (
        <span className={`${styles.status} ${getStatusClass(value as string) ?? ""}`}>
          {value as string}
        </span>
      ),
    },
    {
      key: "lastUpdated",
      title: "Ngày chỉnh sửa",
    },
    {
      key: "updatedBy",
      title: "User thực hiện",
    },
    {
      key: "actions",
      title: "Thao tác",
      width: 150,
      render: () => (
        <div className={styles.actionButtons}>
          <Button variant="outline" size="sm">Sửa</Button>
          <Button variant="danger" size="sm" style={{ marginLeft: 8 }}>Xóa</Button>
        </div>
      ),
    },
  ];

  // Xu ly phan trang
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.actions}>
          {/* SEARCH  */}
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm kiếm theo mã, tên KH,..."
              value={searchKeyword}
              onChange={handleSearch}
            />
            {searchKeyword && (
              <button className={styles.clearBtn} onClick={handleClearSearch}>
                <X size={14} />
              </button>
            )}
          </div>

          <Button variant="primary" onClick={fetchPartners}>
            Làm mới
          </Button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          data={currentData}
          rowKey="id"
          isLoading={loading}
        />
      </div>

      {/* PHÂN TRANG */}
      {totalItems > 0 && (
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} của {totalItems} bản ghi
            {searchKeyword && ` (kết quả tìm kiếm)`}
          </div>
          <div className={styles.pageControls}>
            <button
              className={styles.pageBtn}
              disabled={currentPage === 1}
              onClick={handlePrevPage}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageBtn} ${currentPage === page ? styles.pageActive : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}