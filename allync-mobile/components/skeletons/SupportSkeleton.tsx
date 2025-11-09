import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton, SkeletonCircle } from '../Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import GlassSurface from '../GlassSurface';
import MeshGlowBackground from '../MeshGlowBackground';

export default function SupportSkeleton() {
  const { colors } = useTheme();

  return (
    <MeshGlowBackground>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Skeleton width={150} height={24} borderRadius={6} />
        <SkeletonCircle size={44} />
      </View>

      {/* Search Bar Skeleton */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainerBlur}>
          <SkeletonCircle size={20} />
          <Skeleton width="75%" height={16} borderRadius={4} style={{ marginLeft: 12 }} />
        </View>

        {/* Filter Chips Skeleton */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterScrollContent}
        >
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} style={styles.filterChipWrapper}>
              <View style={styles.filterChipBlur}>
                <Skeleton width={90} height={20} borderRadius={4} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Tickets List Skeleton */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.ticketsListContent}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.ticketCard}>
            <View style={styles.ticketCardBlur}>
              <View style={styles.ticketCardGlass}>
                {/* Ticket Header */}
                <View style={styles.ticketCardHeader}>
                  <Skeleton width="35%" height={12} borderRadius={4} />
                  <Skeleton width={80} height={24} borderRadius={12} />
                </View>

                {/* Ticket Title */}
                <Skeleton width="85%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />

                {/* Ticket Description */}
                <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
                <Skeleton width="75%" height={14} borderRadius={4} style={{ marginBottom: 12 }} />

                {/* Ticket Footer */}
                <View style={styles.ticketFooter}>
                  <Skeleton width={60} height={12} borderRadius={4} />
                  <Skeleton width={90} height={12} borderRadius={4} />
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </MeshGlowBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchContainerBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterScrollContent: {
    gap: 8,
  },
  filterChipWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterChipBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  ticketsListContent: {
    padding: 20,
    paddingBottom: 100,
  },
  ticketCard: {
    marginBottom: 12,
  },
  ticketCardBlur: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  ticketCardGlass: {
    padding: 16,
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
