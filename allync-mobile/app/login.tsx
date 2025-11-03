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
  Dimensions,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors } from '../constants/Colors';
import { SparklesBackground } from '../components/SparklesBackground';
import { ThemeToggle } from '../components/ThemeToggle';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Logo with smooth glow effect
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

// Minimal Sign In Button - Coal & Titanium colors only
function ShinyButton({
  onPress,
  loading,
  disabled,
  text,
  loadingText,
  theme,
}: {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  text: string;
  loadingText: string;
  theme: 'light' | 'dark';
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={{ marginTop: 24 }}
    >
      <View
        style={{
          backgroundColor: theme === 'dark' ? Colors.titanium : 'rgba(248, 249, 250, 0.95)',
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: theme === 'light' ? 1 : 0,
          borderColor: theme === 'light' ? 'rgba(43, 44, 44, 0.15)' : 'transparent',
        }}
      >
        {loading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIndicator size="small" color={Colors.coal} />
            <Text style={{ color: Colors.coal, fontSize: 15, fontWeight: '600' }}>
              {loadingText}
            </Text>
          </View>
        ) : (
          <Text style={{ color: Colors.coal, fontSize: 15, fontWeight: '600' }}>
            {text}
          </Text>
        )}
      </View>
    </TouchableOpacity>
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
  const { theme, toggleTheme, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();
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

  const particleColor = theme === 'light'
    ? 'rgba(26, 27, 27, 0.4)'
    : 'rgba(248, 249, 250, 0.4)';

  return (
    <View style={{ flex: 1 }}>
      {/* Background color layer - bottom */}
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: colors.background, zIndex: -2 }} />

      {/* All content - middle (below sparkles) */}
      <View style={{ flex: 1, zIndex: -1 }}>
        {/* Top-right toggles */}
        <View style={{ position: 'absolute', top: 50, right: 20, zIndex: 100, flexDirection: 'row', gap: 16, alignItems: 'center' }}>
        {/* Language Toggle */}
        <TouchableOpacity
          onPress={() => setLanguage(language === 'en' ? 'tr' : 'en')}
          style={{
            backgroundColor: 'rgba(173, 181, 189, 0.15)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(173, 181, 189, 0.3)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Ionicons name="language" size={20} color={colors.text} />
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
            {language.toUpperCase()}
          </Text>
        </TouchableOpacity>

        {/* Theme Toggle with Lottie Animation */}
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingTop: 64,
            paddingBottom: 40,
            maxWidth: Platform.OS === 'web' ? 500 : '100%',
            width: '100%',
            alignSelf: 'center',
          }}
          keyboardShouldPersistTaps="handled"
        >
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {/* Logo/Title */}
          <Animated.View
            entering={FadeInDown.duration(800).springify()}
            className="items-center mb-8"
          >
            <LogoWithGlow theme={theme} />
            <ShinyText color={colors.text}>{t.appName}</ShinyText>
            <View className="flex-row items-center gap-1 mt-2">
              <Ionicons name="sparkles" size={18} color={Colors.text.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.textSecondary }} className="text-base font-medium italic">
                {t.slogan}
              </Text>
            </View>
          </Animated.View>

          {/* Login Form */}
          <Animated.View
            entering={FadeInUp.duration(800).delay(200).springify()}
            className="mb-8"
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: theme === 'dark' ? '#000' : '#2B2C2C',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: theme === 'dark' ? 0.6 : 0.3,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            {/* Glassmorphism blur background */}
            <BlurView
              intensity={theme === 'dark' ? 30 : 50}
              tint={theme === 'dark' ? 'dark' : 'light'}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: theme === 'dark' ? 'rgba(248, 249, 250, 0.15)' : 'rgba(43, 44, 44, 0.2)',
              }}
            >
              <View
                style={{
                  padding: 24,
                  backgroundColor: theme === 'dark' ? 'rgba(43, 44, 44, 0.65)' : 'rgba(248, 249, 250, 0.75)',
                }}
              >
                <Text style={{ color: colors.text }} className="text-2xl font-bold mb-6 text-center">
                  {t.welcomeBack}
                </Text>

              {/* Email Input */}
              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="text-sm mb-2 font-medium">
                  {t.emailPlaceholder}
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
                <Text style={{ color: colors.textSecondary }} className="text-sm mb-2 font-medium">
                  {t.passwordPlaceholder}
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
                text={t.signInButton}
                loadingText={t.signingIn}
                theme={theme}
              />
              </View>
            </BlurView>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInUp.duration(800).delay(600).springify()}
            className="items-center"
          >
            <Text style={{ color: colors.textTertiary }} className="text-sm text-center">
              {t.secureAccess}
            </Text>
          </Animated.View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </View>

      {/* Sparkles on top - always visible */}
      <SparklesBackground particleCount={50} particleColor={particleColor} />
    </View>
  );
}
