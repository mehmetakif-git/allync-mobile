import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, ScrollView, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getActiveServices, getServiceIcon, type CompanyServiceWithDetails } from '../lib/api/companyServices';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';

interface TabConfig {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  isService?: boolean;
  serviceSlug?: string;
  companyServiceId?: string;
  instanceCount?: number;
  status?: string;
}

export default function DynamicTabBar() {
  const { theme, colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [tabs, setTabs] = useState<TabConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isCompanyAdmin = user?.role === 'company_admin';

  // Fetch company services and build tabs
  useEffect(() => {
    const fetchServicesAndBuildTabs = async () => {
      try {
        setIsLoading(true);

        // Base tabs (always visible)
        const baseTabs: TabConfig[] = [
          { name: 'Home', icon: 'home', route: '/(tabs)/' },
        ];

        let serviceTabs: TabConfig[] = [];

        // If user has company_id, fetch services
        if (user?.company_id) {
          try {
            const services = await getActiveServices(user.company_id);
            console.log('📱 [DynamicTabBar] Fetched services:', services.length);

            // Group services by service_type_id
            const serviceGroups = services.reduce((acc: any, cs: any) => {
              // Skip if service type is inactive
              if (cs.service_type?.status === 'inactive') {
                return acc;
              }

              const typeId = cs.service_type_id;
              if (!acc[typeId]) {
                acc[typeId] = [];
              }
              acc[typeId].push(cs);
              return acc;
            }, {});

            // Build service tabs (one per service type)
            serviceTabs = Object.entries(serviceGroups).map(
              ([typeId, instances]: [string, any]) => {
                const firstInstance = instances[0];
                const service = firstInstance.service_type;

                const isGloballyInMaintenance = service.status === 'maintenance';
                const hasInstanceInMaintenance = instances.some((inst: any) => inst.status === 'maintenance');
                const isInMaintenance = isGloballyInMaintenance || hasInstanceInMaintenance;

                return {
                  name: service.name_en,
                  icon: getServiceIcon(service.slug) as keyof typeof Ionicons.glyphMap,
                  route: `/(tabs)/services/${service.slug}`,
                  isService: true,
                  serviceSlug: service.slug,
                  companyServiceId: firstInstance.id,
                  instanceCount: instances.length,
                  status: isInMaintenance ? 'maintenance' : 'active',
                };
              }
            );
          } catch (serviceError) {
            console.error('❌ [DynamicTabBar] Error fetching services:', serviceError);
            // Add default services tab on error
            serviceTabs = [{ name: 'Services', icon: 'server', route: '/(tabs)/services' }];
          }
        } else {
          // No company_id, show default services tab
          serviceTabs = [{ name: 'Services', icon: 'server', route: '/(tabs)/services' }];
        }

        // Bottom tabs (company admin only for some)
        const bottomTabs: TabConfig[] = [
          ...(isCompanyAdmin ? [{ name: 'Invoices', icon: 'receipt' as keyof typeof Ionicons.glyphMap, route: '/(tabs)/invoices' }] : []),
          { name: 'Support', icon: 'chatbubbles' as keyof typeof Ionicons.glyphMap, route: '/(tabs)/support' },
        ];

        // Combine all tabs
        const allTabs = [...baseTabs, ...serviceTabs, ...bottomTabs];
        console.log('📱 [DynamicTabBar] Built tabs:', allTabs.length, allTabs);

        setTabs(allTabs);
      } catch (error) {
        console.error('❌ [DynamicTabBar] Critical error:', error);
        // Absolute fallback
        setTabs([
          { name: 'Home', icon: 'home', route: '/(tabs)/' },
          { name: 'Services', icon: 'server', route: '/(tabs)/services' },
          { name: 'Support', icon: 'chatbubbles', route: '/(tabs)/support' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServicesAndBuildTabs();
  }, [user?.company_id, isCompanyAdmin]);

  // Determine active index based on current route
  const getActiveIndex = () => {
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      if (pathname === tab.route || pathname.startsWith(tab.route + '/')) {
        return i;
      }
    }
    return 0; // Default to Home
  };

  const activeIndex = getActiveIndex();

  const handleTabPress = (index: number) => {
    const tab = tabs[index];
    router.push(tab.route as any);
  };

  // Show loading state with placeholder tabs
  if (isLoading) {
    console.log('📱 [DynamicTabBar] Still loading tabs...');
  }

  // Always show tab bar, even if empty (with fallback)
  if (tabs.length === 0) {
    console.log('⚠️ [DynamicTabBar] No tabs found, this should not happen');
    return null;
  }

  // If more than 5 tabs, use scrollable tab bar
  if (tabs.length > 5) {
    return (
      <View style={styles.container}>
        <BlurView
          intensity={theme === 'dark' ? 95 : 100}
          tint={theme === 'dark' ? 'dark' : 'light'}
          style={styles.blurContainer}
        >
          <View
            style={[
              styles.scrollInnerContainer,
              {
                backgroundColor:
                  theme === 'dark' ? 'rgba(43, 44, 44, 0.75)' : 'rgba(248, 249, 250, 0.75)',
                borderColor:
                  theme === 'dark'
                    ? 'rgba(248, 249, 250, 0.12)'
                    : 'rgba(43, 44, 44, 0.12)',
              },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {tabs.map((tab, index) => (
                <TabButton
                  key={`${tab.route}-${index}`}
                  tab={tab}
                  index={index}
                  activeIndex={activeIndex}
                  onPress={() => handleTabPress(index)}
                  theme={theme}
                  isScrollable
                />
              ))}
            </ScrollView>
          </View>
        </BlurView>
      </View>
    );
  }

  // Regular fixed tab bar (4-5 tabs)
  return (
    <View style={styles.container}>
      <BlurView
        intensity={theme === 'dark' ? 95 : 100}
        tint={theme === 'dark' ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        <View
          style={[
            styles.innerContainer,
            {
              backgroundColor:
                theme === 'dark' ? 'rgba(43, 44, 44, 0.75)' : 'rgba(248, 249, 250, 0.75)',
              borderColor:
                theme === 'dark'
                  ? 'rgba(248, 249, 250, 0.12)'
                  : 'rgba(43, 44, 44, 0.12)',
            },
          ]}
        >
          {tabs.map((tab, index) => (
            <TabButton
              key={`${tab.route}-${index}`}
              tab={tab}
              index={index}
              activeIndex={activeIndex}
              onPress={() => handleTabPress(index)}
              theme={theme}
            />
          ))}
        </View>
      </BlurView>
    </View>
  );
}

interface TabButtonProps {
  tab: TabConfig;
  index: number;
  activeIndex: number;
  onPress: () => void;
  theme: 'dark' | 'light';
  isScrollable?: boolean;
}

function TabButton({ tab, index, activeIndex, onPress, theme, isScrollable }: TabButtonProps) {
  const isActive = activeIndex === index;
  const scale = useSharedValue(isActive ? 1.1 : 1);
  const translateY = useSharedValue(isActive ? -2 : 0);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.1 : 1, {
      damping: 15,
      stiffness: 150,
    });
    translateY.value = withSpring(isActive ? -2 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const iconColor = isActive
    ? theme === 'dark'
      ? Colors.blue[400]
      : Colors.blue[600]
    : theme === 'dark'
    ? 'rgba(248, 249, 250, 0.5)'
    : 'rgba(43, 44, 44, 0.5)';

  // Status indicator for maintenance
  const isInMaintenance = tab.status === 'maintenance';

  return (
    <TouchableOpacity
      style={[styles.tabButton, isScrollable && styles.scrollableTabButton]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <Ionicons name={tab.icon} size={24} color={iconColor} />
        {isInMaintenance && (
          <View style={styles.maintenanceBadge}>
            <Ionicons name="warning" size={10} color={Colors.orange[500]} />
          </View>
        )}
        {tab.instanceCount && tab.instanceCount > 1 && !isInMaintenance && (
          <View style={[styles.countBadge, { backgroundColor: Colors.blue[500] }]}>
            <Text style={styles.countBadgeText}>{tab.instanceCount}</Text>
          </View>
        )}
      </Animated.View>
      {isScrollable && (
        <Text
          style={[
            styles.tabLabel,
            {
              color: isActive
                ? theme === 'dark'
                  ? Colors.blue[400]
                  : Colors.blue[600]
                : theme === 'dark'
                ? 'rgba(248, 249, 250, 0.5)'
                : 'rgba(43, 44, 44, 0.5)',
            },
          ]}
          numberOfLines={1}
        >
          {tab.name}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 15,
    left: 20,
    right: 20,
    height: Platform.OS === 'ios' ? 90 : 75,
    borderRadius: BorderRadius['3xl'],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  blurContainer: {
    flex: 1,
    borderRadius: BorderRadius['3xl'],
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderRadius: BorderRadius['3xl'],
    borderWidth: 1,
  },
  scrollInnerContainer: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderRadius: BorderRadius['3xl'],
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollableTabButton: {
    flex: 0,
    minWidth: 70,
    paddingHorizontal: Spacing.sm,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  maintenanceBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.orange[500]}30`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.orange[500],
  },
  countBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.medium,
    marginTop: 4,
    textAlign: 'center',
  },
});
