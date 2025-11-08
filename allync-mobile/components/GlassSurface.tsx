import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
export interface GlassSurfaceProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  brightness?: number;
  opacity?: number;
  borderRadius?: number;
  borderWidth?: number;
}
export default function GlassSurface({
  children,
  style,
  brightness = 50,
  opacity = 0.93,
  borderRadius = 20,
  borderWidth = 1,
}: GlassSurfaceProps) {
  // Extract flex from style if it exists
  const containerStyle = StyleSheet.flatten([styles.container, { borderRadius }, style]);
  const contentStyle = StyleSheet.flatten([styles.content, { borderRadius }]);

  // If container has flex, content should also have flex
  if (containerStyle.flex) {
    contentStyle.flex = containerStyle.flex;
  }

  // Use BlurView for glassmorphism on all platforms
  return (
    <View style={containerStyle}>
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject}>
        {/* Content */}
        <View style={contentStyle}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
