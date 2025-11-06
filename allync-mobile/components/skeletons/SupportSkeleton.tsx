import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton, SkeletonCircle } from '../Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import GlassSurface from '../GlassSurface';

export default function SupportSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Skeleton width={160} height={26} borderRadius={6} />
        <SkeletonCircle size={44} />
      </View>

      {/* Search Bar Skeleton */}
      <View style={styles.searchSection}>
        <GlassSurface style={styles.searchContainer}>
          <SkeletonCircle size={20} />
          <Skeleton width="80%" height={16} borderRadius={4} style={{ marginLeft: 12 }} />
        </GlassSurface>

        {/* Filter Chips Skeleton */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterScrollContent}
        >
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} width={100} height={36} borderRadius={18} style={{ marginRight: 8 }} />
          ))}
        </ScrollView>
      </View>

      {/* Tickets List Skeleton */}
      <ScrollView style={styles.ticketsList} contentContainerStyle={styles.ticketsListContent}>
        {[1, 2, 3, 4, 5].map((item) => (
          <GlassSurface key={item} style={styles.ticketCard}>
            {/* Ticket Header */}
            <View style={styles.ticketHeader}>
              <View style={{ flex: 1 }}>
                <Skeleton width="70%" height={18} borderRadius={4} style={{ marginBottom: 6 }} />
                <Skeleton width="40%" height={14} borderRadius={4} />
              </View>
              <Skeleton width={80} height={26} borderRadius={13} />
            </View>

            {/* Ticket Subject */}
            <View style={styles.ticketSubject}>
              <Skeleton width="90%" height={16} borderRadius={4} style={{ marginBottom: 4 }} />
              <Skeleton width="80%" height={14} borderRadius={4} />
            </View>

            {/* Ticket Footer */}
            <View style={styles.ticketFooter}>
              <View style={styles.ticketMeta}>
                <SkeletonCircle size={16} />
                <Skeleton width={100} height={12} borderRadius={4} style={{ marginLeft: 6 }} />
              </View>
              <View style={styles.ticketMeta}>
                <SkeletonCircle size={16} />
                <Skeleton width={80} height={12} borderRadius={4} style={{ marginLeft: 6 }} />
              </View>
            </View>

            {/* Priority Badge */}
            <View style={styles.priorityBadge}>
              <Skeleton width={70} height={22} borderRadius={11} />
            </View>
          </GlassSurface>
        ))}
      </ScrollView>
    </View>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterScrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterScrollContent: {
    paddingRight: 20,
  },
  ticketsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ticketsListContent: {
    paddingBottom: 120,
  },
  ticketCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketSubject: {
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
  },
});
