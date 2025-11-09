import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import GlassSurface from '../GlassSurface';
import MeshGlowBackground from '../MeshGlowBackground';

const { width } = Dimensions.get('window');

const AnimatedView = Animated.View;

export default function MobileAppSkeleton() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-width, width],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  const SkeletonBox = ({ width, height, style }: { width: number | string; height: number; style?: any }) => (
    <View style={[styles.skeletonBox, { width, height }, style]}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.12)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <AnimatedView style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.1)',
            'rgba(255, 255, 255, 0.2)',
            'rgba(255, 255, 255, 0.1)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </AnimatedView>
    </View>
  );

  return (
    <MeshGlowBackground>
      <View style={styles.container}>
        {/* Back Button Skeleton */}
      <View style={styles.backButton}>
        <SkeletonBox width={24} height={24} style={styles.backIcon} />
        <SkeletonBox width={120} height={20} style={styles.backText} />
      </View>

      {/* Header Skeleton */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <SkeletonBox width={64} height={64} style={styles.headerIcon} />
          <View style={styles.headerInfo}>
            <SkeletonBox width="80%" height={24} style={styles.headerTitle} />
            <View style={styles.spacer} />
            <SkeletonBox width={100} height={24} style={styles.platformBadge} />
          </View>
        </View>
      </View>

      {/* Notice Card Skeleton */}
      <GlassSurface style={styles.noticeCard}>
        <View style={styles.noticeContent}>
          <SkeletonBox width={32} height={32} style={styles.noticeIcon} />
          <View style={styles.noticeTextContainer}>
            <SkeletonBox width="100%" height={16} style={styles.noticeTextLine} />
            <View style={styles.smallSpacer} />
            <SkeletonBox width="60%" height={16} style={styles.noticeTextLine} />
          </View>
        </View>
      </GlassSurface>

      {/* Tabs Skeleton */}
      <View style={styles.tabsContainer}>
        <SkeletonBox width={110} height={32} style={styles.tab} />
        <SkeletonBox width={90} height={32} style={styles.tab} />
        <SkeletonBox width={100} height={32} style={styles.tab} />
      </View>

      {/* Progress Card Skeleton */}
      <GlassSurface style={styles.card}>
        <View style={styles.cardHeader}>
          <SkeletonBox width={140} height={20} style={styles.cardTitle} />
          <SkeletonBox width={60} height={28} style={styles.progressPercentage} />
        </View>
        <View style={styles.progressBarContainer}>
          <SkeletonBox width="100%" height={8} style={styles.progressBar} />
        </View>
      </GlassSurface>

      {/* Stats Grid Skeleton */}
      <View style={styles.statsGrid}>
        <GlassSurface style={styles.statCard}>
          <SkeletonBox width={48} height={48} style={styles.statIcon} />
          <View style={styles.spacer} />
          <SkeletonBox width="60%" height={12} style={styles.statLabel} />
          <View style={styles.smallSpacer} />
          <SkeletonBox width="80%" height={18} style={styles.statValue} />
        </GlassSurface>

        <GlassSurface style={styles.statCard}>
          <SkeletonBox width={48} height={48} style={styles.statIcon} />
          <View style={styles.spacer} />
          <SkeletonBox width="60%" height={12} style={styles.statLabel} />
          <View style={styles.smallSpacer} />
          <SkeletonBox width="80%" height={18} style={styles.statValue} />
        </GlassSurface>
      </View>

      {/* Store Status Card Skeleton */}
      <GlassSurface style={styles.card}>
        <SkeletonBox width={140} height={20} style={styles.cardTitle} />
        <View style={styles.spacer} />

        {/* Store Item 1 */}
        <View style={styles.storeItem}>
          <View style={styles.storeInfo}>
            <SkeletonBox width={24} height={24} style={styles.storeIcon} />
            <View style={styles.storeTextContainer}>
              <SkeletonBox width={150} height={16} style={styles.storeName} />
              <View style={styles.smallSpacer} />
              <SkeletonBox width={80} height={20} style={styles.storeBadge} />
            </View>
          </View>
        </View>

        {/* Store Item 2 */}
        <View style={styles.storeItem}>
          <View style={styles.storeInfo}>
            <SkeletonBox width={24} height={24} style={styles.storeIcon} />
            <View style={styles.storeTextContainer}>
              <SkeletonBox width={140} height={16} style={styles.storeName} />
              <View style={styles.smallSpacer} />
              <SkeletonBox width={80} height={20} style={styles.storeBadge} />
            </View>
          </View>
        </View>
      </GlassSurface>

      {/* Milestones Card Skeleton */}
      <GlassSurface style={styles.card}>
        <SkeletonBox width={180} height={20} style={styles.cardTitle} />
        <View style={styles.spacer} />

        {/* Milestone 1 */}
        <View style={styles.milestoneItem}>
          <View style={styles.milestoneHeader}>
            <View style={styles.milestoneLeft}>
              <SkeletonBox width={20} height={20} style={styles.milestoneIcon} />
              <SkeletonBox width={180} height={16} style={styles.milestoneTitle} />
            </View>
            <SkeletonBox width={40} height={18} style={styles.milestoneProgress} />
          </View>
          <View style={styles.spacer} />
          <SkeletonBox width="100%" height={8} style={styles.milestoneProgressBar} />
        </View>

        {/* Milestone 2 */}
        <View style={styles.milestoneItem}>
          <View style={styles.milestoneHeader}>
            <View style={styles.milestoneLeft}>
              <SkeletonBox width={20} height={20} style={styles.milestoneIcon} />
              <SkeletonBox width={200} height={16} style={styles.milestoneTitle} />
            </View>
            <SkeletonBox width={40} height={18} style={styles.milestoneProgress} />
          </View>
          <View style={styles.spacer} />
          <SkeletonBox width="100%" height={8} style={styles.milestoneProgressBar} />
        </View>

        {/* Milestone 3 */}
        <View style={styles.milestoneItem}>
          <View style={styles.milestoneHeader}>
            <View style={styles.milestoneLeft}>
              <SkeletonBox width={20} height={20} style={styles.milestoneIcon} />
              <SkeletonBox width={160} height={16} style={styles.milestoneTitle} />
            </View>
            <SkeletonBox width={40} height={18} style={styles.milestoneProgress} />
          </View>
        </View>
      </GlassSurface>
      </View>
    </MeshGlowBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  skeletonBox: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backIcon: {
    borderRadius: BorderRadius.full,
  },
  backText: {
    borderRadius: BorderRadius.sm,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    borderRadius: BorderRadius.lg,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    borderRadius: BorderRadius.sm,
  },
  platformBadge: {
    borderRadius: BorderRadius.lg,
  },
  noticeCard: {
    padding: 16,
    marginBottom: 24,
  },
  noticeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noticeIcon: {
    borderRadius: BorderRadius.full,
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeTextLine: {
    borderRadius: BorderRadius.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    borderRadius: BorderRadius.lg,
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    borderRadius: BorderRadius.sm,
  },
  progressPercentage: {
    borderRadius: BorderRadius.sm,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    borderRadius: BorderRadius.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statIcon: {
    borderRadius: BorderRadius.full,
  },
  statLabel: {
    borderRadius: BorderRadius.sm,
  },
  statValue: {
    borderRadius: BorderRadius.sm,
  },
  storeItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storeIcon: {
    borderRadius: BorderRadius.full,
  },
  storeTextContainer: {
    flex: 1,
  },
  storeName: {
    borderRadius: BorderRadius.sm,
  },
  storeBadge: {
    borderRadius: BorderRadius.md,
  },
  milestoneItem: {
    padding: 16,
    borderRadius: BorderRadius.lg,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  milestoneIcon: {
    borderRadius: BorderRadius.full,
  },
  milestoneTitle: {
    borderRadius: BorderRadius.sm,
  },
  milestoneProgress: {
    borderRadius: BorderRadius.sm,
  },
  milestoneProgressBar: {
    borderRadius: BorderRadius.sm,
  },
  spacer: {
    height: 12,
  },
  smallSpacer: {
    height: 6,
  },
});
