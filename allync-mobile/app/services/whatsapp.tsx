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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { PageTransition } from '../../components/PageTransition';

type TabType = 'dashboard' | 'analytics' | 'settings';

export default function WhatsAppService() {
  const { theme, colors } = useTheme();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeConversations: 0,
    totalMessages: 0,
    responseTime: '0',
    satisfaction: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats({
        activeConversations: 24,
        totalMessages: 1847,
        responseTime: '2.3',
        satisfaction: 94,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const tabs: { key: TabType; labelEn: string; labelTr: string; icon: any }[] = [
    { key: 'dashboard', labelEn: 'Dashboard', labelTr: 'Panel', icon: 'grid' },
    { key: 'analytics', labelEn: 'Analytics', labelTr: 'Analitik', icon: 'bar-chart' },
    { key: 'settings', labelEn: 'Settings', labelTr: 'Ayarlar', icon: 'settings' },
  ];

  if (loading) {
    return (
      <PageTransition>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.green[500]} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {language === 'en' ? 'Loading WhatsApp Service...' : 'WhatsApp Servisi yükleniyor...'}
            </Text>
          </View>
        </View>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.green[500], Colors.green[600]]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="logo-whatsapp" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>
                {language === 'en' ? 'WhatsApp Automation' : 'WhatsApp Otomasyonu'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {language === 'en' ? 'Manage your conversations' : 'Konuşmalarınızı yönetin'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isActive
                      ? Colors.green[500]
                      : theme === 'dark'
                      ? 'rgba(43, 44, 44, 0.5)'
                      : 'rgba(248, 249, 250, 0.5)',
                    borderColor: isActive
                      ? 'transparent'
                      : theme === 'dark'
                      ? 'rgba(248, 249, 250, 0.1)'
                      : 'rgba(43, 44, 44, 0.1)',
                  },
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={18}
                  color={isActive ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {language === 'en' ? tab.labelEn : tab.labelTr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green[500]} />
          }
        >
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <Animated.View
                  entering={FadeInDown.duration(400).delay(100)}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: theme === 'dark'
                        ? 'rgba(43, 44, 44, 0.6)'
                        : 'rgba(248, 249, 250, 0.6)',
                      borderColor: theme === 'dark'
                        ? 'rgba(248, 249, 250, 0.1)'
                        : 'rgba(43, 44, 44, 0.1)',
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[Colors.blue[500], Colors.cyan[500]]}
                    style={styles.statIcon}
                  >
                    <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {stats.activeConversations}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    {language === 'en' ? 'Active Chats' : 'Aktif Sohbetler'}
                  </Text>
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.duration(400).delay(200)}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: theme === 'dark'
                        ? 'rgba(43, 44, 44, 0.6)'
                        : 'rgba(248, 249, 250, 0.6)',
                      borderColor: theme === 'dark'
                        ? 'rgba(248, 249, 250, 0.1)'
                        : 'rgba(43, 44, 44, 0.1)',
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[Colors.green[500], Colors.emerald[600]]}
                    style={styles.statIcon}
                  >
                    <Ionicons name="paper-plane" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {stats.totalMessages}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    {language === 'en' ? 'Total Messages' : 'Toplam Mesaj'}
                  </Text>
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.duration(400).delay(300)}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: theme === 'dark'
                        ? 'rgba(43, 44, 44, 0.6)'
                        : 'rgba(248, 249, 250, 0.6)',
                      borderColor: theme === 'dark'
                        ? 'rgba(248, 249, 250, 0.1)'
                        : 'rgba(43, 44, 44, 0.1)',
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[Colors.purple[500], Colors.purple[700]]}
                    style={styles.statIcon}
                  >
                    <Ionicons name="time" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {stats.responseTime}h
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    {language === 'en' ? 'Avg Response' : 'Ort. Yanıt'}
                  </Text>
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.duration(400).delay(400)}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: theme === 'dark'
                        ? 'rgba(43, 44, 44, 0.6)'
                        : 'rgba(248, 249, 250, 0.6)',
                      borderColor: theme === 'dark'
                        ? 'rgba(248, 249, 250, 0.1)'
                        : 'rgba(43, 44, 44, 0.1)',
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[Colors.yellow[500], Colors.orange[500]]}
                    style={styles.statIcon}
                  >
                    <Ionicons name="star" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {stats.satisfaction}%
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    {language === 'en' ? 'Satisfaction' : 'Memnuniyet'}
                  </Text>
                </Animated.View>
              </View>

              {/* Quick Actions */}
              <Animated.View entering={FadeInDown.duration(400).delay(500)}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {language === 'en' ? 'Quick Actions' : 'Hızlı İşlemler'}
                </Text>
                <View style={styles.actionsGrid}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[
                      styles.actionCard,
                      {
                        backgroundColor: `${Colors.blue[500]}15`,
                        borderColor: `${Colors.blue[500]}30`,
                      },
                    ]}
                  >
                    <Ionicons name="send" size={24} color={Colors.blue[500]} />
                    <Text style={[styles.actionText, { color: colors.text }]}>
                      {language === 'en' ? 'Send Message' : 'Mesaj Gönder'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[
                      styles.actionCard,
                      {
                        backgroundColor: `${Colors.green[500]}15`,
                        borderColor: `${Colors.green[500]}30`,
                      },
                    ]}
                  >
                    <Ionicons name="people" size={24} color={Colors.green[500]} />
                    <Text style={[styles.actionText, { color: colors.text }]}>
                      {language === 'en' ? 'View Contacts' : 'Kişileri Gör'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </>
          )}

          {activeTab === 'analytics' && (
            <Animated.View entering={FadeIn.duration(400)}>
              <View style={[styles.emptyState, { backgroundColor: theme === 'dark' ? 'rgba(43, 44, 44, 0.5)' : 'rgba(248, 249, 250, 0.5)' }]}>
                <Ionicons name="bar-chart" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {language === 'en' ? 'Analytics Dashboard' : 'Analitik Paneli'}
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {language === 'en'
                    ? 'View detailed analytics and insights'
                    : 'Detaylı analitik ve içgörüleri görüntüleyin'}
                </Text>
              </View>
            </Animated.View>
          )}

          {activeTab === 'settings' && (
            <Animated.View entering={FadeIn.duration(400)}>
              <View style={[styles.emptyState, { backgroundColor: theme === 'dark' ? 'rgba(43, 44, 44, 0.5)' : 'rgba(248, 249, 250, 0.5)' }]}>
                <Ionicons name="settings" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {language === 'en' ? 'Service Settings' : 'Servis Ayarları'}
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {language === 'en'
                    ? 'Configure your WhatsApp automation settings'
                    : 'WhatsApp otomasyon ayarlarınızı yapılandırın'}
                </Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </View>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    paddingTop: Platform.OS === 'ios' ? Spacing['5xl'] : Spacing['4xl'],
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(248, 249, 250, 0.1)',
  },
  tabsContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: '48%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  emptyState: {
    padding: Spacing['3xl'],
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.base * 1.3,
  },
});
