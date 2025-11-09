import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Spacing, BorderRadius } from '../constants/Spacing';
import { useNotifications } from '../contexts/NotificationContext';

export default function NotificationPermissionBanner() {
  const { isNotificationEnabled, requestPermissions } = useNotifications();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if already enabled or dismissed
  if (isNotificationEnabled || isDismissed) {
    return null;
  }

  const handleEnableNotifications = async () => {
    const granted = await requestPermissions();
    if (granted) {
      setIsDismissed(true);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(600).springify()}
      exiting={FadeOutUp.duration(400)}
      style={styles.container}
    >
      <BlurView intensity={20} tint="dark" style={styles.blur}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="notifications" size={28} color={Colors.blue[400]} />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Enable Push Notifications</Text>
            <Text style={styles.subtitle}>
              Get instant updates about your services, invoices, and support tickets
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.enableButton]}
              onPress={handleEnableNotifications}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.enableButtonText}>Enable</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={() => setIsDismissed(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dismissButtonText}>Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    padding: Spacing.lg,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  textContainer: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  enableButton: {
    backgroundColor: Colors.blue[500],
  },
  enableButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dismissButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dismissButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
});
