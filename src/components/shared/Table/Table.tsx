import React, { useState } from 'react';
import styles from './Table.module.css';

export interface TableColumn<T> {
  key: string;
  title: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: keyof T | ((row: T) => string);
  isLoading?: boolean;
  emptyText?: React.ReactNode;
  caption?: string;
  onRowClick?: (row:T) => void;
  highlightRow?: boolean;
  selectedRowkey?: string | null;
}

export default function Table<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyText = 'Không có dữ liệu',
  caption,
  onRowClick,
  highlightRow=true,
  selectedRowkey= null
}: TableProps<T>) {

  function getRowKey(row: T, index: number): string {
    if (typeof rowKey === 'function') return rowKey(row);
    const value = row[rowKey];
    return value !== undefined && value !== null ? String(value) : String(index);
  }

  function getCellValue(row: T, col: TableColumn<T>, rowIndex: number): React.ReactNode {
    const value = (row as Record<string, unknown>)[col.key];
    if (col.render) return col.render(value, row, rowIndex);
    return value !== undefined && value !== null ? String(value) : '—';
  }

  return (
    <div className={styles.wrapper} role="region" aria-label={caption ?? 'Data table'}>
      <table className={styles.table} aria-label={caption}>
        {caption && <caption className={styles.caption}>{caption}</caption>}
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={styles.th}
                style={{ width: col.width, textAlign: col.align ?? 'left' }}
                scope="col"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className={styles.stateCell}>
                <span className={styles.loadingSpinner} aria-label="Đang tải..." />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.stateCell}>
                <span className={styles.emptyText}>{emptyText}</span>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const key = getRowKey(row, rowIndex);
              const isSelected = highlightRow && selectedRowkey === key;

              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  style={{ cursor: onRowClick || highlightRow ? 'pointer' : 'default' }}
                  className={`${styles.tr} ${isSelected ? styles.selectedRow : ''}`}
                >
                  {columns.map((col) => {
                    const cellValue = getCellValue(row, col, rowIndex);
                    const titleText = typeof (row as any)[col.key] === 'string' || typeof (row as any)[col.key] === 'number' 
                                      ? String((row as any)[col.key]) : undefined;
                    return (
                      <td
                        key={col.key}
                        className={styles.td}
                        style={{ textAlign: col.align ?? 'left' }}
                        title={titleText}
                      >
                        {cellValue}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
