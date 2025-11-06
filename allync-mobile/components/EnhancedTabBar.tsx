import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import GlassSurface from './GlassSurface';

interface TabConfig {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

interface MenuItemConfig {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

export default function EnhancedTabBar() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isCompanyAdmin = user?.role === 'company_admin';

  // Debug logging
  console.log('EnhancedTabBar - User:', user);
  console.log('EnhancedTabBar - isCompanyAdmin:', isCompanyAdmin);

  // 3 main tabs: Home, Plus, Support
  const mainTabs: TabConfig[] = [
    { name: 'Home', icon: 'home', route: '/(tabs)/' },
    { name: 'Support', icon: 'chatbubbles', route: '/(tabs)/support' },
  ];

  // Expandable menu items: Services, Active Services, Invoices
  const menuItems: MenuItemConfig[] = [
    { name: 'Services', icon: 'grid', route: '/(tabs)/services' },
    { name: 'Active', icon: 'pulse', route: '/(tabs)/active-services' },
    { name: 'Invoices', icon: 'receipt', route: '/(tabs)/invoices' },
  ];

  console.log('EnhancedTabBar - menuItems:', menuItems);

  const getActiveTab = () => {
    // Check if current pathname matches any menu item route
    for (const item of menuItems) {
      const itemRoute = item.route;
      if (pathname === itemRoute) return 'menu'; // Active tab is in menu
      const routeWithoutTabs = itemRoute.replace('/(tabs)', '');
      if (pathname === routeWithoutTabs || pathname.startsWith(routeWithoutTabs + '/')) {
        return 'menu'; // Active tab is in menu
      }
    }

    // Check main tabs
    for (const tab of mainTabs) {
      const tabRoute = tab.route;
      if (pathname === tabRoute) return tab.route;
      const routeWithoutTabs = tabRoute.replace('/(tabs)', '');
      if (pathname === routeWithoutTabs || pathname.startsWith(routeWithoutTabs + '/')) {
        return tab.route;
      }
    }
    return '/(tabs)/';
  };

  const activeTab = getActiveTab();
  const isPlusActive = activeTab === 'menu';

  const handleMenuItemPress = (route: string) => {
    setIsMenuOpen(false);
    router.push(route as any);
  };

  const handlePlusPress = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Auto-close menu when navigating to different tabs
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [pathname]);

  return (
    <>
      {/* Backdrop overlay */}
      {isMenuOpen && (
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsMenuOpen(false)}
        >
          <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
        </Pressable>
      )}

      {/* Expandable Menu */}
      <ExpandableMenu
        isOpen={isMenuOpen}
        items={menuItems}
        onItemPress={handleMenuItemPress}
        colors={colors}
        pathname={pathname}
      />

      {/* Main Tab Bar */}
      <View style={styles.container}>
        <GlassSurface
          style={styles.glassContainer}
          borderRadius={30}
          borderWidth={1}
          opacity={0.95}
          brightness={50}
        >
          <View style={styles.innerContainer}>
            <View style={styles.tabsRow}>
              {/* Home Tab */}
              <MainTabButton
                tab={mainTabs[0]}
                isActive={activeTab === mainTabs[0].route}
                onPress={() => router.push(mainTabs[0].route as any)}
                colors={colors}
              />

              {/* Plus Button */}
              <PlusButton
                isOpen={isMenuOpen}
                isActive={isPlusActive}
                onPress={handlePlusPress}
                colors={colors}
              />

              {/* Support Tab */}
              <MainTabButton
                tab={mainTabs[1]}
                isActive={activeTab === mainTabs[1].route}
                onPress={() => router.push(mainTabs[1].route as any)}
                colors={colors}
              />
            </View>
          </View>
        </GlassSurface>
      </View>
    </>
  );
}

function ExpandableMenu({ isOpen, items, onItemPress, colors, pathname }: any) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      scale.value = withSpring(1, {
        damping: 30,
        stiffness: 180,
      });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(0, {
        damping: 30,
        stiffness: 180,
      });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Check if a menu item is active
  const isMenuItemActive = (route: string) => {
    if (pathname === route) return true;
    const routeWithoutTabs = route.replace('/(tabs)', '');
    if (pathname === routeWithoutTabs || pathname.startsWith(routeWithoutTabs + '/')) {
      return true;
    }
    return false;
  };

  if (!isOpen && opacity.value === 0) return null;

  return (
    <Animated.View style={[styles.expandableMenu, animatedStyle]}>
      <GlassSurface
        style={styles.menuContainer}
        borderRadius={60}
        borderWidth={1}
        opacity={0.98}
        brightness={55}
      >
        <View style={styles.menuContent}>
          {items.map((item: MenuItemConfig) => {
            const isActive = isMenuItemActive(item.route);
            return (
              <TouchableOpacity
                key={item.route}
                style={styles.menuItem}
                onPress={() => onItemPress(item.route)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.menuIconContainer,
                  isActive && { backgroundColor: 'rgba(59, 130, 246, 0.4)' }
                ]}>
                  <Ionicons
                    name={item.icon}
                    size={28}
                    color={isActive ? Colors.blue[300] : Colors.blue[400]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassSurface>
    </Animated.View>
  );
}

function PlusButton({ isOpen, isActive, onPress, colors }: any) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withSpring(isOpen ? 45 : 0, {
      damping: 15,
      stiffness: 200,
    });
    scale.value = withSpring(isOpen || isActive ? 1.1 : 1, {
      damping: 15,
      stiffness: 200,
    });
  }, [isOpen, isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const iconColor = isActive ? Colors.blue[400] : colors.text;

  return (
    <TouchableOpacity
      style={styles.plusButtonContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons name="add-outline" size={42} color={iconColor} style={{ fontWeight: '900' }} />
      </Animated.View>
    </TouchableOpacity>
  );
}

function MainTabButton({ tab, isActive, onPress, colors }: any) {
  const iconScale = useSharedValue(isActive ? 1.1 : 1);
  const textOpacity = useSharedValue(isActive ? 1 : 0.7);

  useEffect(() => {
    iconScale.value = withSpring(isActive ? 1.1 : 1, {
      damping: 15,
      stiffness: 200,
      mass: 0.5,
    });
    textOpacity.value = withTiming(isActive ? 1 : 0.7, { duration: 200 });
  }, [isActive]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const iconColor = isActive ? Colors.blue[400] : colors.textSecondary;
  const labelColor = isActive ? colors.text : colors.textSecondary;

  return (
    <TouchableOpacity style={styles.mainTab} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.tabContent}>
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <Ionicons name={tab.icon} size={26} color={iconColor} />
        </Animated.View>

        <Animated.Text
          style={[
            styles.label,
            { color: labelColor, fontWeight: isActive ? '700' : '500' },
            textStyle,
          ]}
          numberOfLines={1}
        >
          {tab.name}
        </Animated.Text>
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
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
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
  },
  mainTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  },
  plusButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandableMenu: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 115 : 95,
    alignSelf: 'center',
    zIndex: 999,
  },
  menuContainer: {
    overflow: 'hidden',
  },
  menuContent: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 20,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
