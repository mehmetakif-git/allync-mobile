import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getCompanyById } from '../../lib/api/companies';
import { getActivityLogs } from '../../lib/api/activityLogs';
import { supabase } from '../../lib/supabase';
import GlassSurface from '../../components/GlassSurface';
import SettingsSkeleton from '../../components/skeletons/SettingsSkeleton';
import MeshGlowBackground from '../../components/MeshGlowBackground';

const AnimatedView = Animated.View;
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CompanyData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  address?: string;
  city?: string;
  postal_code?: string;
  tax_id?: string;
  registration_number?: string;
  billing_email?: string;
  website?: string;
  logo_url?: string;
  status: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  action: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  browser?: string;
  device_type?: string;
  created_at: string;
}

type TabType = 'account' | 'company' | 'security' | 'preferences';

export default function Settings() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loginHistory, setLoginHistory] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Fetch company ID first
  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data?.company_id) {
          setCompanyId(data.company_id);
        }
      } catch (error) {
        console.error('Error fetching company ID:', error);
      }
    };
    fetchCompanyId();
  }, [user?.id]);

  // Fetch data when company ID is available
  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const fetchData = async () => {
    if (!companyId) return;

    try {
      setLoading(true);

      console.log('🏢 [Settings] Fetching data for company:', companyId);

      // Fetch company data
      const company = await getCompanyById(companyId);
      setCompanyData(company);
      console.log('✅ [Settings] Company data loaded:', company.name);

      // Fetch activity logs (login history)
      if (user?.id) {
        const activities = await getActivityLogs({
          filters: {
            user_id: user.id,
            action: 'User Login'
          },
          limit: 10,
          sortBy: 'created_at',
          sortOrder: 'desc'
        });
        setLoginHistory(activities.data || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings data:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Parse user agent to get device info
  const parseUserAgent = (log: ActivityLog) => {
    if (log.browser && log.device_type) {
      return `${log.browser} on ${log.device_type}`;
    }

    const userAgent = log.user_agent;
    if (!userAgent) return 'Unknown Device';

    if (userAgent.includes('iPhone')) return 'Safari on iPhone';
    if (userAgent.includes('iPad')) return 'Safari on iPad';
    if (userAgent.includes('Android')) return 'Chrome on Android';
    if (userAgent.includes('Windows')) return 'Chrome on Windows';
    if (userAgent.includes('Macintosh')) return 'Safari on Mac';
    if (userAgent.includes('Linux')) return 'Browser on Linux';

    return 'Unknown Device';
  };

  const tabs = [
    { id: 'account' as TabType, label: 'Account', icon: 'person' as const },
    { id: 'company' as TabType, label: 'Company', icon: 'business' as const },
    { id: 'security' as TabType, label: 'Security', icon: 'shield-checkmark' as const },
  ];

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <MeshGlowBackground>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue[500]} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              View your account information and preferences
            </Text>
          </View>

          {/* Read-Only Notice */}
          <GlassSurface style={styles.noticeCard}>
            <View style={styles.noticeContent}>
              <View style={[styles.noticeIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Ionicons name="information-circle" size={20} color={Colors.blue[400]} />
              </View>
              <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
                Company information is managed by Super Admin. Contact support to update account details.
              </Text>
            </View>
          </GlassSurface>

          {/* Tabs */}
          <View style={styles.filtersContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <BlurView
                  intensity={20}
                  tint="dark"
                  style={[
                    styles.filterButton,
                    styles.cardBlur,
                    {
                      backgroundColor: activeTab === tab.id ? Colors.blue[500] : 'rgba(255, 255, 255, 0.08)',
                      borderColor: activeTab === tab.id ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                    },
                  ]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={16}
                    color={activeTab === tab.id ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.filterButtonText,
                      {
                        color: activeTab === tab.id ? '#FFFFFF' : colors.textSecondary,
                        fontWeight: activeTab === tab.id ? '700' : '500',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>

          {/* Account Overview Tab */}
          {activeTab === 'account' && (
            <View style={styles.tabContent}>
              <GlassSurface style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Profile Information</Text>
                  <View style={styles.statusBadge}>
                    <Ionicons name="eye-off" size={12} color={Colors.blue[400]} />
                    <Text style={styles.statusText}>Read-Only</Text>
                  </View>
                </View>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                  <LinearGradient
                    colors={[Colors.blue[500], Colors.cyan[600]]}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>
                      {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </LinearGradient>
                  <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: colors.text }]}>{user?.full_name}</Text>
                    <Text style={[styles.profileRole, { color: colors.textSecondary }]}>
                      {user?.role === 'company_admin' ? 'Company Admin' : 'User'}
                    </Text>
                    <Text style={[styles.profileCompany, { color: colors.textTertiary }]}>
                      {companyData?.name}
                    </Text>
                  </View>
                </View>

                {/* Profile Details */}
                <View style={styles.detailsGrid}>
                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="mail" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{user?.email}</Text>
                  </View>

                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="call" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Phone</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>Not set</Text>
                  </View>

                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="business" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Company</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{companyData?.name || 'N/A'}</Text>
                  </View>

                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.green[500]} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: Colors.green[500] }]}>Active</Text>
                  </View>

                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Member Since</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>

                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="globe" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Language</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>English</Text>
                  </View>
                </View>
              </GlassSurface>
            </View>
          )}

          {/* Company Information Tab */}
          {activeTab === 'company' && companyData && (
            <View style={styles.tabContent}>
              <GlassSurface style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Company Details</Text>
                  <View style={styles.statusBadge}>
                    <Ionicons name="eye-off" size={12} color={Colors.blue[400]} />
                    <Text style={styles.statusText}>Read-Only</Text>
                  </View>
                </View>

                {/* Company Header */}
                <View style={[styles.companyHeader]}>
                  <LinearGradient
                    colors={[Colors.blue[500], Colors.cyan[600]]}
                    style={styles.companyLogo}
                  >
                    <Ionicons name="business" size={32} color={Colors.titanium} />
                  </LinearGradient>
                  <View style={styles.companyInfo}>
                    <Text style={[styles.companyName, { color: colors.text }]}>{companyData.name}</Text>
                    <Text style={[styles.companyId, { color: colors.textTertiary }]}>ID: {companyData.id.slice(0, 8)}...</Text>
                  </View>
                </View>

                {/* Contact Information */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
                <View style={styles.detailsGrid}>
                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="mail" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{companyData.email || 'N/A'}</Text>
                  </View>

                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Billing Email</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {companyData.billing_email || companyData.email || 'N/A'}
                    </Text>
                  </View>

                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="call" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Phone</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{companyData.phone || 'N/A'}</Text>
                  </View>

                  {companyData.website && (
                    <View style={[styles.detailItem]}>
                      <View style={styles.detailHeader}>
                        <Ionicons name="link" size={16} color={colors.textSecondary} />
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Website</Text>
                      </View>
                      <TouchableOpacity onPress={() => companyData.website && Linking.openURL(companyData.website)}>
                        <Text style={[styles.detailValue, { color: Colors.blue[400] }]}>{companyData.website}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Address */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Address</Text>
                <View style={styles.detailsGrid}>
                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="location" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Address</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{companyData.address || 'Not set'}</Text>
                  </View>

                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>City</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{companyData.city || 'Not set'}</Text>
                  </View>

                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="keypad" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Postal Code</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{companyData.postal_code || 'Not set'}</Text>
                  </View>

                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="globe" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Country</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{companyData.country || 'Not set'}</Text>
                  </View>
                </View>

                {/* Tax & Legal */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Tax & Legal Information</Text>
                <View style={styles.detailsGrid}>
                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="document-text" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tax ID</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{companyData.tax_id || 'Not set'}</Text>
                  </View>

                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="document" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Registration</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {companyData.registration_number || 'Not set'}
                    </Text>
                  </View>

                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.green[500]} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: Colors.green[500] }]}>
                      {companyData.status || 'Active'}
                    </Text>
                  </View>

                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Registered Since</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {companyData.created_at ? new Date(companyData.created_at).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                </View>
              </GlassSurface>
            </View>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <View style={styles.tabContent}>
              <GlassSurface style={styles.card}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Security Overview</Text>
                <View style={styles.detailsGrid}>
                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="lock-closed" size={16} color={Colors.green[500]} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Password</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>Protected</Text>
                    <Text style={[styles.detailHint, { color: colors.textTertiary }]}>
                      Contact Super Admin to change password
                    </Text>
                  </View>

                  <View style={[styles.detailItem]}>
                    <View style={styles.detailHeader}>
                      <Ionicons name="time" size={16} color={Colors.blue[500]} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Last Login</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {loginHistory[0] ? new Date(loginHistory[0].created_at).toLocaleString() : 'N/A'}
                    </Text>
                    <Text style={[styles.detailHint, { color: colors.textTertiary }]}>
                      {loginHistory[0]?.ip_address || 'Unknown location'}
                    </Text>
                  </View>
                </View>
              </GlassSurface>

              <GlassSurface style={styles.card}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Login History</Text>
                {loginHistory.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="desktop-outline" size={48} color={colors.textTertiary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No login history available</Text>
                  </View>
                ) : (
                  <View style={styles.historyList}>
                    {loginHistory.map((login, index) => (
                      <AnimatedView
                        key={login.id}
                        entering={FadeInDown.delay(400 + index * 50)}
                      >
                        <BlurView
                          intensity={20}
                          tint="dark"
                          style={[styles.historyItem, styles.cardBlur]}
                        >
                          <View style={styles.historyIconContainer}>
                            <Ionicons name="desktop" size={20} color={Colors.green[500]} />
                          </View>
                          <View style={styles.historyContent}>
                            <Text style={[styles.historyDevice, { color: colors.text }]}>
                              {parseUserAgent(login)}
                            </Text>
                            <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
                              {new Date(login.created_at).toLocaleString()}
                            </Text>
                            <View style={styles.historyMeta}>
                              <Ionicons name="globe-outline" size={12} color={colors.textTertiary} />
                              <Text style={[styles.historyIp, { color: colors.textTertiary }]}>
                                {login.ip_address || 'Unknown IP'}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.successBadge}>
                            <Text style={styles.successText}>Success</Text>
                          </View>
                        </BlurView>
                      </AnimatedView>
                    ))}
                  </View>
                )}
              </GlassSurface>
            </View>
          )}
        </ScrollView>
      </MeshGlowBackground>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.lg,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
  cardBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    overflow: 'hidden',
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
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.blue[400],
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.titanium,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: Typography.fontSize.sm,
    marginBottom: 2,
  },
  profileCompany: {
    fontSize: Typography.fontSize.xs,
  },
  detailsGrid: {
    gap: Spacing.md,
  },
  detailItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  detailLabel: {
    fontSize: Typography.fontSize.xs,
  },
  detailValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  detailHint: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  companyLogo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  companyId: {
    fontSize: Typography.fontSize.xs,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
  },
  historyList: {
    gap: Spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyDevice: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: Typography.fontSize.xs,
    marginBottom: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyIp: {
    fontSize: Typography.fontSize.xs,
  },
  successBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  successText: {
    fontSize: 10,
    color: Colors.green[500],
  },
});
