import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';
// Mock API function - replace with actual API
const getActiveMaintenanceWindow = async () => {
  // This should fetch from your backend
  return {
    id: '1',
    message_en: 'We are upgrading our systems to serve you better.',
    message_tr: 'Size daha iyi hizmet vermek için sistemlerimizi yükseltiyoruz.',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    affected_services: ['WhatsApp Automation', 'Calendar Integration'],
  };
};
export default function MaintenancePage() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [maintenanceWindow, setMaintenanceWindow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 500 }),
        withTiming(-15, { duration: 500 }),
        withTiming(0, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);
  const animatedWrenchStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  useEffect(() => {
    loadMaintenanceWindow();
  }, []);
  useEffect(() => {
    if (!maintenanceWindow) return;
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(maintenanceWindow.end_time).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeRemaining(language === 'en' ? 'Maintenance ending soon...' : 'Bakım yakında bitiyor...');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [maintenanceWindow, language]);
  const loadMaintenanceWindow = async () => {
    try {
      setIsLoading(true);
      const window = await getActiveMaintenanceWindow();
      setMaintenanceWindow(window);
    } catch (error) {
      console.error('Failed to load maintenance window:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await loadMaintenanceWindow();
    setRefreshing(false);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'en' ? 'en-US' : 'tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={
            true
              ? ['#1a1a1a', '#2b2c2c', '#1a1a1a']
              : ['#f8f9fa', '#e9ecef', '#f8f9fa']
          }
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.orange[500]} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {language === 'en' ? 'Loading...' : 'Yükleniyor...'}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          true
            ? ['#1a1a1a', '#2b2c2c', '#1a1a1a']
            : ['#f8f9fa', '#e9ecef', '#f8f9fa']
        }
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.orange[500]}
          />
        }
      >
        {/* Main Card */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={[
            styles.mainCard,
            {
              backgroundColor: 'rgba(43, 44, 44, 0.3)',
              borderColor: true ? 'rgba(248, 249, 250, 0.15)' : 'rgba(43, 44, 44, 0.15)',
            },
          ]}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(100)}
            style={styles.header}
          >
            <LinearGradient
              colors={[`${Colors.orange[500]}20`, `${Colors.red[500]}20`]}
              style={[
                styles.headerGradient,
                {
                  borderBottomColor: `${Colors.orange[500]}50`,
                },
              ]}
            >
              <Animated.View style={[styles.iconContainer, animatedWrenchStyle]}>
                <LinearGradient
                  colors={[Colors.orange[500], Colors.red[500]]}
                  style={styles.iconGradient}
                >
                  <Ionicons name="construct" size={48} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>
              <Text style={[styles.title, { color: colors.text }]}>
                🚧 {language === 'en' ? 'System Maintenance' : 'Sistem Bakımı'}
              </Text>
              <Text style={[styles.subtitle, { color: Colors.orange[300] }]}>
                {language === 'en' ? 'Sistem Bakımı' : 'System Maintenance'}
              </Text>
            </LinearGradient>
          </Animated.View>
          {/* Content */}
          <View style={styles.content}>
            {/* Status Message */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(200)}
              style={[
                styles.statusCard,
                {
                  backgroundColor: `${Colors.orange[500]}10`,
                  borderColor: `${Colors.orange[500]}30`,
                },
              ]}
            >
              <View style={styles.statusHeader}>
                <Ionicons name="warning" size={32} color={Colors.orange[400]} />
                <View style={styles.statusTextContainer}>
                  <Text style={[styles.statusTitle, { color: colors.text }]}>
                    {language === 'en'
                      ? "We're currently performing maintenance"
                      : 'Şu anda sistem bakımı yapıyoruz'}
                  </Text>
                  <Text style={[styles.statusSubtitle, { color: Colors.orange[300] }]}>
                    {language === 'en'
                      ? 'Şu anda sistem bakımı yapıyoruz'
                      : "We're currently performing maintenance"}
                  </Text>
                </View>
              </View>
              {maintenanceWindow && (
                <View style={styles.statusMessage}>
                  <View style={[styles.messageDivider, { backgroundColor: `${Colors.orange[500]}30` }]} />
                  <Text style={[styles.messageText, { color: colors.text }]}>
                    <Text style={{ fontWeight: '600' }}>
                      {language === 'en' ? 'English: ' : 'Türkçe: '}
                    </Text>
                    {language === 'en' ? maintenanceWindow.message_en : maintenanceWindow.message_tr}
                  </Text>
                </View>
              )}
            </Animated.View>
            {/* Countdown Timer */}
            {maintenanceWindow && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(300)}
                style={[
                  styles.timerCard,
                  {
                    backgroundColor: `${Colors.blue[500]}10`,
                    borderColor: `${Colors.blue[500]}30`,
                  },
                ]}
              >
                <View style={styles.timerHeader}>
                  <Ionicons name="time" size={32} color={Colors.blue[400]} />
                  <View style={styles.timerTextContainer}>
                    <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>
                      {language === 'en' ? 'Estimated completion time' : 'Tahmini tamamlanma süresi'}
                    </Text>
                    <Text style={[styles.timerValue, { color: colors.text }]}>{timeRemaining}</Text>
                  </View>
                </View>
              </Animated.View>
            )}
            {/* Schedule Details */}
            {maintenanceWindow && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(400)}
                style={styles.scheduleContainer}
              >
                <View
                  style={[
                    styles.scheduleCard,
                    {
                      backgroundColor: 'rgba(43, 44, 44, 0.5)',
                      borderColor: 'rgba(248, 249, 250, 0.1)',
                    },
                  ]}
                >
                  <Text style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                    {language === 'en' ? 'Start Time / Başlangıç' : 'Başlangıç / Start Time'}
                  </Text>
                  <Text style={[styles.scheduleValue, { color: colors.text }]}>
                    {formatDate(maintenanceWindow.start_time)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.scheduleCard,
                    {
                      backgroundColor: 'rgba(43, 44, 44, 0.5)',
                      borderColor: 'rgba(248, 249, 250, 0.1)',
                    },
                  ]}
                >
                  <Text style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                    {language === 'en' ? 'End Time / Bitiş' : 'Bitiş / End Time'}
                  </Text>
                  <Text style={[styles.scheduleValue, { color: colors.text }]}>
                    {formatDate(maintenanceWindow.end_time)}
                  </Text>
                </View>
              </Animated.View>
            )}
            {/* Affected Services */}
            {maintenanceWindow?.affected_services && maintenanceWindow.affected_services.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(500)}
                style={[
                  styles.affectedCard,
                  {
                    backgroundColor: `${Colors.red[500]}10`,
                    borderColor: `${Colors.red[500]}30`,
                  },
                ]}
              >
                <Text style={[styles.affectedTitle, { color: Colors.red[400] }]}>
                  {language === 'en'
                    ? 'Affected Services / Etkilenen Servisler:'
                    : 'Etkilenen Servisler / Affected Services:'}
                </Text>
                <View style={styles.affectedTags}>
                  {maintenanceWindow.affected_services.map((service: string, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.affectedTag,
                        { backgroundColor: `${Colors.red[500]}20` },
                      ]}
                    >
                      <Text style={[styles.affectedTagText, { color: Colors.red[300] }]}>
                        {service}
                      </Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}
            {/* What to Expect */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(600)}
              style={[
                styles.expectCard,
                {
                  backgroundColor: 'rgba(43, 44, 44, 0.5)',
                  borderColor: 'rgba(248, 249, 250, 0.1)',
                },
              ]}
            >
              <Text style={[styles.expectTitle, { color: colors.text }]}>
                {language === 'en' ? 'What to Expect / Ne Beklemeli?' : 'Ne Beklemeli? / What to Expect'}
              </Text>
              <View style={styles.expectItem}>
                <View style={[styles.expectDot, { backgroundColor: `${Colors.green[500]}20` }]}>
                  <View style={[styles.expectDotInner, { backgroundColor: Colors.green[400] }]} />
                </View>
                <Text style={[styles.expectText, { color: colors.textSecondary }]}>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>EN:</Text> System access is
                  temporarily unavailable during maintenance{'\n'}
                  <Text style={{ color: colors.text, fontWeight: '600' }}>TR:</Text> Bakım süresi boyunca
                  sisteme erişim geçici olarak kapalıdır
                </Text>
              </View>
              <View style={styles.expectItem}>
                <View style={[styles.expectDot, { backgroundColor: `${Colors.green[500]}20` }]}>
                  <View style={[styles.expectDotInner, { backgroundColor: Colors.green[400] }]} />
                </View>
                <Text style={[styles.expectText, { color: colors.textSecondary }]}>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>EN:</Text> All your data is safe and
                  secure{'\n'}
                  <Text style={{ color: colors.text, fontWeight: '600' }}>TR:</Text> Tüm verileriniz güvende
                  ve korunmaktadır
                </Text>
              </View>
              <View style={styles.expectItem}>
                <View style={[styles.expectDot, { backgroundColor: `${Colors.green[500]}20` }]}>
                  <View style={[styles.expectDotInner, { backgroundColor: Colors.green[400] }]} />
                </View>
                <Text style={[styles.expectText, { color: colors.textSecondary }]}>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>EN:</Text> You will be able to log
                  in normally after maintenance is completed{'\n'}
                  <Text style={{ color: colors.text, fontWeight: '600' }}>TR:</Text> Bakım tamamlandıktan
                  sonra normal şekilde giriş yapabileceksiniz
                </Text>
              </View>
            </Animated.View>
            {/* Refresh Button */}
            <Animated.View entering={FadeInDown.duration(400).delay(700)}>
              <TouchableOpacity onPress={onRefresh} activeOpacity={0.8} style={styles.refreshButton}>
                <LinearGradient
                  colors={[Colors.blue[500], Colors.blue[600]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.refreshButtonGradient}
                >
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.refreshButtonText}>
                    {language === 'en' ? 'Refresh Page / Sayfayı Yenile' : 'Sayfayı Yenile / Refresh Page'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            {/* Support Contact */}
            <View style={[styles.supportContainer, { borderTopColor: colors.border }]}>
              <Text style={[styles.supportLabel, { color: colors.textSecondary }]}>
                {language === 'en'
                  ? 'Need help? / Yardıma mı ihtiyacınız var?'
                  : 'Yardıma mı ihtiyacınız var? / Need help?'}
              </Text>
              <TouchableOpacity>
                <Text style={[styles.supportEmail, { color: Colors.blue[400] }]}>
                  info@allyncai.com
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Footer */}
          <View
            style={[
              styles.footer,
              {
                backgroundColor: 'rgba(43, 44, 44, 0.3)',
                borderTopColor: 'rgba(248, 249, 250, 0.1)',
              },
            ]}
          >
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {language === 'en'
                ? 'Thank you for your patience / Anlayışınız için teşekkür ederiz'
                : 'Anlayışınız için teşekkür ederiz / Thank you for your patience'}
            </Text>
            <Text style={[styles.footerCopyright, { color: colors.textSecondary }]}>
              © 2025 Allync AI. All rights reserved.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? Spacing['5xl'] : Spacing['4xl'],
    paddingBottom: Spacing['4xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
  },
  mainCard: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    overflow: 'hidden',
  },
  headerGradient: {
    padding: Spacing['3xl'],
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.xl,
    textAlign: 'center',
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  statusCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    padding: Spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  statusSubtitle: {
    fontSize: Typography.fontSize.lg,
  },
  statusMessage: {
    marginTop: Spacing.lg,
  },
  messageDivider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  messageText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base * 1.4,
  },
  timerCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    padding: Spacing.lg,
  },
  timerHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  timerTextContainer: {
    flex: 1,
  },
  timerLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  timerValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  scheduleContainer: {
    gap: Spacing.md,
  },
  scheduleCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  scheduleLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  scheduleValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  affectedCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  affectedTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  affectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  affectedTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  affectedTagText: {
    fontSize: Typography.fontSize.sm,
  },
  expectCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  expectTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.lg,
  },
  expectItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  expectDot: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  expectDotInner: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  expectText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.sm * 1.4,
  },
  refreshButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  refreshButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  supportContainer: {
    paddingTop: Spacing.lg,
    marginTop: Spacing.md,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  supportLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  supportEmail: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  footer: {
    padding: Spacing.xl,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  footerCopyright: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
  },
});
