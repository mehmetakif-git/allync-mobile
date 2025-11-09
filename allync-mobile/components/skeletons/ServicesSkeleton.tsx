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
          <Skeleton width={200} height={28} borderRadius={6} style={{ marginBottom: 8 }} />
          <Skeleton width="85%" height={16} borderRadius={4} />
        </View>

        {/* Category Filters Skeleton */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} width={140} height={36} borderRadius={12} style={{ marginRight: 8 }} />
          ))}
        </ScrollView>

        {/* Services List Skeleton (Full Width Cards) */}
        <View style={styles.servicesList}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.serviceCardBlur}>
              <View style={styles.serviceCard}>
                {/* Icon */}
                <Skeleton width={60} height={60} borderRadius={12} style={{ marginBottom: 12 }} />

                {/* Service Name */}
                <Skeleton width="75%" height={20} borderRadius={6} style={{ marginBottom: 8 }} />

                {/* Description */}
                <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
                <Skeleton width="90%" height={14} borderRadius={4} style={{ marginBottom: 12 }} />

                {/* Status Badge */}
                <Skeleton width={110} height={24} borderRadius={12} style={{ marginBottom: 12 }} />

                {/* Action Button */}
                <Skeleton width="100%" height={40} borderRadius={12} />
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
  serviceCardBlur: {
    padding: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  serviceCard: {
    padding: Spacing.lg,
  },
});
