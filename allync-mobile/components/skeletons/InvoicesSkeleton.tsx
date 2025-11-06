import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton, SkeletonCircle } from '../Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import GlassSurface from '../GlassSurface';

export default function InvoicesSkeleton() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Skeleton width={160} height={28} borderRadius={6} style={{ marginBottom: 8 }} />
        <Skeleton width="80%" height={16} borderRadius={4} />
      </View>

      {/* Stats Cards Skeleton */}
      <View style={styles.statsContainer}>
        <GlassSurface style={styles.statCard}>
          <SkeletonCircle size={48} />
          <Skeleton width={80} height={14} borderRadius={4} style={{ marginTop: 12, marginBottom: 4 }} />
          <Skeleton width={100} height={20} borderRadius={6} />
        </GlassSurface>

        <GlassSurface style={styles.statCard}>
          <SkeletonCircle size={48} />
          <Skeleton width={60} height={14} borderRadius={4} style={{ marginTop: 12, marginBottom: 4 }} />
          <Skeleton width={90} height={20} borderRadius={6} />
        </GlassSurface>
      </View>

      {/* Filters Skeleton */}
      <View style={styles.filtersContainer}>
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} width={85} height={36} borderRadius={18} />
        ))}
      </View>

      {/* Invoices List Skeleton */}
      {[1, 2, 3].map((item) => (
        <GlassSurface key={item} style={styles.invoiceCard}>
          {/* Invoice Header */}
          <View style={styles.invoiceHeader}>
            <View style={{ flex: 1 }}>
              <Skeleton width="60%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
              <Skeleton width="40%" height={14} borderRadius={4} />
            </View>
            <Skeleton width={90} height={28} borderRadius={14} />
          </View>

          {/* Invoice Amount */}
          <View style={styles.invoiceAmount}>
            <Skeleton width={60} height={12} borderRadius={4} style={{ marginBottom: 4 }} />
            <Skeleton width={140} height={24} borderRadius={6} />
          </View>

          {/* Due Date */}
          <View style={styles.dueDate}>
            <SkeletonCircle size={14} />
            <Skeleton width={120} height={14} borderRadius={4} style={{ marginLeft: 6 }} />
          </View>

          {/* View Button */}
          <View style={styles.viewButtonContainer}>
            <Skeleton width="100%" height={44} borderRadius={12} />
          </View>
        </GlassSurface>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'flex-start',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  invoiceCard: {
    padding: 16,
    marginBottom: 16,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceAmount: {
    marginBottom: 12,
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewButtonContainer: {
    marginTop: 'auto',
  },
});
