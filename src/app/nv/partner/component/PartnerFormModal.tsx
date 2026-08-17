'use client';

import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { PartnersItem, CreatePartnerRequest } from "@/types/funding.types";
import { useEffect, useState } from "react";
import styles from './PartnerFormModal.module.css';
import { UsersRound, X, Printer, Save, Pen } from "lucide-react";
import Input from "@/components/shared/Input/Input";
import Button from "@/components/shared/Button/Button";
import SignatureTab from "./SignatureTab";
import AuthorizationTab from "./AuthorizationTab";
import CustommerTypeTab from "./CustommerTypeTab";
import { useAuthStore } from "@/stores/auth.store";
import Modal from "@/components/shared/Modal/Modal";

interface PartnerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    partnerId: string | null;
    onSuccess: () => void;
}

export default function PartnerFormModal({ isOpen, onClose, partnerId, onSuccess }: PartnerFormModalProps) {
    const [loading, setLoading] = useState(false);
    const { notifyError, notifyWarning, notifySuccess } = useNotification();
    const userId = useAuthStore((state) => state.userId);

    const initialFormData: CreatePartnerRequest = {
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
        mobile: "",
        email: "",
        website: "",
        cusType: "",
        businessType: "",
        professionalInvestor: false,
        professionalStartDate: "",
        professionalEndDate: "",
        status: "ACTIVE",
    };

    const [formData, setFormData] = useState<CreatePartnerRequest | PartnersItem>(initialFormData);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'signature' | 'authorization' | 'custommertype'>('signature');

    useEffect(() => {
        if (isOpen) {
            if (partnerId) {
                // Edit mode
                const fetchPartner = async () => {
                    setLoading(true);
                    setError(null);
                    try {
                        const res = await apiClient.get(`/v1/capital-source/partners/${partnerId}`);
                        const found = res.data?.data || res.data || res;
                        if (found && found.id) {
                            setFormData(found);
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
                setFormData(initialFormData);
                setActiveTab('signature');
                setError(null);
            }
        }
    }, [isOpen, partnerId]);

    if (!isOpen) return null;

    // Xu ly thay doi input 
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Verify
    const validateForm = () => {
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
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(formData.mobile)) {
                notifyError("Lỗi định dạng", "Số điện thoại phải gồm 10-11 chữ số!");
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

        // 5. Nhà đầu tư chuyên nghiệp
        if (formData.professionalInvestor) {
            if (!formData.professionalStartDate) {
                notifyError("Lỗi", "Ngày bắt đầu NĐT chuyên nghiệp không được để trống khi là NĐT chuyên nghiệp");
                return false;
            }
            if (formData.professionalEndDate && new Date(formData.professionalEndDate) < new Date(formData.professionalStartDate)) {
                notifyError("Lỗi ngày tháng", "Ngày kết thúc NĐT chuyên nghiệp phải sau hoặc bằng ngày bắt đầu!");
                return false;
            }
        }

        return true;
    };

    // Save data 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setSaving(true);
        try {
            const submitData = {
                cusId: formData.cusId,
                branchCusId: formData.branchCusId || '',
                cusName: formData.cusName,
                shortName: formData.shortName || '',
                address: formData.address || '',
                idCode: formData.idCode,
                fistIssueDate: formData.fistIssueDate || null,
                lastIssueDate: formData.lastIssueDate || null,
                issueBy: formData.issueBy || '',
                changeCount: formData.changeCount || 0,
                opLiscenseNo: formData.opLiscenseNo || '',
                opIssueDate: formData.opIssueDate || null,
                mobile: formData.mobile || '',
                email: formData.email || '',
                website: formData.website || '',
                cusType: formData.cusType || '',
                businessType: formData.businessType || '',
                professionalInvestor: formData.professionalInvestor || false,
                professionalStartDate: formData.professionalInvestor ? formData.professionalStartDate : null,
                professionalEndDate: formData.professionalInvestor ? formData.professionalEndDate : null,
                status: formData.status || 'ACTIVE',
            };

            let res: any;
            if (partnerId) {
                // Edit
                res = await apiClient.put(`/v1/capital-source/partners/${partnerId}`, submitData);
            } else {
                // Create
                const createData = {
                    id: crypto.randomUUID(),
                    ...submitData,
                    createdBy: userId,
                    updatedBy: userId,
                    lastUpdated: new Date().toISOString().split("T")[0],
                };
                res = await apiClient.post("/v1/capital-source/partners", createData);
            }

            if (res && res.success === false) {
                notifyError('Lỗi', res.message || 'Thao tác thất bại!');
                return;
            }
            
            notifySuccess('Thành công', partnerId ? 'Cập nhật đối tác thành công!' : 'Thêm mới đối tác thành công!');
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMsg = error?.message || error?.response?.data?.message || 'Có lỗi xảy ra!';
            notifyError('Lỗi', errorMsg);
        } finally {
            setSaving(false);
        }
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
                onClick={onClose}
                disabled={saving}
            >
                Đóng
            </Button>
        </>
    );

    const title = (
        <>
            <UsersRound size={22} color="var(--primary)" />
            {partnerId ? 'Cập nhật đối tác' : 'Thêm mới đối tác'}
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
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
                                <Input
                                    label="Mã KH *"
                                    type="text"
                                    name="cusId"
                                    value={formData.cusId}
                                    onChange={handleChange}
                                />
                                
                                <Input
                                    label="Mã đơn vị GD *"
                                    type="text"
                                    name="branchCusId"
                                    value={formData.branchCusId || ""}
                                    onChange={handleChange}
                                />

                                <Input
                                    label="Tên KH *"
                                    type="text"
                                    name="cusName"
                                    value={formData.cusName}
                                    onChange={handleChange}
                                />

                                <Input
                                    label="Tên viết tắt *"
                                    type="text"
                                    name="shortName"
                                    value={formData.shortName || ""}
                                    onChange={handleChange}
                                />

                                <Input
                                    label="Địa chỉ"
                                    type="text"
                                    name="address"
                                    value={formData.address || ""}
                                    onChange={handleChange}
                                />

                                <Input
                                    label="Điện thoại"
                                    type="text"
                                    name="mobile"
                                    value={formData.mobile || ""}
                                    onChange={handleChange}
                                />

                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email || ""}
                                    onChange={handleChange}
                                />

                                <Input
                                    label="Website"
                                    type="text"
                                    name="website"
                                    value={formData.website || ""}
                                    onChange={handleChange}
                                />

                                <Input
                                    label="Số ĐKKD/CCCD *"
                                    type="text"
                                    name="idCode"
                                    value={formData.idCode}
                                    onChange={handleChange}
                                />

                                <Input
                                    label="Ngày cấp lần đầu"
                                    type="date"
                                    name="fistIssueDate"
                                    value={formData.fistIssueDate || ""}
                                    onChange={handleChange}
                                />

                                <Input
                                    label="Ngày cấp cuối"
                                    type="date"
                                    name="lastIssueDate"
                                    value={formData.lastIssueDate || ""}
                                    onChange={handleChange}
                                />

                                <Input
                                    label="Nơi cấp"
                                    type="text"
                                    name="issueBy"
                                    value={formData.issueBy || ""}
                                    onChange={handleChange}
                                />
                                
                                <Input
                                    label="Số lần thay đổi"
                                    type="number"
                                    name="changeCount"
                                    value={String(formData.changeCount ?? 0)}
                                    onChange={handleChange}
                                />

                                <Input
                                    label="GP hoạt động"
                                    type="text"
                                    name="opLiscenseNo"
                                    value={formData.opLiscenseNo || ""}
                                    onChange={handleChange}
                                />

                                <Input
                                    label="Ngày cấp GP"
                                    type="date"
                                    name="opIssueDate"
                                    value={formData.opIssueDate || ""}
                                    onChange={handleChange}
                                />

                                <div className={styles.checkboxField}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="professionalInvestor"
                                            checked={formData.professionalInvestor ?? false}
                                            onChange={handleChange}
                                        />
                                        <span>Nhà đầu tư chuyên nghiệp</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className={styles.card}>
                            <div className={styles.tabs}>
                            <button 
                                className={`${styles.tab} ${activeTab === 'signature' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('signature')}
                            >
                                <Pen size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}/>
                                1. Chữ ký
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'authorization' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('authorization')}
                            >
                                <UsersRound size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}/>
                                2. UQ/ Người đại diện PL
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'custommertype' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('custommertype')}
                            >
                                3. Loại hình KH
                            </button>
                        </div>
                        
                        <div className={styles.tabContent}>
                            {activeTab === 'signature' && (
                                <SignatureTab partnerId={partnerId || ''} />
                            )}
                            {activeTab === 'authorization' && (
                                <AuthorizationTab partnerId={partnerId || ''} />
                            )}
                            {activeTab === 'custommertype' && (
                                <CustommerTypeTab partnerId={partnerId || ''} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
