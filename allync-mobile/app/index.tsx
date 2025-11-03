import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Gradients } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // User is already logged in, redirect to dashboard
      router.replace('/(tabs)');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <LinearGradient colors={Gradients.primary} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.blue[500]} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={Gradients.primary}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Title */}
        <Animated.View
          entering={FadeInDown.duration(800).springify()}
          style={styles.header}
        >
          <Image
            source={require('../assets/logo-white.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <LinearGradient
            colors={['#F8F9FA', '#0D6EFD', '#0a58ca', '#F8F9FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.title}>Allync</Text>
          </LinearGradient>
          <View style={styles.sloganContainer}>
            <Ionicons name="sparkles" size={16} color={Colors.deepBlue} />
            <Text style={styles.slogan}>Beyond human automation</Text>
          </View>
        </Animated.View>

        {/* Welcome Card */}
        <Animated.View
          entering={FadeInUp.duration(800).delay(200).springify()}
          style={styles.card}
        >
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.1)', 'rgba(6, 182, 212, 0.1)']}
            style={styles.cardGradient}
          >
            <Text style={styles.cardTitle}>Welcome! 👋</Text>
            <Text style={styles.cardText}>
              Your mobile dashboard is ready. Manage your services, invoices, and support tickets on the go.
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Action Button */}
        <AnimatedTouchable
          entering={FadeInUp.duration(800).delay(400).springify()}
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push('/login')}
        >
          <LinearGradient
            colors={[Colors.deepBlue, '#0a58ca']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </AnimatedTouchable>

        {/* Features */}
        <Animated.View
          entering={FadeInUp.duration(800).delay(600).springify()}
          style={styles.features}
        >
          <Feature icon="📊" text="Real-time Stats" />
          <Feature icon="💳" text="Quick Payments" />
          <Feature icon="🎫" text="Support Tickets" />
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['6xl'],
    paddingBottom: Spacing['4xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['5xl'],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.xl,
  },
  titleGradient: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize['5xl'],
    fontWeight: Typography.fontWeight.bold,
    color: 'transparent',
  },
  sloganContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  slogan: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    fontWeight: Typography.fontWeight.medium,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  card: {
    marginBottom: Spacing['3xl'],
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.xl,
  },
  cardTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  cardText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.lg,
  },
  button: {
    marginBottom: Spacing['3xl'],
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  buttonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  feature: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
});
