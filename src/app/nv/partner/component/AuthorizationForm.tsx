'use client';

import Input from "@/components/shared/Input/Input";
import { CreateAuthorization } from "@/types/funding.types";
import { useEffect, useState } from "react";
import styles from "./AuthorizationForm.module.css";
import { useNotification } from "@/hooks/useNotification";

interface AuthorizationFormProps {
    onSubmit: (data: CreateAuthorization) => void;
    nextSeqId?: number;
}
export default function AuthorizationForm({onSubmit, nextSeqId=1}: AuthorizationFormProps) {
    const {notifyError, notifyWarning, notifySuccess, notifyInfo} = useNotification();

    const [formData, setFormData] = useState<CreateAuthorization>({
        id:crypto.randomUUID(),
        seqId: nextSeqId,
        authName: "",
        authPosition: "",
        authidNo: "",
        authissueDate: "",
        authedName: "",
        authedIdNo: "",
        authedIssueDate: "",
        authedPosition: "",
        issuePlace: "",
        authNo: "",
        effDate: "",
        expiryDate: "",
        phone: "",
        email: "",
        scope:""
    });

    useEffect (() => {
        setFormData(prev => ({
            ...prev,
            seqId: nextSeqId
        }));
    }, [nextSeqId]);
    const validateForm = () => {
        if (!formData.authName?.trim()) {    
            notifyWarning("Cảnh báo", "Vui lòng nhập Tên người ủy quyền!");
            return false;
        }

        if (!formData.authPosition?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Chức vụ người ủy quyền!");
            return false;
        }

        if (!formData.authidNo?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập CCCD người ủy quyền!");
            return false;
        }

        if (!/^\d{12}$/.test(formData.authidNo)) {
            notifyError("Lỗi", "CCCD người ủy quyền phải gồm 12 chữ số!");
            return false;
        }

        if (!formData.authissueDate) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Ngày cấp CCCD người ủy quyền!");
            return false;
        }

        if (!formData.authedName?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Tên người được ủy quyền!");
            return false;
        }

        if (!formData.authedPosition?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Chức vụ người được ủy quyền!");
            return false;
        }

        if (!formData.authedIdNo?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập CCCD người được ủy quyền!");
            return false;
        }

        if (!/^\d{12}$/.test(formData.authedIdNo)) {
            notifyError("Lỗi", "CCCD người được ủy quyền phải gồm 12 chữ số!");
            return false;
        }

        if (!formData.authedIssueDate) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Ngày cấp CCCD người được ủy quyền!");
            return false;
        }

        if (!formData.issuePlace?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Nơi cấp!");
            return false;
        }

        if (!formData.authNo?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Số giấy tờ ủy quyền!");
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

        if (new Date(formData.expiryDate) < new Date(formData.effDate)) {
            notifyError(
                "Lỗi ngày tháng",
                "Ngày hết hạn phải sau hoặc bằng Ngày hiệu lực!"
            );
            return false;
        }

        if (!formData.scope?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Phạm vi ủy quyền!");
            return false;
        }

        if (!formData.phone?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Số điện thoại!");
            return false;
        }

        if (!/^\d{10,11}$/.test(formData.phone)) {
            notifyError("Lỗi", "Số điện thoại phải gồm 10 hoặc 11 chữ số!");
            return false;
        }

        if (!formData.email?.trim()) {
            notifyWarning("Cảnh báo", "Vui lòng nhập Email!");
            return false;
        }

        const emailRegex =
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!emailRegex.test(formData.email)) {
            notifyError("Lỗi", "Email không đúng định dạng!");
            return false;
        }

        return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!validateForm()) return;
        onSubmit(formData);
    };

    return (
        <form
            id="authorization-form"
            onSubmit={handleSubmit}
            className={styles.form}
        >

            <Input
                label="Tên người ủy quyền"
                name="authName"
                value={formData.authName}
                onChange={handleChange}
            />

            <Input
                label="Chức vụ người ủy quyền"
                name="authPosition"
                value={formData.authPosition}
                onChange={handleChange}
            />

            <Input
                label="CCCD người ủy quyền"
                name="authidNo"
                value={formData.authidNo}
                onChange={handleChange}
            />

            <Input
                label="Ngày cấp CCCD"
                type="date"
                name="authissueDate"
                value={formData.authissueDate}
                onChange={handleChange}
            />

            <Input
                label="Tên người được ủy quyền"
                name="authedName"
                value={formData.authedName}
                onChange={handleChange}
            />

            <Input
                label="Chức vụ người được ủy quyền"
                name="authedPosition"
                value={formData.authedPosition}
                onChange={handleChange}
            />

            <Input
                label="CCCD người được ủy quyền"
                name="authedIdNo"
                value={formData.authedIdNo}
                onChange={handleChange}
            />

            <Input
                label="Ngày cấp CCCD"
                type="date"
                name="authedIssueDate"
                value={formData.authedIssueDate}
                onChange={handleChange}
            />

            <Input
                label="Nơi cấp"
                name="issuePlace"
                value={formData.issuePlace}
                onChange={handleChange}
            />

            <Input
                label="Số giấy tờ ủy quyền"
                name="authNo"
                value={formData.authNo}
                onChange={handleChange}
            />

            <Input
                label="Ngày hiệu lực"
                type="date"
                name="effDate"
                value={formData.effDate}
                onChange={handleChange}
            />

            <Input
                label="Ngày hết hạn"
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
            />

            <Input
                label="Phạm vi ủy quyền"
                name="scope"
                value={formData.scope}
                onChange={handleChange}
            />

            <Input
                label="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
            />

            <Input
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
            />

        </form>
    );
}