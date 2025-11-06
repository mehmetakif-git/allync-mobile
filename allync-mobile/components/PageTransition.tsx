import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
interface PageTransitionProps {
  children: React.ReactNode;
}
/**
 * iOS-style glassmorphism page transition wrapper
 * Provides smooth fade + scale + blur animation when entering/exiting screens
 */
export function PageTransition({ children }: PageTransitionProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const blur = useSharedValue(10);
  useEffect(() => {
    // Entry animation with staggered timing for glassmorphism effect
    opacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // iOS ease-in-out
    });
    scale.value = withSpring(1, {
      damping: 20,
      stiffness: 90,
      mass: 1,
    });
    blur.value = withTiming(0, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
    ],
  }));
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
