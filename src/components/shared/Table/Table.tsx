import React from 'react';
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
  emptyText?: string;
  caption?: string;
}

export default function Table<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyText = 'Không có dữ liệu',
  caption,
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
            data.map((row, rowIndex) => (
              <tr key={getRowKey(row, rowIndex)} className={styles.tr}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={styles.td}
                    style={{ textAlign: col.align ?? 'left' }}
                  >
                    {getCellValue(row, col, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
