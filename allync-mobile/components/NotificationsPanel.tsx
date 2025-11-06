import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
  FadeInDown,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView, RNCBlurView } from './BlurViewCompat';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';
// Mock API functions - replace with actual API
const getUserNotifications = async (userId: string, options?: { limit?: number }) => {
  return [
    {
      id: '1',
      user_notification_id: 'un1',
      title: 'Welcome to Allync AI',
      message: 'Thank you for joining us! Explore our services and get started.',
      type: 'info',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_notification_id: 'un2',
      title: 'Service Request Approved',
      message: 'Your WhatsApp Automation service request has been approved.',
      type: 'success',
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
};
const getUnreadCount = async (userId: string) => {
  return 2;
};
const markAsRead = async (userNotificationId: string) => {
  console.log('Marking notification as read:', userNotificationId);
};
const markAllAsRead = async (userId: string) => {
  console.log('Marking all notifications as read for user:', userId);
};
const clearReadNotifications = async (userId: string) => {
  console.log('Clearing read notifications for user:', userId);
};
interface NotificationsPanelProps {
  visible: boolean;
  onClose: () => void;
  onNotificationRead?: () => void;
  onMarkAllRead?: () => void;
}
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
export default function NotificationsPanel({
  visible,
  onClose,
  onNotificationRead,
  onMarkAllRead,
}: NotificationsPanelProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible, user?.id]);
  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      setError(null);
      const [notifs, count] = await Promise.all([
        getUserNotifications(user.id, { limit: 20 }),
        getUnreadCount(user.id),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };
  const handleMarkAsRead = async (userNotificationId: string) => {
    try {
      await markAsRead(userNotificationId);
      setNotifications(
        notifications.map((n) =>
          n.user_notification_id === userNotificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      onNotificationRead?.();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };
  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await markAllAsRead(user.id);
      setNotifications(
        notifications.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
      onMarkAllRead?.();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };
  const handleClearAll = async () => {
    if (!user?.id) return;
    try {
      await clearReadNotifications(user.id);
      setNotifications(notifications.filter((n) => !n.is_read));
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          color: Colors.green[500],
          bg: `${Colors.green[500]}20`,
        };
      case 'warning':
        return {
          icon: 'warning',
          color: Colors.yellow[500],
          bg: `${Colors.yellow[500]}20`,
        };
      case 'info':
        return {
          icon: 'information-circle',
          color: Colors.blue[500],
          bg: `${Colors.blue[500]}20`,
        };
      case 'maintenance':
        return {
          icon: 'construct',
          color: Colors.orange[500],
          bg: `${Colors.orange[500]}20`,
        };
      case 'service':
        return {
          icon: 'flash',
          color: Colors.purple[500],
          bg: `${Colors.purple[500]}20`,
        };
      default:
        return {
          icon: 'notifications',
          color: Colors.gray[500],
          bg: `${Colors.gray[500]}20`,
        };
    }
  };
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };
  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={StyleSheet.absoluteFillObject}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={onClose}
            style={StyleSheet.absoluteFillObject}
          >
            <BlurView
              intensity={true ? 95 : 100}
              tint={'dark'}
              style={StyleSheet.absoluteFillObject}
            />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          entering={SlideInRight.duration(400)}
          exiting={SlideOutRight.duration(500)}
          style={styles.panel}
        >
          {/* Glassmorphism background */}
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={95}
              tint={'dark'}
              style={StyleSheet.absoluteFillObject}
            >
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    backgroundColor: 'rgba(43, 44, 44, 0.3)',
                  },
                ]}
              />
            </BlurView>
          ) : (
            // Android: Real blur with RNC BlurView
            <RNCBlurView
              style={StyleSheet.absoluteFillObject}
              blurType={'dark'}
              blurAmount={5}
              reducedTransparencyFallbackColor={
                'rgba(10, 14, 39, 0.85)'
              }
            >
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    backgroundColor: 'rgba(43, 44, 44, 0.3)',
                  },
                ]}
              />
              {/* Top edge highlight gradient - creates glass effect */}
              <LinearGradient
                colors={
                  true
                    ? ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.03)', 'transparent']
                    : ['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.15)', 'transparent']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.5 }}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />
              {/* Bottom subtle shine */}
              <LinearGradient
                colors={
                  true
                    ? ['transparent', 'rgba(255, 255, 255, 0.04)']
                    : ['transparent', 'rgba(255, 255, 255, 0.25)']
                }
                start={{ x: 0, y: 0.6 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />
            </RNCBlurView>
          )}
          {/* Border with gradient effect */}
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderWidth: 1,
                borderColor: true
                  ? 'rgba(255, 255, 255, 0.25)'
                  : 'rgba(255, 255, 255, 0.5)',
              },
            ]}
            pointerEvents="none"
          />
          <TouchableOpacity activeOpacity={1} style={styles.panelContent}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: 'rgba(248, 249, 250, 0.1)' }]}>
              <View style={styles.headerLeft}>
                <Ionicons name="notifications" size={28} color={Colors.blue[500]} />
                <View>
                  <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                  {unreadCount > 0 && (
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                      {unreadCount} unread
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: 'rgba(248, 249, 250, 0.1)',
                  }
                ]}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            {/* Actions */}
            {notifications.length > 0 && (
              <View style={[styles.actions, {
                borderBottomColor: true ? 'rgba(248, 249, 250, 0.05)' : 'rgba(43, 44, 44, 0.05)',
                backgroundColor: 'rgba(43, 44, 44, 0.3)',
              }]}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={handleMarkAllAsRead}
                    style={[styles.actionButton, {
                      backgroundColor: `${Colors.blue[500]}15`,
                      borderColor: `${Colors.blue[500]}30`,
                    }]}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark-done" size={16} color={Colors.blue[500]} />
                    <Text style={[styles.actionText, { color: Colors.blue[500] }]}>
                      Mark all read
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleClearAll}
                  style={[styles.actionButton, {
                    backgroundColor: `${Colors.red[500]}15`,
                    borderColor: `${Colors.red[500]}30`,
                  }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.red[500]} />
                  <Text style={[styles.actionText, { color: Colors.red[500] }]}>Clear read</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.blue[500]} />
                </View>
              ) : error ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="alert-circle" size={48} color={Colors.red[500]} />
                  <Text style={[styles.emptyText, { color: Colors.red[400] }]}>{error}</Text>
                  <TouchableOpacity onPress={fetchNotifications} style={styles.retryButton}>
                    <Text style={[styles.retryText, { color: Colors.blue[400] }]}>Try again</Text>
                  </TouchableOpacity>
                </View>
              ) : notifications.length === 0 ? (
                <Animated.View entering={FadeIn.duration(400)} style={styles.emptyContainer}>
                  <View
                    style={[
                      styles.emptyIcon,
                      {
                        backgroundColor: 'rgba(43, 44, 44, 0.5)',
                      },
                    ]}
                  >
                    <Ionicons name="notifications-off" size={48} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    You're all caught up!
                  </Text>
                </Animated.View>
              ) : (
                <View style={styles.notificationsList}>
                  {notifications.map((notification, index) => {
                    const { icon, color, bg } = getNotificationStyle(notification.type);
                    return (
                      <AnimatedTouchable
                        key={notification.user_notification_id}
                        entering={FadeInDown.duration(400).delay(index * 50)}
                        onPress={() => {
                          if (!notification.is_read && notification.user_notification_id) {
                            handleMarkAsRead(notification.user_notification_id);
                          }
                        }}
                        activeOpacity={0.7}
                        style={[
                          styles.notificationItem,
                          {
                            backgroundColor: notification.is_read
                              ? 'transparent'
                              : true
                              ? `${Colors.blue[500]}10`
                              : `${Colors.blue[500]}05`,
                            borderColor: true
                              ? 'rgba(248, 249, 250, 0.05)'
                              : 'rgba(43, 44, 44, 0.05)',
                          },
                        ]}
                      >
                        <View style={[styles.notificationIcon, { backgroundColor: bg }]}>
                          <Ionicons name={icon as any} size={24} color={color} />
                        </View>
                        <View style={styles.notificationContent}>
                          <View style={styles.notificationHeader}>
                            <Text
                              style={[styles.notificationTitle, { color: colors.text }]}
                              numberOfLines={2}
                            >
                              {notification.title}
                            </Text>
                            {!notification.is_read && (
                              <View style={[styles.unreadDot, { backgroundColor: Colors.blue[500] }]} />
                            )}
                          </View>
                          <Text
                            style={[styles.notificationMessage, { color: colors.textSecondary }]}
                            numberOfLines={2}
                          >
                            {notification.message}
                          </Text>
                          <View style={styles.notificationFooter}>
                            <Ionicons name="time" size={12} color={colors.textSecondary} />
                            <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                              {formatTimestamp(notification.created_at)}
                            </Text>
                          </View>
                        </View>
                      </AnimatedTouchable>
                    );
                  })}
                </View>
              )}
            </ScrollView>
            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: `${Colors.blue[500]}05` }]}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                System-wide announcements from Allync AI
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 450 : undefined,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  panelContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? Spacing['5xl'] : Spacing['4xl'],
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  actionText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? Spacing['5xl'] : Spacing['4xl'],
  },
  loadingContainer: {
    paddingVertical: Spacing['5xl'],
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: Spacing['5xl'],
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  retryButton: {
    marginTop: Spacing.md,
  },
  retryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  notificationsList: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  notificationTitle: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.sm * 1.3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    marginTop: 4,
  },
  notificationMessage: {
    fontSize: Typography.fontSize.xs,
    lineHeight: Typography.lineHeight.xs * 1.4,
    marginBottom: Spacing.sm,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationTime: {
    fontSize: Typography.fontSize.xs,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing['3xl'] : Spacing.xl,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.xs * 1.4,
  },
});
