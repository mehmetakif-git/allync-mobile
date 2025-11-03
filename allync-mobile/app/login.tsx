import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Logo with smooth glow effect
function LogoWithGlow() {
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
            backgroundColor: 'rgba(248, 249, 250, 0.15)',
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
            backgroundColor: 'rgba(248, 249, 250, 0.25)',
          },
        ]}
      />

      {/* Logo image */}
      <Image
        source={require('../assets/logo-white.png')}
        style={{ width: 80, height: 80, zIndex: 10 }}
        resizeMode="contain"
      />
    </View>
  );
}

// Simple animated text component
function ShinyText({ children }: { children: string }) {
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.8, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.Text
      style={animatedStyle}
      className="text-5xl font-bold text-titanium text-center"
    >
      {children}
    </Animated.Text>
  );
}

// Shiny Button Component with Glow Effect
function ShinyButton({
  onPress,
  loading,
  disabled,
}: {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnimation = useSharedValue(1);
  const glowAnimation = useSharedValue(0);

  useEffect(() => {
    // Smooth continuous pulsing glow effect
    glowAnimation.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease)
      }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    scaleAnimation.value = withTiming(isPressed ? 0.98 : 1, {
      duration: 150,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [isPressed]);

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleAnimation.value },
        { translateY: isPressed ? 1 : 0 }
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: isPressed ? 0.1 : 0.25,
      shadowOffset: {
        width: 0,
        height: isPressed ? 2 : 8,
      },
    };
  });

  return (
    <Animated.View
      entering={FadeInUp.duration(800).delay(400).springify()}
      className="mt-6"
    >
      <AnimatedTouchable
        style={[buttonStyle, shadowStyle]}
        className="rounded-xl overflow-hidden"
        activeOpacity={1}
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        disabled={disabled}
      >
        {/* Glassmorphism background */}
        <LinearGradient
          colors={[
            'rgba(173, 181, 189, 0.25)',
            'rgba(173, 181, 189, 0.15)',
            'rgba(173, 181, 189, 0.2)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="py-5 px-8 items-center justify-center border border-white/10"
        >
          {/* Glass shine effect */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          />

          {/* Blur backdrop effect simulation */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(248, 249, 250, 0.05)',
            }}
          />

          {loading ? (
            <ActivityIndicator color={Colors.titanium} style={{ zIndex: 10 }} />
          ) : (
            <Text className="text-lg font-semibold text-text-primary tracking-wide" style={{ zIndex: 10 }}>
              Sign In →
            </Text>
          )}
        </LinearGradient>
      </AnimatedTouchable>
    </Animated.View>
  );
}

// Animated Input Component with focus effects
function AnimatedInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  editable,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  editable?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnimation = useSharedValue(0);
  const glowAnimation = useSharedValue(0);

  useEffect(() => {
    borderAnimation.value = withTiming(isFocused ? 1 : 0, {
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
    glowAnimation.value = withTiming(isFocused ? 1 : 0, {
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [isFocused]);

  const borderStyle = useAnimatedStyle(() => {
    return {
      borderColor: isFocused
        ? `rgba(248, 249, 250, ${0.6 + borderAnimation.value * 0.4})`
        : 'rgba(173, 181, 189, 0.2)',
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowAnimation.value * 0.4,
      transform: [{ scale: 0.98 + glowAnimation.value * 0.02 }],
    };
  });

  return (
    <View className="relative mb-0">
      {/* Glow effect background */}
      <Animated.View
        style={[
          glowStyle,
          {
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: 10,
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(248, 249, 250, 0.15)', 'rgba(173, 181, 189, 0.12)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, borderRadius: 10 }}
        />
      </Animated.View>

      {/* Actual input with animated border */}
      <Animated.View
        style={borderStyle}
        className="bg-cyber-gray/[0.08] border rounded-md"
      >
        <TextInput
          className="py-3 px-4 text-base text-text-primary"
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          editable={editable}
        />
      </Animated.View>

      {/* Bottom gradient line */}
      {isFocused && (
        <Animated.View className="absolute -bottom-px left-0 right-0 h-px">
          <LinearGradient
            colors={['transparent', Colors.titanium, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ position: 'absolute', width: '100%', height: 1 }}
          />
          <LinearGradient
            colors={['transparent', 'rgba(248, 249, 250, 0.6)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute',
              width: '50%',
              height: 2,
              left: '25%',
              opacity: 0.5
            }}
          />
        </Animated.View>
      )}
    </View>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <LinearGradient
      colors={['#2B2C2C', '#1a1b1b']}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-16 pb-10 justify-center">
          {/* Logo/Title */}
          <Animated.View
            entering={FadeInDown.duration(800).springify()}
            className="items-center mb-8"
          >
            <LogoWithGlow />
            <ShinyText>Allync</ShinyText>
            <View className="flex-row items-center gap-1 mt-2">
              <Ionicons name="sparkles" size={18} color={Colors.text.secondary} style={{ marginRight: 4 }} />
              <Text className="text-base text-text-secondary font-medium italic">
                Beyond human automation
              </Text>
            </View>
          </Animated.View>

          {/* Login Form */}
          <Animated.View
            entering={FadeInUp.duration(800).delay(200).springify()}
            className="mb-8 rounded-xl overflow-hidden"
          >
            <View className="p-6 border border-cyber-gray/20 rounded-xl bg-cyber-gray/[0.03]">
              <Text className="text-2xl font-bold text-text-primary mb-6 text-center">
                Welcome Back
              </Text>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-sm text-text-secondary mb-2 font-medium">
                  Email
                </Text>
                <AnimatedInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text className="text-sm text-text-secondary mb-2 font-medium">
                  Password
                </Text>
                <AnimatedInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  editable={!loading}
                />
              </View>

              {/* Login Button */}
              <ShinyButton
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
              />
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInUp.duration(800).delay(600).springify()}
            className="items-center"
          >
            <Text className="text-sm text-text-tertiary text-center">
              Secure access to your company dashboard
            </Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
