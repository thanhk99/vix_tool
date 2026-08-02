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

    // Save data
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData) return;

        //Validate
        if(!formData.cusId || !formData.cusName || !formData.idCode) {
            notifyError('Vui lòng nhập đầy đủ thông tin!');
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
            notifySuccess('Cập nhật thành công!')
            router.push(`/nv/partners/view/${id}`);
        } catch(error){
            notifyError("Có lỗi xảy ra khi cập nhật!")
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