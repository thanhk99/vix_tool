'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/shared/Button/Button';
import Input from '@/components/shared/Input/Input';
import CurrencyInput from '@/components/shared/Input/CurrencyInput';
import Select from '@/components/shared/Select/Select';
import { useAuthStore } from '@/stores/auth.store';
import { ContractDebtFormData } from '@/types/contract-debt';
import styles from './ContractDebtForm.module.css';
import apiClient from '@/lib/api/client';
import { useNotification } from '@/hooks/useNotification';
import { getStatusDisplay } from '@/constants/status';
import { formatDate } from '@/utils/format';


interface ContractDebtFormProps {
  id?: string;
  mode?: 'create' | 'edit' | 'view';
}

export default function ContractDebtForm({ id, mode = 'create' }: ContractDebtFormProps) {
  const router = useRouter();
  const { userId } = useAuthStore();
  const { notifyError, notifySuccess } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<ContractDebtFormData>({
    cusId: '',
    contactNo: '',
    limitId: '',
    lnContactNo: '',
    lnContactDate: '',
    lnAmt: 0,
    lnDate: '',
    contractIntRate: 0,
    actIntRate: 0,
    reason: '',
    casaRate: 0,
    maturityAmt: 0,
    settDate: '',
    term: 0,
    currency: 'VND',
    purpose: '',
    intTerm: 'Hàng tháng',
    prinTerm: 'Hàng tháng',
    status: 'Pending',
    remainLimit: 0,
    note: '',
    prepaymentNote: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic Data
  const [partners, setPartners] = useState<{value: string, label: string, originalId: string}[]>([]);
  const [creditLimits, setCreditLimits] = useState<any[]>([]);

  // Fetch existing data if in edit/view mode
  useEffect(() => {
    if (id) {
      const fetchKunn = async () => {
        try {
          const res: any = await apiClient.get(`/v1/capital-source/kunns/${id}`);
          let data = res?.data?.data || res?.data || res;
          
          const formatDate = (dateStr: string) => dateStr ? dateStr.split('T')[0] : '';
          
          setFormData({
            ...data,
            cusId: data.partnerId || data.cusId || '',
            lnContactDate: formatDate(data.lnContactDate),
            lnDate: formatDate(data.lnDate),
            settDate: formatDate(data.settDate),
          });
        } catch (e) {
          notifyError('Lỗi', 'Không thể tải thông tin Khế ước');
        }
      };
      fetchKunn();
    }
  }, [id]);

  // Fetch partners on mount
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res: any = await apiClient.get('/v1/capital-source/partners?page=0&size=1000');
        console.log('API Partners Response:', res);
        
        let content: any = [];
        if (res?.content) content = res.content;
        else if (res?.data?.content) content = res.data.content;
        else if (res?.data?.data) content = res.data.data;
        else content = Array.isArray(res) ? res : (res?.data || []);

        const partnerOptions = content
          .filter((p: any) => ['ACTIVE', 'APPROVED', 'ĐÃ DUYỆT', 'DA_DUYET'].includes(String(p.status).toUpperCase()))
          .map((p: any) => ({
            value: p.id || p.cusId,
            label: p.cusId ? `${p.cusId} - ${p.cusName}` : p.cusName || p.id,
            originalId: p.cusId
          }));
        
        console.log('Mapped partner options:', partnerOptions);
        setPartners(partnerOptions);
      } catch (err) {
        console.error('Lỗi khi fetch partners:', err);
        notifyError('Lỗi', 'Không thể tải danh sách đối tác');
      }
    };
    fetchPartners();
  }, []);

  // Fetch credit limits when partner changes
  useEffect(() => {
    const fetchLimits = async () => {
      if (!formData.cusId) {
        setCreditLimits([]);
        return;
      }
      try {
        // formData.cusId is storing the internal ID based on how we mapped options.value
        const res: any = await apiClient.get(`/v1/capital-source/credit-limits?partnerId=${formData.cusId}&size=100`);
        console.log('API Limits Response:', res);
        
        let limitsData: any = [];
        const payload = res?.data?.data || res?.data || res;
        
        if (payload?.content !== undefined && Array.isArray(payload.content)) {
            limitsData = payload.content;
        } else if (Array.isArray(payload)) {
            limitsData = payload;
        } else if (payload && typeof payload === 'object') {
            // Check if it's a pagination object or single object
            limitsData = payload.data && Array.isArray(payload.data) ? payload.data : [payload];
        }
        
        // Filter only approved limits or limits without status
        limitsData = limitsData.filter((l: any) => {
          if (!l.status) return true;
          return ['ACTIVE', 'APPROVED', 'ĐÃ DUYỆT', 'DA_DUYET'].includes(String(l.status).toUpperCase());
        });

        console.log('Mapped limits data:', limitsData);
        setCreditLimits(limitsData);
      } catch (err) {
        console.error('Lỗi khi fetch limits:', err);
        notifyError('Lỗi', 'Không thể tải hạn mức tín dụng');
        setCreditLimits([]);
      }
    };
    fetchLimits();
  }, [formData.cusId]);

  const contractOptions = useMemo(() => {
    // Unique contractNo (Số HĐ tín dụng) from credit limits
    const types = Array.from(new Set(creditLimits.map(l => l?.contractNo).filter(Boolean)));
    return types.map(t => ({ value: String(t), label: String(t) }));
  }, [creditLimits]);

  const limitOptions = useMemo(() => {
    // Filter limits by selected contractNo if any
    const filtered = formData.contactNo 
      ? creditLimits.filter(l => l?.contractNo === formData.contactNo)
      : creditLimits;
      
    const options = filtered.map((l, index) => {
      const val = l?.id || l?.limitId || `unknown-${index}`;
      const lbl = l?.limitId || l?.poolName || l?.id || 'Không xác định';
      return {
        value: String(val),
        label: String(lbl),
        remainLimit: l?.remainPool || l?.remainLimit || 0,
        startDate: l?.startDate,
        endDate: l?.endDate,
      };
    });
    
    // Deduplicate by value
    const uniqueOptionsMap = new Map();
    options.forEach(o => {
      if (!uniqueOptionsMap.has(o.value)) {
        uniqueOptionsMap.set(o.value, o);
      }
    });
    
    return Array.from(uniqueOptionsMap.values());
  }, [creditLimits, formData.contactNo]);

  const selectedLimit = useMemo(() => {
    return limitOptions.find(l => l.value === formData.limitId);
  }, [formData.limitId, limitOptions]);

  
  // Auto-calculate term in days
  React.useEffect(() => {
    if (formData.lnDate && formData.settDate) {
      const diffTime = new Date(formData.settDate).getTime() - new Date(formData.lnDate).getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && formData.term !== diffDays) {
        setFormData(prev => ({ ...prev, term: diffDays }));
        if (errors['term']) {
          setErrors(prev => ({ ...prev, term: '' }));
        }
      }
    }
  }, [formData.lnDate, formData.settDate]);

  // Update remainLimit when limit changes
  React.useEffect(() => {
    if (selectedLimit) {
      setFormData(prev => ({ ...prev, remainLimit: selectedLimit.remainLimit }));
    }
  }, [selectedLimit]);

  const handleChange = (field: keyof ContractDebtFormData, value: any) => {
    setFormData((prev: ContractDebtFormData) => ({ ...prev, [field]: value }));
    // Clear error
    const errorField = field as string;
    if (errors[errorField]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [errorField]: '' }));
    }
  };

  const handleSave = () => {
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.cusId) newErrors.cusId = 'Bắt buộc nhập';
    if (!formData.contactNo) newErrors.contactNo = 'Bắt buộc nhập';
    if (!formData.limitId) newErrors.limitId = 'Bắt buộc nhập';
    if (!formData.lnContactNo) newErrors.lnContactNo = 'Bắt buộc nhập';
    if (!formData.lnContactDate) newErrors.lnContactDate = 'Bắt buộc nhập';
    if (!formData.lnAmt) newErrors.lnAmt = 'Bắt buộc nhập';
    if (!formData.lnDate) newErrors.lnDate = 'Bắt buộc nhập';
    if (!formData.settDate) newErrors.settDate = 'Bắt buộc nhập';
    if (!formData.contractIntRate) newErrors.contractIntRate = 'Bắt buộc nhập';
    if (!formData.actIntRate) newErrors.actIntRate = 'Bắt buộc nhập';
    if (!formData.term) newErrors.term = 'Bắt buộc nhập';
    if (!formData.currency) newErrors.currency = 'Bắt buộc nhập';
    if (!formData.purpose) newErrors.purpose = 'Bắt buộc nhập';
    if (!formData.intTerm) newErrors.intTerm = 'Bắt buộc nhập';
    if (!formData.prinTerm) newErrors.prinTerm = 'Bắt buộc nhập';
    
    if (formData.contractIntRate !== formData.actIntRate && !formData.reason) {
      newErrors.reason = 'Bắt buộc nhập lý do khi lãi suất chênh lệch';
    }

    if (formData.remainLimit !== undefined && (formData.remainLimit !== undefined && formData.lnAmt > formData.remainLimit)) {
      newErrors.lnAmt = 'Số tiền giải ngân không được vượt quá hạn mức còn lại';
    }

    if (selectedLimit && formData.lnDate) {
      if (selectedLimit.startDate && new Date(formData.lnDate) < new Date(selectedLimit.startDate)) {
        newErrors.lnDate = 'Ngày giải ngân không được trước ngày bắt đầu hạn mức';
      }
      if (selectedLimit.endDate && new Date(formData.lnDate) > new Date(selectedLimit.endDate)) {
        newErrors.lnDate = 'Ngày giải ngân không được sau ngày kết thúc hạn mức';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = async () => {
      try {
        setIsSaving(true);
        const payload = {
          cusId: formData.cusId,
          contactNo: formData.contactNo,
          limitId: formData.limitId,
          lnContactNo: formData.lnContactNo,
          lnContactDate: formData.lnContactDate,
          lnAmt: formData.lnAmt,
          lnDate: formData.lnDate,
          contractIntRate: formData.contractIntRate,
          actIntRate: formData.actIntRate,
          reason: formData.reason,
          casaRate: formData.casaRate,
          settDate: formData.settDate || null,
          term: formData.term,
          currency: formData.currency,
          purpose: formData.purpose,
          intTerm: formData.intTerm,
          prinTerm: formData.prinTerm,
          note: formData.note,
          prepaymentNote: formData.prepaymentNote,
        };

        let res;
        if (mode === 'edit' && id) {
          res = await apiClient.put(`/v1/capital-source/kunns/${id}`, payload);
        } else {
          res = await apiClient.post('/v1/capital-source/kunns', payload);
        }

        const responseData = res?.data || res;
        if (responseData && responseData.success === false) {
          notifyError('Lỗi', responseData.message || 'Thao tác không thành công');
          return;
        }

        notifySuccess('Thành công', mode === 'edit' ? 'Cập nhật hợp đồng vay (KUNN) thành công!' : 'Thêm mới hợp đồng vay (KUNN) thành công!');
        router.push('/nv/contract-debt');
      } catch (error: any) {
        console.error('Lỗi khi lưu KUNN:', error);
        const errorMsg = error?.message || error?.response?.data?.message || 'Có lỗi xảy ra khi lưu hợp đồng vay';
        notifyError('Lỗi', errorMsg);
      } finally {
        setIsSaving(false);
      }
    };

    submitData();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.backBtn} onClick={() => router.back()}>←</span> 
          {mode === 'view' ? 'Chi tiết hợp đồng vay' : mode === 'edit' ? 'Cập nhật hợp đồng vay' : 'Thêm mới hợp đồng vay'}
        </div>
        <div className={styles.subtitle}>{mode === 'view' ? 'Xem thông tin hợp đồng vay' : 'Nhập thông tin hợp đồng vay'}</div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>1. Thông tin chung</div>
        <div className={styles.grid4}>
          <div className={styles.field}>
            <span className={styles.label}>Mã đối tác <span className={styles.required}>*</span></span>
            <Select disabled={mode === 'view'} 
              options={partners} 
              value={formData.cusId} 
              onChange={(value) => handleChange('cusId', value)} 
              placeholder="-- Chọn đối tác --"
            />
            {errors.cusId && <span className={styles.requiredNote}>{errors.cusId}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Số HĐ tín dụng <span className={styles.required}>*</span></span>
            <Select disabled={mode === 'view'} 
              options={contractOptions} 
              value={formData.contactNo} 
              onChange={(value) => handleChange('contactNo', value)} 
              placeholder="-- Chọn hợp đồng tín dụng --"
            />
            {errors.contactNo && <span className={styles.requiredNote}>{errors.contactNo}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Mã hạn mức <span className={styles.required}>*</span></span>
            <Select disabled={mode === 'view'} 
              options={limitOptions} 
              value={formData.limitId} 
              onChange={(value) => handleChange('limitId', value)} 
              placeholder="-- Chọn mã hạn mức --"
            />
            {errors.limitId && <span className={styles.requiredNote}>{errors.limitId}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Hạn mức còn lại</span>
            <CurrencyInput disabled={mode === 'view' || true} value={formData.remainLimit} />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Ngày BĐ hạn mức</span>
            <Input disabled={mode === 'view' || true} value={formatDate(selectedLimit?.startDate)} />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Ngày KT hạn mức</span>
            <Input disabled={mode === 'view' || true} value={formatDate(selectedLimit?.endDate)} />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Số HĐ khế ước <span className={styles.required}>*</span></span>
            <Input disabled={mode === 'view'} 
              value={formData.lnContactNo} 
              onChange={e => handleChange('lnContactNo', e.target.value)} 
            />
            {errors.lnContactNo && <span className={styles.requiredNote}>{errors.lnContactNo}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Ngày khế ước <span className={styles.required}>*</span></span>
            <Input disabled={mode === 'view'} 
              type="date" 
              value={formData.lnContactDate} 
              onChange={e => handleChange('lnContactDate', e.target.value)} 
            />
            {errors.lnContactDate && <span className={styles.requiredNote}>{errors.lnContactDate}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Số tiền giải ngân <span className={styles.required}>*</span></span>
            <CurrencyInput disabled={mode === 'view'} 
              value={formData.lnAmt || ''} 
              onChangeValue={val => handleChange('lnAmt', val)} 
            />
            {errors.lnAmt && <span className={styles.requiredNote}>{errors.lnAmt}</span>}
            {!errors.lnAmt && formData.limitId && (formData.remainLimit !== undefined && formData.lnAmt > formData.remainLimit) && (
              <span className={styles.requiredNote} style={{ display: 'block', marginTop: '4px' }}>Số tiền giải ngân đang vượt quá hạn mức còn lại!</span>
            )}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Ngày giải ngân <span className={styles.required}>*</span></span>
            <Input disabled={mode === 'view'} 
              type="date" 
              value={formData.lnDate} 
              onChange={e => handleChange('lnDate', e.target.value)} 
            />
            {errors.lnDate && <span className={styles.requiredNote}>{errors.lnDate}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Ngày tất toán <span className={styles.required}>*</span></span>
            <Input disabled={mode === 'view'} 
              type="date" 
              value={formData.settDate} 
              onChange={e => handleChange('settDate', e.target.value)} 
            />
            {errors.settDate && <span className={styles.requiredNote}>{errors.settDate}</span>}
          </div>
          
          
          <div className={styles.field}>
            <span className={styles.label}>Đơn vị tiền tệ <span className={styles.required}>*</span></span>
            <Select disabled={mode === 'view'} 
              options={[{value:'VND', label:'VND'}, {value:'USD', label:'USD'}]} 
              value={formData.currency} 
              onChange={(value) => handleChange('currency', value)} 
            />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Kỳ hạn (ngày) <span className={styles.required}>*</span></span>
            <Input disabled={true} 
              type="number" 
              value={formData.term || 0} 
              onChange={e => handleChange('term', Number(e.target.value))} 
            />
            {errors.term && <span className={styles.requiredNote}>{errors.term}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Mục đích <span className={styles.required}>*</span></span>
            <Input disabled={mode === 'view'} 
              value={formData.purpose} 
              onChange={e => handleChange('purpose', e.target.value)} 
            />
            {errors.purpose && <span className={styles.requiredNote}>{errors.purpose}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Kỳ trả lãi <span className={styles.required}>*</span></span>
            <Select disabled={mode === 'view'} 
              options={[
                {value:'Hàng tháng', label:'Hàng tháng'}, 
                {value:'Hàng quý', label:'Hàng quý'}, 
                {value:'Cuối kỳ', label:'Cuối kỳ'}
              ]} 
              value={formData.intTerm} 
              onChange={(value) => handleChange('intTerm', value)} 
            />
            {errors.intTerm && <span className={styles.requiredNote}>{errors.intTerm}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Kỳ trả gốc <span className={styles.required}>*</span></span>
            <Select disabled={mode === 'view'} 
              options={[
                {value:'Hàng tháng', label:'Hàng tháng'}, 
                {value:'Hàng quý', label:'Hàng quý'}, 
                {value:'Cuối kỳ', label:'Cuối kỳ'}
              ]} 
              value={formData.prinTerm} 
              onChange={(value) => handleChange('prinTerm', value)} 
            />
            {errors.prinTerm && <span className={styles.requiredNote}>{errors.prinTerm}</span>}
          </div>

        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>2. Lãi suất</div>
        <div className={styles.grid4}>
          <div className={styles.field}>
            <span className={styles.label}>Lãi HĐ (%) <span className={styles.required}>*</span></span>
            <Input disabled={mode === 'view'} 
              type="number" 
              value={formData.contractIntRate || ''} 
              onChange={e => handleChange('contractIntRate', Number(e.target.value))} 
            />
            {errors.contractIntRate && <span className={styles.requiredNote}>{errors.contractIntRate}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Lãi thực tế (%) <span className={styles.required}>*</span></span>
            <Input disabled={mode === 'view'} 
              type="number" 
              value={formData.actIntRate || ''} 
              onChange={e => handleChange('actIntRate', Number(e.target.value))} 
            />
            {errors.actIntRate && <span className={styles.requiredNote}>{errors.actIntRate}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Lý do chênh lệch {formData.contractIntRate !== formData.actIntRate && <span className={styles.required}>*</span>}</span>
            <Input disabled={mode === 'view'} 
              value={formData.reason} 
              onChange={e => handleChange('reason', e.target.value)} 
            />
            {errors.reason && <span className={styles.requiredNote}>{errors.reason}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Tỷ lệ duy trì CASA (%)</span>
            <Input disabled={mode === 'view'} 
              type="number" 
              value={formData.casaRate || ''} 
              onChange={e => handleChange('casaRate', Number(e.target.value))} 
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>3. Thông tin bổ sung</div>
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.label}>Trả nợ trước hạn</span>
            <Input disabled={mode === 'view'} 
              value={formData.prepaymentNote || ''} 
              onChange={e => handleChange('prepaymentNote', e.target.value)} 
            />
          </div>
          <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
            <span className={styles.label}>Ghi chú</span>
            <Input disabled={mode === 'view'} 
              value={formData.note || ''} 
              onChange={e => handleChange('note', e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.requiredNote}>* Thông tin bắt buộc</span>
        <div className={styles.actions}>
          {mode !== 'view' && (
            <>
              <Button variant="outline" onClick={() => router.back()}>Hủy</Button>
              <Button variant="primary" onClick={handleSave} disabled={isSaving} isLoading={isSaving}>Lưu</Button>
            </>
          )}
          {mode === 'view' && (
            <Button variant="outline" onClick={() => router.back()}>Đóng</Button>
          )}
        </div>
      </div>
    </div>
  );
}
