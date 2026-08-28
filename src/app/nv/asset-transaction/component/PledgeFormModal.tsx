"use client";

import { useState, useEffect, useMemo } from "react";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { AssetPledgeFormData } from "@/types/funding.types";
import styles from "./AssetCatalogFormModal.module.css";
import Button from "@/components/shared/Button/Button";
import Input from "@/components/shared/Input/Input";
import CurrencyInput from "@/components/shared/Input/CurrencyInput";
import Modal from "@/components/shared/Modal/Modal";
import { ShieldCheck, Plus } from "lucide-react";

interface PledgeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const initialFormData: AssetPledgeFormData = {
    assetId: "",
    cusId: "",
    contractNo: "",
    limitId: "",
    pledgePlace: "VSDC",
    pledgeDate: new Date().toISOString().split('T')[0],
    endPledgeDate: "",
    pledgeQty: "",
    price: "",
    haircutRate: "",
    pledgeContractNo: "",
    fileUrl: "",
    note: ""
};

export default function PledgeFormModal({ isOpen, onClose, onSuccess }: PledgeFormModalProps) {
    const { notifyError, notifySuccess } = useNotification();
    const [formData, setFormData] = useState<AssetPledgeFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data sources
    const [availableAssets, setAvailableAssets] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [creditLimits, setCreditLimits] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
            const loadData = async () => {
                try {
                    // 1. Assets
                    const aRes: any = await apiClient.get('/v1/capital-source/assets?size=100');
                    const aList = aRes?.data?.content || aRes?.content || (Array.isArray(aRes?.data) ? aRes.data : Array.isArray(aRes) ? aRes : []);
                    setAvailableAssets(aList);

                    // 2. Partners
                    const pRes: any = await apiClient.get('/v1/capital-source/partners?size=100');
                    const pList = pRes?.data?.content || pRes?.content || (Array.isArray(pRes?.data) ? pRes.data : Array.isArray(pRes) ? pRes : []);
                    setPartners(pList.filter((p: any) => p.status === 'APPROVED' || p.status === 'Hoạt động'));

                    // 3. Credit Limits
                    const lRes: any = await apiClient.get('/v1/capital-source/credit-limits?size=100');
                    const lList = lRes?.data?.content || lRes?.content || (Array.isArray(lRes?.data) ? lRes.data : Array.isArray(lRes) ? lRes : []);
                    setCreditLimits(lList.filter((l: any) => l.status === 'APPROVED' || l.status === 'ACTIVE'));
                } catch (err) {
                    console.error("Failed to load pledge form data sources", err);
                }
            };
            loadData();
        }
    }, [isOpen]);

    const selectedAsset = useMemo(() => {
        return availableAssets.find(a => a.assetId === formData.assetId);
    }, [availableAssets, formData.assetId]);

    const handleAssetSelect = (assetId: string) => {
        const found = availableAssets.find(a => a.assetId === assetId);
        if (found) {
            setFormData(prev => ({
                ...prev,
                assetId,
                price: found.marketPrice ? found.marketPrice.toString() : "",
                haircutRate: found.haircutRate ? found.haircutRate.toString() : "0"
            }));
        } else {
            setFormData(prev => ({ ...prev, assetId }));
        }
    };

    const handleLimitSelect = (limitId: string) => {
        const found = creditLimits.find(l => l.limitId === limitId);
        if (found) {
            setFormData(prev => ({
                ...prev,
                limitId,
                contractNo: found.contractNo || prev.contractNo,
                cusId: found.branchCusId || prev.cusId
            }));
        } else {
            setFormData(prev => ({ ...prev, limitId }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const numQty = Number(formData.pledgeQty) || 0;
    const numPrice = Number(formData.price) || 0;
    const numHaircut = Number(formData.haircutRate) || 0;

    const calculatedMarketValue = numQty * numPrice;
    const calculatedCollateralValue = calculatedMarketValue * (1 - numHaircut / 100);

    const handleSubmit = async () => {
        if (!formData.assetId || !formData.cusId || !formData.contractNo || !formData.limitId || !formData.pledgePlace || !formData.pledgeQty || !formData.pledgeDate || !formData.endPledgeDate) {
            notifyError("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
            return;
        }

        if (numQty <= 0) {
            notifyError("Số lượng cầm cố phải lớn hơn 0");
            return;
        }

        if (formData.endPledgeDate < formData.pledgeDate) {
            notifyError("Ngày kết thúc cầm cố phải lớn hơn hoặc bằng Ngày cầm cố");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                pledgeQty: numQty,
                price: numPrice > 0 ? numPrice : null,
                haircutRate: numHaircut >= 0 ? numHaircut : 0,
            };

            const res: any = await apiClient.post(`/v1/capital-source/asset-pledges`, payload);

            if (res?.data?.success || res?.success) {
                notifySuccess("Gán Tài sản bảo đảm thành công");
                if (onSuccess) onSuccess();
                onClose();
            } else {
                notifyError(res?.message || "Lỗi khi lưu TSBĐ");
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || "Lỗi lưu TSBĐ";
            notifyError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Gán Tài sản bảo đảm vào Hạn mức tín dụng"
            size="lg"
        >
            <div className={styles.formContainer}>
                <div className={styles.formGrid}>
                    {/* Mã tài sản */}
                    <div className={styles.formGroup}>
                        <label>Mã tài sản <span className={styles.required}>*</span></label>
                        <select
                            name="assetId"
                            value={formData.assetId}
                            onChange={(e) => handleAssetSelect(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                            <option value="">-- Chọn tài sản từ danh mục --</option>
                            {availableAssets.map(a => {
                                const qty = a.availQuantity ?? a.availableQuantity ?? a.totalQuantity ?? 0;
                                return (
                                    <option key={a.assetId} value={a.assetId}>
                                        {a.assetId} - {a.symbol || a.issuer || a.assetType} (SL khả dụng: {Number(qty).toLocaleString()})
                                    </option>
                                );
                            })}
                        </select>
                        {selectedAsset && (
                            <span style={{ fontSize: '12px', color: '#059669', marginTop: '4px', display: 'block' }}>
                                Số lượng khả dụng: <strong>{Number(selectedAsset.availQuantity ?? selectedAsset.availableQuantity ?? selectedAsset.totalQuantity ?? 0).toLocaleString()}</strong>
                            </span>
                        )}
                    </div>
                    
                    {/* Đối tác tín dụng */}
                    <div className={styles.formGroup}>
                        <label>Đối tác tín dụng <span className={styles.required}>*</span></label>
                        <select
                            name="cusId"
                            value={formData.cusId}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                            <option value="">-- Chọn đối tác tín dụng --</option>
                            {partners.map(p => (
                                <option key={p.id} value={p.branchCusId || p.shortName}>
                                    {p.branchCusId || p.shortName} - {p.cusName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Mã hạn mức */}
                    <div className={styles.formGroup}>
                        <label>Gói hạn mức tín dụng <span className={styles.required}>*</span></label>
                        <select
                            name="limitId"
                            value={formData.limitId}
                            onChange={(e) => handleLimitSelect(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                            <option value="">-- Chọn gói hạn mức --</option>
                            {creditLimits.map(l => (
                                <option key={l.id} value={l.limitId}>
                                    {l.limitId} ({l.contractNo} - {l.poolType})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Số HĐ tín dụng */}
                    <div className={styles.formGroup}>
                        <label>Số HĐ tín dụng <span className={styles.required}>*</span></label>
                        <Input
                            name="contractNo"
                            value={formData.contractNo}
                            onChange={handleChange}
                            placeholder="Số HĐ tín dụng"
                        />
                    </div>
                    
                    {/* Nơi nhận cầm cố */}
                    <div className={styles.formGroup}>
                        <label>Nơi nhận cầm cố <span className={styles.required}>*</span></label>
                        <select
                            name="pledgePlace"
                            value={formData.pledgePlace}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                            <option value="VSDC">Trung tâm Lưu ký Chứng khoán (VSDC)</option>
                            <option value="Ngân hàng lưu ký">Ngân hàng lưu ký</option>
                            <option value="Công ty Chứng khoán">Công ty Chứng khoán</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>

                    {/* Số lượng cầm cố */}
                    <div className={styles.formGroup}>
                        <label>Số lượng cầm cố <span className={styles.required}>*</span></label>
                        <CurrencyInput
                            value={formData.pledgeQty}
                            onChangeValue={(val) => setFormData(prev => ({ ...prev, pledgeQty: val != null ? val.toString() : "" }))}
                            placeholder="Nhập số lượng"
                        />
                    </div>

                    {/* Đơn giá định giá */}
                    <div className={styles.formGroup}>
                        <label>Đơn giá định giá (VND)</label>
                        <CurrencyInput
                            value={formData.price}
                            onChangeValue={(val) => setFormData(prev => ({ ...prev, price: val != null ? val.toString() : "" }))}
                            placeholder="Đơn giá tài sản"
                        />
                    </div>

                    {/* Tỷ lệ Haircut */}
                    <div className={styles.formGroup}>
                        <label>Tỷ lệ Haircut (%)</label>
                        <Input
                            type="number"
                            name="haircutRate"
                            value={formData.haircutRate}
                            onChange={handleChange}
                            placeholder="Tỷ lệ chiết khấu (%)"
                        />
                    </div>

                    {/* Ngày cầm cố */}
                    <div className={styles.formGroup}>
                        <label>Ngày cầm cố <span className={styles.required}>*</span></label>
                        <Input
                            type="date"
                            name="pledgeDate"
                            value={formData.pledgeDate}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Ngày kết thúc cầm cố */}
                    <div className={styles.formGroup}>
                        <label>Ngày kết thúc cầm cố <span className={styles.required}>*</span></label>
                        <Input
                            type="date"
                            name="endPledgeDate"
                            value={formData.endPledgeDate}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Live Value Calculation Card */}
                {calculatedCollateralValue > 0 && (
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px 16px', marginTop: 16 }}>
                        <div style={{ fontWeight: 600, color: '#15803d', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <ShieldCheck size={16} /> GIÁ TRỊ BẢO ĐẢM TĂNG THÊM DỰ KIẾN
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '13px' }}>
                            <div>
                                <span style={{ color: '#4b5563' }}>Giá trị thị trường:</span> <strong>{calculatedMarketValue.toLocaleString('vi-VN')} VND</strong>
                            </div>
                            <div>
                                <span style={{ color: '#4b5563' }}>Giá trị TSBĐ sau Haircut:</span> <strong style={{ color: '#15803d', fontSize: '15px' }}>+{calculatedCollateralValue.toLocaleString('vi-VN')} VND</strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                    <div className={styles.formGroup}>
                        <label>Số HĐ / Thỏa thuận cầm cố</label>
                        <Input
                            name="pledgeContractNo"
                            value={formData.pledgeContractNo}
                            onChange={handleChange}
                            placeholder="Số HĐ / Thỏa thuận cầm cố"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Chứng từ đính kèm (URL)</label>
                        <Input
                            name="fileUrl"
                            value={formData.fileUrl}
                            onChange={handleChange}
                            placeholder="Link chứng từ"
                        />
                    </div>
                </div>

                <div className={styles.formGroup} style={{ marginTop: 12 }}>
                    <label>Ghi chú</label>
                    <Input
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="Nhập ghi chú"
                    />
                </div>

                <div className={styles.formActions} style={{ marginTop: 20 }}>
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
                    <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
                        <Plus size={16} style={{ marginRight: 6 }} /> Gán TSBĐ
                    </Button>
                </div>
            </div>
        </Modal>
    );
}