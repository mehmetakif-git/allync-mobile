import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';

interface AnimatedCheckboxProps {
  progress: number; // 0 to 1
  size?: number;
}

export const AnimatedCheckbox = ({ progress, size = 20 }: AnimatedCheckboxProps) => {
  const animationRef = useRef<LottieView>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (animationRef.current && progress >= 1 && !hasPlayed) {
      // Play the check animation when progress reaches 1
      animationRef.current.play(0, 60);
      setHasPlayed(true);
    }
  }, [progress, hasPlayed]);

  return (
    <View style={{ width: size, height: size }}>
      <LottieView
        ref={animationRef}
        source={require('../assets/animations/checkbox.json')}
        style={{ width: size, height: size }}
        loop={false}
        autoPlay={false}
      />
    </View>
  );
};
