import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView, RNCBlurView } from './BlurViewCompat';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius, Shadows } from '../constants/Spacing';
interface DashboardHeaderProps {
  userName: string;
  userInitial: string;
  onNotificationPress: () => void;
  onSignOutPress: () => void;
  unreadCount: number;
  bellAnimatedStyle?: any;
}
export default function DashboardHeader({
  userName,
  userInitial,
  onNotificationPress,
  onSignOutPress,
  unreadCount,
  bellAnimatedStyle,
}: DashboardHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.headerContainer}>
      {/* Glassmorphism Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={
            true
              ? ['rgba(10, 14, 39, 0.95)', 'rgba(10, 14, 39, 0.8)']
              : ['rgba(248, 249, 250, 0.95)', 'rgba(248, 249, 250, 0.8)']
          }
          style={StyleSheet.absoluteFillObject}
        />
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
            {/* Top edge highlight gradient */}
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
        {/* Border */}
        <View
          style={[
            styles.headerBorder,
            {
              borderBottomColor: true
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)',
            },
          ]}
        />
      </View>
      {/* Content */}
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[Colors.blue[500], Colors.cyan[500]]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{userInitial}</Text>
            </LinearGradient>
          </View>
          <View>
            <Text style={[styles.greeting, { color: colors.textTertiary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {userName}
            </Text>
          </View>
        </View>
        {/* Notification Bell */}
        <TouchableOpacity
          onPress={onNotificationPress}
          activeOpacity={0.7}
          style={styles.notificationButton}
        >
          <Animated.View style={bellAnimatedStyle}>
            <Ionicons
              name="notifications"
              size={24}
              color={unreadCount > 0 ? Colors.blue[400] : colors.textSecondary}
            />
          </Animated.View>
          {unreadCount > 0 && (
            <View style={[styles.notificationBadge, { backgroundColor: Colors.red[500] }]}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {/* Sign Out Button */}
        <TouchableOpacity onPress={onSignOutPress} style={styles.signOutButton}>
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']}
            style={styles.signOutGradient}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.red[400]} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? Spacing['5xl'] : Spacing['4xl'],
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    position: 'relative',
  },
  headerBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatarContainer: {
    ...Shadows.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.titanium,
  },
  greeting: {
    fontSize: Typography.fontSize.sm,
    marginBottom: 2,
  },
  userName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'capitalize',
  },
  notificationButton: {
    position: 'relative',
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  signOutButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  signOutGradient: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
});
