'use client';

import { useNotification } from "@/hooks/useNotification";
import apiClient from "@/lib/api/client";
import { PartnersItem } from "@/types/funding.types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from './page.module.css';
import { UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import Input from "@/components/shared/Input/Input";
import Button from "@/components/shared/Button/Button";
import SignatureTab from "../../component/SignatureTab";
import AuthorizationTab from "../../component/AuthorizationTab";

export default function PartnerEdit () {
    const [loading, setLoading] = useState(true);
    const { notifyError, notifyWarning, notifySuccess, notifyInfo } = useNotification();
    const [formData, setFormData] = useState<PartnersItem | null>(null);
    const [saving, setSaving] = useState(false);
    const params = useParams();
    const id = params.id as string;
    const [error, setError] = useState(false);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'signature' | 'authorization' | 'asset' | 'limit'>('signature');

    useEffect(() => {
        const fetchPartner = async() => {
            try {
                const res = await apiClient.get('/v1/capital-source/partners');
                const data = res.data.data || res.data;
                const found = data.find((item:PartnersItem) => item.id === id);
                if(found) {
                    setFormData(found);
                } else {
                    notifyError("Không tìm thấy đối tác với mã này!");
                } 
            } catch(error:any) {
                setError(error);
                notifyError('Không thể tải thông tin!');
            } finally {
                setLoading(false);
            }
        };
        if(id) fetchPartner();
    }, [id]);

    // Xu ly thay doi input 
    const handleChange = (e:React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData(prev => prev ? {...prev, [name]: value} : null);
    };

    // Verify
    const validateForm = () => {
        // ==========================
        // 1. Các trường bắt buộc
        // ==========================
        if (!formData?.cusId?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Mã KH!");
            return false;
        }

        if (!formData?.branchCusId?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Mã đơn vị GD!");
            return false;
        }

        if (!formData?.cusName?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Tên KH!");
            return false;
        }

        if (!formData?.shortName?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Tên viết tắt!");
            return false;
        }

        if (!formData?.address?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Địa chỉ!");
            return false;
        }

        if (!formData?.idCode?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Số ĐKKD/CCCD!");
            return false;
        }

        if (!formData?.issueBy?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Nơi cấp!");
            return false;
        }

        if (!formData?.cusType?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Loại khách hàng!");
            return false;
        }

        if (!formData?.businessType?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Loại hình kinh doanh!");
            return false;
        }

        if (!formData?.status?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Trạng thái!");
            return false;
        }

        // ==========================
        // 2. Email
        // ==========================
        if (formData.email?.trim()) {
            const emailRegex =
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (!emailRegex.test(formData.email)) {
                notifyError(
                    "Lỗi định dạng",
                    "Email không đúng định dạng!"
                );
                return false;
            }
        }

        // ==========================
        // 3. Số điện thoại
        // ==========================
        if (formData.mobile?.trim()) {
            const phoneRegex = /^[0-9]{10,11}$/;

            if (!phoneRegex.test(formData.mobile)) {
                notifyError(
                    "Lỗi định dạng",
                    "Số điện thoại phải gồm 10-11 chữ số!"
                );
                return false;
            }
        }

        // ==========================
        // 4. Website
        // ==========================
        if (formData.website?.trim()) {
            try {
                new URL(
                    formData.website.startsWith("http")
                        ? formData.website
                        : "https://" + formData.website
                );
            } catch {
                notifyError(
                    "Lỗi định dạng",
                    "Website không đúng định dạng!"
                );
                return false;
            }
        }

        // ==========================
        // 5. CCCD (nếu chỉ dành cho cá nhân)
        // ==========================
        if (
            formData.idCode &&
            formData.cusType === "Cá nhân"
        ) {
            const cccdRegex = /^[0-9]{12}$/;

            if (!cccdRegex.test(formData.idCode)) {
                notifyError(
                    "Lỗi định dạng",
                    "CCCD phải gồm đúng 12 chữ số!"
                );
                return false;
            }
        }

        // ==========================
        // 6. Số lần thay đổi
        // ==========================
        if (
            formData.changeCount != null &&
            formData.changeCount < 0
        ) {
            notifyError(
                "Lỗi dữ liệu",
                "Số lần thay đổi phải lớn hơn hoặc bằng 0!"
            );
            return false;
        }

        // ==========================
        // 7. Ngày cấp
        // ==========================
        if (
            formData.fistIssueDate &&
            formData.lastIssueDate
        ) {
            if (
                new Date(formData.lastIssueDate) <
                new Date(formData.fistIssueDate)
            ) {
                notifyError(
                    "Lỗi ngày tháng",
                    "Ngày cấp cuối phải sau hoặc bằng ngày cấp lần đầu!"
                );
                return false;
            }
        }

        // ==========================
        // 8. Giấy phép hoạt động
        // ==========================
        if (
            formData.opLiscenseNo?.trim() &&
            !formData.opIssueDate
        ) {
            notifyWarning(
                "Cảnh báo",
                "Vui lòng nhập ngày cấp giấy phép hoạt động!"
            );
            return false;
        }

        // ==========================
        // 9. Nhà đầu tư chuyên nghiệp
        // ==========================
        if (formData.professionalInvestor) {
            if (!formData.professionalStartDate) {
                notifyWarning(
                    "Cảnh báo",
                    "Vui lòng nhập Ngày bắt đầu NĐT chuyên nghiệp!"
                );
                return false;
            }

            if (!formData.professionalEndDate) {
                notifyWarning(
                    "Cảnh báo",
                    "Vui lòng nhập Ngày kết thúc NĐT chuyên nghiệp!"
                );
                return false;
            }

            if (
                new Date(formData.professionalEndDate) <
                new Date(formData.professionalStartDate)
            ) {
                notifyError(
                    "Lỗi ngày tháng",
                    "Ngày kết thúc phải sau ngày bắt đầu!"
                );
                return false;
            }
        }

        // ==========================
        // 10. Trạng thái
        // ==========================
        const validStatuses = [
            "ACTIVE",
            "PENDING",
            "INACTIVE"
        ];

        if (
            formData.status &&
            !validStatuses.includes(
                formData.status.toUpperCase()
            )
        ) {
            notifyError(
                "Lỗi",
                "Trạng thái không hợp lệ!"
            );
            return false;
        }

        return true;
    };

    // Save data 
    const handleSubmit = async(e:React.FormEvent) => {
        e.preventDefault();
        if(!formData) return;

        // Verify
        if(!validateForm()) {
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
            router.push(`/v1/partner/view/${id}`);
        } catch(error:any){
            setError(error);
            notifyError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setSaving(false);
        }
    };

    if(loading) return <div className={styles.loading}>Đang tải dữ liệu...</div>
    if(!formData) return <div className={styles.error}>Không tìm thấy đối tác</div>
    if(error) return <div className={styles.error}>{error}</div>

    return (
        <div className={styles.container}>
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
                        <Input
                            type="text"
                            name="cusId"
                            value={formData.cusId}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Mã đơn vị GD</label>
                        <Input
                            type="text"
                            name="branchCusId"
                            value={formData.branchCusId || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Tên KH *</label>
                        <Input
                            type="text"
                            name="cusName"
                            value={formData.cusName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Tên viết tắt</label>
                        <Input
                            type="text"
                            name="shortName"
                            value={formData.shortName || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Địa chỉ</label>
                        <Input
                            type="text"
                            name="address"
                            value={formData.address || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Điện thoại</label>
                        <Input
                            type="text"
                            name="mobile"
                            value={formData.mobile || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Website</label>
                        <Input
                            type="text"
                            name="website"
                            value={formData.website || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Số ĐKKD/CCCD *</label>
                        <Input
                            type="text"
                            name="idCode"
                            value={formData.idCode}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ngày cấp lần đầu</label>
                        <Input
                            type="date"
                            name="fistIssueDate"
                            value={formData.fistIssueDate || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ngày cấp cuối</label>
                        <Input
                            type="date"
                            name="lastIssueDate"
                            value={formData.lastIssueDate || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Nơi cấp</label>
                        <Input
                            type="text"
                            name="issueBy"
                            value={formData.issueBy || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Số lần thay đổi</label>
                        <Input
                            type="number"
                            name="changeCount"
                            value={formData.changeCount ?? 0}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>GP hoạt động</label>
                        <Input
                            type="text"
                            name="opLiscenseNo"
                            value={formData.opLiscenseNo || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ngày cấp GP</label>
                        <Input
                            type="date"
                            name="opIssueDate"
                            value={formData.opIssueDate || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Loại khách hàng</label>
                        <Input
                            type="text"
                            name="cusType"
                            value={formData.cusType || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Loại hình kinh doanh</label>
                        <Input
                            type="text"
                            name="businessType"
                            value={formData.businessType || ""}
                            onChange={handleChange}
                        />
                    </div>

                    {/* <div className={styles.formGroup}>
                        <label>Nhà đầu tư chuyên nghiệp</label>
                        <Input
                            type="checkbox"
                            name="professionalInvestor"
                            checked={formData.professionalInvestor ?? false}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    professionalInvestor: e.target.checked,
                                })
                            }
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ngày bắt đầu NĐT chuyên nghiệp</label>
                        <Input
                            type="date"
                            name="professionalStartDate"
                            value={formData.professionalStartDate || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ngày kết thúc NĐT chuyên nghiệp</label>
                        <Input
                            type="date"
                            name="professionalEndDate"
                            value={formData.professionalEndDate || ""}
                            onChange={handleChange}
                        />
                    </div> */}

                    <div className={styles.formGroup}>
                        <label>Trạng thái</label>
                        <select
                            name="status"
                            value={formData.status || ""}
                            onChange={handleChange}
                        >
                            <option value="">--Chọn--</option>
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="PENDING">Chờ duyệt</option>
                            <option value="INACTIVE">Ngừng hoạt động</option>
                        </select>
                    </div>

                </div>
            </form>

            {/*Tab */}
            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === 'signature' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('signature')}
                >
                    Chữ ký
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'authorization' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('authorization')}
                >
                    UQ / Người đại diện PL
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'limit' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('limit')}
                >
                    QL hạn mức
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'asset' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('asset')}
                >
                    TSĐB
                </button>
            </div>
            <div className={styles.tabContent}>
                {activeTab === 'signature' && (
                    <SignatureTab/>
                )}
                {activeTab === 'authorization' && (
                    <AuthorizationTab />
                )}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.back()}
                    className={styles.cancelBtn}
                    disabled={saving}
                >
                    Hủy
                </Button>
                <Button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={saving}
                >
                    {saving ? "Đang lưu..." : "Lưu"}
                </Button>
            </div>
        </div>
    )
}