import { Platform, View } from 'react-native';
import { BlurView as ExpoBlurView } from 'expo-blur';

// Native platforms version (iOS & Android)
// expo-blur works on all platforms
export const BlurView = ExpoBlurView;

// RNCBlurView for Android
let RNCBlurViewComponent = View;

try {
  // Import RNC blur for Android
  const { BlurView: RNCBlur } = require('@react-native-community/blur');
  RNCBlurViewComponent = RNCBlur;
} catch (e) {
  // Fallback to View if not available (iOS will use this)
  console.warn('RNCBlurView not available, using View fallback');
}

export const RNCBlurView = RNCBlurViewComponent;
