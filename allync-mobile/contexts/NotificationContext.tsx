// =====================================================
// Notification Context
// =====================================================

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAuth } from './AuthContext';
import {
  registerForPushNotificationsAsync,
  savePushTokenToProfile,
  removePushTokenFromProfile,
  setupNotificationListeners,
  areNotificationsEnabled,
  requestNotificationPermissions,
  sendLocalNotification,
  clearBadge,
  setBadgeCount,
} from '../lib/notifications/notificationService';

interface NotificationContextType {
  expoPushToken: string | null;
  isNotificationEnabled: boolean;
  requestPermissions: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: null,
  isNotificationEnabled: false,
  requestPermissions: async () => false,
  sendTestNotification: async () => {},
  clearNotifications: async () => {},
  unreadCount: 0,
  setUnreadCount: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useAuth();
  const router = useRouter();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();

    // Set up notification listeners
    const cleanup = setupNotificationListeners(
      // When notification is received
      (notification) => {
        console.log('📬 Notification received in app:', notification);
        // Increment badge count
        setUnreadCount((prev) => {
          const newCount = prev + 1;
          setBadgeCount(newCount);
          return newCount;
        });
      },
      // When notification is tapped
      (response) => {
        console.log('👆 Notification tapped:', response);
        handleNotificationTap(response);
      }
    );

    return cleanup;
  }, []);

  // Register push token when user logs in
  useEffect(() => {
    if (user && expoPushToken) {
      savePushTokenToProfile(user.id, expoPushToken).catch(console.error);
    }
  }, [user, expoPushToken]);

  // Remove push token when user logs out
  useEffect(() => {
    if (!user && expoPushToken) {
      // User logged out, clear push token
      setExpoPushToken(null);
      setUnreadCount(0);
      clearBadge();
    }
  }, [user]);

  const initializeNotifications = async () => {
    try {
      // Check if notifications are already enabled
      const enabled = await areNotificationsEnabled();
      setIsNotificationEnabled(enabled);

      if (enabled) {
        // Register for push notifications
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);
      }
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
    }
  };

  const handleNotificationTap = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;

    // Navigate based on notification type
    if (data?.type === 'support_ticket') {
      router.push('/support');
    } else if (data?.type === 'whatsapp_message') {
      router.push('/whatsapp');
    } else if (data?.type === 'service_update') {
      router.push('/services');
    } else if (data?.screen) {
      router.push(data.screen);
    } else {
      // Default: go to notifications tab
      router.push('/(tabs)/notifications');
    }

    // Clear badge when user taps notification
    clearBadge();
    setUnreadCount(0);
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const granted = await requestNotificationPermissions();
      setIsNotificationEnabled(granted);

      if (granted) {
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);

        if (token && user) {
          await savePushTokenToProfile(user.id, token);
        }
      }

      return granted;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  };

  const sendTestNotification = async () => {
    try {
      await sendLocalNotification(
        '🎉 Test Notification',
        'This is a test notification from Allync!',
        { type: 'test' }
      );
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    }
  };

  const clearNotifications = async () => {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await clearBadge();
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  };

  const value: NotificationContextType = {
    expoPushToken,
    isNotificationEnabled,
    requestPermissions,
    sendTestNotification,
    clearNotifications,
    unreadCount,
    setUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
