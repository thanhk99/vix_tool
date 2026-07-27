'use client';

import React from 'react';
import styles from './page.module.css';

export default function BGDDashboardPage() {
  const stats = [
    { title: 'Văn bản chờ duyệt', value: '12', change: '+2 hôm nay' },
    { title: 'Nhân sự mới', value: '5', change: 'Tháng này' },
    { title: 'Báo cáo cần xem', value: '3', change: 'Chưa đọc' },
    { title: 'Lịch họp sắp tới', value: '2', change: 'Hôm nay' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tổng quan</h1>
        <p className={styles.subtitle}>Theo dõi các chỉ số và công việc quan trọng</p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <span className={styles.statTitle}>{stat.title}</span>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statChange}>↑ {stat.change}</span>
          </div>
        ))}
      </div>

      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Hoạt động gần đây</h2>
        <p className="text-gray-500">Chưa có hoạt động nào nổi bật.</p>
      </div>
    </div>
  );
}
