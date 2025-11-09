import { supabase } from '../supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface SystemNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'maintenance' | 'service';
  title: string;
  message: string;
  icon?: string | null;
  action_url?: string | null;
  action_label?: string | null;
  target_audience: 'all' | 'super_admins' | 'company_admins' | 'users' | 'specific_companies';
  target_company_ids?: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
  expires_at?: string | null;
  is_active: boolean;
  deleted_at?: string | null;
}

export interface UserNotification {
  id: string;
  user_id: string;
  notification_id: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  notification?: SystemNotification;
}

export interface NotificationWithReadStatus extends SystemNotification {
  is_read: boolean;
  read_at?: string | null;
  user_notification_id?: string;
}

// =====================================================
// USER - PERSONAL NOTIFICATIONS
// =====================================================

// Get user's notifications with read status
export async function getUserNotifications(userId: string, filters?: {
  is_read?: boolean;
  type?: SystemNotification['type'];
  limit?: number;
}): Promise<NotificationWithReadStatus[]> {

  console.log('📱 [Mobile API] getUserNotifications', { userId, filters });

  let query = supabase
    .from('user_notifications')
    .select(`
      id,
      is_read,
      read_at,
      created_at,
      notification:system_notifications!inner(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (filters?.is_read !== undefined) {
    query = query.eq('is_read', filters.is_read);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ getUserNotifications failed', error);
    throw error;
  }

  console.log('✅ User notifications fetched', { count: data?.length || 0 });

  // Transform data to include read status
  const notifications: NotificationWithReadStatus[] = data
    ?.filter((un: any) => {
      // Filter out notifications that are:
      // 1. Null/undefined
      // 2. Deleted (deleted_at is not null)
      // 3. Inactive (is_active is false)
      return (
        un.notification &&
        !un.notification.deleted_at &&
        un.notification.is_active !== false
      );
    })
    .map((un: any) => ({
      ...un.notification,
      is_read: un.is_read,
      read_at: un.read_at,
      user_notification_id: un.id,
    })) || [];

  // Apply type filter if specified
  if (filters?.type) {
    return notifications.filter(n => n.type === filters.type);
  }

  return notifications;
}

// Get unread notification count
export async function getUnreadCount(userId: string): Promise<number> {
  console.log('📱 [Mobile API] getUnreadCount', { userId });

  // Get unread notifications with JOIN to check system_notifications status
  const { data, error } = await supabase
    .from('user_notifications')
    .select(`
      id,
      notification:system_notifications!inner(id, is_active, deleted_at)
    `)
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('❌ getUnreadCount failed', error);
    throw error;
  }

  // Filter out deleted or inactive notifications
  const activeUnreadCount = data?.filter((un: any) =>
    un.notification &&
    !un.notification.deleted_at &&
    un.notification.is_active !== false
  ).length || 0;

  console.log('✅ Unread count fetched', { count: activeUnreadCount });
  return activeUnreadCount;
}

// Mark notification as read
export async function markAsRead(userNotificationId: string): Promise<UserNotification> {
  console.log('📱 [Mobile API] markAsRead', { id: userNotificationId });

  const { data, error } = await supabase
    .from('user_notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', userNotificationId)
    .select()
    .single();

  if (error) {
    console.error('❌ markAsRead failed', error);
    throw error;
  }

  console.log('✅ Marked as read');
  return data as UserNotification;
}

// Mark all notifications as read for a user
export async function markAllAsRead(userId: string): Promise<UserNotification[]> {
  console.log('📱 [Mobile API] markAllAsRead', { userId });

  const { data, error } = await supabase
    .from('user_notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select();

  if (error) {
    console.error('❌ markAllAsRead failed', error);
    throw error;
  }

  console.log('✅ All notifications marked as read', { count: data?.length || 0 });
  return (data || []) as UserNotification[];
}

// Delete user notification (remove from personal list)
export async function deleteUserNotification(userNotificationId: string): Promise<void> {
  console.log('📱 [Mobile API] deleteUserNotification', { id: userNotificationId });

  const { error } = await supabase
    .from('user_notifications')
    .delete()
    .eq('id', userNotificationId);

  if (error) {
    console.error('❌ deleteUserNotification failed', error);
    throw error;
  }

  console.log('✅ User notification deleted');
}

// Clear all read notifications for a user
export async function clearReadNotifications(userId: string): Promise<void> {
  console.log('📱 [Mobile API] clearReadNotifications', { userId });

  const { error } = await supabase
    .from('user_notifications')
    .delete()
    .eq('user_id', userId)
    .eq('is_read', true);

  if (error) {
    console.error('❌ clearReadNotifications failed', error);
    throw error;
  }

  console.log('✅ Read notifications cleared');
}

// =====================================================
// REALTIME SUBSCRIPTION
// =====================================================

// Subscribe to user notifications changes
export function subscribeToUserNotifications(
  userId: string,
  callback: (notification: NotificationWithReadStatus) => void
): any {
  console.log('🔔 [Mobile] Setting up realtime subscription for notifications');

  const subscription = supabase
    .channel(`user-notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_notifications',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        console.log('🔔 [Mobile] New notification received', { id: payload.new.id });

        // Fetch full notification details
        const { data } = await supabase
          .from('user_notifications')
          .select(`
            id,
            is_read,
            read_at,
            created_at,
            notification:system_notifications(*)
          `)
          .eq('id', payload.new.id)
          .single();

        if (data && data.notification) {
          const notificationWithStatus: NotificationWithReadStatus = {
            ...data.notification,
            is_read: data.is_read,
            read_at: data.read_at,
            user_notification_id: data.id,
          };
          callback(notificationWithStatus);
        }
      }
    )
    .subscribe();

  return subscription;
}

// Unsubscribe from notifications
export function unsubscribeFromNotifications(subscription: any): void {
  console.log('🔕 [Mobile] Cleaning up notification subscription');
  if (subscription) {
    supabase.removeChannel(subscription);
  }
}

// =====================================================
// EXPORT
// =====================================================

export default {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteUserNotification,
  clearReadNotifications,
  subscribeToUserNotifications,
  unsubscribeFromNotifications,
};
