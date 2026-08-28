import React from 'react';
import { Construction } from 'lucide-react';
import styles from './UnderConstruction.module.css';

export default function UnderConstruction({ title }: { title?: string }) {
  return (
    <div className={styles.container}>
      <Construction className={styles.icon} size={64} />
      <h2 className={styles.title}>{title || 'Trang đang phát triển'}</h2>
      <p className={styles.description}>
        Tính năng này đang trong quá trình xây dựng và sẽ sớm ra mắt.
      </p>
    </div>
  );
}
