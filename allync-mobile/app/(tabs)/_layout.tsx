import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { ServiceNavigationProvider } from '../../contexts/ServiceNavigationContext';
import EnhancedTabBar from '../../components/EnhancedTabBar';
export default function TabsLayout() {
  const tabBarTranslateY = useSharedValue(100);
  const tabBarOpacity = useSharedValue(0);
  const [animationsComplete, setAnimationsComplete] = useState(false);

  useEffect(() => {
    // Prevent animations from re-running on navigation
    if (animationsComplete) return;

    // Animate tab bar sliding up from bottom with delay
    tabBarTranslateY.value = withDelay(
      400,
      withSpring(0, {
        damping: 20,
        stiffness: 90,
        mass: 1,
      })
    );
    tabBarOpacity.value = withDelay(
      300,
      withSpring(1, {
        damping: 20,
        stiffness: 90,
      })
    );

    // Mark animations as complete after they finish
    setTimeout(() => setAnimationsComplete(true), 1000);
  }, [animationsComplete]);
  const tabBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: tabBarTranslateY.value }],
      opacity: tabBarOpacity.value,
    };
  });
  return (
    <ServiceNavigationProvider>
      <LinearGradient
        colors={[
          '#0F172A', // Deep slate (top)
          '#1E293B', // Dark slate
          '#312E81', // Deep indigo
          '#1E1B4B', // Deep violet
          '#0F172A', // Back to deep slate (bottom)
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={styles.container}
      >
        {/* Subtle glow effect overlay */}
        <View style={styles.glowOverlay}>
          <View style={[styles.glow, styles.glowTop]} />
          <View style={[styles.glow, styles.glowBottom]} />
        </View>

        {/* Content */}
        <Tabs
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="services" options={{ title: 'Services' }} />
          <Tabs.Screen name="invoices" options={{ title: 'Invoices' }} />
          <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
          <Tabs.Screen name="support" options={{ title: 'Support' }} />
        </Tabs>

        {/* Enhanced animated tab bar */}
        <Animated.View style={tabBarAnimatedStyle} pointerEvents="box-none">
          <EnhancedTabBar />
        </Animated.View>
      </LinearGradient>
    </ServiceNavigationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  glow: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.15,
  },
  glowTop: {
    width: 400,
    height: 400,
    backgroundColor: '#6366F1', // Indigo glow
    top: -200,
    right: -100,
  },
  glowBottom: {
    width: 300,
    height: 300,
    backgroundColor: '#8B5CF6', // Purple glow
    bottom: -150,
    left: -100,
  },
});
