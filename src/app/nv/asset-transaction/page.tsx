'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import AssetCatalogTab from './component/AssetCatalogTab';
import AssetPledgeTab from './component/AssetPledgeTab';

export default function AssetTransactionPage() {
    const [activeTab, setActiveTab] = useState<'catalog' | 'pledge'>('catalog');

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>Quản lý tài sản đảm bảo</div>
            </div>
            
            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === 'catalog' ? styles.active : ''}`}
                    onClick={() => setActiveTab('catalog')}
                >
                    Danh mục tài sản
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'pledge' ? styles.active : ''}`}
                    onClick={() => setActiveTab('pledge')}
                >
                    Cầm cố / Giải tỏa TSĐB
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'catalog' && <AssetCatalogTab />}
                {activeTab === 'pledge' && <AssetPledgeTab />}
            </div>
        </div>
    );
}
