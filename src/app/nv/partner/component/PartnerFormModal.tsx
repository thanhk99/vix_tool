"use client";
import { v4 as uuidv4 } from "uuid";
import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { PartnersItem, CreatePartnerRequest, AuthorizationItem, BankAccountItem, ContactItem } from "@/types/funding.types";
import { useEffect, useState } from "react";
import styles from "./PartnerFormModal.module.css";
import { UsersRound, X, Printer, Save, Pen } from "lucide-react";
import Input from "@/components/shared/Input/Input";
import Select from "@/components/shared/Select/Select";
import Button from "@/components/shared/Button/Button";
import SignatureAndSealTab, { UnifiedItem } from "./SignatureAndSealTab";
import AuthorizationTab from "./AuthorizationTab";
import CustommerTypeTab from "./CustommerTypeTab";
import ContactTab from "./ContactTab";
import BankAccountTab from "./BankAccountTab";
import AssetTab from "./AssetTab";
import ContractTab from "./ContractTab";
import DocumentTab, { UnifiedDocumentItem } from "./DocumentTab";
import { useAuthStore } from "@/stores/auth.store";
import Modal from "@/components/shared/Modal/Modal";
import { signatureApi } from "@/lib/api/signature.api";
import { sealApi } from "@/lib/api/seal.api";
interface PartnerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    partnerId: string | null;
    isView?: boolean;
    onSuccess: () => void;
}

