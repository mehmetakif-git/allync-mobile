import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import MeshGlowBackground from '../MeshGlowBackground';

const AnimatedView = Animated.View;

export default function WhatsAppSkeleton() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 1], [0.3, 0.7]);
    return { opacity };
  });

  return (
    <MeshGlowBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <AnimatedView style={[styles.backButton, shimmerStyle]} />
          <AnimatedView style={[styles.headerTitle, shimmerStyle]} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <AnimatedView
              key={index}
              style={[styles.tab, shimmerStyle]}
            />
          ))}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <AnimatedView style={[styles.searchBar, shimmerStyle]} />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterChips}>
          {[1, 2, 3].map((_, index) => (
            <AnimatedView
              key={index}
              style={[styles.filterChip, shimmerStyle]}
            />
          ))}
        </View>

        {/* Content Cards */}
        <View style={styles.content}>
          {[1, 2, 3, 4, 5].map((_, index) => (
            <AnimatedView
              key={index}
              style={[styles.card, shimmerStyle]}
            >
              <View style={styles.cardHeader}>
                <AnimatedView style={[styles.avatar, shimmerStyle]} />
                <View style={styles.cardInfo}>
                  <AnimatedView style={[styles.cardTitle, shimmerStyle]} />
                  <AnimatedView style={[styles.cardSubtitle, shimmerStyle]} />
                </View>
              </View>
              <AnimatedView style={[styles.cardMessage, shimmerStyle]} />
              <View style={styles.cardFooter}>
                <AnimatedView style={[styles.badge, shimmerStyle]} />
                <AnimatedView style={[styles.timestamp, shimmerStyle]} />
              </View>
            </AnimatedView>
          ))}
        </View>
      </View>
    </MeshGlowBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['5xl'],
    paddingBottom: Spacing.md,
    gap: Spacing.md,
    backgroundColor: '#0B1429',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerTitle: {
    flex: 1,
    height: 24,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: '#0B1429',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    height: 32,
    width: 80,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  searchBar: {
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    height: 32,
    width: 70,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  cardTitle: {
    height: 16,
    width: '60%',
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardSubtitle: {
    height: 14,
    width: '40%',
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardMessage: {
    height: 14,
    width: '80%',
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    height: 24,
    width: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  timestamp: {
    height: 12,
    width: 80,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
