import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';

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
  const [isAnimating, setIsAnimating] = useState(false);

  const isCompanyAdmin = user?.role === 'company_admin';

  // Debug logging
  console.log('EnhancedTabBar - User:', user);
  console.log('EnhancedTabBar - isCompanyAdmin:', isCompanyAdmin);

  // 3 main tabs: Home, Plus, Support
  const mainTabs: TabConfig[] = [
    { name: 'Home', icon: 'home', route: '/(tabs)/' },
    { name: 'Support', icon: 'chatbubbles', route: '/(tabs)/support' },
  ];

  // Expandable menu items: Services, Invoices, Settings
  const menuItems: MenuItemConfig[] = [
    { name: 'Services', icon: 'grid', route: '/(tabs)/services' },
    { name: 'Invoices', icon: 'receipt', route: '/(tabs)/invoices' },
    { name: 'Settings', icon: 'settings', route: '/(tabs)/settings' },
  ];

  console.log('EnhancedTabBar - menuItems:', menuItems);

  const getActiveTab = () => {
    console.log('Current pathname:', pathname);

    // Check if current pathname matches any menu item route
    for (const item of menuItems) {
      const itemRoute = item.route;
      const routeWithoutTabs = itemRoute.replace('/(tabs)', '');

      // Exact match
      if (pathname === itemRoute || pathname === routeWithoutTabs) {
        console.log('Active tab is menu item:', item.name);
        return itemRoute;
      }

      // Starts with match (for nested routes)
      if (pathname.startsWith(routeWithoutTabs + '/')) {
        console.log('Active tab is menu item (nested):', item.name);
        return itemRoute;
      }
    }

    // Check main tabs
    for (const tab of mainTabs) {
      const tabRoute = tab.route;
      const routeWithoutTabs = tabRoute.replace('/(tabs)', '');

      // Exact match for home route
      if (tabRoute === '/(tabs)/' && (pathname === '/(tabs)/' || pathname === '/' || pathname === '/(tabs)')) {
        console.log('Active tab is:', tab.name);
        return tabRoute;
      }

      // Exact match
      if (pathname === tabRoute || pathname === routeWithoutTabs) {
        console.log('Active tab is:', tab.name);
        return tabRoute;
      }

      // Starts with match (for nested routes)
      if (pathname.startsWith(routeWithoutTabs + '/') && routeWithoutTabs !== '') {
        console.log('Active tab is (nested):', tab.name);
        return tabRoute;
      }
    }

    console.log('No match, defaulting to home');
    return '/(tabs)/';
  };

  const activeTab = getActiveTab();

  // Check if any menu item is active
  const isPlusActive = menuItems.some((item) => {
    const itemRoute = item.route;
    const routeWithoutTabs = itemRoute.replace('/(tabs)', '');
    return pathname === itemRoute || pathname === routeWithoutTabs || pathname.startsWith(routeWithoutTabs + '/');
  });

  console.log('isPlusActive:', isPlusActive);

  const handleMenuItemPress = (route: string) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsMenuOpen(false);
    router.push(route as any);
    // Reset animation lock after close animation completes (3 items * 80ms + animation duration)
    setTimeout(() => setIsAnimating(false), 400);
  };

  const handlePlusPress = () => {
    if (isAnimating) {
      console.log('Animation in progress, ignoring click');
      return;
    }
    console.log('Plus button pressed! Current isMenuOpen:', isMenuOpen);
    setIsAnimating(true);
    setIsMenuOpen(!isMenuOpen);
    console.log('Setting isMenuOpen to:', !isMenuOpen);

    // Reset animation lock after animation completes
    // Opening: 3 items * 100ms delay + 300ms animation = 600ms
    // Closing: 3 items * 80ms delay + 300ms animation = 540ms
    setTimeout(() => setIsAnimating(false), isMenuOpen ? 540 : 600);
  };

  // Auto-close menu when navigating to different tabs
  const prevPathnameRef = React.useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname && isMenuOpen) {
      console.log('Pathname changed, closing menu');
      setIsMenuOpen(false);
    }
    prevPathnameRef.current = pathname;
  }, [pathname]);

  return (
    <>
      {/* Backdrop overlay - Solid dark overlay for Android compatibility */}
      {isMenuOpen && (
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsMenuOpen(false)}
        />
      )}

      {/* Expandable Menu */}
      <ExpandableMenu
        isOpen={isMenuOpen}
        items={menuItems}
        onItemPress={handleMenuItemPress}
        colors={colors}
        pathname={pathname}
      />

      {/* Plus Button - Floating above tab bar */}
      <View style={styles.floatingPlusContainer} pointerEvents="box-none">
        <PlusButton
          isOpen={isMenuOpen}
          isActive={isPlusActive}
          onPress={handlePlusPress}
          colors={colors}
        />
      </View>

      {/* Main Tab Bar */}
      <View style={styles.container} pointerEvents="box-none">
        <View style={styles.glassContainer}>
          <View style={styles.innerContainer}>
            <View style={styles.tabsRow}>
              {/* Home Tab */}
              <MainTabButton
                tab={mainTabs[0]}
                isActive={activeTab === mainTabs[0].route}
                onPress={() => router.push(mainTabs[0].route as any)}
                colors={colors}
              />

              {/* Empty space for floating plus button */}
              <View style={styles.plusSpacer} />

              {/* Support Tab */}
              <MainTabButton
                tab={mainTabs[1]}
                isActive={activeTab === mainTabs[1].route}
                onPress={() => router.push(mainTabs[1].route as any)}
                colors={colors}
              />
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

