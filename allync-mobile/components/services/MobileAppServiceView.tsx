import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import GlassSurface from '../GlassSurface';
import MobileAppSkeleton from '../skeletons/MobileAppSkeleton';
import {
  getMobileAppProjectByCompanyService,
  formatDate,
  getTimeAgo,
  platformLabels,
  storeStatusLabels,
  getMilestoneStatusColor,
  getStoreStatusColor,
  type MobileAppProject,
  type MobileAppMilestone,
} from '../../lib/api/mobileAppProjects';

type TabType = 'dashboard' | 'details' | 'support';

const AnimatedView = Animated.View;

interface MobileAppServiceViewProps {
  serviceId: string;
  onBack: () => void;
}

export default function MobileAppServiceView({ serviceId, onBack }: MobileAppServiceViewProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState<MobileAppProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (serviceId) {
      loadData();
    } else {
      setError('Service ID not found');
      setLoading(false);
    }
  }, [serviceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📱 [MobileAppServiceView] Fetching project for service:', serviceId);
      const projectData = await getMobileAppProjectByCompanyService(serviceId);

      if (!projectData) {
        setError('No project found for this service');
      } else {
        setProject(projectData);
      }
    } catch (err) {
      console.error('❌ [MobileAppServiceView] Error:', err);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStoreLink = (url: string | null | undefined, storeName: string) => {
    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert('Not Available', `${storeName} link is not available yet.`);
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in-progress': return 'time';
      case 'blocked': return 'close-circle';
      default: return 'ellipse-outline';
    }
  };

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { key: 'details', label: 'Details', icon: 'document-text' },
    { key: 'support', label: 'Support', icon: 'help-circle' },
  ];

  if (loading) {
    return <MobileAppSkeleton />;
  }

  if (error || !project) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Back to Services</Text>
          </TouchableOpacity>

          <GlassSurface style={styles.errorCard}>
            <Ionicons name="alert-circle" size={64} color={Colors.red[500]} />
            <Text style={[styles.errorTitle, { color: colors.text }]}>
              {error || 'Project Not Found'}
            </Text>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>
              This mobile app service hasn't been configured yet. Please contact support.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadData}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[Colors.blue[600], Colors.blue[700]]}
                style={styles.retryButtonGradient}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>Retry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassSurface>
        </ScrollView>
      </View>
    );
  }

  const platformColor = project.platform === 'android'
    ? Colors.green[500]
    : project.platform === 'ios'
    ? Colors.blue[500]
    : Colors.cyan[500];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue[500]} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Back to Services</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={[styles.headerIcon, { backgroundColor: `${platformColor}20` }]}>
              <Ionicons name="phone-portrait" size={32} color={platformColor} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {project.project_name || project.app_name}
              </Text>
              <View style={styles.platformBadge}>
                <LinearGradient
                  colors={[platformColor, platformColor + 'CC']}
                  style={styles.platformBadgeGradient}
                >
                  <Text style={styles.platformBadgeText}>
                    {platformLabels[project.platform]}
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </View>
        </View>

        {/* Info Notice */}
        <GlassSurface style={styles.noticeCard}>
          <View style={styles.noticeContent}>
            <View style={[styles.noticeIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Ionicons name="information-circle" size={20} color={Colors.blue[400]} />
            </View>
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
              App settings are managed by Allync. View-only access for tracking progress.
            </Text>
          </View>
        </GlassSurface>

        {/* Tabs */}
        <View style={styles.filtersContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterButton,
                {
                  backgroundColor: activeTab === tab.key ? Colors.blue[500] : 'rgba(255, 255, 255, 0.05)',
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={activeTab === tab.key ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color: activeTab === tab.key ? '#FFFFFF' : colors.textSecondary,
                    fontWeight: activeTab === tab.key ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <View style={styles.tabContent}>
            {/* Progress Card */}
            <GlassSurface style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Overall Progress</Text>
                <Text style={[styles.progressPercentage, { color: platformColor }]}>
                  {project.overall_progress || 0}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <LinearGradient
                    colors={[platformColor, platformColor + '80']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${project.overall_progress || 0}%` }]}
                  />
                </View>
              </View>
            </GlassSurface>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <GlassSurface style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <Ionicons name="phone-portrait" size={24} color={Colors.blue[400]} />
                </View>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Platform</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {platformLabels[project.platform]}
                </Text>
              </GlassSurface>

              <GlassSurface style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]}>
                  <Ionicons name="calendar" size={24} color={Colors.orange[500]} />
                </View>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Est. Completion</Text>
                <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
                  {project.estimated_completion ? formatDate(project.estimated_completion) : 'TBD'}
                </Text>
              </GlassSurface>
            </View>

            {/* App Store Status */}
            <GlassSurface style={styles.card}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>App Store Status</Text>

              {(project.platform === 'android' || project.platform === 'both') && (
                <TouchableOpacity
                  style={styles.storeItem}
                  onPress={() => handleStoreLink(project.play_store_url, 'Google Play')}
                  activeOpacity={0.7}
                >
                  <View style={styles.storeInfo}>
                    <Ionicons name="logo-google-playstore" size={24} color={Colors.green[500]} />
                    <View style={styles.storeTextContainer}>
                      <Text style={[styles.storeName, { color: colors.text }]}>Google Play Store</Text>
                      <View style={[
                        styles.storeStatusBadge,
                        {
                          backgroundColor: getStoreStatusColor(project.play_store_status || 'pending').bg,
                          borderColor: getStoreStatusColor(project.play_store_status || 'pending').border,
                        },
                      ]}>
                        <Text style={[
                          styles.storeStatusText,
                          { color: getStoreStatusColor(project.play_store_status || 'pending').text },
                        ]}>
                          {storeStatusLabels[project.play_store_status || 'pending']}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {project.play_store_url && (
                    <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              )}

              {(project.platform === 'ios' || project.platform === 'both') && (
                <TouchableOpacity
                  style={styles.storeItem}
                  onPress={() => handleStoreLink(project.app_store_url, 'App Store')}
                  activeOpacity={0.7}
                >
                  <View style={styles.storeInfo}>
                    <Ionicons name="logo-apple" size={24} color={Colors.blue[500]} />
                    <View style={styles.storeTextContainer}>
                      <Text style={[styles.storeName, { color: colors.text }]}>Apple App Store</Text>
                      <View style={[
                        styles.storeStatusBadge,
                        {
                          backgroundColor: getStoreStatusColor(project.app_store_status || 'pending').bg,
                          borderColor: getStoreStatusColor(project.app_store_status || 'pending').border,
                        },
                      ]}>
                        <Text style={[
                          styles.storeStatusText,
                          { color: getStoreStatusColor(project.app_store_status || 'pending').text },
                        ]}>
                          {storeStatusLabels[project.app_store_status || 'pending']}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {project.app_store_url && (
                    <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              )}
            </GlassSurface>

            {/* Milestones */}
            {project.milestones && project.milestones.length > 0 && (
              <GlassSurface style={styles.card}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Development Milestones</Text>
                <View style={styles.milestonesList}>
                  {project.milestones.map((milestone: MobileAppMilestone, index: number) => (
                    <AnimatedView
                      key={milestone.id}
                      entering={FadeInDown.duration(400).delay(index * 50)}
                      style={[
                        styles.milestoneItem,
                        {
                          backgroundColor: `${getMilestoneStatusColor(milestone.status)}10`,
                          borderColor: `${getMilestoneStatusColor(milestone.status)}30`,
                        },
                      ]}
                    >
                      <View style={styles.milestoneHeader}>
                        <View style={styles.milestoneLeft}>
                          <Ionicons
                            name={getMilestoneIcon(milestone.status)}
                            size={20}
                            color={getMilestoneStatusColor(milestone.status)}
                          />
                          <Text style={[styles.milestoneTitle, { color: colors.text }]}>
                            {milestone.title}
                          </Text>
                        </View>
                        <Text style={[styles.milestoneProgress, { color: getMilestoneStatusColor(milestone.status) }]}>
                          {milestone.progress}%
                        </Text>
                      </View>
                      {milestone.status === 'in-progress' && milestone.progress > 0 && (
                        <View style={[styles.progressBar, { backgroundColor: 'rgba(255, 255, 255, 0.1)', marginTop: 12 }]}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${milestone.progress}%`, backgroundColor: getMilestoneStatusColor(milestone.status) },
                            ]}
                          />
                        </View>
                      )}
                      {milestone.notes && (
                        <Text style={[styles.milestoneNotes, { color: colors.textSecondary }]}>
                          {milestone.notes}
                        </Text>
                      )}
                      {milestone.completed_date && (
                        <Text style={[styles.milestoneDate, { color: colors.textTertiary }]}>
                          Completed: {formatDate(milestone.completed_date)}
                        </Text>
                      )}
                    </AnimatedView>
                  ))}
                </View>
              </GlassSurface>
            )}
          </View>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <View style={styles.tabContent}>
            <GlassSurface style={styles.card}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Project Information</Text>

              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Project Name</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {project.project_name || 'N/A'}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>App Name</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {project.app_name}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Platform</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {platformLabels[project.platform]}
                </Text>
              </View>

              {(project.platform === 'android' || project.platform === 'both') && project.package_name && (
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Package Name (Android)</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]} selectable>
                    {project.package_name}
                  </Text>
                </View>
              )}

              {(project.platform === 'ios' || project.platform === 'both') && project.bundle_id && (
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Bundle ID (iOS)</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]} selectable>
                    {project.bundle_id}
                  </Text>
                </View>
              )}

              {project.estimated_completion && (
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Estimated Completion</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {formatDate(project.estimated_completion)}
                  </Text>
                </View>
              )}

              {project.last_update && (
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Last Update</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {getTimeAgo(project.last_update)}
                  </Text>
                </View>
              )}
            </GlassSurface>
          </View>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <View style={styles.tabContent}>
            <GlassSurface style={styles.card}>
              <Ionicons name="help-circle" size={64} color={Colors.blue[500]} style={{ alignSelf: 'center', marginBottom: 16 }} />
              <Text style={[styles.cardTitle, { color: colors.text, textAlign: 'center' }]}>Need Help?</Text>
              <Text style={[styles.supportText, { color: colors.textSecondary }]}>
                For questions about your mobile app development project, please contact our support team through the Support tab.
              </Text>
              <TouchableOpacity
                style={styles.supportButton}
                onPress={() => router.push('/(tabs)/support')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[Colors.blue[600], Colors.blue[700]]}
                  style={styles.supportButtonGradient}
                >
                  <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
                  <Text style={styles.supportButtonText}>Go to Support</Text>
                </LinearGradient>
              </TouchableOpacity>
            </GlassSurface>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  spinner: {
    width: 48,
    height: 48,
    borderWidth: 4,
    borderColor: Colors.blue[500] + '30',
    borderTopColor: Colors.blue[500],
    borderRadius: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  platformBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
  },
  platformBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  platformBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noticeCard: {
    padding: 16,
    marginBottom: 24,
  },
  noticeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noticeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterButtonText: {
    fontSize: 14,
  },
  tabContent: {
    gap: 16,
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  storeTextContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  storeStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  storeStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  milestonesList: {
    gap: 12,
    marginTop: 16,
  },
  milestoneItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  milestoneProgress: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  milestoneNotes: {
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  milestoneDate: {
    fontSize: 11,
    marginTop: 8,
  },
  detailItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  supportText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  supportButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  supportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  supportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
