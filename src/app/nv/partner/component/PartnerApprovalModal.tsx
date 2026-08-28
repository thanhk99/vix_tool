'use client';

import { useState, useEffect } from 'react';
import { PartnersItem } from '@/types/funding.types';
import apiClient from '@/lib/api/client';
import { useNotification } from '@/hooks/useNotification';
import { X, Check, AlertCircle } from 'lucide-react';
import styles from './PartnerApprovalModal.module.css';

interface PartnerApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    partner: PartnersItem | null;
    onSuccess: () => void;
}

interface ChangeHistoryRow {
    fieldName: string;
    oldValue: string;
    newValue: string;
    updatedAt: string;
    updatedBy: string;
}

export default function PartnerApprovalModal({
    isOpen,
    onClose,
    partner,
    onSuccess
}: PartnerApprovalModalProps) {
    const { notifyError, notifySuccess, notifyWarning } = useNotification();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [historyRows, setHistoryRows] = useState<ChangeHistoryRow[]>([]);
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const statusUpper = String(partner?.status || '').trim().toUpperCase();
    const isPendingDelete = ['PENDING_DELETE', 'CHO_DUYET_XOA', 'CHỜ DUYỆT XOÁ', 'CHỜ DUYỆT XÓA'].includes(statusUpper);

    useEffect(() => {
        if (!isOpen || !partner) {
            setShowRejectInput(false);
            setRejectReason('');
            setHistoryRows([]);
            return;
        }

        const buildChangeHistory = async () => {
            try {
                setLoading(true);
                const formatTime = (timeStr?: string) => {
                    if (!timeStr) return new Date().toLocaleDateString('vi-VN');
                    try {
                        const d = new Date(timeStr);
                        if (!isNaN(d.getTime())) {
                            return d.toLocaleDateString('vi-VN');
                        }
                    } catch (e) {}
                    return String(timeStr);
                };

                const userStr = partner.updatedBy || partner.createdBy || 'user';
                const timeStr = formatTime(partner.lastUpdated || (partner as any).createdAt);

                // Check for baseline snapshot from partner.changeReason (database) or localStorage
                let snapshot: any = null;
                if (partner.changeReason && typeof partner.changeReason === 'string' && partner.changeReason.startsWith('{')) {
                    try {
                        snapshot = JSON.parse(partner.changeReason);
                    } catch (e) {}
                }
                if (!snapshot && typeof window !== 'undefined') {
                    const snapshotStr = localStorage.getItem(`partner_snapshot_${partner.id}`);
                    if (snapshotStr) {
                        try {
                            snapshot = JSON.parse(snapshotStr);
                        } catch (e) {}
                    }
                }

                // Build comparison rows for Partner's fields
                const rows: ChangeHistoryRow[] = [];

                const addRow = (label: string, oldVal: any, newVal: any) => {
                    const normalize = (v: any) => {
                        if (v === null || v === undefined) return '-';
                        const str = String(v).trim();
                        return (str === '' || str === 'null' || str === 'undefined') ? '-' : str;
                    };

                    const strOld = normalize(oldVal);
                    const strNew = normalize(newVal);

                    // Bỏ qua nếu cả 2 đều không có dữ liệu
                    if (strOld === '-' && strNew === '-') return;

                    // Đối với trường hợp SỬA: CHỈ hiển thị những dòng thực sự có thay đổi (giá trị cũ khác giá trị mới)
                    if (snapshot && !isPendingDelete) {
                        if (strOld === strNew) return;
                    }

                    rows.push({
                        fieldName: label,
                        oldValue: strOld,
                        newValue: strNew,
                        updatedAt: timeStr,
                        updatedBy: userStr
                    });
                };

                if (isPendingDelete) {
                    // XÓA: Giá trị cũ = giá trị gốc, Giá trị mới = trống
                    addRow('Mã khách hàng', partner.cusId, '');
                    addRow('Mã đơn vị GD', partner.branchCusId, '');
                    addRow('Tên khách hàng', partner.cusName, '');
                    if (partner.shortName) addRow('Tên viết tắt', partner.shortName, '');
                    addRow('Số ĐKKD / CCCD', partner.idCode, '');
                    if (partner.fistIssueDate) addRow('Ngày cấp lần đầu', formatTime(partner.fistIssueDate), '');
                    if (partner.lastIssueDate) addRow('Ngày cấp cuối', formatTime(partner.lastIssueDate), '');
                    if (partner.issueBy) addRow('Nơi cấp', partner.issueBy, '');
                    if (partner.opLiscenseNo) addRow('Số GP hoạt động', partner.opLiscenseNo, '');
                    if (partner.opIssueDate) addRow('Ngày cấp GP', formatTime(partner.opIssueDate), '');
                    if (partner.address) addRow('Địa chỉ', partner.address, '');
                    if (partner.mobile) addRow('Số điện thoại', partner.mobile, '');
                    if (partner.email) addRow('Email', partner.email, '');
                    if (partner.website) addRow('Website', partner.website, '');
                    if (partner.cusType) addRow('Loại hình khách hàng', partner.cusType, '');
                    if (partner.businessType) addRow('Loại hình kinh doanh', partner.businessType, '');
                    if (partner.professionalInvestor !== undefined) {
                        addRow('Nhà đầu tư chuyên nghiệp', partner.professionalInvestor ? 'Có' : 'Không', '');
                    }
                    if (partner.depositoryMemberCode) addRow('Mã TVLK (VSDC Code)', partner.depositoryMemberCode, '');
                    if (partner.tradingGateway) addRow('Nơi mở', partner.tradingGateway, '');
                    if (partner.generalNote) addRow('Ghi chú', partner.generalNote, '');
                } else if (snapshot) {
                    // SỬA: Giá trị cũ = giá trị gốc trước khi sửa, Giá trị mới = giá trị thay đổi
                    addRow('Mã khách hàng', snapshot.cusId, partner.cusId);
                    addRow('Mã đơn vị GD', snapshot.branchCusId, partner.branchCusId);
                    addRow('Tên khách hàng', snapshot.cusName, partner.cusName);
                    if (snapshot.shortName || partner.shortName) addRow('Tên viết tắt', snapshot.shortName, partner.shortName);
                    addRow('Số ĐKKD / CCCD', snapshot.idCode, partner.idCode);
                    if (snapshot.fistIssueDate || partner.fistIssueDate) addRow('Ngày cấp lần đầu', formatTime(snapshot.fistIssueDate), formatTime(partner.fistIssueDate));
                    if (snapshot.lastIssueDate || partner.lastIssueDate) addRow('Ngày cấp cuối', formatTime(snapshot.lastIssueDate), formatTime(partner.lastIssueDate));
                    if (snapshot.issueBy || partner.issueBy) addRow('Nơi cấp', snapshot.issueBy, partner.issueBy);
                    if (snapshot.opLiscenseNo || partner.opLiscenseNo) addRow('Số GP hoạt động', snapshot.opLiscenseNo, partner.opLiscenseNo);
                    if (snapshot.opIssueDate || partner.opIssueDate) addRow('Ngày cấp GP', formatTime(snapshot.opIssueDate), formatTime(partner.opIssueDate));
                    if (snapshot.address || partner.address) addRow('Địa chỉ', snapshot.address, partner.address);
                    if (snapshot.mobile || partner.mobile) addRow('Số điện thoại', snapshot.mobile, partner.mobile);
                    if (snapshot.email || partner.email) addRow('Email', snapshot.email, partner.email);
                    if (snapshot.website || partner.website) addRow('Website', snapshot.website, partner.website);
                    if (snapshot.cusType || partner.cusType) addRow('Loại hình khách hàng', snapshot.cusType, partner.cusType);
                    if (snapshot.businessType || partner.businessType) addRow('Loại hình kinh doanh', snapshot.businessType, partner.businessType);
                    if (snapshot.professionalInvestor !== undefined || partner.professionalInvestor !== undefined) {
                        addRow('Nhà đầu tư chuyên nghiệp', 
                            snapshot.professionalInvestor !== undefined ? (snapshot.professionalInvestor ? 'Có' : 'Không') : '-', 
                            partner.professionalInvestor !== undefined ? (partner.professionalInvestor ? 'Có' : 'Không') : '-'
                        );
                    }
                    if (snapshot.depositoryMemberCode || partner.depositoryMemberCode) addRow('Mã TVLK (VSDC Code)', snapshot.depositoryMemberCode, partner.depositoryMemberCode);
                    if (snapshot.tradingGateway || partner.tradingGateway) addRow('Nơi mở', snapshot.tradingGateway, partner.tradingGateway);
                    if (snapshot.generalNote || partner.generalNote) addRow('Ghi chú', snapshot.generalNote, partner.generalNote);
                } else {
                    // THÊM MỚI: Giá trị cũ = trống, Giá trị mới = giá trị thay đổi
                    addRow('Mã khách hàng', '', partner.cusId);
                    addRow('Mã đơn vị GD', '', partner.branchCusId);
                    addRow('Tên khách hàng', '', partner.cusName);
                    if (partner.shortName) addRow('Tên viết tắt', '', partner.shortName);
                    addRow('Số ĐKKD / CCCD', '', partner.idCode);
                    if (partner.fistIssueDate) addRow('Ngày cấp lần đầu', '', formatTime(partner.fistIssueDate));
                    if (partner.lastIssueDate) addRow('Ngày cấp cuối', '', formatTime(partner.lastIssueDate));
                    if (partner.issueBy) addRow('Nơi cấp', '', partner.issueBy);
                    if (partner.opLiscenseNo) addRow('Số GP hoạt động', '', partner.opLiscenseNo);
                    if (partner.opIssueDate) addRow('Ngày cấp GP', '', formatTime(partner.opIssueDate));
                    if (partner.address) addRow('Địa chỉ', '', partner.address);
                    if (partner.mobile) addRow('Số điện thoại', '', partner.mobile);
                    if (partner.email) addRow('Email', '', partner.email);
                    if (partner.website) addRow('Website', '', partner.website);
                    if (partner.cusType) addRow('Loại hình khách hàng', '', partner.cusType);
                    if (partner.businessType) addRow('Loại hình kinh doanh', '', partner.businessType);
                    if (partner.professionalInvestor !== undefined) {
                        addRow('Nhà đầu tư chuyên nghiệp', '', partner.professionalInvestor ? 'Có' : 'Không');
                    }
                    if (partner.depositoryMemberCode) addRow('Mã TVLK (VSDC Code)', '', partner.depositoryMemberCode);
                    if (partner.tradingGateway) addRow('Nơi mở', '', partner.tradingGateway);
                    if (partner.generalNote) addRow('Ghi chú', '', partner.generalNote);
                }

                // Sub-items
                try {
                    const [authRes, bankRes, contactRes] = await Promise.allSettled([
                        apiClient.get(`/v1/capital-source/partners/${partner.id}/authorizations?page=0&size=100`),
                        apiClient.get(`/v1/capital-source/partners/${partner.id}/bank-accounts?page=0&size=100`),
                        apiClient.get(`/v1/capital-source/partners/${partner.id}/contacts?page=0&size=100`)
                    ]);

                    if (authRes.status === 'fulfilled') {
                        const payload = (authRes.value as any)?.data?.data || (authRes.value as any)?.data || (authRes.value as any);
                        const list = payload?.content || (Array.isArray(payload) ? payload : []);
                        if (list.length > 0) {
                            const repCount = list.filter((a: any) => a.authType === 'LEGAL_REP').length;
                            const uqCount = list.filter((a: any) => a.authType === 'AUTHORIZATION').length;
                            if (repCount > 0) {
                                const oldRep = snapshot ? (snapshot.legalRepsCount !== undefined ? `${snapshot.legalRepsCount} người đại diện` : '-') : (isPendingDelete ? `${repCount} người đại diện` : '-');
                                const newRep = isPendingDelete ? '-' : `${repCount} người đại diện`;
                                addRow('Người đại diện pháp luật', oldRep, newRep);
                            }
                            if (uqCount > 0) {
                                const oldUq = snapshot ? (snapshot.authsCount !== undefined ? `${snapshot.authsCount} giấy ủy quyền` : '-') : (isPendingDelete ? `${uqCount} giấy ủy quyền` : '-');
                                const newUq = isPendingDelete ? '-' : `${uqCount} giấy ủy quyền`;
                                addRow('Giấy ủy quyền', oldUq, newUq);
                            }
                        }
                    }

                    if (bankRes.status === 'fulfilled') {
                        const payload = (bankRes.value as any)?.data?.data || (bankRes.value as any)?.data || (bankRes.value as any);
                        const list = payload?.content || (Array.isArray(payload) ? payload : []);
                        if (list.length > 0) {
                            const oldBank = snapshot ? (snapshot.bankAccountsCount !== undefined ? `${snapshot.bankAccountsCount} tài khoản` : '-') : (isPendingDelete ? `${list.length} tài khoản` : '-');
                            const newBank = isPendingDelete ? '-' : `${list.length} tài khoản`;
                            addRow('Tài khoản ngân hàng', oldBank, newBank);
                        }
                    }

                    if (contactRes.status === 'fulfilled') {
                        const payload = (contactRes.value as any)?.data?.data || (contactRes.value as any)?.data || (contactRes.value as any);
                        const list = payload?.content || (Array.isArray(payload) ? payload : []);
                        if (list.length > 0) {
                            const oldContact = snapshot ? (snapshot.contactsCount !== undefined ? `${snapshot.contactsCount} người liên hệ` : '-') : (isPendingDelete ? `${list.length} người liên hệ` : '-');
                            const newContact = isPendingDelete ? '-' : `${list.length} người liên hệ`;
                            addRow('Người liên hệ', oldContact, newContact);
                        }
                    }
                } catch (e) {
                    console.error("Lỗi lấy thông tin sub-items đối tác:", e);
                }

                setHistoryRows(rows);
            } catch (err) {
                console.error("Lỗi chuẩn bị lịch sử thay đổi:", err);
            } finally {
                setLoading(false);
            }
        };

        buildChangeHistory();
    }, [isOpen, partner, isPendingDelete]);

    if (!isOpen || !partner) return null;

    const handleApprove = async () => {
        try {
            setSubmitting(true);
            if (isPendingDelete) {
                await apiClient.put(`/v1/capital-source/partners/${partner.id}/approve-delete`, {});
                notifySuccess("Thành công", "Đã phê duyệt xóa đối tác thành công");
            } else {
                await apiClient.put(`/v1/capital-source/partners/${partner.id}/approve`, {});
                notifySuccess("Thành công", "Phê duyệt đối tác thành công");
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`partner_snapshot_${partner.id}`, JSON.stringify(partner));
                }
            }
            onSuccess();
            onClose();
        } catch (e: any) {
            notifyError("Lỗi", e.response?.data?.message || "Không thể phê duyệt đối tác");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!showRejectInput) {
            setShowRejectInput(true);
            return;
        }

        if (!rejectReason.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập lý do từ chối!");
            return;
        }

        try {
            setSubmitting(true);
            let snapshot: any = null;
            if (partner.changeReason && typeof partner.changeReason === 'string' && partner.changeReason.startsWith('{')) {
                try {
                    snapshot = JSON.parse(partner.changeReason);
                } catch (e) {}
            }
            if (!snapshot && typeof window !== 'undefined') {
                const snapshotStr = localStorage.getItem(`partner_snapshot_${partner.id}`);
                if (snapshotStr) {
                    try {
                        snapshot = JSON.parse(snapshotStr);
                    } catch (e) {}
                }
            }

            const isEdit = snapshot !== null;
            if (isPendingDelete) {
                await apiClient.put(`/v1/capital-source/partners/${partner.id}/reject-delete`, { reason: rejectReason.trim() });
                notifySuccess("Thành công", "Đã từ chối yêu cầu xóa đối tác (giữ nguyên trạng thái Hoạt động)");
            } else if (isEdit) {
                await apiClient.put(`/v1/capital-source/partners/${partner.id}/reject`, { 
                    reason: rejectReason.trim(),
                    snapshot: snapshot
                });
                notifySuccess("Thành công", "Đã từ chối chỉnh sửa (khôi phục dữ liệu gốc và đưa về trạng thái Hoạt động)");
            } else {
                await apiClient.put(`/v1/capital-source/partners/${partner.id}/reject`, { reason: rejectReason.trim() });
                notifySuccess("Thành công", "Đã từ chối đối tác (chuyển sang Hủy bỏ)");
            }
            onSuccess();
            onClose();
        } catch (e: any) {
            notifyError("Lỗi", e.response?.data?.message || "Không thể từ chối đối tác");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h3>
                        <Check size={18} color="#16a34a" /> {isPendingDelete ? 'Phê duyệt yêu cầu xóa đối tác' : 'Phê duyệt đối tác'}
                    </h3>
                    <button className={styles.closeBtn} onClick={onClose} title="Đóng">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className={styles.modalBody}>
                    <div className={styles.infoBanner}>
                        <div><strong>Mã đối tác:</strong> {partner.cusId || '-'}</div>
                        <div><strong>Tên đối tác:</strong> {partner.cusName || '-'}</div>
                        <div><strong>Số ĐKKD/CCCD:</strong> {partner.idCode || '-'}</div>
                        <div>
                            <strong>Trạng thái:</strong>{' '}
                            <span style={{ 
                                color: isPendingDelete ? '#dc2626' : '#d97706', 
                                fontWeight: 600,
                                backgroundColor: isPendingDelete ? '#fee2e2' : '#fef3c7',
                                padding: '2px 8px',
                                borderRadius: '4px'
                            }}>
                                {isPendingDelete ? 'Chờ duyệt xoá' : 'Chờ duyệt'}
                            </span>
                        </div>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '10px' }}>
                        Lịch sử thay đổi dữ liệu {isPendingDelete ? 'cần duyệt xóa' : 'cần phê duyệt'} ({historyRows.length})
                    </h4>

                    <div className={styles.tableContainer}>
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th style={{ width: '45px', textAlign: 'center' }}>STT</th>
                                    <th style={{ width: '220px' }}>Tên cột / Trường dữ liệu</th>
                                    <th>Giá trị cũ</th>
                                    <th>Giá trị mới</th>
                                    <th style={{ width: '110px' }}>Thời gian</th>
                                    <th style={{ width: '130px' }}>Người tạo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : historyRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                                            Không có thông tin thay đổi
                                        </td>
                                    </tr>
                                ) : (
                                    historyRows.map((row, idx) => (
                                        <tr key={idx}>
                                            <td style={{ textAlign: 'center', color: '#6b7280' }}>{idx + 1}</td>
                                            <td className={styles.fieldName}>{row.fieldName}</td>
                                            <td className={styles.oldValue}>{row.oldValue}</td>
                                            <td className={styles.newValue}>{row.newValue}</td>
                                            <td>{row.updatedAt}</td>
                                            <td>{row.updatedBy}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Dialog / Input Lý do từ chối */}
                    {showRejectInput && (
                        <div className={styles.rejectDialog}>
                            <label>
                                <AlertCircle size={15} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
                                Nhập lý do từ chối <span style={{ color: 'red' }}>*</span>:
                            </label>
                            <textarea
                                className={styles.rejectTextarea}
                                placeholder="Nhập chi tiết lý do từ chối hồ sơ đối tác..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                autoFocus
                            />
                            <div className={styles.rejectActions}>
                                <button
                                    type="button"
                                    className={`${styles.btnAction} ${styles.btnClose}`}
                                    onClick={() => setShowRejectInput(false)}
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.btnAction} ${styles.btnReject}`}
                                    onClick={handleReject}
                                    disabled={submitting}
                                    style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                                >
                                    {submitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.modalFooter}>
                    <button
                        type="button"
                        className={`${styles.btnAction} ${styles.btnClose}`}
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Đóng
                    </button>
                    {!showRejectInput && (
                        <button
                            type="button"
                            className={`${styles.btnAction} ${styles.btnReject}`}
                            onClick={handleReject}
                            disabled={submitting}
                        >
                            Từ chối
                        </button>
                    )}
                    <button
                        type="button"
                        className={`${styles.btnAction} ${styles.btnApprove}`}
                        onClick={handleApprove}
                        disabled={submitting}
                    >
                        {submitting ? 'Đang duyệt...' : 'Duyệt'}
                    </button>
                </div>
            </div>
        </div>
    );
}