export default function PartnerFormModal({ isOpen, onClose, partnerId, onSuccess, isView = false }: PartnerFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [localPartnerId, setLocalPartnerId] = useState<string | null>(partnerId);
    const { notifyError, notifyWarning, notifySuccess } = useNotification();
    const userId = useAuthStore((state) => state.userId);

    const initialFormData: CreatePartnerRequest & { totalPool?: string } = {
        cusId: "",
        branchCusId: "",
        cusName: "",
        shortName: "",
        address: "",
        idCode: "",
        fistIssueDate: "",
        lastIssueDate: "",
        issueBy: "",
        changeCount: 0,
        opLiscenseNo: "",
        opIssueDate: "",
        opIssueBy: "",
        mobile: "",
        email: "",
        website: "",
        fax: "",
        generalNote: "",
        depositoryMemberCode: "",
        tradingGateway: "",
        cusType: "",
        businessType: "",
        professionalInvestor: false,
        professionalStartDate: "",
        professionalEndDate: "",
        status: "ACTIVE",
        totalPool: "",
    };

    const [formData, setFormData] = useState<CreatePartnerRequest & { totalPool?: string } | PartnersItem>(initialFormData);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'signature' | 'authorization' | 'custommertype' | 'document' | 'bank_account' | 'contact'>('signature');

    const [isDraft, setIsDraft] = useState(false);
    const [duplicateErrors, setDuplicateErrors] = useState<{ branchCusId?: string }>({});

    const handleBlurBranchCusId = async () => {
        const val = formData.branchCusId?.trim();
        if (!val) return;
        try {
            const res: any = await apiClient.get('/v1/capital-source/partners/check-duplicate', {
                params: { branchCusId: val, excludeId: localPartnerId || undefined }
            });
            const data = res?.data?.data || res?.data || res;
            if (data?.branchCusIdDuplicate) {
                setDuplicateErrors(prev => ({ ...prev, branchCusId: 'Mã đơn vị GD đã tồn tại trong hệ thống!' }));
                notifyWarning('Cảnh báo trùng lặp', 'Mã đơn vị GD đã tồn tại trong hệ thống!');
            } else {
                setDuplicateErrors(prev => ({ ...prev, branchCusId: undefined }));
            }
        } catch (err) {
            console.warn('Check duplicate branchCusId error:', err);
        }
    };

    // Pending states for sub-tabs when creating a partner
    const [pendingSignatures, setPendingSignatures] = useState<UnifiedItem[]>([]);
    const [pendingAuthorizations, setPendingAuthorizations] = useState<AuthorizationItem[]>([]);
    const [pendingDocuments, setPendingDocuments] = useState<UnifiedDocumentItem[]>([]);
    const [pendingBankAccounts, setPendingBankAccounts] = useState<BankAccountItem[]>([]);
    const [pendingContacts, setPendingContacts] = useState<ContactItem[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (partnerId) {
                // Edit mode
                setLocalPartnerId(partnerId);
                const fetchPartner = async () => {
                    setLoading(true);
                    setError(null);
                    try {
                        const res = await apiClient.get(`/v1/capital-source/partners/${partnerId}`);
                        const found = res.data?.data || res.data || res;
                        if (found && found.id) {
                            if (found.totalPool !== undefined && found.totalPool !== null) {
                                found.totalPool = Number(found.totalPool).toLocaleString('vi-VN');
                            }
                            if ((!found.changeCount || Number(found.changeCount) === 0) && found.fistIssueDate) {
                                found.lastIssueDate = found.lastIssueDate || found.fistIssueDate;
                            }
                            if (found.changeReason && (found.changeReason.startsWith('{') || found.changeReason.startsWith('['))) {
                                found.changeReason = '';
                            }
                            setFormData(found);

                            // Store baseline snapshot before editing if not in view mode
                            if (!isView && typeof window !== 'undefined') {
                                const key = `partner_snapshot_${partnerId}`;
                                if (!localStorage.getItem(key)) {
                                    localStorage.setItem(key, JSON.stringify(found));
                                }
                            }
                        } else {
                            notifyError('Lỗi', "Không tìm thấy đối tác với mã này!");
                            setError("Không tìm thấy đối tác");
                        }
                    } catch (error: any) {
                        setError(error.message || 'Không thể tải thông tin!');
                        notifyError('Lỗi', 'Không thể tải thông tin!');
                    } finally {
                        setLoading(false);
                    }
                };
                fetchPartner();
            } else {
                // Create mode
                setLocalPartnerId(null);
                setFormData(initialFormData);
                setActiveTab('signature');
                setError(null);
                setIsDraft(false);
                setPendingSignatures([]);
                setPendingAuthorizations([]);
                setPendingDocuments([]);
                setPendingBankAccounts([]);
                setPendingContacts([]);
            }
        }
    }, [isOpen, partnerId]);

    if (!isOpen) return null;

    // Xu ly thay doi input 
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name === 'totalPool') {
            const numericValue = value.replace(/\D/g, '');
            const formattedValue = numericValue ? Number(numericValue).toLocaleString('vi-VN') : '';
            setFormData((prev: any) => ({
                ...prev,
                [name]: formattedValue,
            }));
            return;
        }

        if (name === 'fistIssueDate') {
            setFormData((prev: any) => {
                const count = Number(prev.changeCount ?? 0);
                const isNeverChanged = count === 0;
                return {
                    ...prev,
                    fistIssueDate: value,
                    lastIssueDate: (isNeverChanged || !prev.lastIssueDate) ? value : prev.lastIssueDate,
                };
            });
            return;
        }

        if (name === 'changeCount') {
            const count = Number(value ?? 0);
            setFormData((prev: any) => ({
                ...prev,
                changeCount: count,
                lastIssueDate: count === 0 ? (prev.fistIssueDate || prev.lastIssueDate) : prev.lastIssueDate,
                changeReason: count === 0 ? '' : prev.changeReason,
            }));
            return;
        }

        setFormData((prev: any) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Verify
    
    const handleTabClick = async (tabName: 'signature' | 'authorization' | 'custommertype' | 'document' | 'bank_account' | 'contact') => {
        setActiveTab(tabName);
    };

    const validateForm = async () => {
        // 1. Các trường bắt buộc
        if (!formData?.cusId?.trim()) { notifyWarning("Cảnh báo", "Vui lòng nhập Mã KH!"); return false; }
        if (!formData?.branchCusId?.trim()) { notifyWarning("Cảnh báo", "Vui lòng nhập Mã đơn vị GD!"); return false; }
        if (!formData?.cusName?.trim()) { notifyWarning("Cảnh báo", "Vui lòng nhập Tên KH!"); return false; }
        if (!formData?.shortName?.trim()) { notifyWarning("Cảnh báo", "Vui lòng nhập Tên viết tắt!"); return false; }
        if (!formData?.idCode?.trim()) { notifyWarning("Cảnh báo", "Vui lòng nhập Số ĐKKD/CCCD!"); return false; }
        
        // 2. Email
        if (formData.email?.trim()) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(formData.email)) {
                notifyError("Lỗi định dạng", "Email không đúng định dạng!");
                return false;
            }
        }

        // 3. Số điện thoại
        if (formData.mobile?.trim()) {
            const phoneRegex = /^[0-9\+\-\s\(\)]+$/;
            if (!phoneRegex.test(formData.mobile)) {
                notifyError("Lỗi định dạng", "Số điện thoại không hợp lệ!");
                return false;
            }
        }

        // 4. Ngày cấp
        if (formData.fistIssueDate && formData.lastIssueDate) {
            if (new Date(formData.lastIssueDate) < new Date(formData.fistIssueDate)) {
                notifyError("Lỗi ngày tháng", "Ngày cấp cuối phải sau hoặc bằng ngày cấp lần đầu!");
                return false;
            }
        }

        // 5. Kiểm tra trùng lặp Mã đơn vị GD
        try {
            const checkRes: any = await apiClient.get('/v1/capital-source/partners/check-duplicate', {
                params: {
                    branchCusId: formData.branchCusId?.trim(),
                    excludeId: localPartnerId || undefined
                }
            });
            const dupData = checkRes?.data?.data || checkRes?.data || checkRes;

            if (dupData?.branchCusIdDuplicate) {
                setDuplicateErrors({ branchCusId: 'Mã đơn vị GD đã tồn tại trong hệ thống!' });
                notifyError('Lỗi trùng lặp', 'Mã đơn vị GD đã tồn tại trong hệ thống! Vui lòng kiểm tra lại.');
                return false;
            } else {
                setDuplicateErrors({});
            }
        } catch (err) {
            console.warn('Validate duplicate API check error:', err);
        }

        return true;
    };

    // Save data 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const isValid = await validateForm();
        if (!isValid) return;
        
        setSaving(true);
        try {
            const count = Number(formData.changeCount ?? 0);
            const finalLastIssueDate = (count === 0 && formData.fistIssueDate)
                ? formData.fistIssueDate
                : (formData.lastIssueDate || formData.fistIssueDate || null);

            const submitData = {
                cusId: formData.cusId,
                branchCusId: formData.branchCusId || '',
                cusName: formData.cusName,
                shortName: formData.shortName || '',
                address: formData.address || '',
                idCode: formData.idCode,
                fistIssueDate: formData.fistIssueDate || null,
                lastIssueDate: finalLastIssueDate,
                changeReason: formData.changeReason || '',
                issueBy: formData.issueBy || '',
                changeCount: formData.changeCount || 0,
                opLiscenseNo: formData.opLiscenseNo || '',
                opIssueDate: formData.opIssueDate || null,
                opIssueBy: formData.opIssueBy || '',
                mobile: formData.mobile || '',
                email: formData.email || '',
                website: formData.website || '',
                fax: formData.fax || '',
                generalNote: formData.generalNote || '',
                depositoryMemberCode: formData.depositoryMemberCode || '',
                tradingGateway: formData.tradingGateway || '',
                cusType: formData.cusType || '',
                businessType: formData.businessType || '',
                professionalInvestor: formData.professionalInvestor || false,
                professionalStartDate: formData.professionalInvestor ? formData.professionalStartDate : null,
                professionalEndDate: formData.professionalInvestor ? formData.professionalEndDate : null,
                status: formData.status || 'ACTIVE',
                totalPool: formData.totalPool ? Number(String(formData.totalPool).replace(/\./g, '')) : 0,
                isActive: formData.isActive !== undefined ? formData.isActive : true,
            };

            if (localPartnerId) {
                // Edit
                const res: any = await apiClient.put(`/v1/capital-source/partners/${localPartnerId}`, submitData);
                if (res && res.success === false) {
                    notifyError('Lỗi', res.message || 'Thao tác thất bại!');
                    return;
                }
                notifySuccess('Thành công', isDraft ? 'Thêm mới đối tác thành công!' : 'Cập nhật đối tác thành công!');
                setIsDraft(false);
                onSuccess();
                onClose();
            } else {
                // Create
                const generatedId = uuidv4();
                const createData = {
                    id: generatedId,
                    ...submitData,
                    createdBy: userId,
                    updatedBy: userId,
                    lastUpdated: new Date().toISOString().split("T")[0],
                };
                const res: any = await apiClient.post("/v1/capital-source/partners", createData);
                if (res && res.success === false) {
                    notifyError('Lỗi', res.message || 'Thao tác thất bại!');
                    return;
                }

                const newId = res?.data?.data?.id || res?.data?.id || res?.id || generatedId;

                // Push all pending sub-tab items:
                // 1. Signatures & Seals
                for (const item of pendingSignatures) {
                    try {
                        let createdId: string | null = null;
                        if (item.isSignature) {
                            const cleanSig = {
                                signFileName: item.fileName,
                                signType: item.typeId || 'DIGITAL',
                                description: item.description || '',
                                effectiveDate: item.effectiveDate,
                                expiryDate: item.expiryDate || null,
                                status: item.status || 'ACTIVE'
                            };
                            const sigRes: any = await signatureApi.create(newId, cleanSig);
                            createdId = sigRes?.data?.id || sigRes?.data?.data?.id || sigRes?.id;
                            if (item.file && createdId) {
                                await signatureApi.uploadFile(newId, createdId, item.file);
                            }
                        } else {
                            const cleanSeal = {
                                sealFileName: item.fileName,
                                description: item.description || '',
                                effectiveDate: item.effectiveDate,
                                expiryDate: item.expiryDate || undefined,
                                status: item.status || 'ACTIVE'
                            };
                            const sealRes: any = await sealApi.create(newId, cleanSeal);
                            createdId = sealRes?.data?.id || sealRes?.data?.data?.id || sealRes?.id;
                        }
                    } catch (err) {
                        console.error("Lỗi lưu chữ ký/con dấu tạm:", err);
                    }
                }

                // 2. Authorizations
                for (const auth of pendingAuthorizations) {
                    try {
                        const cleanAuth = {
                            seqId: auth.seqId || 1,
                            authType: auth.authType || 'LEGAL_REP',
                            authName: auth.authName || '',
                            authidNo: auth.authidNo || '',
                            authPosition: auth.authPosition || '',
                            authissueDate: auth.authissueDate || null,
                            issuePlace: auth.issuePlace || '',
                            authedName: auth.authedName || '',
                            authedIdNo: auth.authedIdNo || '',
                            authedPosition: auth.authedPosition || '',
                            authNo: auth.authNo || '',
                            effDate: auth.effDate || null,
                            expiryDate: auth.expiryDate || null,
                            authedIssueDate: auth.authedIssueDate || null,
                            authedIssuePlace: auth.authedIssuePlace || '',
                            scope: auth.scope || '',
                            note: auth.note || '',
                            phone: auth.phone || '',
                            email: auth.email || '',
                            status: auth.status || 'ACTIVE',
                            parentAuthId: (auth.parentAuthId && !auth.parentAuthId.startsWith('temp_')) ? auth.parentAuthId : null,
                        };
                        await apiClient.post(`/v1/capital-source/partners/${newId}/authorizations`, cleanAuth);
                    } catch (err) {
                        console.error("Lỗi lưu ủy quyền tạm:", err);
                    }
                }

                // 3. Documents
                for (const doc of pendingDocuments) {
                    if (doc.file) {
                        try {
                            const fd = new FormData();
                            fd.append("file", doc.file);
                            await apiClient.post(`/v1/capital-source/partners/${newId}/documents`, fd, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                            });
                        } catch (err) {
                            console.error("Lỗi tải tài liệu tạm:", err);
                        }
                    }
                }

                // 4. Bank accounts / Channels
                for (const acc of pendingBankAccounts) {
                    try {
                        const cleanAcc = {
                            accountNumber: acc.accountNumber || '',
                            accountName: acc.accountName || '',
                            branch: acc.branch || '',
                            citadCode: acc.citadCode || '',
                            purpose: acc.purpose || '',
                            status: acc.status || 'ACTIVE',
                            accountType: acc.accountType || 'BANK',
                            openPlace: acc.openPlace || '',
                            depositoryMemberNo: acc.depositoryMemberNo || '',
                            tradingGateway: acc.tradingGateway || '',
                        };
                        await apiClient.post(`/v1/capital-source/partners/${newId}/bank-accounts`, cleanAcc);
                    } catch (err) {
                        console.error("Lỗi lưu tài khoản/kênh tạm:", err);
                    }
                }

                // 5. Contacts
                for (const contact of pendingContacts) {
                    try {
                        const cleanContact = {
                            name: contact.name || '',
                            position: contact.position || '',
                            department: contact.department || '',
                            phone: contact.phone || '',
                            email: contact.email || '',
                            role: contact.role || '',
                            transactionFee: contact.transactionFee || '',
                            note: contact.note || '',
                            status: contact.status || 'ACTIVE',
                        };
                        await apiClient.post(`/v1/capital-source/partners/${newId}/contacts`, cleanContact);
                    } catch (err) {
                        console.error("Lỗi lưu người liên hệ tạm:", err);
                    }
                }

                notifySuccess('Thành công', 'Thêm mới đối tác thành công!');
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            const errorMsg = error?.message || error?.response?.data?.message || 'Có lỗi xảy ra!';
            notifyError('Lỗi', errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = async () => {
        if (isDraft && localPartnerId) {
            try {
                await apiClient.delete(`/v1/capital-source/partners/${localPartnerId}`);
            } catch(e) {
                console.error("Failed to delete draft partner", e);
            }
        }
        setIsDraft(false);
        setLocalPartnerId(null);
        onClose();
    };

    const footer = (
        <>
            <Button
                variant="outline"
                onClick={() => window.print()}
                disabled={saving || loading}
            >
                <Printer size={16} /> In HĐ
            </Button>
            <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={saving || loading}
                isLoading={saving}
            >
                <Save size={16} /> Lưu
            </Button>
            <Button
                variant="outline"
                onClick={handleClose}
                disabled={saving}
            >
                Đóng
            </Button>
        </>
    );

    const title = (
        <>
            <UsersRound size={22} color="var(--primary)" />
            {isView ? 'Chi tiết đối tác' : (partnerId ? 'Cập nhật đối tác' : 'Thêm mới đối tác')}
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={title}
            size="xl"
            footer={footer}
            closeOnOverlayClick={false}
        >
            {loading ? (
                <div className={styles.loading}>Đang tải dữ liệu...</div>
            ) : error ? (
                <div className={styles.loading}>{error}</div>
            ) : (
                <div className={styles.modalBody}>
                    <div className={styles.card}>
                            <h3 className={styles.sectionTitle}>THÔNG TIN CHUNG</h3>
                            
                            <div className={styles.formGrid}>
                                <Input disabled={isView}
                                    label="Mã KH *"
                                    type="text"
                                    name="cusId"
                                    value={formData.cusId}
                                    onChange={handleChange}
                                />
                                
                                <Input disabled={isView}
                                    label="Mã đơn vị GD *"
                                    type="text"
                                    name="branchCusId"
                                    value={formData.branchCusId || ""}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (duplicateErrors.branchCusId) {
                                            setDuplicateErrors(prev => ({ ...prev, branchCusId: undefined }));
                                        }
                                    }}
                                    onBlur={handleBlurBranchCusId}
                                    error={duplicateErrors.branchCusId}
                                />

                                <Input disabled={isView}
                                    label="Tên KH *"
                                    type="text"
                                    name="cusName"
                                    value={formData.cusName}
                                    onChange={handleChange}
                                />

                                <Input disabled={isView}
                                    label="Tên viết tắt *"
                                    type="text"
                                    name="shortName"
                                    value={formData.shortName || ""}
                                    onChange={handleChange}
                                />

                                <Input disabled={isView}
                                    label="Địa chỉ"
                                    type="text"
                                    name="address"
                                    value={formData.address || ""}
                                    onChange={handleChange}
                                />

                                <Input disabled={isView}
                                    label="Điện thoại"
                                    type="text"
                                    name="mobile"
                                    value={formData.mobile || ""}
                                    onChange={handleChange}
                                />

                                <Input disabled={isView}
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email || ""}
                                    onChange={handleChange}
                                />

                                <Input disabled={isView}
                                    label="Website"
                                    type="text"
                                    name="website"
                                    value={formData.website || ""}
                                    onChange={handleChange}
                                />

                                <Input disabled={isView}
                                    label="Fax"
                                    type="text"
                                    name="fax"
                                    value={formData.fax || ""}
                                    onChange={handleChange}
                                />

                                <Input disabled={isView}
                                    label="Ghi chú"
                                    type="text"
                                    name="generalNote"
                                    value={formData.generalNote || ""}
                                    onChange={handleChange}
                                />

                                <Input disabled={isView}
                                    label="Số ĐKKD/CCCD *"
                                    type="text"
                                    name="idCode"
                                    value={formData.idCode}
                                    onChange={handleChange}
                                />

                                {/* Row: Ngày cấp lần đầu | Ngày thay đổi gần nhất | Nơi cấp | Lý do thay đổi */}
                                <div className={styles.row4}>
                                    <Input disabled={isView}
                                        label="Ngày cấp lần đầu"
                                        type="date"
                                        name="fistIssueDate"
                                        value={formData.fistIssueDate || ""}
                                        onChange={handleChange}
                                    />

                                    <Input disabled={isView || Number(formData.changeCount ?? 0) === 0}
                                        label="Ngày thay đổi gần nhất"
                                        type="date"
                                        name="lastIssueDate"
                                        value={(Number(formData.changeCount ?? 0) === 0 ? (formData.fistIssueDate || formData.lastIssueDate) : formData.lastIssueDate) || ""}
                                        onChange={handleChange}
                                    />

                                    <Input disabled={isView}
                                        label="Nơi cấp"
                                        type="text"
                                        name="issueBy"
                                        value={formData.issueBy || ""}
                                        onChange={handleChange}
                                    />

                                    <Input disabled={isView || Number(formData.changeCount ?? 0) === 0}
                                        label="Lý do thay đổi"
                                        name="changeReason"
                                        value={Number(formData.changeCount ?? 0) === 0 ? "" : (formData.changeReason || "")}
                                        onChange={handleChange}
                                        placeholder={Number(formData.changeCount ?? 0) === 0 ? "Chưa thay đổi ĐKKD" : "Nhập lý do thay đổi"}
                                    />
                                </div>

                                {/* Row: Số lần thay đổi | GP hoạt động | Ngày cấp GP | Mã TVLK (VSDC Code) */}
                                <div className={styles.row4}>
                                    <Input disabled={isView}
                                        label="Số lần thay đổi ĐKKD"
                                        type="number"
                                        name="changeCount"
                                        value={String(formData.changeCount ?? 0)}
                                        onChange={handleChange}
                                    />

                                    <Input disabled={isView}
                                        label="GP hoạt động"
                                        type="text"
                                        name="opLiscenseNo"
                                        value={formData.opLiscenseNo || ""}
                                        onChange={handleChange}
                                    />
                                    
                                    <Input disabled={isView}
                                        label="Ngày cấp GP"
                                        type="date"
                                        name="opIssueDate"
                                        value={formData.opIssueDate || ""}
                                        onChange={handleChange}
                                    />

                                    <Input disabled={isView}
                                        label="Mã TVLK (VSDC Code)"
                                        type="text"
                                        name="depositoryMemberCode"
                                        value={formData.depositoryMemberCode || ""}
                                        onChange={handleChange}
                                        placeholder="Nhập mã TVLK..."
                                    />
                                </div>

                                {/* Row: Nơi mở | Tổng hạn mức | Nơi cấp GP */}
                                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px 16px' }}>
                                    <Input disabled={isView}
                                        label="Nơi mở"
                                        type="text"
                                        name="tradingGateway"
                                        value={formData.tradingGateway || ""}
                                        onChange={handleChange}
                                        placeholder="Nhập nơi mở..."
                                    />

                                    <Input disabled={isView}
                                        label="Tổng hạn mức (VND)"
                                        type="text"
                                        name="totalPool"
                                        value={formData.totalPool ?? ""}
                                        onChange={handleChange}
                                        placeholder="Nhập tổng hạn mức..."
                                    />

                                    <Input disabled={isView}
                                        label="Nơi cấp GP"
                                        type="text"
                                        name="opIssueBy"
                                        value={formData.opIssueBy || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className={styles.card}>
                            <div className={styles.tabs}>
                            <button 
                                className={`${styles.tab} ${activeTab === 'signature' ? styles.tabActive : ''}`}
                                onClick={() => handleTabClick('signature')}
                            >
                                Chữ ký
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'authorization' ? styles.tabActive : ''}`}
                                onClick={() => handleTabClick('authorization')}
                            >
                                UQ / Người đại diện PL
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'custommertype' ? styles.tabActive : ''}`}
                                onClick={() => handleTabClick('custommertype')}
                            >
                                Loại hình KH
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'document' ? styles.tabActive : ''}`}
                                onClick={() => handleTabClick('document')}
                            >
                                Tài liệu
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'bank_account' ? styles.tabActive : ''}`}
                                onClick={() => handleTabClick('bank_account')}
                            >
                                Tài khoản ngân hàng/kênh đặt lệnh
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'contact' ? styles.tabActive : ''}`}
                                onClick={() => handleTabClick('contact')}
                            >
                                Liên hệ
                            </button>
                        </div>
                        
                        <div className={styles.tabContent}>
                            {activeTab === 'signature' && (
                                <SignatureAndSealTab 
                                    partnerId={localPartnerId || ""} 
                                    isView={isView} 
                                    pendingItems={pendingSignatures}
                                    setPendingItems={setPendingSignatures}
                                />
                            )}
                            {activeTab === 'authorization' && (
                                <AuthorizationTab 
                                    partnerId={localPartnerId || ""} 
                                    isView={isView} 
                                    pendingItems={pendingAuthorizations}
                                    setPendingItems={setPendingAuthorizations}
                                />
                            )}
                            {activeTab === 'custommertype' && (
                                <CustommerTypeTab 
                                    partnerId={localPartnerId || ""} 
                                    isView={isView} 
                                    parentFormData={formData}
                                    setParentFormData={setFormData}
                                />
                            )}
                            {activeTab === 'document' && (
                                <DocumentTab 
                                    partnerId={localPartnerId || ""} 
                                    isView={isView} 
                                    pendingItems={pendingDocuments}
                                    setPendingItems={setPendingDocuments}
                                />
                            )}
                            {activeTab === 'bank_account' && (
                                <BankAccountTab 
                                    partnerId={localPartnerId || ""} 
                                    isView={isView} 
                                    pendingItems={pendingBankAccounts}
                                    setPendingItems={setPendingBankAccounts}
                                />
                            )}
                            {activeTab === 'contact' && (
                                <ContactTab 
                                    partnerId={localPartnerId || ""} 
                                    isView={isView} 
                                    pendingItems={pendingContacts}
                                    setPendingItems={setPendingContacts}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
