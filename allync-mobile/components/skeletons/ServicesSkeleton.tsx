import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Skeleton, SkeletonCircle } from '../Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import MeshGlowBackground from '../MeshGlowBackground';

export default function ServicesSkeleton() {
  const { colors } = useTheme();

  return (
    <MeshGlowBackground>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Skeleton width={220} height={32} borderRadius={8} style={{ marginBottom: 8 }} />
        <Skeleton width="90%" height={18} borderRadius={6} />
      </View>

      {/* Category Filters Skeleton */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} width={140} height={40} borderRadius={12} style={{ marginRight: 12 }} />
        ))}
      </ScrollView>

      {/* Services List Skeleton (Full Width Cards) */}
      <View style={styles.servicesList}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.serviceCard}>
            {/* Icon */}
            <View style={styles.serviceHeader}>
              <Skeleton width={60} height={60} borderRadius={12} />
            </View>

            {/* Service Name */}
            <Skeleton width="80%" height={22} borderRadius={6} style={{ marginTop: 12, marginBottom: 8 }} />

            {/* Description */}
            <Skeleton width="100%" height={16} borderRadius={4} style={{ marginBottom: 4 }} />
            <Skeleton width="95%" height={16} borderRadius={4} style={{ marginBottom: 12 }} />

            {/* Status Badge */}
            <View style={styles.statusBadgeContainer}>
              <Skeleton width={120} height={26} borderRadius={13} />
            </View>

            {/* Action Button */}
            <View style={styles.actionButtonContainer}>
              <Skeleton width="100%" height={44} borderRadius={12} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
    </MeshGlowBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing['5xl'],
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  filtersContainer: {
    marginBottom: Spacing.xl,
  },
  filtersContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  servicesList: {
    gap: Spacing.lg,
  },
  serviceCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  serviceHeader: {
    alignItems: 'flex-start',
  },
  statusBadgeContainer: {
    marginBottom: Spacing.md,
  },
  actionButtonContainer: {
    marginTop: 'auto',
  },
});
