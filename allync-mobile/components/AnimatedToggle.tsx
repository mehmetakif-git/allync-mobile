import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';

interface AnimatedToggleProps {
  isActive: boolean;
  onPress: () => void;
  icon?: string;
  activeLabel?: string;
  inactiveLabel?: string;
  lottieSource?: any;
  size?: number;
}

export const AnimatedToggle = ({
  isActive,
  onPress,
  icon,
  activeLabel,
  inactiveLabel,
  lottieSource,
  size = 40,
}: AnimatedToggleProps) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (animationRef.current) {
      if (isActive) {
        animationRef.current.play(0, 60); // Play forward
      } else {
        animationRef.current.play(60, 0); // Play reverse
      }
    }
  }, [isActive]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'rgba(173, 181, 189, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(173, 181, 189, 0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {lottieSource ? (
        <LottieView
          ref={animationRef}
          source={lottieSource}
          style={{ width: size, height: size }}
          loop={false}
          autoPlay={false}
        />
      ) : (
        <View style={{ width: 16, height: 16 }} />
      )}
      {(activeLabel || inactiveLabel) && (
        <Text style={{ fontSize: 12, fontWeight: '600' }}>
          {isActive ? activeLabel : inactiveLabel}
        </Text>
      )}
    </TouchableOpacity>
  );
};
