import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getActiveServices, getServiceIcon } from '../lib/api/companyServices';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';
import GlassSurface from './GlassSurface';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabConfig {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  instanceCount?: number;
  status?: string;
}

export default function EnhancedTabBar() {
  const { theme, colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [tabs, setTabs] = useState<TabConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isCompanyAdmin = user?.role === 'company_admin';

  useEffect(() => {
    const fetchServicesAndBuildTabs = async () => {
      try {
        setIsLoading(true);
        const baseTabs: TabConfig[] = [{ name: 'Home', icon: 'home', route: '/(tabs)/' }];
        let serviceTabs: TabConfig[] = [];

        if (user?.company_id) {
          try {
            const services = await getActiveServices(user.company_id);
            const serviceGroups = services.reduce((acc: any, cs: any) => {
              if (cs.service_type?.status === 'inactive') return acc;
              const typeId = cs.service_type_id;
              if (!acc[typeId]) acc[typeId] = [];
              acc[typeId].push(cs);
              return acc;
            }, {});

            serviceTabs = Object.entries(serviceGroups).map(([_, instances]: [string, any]) => {
              const firstInstance = instances[0];
              const service = firstInstance.service_type;
              const isInMaintenance = service.status === 'maintenance' || instances.some((inst: any) => inst.status === 'maintenance');
              return {
                name: service.name_en,
                icon: getServiceIcon(service.slug) as keyof typeof Ionicons.glyphMap,
                route: `/(tabs)/services/${service.slug}`,
                instanceCount: instances.length,
                status: isInMaintenance ? 'maintenance' : 'active',
              };
            });
          } catch {
            serviceTabs = [{ name: 'Services', icon: 'server', route: '/(tabs)/services' }];
          }
        } else {
          serviceTabs = [{ name: 'Services', icon: 'server', route: '/(tabs)/services' }];
        }

        const bottomTabs: TabConfig[] = [
          ...(isCompanyAdmin ? [{ name: 'Invoices', icon: 'receipt' as keyof typeof Ionicons.glyphMap, route: '/(tabs)/invoices' }] : []),
          { name: 'Support', icon: 'chatbubbles' as keyof typeof Ionicons.glyphMap, route: '/(tabs)/support' },
        ];

        setTabs([...baseTabs, ...serviceTabs, ...bottomTabs]);
      } catch {
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

  const getActiveIndex = () => {
    console.log('🔍 [TabBar] Checking pathname:', pathname, 'Available routes:', tabs.map(t => t.route));

    for (let i = 0; i < tabs.length; i++) {
      const tabRoute = tabs[i].route;

      // Exact match
      if (pathname === tabRoute) {
        console.log('✅ [TabBar] Exact match! Tab:', tabs[i].name, 'Index:', i);
        return i;
      }

      // Check if pathname matches without (tabs) prefix
      // Pathname: /services, Route: /(tabs)/services
      const routeWithoutTabs = tabRoute.replace('/(tabs)', '');
      if (pathname === routeWithoutTabs || pathname.startsWith(routeWithoutTabs + '/')) {
        console.log('✅ [TabBar] Route match! Tab:', tabs[i].name, 'Index:', i);
        return i;
      }

      // Check if pathname starts with route
      if (pathname.startsWith(tabRoute + '/') || pathname.startsWith(tabRoute)) {
        console.log('✅ [TabBar] Prefix match! Tab:', tabs[i].name, 'Index:', i);
        return i;
      }
    }

    console.log('⚠️ [TabBar] No match found, defaulting to Home');
    return 0;
  };

  const activeIndex = getActiveIndex();

  console.log('🎯 [TabBar] Rendering with activeIndex:', activeIndex, 'tabs count:', tabs.length);

  if (tabs.length === 0) return null;

  return (
    <View style={styles.container}>
      <GlassSurface
        style={styles.glassContainer}
        borderRadius={30}
        borderWidth={1}
        opacity={0.93}
        brightness={50}
        theme={theme}
      >
        <View style={styles.innerContainer}>
          {/* Tabs */}
          <View style={styles.tabsRow}>
            {tabs.map((tab, index) => (
              <TabButton
                key={`${tab.route}-${index}`}
                tab={tab}
                isActive={activeIndex === index}
                onPress={() => router.push(tab.route as any)}
                theme={theme}
                colors={colors}
                tabsCount={tabs.length}
              />
            ))}
          </View>
        </View>
      </GlassSurface>
    </View>
  );
}

function TabButton({ tab, isActive, onPress, theme, colors, tabsCount }: any) {
  const iconScale = useSharedValue(isActive ? 1.2 : 1);
  const bgOpacity = useSharedValue(isActive ? 1 : 0);
  const bgScale = useSharedValue(isActive ? 1 : 0.9);

  useEffect(() => {
    // Çok hızlı ve smooth animasyon
    iconScale.value = withSpring(isActive ? 1.15 : 1, {
      damping: 12,
      stiffness: 200,
      mass: 0.5,
    });
    bgOpacity.value = withTiming(isActive ? 1 : 0, { duration: 200 });
    bgScale.value = withSpring(isActive ? 1 : 0.92, {
      damping: 12,
      stiffness: 200,
      mass: 0.5,
    });
  }, [isActive]);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
    transform: [{ scale: bgScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const iconColor = isActive ? (theme === 'dark' ? '#E5E7EB' : '#1F2937') : colors.textSecondary;
  const labelColor = isActive ? (theme === 'dark' ? '#E5E7EB' : '#1F2937') : colors.textSecondary;

  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.tabWrapper}>
        {/* Animated Background */}
        <Animated.View
          style={[
            styles.tabBackground,
            {
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            },
            bgStyle,
          ]}
        />

        {/* Content */}
        <View style={styles.tabContent}>
          <Animated.View style={[styles.iconContainer, iconStyle]}>
            <Ionicons name={tab.icon} size={22} color={iconColor} />
            {tab.status === 'maintenance' && (
              <View style={styles.badge}>
                <Ionicons name="warning" size={10} color={Colors.orange[500]} />
              </View>
            )}
            {tab.instanceCount && tab.instanceCount > 1 && !tab.status && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{tab.instanceCount}</Text>
              </View>
            )}
          </Animated.View>
          <Text style={[styles.label, { color: labelColor, fontWeight: isActive ? '700' : '500' }]} numberOfLines={1}>
            {tab.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 15,
    left: 20,
    right: 20,
    height: Platform.OS === 'ios' ? 85 : 70,
  },
  glassContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
    gap: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  tabBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    zIndex: 1,
  },
  iconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: `${Colors.orange[500]}30`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.orange[500],
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.blue[500],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
  },
});
