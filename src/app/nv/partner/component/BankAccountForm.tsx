'use client';

import { useState } from "react";
import Input from "@/components/shared/Input/Input";
import Button from "@/components/shared/Button/Button";
import Select from "@/components/shared/Select/Select";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { BankAccountItem } from "@/types/funding.types";

interface BankAccountFormProps {
    partnerId: string;
    initialData?: BankAccountItem | null;
    activeSubTab?: 'BANK' | 'CHANNEL';
    onClose: () => void;
    onSuccess: () => void;
    onSaveLocal?: (item: BankAccountItem) => void;
}

export default function BankAccountForm({ partnerId, initialData, activeSubTab = 'BANK', onClose, onSuccess, onSaveLocal }: BankAccountFormProps) {
    const { notifyError, notifySuccess } = useNotification();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<BankAccountItem>(initialData || {
        partnerId,
        accountType: activeSubTab,
        accountNumber: '',
        accountName: '',
        openPlace: '',
        branch: '',
        citadCode: '',
        purpose: '',
        depositoryMemberNo: '',
        tradingGateway: '',
        status: 'ACTIVE'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (activeSubTab === 'BANK') {
            if (!formData.accountNumber) {
                notifyError('Lỗi', 'Vui lòng nhập số tài khoản');
                return;
            }
            if (!formData.accountName) {
                notifyError('Lỗi', 'Vui lòng nhập tên chủ tài khoản');
                return;
            }
            if (!formData.openPlace) {
                notifyError('Lỗi', 'Vui lòng nhập tên ngân hàng mở tại');
                return;
            }
        } else {
            if (!formData.tradingGateway) {
                notifyError('Lỗi', 'Vui lòng nhập tên kênh đặt lệnh');
                return;
            }
        }

        if (!partnerId && onSaveLocal) {
            onSaveLocal({
                ...formData,
                id: initialData?.id || ("temp_" + Date.now()),
                accountType: activeSubTab
            });
            notifySuccess('Thành công', 'Đã lưu thông tin');
            onSuccess();
            return;
        }

        try {
            setSaving(true);
            const { id, partnerId: pId, ...cleanData } = formData;
            const payload = { ...cleanData, accountType: activeSubTab };
            if (initialData?.id && !initialData.id.startsWith('temp_')) {
                await apiClient.put('/v1/capital-source/partners/' + partnerId + '/bank-accounts/' + initialData.id, payload);
            } else {
                await apiClient.post('/v1/capital-source/partners/' + partnerId + '/bank-accounts', payload);
            }
            notifySuccess('Thành công', 'Đã lưu thông tin');
            onSuccess();
        } catch (error: any) {
            notifyError('Lỗi', error?.message || 'Có lỗi xảy ra khi lưu thông tin');
        } finally {
            setSaving(false);
        }
    };

    const statusOptions = [
        { value: 'ACTIVE', label: '1 - Hiệu lực' },
        { value: 'INACTIVE', label: '0 - Hết hiệu lực' }
    ];

    return (
        <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {activeSubTab === 'BANK' ? 'Nhập thông tin tài khoản ngân hàng' : 'Nhập thông tin kênh đặt lệnh'}
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {activeSubTab === 'BANK' ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ minWidth: '150px', fontSize: '14px' }}>Mở tại <span style={{ color: 'red' }}>*</span></span>
                            <Input name="openPlace" value={formData.openPlace || ""} onChange={handleChange} placeholder="Ví dụ: VCB, BIDV..." />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ minWidth: '150px', fontSize: '14px' }}>Chi nhánh</span>
                            <Input name="branch" value={formData.branch} onChange={handleChange} placeholder="Chi nhánh ngân hàng..." />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ minWidth: '150px', fontSize: '14px' }}>Số TK ngân hàng <span style={{ color: 'red' }}>*</span></span>
                            <Input name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Nhập số tài khoản..." />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ minWidth: '150px', fontSize: '14px' }}>Tên chủ TK <span style={{ color: 'red' }}>*</span></span>
                            <Input name="accountName" value={formData.accountName} onChange={handleChange} placeholder="Nhập tên chủ tài khoản..." />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ minWidth: '150px', fontSize: '14px' }}>Mục đích sử dụng</span>
                            <Input name="purpose" value={formData.purpose} onChange={handleChange} placeholder="Mục đích sử dụng..." />
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ minWidth: '150px', fontSize: '14px' }}>Kênh đặt lệnh <span style={{ color: 'red' }}>*</span></span>
                            <Input name="tradingGateway" value={formData.tradingGateway || ""} onChange={handleChange} placeholder="Ví dụ: Email, Bloomberg..." />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ minWidth: '150px', fontSize: '14px' }}>Mục đích đặt lệnh</span>
                            <Input name="purpose" value={formData.purpose} onChange={handleChange} placeholder="Mục đích đặt lệnh..." />
                        </div>
                    </>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '150px', fontSize: '14px' }}>Trạng thái</span>
                    <Select 
                        name="status"
                        value={formData.status} 
                        onChange={(val) => handleSelectChange('status', val)}
                        options={statusOptions}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                <Button variant="primary" onClick={handleSubmit} disabled={saving} isLoading={saving}>
                    {initialData ? 'Cập nhật' : 'Thêm mới'}
                </Button>
                <Button variant="outline" onClick={onClose} disabled={saving}>Thoát</Button>
            </div>
        </div>
    );
}
