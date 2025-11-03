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
  const previousTheme = useRef<'light' | 'dark'>(theme);

  useEffect(() => {
    // Set initial frame on mount (app always starts in dark mode = frame 251)
    if (animationRef.current) {
      const initialProgress = theme === 'dark' ? 251 / 481 : 0;
      animationRef.current.play(initialProgress * 481, initialProgress * 481);
    }
  }, []);

  useEffect(() => {
    // Only animate when theme actually changes
    if (animationRef.current && previousTheme.current !== theme && !isAnimating) {
      setIsAnimating(true);
      previousTheme.current = theme;

      if (theme === 'light') {
        // Dark → Light: Play from frame 251 to 480 (reverse back to light)
        animationRef.current.play(251, 481);
      } else {
        // Light → Dark: Play from frame 0 to 251 (forward to dark)
        animationRef.current.play(0, 251);
      }

      // Reset animation lock after animation completes
      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [theme]);

  const handlePress = () => {
    if (!isAnimating) {
      // Delay the theme change to sync with animation
      setTimeout(() => {
        onToggle();
      }, 300); // Start theme transition 300ms after animation starts
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} disabled={isAnimating}>
      <LottieView
        ref={animationRef}
        source={require('../assets/animations/dark-mode.json')}
        style={{ width: 64, height: 64 }}
        loop={false}
        autoPlay={false}
        speed={2}
      />
    </TouchableOpacity>
  );
};
