import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import LottieView from 'lottie-react-native';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  textColor: string;
}

export const ThemeToggle = ({ theme, onToggle, textColor }: ThemeToggleProps) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (animationRef.current) {
      // Dark mode = play forward (0 to 1), Light mode = play backward (1 to 0)
      if (theme === 'dark') {
        animationRef.current.play(0, 60); // Moon animation
      } else {
        animationRef.current.play(60, 120); // Sun animation
      }
    }
  }, [theme]);

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={{
        backgroundColor: 'rgba(173, 181, 189, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(173, 181, 189, 0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <LottieView
        ref={animationRef}
        source={require('../assets/animations/dark-mode.json')}
        style={{ width: 24, height: 24 }}
        loop={false}
        autoPlay={false}
      />
      <Text style={{ color: textColor, fontSize: 12, fontWeight: '600' }}>
        {theme === 'dark' ? 'Dark' : 'Light'}
      </Text>
    </TouchableOpacity>
  );
};
