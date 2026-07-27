'use client';

import { useState, useCallback } from 'react';
import { NotificationItem, NotificationType } from '@/components/shared/Notification/Notification';

let notificationCounter = 0;

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback(
    (
      type: NotificationType,
      title: string,
      message?: string,
      duration?: number,
    ) => {
      notificationCounter += 1;
      const id = `notification-${notificationCounter}`;
      setNotifications((prev) => [...prev, { id, type, title, message, duration }]);
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notifySuccess = useCallback(
    (title: string, message?: string) => addNotification('success', title, message),
    [addNotification],
  );

  const notifyError = useCallback(
    (title: string, message?: string) => addNotification('error', title, message),
    [addNotification],
  );

  const notifyWarning = useCallback(
    (title: string, message?: string) => addNotification('warning', title, message),
    [addNotification],
  );

  const notifyInfo = useCallback(
    (title: string, message?: string) => addNotification('info', title, message),
    [addNotification],
  );

  return {
    notifications,
    removeNotification,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  };
}
