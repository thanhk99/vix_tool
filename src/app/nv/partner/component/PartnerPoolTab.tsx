'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './PartnerPoolTab.module.css';
import apiClient from '@/lib/api/client';
import { useNotification } from '@/hooks/useNotification';
import Button from '@/components/shared/Button/Button';
import Input from '@/components/shared/Input/Input';
import Modal from '@/components/shared/Modal/Modal';
import { Edit2, Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface PartnerPoolTabProps {
  partnerId: string;
isView?: boolean;
}

export default function PartnerPoolTab({ partnerId, isView }: PartnerPoolTabProps) {
  const { notifySuccess, notifyError, notifyWarning } = useNotification();
  
  // Tier 1 state
  const [poolData, setPoolData] = useState<any>(null);
  const [isPoolLoading, setIsPoolLoading] = useState(true);
  const [isEditPoolModalOpen, setIsEditPoolModalOpen] = useState(false);
  const [poolInput, setPoolInput] = useState('');
  const [isSavingPool, setIsSavingPool] = useState(false);

  const fetchPoolData = useCallback(async () => {
    setIsPoolLoading(true);
    try {
      const res: any = await apiClient.get(`/v1/capital-source/partners/${partnerId}`);
      const partner = res?.data?.data || res?.data || res;
      if (partner) {
        setPoolData({
          totalPool: partner.totalPool || 0,
          usedPool: partner.usedPool || 0,
          remainPool: partner.remainPool || 0,
        });
      } else {
        setPoolData(null);
      }
    } catch (err: any) {
      setPoolData(null);
    } finally {
      setIsPoolLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    fetchPoolData();
  }, [fetchPoolData]);

  // Handle Tier 1 Save
  const handleSavePool = async () => {
    if (!poolInput) {
      return notifyWarning('Cảnh báo', 'Vui lòng nhập số tiền tổng hạn mức');
    }
    try {
      setIsSavingPool(true);
      const res: any = await apiClient.put(`/v1/capital-source/partners/${partnerId}/pool?totalPool=${poolInput}`);
      if (res && res.success === false) {
        notifyError('Lỗi', res.message || 'Không thể thiết lập tổng hạn mức');
        return;
      }
      notifySuccess('Thành công', 'Đã cập nhật tổng hạn mức');
      setIsEditPoolModalOpen(false);
      fetchPoolData();
    } catch (err: any) {
      notifyError('Lỗi', err.message || err.response?.data?.message || 'Không thể thiết lập tổng hạn mức');
    } finally {
      setIsSavingPool(false);
    }
  };

  if (isPoolLoading) return <div className={styles.loading}>Đang tải dữ liệu ngân sách...</div>;

  return (
    <div className={styles.container}>
      {/* Tier 1: Partner Pool */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            TỔNG HẠN MỨC ĐỐI TÁC (CẤP 1)
          </h3>
          <Button 
            variant="primary" 
            onClick={() => {
              setPoolInput(poolData?.totalPool ? String(poolData.totalPool) : '');
              setIsEditPoolModalOpen(true);
            }}
          >
            {(poolData && poolData.totalPool > 0) ? <><Edit2 size={16} style={{marginRight: 6}} /> Cập nhật</> : <><Plus size={16} style={{marginRight: 6}} /> Thiết lập</>}
          </Button>
        </div>
        
        <div className={styles.sectionContent}>
          {(!poolData || poolData.totalPool === 0) ? (
            <div className={styles.emptyState}>
              Đối tác này chưa được thiết lập Tổng Hạn Mức. Vui lòng bấm Thiết lập.
            </div>
          ) : (
            <div className={styles.grid3}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Hạn mức tổng</div>
                <div className={`${styles.statValue} ${styles.blue}`}>{formatCurrency(poolData.totalPool)}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Đã sử dụng</div>
                <div className={`${styles.statValue} ${styles.red}`}>{formatCurrency(poolData.usedPool)}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Còn lại</div>
                <div className={`${styles.statValue} ${styles.green}`}>{formatCurrency(poolData.remainPool)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit Tier 1 */}
      {isEditPoolModalOpen && (
        <Modal
          isOpen={isEditPoolModalOpen}
          onClose={() => setIsEditPoolModalOpen(false)}
          title="THIẾT LẬP TỔNG HẠN MỨC"
        >
          <div className={styles.formGrid}>
            <Input
              label="Số tiền (VND)"
              type="number"
              value={poolInput}
              onChange={(e) => setPoolInput(e.target.value)}
              placeholder="Nhập tổng hạn mức..."
              disabled={isSavingPool}
              fullWidth
            />
          </div>
          <div className={styles.formActions}>
            <Button variant="outline" onClick={() => setIsEditPoolModalOpen(false)} disabled={isSavingPool}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSavePool} isLoading={isSavingPool}>
              Lưu thiết lập
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
