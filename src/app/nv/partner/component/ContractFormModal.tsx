import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal/Modal';
import Button from '@/components/shared/Button/Button';
import Input from '@/components/shared/Input/Input';
import CurrencyInput from '@/components/shared/Input/CurrencyInput';
import apiClient from '@/lib/api/client';
import { useNotification } from '@/hooks/useNotification';
import { PURPOSES } from '@/constants/credit-limit';
import styles from './CrelimitTab.module.css';

interface ContractFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    partnerId: string;
    contractData?: any;
    onSuccess: () => void;
}

export default function ContractFormModal({ isOpen, onClose, partnerId, contractData, onSuccess }: ContractFormModalProps) {
    const { notifySuccess, notifyError, notifyWarning } = useNotification();
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        contractNo: '',
        totalLimit: '',
        purpose: [] as string[],
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (contractData) {
            setFormData({
                contractNo: contractData.contractNo || '',
                totalLimit: contractData.totalLimit ? String(contractData.totalLimit) : '',
                purpose: contractData.purpose ? contractData.purpose.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                startDate: contractData.startDate ? new Date(contractData.startDate).toISOString().split('T')[0] : '',
                endDate: contractData.endDate ? new Date(contractData.endDate).toISOString().split('T')[0] : ''
            });
        } else {
            setFormData({
                contractNo: '',
                totalLimit: '',
                purpose: [],
                startDate: '',
                endDate: ''
            });
        }
    }, [contractData]);

    const handleInputChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePurposeChange = (purposeId: string, checked: boolean) => {
        setFormData(prev => {
            let newPurposes = [...prev.purpose];
            if (checked) {
                if (purposeId === 'Hạn mức vay margin') {
                    newPurposes = ['Hạn mức vay margin'];
                } else {
                    newPurposes = newPurposes.filter(p => p !== 'Hạn mức vay margin');
                    newPurposes.push(purposeId);
                }
            } else {
                newPurposes = newPurposes.filter(p => p !== purposeId);
            }
            return { ...prev, purpose: newPurposes };
        });
    };

    const handleSave = async () => {
        if (!formData.contractNo.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Số hợp đồng");
            return;
        }
        if (!formData.totalLimit) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Tổng hạn mức");
            return;
        }
        if (!formData.startDate || !formData.endDate) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Ngày hiệu lực và Ngày hết hạn");
            return;
        }
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            notifyWarning("Cảnh báo", "Ngày hết hạn phải sau ngày bắt đầu");
            return;
        }

        try {
            setSaving(true);
            const payload = {
                contractNo: formData.contractNo.trim(),
                totalLimit: Number(formData.totalLimit),
                purpose: formData.purpose.join(', '),
                startDate: formData.startDate,
                endDate: formData.endDate
            };

            if (contractData?.id) {
                await apiClient.put(`/v1/capital-source/contracts/${contractData.id}`, payload);
                notifySuccess("Thành công", "Đã cập nhật Hợp đồng");
            } else {
                await apiClient.post(`/v1/capital-source/partners/${partnerId}/contracts`, payload);
                notifySuccess("Thành công", "Đã tạo mới Hợp đồng");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            notifyError("Lỗi", error.response?.data?.message || "Có lỗi xảy ra khi lưu Hợp đồng");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => { if (!saving) onClose(); }}
            title={contractData ? "CẬP NHẬT HỢP ĐỒNG" : "THÊM MỚI HỢP ĐỒNG"}
        >
            <div className={styles.formGrid}>
                <Input
                    label="Số hợp đồng"
                    value={formData.contractNo}
                    onChange={(e) => handleInputChange("contractNo", e.target.value)}
                    placeholder="Nhập số hợp đồng..."
                    disabled={saving || !!contractData} // Disable contractNo if editing
                    fullWidth
                    required
                />

                <div className={styles.inputGroup}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        Tổng hạn mức <span style={{ color: 'red' }}>*</span>
                    </label>
                    <CurrencyInput
                        value={formData.totalLimit}
                        onChangeValue={(val) => handleInputChange("totalLimit", String(val))}
                        placeholder="Nhập tổng hạn mức..."
                        disabled={saving}
                    />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        Mục đích vay vốn
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        {PURPOSES.map(p => (
                            <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.purpose.includes(p.name)}
                                    onChange={(e) => handlePurposeChange(p.name, e.target.checked)}
                                    disabled={saving}
                                />
                                {p.name}
                            </label>
                        ))}
                    </div>
                </div>

                <Input
                    label="Ngày hiệu lực"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    disabled={saving}
                    fullWidth
                    required
                />

                <Input
                    label="Ngày hết hạn"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    disabled={saving}
                    fullWidth
                    required
                />
            </div>

            <div className={styles.formActions}>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={saving}
                >
                    Hủy
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    onClick={handleSave}
                    isLoading={saving}
                >
                    Lưu
                </Button>
            </div>
        </Modal>
    );
}
