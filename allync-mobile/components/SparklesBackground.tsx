import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface SparkleProps {
  index: number;
  particleColor: string;
}

const Sparkle = ({ index, particleColor }: SparkleProps) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  // Random position
  const startX = Math.random() * width;
  const startY = Math.random() * height;

  // Random animation params
  const duration = 3000 + Math.random() * 2000;
  const delay = Math.random() * 2000;
  const yMovement = -50 - Math.random() * 30;
  const xMovement = (Math.random() - 0.5) * 20;

  useEffect(() => {
    // Opacity animation
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: duration / 2,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
        }),
        -1,
        true
      )
    );

    // Y movement (floating up)
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(yMovement, {
          duration: duration,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        -1,
        true
      )
    );

    // X movement (slight drift)
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(xMovement, {
          duration: duration,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
        }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 2,
          height: 2,
          borderRadius: 1,
          backgroundColor: particleColor,
          left: startX,
          top: startY,
        },
        animatedStyle,
      ]}
    />
  );
};

interface SparklesBackgroundProps {
  particleCount?: number;
  particleColor?: string;
  particleSize?: number;
}

export const SparklesBackground = ({
  particleCount = 50,
  particleColor = 'rgba(248, 249, 250, 0.6)',
  particleSize = 2,
}: SparklesBackgroundProps) => {
  const sparkles = Array.from({ length: particleCount }, (_, i) => i);

  return (
    <View style={styles.container} pointerEvents="none">
      {sparkles.map((index) => (
        <Sparkle key={index} index={index} particleColor={particleColor} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
