import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { BlurView as RNCBlurView } from '@react-native-community/blur';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  brightness?: number;
  opacity?: number;
  borderRadius?: number;
  borderWidth?: number;
  theme?: 'light' | 'dark';
}

export default function GlassSurface({
  children,
  style,
  brightness = 50,
  opacity = 0.93,
  borderRadius = 20,
  borderWidth = 1,
  theme = 'dark',
}: GlassSurfaceProps) {

  if (Platform.OS === 'ios') {
    // iOS: Use real BlurView with gradient overlay
    return (
      <View style={[styles.container, { borderRadius }, style]}>
        <BlurView
          intensity={95}
          tint={theme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        >
          {/* Glass tint overlay */}
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: theme === 'dark'
                  ? `rgba(43, 44, 44, ${opacity * 0.7})`
                  : `rgba(248, 249, 250, ${opacity * 0.7})`,
              },
            ]}
          />

          {/* Edge highlights */}
          <LinearGradient
            colors={
              theme === 'dark'
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
              borderColor: theme === 'dark'
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(255, 255, 255, 0.3)',
            },
          ]}
        />

        {/* Content */}
        <View style={[styles.content, { borderRadius }]}>{children}</View>
      </View>
    );
  }

  // Android: Real blur with RNC BlurView (requires development build)
  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <RNCBlurView
        style={StyleSheet.absoluteFillObject}
        blurType={theme === 'dark' ? 'dark' : 'light'}
        blurAmount={5}
        reducedTransparencyFallbackColor={theme === 'dark' ? 'rgba(10, 14, 39, 0.85)' : 'rgba(248, 249, 250, 0.9)'}
      >
        {/* Glass tint overlay */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius,
              backgroundColor: theme === 'dark'
                ? `rgba(10, 14, 39, ${opacity * 0.45})`
                : `rgba(248, 249, 250, ${opacity * 0.5})`,
            },
          ]}
        />

        {/* Top edge highlight gradient - creates glass effect */}
        <LinearGradient
          colors={
            theme === 'dark'
              ? ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.03)', 'transparent']
              : ['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.15)', 'transparent']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.5 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius }]}
          pointerEvents="none"
        />

        {/* Bottom subtle shine */}
        <LinearGradient
          colors={
            theme === 'dark'
              ? ['transparent', 'rgba(255, 255, 255, 0.04)']
              : ['transparent', 'rgba(255, 255, 255, 0.25)']
          }
          start={{ x: 0, y: 0.6 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius }]}
          pointerEvents="none"
        />
      </RNCBlurView>

      {/* Border with gradient effect */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius,
            borderWidth,
            borderColor: theme === 'dark'
              ? 'rgba(255, 255, 255, 0.25)'
              : 'rgba(255, 255, 255, 0.5)',
          },
        ]}
        pointerEvents="none"
      />

      {/* Content */}
      <View style={[styles.content, { borderRadius }]}>{children}</View>
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
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});
