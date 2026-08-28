"use client";

import { useState, useEffect, useMemo } from "react";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import styles from "./AssetCatalogFormModal.module.css";
import Button from "@/components/shared/Button/Button";
import Input from "@/components/shared/Input/Input";
import CurrencyInput from "@/components/shared/Input/CurrencyInput";
import Modal from "@/components/shared/Modal/Modal";
import { ShieldAlert, AlertTriangle, CheckCircle, FileText } from "lucide-react";

interface ReleaseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    pledgeId: number;
    pledgeData?: any;
    onSuccess?: () => void;
}

export default function ReleaseFormModal({ isOpen, onClose, pledgeId, pledgeData, onSuccess }: ReleaseFormModalProps) {
    const { notifyError, notifySuccess } = useNotification();
    const [pledge, setPledge] = useState<any>(pledgeData || null);
    const [loadingPledge, setLoadingPledge] = useState(false);

    const [releaseQty, setReleaseQty] = useState("");
    const [reason, setReason] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [note, setNote] = useState("");
    
    // Exception approval
    const [isExceptionApproved, setIsExceptionApproved] = useState(false);
    const [exceptionApprover, setExceptionApprover] = useState("");
    const [exceptionReason, setExceptionReason] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && pledgeId) {
            const fetchPledgeDetail = async () => {
                setLoadingPledge(true);
                try {
                    const res: any = await apiClient.get(`/v1/capital-source/asset-pledges/${pledgeId}`);
                    if (res?.data?.success && res?.data?.data) {
                        setPledge(res.data.data);
                    } else if (res?.success && res?.data) {
                        setPledge(res.data);
                    }
                } catch (error) {
                    console.error("Failed to load pledge detail", error);
                } finally {
                    setLoadingPledge(false);
                }
            };
            fetchPledgeDetail();
        }
    }, [isOpen, pledgeId]);

    const remainingQty = useMemo(() => {
        if (!pledge) return 0;
        const total = Number(pledge.pledgeQty) || 0;
        const released = Number(pledge.releasedQty) || 0;
        return Math.max(0, total - released);
    }, [pledge]);

    const numReleaseQty = Number(releaseQty) || 0;
    const price = Number(pledge?.price) || 0;
    const haircutRate = Number(pledge?.haircutRate) || 0;

    const estimatedReleaseValue = useMemo(() => {
        if (numReleaseQty <= 0 || price <= 0) return 0;
        const marketVal = numReleaseQty * price;
        const collateralVal = marketVal * (1 - haircutRate / 100);
        return collateralVal;
    }, [numReleaseQty, price, haircutRate]);

    const isQtyExceeded = numReleaseQty > remainingQty;

    const handleSubmit = async () => {
        if (numReleaseQty <= 0) {
            notifyError("Vui lòng nhập số lượng giải tỏa lớn hơn 0");
            return;
        }

        if (isQtyExceeded) {
            notifyError(`Số lượng giải tỏa không được vượt quá số lượng còn lại đang cầm cố (${remainingQty.toLocaleString()} CP/TP)`);
            return;
        }

        if (isExceptionApproved && (!exceptionApprover.trim() || !exceptionReason.trim())) {
            notifyError("Vui lòng nhập đầy đủ Người phê duyệt ngoại lệ và Lý do ngoại lệ");
            return;
        }

        setIsSubmitting(true);
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const payload = {
                releaseQty: numReleaseQty,
                releaseDate: todayStr,
                reason: reason.trim() || "Giải tỏa tài sản bảo đảm",
                fileUrl: fileUrl.trim(),
                note: note.trim(),
                isExceptionApproved,
                exceptionApprover: isExceptionApproved ? exceptionApprover.trim() : null,
                exceptionReason: isExceptionApproved ? exceptionReason.trim() : null
            };

            const res: any = await apiClient.post(`/v1/capital-source/asset-pledges/${pledgeId}/releases`, payload);

            if (res?.data?.success || res?.success) {
                notifySuccess("Tạo yêu cầu giải tỏa TSĐB thành công");
                if (onSuccess) onSuccess();
                onClose();
            } else {
                notifyError(res?.message || "Lỗi khi tạo yêu cầu giải tỏa");
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || "Lỗi lưu giải tỏa";
            notifyError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Giải tỏa Tài sản bảo đảm"
            size="lg"
        >
            <div className={styles.formContainer}>
                {/* Overview Box */}
                {pledge && (
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                        <div style={{ fontWeight: 600, color: '#1e3a8a', marginBottom: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FileText size={16} /> THÔNG TIN HỢP ĐỒNG CẦM CỐ HIỆN TẠI
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
                            <div>
                                <span style={{ color: '#64748b' }}>Mã tài sản:</span> <strong>{pledge.assetId}</strong>
                            </div>
                            <div>
                                <span style={{ color: '#64748b' }}>Đối tác tín dụng:</span> <strong>{pledge.cusId || '-'}</strong>
                            </div>
                            <div>
                                <span style={{ color: '#64748b' }}>Số HĐ / Hạn mức:</span> <strong>{pledge.contractNo || pledge.limitId || '-'}</strong>
                            </div>
                            <div>
                                <span style={{ color: '#64748b' }}>SL cầm cố ban đầu:</span> <strong>{Number(pledge.pledgeQty || 0).toLocaleString()}</strong>
                            </div>
                            <div>
                                <span style={{ color: '#64748b' }}>Đã giải tỏa:</span> <span style={{ color: '#dc2626', fontWeight: 600 }}>{Number(pledge.releasedQty || 0).toLocaleString()}</span>
                            </div>
                            <div>
                                <span style={{ color: '#64748b' }}>SL đang cầm cố còn lại:</span> <span style={{ color: '#16a34a', fontWeight: 700 }}>{remainingQty.toLocaleString()}</span>
                            </div>
                            <div>
                                <span style={{ color: '#64748b' }}>Đơn giá định giá:</span> <strong>{price.toLocaleString()} VND</strong>
                            </div>
                            <div>
                                <span style={{ color: '#64748b' }}>Tỷ lệ Haircut:</span> <strong>{haircutRate}%</strong>
                            </div>
                            <div>
                                <span style={{ color: '#64748b' }}>Nơi cầm cố:</span> <strong>{pledge.pledgePlace || '-'}</strong>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.formGrid}>
                    {/* Số lượng giải tỏa */}
                    <div className={styles.formGroup}>
                        <label>Số lượng giải tỏa <span className={styles.required}>*</span> (Tối đa: {remainingQty.toLocaleString()})</label>
                        <CurrencyInput
                            value={releaseQty}
                            onChangeValue={(val) => setReleaseQty(val != null ? val.toString() : "")}
                            placeholder="Nhập số lượng giải tỏa"
                        />
                        {isQtyExceeded && (
                            <span style={{ color: '#dc2626', fontSize: '12px', marginTop: 4 }}>
                                Số lượng giải tỏa vượt quá số lượng còn lại ({remainingQty.toLocaleString()})
                            </span>
                        )}
                    </div>

                    {/* Giá trị giải tỏa quy đổi */}
                    <div className={styles.formGroup}>
                        <label>Giá trị TSBĐ giải tỏa ước tính (VND)</label>
                        <div style={{ 
                            padding: '9px 12px', 
                            backgroundColor: '#eff6ff', 
                            border: '1px solid #bfdbfe', 
                            borderRadius: '6px', 
                            fontWeight: 700, 
                            color: '#1d4ed8',
                            fontSize: '15px'
                        }}>
                            {estimatedReleaseValue > 0 ? estimatedReleaseValue.toLocaleString('vi-VN') + ' VND' : '0 VND'}
                        </div>
                        <span style={{ color: '#64748b', fontSize: '11px', marginTop: 2 }}>
                            (Tự động tính: SL × Đơn giá × (100% - Haircut))
                        </span>
                    </div>

                    {/* Lý do giải tỏa */}
                    <div className={styles.formGroup}>
                        <label>Lý do giải tỏa <span className={styles.required}>*</span></label>
                        <select 
                            className={styles.select || 'form-select'}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                            <option value="">-- Chọn lý do giải tỏa --</option>
                            <option value="Đã tất toán dư nợ khế ước vay">Đã tất toán dư nợ khế ước vay</option>
                            <option value="Bổ sung tài sản bảo đảm thay thế">Bổ sung tài sản bảo đảm thay thế</option>
                            <option value="Điều chỉnh giảm hạn mức vay tín dụng">Điều chỉnh giảm hạn mức vay tín dụng</option>
                            <option value="Giải tỏa theo thỏa thuận với ngân hàng">Giải tỏa theo thỏa thuận với ngân hàng</option>
                            <option value="Lý do khác">Lý do khác</option>
                        </select>
                    </div>

                    {/* Chứng từ đính kèm */}
                    <div className={styles.formGroup}>
                        <label>Chứng từ / File đính kèm</label>
                        <Input
                            value={fileUrl}
                            onChange={(e) => setFileUrl(e.target.value)}
                            placeholder="Nhập link file chứng từ giải tỏa (URL)"
                        />
                    </div>
                </div>

                {/* Ghi chú */}
                <div className={styles.formGroup} style={{ marginTop: 12 }}>
                    <label>Ghi chú chi tiết</label>
                    <Input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Nhập ghi chú thêm nếu có"
                    />
                </div>

                {/* Khối Cảnh báo & Phê duyệt ngoại lệ */}
                <div style={{ 
                    marginTop: 16, 
                    padding: '14px 16px', 
                    backgroundColor: isExceptionApproved ? '#fffbeb' : '#f8fafc', 
                    border: isExceptionApproved ? '1px solid #fde68a' : '1px solid #e2e8f0', 
                    borderRadius: '8px' 
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, color: isExceptionApproved ? '#b45309' : '#334155' }}>
                        <input 
                            type="checkbox" 
                            checked={isExceptionApproved}
                            onChange={(e) => setIsExceptionApproved(e.target.checked)}
                            style={{ width: 16, height: 16, cursor: 'pointer' }}
                        />
                        <ShieldAlert size={18} color={isExceptionApproved ? '#b45309' : '#64748b'} />
                        Áp dụng Phê duyệt ngoại lệ (Cho phép giải tỏa ngay cả khi Hạn mức sau giải tỏa &lt; Dư nợ)
                    </label>

                    {isExceptionApproved && (
                        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className={styles.formGroup}>
                                <label style={{ fontSize: '12px' }}>Người phê duyệt ngoại lệ <span className={styles.required}>*</span></label>
                                <Input 
                                    placeholder="Họ tên / Chức vụ người duyệt"
                                    value={exceptionApprover}
                                    onChange={(e) => setExceptionApprover(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label style={{ fontSize: '12px' }}>Lý do phê duyệt ngoại lệ <span className={styles.required}>*</span></label>
                                <Input 
                                    placeholder="Lý do cấp thẩm quyền phê duyệt"
                                    value={exceptionReason}
                                    onChange={(e) => setExceptionReason(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className={styles.formActions} style={{ marginTop: 20 }}>
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSubmit} 
                        isLoading={isSubmitting}
                        disabled={numReleaseQty <= 0 || isQtyExceeded}
                    >
                        Tạo yêu cầu giải tỏa
                    </Button>
                </div>
            </div>
        </Modal>
    );
}