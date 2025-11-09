import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import GlassSurface from '../GlassSurface';
import MeshGlowBackground from '../MeshGlowBackground';
import WhatsAppSkeleton from '../skeletons/WhatsAppSkeleton';
import { supabase } from '../../lib/supabase';
import { getWhatsappInstanceByCompanyService } from '../../lib/api/whatsappInstances';
import { getSessionsByCompany } from '../../lib/api/whatsappSessions';
import { getUserProfiles } from '../../lib/api/whatsappUserProfiles';
import { getErrors } from '../../lib/api/whatsappErrors';
import { getLatestDailyMetric, getDailyMetrics } from '../../lib/api/whatsappMetrics';
import { getMessageStatistics } from '../../lib/api/whatsappMessages';
import { getUserCompanyId } from '../../lib/api/dashboard';
import ConversationDetailModal from '../whatsapp/ConversationDetailModal';
import KVKKConsentModal from '../whatsapp/KVKKConsentModal';

type TabType = 'conversations' | 'analytics' | 'users' | 'integrations' | 'errors' | 'settings';
type ConversationFilter = 'all' | 'active' | 'closed';
type ErrorFilter = 'all' | 'unresolved' | 'critical';
type DateFilter = 'today' | '7days' | '30days';

interface WhatsAppServiceViewProps {
  serviceId: string;
  onBack: () => void;
}

const AnimatedView = Animated.View;

