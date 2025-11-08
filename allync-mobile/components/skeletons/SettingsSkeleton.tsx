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
          <Skeleton width={140} height={32} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width="85%" height={16} borderRadius={4} />
        </View>

        {/* Notice Card Skeleton */}
        <GlassSurface style={styles.noticeCard}>
          <View style={styles.noticeContent}>
            <SkeletonCircle size={40} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
              <Skeleton width="70%" height={14} borderRadius={4} />
            </View>
          </View>
        </GlassSurface>

        {/* Tabs Skeleton */}
        <View style={styles.filtersContainer}>
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} width={90} height={38} borderRadius={19} style={{ marginRight: 8 }} />
          ))}
        </View>

        {/* Profile Card Skeleton */}
        <GlassSurface style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Skeleton width={160} height={20} borderRadius={6} />
            <Skeleton width={85} height={24} borderRadius={12} />
          </View>

          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <SkeletonCircle size={64} />
            <View style={styles.profileInfo}>
              <Skeleton width={150} height={20} borderRadius={6} style={{ marginBottom: 6 }} />
              <Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 4 }} />
              <Skeleton width={100} height={14} borderRadius={4} />
            </View>
          </View>

          {/* Profile Details Grid */}
          <View style={styles.detailsGrid}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <View key={item} style={styles.detailItem}>
                <View style={styles.detailHeader}>
                  <SkeletonCircle size={16} style={{ marginRight: 6 }} />
                  <Skeleton width={60} height={14} borderRadius={4} />
                </View>
                <Skeleton width="80%" height={16} borderRadius={4} style={{ marginTop: 6 }} />
              </View>
            ))}
          </View>
        </GlassSurface>

        {/* Company Info Card Skeleton */}
        <GlassSurface style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Skeleton width={180} height={20} borderRadius={6} />
            <Skeleton width={85} height={24} borderRadius={12} />
          </View>

          {/* Company Details Grid */}
          <View style={styles.detailsGrid}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <View key={item} style={styles.detailItem}>
                <View style={styles.detailHeader}>
                  <SkeletonCircle size={16} style={{ marginRight: 6 }} />
                  <Skeleton width={70} height={14} borderRadius={4} />
                </View>
                <Skeleton width="85%" height={16} borderRadius={4} style={{ marginTop: 6 }} />
              </View>
            ))}
          </View>
        </GlassSurface>

        {/* Action Buttons Skeleton */}
        <View style={styles.actionsContainer}>
          <Skeleton width="100%" height={48} borderRadius={12} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={48} borderRadius={12} />
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  noticeCard: {
    padding: 16,
    marginBottom: 20,
  },
  noticeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  card: {
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsContainer: {
    marginTop: 12,
  },
});
