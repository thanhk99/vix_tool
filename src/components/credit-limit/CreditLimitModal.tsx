'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Upload, Download, Filter, FileBox } from 'lucide-react';
import { LIMIT_TYPES, CURRENCIES, PURPOSES } from '../../constants/credit-limit';
import apiClient from '@/lib/api/client';
import { useNotification } from '@/hooks/useNotification';
import Modal from '@/components/shared/Modal/Modal';
import Button from '@/components/shared/Button/Button';
import Input from '@/components/shared/Input/Input';
import Table, { TableColumn } from '@/components/shared/Table/Table';
import AssetFormModal from '@/components/shared/AssetFormModal/AssetFormModal';
import styles from './CreditLimitTable.module.css';

interface CreditLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitData?: any; // To populate form if editing
  initialTab?: 1 | 2;
}

export default function CreditLimitModal({ isOpen, onClose, limitData, initialTab = 1 }: CreditLimitModalProps) {
  const [activeTab, setActiveTab] = useState<1 | 2>(1);
  const { notifySuccess, notifyError } = useNotification();
  
  const [partnerOptions, setPartnerOptions] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isCreatingAsset, setIsCreatingAsset] = useState(false);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [partnerSearchInput, setPartnerSearchInput] = useState('');
  
  const [formData, setFormData] = useState({
    partnerId: '',
    contactNo: '',
    poolType: '',
    currency: '',
    totalPool: '',
    creditRatio: '',
    purpose: '',
    startDate: '',
    endDate: ''
  });

  const fetchPartners = useCallback(async () => {
    try {
      const res: any = await apiClient.get('/v1/capital-source/partners?size=100');
      if (res?.content) {
        setPartnerOptions(res.content);
      } else if (res?.data?.content) {
        setPartnerOptions(res.data.content);
      }
    } catch (error) {
      console.error('Failed to load partners', error);
    }
  }, []);

  const fetchAssets = useCallback(async () => {
    if (!limitData?.id || !limitData?.partnerId) return;
    try {
      setIsLoadingAssets(true);
      const res = await apiClient.get(`/v1/capital-source/partners/${limitData.partnerId}/credit-limits/${limitData.id}/assets`);
      if (Array.isArray(res)) {
        setAssets(res);
      } else if (res?.data && Array.isArray(res.data)) {
        setAssets(res.data);
      } else {
        setAssets([]);
      }
    } catch (error) {
      console.error('Failed to load assets', error);
      setAssets([]);
    } finally {
      setIsLoadingAssets(false);
    }
  }, [limitData]);

  useEffect(() => {
    if (isOpen) {
      fetchPartners();
      if (limitData) {
        setFormData({
          partnerId: limitData.partnerId || '',
          contactNo: limitData.contactNo || '',
          poolType: limitData.poolType || '',
          currency: limitData.currency || '',
          totalPool: limitData.totalPool ? limitData.totalPool.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '',
          creditRatio: limitData.creditRatio || '',
          purpose: limitData.purpose || '',
          startDate: limitData.startDate ? new Date(limitData.startDate).toISOString().split('T')[0] : '',
          endDate: limitData.endDate ? new Date(limitData.endDate).toISOString().split('T')[0] : ''
        });
        fetchAssets();
      } else {
        setFormData({
          partnerId: '',
          contactNo: '',
          poolType: '',
          currency: '',
          totalPool: '',
          creditRatio: '',
          purpose: '',
          startDate: '',
          endDate: ''
        });
        setAssets([]);
      }
      setActiveTab(initialTab);
    }
  }, [isOpen, limitData, fetchPartners, fetchAssets, initialTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'totalPool') {
      const rawValue = value.replace(/\D/g, '');
      const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (!formData.partnerId) {
        notifyError('Lỗi', 'Vui lòng chọn Mã đơn vị GD');
        return;
      }
      if (!formData.contactNo || !formData.currency || !formData.totalPool || !formData.startDate || !formData.endDate) {
        notifyError('Lỗi', 'Vui lòng nhập đầy đủ các trường bắt buộc');
        return;
      }

      const payload = {
        partnerId: formData.partnerId,
        contactNo: formData.contactNo,
        poolType: formData.poolType,
        currency: formData.currency,
        totalPool: Number(formData.totalPool.replace(/\./g, '')),
        creditRatio: formData.creditRatio ? Number(formData.creditRatio) : null,
        purpose: formData.purpose,
        startDate: formData.startDate,
        endDate: formData.endDate,
        limitId: limitId !== '-' ? limitId : null
      };

      if (limitData?.id) {
        await apiClient.put(`/v1/capital-source/partners/${formData.partnerId}/credit-limits/${limitData.id}`, payload);
        notifySuccess('Thành công', 'Cập nhật hạn mức thành công');
      } else {
        await apiClient.post(`/v1/capital-source/partners/${formData.partnerId}/credit-limits`, payload);
        notifySuccess('Thành công', 'Thêm mới hạn mức thành công');
      }
      onClose();
    } catch (error) {
      console.error(error);
      notifyError('Lỗi', 'Có lỗi xảy ra khi lưu hạn mức');
    }
  };

  const assetColumns: TableColumn<any>[] = [
    { key: 'stt', title: 'STT', align: 'center', width: 50, render: (_, __, idx) => idx + 1 },
    { key: 'assetId', title: 'Mã TSĐB' },
    { key: 'assetType', title: 'Loại TSĐB' },
    { key: 'issuer', title: 'Tổ chức phát hành' },
    { key: 'issuerCode', title: 'Mã TCPH' },
    { key: 'parValue', title: 'Mệnh giá', align: 'right', render: (val) => val != null ? Number(val).toLocaleString('vi-VN') : '' },
    { key: 'issueDate', title: 'Ngày phát hành', align: 'center', render: (val) => val ? new Date(val as string).toLocaleDateString('en-GB') : '' },
    { key: 'maturityDate', title: 'Ngày đáo hạn', align: 'center', render: (val) => val ? new Date(val as string).toLocaleDateString('en-GB') : '' },
    { key: 'callDate', title: 'Ngày mua lại trước hạn', align: 'center', render: (val) => val ? new Date(val as string).toLocaleDateString('en-GB') : '' },
    { key: 'couponType', title: 'Loại lãi suất' },
    { key: 'couponRate', title: 'Lãi suất (%)', align: 'right' },
    { key: 'interestPayTerm', title: 'Kỳ trả lãi (tháng)', align: 'right' }
  ];

  const selectedPartner = partnerOptions.find(p => p.id === formData.partnerId);
  const partnerCode = selectedPartner ? (selectedPartner.branchCusId || selectedPartner.cusName) : '';
  const limitId = (partnerCode && formData.poolType) ? `${partnerCode}_${formData.poolType}` : '-';

  useEffect(() => {
    if (!isDropdownOpen) {
      setPartnerSearchInput(partnerCode);
    }
  }, [partnerCode, isDropdownOpen]);

  const activePartners = partnerOptions.filter(p => p.status === 'APPROVED' || p.status === 'Active' || p.status === 'ACTIVE');
  const filteredPartners = activePartners.filter(p => 
    (p.branchCusId || '').toLowerCase().includes(partnerSearchInput.toLowerCase()) || 
    (p.cusName || '').toLowerCase().includes(partnerSearchInput.toLowerCase())
  );

  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (!limitData?.id) return;
    try {
      setIsProcessing(true);
      await apiClient.put(`/v1/capital-source/credit-limits/${limitData.id}/approve`);
      notifySuccess('Thành công', 'Đã duyệt toàn bộ hạn mức của đối tác');
      onClose();
    } catch (error: any) {
      console.error(error);
      notifyError('Lỗi', error.response?.data?.message || 'Không thể phê duyệt');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!limitData?.id) return;
    try {
      setIsProcessing(true);
      await apiClient.put(`/v1/capital-source/credit-limits/${limitData.id}/reject`);
      notifySuccess('Thành công', 'Đã từ chối toàn bộ hạn mức của đối tác');
      onClose();
    } catch (error: any) {
      console.error(error);
      notifyError('Lỗi', error.response?.data?.message || 'Không thể từ chối');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={limitData ? 'Cập nhật hạn mức tín dụng' : 'Thêm mới hạn mức tín dụng'}
      size="xl"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Hủy</Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(limitData?.status === 'PENDING_APPROVAL' || limitData?.status === 'PENDING' || limitData?.status === 'Chờ duyệt') && (
               <>
                 <Button variant="outline" onClick={handleReject} disabled={isProcessing} style={{ color: 'red', borderColor: 'red' }}>Từ chối</Button>
                 <Button variant="primary" onClick={handleApprove} disabled={isProcessing} style={{ background: 'green', borderColor: 'green' }}>Phê duyệt</Button>
               </>
            )}
            <Button variant="outline" disabled={isProcessing}>Lưu nháp</Button>
            <Button variant="primary" onClick={handleSave} disabled={isProcessing}>Lưu</Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
        <button
          style={{ 
            padding: '8px 16px', 
            fontWeight: 500, 
            borderBottom: activeTab === 1 ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 1 ? 'var(--primary)' : 'var(--text-secondary)',
            background: 'none', cursor: 'pointer', borderTop: 'none', borderLeft: 'none', borderRight: 'none'
          }}
          onClick={() => setActiveTab(1)}
        >
          1. HĐ/PLHĐ hạn mức
        </button>
        <button
          style={{ 
            padding: '8px 16px', 
            fontWeight: 500, 
            borderBottom: activeTab === 2 ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 2 ? 'var(--primary)' : 'var(--text-secondary)',
            background: 'none', cursor: 'pointer', borderTop: 'none', borderLeft: 'none', borderRight: 'none'
          }}
          onClick={() => setActiveTab(2)}
        >
          2. Danh mục TSĐB
        </button>
      </div>

      <div style={{ padding: '8px' }}>
        {activeTab === 1 && (
          <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--background)', padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 500, fontSize: '14px' }}>
              Thông tin hợp đồng / phụ lục hợp đồng hạn mức
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Mã đơn vị GD <span style={{ color: 'red' }}>*</span></span>
                <div style={{ position: 'relative' }}>
                  <Input 
                    type="text"
                    value={partnerSearchInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPartnerSearchInput(val);
                      if (val === '') {
                        setFormData(prev => ({ ...prev, partnerId: '' }));
                      }
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => {
                      if (!limitData) setIsDropdownOpen(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setIsDropdownOpen(false);
                      }, 200);
                    }}
                    placeholder="Nhập hoặc click để chọn..."
                    disabled={!!limitData}
                    style={{ 
                      paddingRight: '36px', 
                      backgroundColor: !!limitData ? 'var(--background)' : 'var(--surface)' 
                    }}
                  />
                  <Search 
                    size={16} 
                    style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: 'var(--text-secondary)',
                      pointerEvents: 'none'
                    }} 
                  />
                  {isDropdownOpen && !limitData && (
                    <ul style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      margin: 0,
                      padding: 0,
                      listStyle: 'none'
                    }}>
                      {filteredPartners.length === 0 ? (
                        <li style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '14px' }}>Không tìm thấy đối tác</li>
                      ) : (
                        filteredPartners.map(p => (
                          <li 
                            key={p.id}
                            style={{ 
                              padding: '8px 12px', 
                              cursor: 'pointer', 
                              fontSize: '14px',
                              borderBottom: '1px solid var(--border)'
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault(); 
                              setFormData(prev => ({ ...prev, partnerId: p.id }));
                              setPartnerSearchInput(p.branchCusId || p.cusName);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <div style={{ fontWeight: 500, color: 'var(--primary)' }}>{p.branchCusId}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.cusName}</div>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Số hợp đồng <span style={{ color: 'red' }}>*</span></span>
                <Input 
                  type="text" 
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  placeholder="Nhập số hợp đồng" 
                />
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Loại hạn mức</span>
                <select 
                  name="poolType"
                  value={formData.poolType}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">- Chọn loại hạn mức -</option>
                  {LIMIT_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Đơn vị tiền tệ <span style={{ color: 'red' }}>*</span></span>
                <select 
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">- Chọn đơn vị tiền tệ -</option>
                  {CURRENCIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Hạn mức tổng <span style={{ color: 'red' }}>*</span></span>
                <div>
                  <Input 
                    type="text" 
                    name="totalPool"
                    value={formData.totalPool}
                    onChange={handleInputChange}
                    placeholder="Nhập hạn mức tổng" 
                  />
                </div>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>TL tài trợ/PA vay</span>
                <div style={{ position: 'relative' }}>
                  <Input 
                    type="number" 
                    name="creditRatio"
                    value={formData.creditRatio}
                    onChange={handleInputChange}
                    placeholder="Nhập tỷ lệ (%)" 
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'var(--text-secondary)' }}>%</span>
                </div>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Mục đích vay vốn</span>
                <select 
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">- Chọn mục đích vay vốn -</option>
                  {PURPOSES.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Mã hạn mức</span>
                <Input 
                  type="text" 
                  value={limitId}
                  readOnly
                  style={{ backgroundColor: 'var(--background)' }}
                />
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Ngày bắt đầu <span style={{ color: 'red' }}>*</span></span>
                <Input 
                  type="date" 
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Ngày hết hạn <span style={{ color: 'red' }}>*</span></span>
                <Input 
                  type="date" 
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div>
            <div className={styles.filterGroup} style={{ marginBottom: '24px', width: '50%' }}>
              <span className={styles.filterLabel}>Loại hạn mức <span style={{ color: 'red' }}>*</span></span>
              <select className={styles.select} disabled>
                <option value={formData.poolType}>{LIMIT_TYPES.find(l => l.id === formData.poolType)?.name || formData.poolType || '- Chưa chọn -'}</option>
              </select>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Lựa chọn loại hạn mức đã khai báo tại tab 1 để gắn danh mục TSĐB</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (!limitData?.id) {
                      notifyError("Cảnh báo", "Vui lòng lưu hạn mức trước khi thêm Tài sản đảm bảo");
                      return;
                    }
                    setIsCreatingAsset(true);
                  }}
                ><Plus size={16} style={{ marginRight: '4px', display: 'inline' }} /> Thêm mới</Button>
                <Button variant="outline"><Edit2 size={16} style={{ marginRight: '4px', display: 'inline' }} /> Sửa</Button>
                <Button variant="outline"><Trash2 size={16} style={{ marginRight: '4px', display: 'inline', color: 'red' }} /> Xóa</Button>
                <Button variant="outline"><Upload size={16} style={{ marginRight: '4px', display: 'inline' }} /> Import</Button>
                <Button variant="outline"><FileBox size={16} style={{ marginRight: '4px', display: 'inline', color: 'green' }} /> Tải mẫu Excel</Button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', width: '250px' }}>
                  <Input type="text" placeholder="Nhập mã TSĐB/TCPH..." />
                  <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                </div>
                <Button variant="outline"><Filter size={18} /></Button>
              </div>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <Table 
                columns={assetColumns} 
                data={assets} 
                rowKey="id" 
                isLoading={isLoadingAssets} 
                emptyText={
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <FileBox size={48} style={{ opacity: 0.3, margin: '0 auto 16px auto' }} />
                    <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Chưa có dữ liệu</p>
                    <p style={{ fontSize: '14px', marginBottom: '16px' }}>Vui lòng thêm mới hoặc import danh mục TSĐB</p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (!limitData?.id) {
                          notifyError("Cảnh báo", "Vui lòng lưu hạn mức trước khi thêm Tài sản đảm bảo");
                          return;
                        }
                        setIsCreatingAsset(true);
                      }}
                    ><Plus size={16} style={{ marginRight: '4px', display: 'inline' }} /> Thêm mới</Button>
                  </div>
                }
              />
            </div>
            
            <AssetFormModal
              isOpen={isCreatingAsset}
              onClose={() => setIsCreatingAsset(false)}
              partnerId={formData.partnerId}
              limitId={limitData?.id}
              onSuccess={fetchAssets}
            />
          </div>
        )}
      </div>

    </Modal>
  );
}