function ExpandableMenu({ isOpen, items, onItemPress, colors, pathname }: any) {
  // Check if a menu item is active
  const isMenuItemActive = (route: string) => {
    if (pathname === route) return true;
    const routeWithoutTabs = route.replace('/(tabs)', '');
    if (pathname === routeWithoutTabs || pathname.startsWith(routeWithoutTabs + '/')) {
      return true;
    }
    return false;
  };

  // Semicircular arc positions (135°, 90°, 45°)
  const getArcPosition = (index: number) => {
    const positions = [
      { left: 65, bottom: 85, angle: 135, initialX: -40, initialRotate: -45 }, // Left
      { left: '50%', bottom: 110, angle: 90, initialX: 0, initialRotate: 0, centered: true }, // Center Top
      { right: 65, bottom: 85, angle: 45, initialX: 40, initialRotate: 45 }, // Right
    ];
    return positions[index];
  };

  return (
    <View style={styles.expandableMenu} pointerEvents={isOpen ? 'auto' : 'none'}>
      {items.map((item: MenuItemConfig, index: number) => (
        <MenuIcon
          key={item.route}
          item={item}
          index={index}
          isOpen={isOpen}
          isActive={isMenuItemActive(item.route)}
          onPress={() => onItemPress(item.route)}
          position={getArcPosition(index)}
        />
      ))}
    </View>
  );
}

function MenuIcon({ item, index, isOpen, isActive, onPress, position }: any) {
  const translateY = useSharedValue(80);
  const translateX = useSharedValue(position.initialX);
  const rotate = useSharedValue(position.initialRotate);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      // Cascading delay: 0s, 0.1s, 0.2s
      const delay = index * 100;

      // Rolling cascade animation with spring/bounce effect
      translateY.value = withDelay(
        delay,
        withSpring(0, {
          damping: 12,
          stiffness: 150,
          mass: 0.8,
        })
      );

      translateX.value = withDelay(
        delay,
        withSpring(position.centered ? 0 : 0, {
          damping: 12,
          stiffness: 150,
          mass: 0.8,
        })
      );

      rotate.value = withDelay(
        delay,
        withSpring(0, {
          damping: 12,
          stiffness: 150,
          mass: 0.8,
        })
      );

      opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    } else {
      // Reverse cascade animation when closing (2 -> 1 -> 0)
      const reverseDelay = (2 - index) * 80;

      translateY.value = withDelay(
        reverseDelay,
        withSpring(80, {
          damping: 15,
          stiffness: 180,
          mass: 0.6,
        })
      );

      translateX.value = withDelay(
        reverseDelay,
        withSpring(position.initialX, {
          damping: 15,
          stiffness: 180,
          mass: 0.6,
        })
      );

      rotate.value = withDelay(
        reverseDelay,
        withSpring(position.initialRotate, {
          damping: 15,
          stiffness: 180,
          mass: 0.6,
        })
      );

      opacity.value = withDelay(reverseDelay, withTiming(0, { duration: 200 }));
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const positionStyle: any = {
    position: 'absolute',
    bottom: position.bottom,
  };

  if (position.centered) {
    positionStyle.left = position.left;
    positionStyle.marginLeft = -30; // Half of icon width (60/2)
  } else if (position.left !== undefined) {
    positionStyle.left = position.left;
  } else if (position.right !== undefined) {
    positionStyle.right = position.right;
  }

  return (
    <Animated.View style={[positionStyle, animatedStyle]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.menuIconContainer}>
          <View style={styles.menuIconWrapper}>
            <Ionicons
              name={item.icon}
              size={28}
              color={isActive ? Colors.blue[400] : 'rgba(255, 255, 255, 0.5)'}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function PlusButton({ isOpen, isActive, onPress, colors }: any) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  console.log('PlusButton render - isOpen:', isOpen, 'isActive:', isActive);

  useEffect(() => {
    console.log('PlusButton animation effect - isOpen:', isOpen, 'isActive:', isActive);
    rotation.value = withSpring(isOpen ? 45 : 0, {
      damping: 15,
      stiffness: 200,
    });
    scale.value = withSpring(isOpen || isActive ? 1.15 : 1, {
      damping: 15,
      stiffness: 200,
    });
  }, [isOpen, isActive]);

  const handlePress = () => {
    console.log('PlusButton TouchableOpacity pressed!');
    onPress();
  };

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
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.plusCircle}>
        <Animated.View style={[animatedStyle, { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name="add-circle" size={72} color={iconColor} />
        </Animated.View>
      </View>
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

  const handlePress = () => {
    console.log('MainTabButton pressed:', tab.name, 'Route:', tab.route);
    onPress();
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const iconColor = isActive ? Colors.blue[400] : colors.textSecondary;
  const labelColor = isActive ? colors.text : colors.textSecondary;

  return (
    <TouchableOpacity style={styles.mainTab} onPress={handlePress} activeOpacity={0.7}>
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
    left: 70,
    right: 70,
    height: Platform.OS === 'ios' ? 85 : 70,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0B1429',
    zIndex: 9998,
  },
  glassContainer: {
    flex: 1,
    backgroundColor: '#1a2332',
    borderWidth: 1,
    borderColor: '#2a3442',
    borderRadius: 30,
    overflow: 'hidden',
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
  floatingPlusContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 35 : 28,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10000,
  },
  plusSpacer: {
    flex: 1,
  },
  plusButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a2332',
    borderWidth: 1,
    borderColor: '#2a3442',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandableMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    height: 200,
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a2332',
    borderWidth: 1,
    borderColor: '#2a3442',
    overflow: 'hidden',
  },
  menuIconWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
