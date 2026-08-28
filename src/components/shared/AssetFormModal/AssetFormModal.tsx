"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { AssetFormData } from "@/types/funding.types";
import styles from "./AssetFormModal.module.css";
import Button from "@/components/shared/Button/Button";
import Input from "@/components/shared/Input/Input";
import CurrencyInput from "@/components/shared/Input/CurrencyInput";
import Modal from "@/components/shared/Modal/Modal";
import Select, { SelectOption } from "@/components/shared/Select/Select";

interface AssetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    partnerId: string;
    limitId?: string; // Tùy chọn, nếu truyền vào sẽ gọi API theo Hạn mức
    onSuccess?: () => void;
}

const initialFormData: AssetFormData = {
    assetId: "",
    assetType: "",
    symbol: "",
    currency: "VND",
    issuer: "",
    issuerCode: "",
    totalQuantity: "",
    parValue: "",
    marketPrice: "",
    haircutRate: "",
    issueDate: "",
    maturityDate: "",
    callDate: "",
    couponType: "",
    couponRate: "",
    interestPayTerm: "",
    note: "",
    status: "AVAILABLE"
};

const ASSET_TYPE_OPTIONS: SelectOption[] = [
    { label: "Cổ phiếu", value: "STOCK" },
    { label: "TPCP", value: "GOVERNMENT_BOND" },
    { label: "TPTCTD", value: "CREDIT_INSTITUTION_BOND" },
    { label: "TPDN", value: "CORPORATE_BOND" },
    { label: "CCTG", value: "CERTIFICATE_OF_DEPOSIT" },
    { label: "HĐTG", value: "DEPOSIT_CONTRACT" },
];

