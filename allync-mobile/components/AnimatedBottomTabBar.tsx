import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withSpring,
  interpolate,
  interpolateColor,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tab configuration
export interface TabConfig {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

interface AnimatedBottomTabBarProps {
  tabs: TabConfig[];
  activeIndex: number;
  onTabPress: (index: number) => void;
  theme: 'dark' | 'light';
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Tab bar dimensions
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 90 : 75;
const TAB_BAR_PADDING_BOTTOM = Platform.OS === 'ios' ? 30 : 15;
const TAB_BAR_PADDING_HORIZONTAL = 20;
const TAB_BAR_BORDER_RADIUS = 24;

// Notch dimensions
const NOTCH_WIDTH = 80;
const NOTCH_HEIGHT = 12;
const NOTCH_CURVE_INTENSITY = 20;

export function AnimatedBottomTabBar({
  tabs,
  activeIndex,
  onTabPress,
  theme,
}: AnimatedBottomTabBarProps) {
  // Animated value for the active tab position
  const activeIndexAnimated = useSharedValue(activeIndex);

  useEffect(() => {
    activeIndexAnimated.value = withSpring(activeIndex, {
      damping: 20,
      stiffness: 90,
      mass: 1,
    });
  }, [activeIndex]);

  // Calculate tab width
  const tabWidth = (SCREEN_WIDTH - TAB_BAR_PADDING_HORIZONTAL * 2) / tabs.length;

  // Animated SVG path for the sliding notch
  const animatedProps = useAnimatedProps(() => {
    const centerX = activeIndexAnimated.value * tabWidth + tabWidth / 2;

    // Define the notch curve points
    const notchLeft = centerX - NOTCH_WIDTH / 2;
    const notchRight = centerX + NOTCH_WIDTH / 2;

    // Control points for smooth Bezier curves
    const controlLeft1 = notchLeft - NOTCH_CURVE_INTENSITY;
    const controlLeft2 = notchLeft + NOTCH_CURVE_INTENSITY / 2;
    const controlRight1 = notchRight - NOTCH_CURVE_INTENSITY / 2;
    const controlRight2 = notchRight + NOTCH_CURVE_INTENSITY;

    // Build the SVG path
    const path = `
      M 0,${NOTCH_HEIGHT}
      L ${controlLeft1},${NOTCH_HEIGHT}
      C ${controlLeft2},${NOTCH_HEIGHT} ${notchLeft},${NOTCH_HEIGHT * 0.5} ${notchLeft},0
      C ${notchLeft},${-NOTCH_HEIGHT} ${notchRight},${-NOTCH_HEIGHT} ${notchRight},0
      C ${notchRight},${NOTCH_HEIGHT * 0.5} ${controlRight1},${NOTCH_HEIGHT} ${controlRight2},${NOTCH_HEIGHT}
      L ${SCREEN_WIDTH - TAB_BAR_PADDING_HORIZONTAL * 2},${NOTCH_HEIGHT}
      L ${SCREEN_WIDTH - TAB_BAR_PADDING_HORIZONTAL * 2},${TAB_BAR_HEIGHT}
      L 0,${TAB_BAR_HEIGHT}
      Z
    `;

    return { d: path };
  });

  return (
    <View style={styles.container}>
      {/* Glassmorphic background with animated notch */}
      <View style={styles.tabBarContainer}>
        <BlurView
          intensity={theme === 'dark' ? 95 : 100}
          tint={theme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />

        {/* SVG Shape with sliding notch */}
        <Svg
          width={SCREEN_WIDTH - TAB_BAR_PADDING_HORIZONTAL * 2}
          height={TAB_BAR_HEIGHT}
          style={StyleSheet.absoluteFillObject}
        >
          <AnimatedPath
            animatedProps={animatedProps}
            fill={theme === 'dark' ? 'rgba(43, 44, 44, 0.75)' : 'rgba(248, 249, 250, 0.75)'}
            stroke={theme === 'dark' ? 'rgba(248, 249, 250, 0.12)' : 'rgba(43, 44, 44, 0.12)'}
            strokeWidth={1}
          />
        </Svg>

        {/* Tab buttons and icons */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab, index) => (
            <TabButton
              key={tab.route}
              tab={tab}
              index={index}
              activeIndex={activeIndexAnimated}
              currentActiveIndex={activeIndex}
              onPress={() => onTabPress(index)}
              tabWidth={tabWidth}
              theme={theme}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

interface TabButtonProps {
  tab: TabConfig;
  index: number;
  activeIndex: Animated.SharedValue<number>;
  currentActiveIndex: number;
  onPress: () => void;
  tabWidth: number;
  theme: 'dark' | 'light';
}

function TabButton({ tab, index, activeIndex, currentActiveIndex, onPress, tabWidth, theme }: TabButtonProps) {
  // Animated icon position (moves up when active)
  const animatedIconStyle = useAnimatedStyle(() => {
    const isActive = interpolate(
      activeIndex.value,
      [index - 0.5, index, index + 0.5],
      [0, 1, 0],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      isActive,
      [0, 1],
      [0, -NOTCH_HEIGHT - 8]
    );

    const scale = interpolate(
      isActive,
      [0, 1],
      [1, 1.2]
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  // Determine icon color based on active state
  const isActive = currentActiveIndex === index;
  const iconColor = isActive
    ? (theme === 'dark' ? '#3b82f6' : '#0D6EFD')
    : (theme === 'dark' ? 'rgba(248, 249, 250, 0.5)' : 'rgba(43, 44, 44, 0.5)');

  return (
    <TouchableOpacity
      style={[styles.tabButton, { width: tabWidth }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <Ionicons name={tab.icon} size={24} color={iconColor} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 15,
    left: TAB_BAR_PADDING_HORIZONTAL,
    right: TAB_BAR_PADDING_HORIZONTAL,
    height: TAB_BAR_HEIGHT,
  },
  tabBarContainer: {
    flex: 1,
    borderRadius: TAB_BAR_BORDER_RADIUS,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: NOTCH_HEIGHT,
    paddingBottom: TAB_BAR_PADDING_BOTTOM,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
