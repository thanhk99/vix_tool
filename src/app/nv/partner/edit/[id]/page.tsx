'use client';

import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { PartnersItem } from "@/types/funding.types";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { UsersRound } from "lucide-react";

export default function PartnerEdit() {
    const { notifySuccess, notifyError, notifyWarning, notifyInfo } = useNotification();    
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<PartnersItem | null>(null);

    useEffect(() => {
        const fetchPartner = async() => {
            try {
                const res = await apiClient.get('/v1/capital-source/partners');
                const data = res.data.data || res.data;
                const found = data.find((item:PartnersItem) => item.id === id);
                if(found) {
                    setFormData(found);
                } else {
                    notifyError("Không tìm thấy đối tác với mã này!")
                }
            } catch (error) {
                notifyError('Không thể tải thông tin!');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if(id) fetchPartner();
    }, [id]);

    // Xu ly thay doi input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    // ===== VERIFY =====
    const validateForm = () => {
        // 1. Trường bắt buộc
        if (!formData?.cusId || formData.cusId.trim() === '') {
            notifyWarning('Cảnh báo', 'Vui lòng nhập Mã KH!');
            return false;
        }
        if (!formData?.cusName || formData.cusName.trim() === '') {
            notifyWarning('Cảnh báo', 'Vui lòng nhập Tên KH!');
            return false;
        }
        if (!formData?.idCode || formData.idCode.trim() === '') {
            notifyWarning('Cảnh báo', 'Vui lòng nhập Số ĐKKD/CCCD!');
            return false;
        }

        // 2. Email (nếu có)
        if (formData?.email && formData.email.trim() !== '') {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(formData.email)) {
                notifyError('Lỗi định dạng', 'Email không đúng định dạng! (VD: example@domain.com)');
                return false;
            }
        }

        // 3. Số điện thoại (nếu có)
        if (formData?.mobile && formData.mobile.trim() !== '') {
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(formData.mobile)) {
                notifyError('Lỗi định dạng', 'Số điện thoại phải là 10-11 chữ số!');
                return false;
            }
        }

        // 4. Website (nếu có)
        if (formData?.website && formData.website.trim() !== '') {
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlRegex.test(formData.website)) {
                notifyError('Lỗi định dạng', 'Website không đúng định dạng!');
                return false;
            }
        }

        // 5. CCCD (12 số)
        if (formData?.idCode) {
            const cccdRegex = /^[0-9]{12}$/;
            if (!cccdRegex.test(formData.idCode)) {
                notifyError('Lỗi định dạng', 'Số ĐKKD/CCCD phải là 12 chữ số!');
                return false;
            }
        }

        // 6. Ngày cấp cuối >= Ngày cấp đầu
        if (formData?.fistIssueDate && formData?.lastIssueDate) {
            if (formData.lastIssueDate < formData.fistIssueDate) {
                notifyError('Lỗi ngày tháng', 'Ngày cấp cuối phải sau Ngày cấp lần đầu!');
                return false;
            }
        }

        // 7. Ngày bắt đầu CN <= Ngày kết thúc CN
        if (formData?.professionalStartDate && formData?.professionalEndDate) {
            if (formData.professionalEndDate < formData.professionalStartDate) {
                notifyError('Lỗi ngày tháng', 'Ngày kết thúc CN phải sau Ngày bắt đầu CN!');
                return false;
            }
        }

        // 8. NĐT chuyên nghiệp
        if (formData?.professionalInvestor) {
            if (!formData.professionalStartDate) {
                notifyWarning('Cảnh báo', 'Vui lòng nhập Ngày bắt đầu CN cho Nhà đầu tư chuyên nghiệp!');
                return false;
            }
            if (!formData.professionalEndDate) {
                notifyWarning('Cảnh báo', 'Vui lòng nhập Ngày kết thúc CN cho Nhà đầu tư chuyên nghiệp!');
                return false;
            }
        }

        // 9. Trạng thái
        const validStatuses = ['Active', 'Pending', 'Inactive'];
        if (formData?.status && !validStatuses.includes(formData.status)) {
            notifyError('Lỗi', 'Trạng thái không hợp lệ!');
            return false;
        }

        return true;
    };

    // Save data
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData) return;

        // Verify
        if (!validateForm()) {
            return;
        }
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
                professionalStartDate: formData.professionalStartDate || null,
                professionalEndDate: formData.professionalEndDate || null,
                status: formData.status || 'Active',
            };

            await apiClient.put(`/v1/capital-source/partners/${formData.cusId}`, submitData);
            notifySuccess('Thành công', 'Cập nhật đối tác thành công!');
            router.push(`/nv/partners/view/${id}`);
        } catch(error:any){
            notifyError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };
    if (loading) return <div className={styles.loading}>Đang tải dữ liệu...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!formData) return <div className={styles.error}>Không tìm thấy đối tác</div>;

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {/* Header */}
            <div className={styles.header}>
                <UsersRound size={25}/>
                <h1>Thông tin đối tác</h1>
            </div>
            {/* Title */}
            <div className={styles.title}>
                <h1>Thông tin chung</h1>
            </div>
            <div className={styles.content}>

                <div className={styles.formGroup}>
                    <label>Mã KH *</label>
                    <input
                        type="text"
                        name="cusId"
                        value={formData.cusId}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Mã đơn vị GD</label>
                    <input
                        type="text"
                        name="branchCusId"
                        value={formData.branchCusId || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Tên KH *</label>
                    <input
                        type="text"
                        name="cusName"
                        value={formData.cusName}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Tên viết tắt</label>
                    <input
                        type="text"
                        name="shortName"
                        value={formData.shortName || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Địa chỉ</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Điện thoại</label>
                    <input
                        type="text"
                        name="mobile"
                        value={formData.mobile || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Website</label>
                    <input
                        type="text"
                        name="website"
                        value={formData.website || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Số ĐKKD/CCCD *</label>
                    <input
                        type="text"
                        name="idCode"
                        value={formData.idCode}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Ngày cấp lần đầu</label>
                    <input
                        type="date"
                        name="fistIssueDate"
                        value={formData.fistIssueDate || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Ngày cấp cuối</label>
                    <input
                        type="date"
                        name="lastIssueDate"
                        value={formData.lastIssueDate || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Nơi cấp</label>
                    <input
                        type="text"
                        name="issueBy"
                        value={formData.issueBy || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Số lần thay đổi</label>
                    <input
                        type="number"
                        name="changeCount"
                        value={formData.changeCount ?? 0}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>GP hoạt động</label>
                    <input
                        type="text"
                        name="opLiscenseNo"
                        value={formData.opLiscenseNo || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Ngày cấp GP</label>
                    <input
                        type="date"
                        name="opIssueDate"
                        value={formData.opIssueDate || ""}
                        onChange={handleChange}
                    />
                </div>

            </div>

            <div className={styles.footer}>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className={styles.cancelBtn}
                    disabled={saving}
                >
                    Hủy
                </button>

                <button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={saving}
                >
                    {saving ? "Đang lưu..." : "Lưu"}
                </button>
            </div>
        </form>
    )
}