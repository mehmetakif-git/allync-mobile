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
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import GlassSurface from '../GlassSurface';
import WebsiteDevelopmentSkeleton from '../skeletons/WebsiteDevelopmentSkeleton';
import MeshGlowBackground from '../MeshGlowBackground';
import {
  getWebsiteProjectByCompanyService,
  formatDate,
  getTimeAgo,
  projectTypeLabels,
  getMilestoneStatusColor,
  type WebsiteProject,
  type WebsiteMilestone,
} from '../../lib/api/websiteProjects';
import {
  getProjectMedia,
  getMediaPublicUrl,
  type ProjectMedia,
} from '../../lib/api/projectMedia';

type TabType = 'dashboard' | 'details' | 'support' | 'gallery';

const AnimatedView = Animated.View;

interface WebsiteDevelopmentViewProps {
  serviceId: string;
  onBack: () => void;
}

export default function WebsiteDevelopmentView({ serviceId, onBack }: WebsiteDevelopmentViewProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState<WebsiteProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Gallery state
  const [projectMedia, setProjectMedia] = useState<ProjectMedia[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ProjectMedia | null>(null);

  useEffect(() => {
    if (serviceId) {
      loadData();
    } else {
      setError('Service ID not found');
      setLoading(false);
    }
  }, [serviceId]);

  // Load media when gallery tab is opened
  useEffect(() => {
    const loadMedia = async () => {
      if (activeTab === 'gallery' && project?.id) {
        setLoadingMedia(true);
        try {
          console.log('📱🎨 Loading media for project:', project.id);
          const media = await getProjectMedia(project.id, 'website');

          // Generate signed URLs for each media item
          const mediaWithUrls = await Promise.all(
            media.map(async (item) => ({
              ...item,
              signedUrl: await getMediaPublicUrl(item.file_path)
            }))
          );

          // Filter out media items that don't have valid signed URLs
          const validMedia = mediaWithUrls.filter(item => item.signedUrl !== null);

          if (validMedia.length < mediaWithUrls.length) {
            console.warn(`⚠️ ${mediaWithUrls.length - validMedia.length} media items skipped (files not found in storage)`);
          }

          setProjectMedia(validMedia);
          console.log('✅ Loaded', validMedia.length, 'media items with valid URLs');
        } catch (err) {
          console.error('❌ Error loading media:', err);
          // Don't show alert - gracefully show empty state instead
          setProjectMedia([]);
        } finally {
          setLoadingMedia(false);
        }
      }
    };
    loadMedia();
  }, [activeTab, project?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🌐 [WebsiteDevelopmentView] Fetching project for service:', serviceId);
      const projectData = await getWebsiteProjectByCompanyService(serviceId);

      if (!projectData) {
        setError('No project found for this service');
      } else {
        setProject(projectData);
      }
    } catch (err) {
      console.error('❌ [WebsiteDevelopmentView] Error:', err);
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
    { key: 'gallery', label: 'Media Gallery', icon: 'images' },
  ];

  if (loading) {
    return <WebsiteDevelopmentSkeleton />;
  }

  if (error || !project) {
    return (
      <MeshGlowBackground>
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
              This website service hasn't been configured yet. Please contact support.
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
      </MeshGlowBackground>
    );
  }

  const projectTypeColor = Colors.purple[500];

  return (
    <MeshGlowBackground>
      <View style={styles.container}>
        {/* Sticky Header */}
        <View style={styles.stickyHeader}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Back to Services</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={[styles.headerIcon, { backgroundColor: `${projectTypeColor}20` }]}>
                <Ionicons name="globe-outline" size={32} color={projectTypeColor} />
              </View>
              <View style={styles.headerInfo}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  {project.project_name}
                </Text>
                <View style={styles.projectTypeBadge}>
                  <LinearGradient
                    colors={[projectTypeColor, projectTypeColor + 'CC']}
                    style={styles.projectTypeBadgeGradient}
                  >
                    <Text style={styles.projectTypeBadgeText}>
                      {projectTypeLabels[project.project_type]}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.filtersContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: activeTab === tab.key ? Colors.blue[500] : 'rgba(255, 255, 255, 0.12)',
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
        </View>

        {/* Scrollable Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue[500]} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Info Notice */}
          <GlassSurface style={styles.noticeCard}>
            <View style={styles.noticeContent}>
              <View style={[styles.noticeIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Ionicons name="information-circle" size={20} color={Colors.blue[400]} />
              </View>
              <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
                Website settings are managed by Allync. View-only access for tracking progress.
              </Text>
            </View>
          </GlassSurface>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <View style={styles.tabContent}>
            {/* Progress Card */}
            <GlassSurface style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Overall Progress</Text>
                <Text style={[styles.progressPercentage, { color: projectTypeColor }]}>
                  {project.overall_progress || 0}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <LinearGradient
                    colors={[projectTypeColor, projectTypeColor + '80']}
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
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
                  <Ionicons name="globe-outline" size={24} color={Colors.purple[400]} />
                </View>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Project Type</Text>
                <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
                  {projectTypeLabels[project.project_type]}
                </Text>
              </GlassSurface>

              <GlassSurface style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <Ionicons name="calendar" size={24} color={Colors.blue[400]} />
                </View>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Est. Completion</Text>
                <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
                  {project.estimated_completion ? formatDate(project.estimated_completion) : 'TBD'}
                </Text>
              </GlassSurface>
            </View>

            {project.last_update && (
              <GlassSurface style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.updateHeader}>
                    <Ionicons name="time-outline" size={20} color={Colors.green[400]} />
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Last Update</Text>
                  </View>
                </View>
                <Text style={[styles.updateText, { color: colors.text }]}>
                  {getTimeAgo(project.last_update)}
                </Text>
              </GlassSurface>
            )}

            {/* Milestones */}
            {project.milestones && project.milestones.length > 0 && (
              <GlassSurface style={styles.card}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Project Milestones</Text>
                <View style={styles.milestonesList}>
                  {project.milestones.map((milestone: WebsiteMilestone, index: number) => (
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
                  {project.project_name}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Project Type</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {projectTypeLabels[project.project_type]}
                </Text>
              </View>

              {project.domain && (
                <View style={styles.detailItem}>
                  <View style={styles.detailLabelRow}>
                    <Ionicons name="globe-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Domain</Text>
                  </View>
                  <Text style={[styles.detailValue, { color: colors.text }]} selectable>
                    {project.domain}
                  </Text>
                </View>
              )}

              {project.email && (
                <View style={styles.detailItem}>
                  <View style={styles.detailLabelRow}>
                    <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email Address</Text>
                  </View>
                  <Text style={[styles.detailValue, { color: colors.text }]} selectable>
                    {project.email}
                  </Text>
                </View>
              )}

              {project.estimated_completion && (
                <View style={styles.detailItem}>
                  <View style={styles.detailLabelRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Estimated Completion</Text>
                  </View>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {formatDate(project.estimated_completion)}
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
                For questions about your website development project, please contact our support team through the Support tab.
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

        {/* Media Gallery Tab */}
        {activeTab === 'gallery' && (
          <View style={styles.tabContent}>
            <GlassSurface style={styles.card}>
              <View style={styles.galleryHeader}>
                <View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Project Media Gallery</Text>
                  <Text style={[styles.gallerySubtitle, { color: colors.textSecondary }]}>
                    View images and videos uploaded by your project manager
                  </Text>
                </View>
                {projectMedia.length > 0 && (
                  <Text style={[styles.mediaCount, { color: colors.textSecondary }]}>
                    {projectMedia.length} {projectMedia.length === 1 ? 'item' : 'items'}
                  </Text>
                )}
              </View>

              {loadingMedia ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.purple[500]} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading media...</Text>
                </View>
              ) : projectMedia.length === 0 ? (
                <View style={styles.emptyGallery}>
                  <Ionicons name="images-outline" size={64} color={colors.textTertiary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Media Yet</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Your project manager will upload images and videos as your website development progresses.
                  </Text>
                </View>
              ) : (
                <View style={styles.mediaGrid}>
                  {projectMedia.map((media, index) => (
                    <TouchableOpacity
                      key={media.id}
                      style={styles.mediaItem}
                      onPress={() => setSelectedMedia(media)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.mediaThumbnail}>
                        {media.file_type === 'image' ? (
                          <Image
                            source={{ uri: media.signedUrl }}
                            style={styles.mediaImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.videoPlaceholder}>
                            <LinearGradient
                              colors={[Colors.purple[500] + '30', Colors.blue[500] + '30']}
                              style={StyleSheet.absoluteFillObject}
                            />
                            <Ionicons name="play-circle" size={48} color={Colors.purple[400]} />
                          </View>
                        )}
                        {media.is_featured && (
                          <View style={styles.featuredBadge}>
                            <Text style={styles.featuredText}>Featured</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.mediaInfo}>
                        <Text style={[styles.mediaTitle, { color: colors.text }]} numberOfLines={1}>
                          {media.title || media.file_name}
                        </Text>
                        {media.milestone_name && (
                          <Text style={[styles.milestoneName, { color: Colors.blue[400] }]} numberOfLines={1}>
                            📍 {media.milestone_name}
                          </Text>
                        )}
                        {media.description && (
                          <Text style={[styles.mediaDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                            {media.description}
                          </Text>
                        )}
                        <View style={styles.mediaFooter}>
                          <View style={styles.mediaType}>
                            <Ionicons
                              name={media.file_type === 'image' ? 'image' : 'videocam'}
                              size={12}
                              color={colors.textTertiary}
                            />
                            <Text style={[styles.mediaTypeText, { color: colors.textTertiary }]}>
                              {media.file_type.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={[styles.mediaSize, { color: colors.textTertiary }]}>
                            {(media.file_size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </GlassSurface>
          </View>
        )}
      </ScrollView>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <Modal
          visible={!!selectedMedia}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedMedia(null)}
          statusBarTranslucent
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={() => setSelectedMedia(null)}
              activeOpacity={1}
            />
            <View style={styles.modalContent}>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedMedia(null)}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={36} color={Colors.red[500]} />
              </TouchableOpacity>

              {/* Media Display */}
              <View style={styles.modalMediaContainer}>
                {selectedMedia.file_type === 'image' ? (
                  <Image
                    source={{ uri: selectedMedia.signedUrl }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <Ionicons name="play-circle" size={64} color={Colors.purple[400]} />
                    <Text style={[styles.videoText, { color: colors.text }]}>
                      Video playback not supported in preview
                    </Text>
                  </View>
                )}
              </View>

              {/* Media Info */}
              <View style={styles.modalInfo}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedMedia.title || selectedMedia.file_name}
                </Text>
                {selectedMedia.description && (
                  <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                    {selectedMedia.description}
                  </Text>
                )}
                <View style={styles.modalFooter}>
                  <View style={styles.modalFooterItem}>
                    <Ionicons name="document" size={16} color={colors.textSecondary} />
                    <Text style={[styles.modalFooterText, { color: colors.textSecondary }]}>
                      {selectedMedia.file_name}
                    </Text>
                  </View>
                  <View style={styles.modalFooterItem}>
                    <Ionicons name="resize" size={16} color={colors.textSecondary} />
                    <Text style={[styles.modalFooterText, { color: colors.textSecondary }]}>
                      {(selectedMedia.file_size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
      </View>
    </MeshGlowBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    backgroundColor: '#0B1429',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
  projectTypeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
  },
  projectTypeBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  projectTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noticeCard: {
    padding: 16,
    marginBottom: 16,
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
    marginTop: 12,
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
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateText: {
    fontSize: 16,
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
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
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

  // Media Gallery Styles
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  gallerySubtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  mediaCount: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptyGallery: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  mediaItem: {
    width: '50%',
    padding: 6,
  },
  mediaThumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a2332',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a2332',
  },
  videoText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredText: {
    color: '#0B1429',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  mediaInfo: {
    marginTop: 8,
  },
  mediaTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  milestoneName: {
    fontSize: 11,
    marginBottom: 4,
  },
  mediaDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  mediaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mediaTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  mediaSize: {
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#0B1429',
    borderRadius: 16,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 18,
  },
  modalMediaContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#000000',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalFooter: {
    gap: 12,
  },
  modalFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalFooterText: {
    fontSize: 13,
  },
});
