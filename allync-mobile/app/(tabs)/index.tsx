import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeIn, useAnimatedStyle, withSpring, withRepeat, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useServiceNavigation } from '../../contexts/ServiceNavigationContext';
import { useRouter } from 'expo-router';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius, Shadows } from '../../constants/Spacing';
import { getDashboardStats, getUserCompanyId, formatCurrency, getActiveServices, type DashboardStats, type ActiveService } from '../../lib/api/dashboard';
import NotificationsPanel from '../../components/NotificationsPanel';
import DashboardHeader from '../../components/DashboardHeader';
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton';
import MeshGlowBackground from '../../components/MeshGlowBackground';
const AnimatedView = Animated.View;
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
export default function Home() {
  const { user, signOut } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const { navigateToService } = useServiceNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2); // Mock data
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [activeServices, setActiveServices] = useState<ActiveService[]>([]);
  const bellScale = useSharedValue(1);
  const bellAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bellScale.value }],
  }));
  // Fetch company ID on mount
  useEffect(() => {
    if (user?.id) {
      fetchCompanyId();
    }
  }, [user?.id]);
  // Fetch stats when company ID is available
  useEffect(() => {
    if (companyId) {
      fetchStats();
    }
  }, [companyId]);
  const fetchCompanyId = async () => {
    if (!user?.id) return;
    const id = await getUserCompanyId(user.id);
    setCompanyId(id);
  };
  const fetchStats = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const [statsData, servicesData] = await Promise.all([
        getDashboardStats(companyId),
        getActiveServices(companyId),
      ]);
      setStats(statsData);
      setActiveServices(servicesData);
      console.log('🔧 [Home] Active services:', servicesData);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };
  const handleSignOut = () => {
    // Web doesn't support Alert.alert, so use window.confirm
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (confirmed) {
        signOut(); // AuthGuard will handle navigation automatically
      }
    } else {
      // Native platforms (iOS/Android) use Alert.alert
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              await signOut(); // AuthGuard will handle navigation automatically
            },
          },
        ]
      );
    }
  };
  // Generate stat cards from real data
  const statCards = stats ? [
    {
      id: 1,
      title: 'Active Services',
      value: stats.activeServicesCount.toString(),
      change: stats.activeServicesCount > 0 ? `${stats.activeServicesCount} active` : 'No services',
      icon: 'server-outline',
      color: Colors.blue[500],
      bgGradient: ['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.05)']
    },
    {
      id: 2,
      title: 'Pending Invoices',
      value: stats.pendingInvoicesCount.toString(),
      change: stats.pendingInvoicesAmount > 0 ? formatCurrency(stats.pendingInvoicesAmount, stats.currency) + ' due' : 'All paid',
      icon: 'receipt-outline',
      color: Colors.cyan[500],
      bgGradient: ['rgba(6, 182, 212, 0.2)', 'rgba(6, 182, 212, 0.05)']
    },
    {
      id: 3,
      title: 'Open Tickets',
      value: stats.openTicketsCount.toString(),
      change: stats.urgentTicketsCount > 0 ? `${stats.urgentTicketsCount} urgent` : 'No urgent',
      icon: 'chatbubbles-outline',
      color: Colors.yellow[500],
      bgGradient: ['rgba(234, 179, 8, 0.2)', 'rgba(234, 179, 8, 0.05)']
    },
    {
      id: 4,
      title: 'Total Spent',
      value: formatCurrency(stats.totalSpent, stats.currency),
      change: 'All time',
      icon: 'wallet-outline',
      color: Colors.green[500],
      bgGradient: ['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.05)']
    },
  ] : [];
  // Theme-aware styles
  const dynamicStyles = {
    greeting: {
      color: colors.textTertiary,
    },
    userName: {
      color: colors.text,
    },
    statValue: {
      color: colors.text,
    },
    statTitle: {
      color: colors.textSecondary,
    },
    sectionTitle: {
      color: colors.text,
    },
    sectionSubtitle: {
      color: colors.textTertiary,
    },
    actionTitle: {
      color: colors.text,
    },
    actionSubtitle: {
      color: colors.textTertiary,
    },
    activityText: {
      color: colors.text,
    },
    activitySubtext: {
      color: colors.textTertiary,
    },
    avatarText: {
      color: Colors.titanium,
    },
  };
  // Show loading state while fetching data
  if (loading && !stats) {
    return (
      <View style={styles.container}>
        <DashboardSkeleton />
      </View>
    );
  }
  return (
    <MeshGlowBackground>
        {/* Header Component */}
        <DashboardHeader
          userName={user?.email?.split('@')[0] || 'User'}
          userInitial={user?.email?.charAt(0).toUpperCase() || 'U'}
          onNotificationPress={() => setShowNotifications(true)}
          onSignOutPress={handleSignOut}
          unreadCount={unreadCount}
          bellAnimatedStyle={bellAnimatedStyle}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue[500]} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <AnimatedTouchable
              key={stat.id}
              entering={FadeInDown.duration(600).delay(index * 80).springify()}
              style={styles.statCard}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} tint="dark" style={styles.statCardBlur}>
                <View style={styles.statCardGlass}>
                  <View style={styles.statHeader}>
                    <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}30` }]}>
                      <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                    </View>
                    <View style={[styles.statBadge, { backgroundColor: `${stat.color}20` }]}>
                      <View style={[styles.statDot, { backgroundColor: stat.color }]} />
                    </View>
                  </View>
                  <Text style={[styles.statValue, dynamicStyles.statValue]}>{stat.value}</Text>
                  <Text style={[styles.statTitle, dynamicStyles.statTitle]}>{stat.title}</Text>
                  <Text style={[styles.statChange, { color: stat.color }]}>{stat.change}</Text>
                </View>
              </BlurView>
            </AnimatedTouchable>
          ))}
        </View>
        {/* Quick Actions */}
        <AnimatedView
          entering={FadeInDown.duration(600).delay(320).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Quick Actions</Text>
              <Text style={[styles.sectionSubtitle, dynamicStyles.sectionSubtitle]}>Frequently used actions</Text>
            </View>
          </View>
          <View style={styles.actionsContainer}>
            <QuickAction
              icon="add-circle-outline"
              title="New Ticket"
              subtitle="Get support"
              color={Colors.blue[500]}
              gradient={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.05)']}
              onPress={() => router.push('/(tabs)/support')}
            />
            <QuickAction
              icon="card-outline"
              title="Pay Invoice"
              subtitle="View pending"
              color={Colors.cyan[500]}
              gradient={['rgba(6, 182, 212, 0.2)', 'rgba(6, 182, 212, 0.05)']}
              onPress={() => router.push('/(tabs)/invoices')}
            />
            <QuickAction
              icon="server-outline"
              title="Manage"
              subtitle="Your services"
              color={Colors.purple[500]}
              gradient={['rgba(168, 85, 247, 0.2)', 'rgba(168, 85, 247, 0.05)']}
              onPress={() => router.push('/(tabs)/services')}
            />
          </View>
        </AnimatedView>
        {/* Active Services */}
        <AnimatedView
          entering={FadeInDown.duration(600).delay(400).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Your Active Services</Text>
            {activeServices.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/services')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.servicesGrid}>
            {activeServices.length === 0 ? (
              <View style={styles.emptyServicesCard}>
                <BlurView intensity={20} tint="dark" style={styles.emptyServicesBlur}>
                  <View style={styles.emptyServicesContent}>
                    <Ionicons name="server-outline" size={48} color={colors.textTertiary} />
                    <Text style={[styles.emptyServicesText, { color: colors.text }]}>No active services</Text>
                    <Text style={[styles.emptyServicesSubtext, { color: colors.textSecondary }]}>Contact support to get started</Text>
                  </View>
                </BlurView>
              </View>
            ) : (
              activeServices.slice(0, 4).map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                  onPress={() => {
                    const slug = service.service_type.slug;
                    if (slug === 'mobile-app-development') {
                      navigateToService('mobile-app', service.id);
                      router.push('/(tabs)/services');
                    } else if (slug === 'website-development') {
                      navigateToService('website', service.id);
                      router.push('/(tabs)/services');
                    } else if (slug === 'whatsapp-service' || slug === 'whatsapp-automation') {
                      navigateToService('whatsapp', service.id);
                      router.push('/(tabs)/services');
                    }
                  }}
                />
              ))
            )}
          </View>
        </AnimatedView>
      </ScrollView>
      {/* Notifications Panel */}
      <NotificationsPanel
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNotificationRead={() => setUnreadCount((prev) => Math.max(0, prev - 1))}
        onMarkAllRead={() => setUnreadCount(0)}
      />
    </MeshGlowBackground>
  );
}
function ServiceCard({
  service,
  index,
  onPress,
}: {
  service: ActiveService;
  index: number;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  const getServiceColor = (slug: string) => {
    switch (slug) {
      case 'mobile-app-development': return Colors.cyan[500];
      case 'website-development': return Colors.purple[500];
      case 'whatsapp-service': return Colors.green[500];
      default: return Colors.blue[500];
    }
  };

  const getServiceIcon = (slug: string) => {
    switch (slug) {
      case 'mobile-app-development': return 'phone-portrait-outline';
      case 'website-development': return 'globe-outline';
      case 'whatsapp-service': return 'logo-whatsapp';
      default: return 'server-outline';
    }
  };

  const serviceColor = getServiceColor(service.service_type.slug);
  const gradient = [`${serviceColor}20`, `${serviceColor}05`];

  return (
    <AnimatedTouchable
      entering={FadeInDown.duration(400).delay(index * 50)}
      style={styles.serviceCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <BlurView intensity={20} tint="dark" style={styles.serviceCardBlur}>
        <View style={styles.serviceCardGlass}>
          <View style={[styles.serviceIconContainer, { backgroundColor: `${serviceColor}30` }]}>
            <Ionicons name={getServiceIcon(service.service_type.slug) as any} size={24} color={serviceColor} />
          </View>
          <Text style={[styles.serviceTitle, { color: colors.text }]} numberOfLines={1}>
            {service.instance_name || service.service_type.name_en}
          </Text>
          <Text style={[styles.servicePackage, { color: serviceColor }]}>
            {service.package}
          </Text>
        </View>
      </BlurView>
    </AnimatedTouchable>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
  color,
  gradient,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  gradient: string[];
  onPress: () => void;
  theme: 'light' | 'dark';
}) {
  const textColor = Colors.text.primary;
  const subtitleColor = Colors.text.tertiary;
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
      <BlurView intensity={20} tint="dark" style={styles.actionButtonBlur}>
        <View style={styles.actionButtonGlass}>
          <View style={[styles.actionIconContainer, { backgroundColor: `${color}30` }]}>
            <Ionicons name={icon as any} size={24} color={color} />
          </View>
          <Text style={[styles.actionTitle, { color: textColor }]}>{title}</Text>
          <Text style={[styles.actionSubtitle, { color: subtitleColor }]}>{subtitle}</Text>
        </View>
      </BlurView>
    </TouchableOpacity>
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
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    width: '48%',
  },
  statCardBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  statCardGlass: {
    padding: Spacing.lg,
  },
  statCardGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statValue: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  statTitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statChange: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing['3xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.blue[500],
    fontWeight: Typography.fontWeight.medium,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionButtonGlass: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  actionButtonGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  serviceCard: {
    width: '48%',
  },
  serviceCardBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  serviceCardGlass: {
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  serviceTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  servicePackage: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'uppercase',
  },
  emptyServicesCard: {
    width: '100%',
  },
  emptyServicesBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyServicesContent: {
    padding: Spacing['3xl'],
    alignItems: 'center',
  },
  emptyServicesText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyServicesSubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
});
