'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import { LIMIT_TYPES, CURRENCIES, PURPOSES } from '@/constants/credit-limit';
import apiClient from '@/lib/api/client';
import { useNotification } from '@/hooks/useNotification';
import Modal from '@/components/shared/Modal/Modal';
import Button from '@/components/shared/Button/Button';
import CurrencyInput from '@/components/shared/Input/CurrencyInput';
import { formatDate } from '@/utils/format';
import styles from './CreditLimitModal.module.css';


interface CreditLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitData?: any; // To populate form if editing
  initialTab?: 1 | 2;
  mode?: 'create' | 'edit' | 'view';
}

export default function CreditLimitModal({ 
  isOpen, 
  onClose, 
  limitData, 
  initialTab = 1, 
  mode = 'create' 
}: CreditLimitModalProps) {
  const [activeTab, setActiveTab] = useState<1 | 2>(initialTab);
  const { notifySuccess, notifyError } = useNotification();
  
  const [partnerOptions, setPartnerOptions] = useState<any[]>([]);
  const [isPartnerDropdownOpen, setIsPartnerDropdownOpen] = useState(false);
  const [partnerSearchInput, setPartnerSearchInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Existing contracts for selected partner
  const [partnerContracts, setPartnerContracts] = useState<any[]>([]);
  const [isContractDropdownOpen, setIsContractDropdownOpen] = useState(false);

  const partnerWrapperRef = useRef<HTMLDivElement>(null);
  const contractWrapperRef = useRef<HTMLDivElement>(null);

  // Form Data Tab 1
  const [formData, setFormData] = useState({
    partnerId: '',
    branchCusId: '',
    cusName: '',
    contractId: '',
    contractNo: '',
    poolType: '',
    currency: 'VND',
    totalPool: '',
    creditRatio: '',
    purpose: '',
    startDate: '',
    endDate: ''
  });

  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Tab 2 (TSDB) Filter and Pagination state
  const [tsdbSearchLimitType, setTsdbSearchLimitType] = useState('');
  const [tsdbPage, setTsdbPage] = useState(1);
  const [tsdbPageSize, setTsdbPageSize] = useState(10);
  const [assetsList, setAssetsList] = useState<any[]>([]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (partnerWrapperRef.current && !partnerWrapperRef.current.contains(e.target as Node)) {
        setIsPartnerDropdownOpen(false);
      }
      if (contractWrapperRef.current && !contractWrapperRef.current.contains(e.target as Node)) {
        setIsContractDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load partners list
  const fetchPartners = useCallback(async () => {
    try {
      const res: any = await apiClient.get('/v1/capital-source/partners?size=100');
      const list = res?.content || res?.data?.content || [];
      // Rule: Chỉ show đối tác có trạng thái "hoạt động" (APPROVED)
      const approvedOnly = list.filter((p: any) => 
        p.status === 'APPROVED' || p.status === 'Hoạt động' || p.isActive === true
      );
      setPartnerOptions(approvedOnly);
    } catch (error) {
      console.error('Failed to load partners', error);
    }
  }, []);

  // Load existing contracts for a partner
  const fetchPartnerContracts = useCallback(async (pId: string) => {
    if (!pId) {
      setPartnerContracts([]);
      return;
    }
    try {
      const contractsMap = new Map<string, any>();
      
      // 1. Fetch from partner contracts API
      try {
        const res: any = await apiClient.get(`/v1/capital-source/partners/${pId}/contracts?size=100`);
        const list = res?.content || res?.data?.content || (Array.isArray(res?.data) ? res.data : []);
        if (Array.isArray(list)) {
          list.forEach((c: any) => {
            if (c.contractNo) {
              contractsMap.set(c.contractNo.toLowerCase(), {
                id: c.id,
                contractNo: c.contractNo,
                totalLimit: c.totalLimit,
                startDate: c.startDate,
                endDate: c.endDate,
                purpose: c.purpose,
                status: c.status
              });
            }
          });
        }
      } catch (e) {
        console.warn('Contracts API failed, falling back', e);
      }

      // 2. Also check credit-limits API for this partner to ensure all existing contracts are covered
      try {
        const limitsRes: any = await apiClient.get(`/v1/capital-source/credit-limits?partnerId=${pId}&size=100`);
        const lList = limitsRes?.content || limitsRes?.data?.content || [];
        if (Array.isArray(lList)) {
          lList.forEach((l: any) => {
            if (l.contractNo && !contractsMap.has(l.contractNo.toLowerCase())) {
              contractsMap.set(l.contractNo.toLowerCase(), {
                id: l.contractId,
                contractNo: l.contractNo,
                totalLimit: l.totalPool,
                startDate: l.startDate,
                endDate: l.endDate,
                purpose: l.purpose,
                status: l.status
              });
            }
          });
        }
      } catch (e) {
        console.warn('Credit limits API failed', e);
      }

      setPartnerContracts(Array.from(contractsMap.values()));
    } catch (error) {
      console.error('Failed to load partner contracts', error);
      setPartnerContracts([]);
    }
  }, []);

  // Fetch real TSDB assets for this credit limit / contract
  const fetchAssets = useCallback(async (customContractNo?: string) => {
    const limitIdParam = limitData?.limitId || '';
    const contractNoParam = customContractNo !== undefined 
      ? customContractNo 
      : (limitData?.contractNo || formDataRef.current.contractNo || '');

    try {
      // 1. Lấy danh sách cầm cố
      const pRes: any = await apiClient.get(`/v1/capital-source/asset-pledges?size=100`);
      const pledges: any[] = pRes?.content || pRes?.data?.content || [];

      // 2. Lọc TSĐB thuộc Hợp đồng / Hạn mức hiện tại
      const matchedPledges = pledges.filter((p: any) => {
        if (!limitIdParam && !contractNoParam) return false;
        const matchLimit = limitIdParam && (p.limitId === limitIdParam);
        const matchContract = contractNoParam && (p.contractNo === contractNoParam);
        return matchLimit || matchContract;
      });

      // 3. Lấy thông tin tài sản từ danh mục để bổ sung chi tiết
      const aRes: any = await apiClient.get('/v1/capital-source/assets?size=100');
      const allAssets: any[] = aRes?.content || aRes?.data?.content || [];
      const assetMap = new Map(allAssets.map((a: any) => [a.assetId, a]));

      if (matchedPledges.length > 0) {
        const enriched = matchedPledges.map((p: any) => {
          const assetInfo: any = assetMap.get(p.assetId) || {};
          return {
            id: p.id,
            limitType: p.limitId ? (p.limitId.includes('_') ? p.limitId.split('_')[1] : limitData?.poolType || 'SECURED') : (limitData?.poolType || 'SECURED'),
            assetId: p.assetId,
            assetType: assetInfo.assetType || 'Cổ phiếu / Trái phiếu',
            issuer: assetInfo.issuer || '-',
            issuerCode: assetInfo.issuerCode || assetInfo.symbol || '-',
            parValue: assetInfo.parValue || p.price || 0,
            issueDate: assetInfo.issueDate || p.pledgeDate || '',
            maturityDate: assetInfo.maturityDate || p.endPledgeDate || '',
            callDate: assetInfo.callDate || '',
            couponType: assetInfo.couponType || 'Cố định',
            couponRate: assetInfo.couponRate || 0,
            interestPayTerm: assetInfo.interestPayTerm || '-'
          };
        });
        setAssetsList(enriched);
      } else {
        setAssetsList([]);
      }
    } catch (error) {
      console.error('Failed to load real TSDB', error);
      setAssetsList([]);
    }
  }, [limitData?.limitId, limitData?.contractNo, limitData?.poolType]);

  const formatDateForInput = (d: any) => {
    if (!d) return '';
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) {
      return d.slice(0, 10);
    }
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPartners();
      setActiveTab(initialTab);
      if (limitData) {
        setFormData({
          partnerId: limitData.partnerId || '',
          branchCusId: limitData.branchCusId || '',
          cusName: limitData.cusName || '',
          contractId: limitData.contractId || '',
          contractNo: limitData.contractNo || '',
          poolType: limitData.poolType || '',
          currency: limitData.currency || 'VND',
          totalPool: limitData.totalPool ? String(limitData.totalPool) : '',
          creditRatio: limitData.creditRatio ? String(limitData.creditRatio) : '',
          purpose: limitData.purpose || '',
          startDate: formatDateForInput(limitData.startDate),
          endDate: formatDateForInput(limitData.endDate)
        });
        const pName = limitData.branchCusId ? `${limitData.branchCusId}${limitData.cusName ? ' - ' + limitData.cusName : ''}` : '';
        setPartnerSearchInput(pName);
        if (limitData.partnerId) {
          fetchPartnerContracts(limitData.partnerId);
        }
        fetchAssets(limitData.contractNo);
      } else {
        setFormData({
          partnerId: '',
          branchCusId: '',
          cusName: '',
          contractId: '',
          contractNo: '',
          poolType: '',
          currency: 'VND',
          totalPool: '',
          creditRatio: '',
          purpose: '',
          startDate: '',
          endDate: ''
        });
        setPartnerSearchInput('');
        setPartnerContracts([]);
        setAssetsList([]);
      }
    }
  }, [isOpen, limitData, initialTab, fetchPartners, fetchAssets, fetchPartnerContracts]);

  // Compute Rule TH1 vs TH2 when editing:
  // TH1: Ngày bắt đầu > Ngày hiện tại -> Cho phép sửa all trường
  // TH2: Ngày bắt đầu <= Ngày hiện tại -> Chỉ cho sửa TotalLimit, CreditRatio, EndDate
  const isStarted = useMemo(() => {
    if (mode !== 'edit' || !limitData?.startDate) return false;
    const start = new Date(limitData.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return start <= today;
  }, [mode, limitData]);

  // If in TH2, these fields are locked
  const isLockedInTH2 = mode === 'edit' && isStarted;

  // Partner filter
  const filteredPartners = useMemo(() => {
    if (!partnerSearchInput.trim()) return partnerOptions;
    const kw = partnerSearchInput.toLowerCase();
    return partnerOptions.filter(p => 
      (p.branchCusId && p.branchCusId.toLowerCase().includes(kw)) ||
      (p.cusName && p.cusName.toLowerCase().includes(kw)) ||
      (p.shortName && p.shortName.toLowerCase().includes(kw))
    );
  }, [partnerOptions, partnerSearchInput]);

  // Handler for selecting partner
  const handleSelectPartner = (p: any) => {
    setFormData(prev => ({
      ...prev,
      partnerId: p.id,
      branchCusId: p.branchCusId || '',
      cusName: p.cusName || '',
      contractId: '',
      contractNo: ''
    }));
    setPartnerSearchInput(`${p.branchCusId || ''}${p.cusName ? ' - ' + p.cusName : ''}`);
    setIsPartnerDropdownOpen(false);
    fetchPartnerContracts(p.id);
  };

  // Contract filter
  const filteredContracts = useMemo(() => {
    if (!formData.contractNo.trim()) return partnerContracts;
    const kw = formData.contractNo.toLowerCase();
    return partnerContracts.filter(c => 
      c.contractNo && c.contractNo.toLowerCase().includes(kw)
    );
  }, [partnerContracts, formData.contractNo]);

  // Handler for selecting an existing contract
  const handleSelectContract = (c: any) => {
    setFormData(prev => ({
      ...prev,
      contractId: c.id || '',
      contractNo: c.contractNo || '',
      startDate: c.startDate ? formatDateForInput(c.startDate) : prev.startDate,
      endDate: c.endDate ? formatDateForInput(c.endDate) : prev.endDate,
      purpose: c.purpose || prev.purpose
    }));
    setIsContractDropdownOpen(false);
  };

  // Handler for typing contract number
  const handleContractNoChange = (val: string) => {
    const matched = partnerContracts.find(c => c.contractNo?.trim().toLowerCase() === val.trim().toLowerCase());
    setFormData(prev => ({
      ...prev,
      contractNo: val,
      contractId: matched?.id || ''
    }));
  };

  // Compute LimitId: BranchCusId_LimitType or ContractNo_LimitType
  const computedLimitId = useMemo(() => {
    const prefix = formData.contractNo.trim() || formData.branchCusId || (partnerOptions.find(p => p.id === formData.partnerId)?.branchCusId) || '';
    if (!formData.poolType || formData.poolType === 'Tổng hợp') {
      return prefix ? `${prefix}_TONG_HOP` : '-';
    }
    return prefix ? `${prefix}_${formData.poolType.toUpperCase().replace(/\s+/g, '_')}` : '-';
  }, [formData.contractNo, formData.branchCusId, formData.partnerId, formData.poolType, partnerOptions]);

  const parseNumeric = (val: any) => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    return Number(String(val).replace(/\./g, '').replace(/,/g, '.'));
  };

  // Save Credit Limit
  const handleSave = async (isDraft = false) => {
    try {
      if (!formData.partnerId) {
        notifyError('Lỗi', 'Vui lòng chọn Mã đơn vị GD');
        return;
      }
      if (!formData.contractNo.trim()) {
        notifyError('Lỗi', 'Vui lòng nhập Số hợp đồng tín dụng');
        return;
      }
      if (!formData.currency) {
        notifyError('Lỗi', 'Vui lòng chọn Đơn vị tiền tệ');
        return;
      }
      if (!formData.totalPool) {
        notifyError('Lỗi', 'Vui lòng nhập Hạn mức tổng');
        return;
      }
      if (!formData.startDate) {
        notifyError('Lỗi', 'Vui lòng chọn Ngày bắt đầu');
        return;
      }
      if (!formData.endDate) {
        notifyError('Lỗi', 'Vui lòng chọn Ngày hết hạn');
        return;
      }

      // Rule: EndDate >= StartDate
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        notifyError('Lỗi', 'Ngày hết hạn phải lớn hơn hoặc bằng Ngày bắt đầu');
        return;
      }

      const numTotalPool = parseNumeric(formData.totalPool);

      // Rule thêm mới: Chỉ cho thêm mới số nguyên dương
      if (!limitData) {
        if (isNaN(numTotalPool) || numTotalPool <= 0 || !Number.isInteger(numTotalPool)) {
          notifyError('Lỗi', 'Hạn mức tổng phải là số nguyên dương (> 0)');
          return;
        }
      } else {
        if (isNaN(numTotalPool) || numTotalPool <= 0) {
          notifyError('Lỗi', 'Hạn mức tổng phải là số hợp lệ (> 0)');
          return;
        }
      }

      setIsProcessing(true);

      const payload: any = {
        poolType: formData.poolType || 'Tổng hợp',
        currency: formData.currency,
        totalPool: numTotalPool,
        creditRatio: formData.creditRatio ? Number(formData.creditRatio) : null,
        purpose: formData.purpose,
        startDate: formData.startDate,
        endDate: formData.endDate,
        limitId: computedLimitId !== '-' ? computedLimitId : null,
        status: isDraft ? 'PENDING_APPROVAL' : undefined
      };

      if (limitData?.id) {
        const updateUrl = limitData.contractId 
          ? `/v1/capital-source/contracts/${limitData.contractId}/credit-limits/${limitData.id}`
          : `/v1/capital-source/credit-limits/${limitData.id}`;
        await apiClient.put(updateUrl, payload);
        notifySuccess('Thành công', isDraft ? 'Đã lưu nháp thay đổi hạn mức' : 'Cập nhật hạn mức tín dụng thành công');
      } else {
        const createPayload = {
          ...payload,
          partnerId: formData.partnerId,
          contractId: formData.contractId || undefined,
          contractNo: formData.contractNo.trim(),
          contractType: 'CREDIT_LIMIT',
          contractTotalLimit: numTotalPool,
          contractStartDate: formData.startDate,
          contractEndDate: formData.endDate,
          contractPurpose: formData.purpose
        };
        await apiClient.post('/v1/capital-source/credit-limits', createPayload);
        notifySuccess('Thành công', isDraft ? 'Đã lưu nháp hạn mức tín dụng' : 'Thêm mới hạn mức tín dụng thành công');
      }

      onClose();
    } catch (error: any) {
      console.error(error);
      notifyError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi lưu hạn mức');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered TSDB assets for Tab 2
  const filteredAssets = useMemo(() => {
    let list = assetsList;
    if (tsdbSearchLimitType) {
      list = list.filter(item => item.limitType?.toLowerCase() === tsdbSearchLimitType.toLowerCase());
    }
    return list;
  }, [assetsList, tsdbSearchLimitType]);

  const pagedAssets = useMemo(() => {
    const start = (tsdbPage - 1) * tsdbPageSize;
    return filteredAssets.slice(start, start + tsdbPageSize);
  }, [filteredAssets, tsdbPage, tsdbPageSize]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'view' 
          ? 'Chi tiết hạn mức tín dụng' 
          : limitData 
            ? 'Cập nhật hạn mức tín dụng' 
            : 'Thêm mới hạn mức tín dụng'
      }
      size="xl"
    >
      <div className={styles.modalContainer}>
        {/* Tab Headers */}
        <div className={styles.tabHeader}>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 1 ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab(1)}
          >
            1. HĐ/PLHĐ hạn mức
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 2 ? styles.tabButtonActive : ''}`}
            onClick={() => {
              setActiveTab(2);
              fetchAssets(formData.contractNo);
            }}
          >
            2. Danh mục TSĐB
          </button>
        </div>

        {/* Tab 1 Content */}
        {activeTab === 1 && (
          <div className={styles.cardBox}>
            <div className={styles.cardBoxHeader}>
              Thông tin hợp đồng / phụ lục hợp đồng hạn mức
            </div>
            <div className={styles.cardBoxBody}>
              <div className={styles.formGrid}>
                {/* 1. Mã đơn vị GD */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Mã đơn vị GD <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper} ref={partnerWrapperRef}>
                    <input
                      type="text"
                      className={styles.inputWithSuffix}
                      placeholder="Nhập tên hoặc mã đối tác"
                      value={partnerSearchInput}
                      onChange={(e) => {
                        setPartnerSearchInput(e.target.value);
                        if (!isPartnerDropdownOpen) setIsPartnerDropdownOpen(true);
                      }}
                      onFocus={() => {
                        if (mode !== 'view' && !isLockedInTH2) {
                          setIsPartnerDropdownOpen(true);
                        }
                      }}
                      disabled={mode === 'view' || isLockedInTH2}
                    />
                    <button
                      type="button"
                      className={styles.searchIconBtn}
                      onClick={() => {
                        if (mode !== 'view' && !isLockedInTH2) {
                          setIsPartnerDropdownOpen(!isPartnerDropdownOpen);
                        }
                      }}
                      disabled={mode === 'view' || isLockedInTH2}
                    >
                      <Search size={16} />
                    </button>

                    {isPartnerDropdownOpen && mode !== 'view' && !isLockedInTH2 && (
                      <ul className={styles.dropdownList}>
                        {filteredPartners.length === 0 ? (
                          <li className={styles.dropdownItem} style={{ color: '#9ca3af' }}>
                            Không tìm thấy đối tác hoạt động
                          </li>
                        ) : (
                          filteredPartners.map(p => (
                            <li
                              key={p.id}
                              className={styles.dropdownItem}
                              onMouseDown={() => handleSelectPartner(p)}
                            >
                              <span><strong>{p.branchCusId || p.shortName}</strong> - {p.cusName}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                {/* 2. Số hợp đồng */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Số hợp đồng <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper} ref={contractWrapperRef}>
                    <input
                      type="text"
                      className={styles.inputWithSuffix}
                      placeholder="Nhập số hợp đồng"
                      value={formData.contractNo}
                      onChange={(e) => {
                        handleContractNoChange(e.target.value);
                        if (!isContractDropdownOpen && formData.partnerId) setIsContractDropdownOpen(true);
                      }}
                      onFocus={() => {
                        if (mode !== 'view' && !isLockedInTH2 && formData.partnerId) {
                          setIsContractDropdownOpen(true);
                        }
                      }}
                      disabled={mode === 'view' || isLockedInTH2}
                    />
                    <button
                      type="button"
                      className={styles.searchIconBtn}
                      onClick={() => {
                        if (mode !== 'view' && !isLockedInTH2) {
                          if (!formData.partnerId) {
                            notifyError('Lưu ý', 'Vui lòng chọn Mã đơn vị GD trước');
                            return;
                          }
                          setIsContractDropdownOpen(!isContractDropdownOpen);
                        }
                      }}
                      disabled={mode === 'view' || isLockedInTH2}
                      title="Danh sách hợp đồng"
                    >
                      <ChevronDown size={16} />
                    </button>

                    {isContractDropdownOpen && mode !== 'view' && !isLockedInTH2 && (
                      <ul className={styles.dropdownList}>
                        {filteredContracts.length === 0 ? (
                          <li className={styles.dropdownItem} style={{ color: '#9ca3af', cursor: 'default' }}>
                            Không tìm thấy hợp đồng
                          </li>
                        ) : (
                          filteredContracts.map((c, idx) => (
                            <li
                              key={c.id || c.contractNo || idx}
                              className={styles.dropdownItem}
                              onMouseDown={() => handleSelectContract(c)}
                            >
                              <span><strong>{c.contractNo}</strong></span>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                {/* 3. Loại hạn mức */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Loại hạn mức</label>
                  <select
                    className={styles.selectInput}
                    value={formData.poolType}
                    onChange={(e) => setFormData(prev => ({ ...prev, poolType: e.target.value }))}
                    disabled={mode === 'view' || isLockedInTH2}
                  >
                    <option value="">- Chọn loại hạn mức -</option>
                    {LIMIT_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  {computedLimitId !== '-' && (
                    <span style={{ fontSize: '12px', color: '#2563eb', marginTop: '2px' }}>
                      Mã hạn mức: <strong>{computedLimitId}</strong>
                    </span>
                  )}
                </div>

                {/* 4. Đơn vị tiền tệ */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Đơn vị tiền tệ <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.selectInput}
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    disabled={mode === 'view' || isLockedInTH2}
                  >
                    <option value="">- Chọn đơn vị tiền tệ -</option>
                    {CURRENCIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* 5. Hạn mức tổng */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Hạn mức tổng <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <CurrencyInput
                      value={formData.totalPool}
                      onChangeValue={(val) => setFormData(prev => ({ ...prev, totalPool: String(val) }))}
                      placeholder="Nhập hạn mức tổng"
                      disabled={mode === 'view'}
                    />
                    <div className={styles.suffixBadge}>{formData.currency || 'VND'}</div>
                  </div>
                </div>

                {/* 6. TL tài trợ/PA vay */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>TL tài trợ/PA vay</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className={styles.inputWithSuffix}
                      placeholder="Nhập tỷ lệ (%)"
                      value={formData.creditRatio}
                      onChange={(e) => setFormData(prev => ({ ...prev, creditRatio: e.target.value }))}
                      disabled={mode === 'view'}
                    />
                    <div className={styles.suffixBadge}>%</div>
                  </div>
                </div>

                {/* 7. Mục đích vay vốn */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Mục đích vay vốn</label>
                  <select
                    className={styles.selectInput}
                    value={formData.purpose}
                    onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                    disabled={mode === 'view' || isLockedInTH2}
                  >
                    <option value="">- Chọn mục đích vay vốn -</option>
                    {PURPOSES.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Empty cell for spacing */}
                <div></div>

                {/* 8. Ngày bắt đầu */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Ngày bắt đầu <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    className={styles.selectInput}
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    disabled={mode === 'view' || isLockedInTH2}
                  />
                </div>

                {/* 9. Ngày hết hạn */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Ngày hết hạn <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    className={styles.selectInput}
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    disabled={mode === 'view'}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content (TSDB Inquiry) */}
        {activeTab === 2 && (
          <div>
            {/* Filter Bar */}
            <div className={styles.filterBar}>
              <div className={styles.filterInputs}>
                <div className={styles.fieldGroup} style={{ flex: 1 }}>
                  <label className={styles.fieldLabel}>Số hợp đồng tín dụng</label>
                  <input
                    type="text"
                    className={styles.selectInput}
                    value={formData.contractNo || ''}
                    placeholder="Chưa có số hợp đồng"
                    disabled
                  />
                </div>
                <div className={styles.fieldGroup} style={{ flex: 1 }}>
                  <label className={styles.fieldLabel}>Loại hạn mức</label>
                  <select
                    className={styles.selectInput}
                    value={tsdbSearchLimitType}
                    onChange={(e) => setTsdbSearchLimitType(e.target.value)}
                  >
                    <option value="">- Chọn loại hạn mức -</option>
                    <option value="CASA">CASA</option>
                    <option value="SECURED">SECURED</option>
                    <option value="OVERDRAFT">OVERDRAFT</option>
                    <option value="MARGIN">MARGIN</option>
                    <option value="CLEAN">CLEAN</option>
                    <option value="Tài sản đảm bảo">Tài sản đảm bảo</option>
                    <option value="Tài sản bảo lãnh">Tài sản bảo lãnh</option>
                    <option value="Tổng hợp">Tổng hợp</option>
                  </select>
                </div>
              </div>

              <div className={styles.filterBtnGroup}>
                <button
                  type="button"
                  className={styles.btnOutline}
                  onClick={() => {
                    setTsdbSearchLimitType('');
                    setTsdbPage(1);
                  }}
                >
                  Xóa điều kiện
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => {
                    fetchAssets(formData.contractNo);
                    setTsdbPage(1);
                  }}
                >
                  Tra cứu
                </button>
              </div>
            </div>

            {/* Section Title */}
            <div className={styles.tableSectionTitle}>
              Danh mục TSĐB đang được gán
            </div>

            {/* TSDB Table */}
            <div className={styles.tsdbTableContainer}>
              <table className={styles.tsdbTable}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center', width: '50px' }}>STT</th>
                    <th>Loại hạn mức</th>
                    <th>Mã TSĐB</th>
                    <th>Loại TSĐB</th>
                    <th>Tổ chức phát hành</th>
                    <th>Mã TCPH</th>
                    <th style={{ textAlign: 'right' }}>Mệnh giá</th>
                    <th style={{ textAlign: 'center' }}>Ngày phát hành</th>
                    <th style={{ textAlign: 'center' }}>Ngày đáo hạn</th>
                    <th style={{ textAlign: 'center' }}>Ngày mua lại trước hạn</th>
                    <th>Loại lãi suất</th>
                    <th style={{ textAlign: 'right' }}>Lãi suất coupon (%)</th>
                    <th style={{ textAlign: 'center' }}>Kỳ trả lãi</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedAssets.length === 0 ? (
                    <tr>
                      <td colSpan={13} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                        Không có dữ liệu tài sản đảm bảo
                      </td>
                    </tr>
                  ) : (
                    pagedAssets.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td style={{ textAlign: 'center' }}>{(tsdbPage - 1) * tsdbPageSize + idx + 1}</td>
                        <td><strong>{item.limitType || '-'}</strong></td>
                        <td>{item.assetId || '-'}</td>
                        <td>{item.assetType || '-'}</td>
                        <td>{item.issuer || '-'}</td>
                        <td><strong>{item.issuerCode || '-'}</strong></td>
                        <td style={{ textAlign: 'right' }}>
                          {item.parValue != null ? Number(item.parValue).toLocaleString('vi-VN') : '-'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {formatDate(item.issueDate)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {formatDate(item.maturityDate)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {formatDate(item.callDate)}
                        </td>
                        <td>{item.couponType || '-'}</td>
                        <td style={{ textAlign: 'right' }}>
                          {item.couponRate != null ? Number(item.couponRate).toFixed(4).replace('.', ',') : '-'}
                        </td>
                        <td style={{ textAlign: 'center' }}>{item.interestPayTerm || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className={styles.paginationFooter}>
                <div>
                  Hiển thị {filteredAssets.length > 0 ? (tsdbPage - 1) * tsdbPageSize + 1 : 0} -{' '}
                  {Math.min(tsdbPage * tsdbPageSize, filteredAssets.length)} của {filteredAssets.length} bản ghi
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    className={styles.selectInput}
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
                    value={tsdbPageSize}
                    onChange={(e) => {
                      setTsdbPageSize(Number(e.target.value));
                      setTsdbPage(1);
                    }}
                  >
                    <option value={5}>5 bản ghi / trang</option>
                    <option value={10}>10 bản ghi / trang</option>
                    <option value={20}>20 bản ghi / trang</option>
                  </select>
                  <button
                    type="button"
                    className={styles.btnOutline}
                    style={{ padding: '4px 8px' }}
                    disabled={tsdbPage <= 1}
                    onClick={() => setTsdbPage(prev => prev - 1)}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span style={{ fontWeight: 600, padding: '0 4px' }}>{tsdbPage}</span>
                  <button
                    type="button"
                    className={styles.btnOutline}
                    style={{ padding: '4px 8px' }}
                    disabled={tsdbPage * tsdbPageSize >= filteredAssets.length}
                    onClick={() => setTsdbPage(prev => prev + 1)}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnOutline}
            onClick={onClose}
            disabled={isProcessing}
          >
            Hủy
          </button>
          
          {mode !== 'view' && (
            <div className={styles.footerRight}>
              <button
                type="button"
                className={styles.btnOutline}
                onClick={() => handleSave(true)}
                disabled={isProcessing}
              >
                Lưu nháp
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => handleSave(false)}
                disabled={isProcessing}
              >
                Lưu
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
