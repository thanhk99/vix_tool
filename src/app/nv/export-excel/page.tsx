'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api/client';
import { useNotification } from '@/hooks/useNotification';
import { useExportJob, ExportJobInfo } from '@/hooks/useExportJob';
import { 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Users, 
  DollarSign 
} from 'lucide-react';
import styles from './ExportExcel.module.css';

export default function ExportExcelPage() {
  const { notifyError } = useNotification();
  const { isExporting, triggerExport, downloadFile } = useExportJob();
  const [jobs, setJobs] = useState<ExportJobInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await apiClient.get('/v1/exports/jobs/my');
      const list = res.data?.data || res.data || res;
      setJobs(Array.isArray(list) ? list : []);
    } catch (err: any) {
      notifyError('Lỗi', 'Không thể tải danh sách tiến trình xuất file');
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    fetchJobs();
    const timer = setInterval(fetchJobs, 5000);
    return () => clearInterval(timer);
  }, [fetchJobs]);

  const handleExportPartners = () => {
    triggerExport('EXPORT_PARTNER', {}, 'Danh_sach_doi_tac.xlsx');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return `${d.toLocaleTimeString('vi-VN')} - ${d.toLocaleDateString('vi-VN')}`;
      }
    } catch (e) {}
    return dateStr;
  };

  const getJobTypeLabel = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'EXPORT_PARTNER':
        return 'Danh sách Đối tác';
      case 'EXPORT_CONTRACT':
        return 'Hợp đồng tín dụng';
      case 'EXPORT_CREDIT_LIMIT':
        return 'Hạn mức tín dụng';
      default:
        return type || 'Dữ liệu Excel';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return (
          <span className={`${styles.badge} ${styles.badgeCompleted}`}>
            <CheckCircle2 size={13} /> Hoàn thành
          </span>
        );
      case 'PROCESSING':
        return (
          <span className={`${styles.badge} ${styles.badgeProcessing}`}>
            <RefreshCw size={13} className={styles.spin} /> Đang xử lý
          </span>
        );
      case 'FAILED':
        return (
          <span className={`${styles.badge} ${styles.badgeFailed}`}>
            <AlertCircle size={13} /> Thất bại
          </span>
        );
      default:
        return (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            <Clock size={13} /> Đang chờ
          </span>
        );
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filterType !== 'ALL' && job.jobType !== filterType) return false;
    if (filterStatus !== 'ALL' && job.status !== filterStatus) return false;
    return true;
  });

  const totalCount = jobs.length;
  const completedCount = jobs.filter((j) => j.status === 'COMPLETED').length;
  const processingCount = jobs.filter((j) => j.status === 'PROCESSING' || j.status === 'PENDING').length;
  const failedCount = jobs.filter((j) => j.status === 'FAILED').length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <FileSpreadsheet size={24} color="#16a34a" />
            Trung tâm Xuất dữ liệu & Xử lý ngầm (Background Jobs)
          </h1>
          <p className={styles.subtitle}>
            Quản lý và tải các tệp dữ liệu Excel được xử lý ngầm toàn hệ thống
          </p>
        </div>
        <button className={`${styles.btnAction} ${styles.btnOutline}`} onClick={fetchJobs} disabled={loading}>
          <RefreshCw size={14} className={loading ? styles.spin : ''} />
          Làm mới
        </button>
      </div>

      {/* Metrics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f1f5f9', color: '#475569' }}>
            <FileText size={22} />
          </div>
          <div className={styles.statInfo}>
            <h4>Tổng số file</h4>
            <p>{totalCount}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.statInfo}>
            <h4>Hoàn tất</h4>
            <p>{completedCount}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div className={styles.statInfo}>
            <h4>Đang xử lý nền</h4>
            <p>{processingCount}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertCircle size={22} />
          </div>
          <div className={styles.statInfo}>
            <h4>Thất bại / Lỗi</h4>
            <p>{failedCount}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className={styles.quickActions}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Tạo yêu cầu xuất mới:</span>
        </div>
        <div className={styles.actionButtons}>
          <button 
            className={`${styles.btnAction} ${styles.btnPrimary}`} 
            onClick={handleExportPartners}
            disabled={isExporting}
          >
            <Users size={14} />
            {isExporting ? 'Đang xuất đối tác...' : 'Xuất danh sách Đối tác'}
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.cardTable}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitle}>
            <Clock size={16} color="#64748b" />
            Lịch sử xuất tệp ({filteredJobs.length})
          </div>

          <div className={styles.tableFilter}>
            <select
              className={styles.selectInput}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">Tất cả loại dữ liệu</option>
              <option value="EXPORT_PARTNER">Danh sách Đối tác</option>
              <option value="EXPORT_CONTRACT">Hợp đồng tín dụng</option>
              <option value="EXPORT_CREDIT_LIMIT">Hạn mức tín dụng</option>
            </select>

            <select
              className={styles.selectInput}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.jobTable}>
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
                <th>Tên tệp tin</th>
                <th>Loại dữ liệu</th>
                <th>Dung lượng</th>
                <th>Thời gian tạo</th>
                <th>Trạng thái</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    Chưa có tiến trình xuất file nào
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job, idx) => (
                  <tr key={job.id}>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                    <td>
                      <strong>{job.fileName || 'Danh_sach_xuat.xlsx'}</strong>
                    </td>
                    <td>{getJobTypeLabel(job.jobType)}</td>
                    <td>{formatFileSize(job.fileSize)}</td>
                    <td>{formatDateTime(job.createdAt)}</td>
                    <td>{getStatusBadge(job.status)}</td>
                    <td style={{ textAlign: 'center' }}>
                      {job.status === 'COMPLETED' ? (
                        <button
                          className={styles.btnDownload}
                          onClick={() => downloadFile(job.id, job.fileName)}
                        >
                          <Download size={13} /> Tải file
                        </button>
                      ) : job.status === 'FAILED' ? (
                        <span style={{ fontSize: '11px', color: '#dc2626' }} title={job.errorLog}>
                          Lỗi xử lý
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#d97706' }}>
                          Đang tạo file...
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
