import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';
interface ConfirmationDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: string;
  isLoading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
}
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
export default function ConfirmationDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmColor = Colors.red[500],
  isLoading = false,
  icon = 'warning',
  iconColor = Colors.orange[500],
  iconBg = `${Colors.orange[500]}20`,
}: ConfirmationDialogProps) {
  const { colors } = useTheme();
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        {/* Background Blur */}
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={StyleSheet.absoluteFillObject}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={isLoading ? undefined : onClose}
            style={StyleSheet.absoluteFillObject}
          >
            <BlurView
              intensity={true ? 95 : 100}
              tint={'dark'}
              style={StyleSheet.absoluteFillObject}
            />
          </TouchableOpacity>
        </Animated.View>
        {/* Dialog Card */}
        <AnimatedTouchable
          entering={ZoomIn.duration(300).springify().damping(15).stiffness(150)}
          exiting={FadeOut.duration(150)}
          activeOpacity={1}
          style={[
            styles.dialogCard,
            {
              backgroundColor: 'rgba(43, 44, 44, 0.3)',
              borderColor:
                'rgba(248, 249, 250, 0.1)',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
              <Ionicons name={icon} size={28} color={iconColor} />
            </View>
            {!isLoading && (
              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor:
                      'rgba(248, 249, 250, 0.1)',
                  },
                ]}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          </View>
          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isLoading}
              style={[
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor:
                    'rgba(248, 249, 250, 0.1)',
                  opacity: isLoading ? 0.5 : 1,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.buttonText,
                  styles.cancelButtonText,
                  { color: colors.textSecondary },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isLoading}
              style={[
                styles.button,
                styles.confirmButton,
                {
                  backgroundColor: confirmColor,
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={[styles.buttonText, styles.confirmButtonText]}>
                    Processing...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.buttonText, styles.confirmButtonText]}>
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </AnimatedTouchable>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight['2xl'] * 1.2,
  },
  message: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base * 1.4,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 52,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(248, 249, 250, 0.1)',
  },
  confirmButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  cancelButtonText: {
    // color is set dynamically
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