export default function AssetFormModal({ isOpen, onClose, partnerId, limitId, onSuccess }: AssetFormModalProps) {
    const [formData, setFormData] = useState<AssetFormData>(initialFormData);
    const { notifyError, notifySuccess, notifyWarning } = useNotification();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                ...initialFormData,
                issuer: partnerId,
            });
        }
    }, [isOpen, partnerId]);

    const handleChange = (field: keyof AssetFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.assetId.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Mã TSĐB");
            return false;
        }
        if (!formData.assetType) {
            notifyWarning("Cảnh báo", "Vui lòng chọn Loại TSĐB");
            return false;
        }
        if (!formData.issuer) {
            notifyWarning("Cảnh báo", "Vui lòng chọn Tổ chức phát hành");
            return false;
        }
        if (!formData.issuerCode.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Mã TCPH");
            return false;
        }
        if (!formData.parValue) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Mệnh giá");
            return false;
        }
        if (!formData.issueDate) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Ngày phát hành");
            return false;
        }
        if (!formData.maturityDate) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Ngày đáo hạn");
            return false;
        }
        if (new Date(formData.maturityDate) <= new Date(formData.issueDate)) {
            notifyWarning("Cảnh báo", "Ngày đáo hạn phải sau ngày phát hành");
            return false;
        }
        if (!formData.couponType.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Loại lãi suất");
            return false;
        }
        if (!formData.couponRate) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Lãi suất coupon");
            return false;
        }
        if (!formData.interestPayTerm) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Kỳ trả lãi");
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setSaving(true);

            const payload: any = {
                assetId: formData.assetId.trim(),
                assetType: formData.assetType,
                issuer: formData.issuer,
                issuerCode: formData.issuerCode.trim(),
                parValue: Number(formData.parValue),
                issueDate: formData.issueDate,
                maturityDate: formData.maturityDate,
                callDate: formData.callDate || null,
                couponType: formData.couponType.trim(),
                couponRate: Number(formData.couponRate),
                interestPayTerm: Number(formData.interestPayTerm),
            };

            if (limitId) {
                payload.creditLimitId = limitId;
            }

            const res = await apiClient.post(
                `/v1/capital-source/partners/${partnerId}/assets`,
                payload
            );

            if (res.data.success) {
                notifySuccess("Thành công", "Đã thêm tài sản bảo đảm");
                onSuccess?.();
                onClose();
            } else {
                notifyError("Lỗi", res.data.message || "Không thể thêm tài sản bảo đảm");
            }
        } catch (error: any) {
            notifyError("Lỗi", error.response?.data?.message || "Không thể thêm tài sản bảo đảm");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                if (!saving) onClose();
            }}
            title="THÊM MỚI TÀI SẢN BẢO ĐẢM"
            size="lg"
            closeOnOverlayClick={!saving}
        >
            <div className={styles.assetForm}>
                <div className={styles.formGrid}>
                    <Input
                        label="Mã TSĐB"
                        value={formData.assetId}
                        onChange={(e) => handleChange("assetId", e.target.value)}
                        placeholder="Nhập mã TSĐB"
                        disabled={saving}
                        fullWidth
                    />

                    <Select
                        label="Loại TSĐB"
                        value={formData.assetType}
                        onChange={(value) => handleChange("assetType", value)}
                        placeholder="-- Chọn loại TSĐB --"
                        options={ASSET_TYPE_OPTIONS}
                        disabled={saving}
                        fullWidth
                    />

                    <Select
                        label="Tổ chức phát hành"
                        value={formData.issuer}
                        onChange={(value) => handleChange("issuer", value)}
                        options={[{ label: "Đối tác hiện tại", value: partnerId }]}
                        disabled={saving}
                        fullWidth
                    />

                    <Input
                        label="Mã TCPH"
                        value={formData.issuerCode}
                        onChange={(e) => handleChange("issuerCode", e.target.value)}
                        placeholder="Nhập mã TCPH"
                        disabled={saving}
                        fullWidth
                    />

                    <CurrencyInput
                        label="Mệnh giá"
                        value={formData.parValue}
                        onChangeValue={(val) => handleChange("parValue", String(val))}
                        placeholder="Nhập mệnh giá"
                        disabled={saving}
                        fullWidth
                    />

                    <Input
                        label="Ngày phát hành"
                        type="date"
                        value={formData.issueDate}
                        onChange={(e) => handleChange("issueDate", e.target.value)}
                        disabled={saving}
                        fullWidth
                    />

                    <Input
                        label="Ngày đáo hạn"
                        type="date"
                        value={formData.maturityDate}
                        onChange={(e) => handleChange("maturityDate", e.target.value)}
                        disabled={saving}
                        fullWidth
                    />

                    <Input
                        label="Ngày mua lại trước hạn"
                        type="date"
                        value={formData.callDate}
                        onChange={(e) => handleChange("callDate", e.target.value)}
                        disabled={saving}
                        fullWidth
                    />

                    <Input
                        label="Loại lãi suất"
                        value={formData.couponType}
                        onChange={(e) => handleChange("couponType", e.target.value)}
                        placeholder="Nhập loại lãi suất"
                        disabled={saving}
                        fullWidth
                    />

                    <Input
                        label="Lãi suất coupon (%)"
                        type="number"
                        value={formData.couponRate}
                        onChange={(e) => handleChange("couponRate", e.target.value)}
                        placeholder="Nhập lãi suất"
                        min="0"
                        step="0.0001"
                        disabled={saving}
                        fullWidth
                    />

                    <Input
                        label="Kỳ trả lãi (Tháng)"
                        type="number"
                        value={formData.interestPayTerm}
                        onChange={(e) => handleChange("interestPayTerm", e.target.value)}
                        placeholder="Nhập kỳ trả lãi"
                        min="1"
                        step="1"
                        disabled={saving}
                        fullWidth
                    />
                </div>

                <div className={styles.formActions}>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            if (!saving) onClose();
                        }}
                        disabled={saving}
                    >
                        Hủy bỏ
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
            </div>
        </Modal>
    );
}
