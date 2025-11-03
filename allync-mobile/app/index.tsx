import { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors } from '../constants/Colors';
import { SparklesBackground } from '../components/SparklesBackground';
import { AnimatedCheckbox } from '../components/AnimatedCheckbox';

// Logo with smooth glow effect (same as login.tsx)
function LogoWithGlow({ theme }: { theme: 'light' | 'dark' }) {
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(0.8, {
        duration: 2500,
        easing: Easing.bezier(0.45, 0.05, 0.55, 0.95),
      }),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  const logoSource = theme === 'light'
    ? require('../assets/logo-black.png')
    : require('../assets/logo-white.png');

  const glowColor1 = theme === 'light'
    ? 'rgba(26, 27, 27, 0.15)'
    : 'rgba(248, 249, 250, 0.15)';

  const glowColor2 = theme === 'light'
    ? 'rgba(26, 27, 27, 0.25)'
    : 'rgba(248, 249, 250, 0.25)';

  return (
    <View className="items-center justify-center mb-4" style={{ width: 80, height: 80 }}>
      {/* Glow layers - multiple for smooth effect */}
      <Animated.View
        style={[
          glowStyle,
          {
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: glowColor1,
          },
        ]}
      />
      <Animated.View
        style={[
          glowStyle,
          {
            position: 'absolute',
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: glowColor2,
          },
        ]}
      />

      {/* Logo image */}
      <Image
        source={logoSource}
        style={{ width: 80, height: 80, zIndex: 10 }}
        resizeMode="contain"
      />
    </View>
  );
}

// Simple text component without shimmer
function ShinyText({ children, color }: { children: string; color: string }) {
  return (
    <Text
      style={{ color }}
      className="text-5xl font-bold text-center"
    >
      {children}
    </Text>
  );
}

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { colors, theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [shouldNavigate, setShouldNavigate] = useState(false);

  const loadingStates = [
    { text: t.loadingSteps.initConnection },
    { text: t.loadingSteps.loadDashboard },
    { text: t.loadingSteps.syncData },
    { text: t.loadingSteps.prepareWorkspace },
    { text: t.loadingSteps.almostReady },
  ];

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

  const particleColor = theme === 'light'
    ? 'rgba(26, 27, 27, 0.4)'
    : 'rgba(248, 249, 250, 0.4)';

  return (
    <Animated.View style={[{ flex: 1 }, screenStyle]}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SparklesBackground particleCount={50} particleColor={particleColor} />
        <View className="flex-1 px-6 pt-16 pb-10 justify-center">
          {/* PHASE 1: Logo & Slogan Group (same layout as login.tsx) */}
          <Animated.View style={[logoGroupStyle, { alignItems: 'center', marginBottom: 32 }]}>
            <LogoWithGlow theme={theme} />
            <ShinyText color={colors.text}>{t.appName}</ShinyText>
            <Animated.View style={[sloganStyle, { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }]}>
              <Ionicons name="sparkles" size={18} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.textSecondary }} className="text-base font-medium italic">
                {t.slogan}
              </Text>
            </Animated.View>
          </Animated.View>

          {/* PHASE 2: Multi-Step Loader */}
          <Animated.View style={[loaderStyle, { width: '100%', maxWidth: 320, alignSelf: 'center' }]}>
            {loadingStates.map((state, index) => (
              <LoadingStep
                key={index}
                text={state.text}
                index={index}
                loaderProgress={loaderProgress}
                textColor={colors.textSecondary}
              />
            ))}
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

// Individual loading step component
function LoadingStep({
  text,
  index,
  loaderProgress,
  textColor,
}: {
  text: string;
  index: number;
  loaderProgress: SharedValue<number>;
  textColor: string;
}) {
  // Track if this step is completed
  const [isCompleted, setIsCompleted] = useState(false);

  // Monitor loaderProgress and update isCompleted
  useEffect(() => {
    const checkProgress = () => {
      const currentProgress = loaderProgress.value;
      if (currentProgress >= index + 1 && !isCompleted) {
        setIsCompleted(true);
      }
    };

    // Check immediately
    checkProgress();

    // Set up interval to check progress
    const interval = setInterval(checkProgress, 100);

    return () => clearInterval(interval);
  }, [loaderProgress, index, isCompleted]);

  const textOpacity = useAnimatedStyle(() => {
    // Active when progress is between index and index+1
    const isActive = loaderProgress.value >= index && loaderProgress.value < index + 1;
    return {
      opacity: withTiming(isActive ? 1 : 0.6, { duration: 300 }),
    };
  });

  return (
    <View className="flex-row items-center mb-5">
      <View style={{ marginRight: 12, width: 24, height: 24 }}>
        <AnimatedCheckbox progress={isCompleted ? 1 : 0} size={24} />
      </View>
      <Animated.Text
        style={[textOpacity, { color: textColor }]}
        className="text-base font-normal"
      >
        {text}
      </Animated.Text>
    </View>
  );
}
