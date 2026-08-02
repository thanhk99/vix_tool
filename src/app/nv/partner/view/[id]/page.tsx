'use client';

import apiClient from "@/lib/api/client";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { UsersRound, X } from "lucide-react";
import { PartnersItem } from "@/types/funding.types";

export default function PartnerView() {
    const params = useParams();
    console.log(params)
    const router = useRouter();
    const id = params.id as string;
    const [partner, setPartner] = useState<PartnersItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPartner = async() => {
            try {
                const res = await apiClient.get(`/v1/capital-source/partners/${id}`);
                setPartner(res.data.data || res.data)
            } catch (error) {
                setError('Không thể tải thông tin.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if(id) fetchPartner();
    }, [id]);

    if (loading) return <div className={styles.loading}>Đang tải dữ liệu...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!partner) return <div className={styles.error}>Không tìm thấy đối tác</div>;
    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <UsersRound size={25}/>
                <h1>Thông tin đối tác</h1>
            </div>
            {/* Title */}
            <div className={styles.title}>
                <h1>Thông tin chung</h1>
            </div>
            {/* Detail Information */}
            <div className={styles.content}>
                <div className={styles.row}>
                    <div className={styles.label}>Mã KH</div>
                    <div className={styles.value}>{partner.cusId}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Mã GD</div>
                    <div className={styles.value}>{partner.branchCusId}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Tên KH</div>
                    <div className={styles.value}>{partner.cusName}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Tên viết tắt</div>
                    <div className={styles.value}>{partner.shortName}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Địac chỉ</div>
                    <div className={styles.value}>{partner.address}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Số ĐKKD/CCCD</div>
                    <div className={styles.value}>{partner.idCode}</div>
                </div><div className={styles.row}>
                    <div className={styles.label}>Ngày cấp lần đầu</div>
                    <div className={styles.value}>{partner.fistIssueDate}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Ngày cấp cuối</div>
                    <div className={styles.value}>{partner.lastIssueDate}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Nơi cấp</div>
                    <div className={styles.value}>{partner.issueBy}</div>
                </div><div className={styles.row}>
                    <div className={styles.label}>Số lần thay đổi</div>
                    <div className={styles.value}>{partner.changeCount}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>GP hoạt động </div>
                    <div className={styles.value}>{partner.opLiscenseNo}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Ngày cấp</div>
                    <div className={styles.value}>{partner.opIssueDate}</div>
                </div><div className={styles.row}>
                    <div className={styles.label}>Điện thoại</div>
                    <div className={styles.value}>{partner.mobile}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Email</div>
                    <div className={styles.value}>{partner.email}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Website</div>
                    <div className={styles.value}>{partner.website}</div>
                </div>
            </div>
            {/* Footer */}
            <div className={styles.footer}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    <X size={15}/>
                    Đóng
                </button>
            </div>
        </div>
    )
}