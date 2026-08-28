import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  searchKeyword?: string;
  styles: any;
}

export default function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  searchKeyword,
  styles
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
	  if (totalItems <= 0) return null;

  return (
    <div className={styles.pagination || ''} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '14px', color: 'var(-text-secondary)' }}>
      <div className={styles.pageInfo || ''} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} của {totalItems} bản ghi {searchKeyword && '(gẽt quả tìm kiếm)'}</span>
        <select 
          value={pageSize} 
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', cursor: 'pointer' }}
          className={styles.select || ''}
        >
          <option value={10}>10 / trang</option>
          <option value={20}>20 / trang</option>
          <option value={50}>50 / trang</option>
          <option value={100}>100 / trang</option>
        </select>
      </div>
      <div className={styles.pageControls || ''} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <button
          className={styles.pageBtn || ''}
          style={{ border: '1px solid var(--border)', padding: '4px 8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
          let startPage = Math.max(1, currentPage - 4);
          if (startPage + 9 > totalPages) startPage = Math.max(1, totalPages - 9);
          return startPage + i;
        }).map((page) => {
          if (page > totalPages) return null;
          return (
            <button
              key={page}
              className={currentPage === page ? (styles.pageActive || '') : (styles.pageBtn || '')}
              style={{ border: '1px solid var(--border)', padding: '4px 8px', cursor: 'pointer', background: currentPage === page ? '#eff6ff' : 'transparent', color: currentPage === page ? '#2563eb' : 'inherit' }}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        })}
        <button
          className={styles.pageBtn || ''}
          style={{ border: '1px solid var(--border)', padding: '4px 8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}