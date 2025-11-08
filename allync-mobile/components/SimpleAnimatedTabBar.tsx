import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
// Tab configuration
export interface TabConfig {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}
interface SimpleAnimatedTabBarProps {
  tabs: TabConfig[];
  activeIndex: number;
  onTabPress: (index: number) => void;
  theme: 'dark' | 'light';
}
export function SimpleAnimatedTabBar({
  tabs,
  activeIndex,
  onTabPress,
}: SimpleAnimatedTabBarProps) {
  return (
    <View style={styles.container}>
      <BlurView
        intensity={95}
        tint={'dark'}
        style={styles.blurContainer}
      >
        <View
          style={[
            styles.innerContainer,
            {
              backgroundColor: 'rgba(43, 44, 44, 0.3)',
              borderColor: true
                ? 'rgba(248, 249, 250, 0.12)'
                : 'rgba(43, 44, 44, 0.12)',
            },
          ]}
        >
          {tabs.map((tab, index) => (
            <TabButton
              key={tab.route}
              tab={tab}
              index={index}
              activeIndex={activeIndex}
              onPress={() => onTabPress(index)}
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
}
function TabButton({ tab, index, activeIndex, onPress }: TabButtonProps) {
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
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));
  const iconColor = isActive
    ? '#3b82f6'
    : 'rgba(248, 249, 250, 0.5)';
  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <Ionicons name={tab.icon} size={24} color={iconColor} />
      </Animated.View>
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
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  blurContainer: {
    flex: 1,
    borderRadius: 24,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderRadius: 24,
    borderWidth: 1,
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
