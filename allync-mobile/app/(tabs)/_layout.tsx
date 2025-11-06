import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import EnhancedTabBar from '../../components/EnhancedTabBar';
import BackgroundImage from '../../components/BackgroundImage';
const AnimatedView = Animated.View;
export default function TabsLayout() {
  const { colors } = useTheme();
  const tabBarTranslateY = useSharedValue(100);
  const tabBarOpacity = useSharedValue(0);
  useEffect(() => {
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
  }, []);
  const tabBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: tabBarTranslateY.value }],
      opacity: tabBarOpacity.value,
    };
  });
  return (
    <BackgroundImage>
      {/* Content with fade in and slight slide up */}
      <AnimatedView
        entering={FadeIn.duration(600).delay(100)}
        style={{ flex: 1 }}
      >
        <Tabs
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            tabBarStyle: { display: 'none' }, // Hide default tab bar
          }}
        >
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="services" options={{ title: 'Services' }} />
          <Tabs.Screen name="active-services" options={{ title: 'Active Services' }} />
          <Tabs.Screen name="invoices" options={{ title: 'Invoices' }} />
          <Tabs.Screen name="support" options={{ title: 'Support' }} />
        </Tabs>
      </AnimatedView>
      {/* Enhanced animated tab bar with liquid animations - slides up from bottom */}
      <Animated.View style={tabBarAnimatedStyle}>
        <EnhancedTabBar />
      </Animated.View>
    </BackgroundImage>
  );
}
