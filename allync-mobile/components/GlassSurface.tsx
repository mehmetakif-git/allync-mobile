import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';

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

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
});
