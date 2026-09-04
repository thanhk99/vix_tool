'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api/auth.api';
import { auditApi, AuditLog } from '@/lib/api/audit.api';
import { formatDateTime } from '@/utils/format';
import styles from './page.module.css';


export default function ProfilePage() {
    const [userProfile, setUserProfile] = useState<any>(null);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const profileRes = await authApi.getMe();
                if (profileRes.success) {
                    setUserProfile(profileRes.data);
                }
                const logsRes = await auditApi.getMyLogs();
                if (logsRes.success) {
                    setLogs(logsRes.data || []);
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return <div className={styles.container}>Đang tải dữ liệu...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Thông tin cá nhân</h1>
                <p className={styles.subtitle}>Xem thông tin chi tiết và lịch sử thao tác của bạn</p>
            </div>

            <div className={styles.content}>
                <div className={styles.profileSection}>
                    <h2 className={styles.sectionTitle}>Hồ sơ của tôi</h2>
                    {userProfile ? (
                        <div className={styles.infoCard}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Họ và tên:</span>
                                <span className={styles.value}>{userProfile.fullName}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Email:</span>
                                <span className={styles.value}>{userProfile.email}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Vai trò:</span>
                                <span className={styles.value}>{userProfile.roles?.join(', ')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.noData}>Không tải được thông tin cá nhân.</div>
                    )}
                </div>

                <div className={styles.logsSection}>
                    <h2 className={styles.sectionTitle}>Lịch sử thao tác (Audit Logs)</h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Module</th>
                                    <th>Hành động</th>
                                    <th>Mô tả</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length > 0 ? (
                                    logs.map((log) => (
                                        <tr key={log.id}>
                                            <td>{formatDateTime(log.timestamp)}</td>
                                            <td>{log.module}</td>
                                            <td>
                                                <span className={`${styles.badge} ${styles[log.action.toLowerCase()] || styles.defaultBadge}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>{log.description}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className={styles.emptyRow}>
                                            Chưa có dữ liệu lịch sử thao tác.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
