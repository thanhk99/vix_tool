'use client';

import apiClient from "@/lib/api/client";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { UsersRound, X } from "lucide-react";
import { PartnersItem } from "@/types/funding.types";
// import SignatureTab from "@/app/nv/partner/component/partners/SignatureTab";
// import AuthorizationTab from "@/app/nv/partner/component/partners/AuthorizationTab";
import { useNotification } from "@/hooks/useNotification";
import SignatureTab from "../../component/SignatureTab";
import AssetTab from "../../component/AssetTab";
import CrelimitTab from "../../component/CrelimitTab";
import CustommerTypeTab from "../../component/CustommerTypeTab";
import AuthorizationTab from "../../component/AuthorizationTab";
import Button from "@/components/shared/Button/Button";

export default function PartnerView() {
    const params = useParams();
    const router = useRouter();
    const partnerId = params.id as string;
    const [partner, setPartner] = useState<PartnersItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'signature' | 'authorization' | 'custommertype' | 'asset' | 'limit'>('signature');
    const { notifyError } = useNotification();

    // getStatusClass 
    const STATUS_CLASS = {
        ACTIVE: styles.active,
        PENDING: styles.pending,
        INACTIVE: styles.inactive,
    };

    const getStatusClass = (status: string) => STATUS_CLASS[status as keyof typeof STATUS_CLASS] ?? "";

    useEffect(() => {
        const fetchPartner = async() => {
            try {
                const res = await apiClient.get(`/v1/capital-source/partners/${partnerId}`);
                setPartner(res.data.data || res.data)
            } catch (error) {
                setError('Không thể tải thông tin.');
                notifyError('Lỗi', 'Không thể tải thông tin đối tác!');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if(partnerId) fetchPartner();
    }, [partnerId]);

    // VERIFY: Kiểm tra dữ liệu partner
    if (!loading && !error && !partner) {
        notifyError('Lỗi', 'Không tìm thấy đối tác!');
    }

    if (loading) return <div className={styles.loading}>Đang tải dữ liệu...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!partner) return <div className={styles.error}>Không tìm thấy đối tác</div>;
    return (
        <div className={styles.container}>
            {/* Title */}
            <div className={styles.title}>
                <UsersRound size={25}/>
                <h1>Thông tin chung</h1>
            </div>

            {/* Detail Information */}
            <div className={styles.content}>
                <div className={styles.row}>
                    <div className={styles.label}>Mã KH</div>
                    <div className={styles.value}>{partner.cusId}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Mã đơn vị GD</div>
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
                    <div className={styles.label}>Địa chỉ</div>
                    <div className={styles.value}>{partner.address}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Số ĐKKD/CCCD</div>
                    <div className={styles.value}>{partner.idCode}</div>
                </div>
                <div className={styles.row}>
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
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Số lần thay đổi</div>
                    <div className={styles.value}>{partner.changeCount}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>GP hoạt động</div>
                    <div className={styles.value}>{partner.opLiscenseNo}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Ngày cấp GP</div>
                    <div className={styles.value}>{partner.opIssueDate}</div>
                </div>
                <div className={styles.row}>
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
                <div className={styles.row}>
                    <div className={styles.label}>Loại khách hàng</div>
                    <div className={styles.value}>{partner.cusType}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Loại hình kinh doanh</div>
                    <div className={styles.value}>{partner.businessType}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Nhà đầu tư chuyên nghiệp</div>
                    <div className={styles.value}>{partner.professionalInvestor ? "Có" : "Không"}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Ngày bắt đầu NĐT chuyên nghiệp</div>
                    <div className={styles.value}>{partner.professionalStartDate}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Ngày kết thúc NĐT chuyên nghiệp</div>
                    <div className={styles.value}>{partner.professionalEndDate}</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Trạng thái</div>
                    <div className={styles.value}>
                        <span className={`${styles.status} ${getStatusClass(partner.status)}`}>
                            {partner.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <Button variant="bordernone"
                    className={`${styles.tab} ${activeTab === 'signature' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('signature')}
                >
                    Chữ ký
                </Button>
                <Button variant="bordernone"
                    className={`${styles.tab} ${activeTab === 'authorization' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('authorization')}
                >
                    UQ / Người đại diện PL
                </Button>
                <Button variant="bordernone"
                    className={`${styles.tab} ${activeTab === 'custommertype' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('custommertype')}
                >
                    Loại hình KH
                </Button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {activeTab === 'signature' && (
                    <SignatureTab/>
                )}
                {activeTab === 'authorization' && (
                    <AuthorizationTab partnerId={partnerId} />
                )}
                {activeTab === 'custommertype' && (
                    <CustommerTypeTab partnerId={partnerId} />
                )}
            </div>
            {/* Footer */}
            <div className={styles.footer}>
                <Button variant="outline" onClick={() => router.back()} className={styles.backBtn}>
                    Đóng
                </Button>
            </div>
        </div>
    )
}