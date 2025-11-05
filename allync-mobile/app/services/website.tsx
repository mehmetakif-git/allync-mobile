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

type TabType = 'dashboard' | 'details' | 'gallery';
type ProjectStatus = 'planning' | 'design' | 'development' | 'testing' | 'completed';

export default function WebsiteDevelopment() {
  const { theme, colors } = useTheme();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProject({
        name: 'Corporate Website',
        status: 'development' as ProjectStatus,
        progress: 65,
        startDate: '2025-01-15',
        targetDate: '2025-03-01',
        url: 'https://preview.example.com',
        features: [
          { name: 'Homepage Design', completed: true },
          { name: 'About Page', completed: true },
          { name: 'Services Section', completed: false },
          { name: 'Contact Form', completed: false },
          { name: 'SEO Optimization', completed: false },
        ],
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

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'planning':
        return Colors.blue[500];
      case 'design':
        return Colors.purple[500];
      case 'development':
        return Colors.orange[500];
      case 'testing':
        return Colors.yellow[500];
      case 'completed':
        return Colors.green[500];
      default:
        return Colors.gray[500];
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    const labels = {
      planning: { en: 'Planning', tr: 'Planlama' },
      design: { en: 'Design', tr: 'Tasarım' },
      development: { en: 'Development', tr: 'Geliştirme' },
      testing: { en: 'Testing', tr: 'Test' },
      completed: { en: 'Completed', tr: 'Tamamlandı' },
    };
    return language === 'en' ? labels[status].en : labels[status].tr;
  };

  const tabs: { key: TabType; labelEn: string; labelTr: string; icon: any }[] = [
    { key: 'dashboard', labelEn: 'Dashboard', labelTr: 'Panel', icon: 'grid' },
    { key: 'details', labelEn: 'Details', labelTr: 'Detaylar', icon: 'document-text' },
    { key: 'gallery', labelEn: 'Gallery', labelTr: 'Galeri', icon: 'images' },
  ];

  if (loading) {
    return (
      <PageTransition>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.purple[500]} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {language === 'en' ? 'Loading Website Project...' : 'Website Projesi yükleniyor...'}
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
          colors={[Colors.purple[500], Colors.purple[700]]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="globe" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>
                {language === 'en' ? 'Website Development' : 'Website Geliştirme'}
              </Text>
              <Text style={styles.headerSubtitle}>{project?.name || 'Project'}</Text>
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
                      ? Colors.purple[500]
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.purple[500]} />
          }
        >
          {activeTab === 'dashboard' && project && (
            <>
              {/* Status Card */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(100)}
                style={[
                  styles.statusCard,
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
                <View style={styles.statusHeader}>
                  <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                    {language === 'en' ? 'Project Status' : 'Proje Durumu'}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(project.status)}20` }]}>
                    <View
                      style={[styles.statusDot, { backgroundColor: getStatusColor(project.status) }]}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                      {getStatusLabel(project.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={[getStatusColor(project.status), Colors.purple[700]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${project.progress}%` }]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.text }]}>
                    {project.progress}% {language === 'en' ? 'Complete' : 'Tamamlandı'}
                  </Text>
                </View>
              </Animated.View>

              {/* Timeline */}
              <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {language === 'en' ? 'Project Timeline' : 'Proje Zaman Çizelgesi'}
                </Text>
                <View style={styles.timelineGrid}>
                  <View
                    style={[
                      styles.timelineCard,
                      {
                        backgroundColor: theme === 'dark'
                          ? 'rgba(43, 44, 44, 0.5)'
                          : 'rgba(248, 249, 250, 0.5)',
                        borderColor: theme === 'dark'
                          ? 'rgba(248, 249, 250, 0.1)'
                          : 'rgba(43, 44, 44, 0.1)',
                      },
                    ]}
                  >
                    <Ionicons name="calendar" size={24} color={Colors.blue[500]} />
                    <Text style={[styles.timelineLabel, { color: colors.textSecondary }]}>
                      {language === 'en' ? 'Start Date' : 'Başlangıç'}
                    </Text>
                    <Text style={[styles.timelineValue, { color: colors.text }]}>
                      {new Date(project.startDate).toLocaleDateString()}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.timelineCard,
                      {
                        backgroundColor: theme === 'dark'
                          ? 'rgba(43, 44, 44, 0.5)'
                          : 'rgba(248, 249, 250, 0.5)',
                        borderColor: theme === 'dark'
                          ? 'rgba(248, 249, 250, 0.1)'
                          : 'rgba(43, 44, 44, 0.1)',
                      },
                    ]}
                  >
                    <Ionicons name="flag" size={24} color={Colors.green[500]} />
                    <Text style={[styles.timelineLabel, { color: colors.textSecondary }]}>
                      {language === 'en' ? 'Target Date' : 'Hedef Tarih'}
                    </Text>
                    <Text style={[styles.timelineValue, { color: colors.text }]}>
                      {new Date(project.targetDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </Animated.View>

              {/* Features Checklist */}
              <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {language === 'en' ? 'Features' : 'Özellikler'}
                </Text>
                <View style={styles.featuresList}>
                  {project.features.map((feature: any, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.featureItem,
                        {
                          backgroundColor: theme === 'dark'
                            ? 'rgba(43, 44, 44, 0.5)'
                            : 'rgba(248, 249, 250, 0.5)',
                          borderColor: theme === 'dark'
                            ? 'rgba(248, 249, 250, 0.1)'
                            : 'rgba(43, 44, 44, 0.1)',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.featureIcon,
                          {
                            backgroundColor: feature.completed
                              ? `${Colors.green[500]}20`
                              : `${Colors.gray[500]}20`,
                          },
                        ]}
                      >
                        <Ionicons
                          name={feature.completed ? 'checkmark-circle' : 'ellipse-outline'}
                          size={20}
                          color={feature.completed ? Colors.green[500] : Colors.gray[500]}
                        />
                      </View>
                      <Text style={[styles.featureName, { color: colors.text }]}>
                        {feature.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </Animated.View>

              {/* Quick Actions */}
              {project.url && (
                <Animated.View entering={FadeInDown.duration(400).delay(400)}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.previewButton,
                      {
                        backgroundColor: `${Colors.purple[500]}15`,
                        borderColor: `${Colors.purple[500]}30`,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[Colors.purple[500], Colors.purple[700]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.previewButtonGradient}
                    >
                      <Ionicons name="eye" size={20} color="#FFFFFF" />
                      <Text style={styles.previewButtonText}>
                        {language === 'en' ? 'View Preview' : 'Önizlemeyi Gör'}
                      </Text>
                      <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </>
          )}

          {activeTab === 'details' && (
            <Animated.View entering={FadeIn.duration(400)}>
              <View
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: theme === 'dark'
                      ? 'rgba(43, 44, 44, 0.5)'
                      : 'rgba(248, 249, 250, 0.5)',
                  },
                ]}
              >
                <Ionicons name="document-text" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {language === 'en' ? 'Project Details' : 'Proje Detayları'}
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {language === 'en'
                    ? 'View detailed information about your website project'
                    : 'Website projeniz hakkında detaylı bilgileri görüntüleyin'}
                </Text>
              </View>
            </Animated.View>
          )}

          {activeTab === 'gallery' && (
            <Animated.View entering={FadeIn.duration(400)}>
              <View
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: theme === 'dark'
                      ? 'rgba(43, 44, 44, 0.5)'
                      : 'rgba(248, 249, 250, 0.5)',
                  },
                ]}
              >
                <Ionicons name="images" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {language === 'en' ? 'Project Gallery' : 'Proje Galerisi'}
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {language === 'en'
                    ? 'View screenshots and media files of your project'
                    : 'Projenizin ekran görüntülerini ve medya dosyalarını görüntüleyin'}
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
  statusCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statusLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  progressContainer: {
    gap: Spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  timelineGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  timelineCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timelineLabel: {
    fontSize: Typography.fontSize.xs,
  },
  timelineValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  featuresList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureName: {
    flex: 1,
    fontSize: Typography.fontSize.base,
  },
  previewButton: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
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
