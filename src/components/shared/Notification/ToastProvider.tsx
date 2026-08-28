'use client';

import React from 'react';
import NotificationContainer from '@/components/shared/Notification/Notification';
import { useNotification } from '@/hooks/useNotification';

export default function ToastProvider() {
  const { notifications, removeNotification } = useNotification();
  return <NotificationContainer items={notifications} onClose={removeNotification} />;
}
