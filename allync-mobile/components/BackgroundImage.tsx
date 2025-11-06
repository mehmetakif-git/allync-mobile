import React from 'react';
import { ImageBackground, Dimensions, Platform } from 'react-native';

interface BackgroundImageProps {
  children: React.ReactNode;
  style?: any;
}

export default function BackgroundImage({ children, style }: BackgroundImageProps) {
  const { width, height } = Dimensions.get('window');

  // Determine device type and orientation
  const isTablet = width >= 768;
  const isLandscape = width > height;

  // Select appropriate background image based on device type
  // React Native automatically selects @2x, @3x based on PixelRatio
  let bgSource;

  if (isTablet) {
    if (isLandscape) {
      // Tablet landscape mode
      bgSource = require('../assets/images/backgrounds/login-bg-landscape.webp');
    } else {
      // Tablet portrait mode
      bgSource = require('../assets/images/backgrounds/login-bg-tablet.webp');
    }
  } else {
    // Phone (portrait or landscape)
    bgSource = require('../assets/images/backgrounds/login-bg.webp');
  }

  return (
    <ImageBackground
      source={bgSource}
      style={[{ flex: 1 }, style]}
      resizeMode="cover"  // Covers entire area, crops if needed (no stretching)
      imageStyle={{ opacity: 1 }}
    >
      {children}
    </ImageBackground>
  );
}
