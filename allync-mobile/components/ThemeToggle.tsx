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

  useEffect(() => {
    if (animationRef.current && !isAnimating) {
      setIsAnimating(true);
      // Play smooth transition based on theme
      if (theme === 'dark') {
        animationRef.current.play(0, 60); // Moon animation
      } else {
        animationRef.current.play(60, 120); // Sun animation
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
