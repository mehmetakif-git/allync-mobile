import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';

// Animated tab button component
function AnimatedTabButton({
  focused,
  color,
  size,
  iconName,
}: {
  focused: boolean;
  color: string;
  size: number;
  iconName: any;
}) {
  const scale = useSharedValue(focused ? 1.1 : 1);
  const translateY = useSharedValue(focused ? -2 : 0);

  // Animate when focused state changes
  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 15,
      stiffness: 150,
    });
    translateY.value = withSpring(focused ? -2 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={iconName} size={size} color={color} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  const { theme, colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: Platform.OS === 'ios' ? 90 : 75,
            paddingBottom: Platform.OS === 'ios' ? 30 : 15,
            paddingTop: 8,
            paddingHorizontal: 20,
            left: 20,
            right: 20,
            bottom: Platform.OS === 'ios' ? 20 : 15,
          },
          tabBarBackground: () => (
            <BlurView
              intensity={theme === 'dark' ? 95 : 100}
              tint={theme === 'dark' ? 'dark' : 'light'}
              style={{
                ...StyleSheet.absoluteFillObject,
                overflow: 'hidden',
                backgroundColor: theme === 'dark'
                  ? 'rgba(43, 44, 44, 0.75)'
                  : 'rgba(248, 249, 250, 0.75)',
                borderRadius: 24,
                borderWidth: 1,
                borderColor: theme === 'dark'
                  ? 'rgba(248, 249, 250, 0.12)'
                  : 'rgba(43, 44, 44, 0.12)',
                shadowColor: theme === 'dark' ? '#000' : '#2B2C2C',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: theme === 'dark' ? 0.3 : 0.15,
                shadowRadius: 20,
              }}
            />
          ),
          tabBarActiveTintColor: theme === 'dark' ? Colors.blue[500] : Colors.deepBlue,
          tabBarInactiveTintColor: theme === 'dark' ? Colors.text.tertiary : 'rgba(43, 44, 44, 0.5)',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600' as any,
            marginTop: 4,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabButton
              focused={focused}
              color={color}
              size={size}
              iconName="home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabButton
              focused={focused}
              color={color}
              size={size}
              iconName="server"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Invoices',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabButton
              focused={focused}
              color={color}
              size={size}
              iconName="receipt"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabButton
              focused={focused}
              color={color}
              size={size}
              iconName="chatbubbles"
            />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}
