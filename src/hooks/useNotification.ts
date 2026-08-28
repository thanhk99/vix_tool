'use client';

import { useCallback } from 'react';
import { create } from 'zustand';
import { NotificationItem, NotificationType } from '@/components/shared/Notification/Notification';

interface NotificationStore {
  notifications: NotificationItem[];
  addNotification: (type: NotificationType, title: string, message?: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

let notificationCounter = 0;

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (type, title, message, duration) => {
    notificationCounter += 1;
    const id = `notification-${notificationCounter}`;
    set((state) => ({
      notifications: [...state.notifications, { id, type, title, message, duration }]
    }));
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }));
  }
}));

export function useNotification() {
  const notifications = useNotificationStore((state) => state.notifications);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

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
