import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Skeleton, SkeletonCircle } from '../Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import GlassSurface from '../GlassSurface';

export default function DashboardSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 20 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Skeleton width={120} height={20} borderRadius={4} style={{ marginBottom: 8 }} />
            <Skeleton width={180} height={28} borderRadius={6} />
          </View>
          <View style={styles.headerRight}>
            <SkeletonCircle size={40} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid Skeleton - 2x2 Grid */}
        <View style={styles.statsGrid}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.statCard}>
              <GlassSurface style={styles.statCardGlass}>
                <View style={styles.statHeader}>
                  <SkeletonCircle size={44} />
                  <SkeletonCircle size={8} />
                </View>
                <Skeleton width="60%" height={32} borderRadius={6} style={{ marginTop: 12, marginBottom: 8 }} />
                <Skeleton width="80%" height={16} borderRadius={4} style={{ marginBottom: 4 }} />
                <Skeleton width="50%" height={14} borderRadius={4} />
              </GlassSurface>
            </View>
          ))}
        </View>

        {/* Quick Actions Skeleton */}
        <View style={styles.section}>
          <Skeleton width={120} height={24} borderRadius={6} style={{ marginBottom: 16 }} />
          <View style={styles.actionsGrid}>
            {[1, 2, 3, 4].map((item) => (
              <GlassSurface key={item} style={styles.actionCard}>
                <SkeletonCircle size={48} />
                <Skeleton width="80%" height={16} borderRadius={4} style={{ marginTop: 12 }} />
                <Skeleton width="60%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
              </GlassSurface>
            ))}
          </View>
        </View>

        {/* Recent Activity Skeleton */}
        <View style={styles.section}>
          <Skeleton width={140} height={24} borderRadius={6} style={{ marginBottom: 16 }} />
          {[1, 2, 3].map((item) => (
            <GlassSurface key={item} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <SkeletonCircle size={40} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Skeleton width="70%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
                  <Skeleton width="50%" height={12} borderRadius={4} />
                </View>
              </View>
            </GlassSurface>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  statCard: {
    width: '50%',
    padding: 6,
  },
  statCardGlass: {
    padding: 16,
    borderRadius: 20,
    minHeight: 140,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionCard: {
    width: '50%',
    padding: 16,
    margin: 6,
    alignItems: 'center',
    borderRadius: 16,
  },
  activityCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
