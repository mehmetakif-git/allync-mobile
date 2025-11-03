import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius, Shadows } from '../../constants/Spacing';
import { getDashboardStats, getUserCompanyId, formatCurrency, type DashboardStats } from '../../lib/api/dashboard';

const AnimatedView = Animated.View;
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Home() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

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
      const data = await getDashboardStats(companyId);
      setStats(data);
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
        signOut().then(() => {
          router.replace('/');
        });
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
              await signOut();
              router.replace('/');
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

  // Show loading state while fetching data
  if (loading && !stats) {
    return (
      <LinearGradient colors={Gradients.primary} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.blue[500]} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Gradients.primary} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue[500]} />
        }
      >
        {/* Header with Avatar */}
        <AnimatedView
          entering={FadeInDown.duration(600).springify()}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[Colors.blue[500], Colors.cyan[500]]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']}
              style={styles.signOutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color={Colors.red[400]} />
            </LinearGradient>
          </TouchableOpacity>
        </AnimatedView>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <AnimatedTouchable
              key={stat.id}
              entering={FadeInDown.duration(600).delay(index * 80).springify()}
              style={styles.statCard}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={stat.bgGradient}
                style={styles.statCardGradient}
              >
                <View style={styles.statHeader}>
                  <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}30` }]}>
                    <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                  </View>
                  <View style={[styles.statBadge, { backgroundColor: `${stat.color}20` }]}>
                    <View style={[styles.statDot, { backgroundColor: stat.color }]} />
                  </View>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
                <Text style={[styles.statChange, { color: stat.color }]}>{stat.change}</Text>
              </LinearGradient>
            </AnimatedTouchable>
          ))}
        </View>

        {/* Quick Actions */}
        <AnimatedView
          entering={FadeInDown.duration(600).delay(320).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>Frequently used actions</Text>
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

        {/* Recent Activity */}
        <AnimatedView
          entering={FadeInDown.duration(600).delay(400).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityCard}>
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.1)', 'rgba(6, 182, 212, 0.05)']}
              style={styles.activityCardGradient}
            >
              <Ionicons name="time-outline" size={48} color={Colors.text.tertiary} />
              <Text style={styles.activityText}>No recent activity</Text>
              <Text style={styles.activitySubtext}>Your recent activity will appear here</Text>
            </LinearGradient>
          </View>
        </AnimatedView>
      </ScrollView>
    </LinearGradient>
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
}) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={gradient}
        style={styles.actionButtonGradient}
      >
        <View style={[styles.actionIconContainer, { backgroundColor: `${color}30` }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </LinearGradient>
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
    paddingTop: Spacing['5xl'],
    paddingBottom: Spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing['3xl'],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarContainer: {
    ...Shadows.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  greeting: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  userName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textTransform: 'capitalize',
  },
  signOutButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  signOutGradient: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
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
  statCardGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...Shadows.md,
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
  actionButtonGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    ...Shadows.sm,
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
  activityCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  activityCardGradient: {
    padding: Spacing['3xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  activityText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  activitySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});
