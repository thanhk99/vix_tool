"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { AssetFormData } from "@/types/funding.types";
import styles from "./AssetCatalogFormModal.module.css";
import Button from "@/components/shared/Button/Button";
import Input from "@/components/shared/Input/Input";
import CurrencyInput from "@/components/shared/Input/CurrencyInput";
import Modal from "@/components/shared/Modal/Modal";
import Select, { SelectOption } from "@/components/shared/Select/Select";

interface AssetCatalogFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    assetId?: string | null;
    onSuccess?: () => void;
}

const initialFormData: AssetFormData = {
    assetId: "",
    assetType: "STOCK",
    symbol: "",
    currency: "VND",
    issuer: "",
    issuerCode: "",
    totalQuantity: "",
    parValue: "",
    marketPrice: "",
    haircutRate: "0",
    issueDate: "",
    maturityDate: "",
    callDate: "",
    couponType: "",
    couponRate: "",
    interestPayTerm: "",
    note: "",
    status: "AVAILABLE"
};

const assetTypeOptions: SelectOption[] = [
    { label: "Cổ phiếu", value: "STOCK" },
    { label: "Trái phiếu", value: "BOND" },
    { label: "Chứng chỉ quỹ", value: "FUND" },
    { label: "Tiền gửi", value: "DEPOSIT" },
];

