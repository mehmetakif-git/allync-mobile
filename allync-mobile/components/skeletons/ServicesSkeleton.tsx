import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton, SkeletonCircle } from '../Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import GlassSurface from '../GlassSurface';

export default function ServicesSkeleton() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Skeleton width={180} height={28} borderRadius={6} style={{ marginBottom: 8 }} />
        <Skeleton width="80%" height={16} borderRadius={4} />
      </View>

      {/* Category Filters Skeleton */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} width={140} height={40} borderRadius={20} style={{ marginRight: 12 }} />
        ))}
      </ScrollView>

      {/* Services Grid Skeleton */}
      <View style={styles.servicesGrid}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <View key={item} style={styles.serviceCardWrapper}>
            <GlassSurface style={styles.serviceCard}>
              {/* Icon */}
              <View style={styles.serviceIconContainer}>
                <SkeletonCircle size={56} />
              </View>

              {/* Service Name */}
              <Skeleton width="80%" height={18} borderRadius={4} style={{ marginTop: 16, marginBottom: 8 }} />

              {/* Description */}
              <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
              <Skeleton width="90%" height={14} borderRadius={4} style={{ marginBottom: 12 }} />

              {/* Status Badge */}
              <View style={styles.statusBadgeContainer}>
                <Skeleton width={80} height={24} borderRadius={12} />
              </View>

              {/* Bottom Info */}
              <View style={styles.serviceFooter}>
                <Skeleton width={60} height={14} borderRadius={4} />
                <Skeleton width={70} height={14} borderRadius={4} />
              </View>
            </GlassSurface>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 20,
  },
  filtersContainer: {
    marginBottom: 24,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filtersContent: {
    paddingRight: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  serviceCardWrapper: {
    width: '50%',
    padding: 6,
  },
  serviceCard: {
    padding: 16,
    borderRadius: 20,
    minHeight: 220,
  },
  serviceIconContainer: {
    alignItems: 'flex-start',
  },
  statusBadgeContainer: {
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
