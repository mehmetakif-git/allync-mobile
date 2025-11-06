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
      // Play the check animation when progress reaches 1 (42 frames total)
      animationRef.current.play();
      setHasPlayed(true);
    }
  }, [progress, hasPlayed]);
  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <LottieView
        ref={animationRef}
        source={require('../assets/animations/checkbox.json')}
        style={{ width: size, height: size }}
        loop={false}
        autoPlay={false}
        resizeMode="cover"
      />
    </View>
  );
};
