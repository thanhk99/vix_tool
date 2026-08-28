'use client';

import Input from "@/components/shared/Input/Input";
import Select from "@/components/shared/Select/Select";
import { AuthorizationItem, CreateAuthorization } from "@/types/funding.types";
import { useEffect, useState } from "react";
import styles from "./AuthorizationForm.module.css";
import { useNotification } from "@/hooks/useNotification";
import { X, Save } from "lucide-react";

interface AuthorizationFormProps {
    existingAuths?: AuthorizationItem[];
    legalReps?: AuthorizationItem[];
    onSubmit: (data: CreateAuthorization) => void;
    onClose?: () => void;
    nextSeqId?: number;
    authType: 'LEGAL_REP' | 'AUTHORIZATION';
}

export default function AuthorizationForm({
    onSubmit,
    onClose,
    nextSeqId = 1,
    existingAuths = [],
    legalReps = [],
    authType
}: AuthorizationFormProps) {
    const { notifyError, notifyWarning } = useNotification();

    const todayStr = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState<CreateAuthorization>({
        seqId: nextSeqId,
        authType: authType,
        parentAuthId: "",
        authName: "",
        authPosition: "",
        authidNo: "",
        authissueDate: "",
        issuePlace: "",
        authedName: "",
        authedIdNo: "",
        authedIssueDate: "",
        authedIssuePlace: "",
        authedPosition: "",
        authNo: "",
        effDate: "",
        expiryDate: "",
        scope: "",
        note: "",
        phone: "",
        email: "",
        status: "ACTIVE"
    });

    const [selectedRepId, setSelectedRepId] = useState<string>("");

    // Initial setup on mount or props change
    useEffect(() => {
        if (authType === 'AUTHORIZATION' && nextSeqId === 1) {
            // Level 1: Automatically pull legal representative
            const rep = legalReps.length > 0 ? legalReps[0] : null;
            if (rep) {
                setSelectedRepId(rep.id);
                setFormData(prev => ({
                    ...prev,
                    seqId: 1,
                    authType: 'AUTHORIZATION',
                    parentAuthId: rep.id,
                    authName: rep.authName || "",
                    authidNo: rep.authidNo || "",
                    authissueDate: rep.authissueDate || "",
                    issuePlace: rep.issuePlace || "",
                    authPosition: rep.authPosition || "",
                    status: "ACTIVE"
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    seqId: 1,
                    authType: 'AUTHORIZATION',
                    status: "ACTIVE"
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                seqId: nextSeqId,
                authType: authType,
                status: "ACTIVE"
            }));
        }
    }, [nextSeqId, authType, legalReps]);

    const handleSelectLegalRep = (repId: string) => {
        setSelectedRepId(repId);
        const rep = legalReps.find(r => r.id === repId);
        if (rep) {
            setFormData(prev => ({
                ...prev,
                parentAuthId: rep.id,
                authName: rep.authName || "",
                authidNo: rep.authidNo || "",
                authissueDate: rep.authissueDate || "",
                issuePlace: rep.issuePlace || "",
                authPosition: rep.authPosition || ""
            }));
        }
    };

    const handleParentChange = (parentId: string) => {
        const parent = existingAuths.find(a => a.id === parentId);
        if (parent) {
            const pName = parent.authedName || parent.authName;
            const pIdNo = parent.authedIdNo || parent.authidNo;
            const pIssueDate = parent.authedIssueDate || parent.authissueDate;
            const pIssuePlace = parent.authedIssuePlace || parent.issuePlace;
            const pPos = parent.authedPosition || parent.authPosition;
            setFormData(prev => ({
                ...prev,
                parentAuthId: parentId,
                authName: pName || "",
                authidNo: pIdNo || "",
                authissueDate: pIssueDate || "",
                issuePlace: pIssuePlace || "",
                authPosition: pPos || ""
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                parentAuthId: "",
                authName: "",
                authidNo: "",
                authissueDate: "",
                issuePlace: "",
                authPosition: ""
            }));
        }
    };

    const handleChange = (field: keyof CreateAuthorization, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (authType === 'LEGAL_REP') {
            if (!formData.authName?.trim()) {
                notifyWarning("Cảnh báo", "Vui lòng nhập Tên người đại diện!");
                return false;
            }
            if (!formData.authidNo?.trim()) {
                notifyWarning("Cảnh báo", "Vui lòng nhập Số CCCD!");
                return false;
            }
            if (!/^\d{12}$/.test(formData.authidNo.trim())) {
                notifyError("Lỗi", "Số CCCD phải gồm đúng 12 chữ số!");
                return false;
            }
            if (!formData.authissueDate) {
                notifyWarning("Cảnh báo", "Vui lòng chọn Ngày cấp CCCD!");
                return false;
            }
            if (new Date(formData.authissueDate) > today) {
                notifyError("Lỗi", "Ngày cấp CCCD không được lớn hơn ngày hiện tại!");
                return false;
            }
            if (!formData.issuePlace?.trim()) {
                notifyWarning("Cảnh báo", "Vui lòng nhập Nơi cấp!");
                return false;
            }
            if (!formData.authPosition?.trim()) {
                notifyWarning("Cảnh báo", "Vui lòng nhập Chức vụ!");
                return false;
            }

            // Rule: CCCD không được trùng với thông tin đã có trong danh sách người đại diện pháp luật
            const isDuplicate = existingAuths.some(
                a => a.authType === 'LEGAL_REP' && a.authidNo?.trim() === formData.authidNo?.trim()
            );
            if (isDuplicate) {
                notifyError("Lỗi", "Số CCCD này đã tồn tại trong danh sách Người đại diện pháp luật!");
                return false;
            }

            return true;
        }

        // AUTHORIZATION mode
        if (nextSeqId === 1 && legalReps.length === 0 && !formData.authName?.trim()) {
            notifyWarning("Cảnh báo", "Chưa có Người đại diện pháp luật để tạo Ủy quyền cấp 1. Vui lòng thêm Người đại diện pháp luật trước!");
            return false;
        }

        if (!formData.authName?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Tên người ủy quyền!");
            return false;
        }
        if (!formData.authidNo?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập CCCD người ủy quyền!");
            return false;
        }
        if (!/^\d{12}$/.test(formData.authidNo.trim())) {
            notifyError("Lỗi", "CCCD người ủy quyền phải gồm 12 chữ số!");
            return false;
        }
        if (!formData.authissueDate) {
            notifyWarning("Cảnh báo", "Vui lòng chọn Ngày cấp CCCD người ủy quyền!");
            return false;
        }
        if (new Date(formData.authissueDate) > today) {
            notifyError("Lỗi", "Ngày cấp CCCD người ủy quyền không được lớn hơn ngày hiện tại!");
            return false;
        }
        if (!formData.issuePlace?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Nơi cấp CCCD người ủy quyền!");
            return false;
        }
        if (!formData.authPosition?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Chức vụ người ủy quyền!");
            return false;
        }

        // Thông tin người nhận UQ
        if (!formData.authedName?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Tên người nhận ủy quyền!");
            return false;
        }
        if (!formData.authedIdNo?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập CCCD người nhận ủy quyền!");
            return false;
        }
        if (!/^\d{12}$/.test(formData.authedIdNo.trim())) {
            notifyError("Lỗi", "CCCD người nhận ủy quyền phải gồm 12 chữ số!");
            return false;
        }
        if (!formData.authedIssueDate) {
            notifyWarning("Cảnh báo", "Vui lòng chọn Ngày cấp CCCD người nhận ủy quyền!");
            return false;
        }
        if (new Date(formData.authedIssueDate) > today) {
            notifyError("Lỗi", "Ngày cấp CCCD người nhận ủy quyền không được lớn hơn ngày hiện tại!");
            return false;
        }
        if (!formData.authedIssuePlace?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Nơi cấp CCCD người nhận ủy quyền!");
            return false;
        }
        if (!formData.authedPosition?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Chức vụ người nhận ủy quyền!");
            return false;
        }

        // Thông tin giấy UQ
        if (!formData.authNo?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Số giấy ủy quyền!");
            return false;
        }
        if (!formData.effDate) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Ngày hiệu lực!");
            return false;
        }
        if (!formData.expiryDate) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Ngày hết hạn!");
            return false;
        }
        if (new Date(formData.expiryDate) <= new Date(formData.effDate)) {
            notifyError("Lỗi", "Ngày kết thúc phải lớn hơn ngày hiệu lực!");
            return false;
        }
        if (!formData.scope?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Nội dung ủy quyền!");
            return false;
        }

        // Rule: CCCD không được trùng với thông tin đã có trong danh sách ủy quyền
        const isAuthedDuplicate = existingAuths.some(
            a => a.authType === 'AUTHORIZATION' && a.authedIdNo?.trim() === formData.authedIdNo?.trim()
        );
        if (isAuthedDuplicate) {
            notifyError("Lỗi", "CCCD người nhận ủy quyền này đã tồn tại trong danh sách ủy quyền!");
            return false;
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const parentOptions = [
        { value: "", label: "--- Tự nhập hoặc chọn cấp trên ---" },
        ...existingAuths.filter(a => a.authType === 'AUTHORIZATION').map(a => ({
            value: a.id,
            label: `(Cấp ${a.seqId || 1}) ${a.authedName || a.authName}`
        }))
    ];

    const legalRepOptions = legalReps.map(r => ({
        value: r.id,
        label: `${r.authName} - ${r.authidNo} (${r.authPosition || 'NĐDPL'})`
    }));

    // Form 1: THÊM MỚI NGƯỜI ĐẠI DIỆN PHÁP LUẬT (Ảnh 1)
    if (authType === 'LEGAL_REP') {
        return (
            <form id="authorization-form" onSubmit={handleSubmit} className={styles.formContainer}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionBar}></span>
                    THÔNG TIN NGƯỜI ĐẠI DIỆN
                </div>

                <div className={styles.grid1}>
                    <div className={styles.fieldGroup}>
                        <Input
                            label="Tên"
                            required
                            placeholder="Nhập họ tên"
                            value={formData.authName}
                            maxLength={50}
                            onChange={(e) => handleChange('authName', e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.grid2}>
                    <div className={styles.fieldGroup}>
                        <Input
                            label="Số CCCD"
                            required
                            placeholder="Nhập số CCCD"
                            value={formData.authidNo}
                            maxLength={12}
                            onChange={(e) => handleChange('authidNo', e.target.value)}
                        />
                    </div>
                    <div className={styles.fieldGroup}>
                        <Input
                            type="date"
                            label="Ngày cấp"
                            required
                            max={todayStr}
                            value={formData.authissueDate}
                            onChange={(e) => handleChange('authissueDate', e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.grid1}>
                    <div className={styles.fieldGroup}>
                        <Input
                            label="Nơi cấp"
                            required
                            placeholder="Nhập nơi cấp"
                            value={formData.issuePlace}
                            maxLength={50}
                            onChange={(e) => handleChange('issuePlace', e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.grid2}>
                    <div className={styles.fieldGroup}>
                        <Input
                            label="Chức vụ"
                            required
                            placeholder="Nhập chức vụ"
                            value={formData.authPosition}
                            maxLength={30}
                            onChange={(e) => handleChange('authPosition', e.target.value)}
                        />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                            Trạng thái <span className={styles.required}>*</span>
                        </label>
                        <Select
                            options={[{ value: "ACTIVE", label: "Hiệu lực" }]}
                            value="ACTIVE"
                            disabled
                            onChange={() => {}}
                        />
                    </div>
                </div>

                <div className={styles.buttonRow}>
                    <button type="button" className={styles.btnCancel} onClick={onClose}>
                        <X size={16} /> Hủy bỏ
                    </button>
                    <button type="submit" className={styles.btnSave}>
                        <Save size={16} /> Lưu
                    </button>
                </div>
            </form>
        );
    }

    // Form 2: THÊM MỚI ỦY QUYỀN (Ảnh 2)
    const isLevel1 = nextSeqId === 1;

    return (
        <form id="authorization-form" onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.sectionHeader}>
                <span className={styles.sectionBar}></span>
                THÔNG TIN ỦY QUYỀN
            </div>

            {/* Cấp UQ */}
            <div className={styles.grid1}>
                <div className={styles.fieldGroup} style={{ maxWidth: '140px' }}>
                    <Input
                        label="Cấp UQ"
                        required
                        value={String(nextSeqId)}
                        readOnly
                        style={{ backgroundColor: '#f9fafb', fontWeight: 600, textAlign: 'center' }}
                    />
                </div>
            </div>

            {/* Nếu Cấp 1 có nhiều NĐDPL -> Cho phép chọn NĐDPL tương ứng */}
            {isLevel1 && legalReps.length > 1 && (
                <div className={styles.grid1}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                            Chọn Người đại diện PL để ủy quyền <span className={styles.required}>*</span>
                        </label>
                        <Select
                            options={legalRepOptions}
                            value={selectedRepId}
                            onChange={handleSelectLegalRep}
                        />
                    </div>
                </div>
            )}

            {/* Nếu Cấp > 1 -> Cho phép chọn từ cấp trên */}
            {!isLevel1 && (
                <div className={styles.grid1}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                            Chọn cấp ủy quyền trước (nếu có)
                        </label>
                        <Select
                            options={parentOptions}
                            value={formData.parentAuthId || ""}
                            onChange={handleParentChange}
                        />
                    </div>
                </div>
            )}

            {/* Thông tin người UQ */}
            <div className={styles.grid1}>
                <div className={styles.fieldGroup}>
                    <Input
                        label={isLevel1 ? "Tên UQ" : "Tên người UQ"}
                        required
                        placeholder="Nhập tên người UQ"
                        value={formData.authName}
                        maxLength={50}
                        readOnly={isLevel1}
                        style={isLevel1 ? { backgroundColor: '#f3f4f6' } : {}}
                        onChange={(e) => handleChange('authName', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                    <Input
                        label={isLevel1 ? "CCCD UQ" : "CCCD người UQ"}
                        required
                        placeholder="Nhập số CCCD"
                        value={formData.authidNo}
                        maxLength={12}
                        readOnly={isLevel1}
                        style={isLevel1 ? { backgroundColor: '#f3f4f6' } : {}}
                        onChange={(e) => handleChange('authidNo', e.target.value)}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <Input
                        type="date"
                        label="Ngày cấp"
                        required
                        max={todayStr}
                        value={formData.authissueDate}
                        readOnly={isLevel1}
                        style={isLevel1 ? { backgroundColor: '#f3f4f6' } : {}}
                        onChange={(e) => handleChange('authissueDate', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid1}>
                <div className={styles.fieldGroup}>
                    <Input
                        label="Nơi cấp"
                        required
                        placeholder="Nhập nơi cấp"
                        value={formData.issuePlace}
                        maxLength={50}
                        readOnly={isLevel1}
                        style={isLevel1 ? { backgroundColor: '#f3f4f6' } : {}}
                        onChange={(e) => handleChange('issuePlace', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                    <Input
                        label="Chức vụ"
                        required
                        placeholder="Nhập chức vụ"
                        value={formData.authPosition}
                        maxLength={30}
                        readOnly={isLevel1}
                        style={isLevel1 ? { backgroundColor: '#f3f4f6' } : {}}
                        onChange={(e) => handleChange('authPosition', e.target.value)}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <Input
                        label="Người nhận UQ"
                        required
                        placeholder="Nhập tên người nhận UQ"
                        value={formData.authedName || ""}
                        maxLength={50}
                        onChange={(e) => handleChange('authedName', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                    <Input
                        label="CCCD người nhận UQ"
                        required
                        placeholder="Nhập số CCCD"
                        value={formData.authedIdNo || ""}
                        maxLength={12}
                        onChange={(e) => handleChange('authedIdNo', e.target.value)}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <Input
                        type="date"
                        label="Ngày cấp"
                        required
                        max={todayStr}
                        value={formData.authedIssueDate || ""}
                        onChange={(e) => handleChange('authedIssueDate', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                    <Input
                        label="Nơi cấp"
                        required
                        placeholder="Nhập nơi cấp"
                        value={formData.authedIssuePlace || ""}
                        maxLength={50}
                        onChange={(e) => handleChange('authedIssuePlace', e.target.value)}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <Input
                        label="Chức vụ"
                        required
                        placeholder="Nhập chức vụ"
                        value={formData.authedPosition || ""}
                        maxLength={30}
                        onChange={(e) => handleChange('authedPosition', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid1}>
                <div className={styles.fieldGroup}>
                    <Input
                        label="Số giấy UQ"
                        required
                        placeholder="Nhập số giấy UQ"
                        value={formData.authNo || ""}
                        maxLength={30}
                        onChange={(e) => handleChange('authNo', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                    <Input
                        type="date"
                        label="Ngày hiệu lực"
                        required
                        value={formData.effDate || ""}
                        onChange={(e) => handleChange('effDate', e.target.value)}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <Input
                        type="date"
                        label="Ngày hết hạn"
                        required
                        value={formData.expiryDate || ""}
                        onChange={(e) => handleChange('expiryDate', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid1}>
                <div className={styles.fieldGroup}>
                    <Input
                        label="Nội dung UQ"
                        required
                        placeholder="Nhập nội dung được ủy quyền"
                        value={formData.scope || ""}
                        maxLength={255}
                        onChange={(e) => handleChange('scope', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                    <Input
                        label="Ghi chú"
                        placeholder="Nhập ghi chú"
                        value={formData.note || ""}
                        maxLength={255}
                        onChange={(e) => handleChange('note', e.target.value)}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                        Trạng thái <span className={styles.required}>*</span>
                    </label>
                    <Select
                        options={[{ value: "ACTIVE", label: "Hiệu lực" }]}
                        value="ACTIVE"
                        disabled
                        onChange={() => {}}
                    />
                </div>
            </div>

            <div className={styles.buttonRow}>
                <button type="button" className={styles.btnCancel} onClick={onClose}>
                    <X size={16} /> Hủy bỏ
                </button>
                <button type="submit" className={styles.btnSave}>
                    <Save size={16} /> Lưu
                </button>
            </div>
        </form>
    );
}
