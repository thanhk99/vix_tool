"use client";

import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import styles from "./AssetCatalogFormModal.module.css";
import Button from "@/components/shared/Button/Button";
import CurrencyInput from "@/components/shared/Input/CurrencyInput";
import Modal from "@/components/shared/Modal/Modal";

interface UpdatePriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    assetId: string;
    onSuccess?: () => void;
}

export default function UpdatePriceModal({ isOpen, onClose, assetId, onSuccess }: UpdatePriceModalProps) {
    const { notifyError, notifySuccess } = useNotification();
    const [marketPrice, setMarketPrice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!marketPrice) {
            notifyError("Vui lòng nhập giá thị trường mới");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                marketPrice: Number(marketPrice)
            };

            const res: any = await apiClient.patch(`/v1/capital-source/assets/${assetId}/price`, payload);

            if (res?.success || res?.data?.success || res?.data || res?.assetId) {
                notifySuccess("Cập nhật giá thị trường thành công");
                if (onSuccess) onSuccess();
                onClose();
            } else {
                notifyError(res?.message || "Lỗi cập nhật giá thị trường");
            }
        } catch (error: any) {
            notifyError(error.response?.data?.message || error.message || "Lỗi cập nhật giá");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Cập nhật Giá Thị trường (${assetId})`}>
            <div className={styles.formContainer}>
                <div className={styles.formGroup}>
                    <label>Giá thị trường mới (VND) <span className={styles.required}>*</span></label>
                    <CurrencyInput
                        value={marketPrice}
                        onChangeValue={(val) => setMarketPrice(val != null ? val.toString() : "")}
                        placeholder="Nhập giá thị trường"
                    />
                </div>

                <div className={styles.formActions} style={{ marginTop: 20 }}>
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
                    <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>Lưu</Button>
                </div>
            </div>
        </Modal>
    );
}