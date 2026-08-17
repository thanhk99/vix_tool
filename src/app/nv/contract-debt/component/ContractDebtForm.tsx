'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/shared/Button/Button';
import Input from '@/components/shared/Input/Input';
import Select from '@/components/shared/Select/Select';
import { useAuthStore } from '@/stores/auth.store';
import { ContractDebtFormData } from '@/types/contract-debt';
import styles from './ContractDebtForm.module.css';
import apiClient from '@/lib/api/client';
import { useNotification } from '@/hooks/useNotification';

export default function ContractDebtForm() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const { notifyError } = useNotification();
  
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
    intTerm: '',
    prinTerm: '',
    status: 'Pending',
    remainLimit: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic Data
  const [partners, setPartners] = useState<{value: string, label: string, originalId: string}[]>([]);
  const [creditLimits, setCreditLimits] = useState<any[]>([]);

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

        const partnerOptions = content.map((p: any) => ({
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
        const res: any = await apiClient.get(`/v1/capital-source/partners/${formData.cusId}/credit-limits`);
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
    // Unique poolType (Số HĐ tín dụng) from credit limits
    const types = Array.from(new Set(creditLimits.map(l => l?.poolType || l?.contactNo).filter(Boolean)));
    return types.map(t => ({ value: String(t), label: String(t) }));
  }, [creditLimits]);

  const limitOptions = useMemo(() => {
    // Filter limits by selected contactNo (poolType) if any
    const filtered = formData.contactNo 
      ? creditLimits.filter(l => (l?.poolType || l?.contactNo) === formData.contactNo)
      : creditLimits;
      
    return filtered.map(l => {
      const val = l?.limitId || l?.id || '';
      const lbl = l?.limitId || l?.poolName || val;
      return {
        value: String(val),
        label: String(lbl),
        remainLimit: l?.remainPool || l?.remainLimit || 0,
      };
    }).filter(o => o.value);
  }, [creditLimits, formData.contactNo]);

  const selectedLimit = useMemo(() => {
    return limitOptions.find(l => l.value === formData.limitId);
  }, [formData.limitId, limitOptions]);

  // Update remainLimit when limit changes
  React.useEffect(() => {
    if (selectedLimit) {
      setFormData(prev => ({ ...prev, remainLimit: selectedLimit.remainLimit }));
    }
  }, [selectedLimit]);

  const handleChange = (field: keyof ContractDebtFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

    if (formData.remainLimit !== undefined && formData.lnAmt > formData.remainLimit) {
      newErrors.lnAmt = 'Số tiền giải ngân không được vượt quá hạn mức còn lại';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Mock save
    console.log('Saved with createUser:', userId, formData);
    alert('Lưu thành công!');
    router.push('/nv/contract-debt');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.backBtn} onClick={() => router.back()}>←</span> 
          Thêm mới hợp đồng vay
        </div>
        <div className={styles.subtitle}>Nhập thông tin hợp đồng vay</div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>1. Thông tin chung</div>
        <div className={styles.grid4}>
          <div className={styles.field}>
            <span className={styles.label}>Mã đối tác <span className={styles.required}>*</span></span>
            <Select 
              options={partners} 
              value={formData.cusId} 
              onChange={(value) => handleChange('cusId', value)} 
              placeholder="-- Chọn đối tác --"
            />
            {errors.cusId && <span className={styles.requiredNote}>{errors.cusId}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Số HĐ tín dụng <span className={styles.required}>*</span></span>
            <Select 
              options={contractOptions} 
              value={formData.contactNo} 
              onChange={(value) => handleChange('contactNo', value)} 
              placeholder="-- Chọn hợp đồng tín dụng --"
            />
            {errors.contactNo && <span className={styles.requiredNote}>{errors.contactNo}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Mã hạn mức <span className={styles.required}>*</span></span>
            <Select 
              options={limitOptions} 
              value={formData.limitId} 
              onChange={(value) => handleChange('limitId', value)} 
              placeholder="-- Chọn mã hạn mức --"
            />
            {errors.limitId && <span className={styles.requiredNote}>{errors.limitId}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Hạn mức còn lại</span>
            <Input disabled value={formData.remainLimit?.toLocaleString() || '0'} />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Số HĐ khế ước <span className={styles.required}>*</span></span>
            <Input 
              value={formData.lnContactNo} 
              onChange={e => handleChange('lnContactNo', e.target.value)} 
            />
            {errors.lnContactNo && <span className={styles.requiredNote}>{errors.lnContactNo}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Ngày khế ước <span className={styles.required}>*</span></span>
            <Input 
              type="date" 
              value={formData.lnContactDate} 
              onChange={e => handleChange('lnContactDate', e.target.value)} 
            />
            {errors.lnContactDate && <span className={styles.requiredNote}>{errors.lnContactDate}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Ngày giải ngân <span className={styles.required}>*</span></span>
            <Input 
              type="date" 
              value={formData.lnDate} 
              onChange={e => handleChange('lnDate', e.target.value)} 
            />
            {errors.lnDate && <span className={styles.requiredNote}>{errors.lnDate}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Số tiền giải ngân <span className={styles.required}>*</span></span>
            <Input 
              type="number" 
              value={formData.lnAmt || ''} 
              onChange={e => handleChange('lnAmt', Number(e.target.value))} 
            />
            {errors.lnAmt && <span className={styles.requiredNote}>{errors.lnAmt}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Đơn vị tiền tệ <span className={styles.required}>*</span></span>
            <Select 
              options={[{value:'VND', label:'VND'}, {value:'USD', label:'USD'}]} 
              value={formData.currency} 
              onChange={(value) => handleChange('currency', value)} 
            />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Kỳ hạn (tháng) <span className={styles.required}>*</span></span>
            <Input 
              type="number" 
              value={formData.term || ''} 
              onChange={e => handleChange('term', Number(e.target.value))} 
            />
            {errors.term && <span className={styles.requiredNote}>{errors.term}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Mục đích <span className={styles.required}>*</span></span>
            <Input 
              value={formData.purpose} 
              onChange={e => handleChange('purpose', e.target.value)} 
            />
            {errors.purpose && <span className={styles.requiredNote}>{errors.purpose}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Kỳ trả lãi <span className={styles.required}>*</span></span>
            <Select 
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
            <Select 
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
          <div className={styles.field}>
            <span className={styles.label}>Trạng thái</span>
            <Input disabled value={formData.status} />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>2. Lãi suất</div>
        <div className={styles.grid4}>
          <div className={styles.field}>
            <span className={styles.label}>Lãi HĐ (%) <span className={styles.required}>*</span></span>
            <Input 
              type="number" 
              value={formData.contractIntRate || ''} 
              onChange={e => handleChange('contractIntRate', Number(e.target.value))} 
            />
            {errors.contractIntRate && <span className={styles.requiredNote}>{errors.contractIntRate}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Lãi thực tế (%) <span className={styles.required}>*</span></span>
            <Input 
              type="number" 
              value={formData.actIntRate || ''} 
              onChange={e => handleChange('actIntRate', Number(e.target.value))} 
            />
            {errors.actIntRate && <span className={styles.requiredNote}>{errors.actIntRate}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Lý do chênh lệch {formData.contractIntRate !== formData.actIntRate && <span className={styles.required}>*</span>}</span>
            <Input 
              value={formData.reason} 
              onChange={e => handleChange('reason', e.target.value)} 
            />
            {errors.reason && <span className={styles.requiredNote}>{errors.reason}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Tỷ lệ duy trì CASA (%)</span>
            <Input 
              type="number" 
              value={formData.casaRate || ''} 
              onChange={e => handleChange('casaRate', Number(e.target.value))} 
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>3. Thông tin thanh toán</div>
        <div className={styles.grid4}>
          <div className={styles.field}>
            <span className={styles.label}>Số tiền đáo hạn</span>
            <Input 
              type="number" 
              value={formData.maturityAmt || ''} 
              onChange={e => handleChange('maturityAmt', Number(e.target.value))} 
            />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Ngày tất toán</span>
            <Input 
              type="date" 
              value={formData.settDate} 
              onChange={e => handleChange('settDate', e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.requiredNote}>* Thông tin bắt buộc</span>
        <div className={styles.actions}>
          <Button variant="outline" onClick={() => router.back()}>Hủy</Button>
          <Button variant="primary" onClick={handleSave}>Lưu</Button>
        </div>
      </div>
    </div>
  );
}