export default function WhatsAppServiceView({ serviceId, onBack }: WhatsAppServiceViewProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('conversations');

  // Company ID state
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Data state
  const [instance, setInstance] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Conversation state
  const [conversationFilter, setConversationFilter] = useState<ConversationFilter>('active');
  const [conversationSearch, setConversationSearch] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Users state
  const [userSearch, setUserSearch] = useState('');

  // Errors state
  const [errorFilter, setErrorFilter] = useState<ErrorFilter>('unresolved');
  const [errorSearch, setErrorSearch] = useState('');

  // Analytics state
  const [dateFilter, setDateFilter] = useState<DateFilter>('7days');
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);

  // KVKK Consent state
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasUserConsent, setHasUserConsent] = useState(false);
  const [checkingConsent, setCheckingConsent] = useState(true);

  // Fetch company ID
  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!user?.id) return;
      const id = await getUserCompanyId(user.id);
      setCompanyId(id);
    };
    fetchCompanyId();
  }, [user?.id]);

  // Check user consent on mount (KVKK compliance)
  useEffect(() => {
    if (user?.id && serviceId && companyId) {
      checkUserConsent();
    }
  }, [user?.id, serviceId, companyId]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      // Don't show error while waiting for companyId to load
      if (!serviceId) {
        setError('Service ID not found');
        setLoading(false);
        return;
      }

      if (!companyId) {
        // Still loading company ID, don't set error yet
        return;
      }

      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        console.log('📡 [WhatsApp] Fetching data for service:', serviceId);

        // Get WhatsApp instance
        const instanceData = await getWhatsappInstanceByCompanyService(serviceId);
        setInstance(instanceData);

        if (instanceData && companyId) {
          // Get sessions (conversations)
          const sessionsData = await getSessionsByCompany(companyId);
          setSessions(sessionsData || []);

          // Get metrics
          const metricsData = await getLatestDailyMetric(companyId);
          setMetrics(metricsData);
        }

        console.log('✅ [WhatsApp] Data loaded');
      } catch (err: any) {
        console.error('❌ [WhatsApp] Error loading data:', err);
        setError(err.message || 'Failed to load WhatsApp data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId, companyId]);

  // Real-time subscription for conversations
  useEffect(() => {
    if (!companyId || !instance) return;

    console.log('🔔 [WhatsApp] Setting up real-time subscriptions');

    const sessionsChannel = supabase
      .channel(`whatsapp-sessions-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_sessions',
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          console.log('🔔 [WhatsApp] Session changed, refreshing...');
          fetchConversations();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel(`whatsapp-messages-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
        },
        () => {
          console.log('🔔 [WhatsApp] New message received');
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 [WhatsApp] Cleaning up subscriptions');
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [companyId, instance]);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!companyId) return;
    try {
      const sessionsData = await getSessionsByCompany(companyId);
      setSessions(sessionsData || []);
    } catch (err) {
      console.error('❌ Error refreshing conversations:', err);
    }
  };

  // Fetch user profiles
  const fetchUserProfiles = async () => {
    if (!companyId) return;
    try {
      const profiles = await getUserProfiles(companyId);
      setUserProfiles(profiles || []);
    } catch (err) {
      console.error('❌ Error fetching user profiles:', err);
    }
  };

  // Check if user has given KVKK consent for WhatsApp service
  const checkUserConsent = async () => {
    if (!user?.id || !serviceId) return;

    try {
      setCheckingConsent(true);

      // Check user_service_consents table
      const { data, error } = await supabase
        .from('user_service_consents')
        .select('*')
        .eq('user_id', user.id)
        .eq('service_type', 'whatsapp-automation')
        .eq('consent_given', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found
        console.error('❌ Error checking consent:', error);
      }

      if (data) {
        console.log('✅ User has given consent');
        setHasUserConsent(true);
        setShowConsentModal(false);
      } else {
        // First time accessing - show consent modal
        console.log('⚠️ No consent found, showing modal');
        setHasUserConsent(false);
        setShowConsentModal(true);
      }
    } catch (err) {
      console.error('❌ Error checking consent:', err);
    } finally {
      setCheckingConsent(false);
    }
  };

  // Handle user consent acceptance
  const handleAcceptConsent = async () => {
    if (!user?.id || !companyId) return;

    try {
      console.log('📝 Saving user consent...');

      // Save consent to database
      const { error } = await supabase.from('user_service_consents').insert({
        user_id: user.id,
        company_id: companyId,
        service_type: 'whatsapp-automation',
        consent_given: true,
        consent_date: new Date().toISOString(),
        consent_version: '1.0',
        ip_address: null, // Could be tracked if needed
      });

      if (error) {
        console.error('❌ Error saving consent:', error);
        Alert.alert('Hata', 'Onay kaydedilemedi. Lütfen tekrar deneyin.');
        return;
      }

      setHasUserConsent(true);
      setShowConsentModal(false);
      console.log('✅ User consent recorded');
    } catch (err) {
      console.error('❌ Error saving consent:', err);
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Fetch errors
  const fetchErrors = async () => {
    if (!companyId) return;
    try {
      const filters: any = {};
      if (errorFilter === 'unresolved') {
        filters.isResolved = false;
      } else if (errorFilter === 'critical') {
        filters.isResolved = false;
        filters.severity = ['high', 'critical'];
      }
      const errorsData = await getErrors(companyId, filters);
      setErrors(errorsData || []);
    } catch (err) {
      console.error('❌ Error fetching errors:', err);
    }
  };

  // Fetch analytics metrics with date range
  const fetchAnalytics = async () => {
    if (!companyId) return;
    try {
      console.log('📊 Fetching analytics with filter:', dateFilter);

      const endDate = new Date();
      const startDate = new Date();

      if (dateFilter === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === '7days') {
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate.setDate(startDate.getDate() - 30);
      }

      console.log('📊 Date range:', { start: startDate.toISOString(), end: endDate.toISOString() });

      // Use getMessageStatistics for proper analytics data
      const stats = await getMessageStatistics(companyId, {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });

      console.log('✅ Analytics data fetched:', stats);
      setMetrics(stats);
    } catch (err) {
      console.error('❌ Error fetching analytics:', err);
    }
  };

  // Load data for specific tabs
  useEffect(() => {
    if (activeTab === 'users' && userProfiles.length === 0) {
      fetchUserProfiles();
    } else if (activeTab === 'errors') {
      fetchErrors();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  // Reload analytics when date filter changes
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [dateFilter]);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'conversations') {
        await fetchConversations();
      } else if (activeTab === 'users') {
        await fetchUserProfiles();
      } else if (activeTab === 'errors') {
        await fetchErrors();
      } else if (activeTab === 'analytics') {
        await fetchAnalytics();
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Filter conversations
  const filteredSessions = sessions.filter((session) => {
    // Filter by status
    if (conversationFilter === 'active' && !session.is_active) return false;
    if (conversationFilter === 'closed' && session.is_active) return false;

    // Filter by search
    if (conversationSearch) {
      const searchLower = conversationSearch.toLowerCase();
      return (
        session.customer_name?.toLowerCase().includes(searchLower) ||
        session.customer_phone?.includes(searchLower)
      );
    }

    return true;
  });

  // Filter users
  const filteredUsers = userProfiles.filter((user) => {
    if (userSearch) {
      const searchLower = userSearch.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.phone_number?.includes(searchLower)
      );
    }
    return true;
  });

  // Filter errors
  const filteredErrors = errors.filter((err) => {
    if (errorSearch) {
      const searchLower = errorSearch.toLowerCase();
      return (
        err.error_message?.toLowerCase().includes(searchLower) ||
        err.error_code?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'conversations', label: 'Chats', icon: 'chatbubbles' },
    { key: 'analytics', label: 'Analytics', icon: 'bar-chart' },
    { key: 'users', label: 'Users', icon: 'people' },
    { key: 'integrations', label: 'Integrations', icon: 'link' },
    { key: 'errors', label: 'Errors', icon: 'warning' },
    { key: 'settings', label: 'Settings', icon: 'settings' },
  ];

  // Show loading skeleton while checking consent or loading data
  if (loading || checkingConsent) {
    return <WhatsAppSkeleton />;
  }

  if (error || !instance) {
    return (
      <MeshGlowBackground>
        <View style={styles.container}>
          <GlassSurface style={styles.errorCard}>
            <Ionicons name="alert-circle" size={64} color={Colors.red[500]} />
            <Text style={[styles.errorTitle, { color: colors.text }]}>Error</Text>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>
              {error || 'WhatsApp instance not found'}
            </Text>
            <TouchableOpacity
              onPress={onBack}
              style={styles.errorButton}
            >
              <LinearGradient
                colors={[Colors.blue[600], Colors.blue[700]]}
                style={styles.errorButtonGradient}
              >
                <Text style={styles.errorButtonText}>Go Back</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassSurface>
        </View>
      </MeshGlowBackground>
    );
  }

  return (
    <MeshGlowBackground>
      <View style={styles.container}>
        {/* Sticky Header */}
        <View style={[styles.stickyHeader, { backgroundColor: '#0B1429' }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>

          <View style={styles.headerTitle}>
            <View style={styles.headerIcon}>
              <Ionicons name="logo-whatsapp" size={24} color={Colors.green[500]} />
            </View>
            <View>
              <Text style={[styles.headerTitleText, { color: colors.text }]}>WhatsApp Automation</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {instance.instance_name || 'Instance'}
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScrollView}
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
                        : 'rgba(255, 255, 255, 0.12)',
                      borderColor: isActive
                        ? Colors.green[600]
                        : 'rgba(255, 255, 255, 0.15)',
                    },
                  ]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={16}
                    color={isActive ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      { color: isActive ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green[500]} />
          }
        >
          {/* Conversations Tab */}
          {activeTab === 'conversations' && (
            <View style={styles.tabContent}>
              {/* Filters */}
              <View style={styles.filterSection}>
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={20} color={colors.textTertiary} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search conversations..."
                    placeholderTextColor={colors.textTertiary}
                    value={conversationSearch}
                    onChangeText={setConversationSearch}
                  />
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterChips}
                  contentContainerStyle={styles.filterChipsContent}
                >
                  {(['all', 'active', 'closed'] as ConversationFilter[]).map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => setConversationFilter(filter)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor:
                            conversationFilter === filter
                              ? Colors.green[500]
                              : 'rgba(255, 255, 255, 0.12)',
                          borderColor:
                            conversationFilter === filter
                              ? Colors.green[600]
                              : 'rgba(255, 255, 255, 0.15)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          {
                            color:
                              conversationFilter === filter
                                ? '#FFFFFF'
                                : colors.textSecondary,
                          },
                        ]}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Conversations List */}
              {filteredSessions.length === 0 ? (
                <GlassSurface style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={64} color={colors.textTertiary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Conversations</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {conversationFilter === 'all'
                      ? 'No conversations found'
                      : `No ${conversationFilter} conversations`}
                  </Text>
                </GlassSurface>
              ) : (
                filteredSessions.map((session, index) => (
                  <AnimatedView
                    key={session.id}
                    entering={FadeInDown.duration(400).delay(index * 50)}
                  >
                    <TouchableOpacity
                      onPress={() => setSelectedSessionId(session.id)}
                      activeOpacity={0.7}
                    >
                      <GlassSurface style={styles.conversationCard}>
                      <View style={styles.conversationHeader}>
                        <View style={styles.avatarContainer}>
                          <LinearGradient
                            colors={[Colors.green[500], Colors.green[600]]}
                            style={styles.avatar}
                          >
                            <Text style={styles.avatarText}>
                              {session.customer_name?.charAt(0) || '?'}
                            </Text>
                          </LinearGradient>
                        </View>
                        <View style={styles.conversationInfo}>
                          <Text style={[styles.conversationName, { color: colors.text }]}>
                            {session.customer_name || session.customer_phone}
                          </Text>
                          <Text style={[styles.conversationPhone, { color: colors.textSecondary }]}>
                            {session.customer_phone}
                          </Text>
                        </View>
                        {session.unread_count > 0 && (
                          <View style={[styles.badge, { backgroundColor: Colors.green[500] }]}>
                            <Text style={styles.badgeText}>{session.unread_count}</Text>
                          </View>
                        )}
                      </View>
                      {session.last_message && (
                        <Text
                          style={[styles.lastMessage, { color: colors.textSecondary }]}
                          numberOfLines={2}
                        >
                          {session.last_message}
                        </Text>
                      )}
                      <View style={styles.conversationFooter}>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: session.is_active
                                ? `${Colors.green[500]}20`
                                : `${colors.textSecondary}20`,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color: session.is_active
                                  ? Colors.green[500]
                                  : colors.textSecondary,
                              },
                            ]}
                          >
                            {session.is_active ? 'Active' : 'Closed'}
                          </Text>
                        </View>
                        <View style={styles.conversationMeta}>
                          <View style={styles.messageCountBadge}>
                            <Ionicons name="chatbubble" size={12} color={Colors.blue[400]} />
                            <Text style={[styles.messageCountText, { color: Colors.blue[400] }]}>
                              {session.message_count || 0}
                            </Text>
                          </View>
                          <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                            {new Date(session.updated_at).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </GlassSurface>
                    </TouchableOpacity>
                  </AnimatedView>
                ))
              )}
            </View>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <View style={styles.tabContent}>
              {/* Date Filter */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterChips}
                contentContainerStyle={styles.filterChipsContent}
              >
                {(['today', '7days', '30days'] as DateFilter[]).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setDateFilter(filter)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          dateFilter === filter
                            ? Colors.blue[500]
                            : 'rgba(255, 255, 255, 0.12)',
                        borderColor:
                          dateFilter === filter
                            ? Colors.blue[600]
                            : 'rgba(255, 255, 255, 0.15)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color:
                            dateFilter === filter
                              ? '#FFFFFF'
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {filter === 'today' ? 'Today' : filter === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.statsGrid}>
                {/* Total Messages */}
                <GlassSurface style={styles.statCard}>
                  <LinearGradient
                    colors={[Colors.blue[500], Colors.cyan[500]]}
                    style={styles.statIcon}
                  >
                    <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {metrics?.total || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Total Messages
                  </Text>
                </GlassSurface>

                {/* Customer Messages */}
                <GlassSurface style={styles.statCard}>
                  <LinearGradient
                    colors={[Colors.green[500], Colors.green[600]]}
                    style={styles.statIcon}
                  >
                    <Ionicons name="person" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {metrics?.customer || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Customer Messages
                  </Text>
                </GlassSurface>

                {/* Bot Responses */}
                <GlassSurface style={styles.statCard}>
                  <LinearGradient
                    colors={[Colors.purple[500], Colors.purple[700]]}
                    style={styles.statIcon}
                  >
                    <Ionicons name="flash" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {metrics?.bot || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    AI Responses
                  </Text>
                </GlassSurface>

                {/* Agent Responses */}
                <GlassSurface style={styles.statCard}>
                  <LinearGradient
                    colors={[Colors.orange[500], Colors.yellow[500]]}
                    style={styles.statIcon}
                  >
                    <Ionicons name="person-circle" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {metrics?.agent || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Agent Responses
                  </Text>
                </GlassSurface>
              </View>

              {/* Message Types Breakdown */}
              {metrics?.by_type && Object.keys(metrics.by_type).length > 0 && (
                <GlassSurface style={styles.messageTypesCard}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Message Types
                  </Text>
                  <View style={styles.messageTypesGrid}>
                    {Object.entries(metrics.by_type).map(([type, count]) => (
                      <View key={type} style={styles.messageTypeItem}>
                        <Text style={[styles.messageTypeCount, { color: colors.text }]}>
                          {count as number}
                        </Text>
                        <Text style={[styles.messageTypeLabel, { color: colors.textSecondary }]}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </GlassSurface>
              )}
            </View>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <View style={styles.tabContent}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={colors.textTertiary} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search users..."
                  placeholderTextColor={colors.textTertiary}
                  value={userSearch}
                  onChangeText={setUserSearch}
                />
              </View>

              {filteredUsers.length === 0 ? (
                <GlassSurface style={styles.emptyState}>
                  <Ionicons name="people-outline" size={64} color={colors.textTertiary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Users</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No user profiles found
                  </Text>
                </GlassSurface>
              ) : (
                filteredUsers.map((user, index) => (
                  <AnimatedView
                    key={user.id}
                    entering={FadeInDown.duration(400).delay(index * 50)}
                  >
                    <GlassSurface style={styles.userCard}>
                      <View style={styles.userHeader}>
                        <View style={styles.avatarContainer}>
                          <LinearGradient
                            colors={[Colors.blue[500], Colors.cyan[500]]}
                            style={styles.avatar}
                          >
                            <Text style={styles.avatarText}>
                              {user.name?.charAt(0) || '?'}
                            </Text>
                          </LinearGradient>
                        </View>
                        <View style={styles.userInfo}>
                          <Text style={[styles.userName, { color: colors.text }]}>
                            {user.name || 'Unknown'}
                          </Text>
                          <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
                            {user.phone_number}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.userStats}>
                        <View style={styles.userStat}>
                          <Ionicons name="chatbubble" size={16} color={Colors.blue[500]} />
                          <Text style={[styles.userStatText, { color: colors.textSecondary }]}>
                            {user.total_messages || 0} messages
                          </Text>
                        </View>
                        {user.last_seen && (
                          <View style={styles.userStat}>
                            <Ionicons name="time" size={16} color={Colors.purple[500]} />
                            <Text style={[styles.userStatText, { color: colors.textSecondary }]}>
                              Last seen: {new Date(user.last_seen).toLocaleDateString()}
                            </Text>
                          </View>
                        )}
                      </View>
                      {user.customer_status && (
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                user.customer_status === 'active'
                                  ? `${Colors.green[500]}20`
                                  : `${colors.textSecondary}20`,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color:
                                  user.customer_status === 'active'
                                    ? Colors.green[500]
                                    : colors.textSecondary,
                              },
                            ]}
                          >
                            {user.customer_status}
                          </Text>
                        </View>
                      )}
                    </GlassSurface>
                  </AnimatedView>
                ))
              )}
            </View>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <View style={styles.tabContent}>
              <GlassSurface style={styles.emptyState}>
                <Ionicons name="link" size={64} color={colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Integrations</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Google Calendar and Sheets integrations
                </Text>
              </GlassSurface>
            </View>
          )}

          {/* Errors Tab */}
          {activeTab === 'errors' && (
            <View style={styles.tabContent}>
              <View style={styles.filterSection}>
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={20} color={colors.textTertiary} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search errors..."
                    placeholderTextColor={colors.textTertiary}
                    value={errorSearch}
                    onChangeText={setErrorSearch}
                  />
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterChips}
                  contentContainerStyle={styles.filterChipsContent}
                >
                  {(['all', 'unresolved', 'critical'] as ErrorFilter[]).map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => setErrorFilter(filter)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor:
                            errorFilter === filter
                              ? Colors.red[500]
                              : 'rgba(255, 255, 255, 0.12)',
                          borderColor:
                            errorFilter === filter
                              ? Colors.red[600]
                              : 'rgba(255, 255, 255, 0.15)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          {
                            color:
                              errorFilter === filter ? '#FFFFFF' : colors.textSecondary,
                          },
                        ]}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {filteredErrors.length === 0 ? (
                <GlassSurface style={styles.emptyState}>
                  <Ionicons name="checkmark-circle" size={64} color={Colors.green[500]} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Errors</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Everything is running smoothly!
                  </Text>
                </GlassSurface>
              ) : (
                filteredErrors.map((err, index) => (
                  <AnimatedView
                    key={err.id}
                    entering={FadeInDown.duration(400).delay(index * 50)}
                  >
                    <GlassSurface style={styles.errorItemCard}>
                      <View style={styles.errorHeader}>
                        <Ionicons
                          name="alert-circle"
                          size={24}
                          color={
                            err.severity === 'critical' || err.severity === 'high'
                              ? Colors.red[500]
                              : Colors.yellow[500]
                          }
                        />
                        <Text style={[styles.errorCode, { color: colors.text }]}>
                          {err.error_code || 'UNKNOWN'}
                        </Text>
                      </View>
                      <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
                        {err.error_message}
                      </Text>
                      <View style={styles.errorFooter}>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: err.is_resolved
                                ? `${Colors.green[500]}20`
                                : `${Colors.red[500]}20`,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color: err.is_resolved
                                  ? Colors.green[500]
                                  : Colors.red[500],
                              },
                            ]}
                          >
                            {err.is_resolved ? 'Resolved' : 'Unresolved'}
                          </Text>
                        </View>
                        <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                          {new Date(err.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </GlassSurface>
                  </AnimatedView>
                ))
              )}
            </View>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <View style={styles.tabContent}>
              <GlassSurface style={styles.settingsCard}>
                <View style={styles.settingItem}>
                  <Ionicons name="server" size={24} color={Colors.blue[500]} />
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Instance Name
                    </Text>
                    <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                      {instance.instance_name || 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={styles.settingItem}>
                  <Ionicons name="call" size={24} color={Colors.green[500]} />
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Phone Number
                    </Text>
                    <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                      {instance.phone_number || 'Not set'}
                    </Text>
                  </View>
                </View>

                <View style={styles.settingItem}>
                  <Ionicons name="link" size={24} color={Colors.cyan[500]} />
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      API Status
                    </Text>
                    <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                      {instance.is_connected ? 'Connected' : 'Disconnected'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: instance.is_connected
                          ? Colors.green[500]
                          : Colors.red[500],
                      },
                    ]}
                  />
                </View>

                <View style={styles.settingItem}>
                  <Ionicons name="shield-checkmark" size={24} color={Colors.purple[500]} />
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Status
                    </Text>
                    <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                      {instance.status || 'active'}
                    </Text>
                  </View>
                </View>

                <View style={styles.settingItem}>
                  <Ionicons name="apps" size={24} color={Colors.orange[500]} />
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Instance Type
                    </Text>
                    <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                      {instance.instance_type || 'general'}
                    </Text>
                  </View>
                </View>

                {instance.evolution_api_url && (
                  <View style={styles.settingItem}>
                    <Ionicons name="cloud" size={24} color={Colors.blue[400]} />
                    <View style={styles.settingInfo}>
                      <Text style={[styles.settingLabel, { color: colors.text }]}>
                        Evolution API URL
                      </Text>
                      <Text
                        style={[styles.settingValue, { color: colors.textSecondary }]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {instance.evolution_api_url}
                      </Text>
                    </View>
                  </View>
                )}

                {instance.last_connected_at && (
                  <View style={styles.settingItem}>
                    <Ionicons name="time" size={24} color={Colors.yellow[500]} />
                    <View style={styles.settingInfo}>
                      <Text style={[styles.settingLabel, { color: colors.text }]}>
                        Last Connected
                      </Text>
                      <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                        {new Date(instance.last_connected_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.settingItem}>
                  <Ionicons name="calendar" size={24} color={Colors.red[400]} />
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Created At
                    </Text>
                    <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                      {new Date(instance.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </GlassSurface>

              {/* KVKK Data Deletion Section */}
              <GlassSurface style={styles.kvkkSection}>
                <View style={styles.kvkkHeader}>
                  <View style={styles.kvkkIconContainer}>
                    <Ionicons name="warning" size={32} color={Colors.red[400]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.kvkkTitle, { color: colors.text }]}>
                      Verilerimi Sil (KVKK Hakkı)
                    </Text>
                    <Text style={[styles.kvkkDescription, { color: Colors.red[300] }]}>
                      6698 sayılı KVKK kapsamında, WhatsApp servisi ile ilgili tüm kişisel verilerinizi kalıcı olarak silme hakkına sahipsiniz.
                    </Text>
                  </View>
                </View>

                <View style={styles.kvkkContent}>
                  <Text style={[styles.kvkkSectionTitle, { color: Colors.red[200] }]}>
                    ⚠️ Silinecek Veriler:
                  </Text>
                  <Text style={[styles.kvkkListItem, { color: Colors.red[300] }]}>• Tüm WhatsApp mesaj geçmişiniz</Text>
                  <Text style={[styles.kvkkListItem, { color: Colors.red[300] }]}>• Müşteri profil bilgileriniz</Text>
                  <Text style={[styles.kvkkListItem, { color: Colors.red[300] }]}>• Oturum (session) kayıtlarınız</Text>
                  <Text style={[styles.kvkkListItem, { color: Colors.red[300] }]}>• Hata logları ve sistem kayıtları</Text>
                  <Text style={[styles.kvkkListItem, { color: Colors.red[300] }]}>• İstatistik ve analiz verileri</Text>
                </View>

                <View style={styles.kvkkWarning}>
                  <Text style={[styles.kvkkWarningText, { color: Colors.orange[300] }]}>
                    <Text style={{ fontWeight: 'bold' }}>DİKKAT:</Text> Bu işlem geri alınamaz! Verileriniz kalıcı olarak silinecek ve kurtarılamayacaktır.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.kvkkButton}
                  onPress={async () => {
                    Alert.alert(
                      '⚠️ TÜM VERİLERİNİZİ SİLMEK ÜZERE OLDUĞUNUZ EMIN MİSİNİZ?',
                      'Bu işlem:\n• Tüm WhatsApp mesajlarınızı silecek\n• Müşteri profil bilgilerinizi silecek\n• Oturum kayıtlarınızı silecek\n• GERİ ALINAMAZ!\n\nDevam etmek istiyor musunuz?',
                      [
                        {
                          text: 'İptal',
                          style: 'cancel',
                        },
                        {
                          text: 'EVET, VERİLERİMİ SİL',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              if (!companyId) {
                                Alert.alert('Hata', 'Şirket bilgisi bulunamadı');
                                return;
                              }

                              console.log('🗑️ Starting KVKK data deletion for company:', companyId);

                              // Get all session IDs for this company
                              const { data: sessions, error: getSessionsError } = await supabase
                                .from('whatsapp_sessions')
                                .select('id')
                                .eq('company_id', companyId);

                              if (getSessionsError) throw getSessionsError;

                              const sessionIds = sessions?.map(s => s.id) || [];

                              // Delete messages for these sessions
                              if (sessionIds.length > 0) {
                                const { error: messagesError } = await supabase
                                  .from('whatsapp_messages')
                                  .delete()
                                  .in('session_id', sessionIds);

                                if (messagesError) throw messagesError;
                                console.log('✅ Messages deleted');
                              }

                              // Delete sessions
                              const { error: sessionsError } = await supabase
                                .from('whatsapp_sessions')
                                .delete()
                                .eq('company_id', companyId);

                              if (sessionsError) throw sessionsError;
                              console.log('✅ Sessions deleted');

                              // Delete user profiles
                              const { error: profilesError } = await supabase
                                .from('whatsapp_user_profiles')
                                .delete()
                                .eq('company_id', companyId);

                              if (profilesError) throw profilesError;
                              console.log('✅ User profiles deleted');

                              // Delete errors
                              const { error: errorsError } = await supabase
                                .from('whatsapp_errors')
                                .delete()
                                .eq('company_id', companyId);

                              if (errorsError) throw errorsError;
                              console.log('✅ Errors deleted');

                              Alert.alert(
                                '✅ Başarılı',
                                'Tüm verileriniz başarıyla silindi.',
                                [
                                  {
                                    text: 'Tamam',
                                    onPress: () => onBack(),
                                  },
                                ]
                              );
                            } catch (error) {
                              console.error('❌ Error deleting data:', error);
                              Alert.alert(
                                '❌ Hata',
                                'Veri silinirken bir hata oluştu. Lütfen tekrar deneyin veya destek ekibiyle iletişime geçin.'
                              );
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <LinearGradient
                    colors={[Colors.red[600], Colors.red[700]]}
                    style={styles.kvkkButtonGradient}
                  >
                    <Ionicons name="trash" size={20} color="#FFFFFF" />
                    <Text style={styles.kvkkButtonText}>
                      TÜM VERİLERİMİ KALICI OLARAK SİL
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </GlassSurface>
            </View>
          )}
        </ScrollView>

        {/* Conversation Detail Modal */}
        <ConversationDetailModal
          visible={selectedSessionId !== null}
          sessionId={selectedSessionId}
          onClose={() => setSelectedSessionId(null)}
        />

        {/* KVKK Consent Modal */}
        <KVKKConsentModal
          visible={showConsentModal}
          onAccept={handleAcceptConsent}
        />
      </View>
    </MeshGlowBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  tabsScrollView: {
    flexGrow: 0,
  },
  tabsContent: {
    gap: 8,
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  tabContent: {
    gap: 16,
  },
  filterSection: {
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterChips: {
    flexGrow: 0,
  },
  filterChipsContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  conversationCard: {
    padding: 16,
    marginBottom: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  conversationPhone: {
    fontSize: 13,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  messageCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 11,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 20,
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  userCard: {
    padding: 16,
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
  },
  errorItemCard: {
    padding: 16,
    marginBottom: 12,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  errorCode: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorMessage: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  errorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsCard: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
    marginTop: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
  },
  errorTitle: {
    fontSize: 24,
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
  errorButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  errorButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  userStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userStatText: {
    fontSize: 12,
  },
  // Message Types Card
  messageTypesCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  messageTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  messageTypeItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    minWidth: 80,
  },
  messageTypeCount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageTypeLabel: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  // KVKK Section Styles
  kvkkSection: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  kvkkHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  kvkkIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kvkkTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  kvkkDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  kvkkContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  kvkkSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  kvkkListItem: {
    fontSize: 12,
    lineHeight: 18,
    marginLeft: Spacing.sm,
  },
  kvkkWarning: {
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  kvkkWarningText: {
    fontSize: 12,
    lineHeight: 18,
  },
  kvkkButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  kvkkButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  kvkkButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
