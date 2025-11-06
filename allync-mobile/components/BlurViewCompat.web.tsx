import { View } from 'react-native';
import { BlurView as ExpoBlurView } from 'expo-blur';

// Web version - only use expo-blur
export const BlurView = ExpoBlurView;

// RNCBlurView not available on web, use View as fallback
export const RNCBlurView = View;
