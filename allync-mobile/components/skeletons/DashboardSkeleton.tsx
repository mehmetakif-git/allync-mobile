import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Skeleton, SkeletonCircle } from '../Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import GlassSurface from '../GlassSurface';
import MeshGlowBackground from '../MeshGlowBackground';

export default function DashboardSkeleton() {
  const { colors } = useTheme();

  return (
    <MeshGlowBackground>
      {/* Header Skeleton - Matches DashboardHeader component */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 20 }]}>
        <View style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Skeleton width={80} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
              <Skeleton width={140} height={28} borderRadius={6} />
            </View>
            <View style={styles.headerRight}>
              <View style={styles.headerButtons}>
                <SkeletonCircle size={44} />
                <SkeletonCircle size={44} />
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid Skeleton - 2x2 Grid matching actual stat cards */}
        <View style={styles.statsGrid}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.statCard}>
              <View style={styles.statCardBlur}>
                <View style={styles.statCardGlass}>
                  <View style={styles.statHeader}>
                    <SkeletonCircle size={40} />
                    <SkeletonCircle size={8} />
                  </View>
                  <Skeleton width="70%" height={28} borderRadius={6} style={{ marginTop: 12, marginBottom: 8 }} />
                  <Skeleton width="85%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
                  <Skeleton width="60%" height={12} borderRadius={4} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions Skeleton - 3 items in a row */}
        <View style={styles.section}>
          <View style={{ marginBottom: 16 }}>
            <Skeleton width={120} height={24} borderRadius={6} style={{ marginBottom: 4 }} />
            <Skeleton width={180} height={14} borderRadius={4} />
          </View>
          <View style={styles.actionsContainer}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.actionButton}>
                <View style={styles.actionButtonBlur}>
                  <View style={styles.actionButtonGlass}>
                    <SkeletonCircle size={48} />
                    <Skeleton width="80%" height={14} borderRadius={4} style={{ marginTop: 12 }} />
                    <Skeleton width="60%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Active Services Skeleton - 2x2 grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Skeleton width={180} height={24} borderRadius={6} />
            <Skeleton width={60} height={18} borderRadius={4} />
          </View>
          <View style={styles.servicesGrid}>
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.serviceCard}>
                <View style={styles.serviceCardBlur}>
                  <View style={styles.serviceCardGlass}>
                    <SkeletonCircle size={48} />
                    <Skeleton width="85%" height={14} borderRadius={4} style={{ marginTop: 12, marginBottom: 6 }} />
                    <Skeleton width="60%" height={12} borderRadius={4} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </MeshGlowBackground>
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
  headerBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: '48%',
  },
  statCardBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  statCardGlass: {
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionButtonGlass: {
    padding: 16,
    alignItems: 'center',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
  },
  serviceCardBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  serviceCardGlass: {
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
});
