'use client';

import { useState } from "react";
import Input from "@/components/shared/Input/Input";
import Button from "@/components/shared/Button/Button";
import Select, { SelectOption } from "@/components/shared/Select/Select";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { ContactItem } from "@/types/funding.types";

interface ContactFormProps {
    partnerId: string;
    initialData?: ContactItem | null;
    isView?: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSaveLocal?: (item: ContactItem) => void;
}

const STATUS_OPTIONS: SelectOption[] = [
    { label: 'Hiệu lực', value: 'ACTIVE' },
    { label: 'Hết hiệu lực', value: 'INACTIVE' }
];

export default function ContactForm({ partnerId, initialData, isView = false, onClose, onSuccess, onSaveLocal }: ContactFormProps) {
    const { notifyError, notifySuccess } = useNotification();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<ContactItem>(initialData || {
        partnerId,
        name: '',
        position: '',
        department: '',
        phone: '',
        email: '',
        role: '',
        transactionFee: '',
        note: '',
        status: 'ACTIVE'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name?.trim()) {
            notifyError('Lỗi', 'Vui lòng nhập họ và tên người liên hệ');
            return;
        }

        if (!partnerId && onSaveLocal) {
            onSaveLocal({
                ...formData,
                id: initialData?.id || ("temp_" + Date.now()),
                name: formData.name.trim(),
                status: formData.status || 'ACTIVE'
            });
            notifySuccess('Thành công', initialData?.id ? 'Đã cập nhật người liên hệ' : 'Đã thêm mới người liên hệ');
            onSuccess();
            return;
        }

        try {
            setSaving(true);
            const { id, partnerId: pId, ...cleanData } = formData;
            const payload = {
                ...cleanData,
                name: formData.name.trim(),
                status: formData.status || 'ACTIVE'
            };
            
            if (initialData?.id && !initialData.id.startsWith('temp_')) {
                await apiClient.put(`/v1/capital-source/partners/${partnerId}/contacts/${initialData.id}`, payload);
            } else {
                await apiClient.post(`/v1/capital-source/partners/${partnerId}/contacts`, payload);
            }
            notifySuccess('Thành công', initialData?.id ? 'Đã cập nhật người liên hệ' : 'Đã thêm mới người liên hệ');
            onSuccess();
        } catch (error: any) {
            notifyError('Lỗi', error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi lưu người liên hệ');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: '24px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                        Họ và tên <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Input 
                        disabled={isView}
                        name="name" 
                        value={formData.name || ''} 
                        onChange={handleChange} 
                        placeholder="Nhập họ và tên..."
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                        Vị trí
                    </label>
                    <Input 
                        disabled={isView}
                        name="position" 
                        value={formData.position || ''} 
                        onChange={handleChange} 
                        placeholder="Trưởng phòng, Chuyên viên..."
                    />
                </div>
                
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                        Phòng ban
                    </label>
                    <Input 
                        disabled={isView}
                        name="department" 
                        value={formData.department || ''} 
                        onChange={handleChange} 
                        placeholder="Phòng giao dịch, Phòng thanh toán..."
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                        Nội dung phụ trách
                    </label>
                    <Input 
                        disabled={isView}
                        name="role" 
                        value={formData.role || ''} 
                        onChange={handleChange} 
                        placeholder="Quản lý giao dịch, CSKH..."
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                        Phí GD (%)
                    </label>
                    <Input 
                        disabled={isView}
                        name="transactionFee" 
                        value={formData.transactionFee || ''} 
                        onChange={handleChange} 
                        placeholder="Ví dụ: 0.15% hoặc 0.15" 
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                        SĐT
                    </label>
                    <Input 
                        disabled={isView}
                        name="phone" 
                        value={formData.phone || ''} 
                        onChange={handleChange} 
                        placeholder="Số điện thoại liên hệ..."
                    />
                </div>
                
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                        Email
                    </label>
                    <Input 
                        disabled={isView}
                        name="email" 
                        value={formData.email || ''} 
                        onChange={handleChange} 
                        type="email" 
                        placeholder="example@abb.com"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                        Trạng thái <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Select 
                        disabled={isView}
                        name="status"
                        value={formData.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE'}
                        onChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                        options={STATUS_OPTIONS}
                    />
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                        Ghi chú
                    </label>
                    <Input 
                        disabled={isView}
                        name="note" 
                        value={formData.note || ''} 
                        onChange={handleChange} 
                        placeholder="Ghi chú thêm (nếu có)..."
                    />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" onClick={onClose}>
                    {isView ? 'Đóng' : 'Hủy'}
                </Button>
                {!isView && (
                    <Button variant="primary" onClick={handleSubmit} disabled={saving} isLoading={saving}>
                        {initialData ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                )}
            </div>
        </div>
    );
}
