'use client';

import { PartnersItem } from "@/types/funding.types";
import { useEffect, useState } from "react";
import styles from "./PartnerForm.module.css";
import apiClient from "@/lib/api/client";

interface ManagePartnerProps {
    onSuccess: () => void;
    mode: 'create' | 'edit' | 'view' | 'approve';
    partner: PartnersItem | null;
    onClose: () => void;
}

export default function PartnerCreate({ onSuccess, mode, partner, onClose }: ManagePartnerProps) {
    const [loading, setLoading] = useState(false);
    const defaultFormData: PartnersItem = {
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
        id: "",
        cusType: "",
        businessType: "",
        professionalInvestor: false,
        professionalStartDate: "",
        professionalEndDate: "",
        status: "",
        createdBy: "",
        updatedBy: "",
        lastUpdated: ""
    };
    const [formData, setFormData] = useState(defaultFormData);
    const isReadOnly = mode === 'view' || mode === 'approve';

    useEffect(() => {
        if (mode === "create") {
            setFormData(defaultFormData);
        } else if (partner) {
            setFormData(partner);
        }
    }, [mode, partner]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (isReadOnly) return;
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (mode === 'view') {
            onClose();
            return;
        }

        // Validation
        if (!formData.cusId || !formData.cusName  || !formData.idCode) {
            alert('Vui lòng nhập Mã KH và Tên KH');
            return;
        }

        setLoading(true);
        try {
            const dataToSend = {
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
            await apiClient.post('/v1/capital-source/partners', dataToSend);
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.form}>

                {/* ================= Thông tin chung ================= */}
                <h3>Thông tin chung</h3>

                <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                        <label>Mã KH <span className={styles.required}>*</span></label>
                        <input
                            name="cusId"
                            value={formData.cusId}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            placeholder="Nhập mã khách hàng"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Mã đơn vị GD</label>
                        <input
                            name="branchCusId"
                            value={formData.branchCusId}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            placeholder="Nhập mã đơn vị giao dịch"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Tên khách hàng <span className={styles.required}>*</span></label>
                        <input
                            name="cusName"
                            value={formData.cusName}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            placeholder="Nhập tên khách hàng"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Tên viết tắt</label>
                        <input
                            name="shortName"
                            value={formData.shortName}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            placeholder="Nhập tên viết tắt"
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Địa chỉ</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={isReadOnly}
                        placeholder="Nhập địa chỉ"
                        rows={2}
                    />
                </div>

                <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                        <label>Số ĐKKD / CCCD <span className={styles.required}>*</span></label>
                        <input
                            name="idCode"
                            value={formData.idCode}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            placeholder="Nhập số ĐKKD/CCCD"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Nơi cấp</label>
                        <input
                            name="issueBy"
                            value={formData.issueBy}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            placeholder="Nhập nơi cấp"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ngày cấp lần đầu</label>
                        <input
                            type="date"
                            name="fistIssueDate"
                            value={formData.fistIssueDate ?? ""}
                            onChange={handleChange}
                            disabled={isReadOnly}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ngày cấp cuối</label>
                        <input
                            type="date"
                            name="lastIssueDate"
                            value={formData.lastIssueDate ?? ""}
                            onChange={handleChange}
                            disabled={isReadOnly}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>GP hoạt động</label>
                        <input
                            name="opLiscenseNo"
                            value={formData.opLiscenseNo}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            placeholder="Nhập GP hoạt động"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ngày cấp GP</label>
                        <input
                            type="date"
                            name="opIssueDate"
                            value={formData.opIssueDate}
                            onChange={handleChange}
                            disabled={isReadOnly}
                        />
                    </div>
                </div>

                <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                        <label>Điện thoại</label>
                        <input
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            placeholder="Nhập số điện thoại"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            placeholder="example@domain.com"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Website</label>
                        <input
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            placeholder="www.example.com"
                        />
                    </div>
                </div>
                <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                        <label>Phân loại KH</label>
                        <select
                            name="cusType"
                            value={formData.cusType}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className={styles.select}
                        >
                            <option value="">-- Chọn --</option>
                            <option value="Cá nhân">Cá nhân</option>
                            <option value="Tổ chức">Tổ chức</option>
                            <option value="Doanh nghiệp">Doanh nghiệp</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Loại hình kinh doanh</label>
                        <select
                            name="businessType"
                            value={formData.businessType}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className={styles.select}
                        >
                            <option value="">-- Chọn --</option>
                            <option value="Sản xuất">Sản xuất</option>
                            <option value="Thương mại">Thương mại</option>
                            <option value="Dịch vụ">Dịch vụ</option>
                            <option value="Xây dựng">Xây dựng</option>
                            <option value="Tài chính">Tài chính</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Nhà đầu tư chuyên nghiệp</label>
                        <div className={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                name="professionalInvestor"
                                checked={formData.professionalInvestor || false}
                                onChange={(e) => setFormData(prev => ({ ...prev, professionalInvestor: e.target.checked }))}
                                disabled={isReadOnly}
                            />
                            <span>Có</span>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ngày bắt đầu CN</label>
                        <input
                            type="date"
                            name="professionalStartDate"
                            value={formData.professionalStartDate || ""}
                            onChange={handleChange}
                            disabled={isReadOnly || !formData.professionalInvestor}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ngày kết thúc CN</label>
                        <input
                            type="date"
                            name="professionalEndDate"
                            value={formData.professionalEndDate || ""}
                            onChange={handleChange}
                            disabled={isReadOnly || !formData.professionalInvestor}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Trạng thái</label>
                        <select
                            name="status"
                            value={formData.status || "Active"}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className={styles.select}
                        >
                            <option value="Active">Hoạt động</option>
                            <option value="Pending">Chờ duyệt</option>
                            <option value="Inactive">Không hoạt động</option>
                        </select>
                    </div>
                </div>

            </div>

            {/* ================= Footer ================= */}
            <div className={styles.footer}>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className={styles.cancelBtn}
                >
                    {mode === "view" ? "Đóng" : "Hủy"}
                </button>

                {mode !== "view" && (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={styles.submitBtn}
                    >
                        {loading ? "Đang xử lý..." : mode === "approve" ? "Duyệt" : "Lưu"}
                    </button>
                )}
            </div>
        </div>
    );
}