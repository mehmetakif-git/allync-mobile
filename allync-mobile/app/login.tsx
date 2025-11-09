// Login screen with solid backgrounds and glassmorphism effects
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors } from '../constants/Colors';
import MeshGlowBackground from '../components/MeshGlowBackground';
import GlassSurface from '../components/GlassSurface';

// Logo with smooth glow effect and solid circle background
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

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const logoSource = require('../assets/logo-white.png');

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
      {/* Solid circle background */}
      <View
        style={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.15)',
        }}
      />

      {/* Glow effect layers */}
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
        source={logoSource}
        style={{ width: 80, height: 80, zIndex: 10 }}
        resizeMode="contain"
      />
    </View>
  );
}

// Simple text component
function ShinyText({ children, color }: { children: string; color: string }) {
  return (
    <Text style={{ color, fontSize: 48, fontWeight: 'bold', textAlign: 'center' }}>
      {children}
    </Text>
  );
}

// Sign In Button
function ShinyButton({
  onPress,
  loading,
  disabled,
  text,
  loadingText,
}: {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  text: string;
  loadingText: string;
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
          backgroundColor: Colors.titanium,
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
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

// Animated Input Component
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

  return (
    <View style={{ position: 'relative', marginBottom: 0 }}>
      <View
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 8,
          borderWidth: 1.5,
          borderColor: isFocused ? 'rgba(248, 249, 250, 0.6)' : 'rgba(173, 181, 189, 0.2)',
        }}
      >
        <TextInput
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            fontSize: 16,
            color: Colors.text.primary,
          }}
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
      </View>
      {isFocused && (
        <View style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2 }}>
          <LinearGradient
            colors={['transparent', Colors.titanium, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ position: 'absolute', width: '100%', height: 2 }}
          />
        </View>
      )}
    </View>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  // Load saved credentials on mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('rememberedEmail');
      const savedPassword = await AsyncStorage.getItem('rememberedPassword');
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');

      if (savedRememberMe === 'true' && savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Failed to load saved credentials:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      setLoading(false);
      Alert.alert('Login Failed', error.message);
    } else {
      // Save credentials if Remember Me is checked
      if (rememberMe) {
        try {
          await AsyncStorage.setItem('rememberedEmail', email);
          await AsyncStorage.setItem('rememberedPassword', password);
          await AsyncStorage.setItem('rememberMe', 'true');
        } catch (err) {
          console.error('Failed to save credentials:', err);
        }
      } else {
        // Clear saved credentials if Remember Me is unchecked
        try {
          await AsyncStorage.removeItem('rememberedEmail');
          await AsyncStorage.removeItem('rememberedPassword');
          await AsyncStorage.removeItem('rememberMe');
        } catch (err) {
          console.error('Failed to clear credentials:', err);
        }
      }

      setTimeout(() => {
        setLoading(false);
        router.replace('/(tabs)');
      }, 600);
    }
  };

  return (
    <MeshGlowBackground>
      {/* Content (Logo, Form, Footer) */}
      <View style={{ flex: 1 }} pointerEvents="box-none">
        {/* Language Toggle */}
        <View style={{ position: 'absolute', top: 50, right: 20, zIndex: 100 }} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => setLanguage(language === 'en' ? 'tr' : 'en')}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.15)',
            }}
          >
            <Ionicons name="language" size={20} color={colors.text} />
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
              {language.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center content container - absolute positioned */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          paddingHorizontal: 24,
        }} pointerEvents="box-none">
              {/* Logo/Title */}
              <Animated.View
                entering={FadeInDown.duration(800).springify()}
                style={{ alignItems: 'center', marginBottom: 32 }}
                pointerEvents="box-none"
              >
                <LogoWithGlow />
                <ShinyText color={colors.text}>{t.appName}</ShinyText>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Ionicons name="sparkles" size={18} color={Colors.text.secondary} style={{ marginRight: 4 }} />
                  <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: '500', fontStyle: 'italic' }}>
                    {t.slogan}
                  </Text>
                </View>
              </Animated.View>

              {/* Login Form */}
              <Animated.View
                entering={FadeInUp.duration(800).delay(200).springify()}
                style={{ marginBottom: 32 }}
                pointerEvents="auto"
              >
                <GlassSurface style={{ padding: 24 }}>
                  <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>
                    {t.welcomeBack}
                  </Text>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 8, fontWeight: '500' }}>
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

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 8, fontWeight: '500' }}>
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

                  {/* Remember Me Checkbox */}
                  <TouchableOpacity
                    onPress={() => setRememberMe(!rememberMe)}
                    disabled={loading}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: rememberMe ? Colors.titanium : 'rgba(248, 249, 250, 0.3)',
                        backgroundColor: rememberMe ? Colors.titanium : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {rememberMe && (
                        <Ionicons name="checkmark" size={14} color={Colors.coal} />
                      )}
                    </View>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
                      {t.rememberMe}
                    </Text>
                  </TouchableOpacity>

                  <ShinyButton
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    text={t.signInButton}
                    loadingText={t.signingIn}
                  />
                </GlassSurface>
              </Animated.View>

              {/* Footer */}
              <Animated.View
                entering={FadeInUp.duration(800).delay(600).springify()}
                style={{ alignItems: 'center', justifyContent: 'center' }}
                pointerEvents="auto"
              >
                <GlassSurface style={{
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ color: colors.textTertiary, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
                    {t.secureAccess}
                  </Text>
                </GlassSurface>
              </Animated.View>
        </View>
      </View>
    </MeshGlowBackground>
  );
}
