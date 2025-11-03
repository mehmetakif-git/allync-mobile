import { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  interpolateColor,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';

const loadingStates = [
  { text: 'Initializing secure connection' },
  { text: 'Loading your dashboard' },
  { text: 'Syncing services and data' },
  { text: 'Preparing your workspace' },
  { text: 'Almost ready' },
];

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // PHASE 1: Logo & Slogan animations
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(1.5);
  const sloganOpacity = useSharedValue(0);

  // PHASE 2: Loader animations
  const loaderOpacity = useSharedValue(0);
  const loaderProgress = useSharedValue(0);

  // PHASE 3: Screen fade out
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    if (!authLoading && user) {
      router.replace('/(tabs)');
      return;
    }

    // Start animation sequence
    startAnimationSequence();
  }, [authLoading, user]);

  // Navigate when shouldNavigate becomes true
  useEffect(() => {
    if (shouldNavigate) {
      router.replace('/login');
    }
  }, [shouldNavigate]);

  const startAnimationSequence = () => {
    const easeOut = Easing.bezier(0.25, 0.1, 0.25, 1.0);

    // PHASE 1.A: Logo and slogan group fade in and scale down simultaneously
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: easeOut,
    });

    logoScale.value = withTiming(1.0, {
      duration: 700,
      easing: easeOut,
    });

    // PHASE 1.B: Slogan fades in with slight delay
    sloganOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 500 })
    );

    // PHASE 2: Show loader after logo animation completes
    loaderOpacity.value = withDelay(
      1000,
      withTiming(1, {
        duration: 600,
        easing: easeOut,
      })
    );

    // PHASE 2: Multi-step loader progression with withSequence
    // Each step takes 500ms with 200ms delay between
    const stepDuration = 500;
    const stepDelay = 200;

    // Build the sequence: 0 -> 1 -> 2 -> 3 -> 4 -> 5
    const sequenceSteps = loadingStates.map((_, index) => {
      return withDelay(
        stepDelay,
        withTiming(index + 1, {
          duration: stepDuration,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        })
      );
    });

    loaderProgress.value = withDelay(
      1000,
      withSequence(...sequenceSteps)
    );

    // PHASE 3: Fade out screen after all steps complete
    const totalAnimationTime = 1000 + loadingStates.length * (stepDuration + stepDelay) + 400;
    screenOpacity.value = withDelay(
      totalAnimationTime,
      withTiming(0, {
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      })
    );

    // Navigate after animation completes
    setTimeout(() => {
      setShouldNavigate(true);
    }, totalAnimationTime + 500);
  };

  // PHASE 1: Logo & Slogan animated styles
  const logoGroupStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const sloganStyle = useAnimatedStyle(() => ({
    opacity: sloganOpacity.value,
  }));

  // PHASE 2: Loader animated style
  const loaderStyle = useAnimatedStyle(() => ({
    opacity: loaderOpacity.value,
  }));

  // PHASE 3: Screen fade out style
  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, screenStyle]}>
      <LinearGradient colors={['#2B2C2C', '#1a1b1b']} className="flex-1">
        <View className="flex-1 items-center justify-center px-8">
          {/* PHASE 1: Logo & Slogan Group */}
          <Animated.View style={[logoGroupStyle, { alignItems: 'center' }]}>
            {/* Logo with subtle glow */}
            <View className="relative items-center justify-center mb-6">
              <View
                style={{
                  position: 'absolute',
                  width: 130,
                  height: 130,
                  borderRadius: 65,
                  backgroundColor: 'rgba(248, 249, 250, 0.08)',
                }}
              />
              <Image
                source={require('../assets/logo-white.png')}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
            </View>

            {/* Brand name */}
            <Text className="text-5xl font-bold text-titanium text-center mb-3">
              Allync
            </Text>

            {/* Slogan */}
            <View className="flex-row items-center">
              <Ionicons
                name="sparkles"
                size={16}
                color={Colors.text.secondary}
                style={{ marginRight: 6 }}
              />
              <Text className="text-base text-text-secondary font-medium italic">
                Beyond human automation
              </Text>
            </View>
          </Animated.View>

          {/* PHASE 2: Multi-Step Loader */}
          <Animated.View style={[loaderStyle, { marginTop: 60, width: '100%', maxWidth: 320 }]}>
            {loadingStates.map((state, index) => (
              <LoadingStep
                key={index}
                text={state.text}
                index={index}
                loaderProgress={loaderProgress}
              />
            ))}
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// Individual loading step component
function LoadingStep({
  text,
  index,
  loaderProgress,
}: {
  text: string;
  index: number;
  loaderProgress: SharedValue<number>;
}) {
  // Gray icon opacity (fades out as progress increases)
  const grayIconOpacity = useAnimatedStyle(() => {
    const opacity = loaderProgress.value >= index
      ? loaderProgress.value >= index + 1
        ? 0
        : 1 - (loaderProgress.value - index)
      : 1;

    return { opacity };
  });

  // Green icon opacity (fades in as progress increases)
  const greenIconOpacity = useAnimatedStyle(() => {
    const opacity = loaderProgress.value >= index
      ? loaderProgress.value >= index + 1
        ? 1
        : loaderProgress.value - index
      : 0;

    return { opacity };
  });

  // Scale bounce when completing
  const scaleStyle = useAnimatedStyle(() => {
    const isComplete = loaderProgress.value >= index + 1;
    const scale = withSpring(isComplete ? 1.1 : 1, {
      damping: 15,
      stiffness: 150,
    });

    return {
      transform: [{ scale }],
    };
  });

  const textOpacity = useAnimatedStyle(() => {
    // Active when progress is between index and index+1
    const isActive = loaderProgress.value >= index && loaderProgress.value < index + 1;
    return {
      opacity: withTiming(isActive ? 1 : 0.6, { duration: 300 }),
    };
  });

  return (
    <View className="flex-row items-center mb-5">
      <Animated.View style={[scaleStyle, { marginRight: 12, width: 20, height: 20 }]}>
        {/* Gray icon (default state) */}
        <Animated.View style={[grayIconOpacity, { position: 'absolute' }]}>
          <Ionicons name="checkmark-circle" size={20} color="#AAAAAA" />
        </Animated.View>
        {/* Green icon (completed state) */}
        <Animated.View style={[greenIconOpacity, { position: 'absolute' }]}>
          <Ionicons name="checkmark-circle" size={20} color="#28a745" />
        </Animated.View>
      </Animated.View>
      <Animated.Text
        style={textOpacity}
        className="text-base text-text-secondary font-normal"
      >
        {text}
      </Animated.Text>
    </View>
  );
}
