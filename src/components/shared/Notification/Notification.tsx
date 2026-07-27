'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './Notification.module.css';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationProps {
  item: NotificationItem;
  onClose: (id: string) => void;
}

const ICON_MAP: Record<NotificationType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export function Notification({ item, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const duration = item.duration ?? 4000;

  const handleClose = useCallback(() => {
    setIsVisible(false);
    // Wait for animation before removing
    setTimeout(() => onClose(item.id), 200);
  }, [item.id, onClose]);

  useEffect(() => {
    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  return (
    <div
      className={`${styles.notification} ${styles[item.type]} ${isVisible ? styles.visible : styles.hidden}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span className={styles.icon} aria-hidden="true">
        {ICON_MAP[item.type]}
      </span>
      <div className={styles.content}>
        <span className={styles.title}>{item.title}</span>
        {item.message && <span className={styles.message}>{item.message}</span>}
      </div>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={handleClose}
        aria-label="Đóng thông báo"
      >
        ✕
      </button>
    </div>
  );
}

/* ============================================
   NotificationContainer – renders all toasts
   ============================================ */
interface NotificationContainerProps {
  items: NotificationItem[];
  onClose: (id: string) => void;
}

export default function NotificationContainer({ items, onClose }: NotificationContainerProps) {
  if (items.length === 0) return null;

  return (
    <div className={styles.container} aria-label="Thông báo">
      {items.map((item) => (
        <Notification key={item.id} item={item} onClose={onClose} />
      ))}
    </div>
  );
}
