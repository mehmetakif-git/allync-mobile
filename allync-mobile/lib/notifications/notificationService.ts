// =====================================================
// Push Notification Service
// =====================================================

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../supabase';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get Expo push token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Permission not granted for push notifications');
      return null;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        console.error('❌ Project ID not found');
        return null;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      console.log('✅ Push token:', token);
    } catch (error) {
      console.error('❌ Error getting push token:', error);
    }
  } else {
    console.log('ℹ️ Must use physical device for push notifications');
  }

  return token;
}

/**
 * Save push token to user profile in Supabase
 */
export async function savePushTokenToProfile(userId: string, pushToken: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        push_token: pushToken,
        push_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error saving push token:', error);
      throw error;
    }

    console.log('✅ Push token saved to profile');
  } catch (error) {
    console.error('❌ Failed to save push token:', error);
    throw error;
  }
}

/**
 * Remove push token from user profile (logout/disable notifications)
 */
export async function removePushTokenFromProfile(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        push_token: null,
        push_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    console.log('✅ Push token removed from profile');
  } catch (error) {
    console.error('❌ Failed to remove push token:', error);
  }
}

/**
 * Send a local notification (for testing or immediate notifications)
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      badge: 1,
    },
    trigger: null, // Send immediately
  });
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Set up notification listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) {
  // Listener for when notification is received while app is open
  const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log('📬 Notification received:', notification);
    onNotificationReceived?.(notification);
  });

  // Listener for when user taps on notification
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('👆 Notification tapped:', response);
    onNotificationTapped?.(response);
  });

  // Return cleanup function
  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge
 */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
