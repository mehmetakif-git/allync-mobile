import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton, SkeletonCircle } from '../Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import GlassSurface from '../GlassSurface';
import MeshGlowBackground from '../MeshGlowBackground';

export default function SettingsSkeleton() {
  const { colors } = useTheme();

  return (
    <MeshGlowBackground>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Skeleton */}
        <View style={styles.header}>
          <Skeleton width={120} height={28} borderRadius={6} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" height={16} borderRadius={4} />
        </View>

        {/* Notice Card Skeleton */}
        <GlassSurface style={styles.noticeCard}>
          <View style={styles.noticeContent}>
            <View style={styles.noticeIconContainer}>
              <SkeletonCircle size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
              <Skeleton width="65%" height={14} borderRadius={4} />
            </View>
          </View>
        </GlassSurface>

        {/* Tabs Skeleton */}
        <View style={styles.filtersContainer}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.filterButton}>
              <View style={styles.cardBlur}>
                <Skeleton width={80} height={20} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>

        {/* Profile Card Skeleton */}
        <GlassSurface style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Skeleton width={150} height={20} borderRadius={6} />
            <Skeleton width={80} height={20} borderRadius={12} />
          </View>

          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <SkeletonCircle size={80} />
            <View style={styles.profileInfo}>
              <Skeleton width={140} height={18} borderRadius={6} style={{ marginBottom: 6 }} />
              <Skeleton width={110} height={14} borderRadius={4} style={{ marginBottom: 4 }} />
              <Skeleton width={90} height={12} borderRadius={4} />
            </View>
          </View>

          {/* Profile Details Grid */}
          <View style={styles.detailsGrid}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <View key={item} style={styles.detailItem}>
                <View style={styles.detailHeader}>
                  <SkeletonCircle size={16} style={{ marginRight: 6 }} />
                  <Skeleton width={60} height={12} borderRadius={4} />
                </View>
                <Skeleton width="75%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
              </View>
            ))}
          </View>
        </GlassSurface>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
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
  noticeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  filterButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  profileInfo: {
    flex: 1,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    padding: 16,
    borderRadius: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
});