export default function AssetCatalogFormModal({ isOpen, onClose, assetId, onSuccess }: AssetCatalogFormModalProps) {
    const { notifyError, notifySuccess } = useNotification();
    const [formData, setFormData] = useState<AssetFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isEdit = !!assetId;

    useEffect(() => {
        if (isOpen) {
            if (isEdit) {
                fetchAssetDetail(assetId as string);
            } else {
                setFormData(initialFormData);
            }
        }
    }, [isOpen, assetId]);

    const fetchAssetDetail = async (id: string) => {
        setIsLoading(true);
        try {
            const res: any = await apiClient.get(`/v1/capital-source/assets/${id}`);
            const data = res?.data || res;
            if (data) {
                setFormData({
                    ...initialFormData,
                    assetId: data.assetId || "",
                    assetType: data.assetType || "STOCK",
                    symbol: data.symbol || "",
                    currency: data.currency || "VND",
                    issuer: data.issuer || "",
                    issuerCode: data.issuerCode || "",
                    totalQuantity: data.totalQuantity != null ? data.totalQuantity.toString() : data.availQuantity != null ? data.availQuantity.toString() : "",
                    parValue: data.parValue != null ? data.parValue.toString() : "",
                    marketPrice: data.marketPrice != null ? data.marketPrice.toString() : "",
                    haircutRate: data.haircutRate != null ? data.haircutRate.toString() : "0",
                    issueDate: data.issueDate || "",
                    maturityDate: data.maturityDate || "",
                    callDate: data.callDate || "",
                    couponType: data.couponType || "",
                    couponRate: data.couponRate != null ? data.couponRate.toString() : "",
                    interestPayTerm: data.interestPayTerm || "",
                    note: data.note || "",
                    status: data.status || "AVAILABLE"
                });
            }
        } catch (error: any) {
            notifyError(error.message || "Lỗi khi lấy thông tin tài sản");
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.assetType || !formData.issuer || !formData.currency || !formData.totalQuantity) {
            notifyError("Vui lòng điền các trường bắt buộc (*)");
            return;
        }

        const numTotalQty = Number(formData.totalQuantity);
        if (isNaN(numTotalQty) || numTotalQty <= 0) {
            notifyError("Số lượng tài sản phải lớn hơn 0");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                totalQuantity: numTotalQty,
                availQuantity: isEdit ? undefined : numTotalQty,
                pledgedQuantity: isEdit ? undefined : 0,
                assetId: formData.assetId ? formData.assetId.trim() : undefined,
                parValue: formData.parValue ? Number(formData.parValue) : null,
                marketPrice: formData.marketPrice ? Number(formData.marketPrice) : null,
                haircutRate: formData.haircutRate ? Number(formData.haircutRate) : 0,
                couponRate: formData.couponRate ? Number(formData.couponRate) : null,
            };

            let res: any;
            if (isEdit) {
                res = await apiClient.put(`/v1/capital-source/assets/${assetId}`, payload);
            } else {
                res = await apiClient.post(`/v1/capital-source/assets`, payload);
            }

            if (res?.data?.success || res?.success || res?.id || res?.assetId) {
                notifySuccess(isEdit ? "Cập nhật tài sản thành công" : "Thêm mới tài sản thành công");
                if (onSuccess) onSuccess();
                onClose();
            } else {
                notifyError(res?.message || "Lỗi lưu tài sản");
            }
        } catch (error: any) {
            notifyError(error.response?.data?.message || error.message || "Lỗi lưu tài sản");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Sửa tài sản" : "Thêm mới tài sản"}>
                <div style={{ padding: "24px", textAlign: "center" }}>Đang tải...</div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Sửa tài sản" : "Thêm mới tài sản"}>
            <div className={styles.formContainer}>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Loại tài sản <span className={styles.required}>*</span></label>
                        <Select
                            name="assetType"
                            value={formData.assetType}
                            onChange={(val) => setFormData(prev => ({ ...prev, assetType: val }))}
                            options={assetTypeOptions}
                            placeholder="Chọn loại tài sản"
                            disabled={isEdit}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Mã chứng khoán / Symbol</label>
                        <Input
                            name="symbol"
                            value={formData.symbol}
                            onChange={handleChange}
                            placeholder="VND, VCB,..."
                            disabled={isEdit}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Số lượng tài sản <span className={styles.required}>*</span></label>
                        <CurrencyInput
                            value={formData.totalQuantity}
                            onChangeValue={(val) => setFormData(prev => ({ ...prev, totalQuantity: val != null ? val.toString() : "" }))}
                            placeholder="Nhập số lượng tài sản"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Loại tiền tệ <span className={styles.required}>*</span></label>
                        <Input
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            disabled={isEdit}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Tổ chức phát hành <span className={styles.required}>*</span></label>
                        <Input
                            name="issuer"
                            value={formData.issuer}
                            onChange={handleChange}
                            placeholder="Nhập tên TCPH"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Mã TCPH</label>
                        <Input
                            name="issuerCode"
                            value={formData.issuerCode}
                            onChange={handleChange}
                            placeholder="Nhập mã TCPH"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Mệnh giá (VND)</label>
                        <CurrencyInput
                            value={formData.parValue}
                            onChangeValue={(val) => setFormData(prev => ({ ...prev, parValue: val != null ? val.toString() : "" }))}
                            placeholder="Nhập mệnh giá"
                            disabled={isEdit}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Giá thị trường (VND)</label>
                        <CurrencyInput
                            value={formData.marketPrice}
                            onChangeValue={(val) => setFormData(prev => ({ ...prev, marketPrice: val != null ? val.toString() : "" }))}
                            placeholder="Nhập giá"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Tỷ lệ Haircut (%)</label>
                        <Input
                            type="number"
                            name="haircutRate"
                            value={formData.haircutRate}
                            onChange={handleChange}
                            placeholder="Nhập tỷ lệ (%)"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ngày phát hành</label>
                        <Input
                            type="date"
                            name="issueDate"
                            value={formData.issueDate}
                            onChange={handleChange}
                            disabled={isEdit}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ngày đáo hạn</label>
                        <Input
                            type="date"
                            name="maturityDate"
                            value={formData.maturityDate}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className={styles.formGroup} style={{ marginTop: 16 }}>
                    <label>Ghi chú</label>
                    <Input
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="Nhập ghi chú"
                    />
                </div>

                <div className={styles.formActions}>
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
                    <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>Lưu</Button>
                </div>
            </div>
        </Modal>
    );
}