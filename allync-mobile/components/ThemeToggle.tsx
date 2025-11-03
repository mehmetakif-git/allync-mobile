import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => {
  const animationRef = useRef<LottieView>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Set initial frame based on theme on first mount
    if (animationRef.current && !isInitialized) {
      const initialFrame = theme === 'dark' ? 0 : 60;
      animationRef.current.play(initialFrame, initialFrame);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (animationRef.current && isInitialized && !isAnimating) {
      setIsAnimating(true);
      // Play smooth transition based on theme
      if (theme === 'dark') {
        animationRef.current.play(60, 0); // Sun to Moon
      } else {
        animationRef.current.play(0, 60); // Moon to Sun
      }
      // Reset animation lock after animation completes
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [theme]);

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
      <LottieView
        ref={animationRef}
        source={require('../assets/animations/dark-mode.json')}
        style={{ width: 64, height: 64 }}
        loop={false}
        autoPlay={false}
        speed={1}
      />
    </TouchableOpacity>
  );
};
