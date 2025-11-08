import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView, RNCBlurView } from './BlurViewCompat';
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

  if (Platform.OS === 'ios') {
    // iOS: Use real BlurView with gradient overlay
    return (
      <View style={containerStyle}>
        <BlurView
          intensity={95}
          tint={'dark'}
          style={StyleSheet.absoluteFillObject}
        >
          {/* Glass tint overlay */}
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: true
                  ? `rgba(43, 44, 44, ${opacity * 0.7})`
                  : `rgba(248, 249, 250, ${opacity * 0.7})`,
              },
            ]}
          />
          {/* Edge highlights */}
          <LinearGradient
            colors={
              true
                ? ['rgba(255, 255, 255, 0.2)', 'transparent', 'rgba(255, 255, 255, 0.1)']
                : ['rgba(255, 255, 255, 0.4)', 'transparent', 'rgba(255, 255, 255, 0.2)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFillObject, { borderRadius }]}
          />
        </BlurView>
        {/* Border */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius,
              borderWidth,
              borderColor: true
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(255, 255, 255, 0.3)',
            },
          ]}
        />
        {/* Content */}
        <View style={contentStyle}>
          {children}
        </View>
      </View>
    );
  }
  // Android: Simple glassmorphism without blur (for better emulator performance)
  return (
    <View style={containerStyle}>
      {/* Glass tint overlay */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius,
            backgroundColor: 'rgba(10, 14, 39, 0.75)',
          },
        ]}
      />
      {/* Top edge highlight gradient - creates glass effect */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.03)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius }]}
        pointerEvents="none"
      />
      {/* Bottom subtle shine */}
      <LinearGradient
        colors={['transparent', 'rgba(255, 255, 255, 0.04)']}
        start={{ x: 0, y: 0.6 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius }]}
        pointerEvents="none"
      />
      {/* Border with gradient effect */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius,
            borderWidth,
            borderColor: true
              ? 'rgba(255, 255, 255, 0.25)'
              : 'rgba(255, 255, 255, 0.5)',
          },
        ]}
        pointerEvents="none"
      />
      {/* Content */}
      <View style={contentStyle}>
        {children}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden', // Clip content for proper blur effect
    // Shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
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
