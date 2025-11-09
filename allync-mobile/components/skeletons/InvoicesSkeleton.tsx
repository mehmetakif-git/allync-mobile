import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton, SkeletonCircle } from '../Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import GlassSurface from '../GlassSurface';
import MeshGlowBackground from '../MeshGlowBackground';

export default function InvoicesSkeleton() {
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
          <Skeleton width={140} height={28} borderRadius={6} style={{ marginBottom: 8 }} />
          <Skeleton width="75%" height={16} borderRadius={4} />
        </View>

        {/* Stats Cards Skeleton */}
        <View style={styles.statsContainer}>
          <View style={[styles.cardBlur, { flex: 1 }]}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <SkeletonCircle size={48} />
              </View>
              <Skeleton width={70} height={14} borderRadius={4} style={{ marginBottom: 4 }} />
              <Skeleton width={90} height={20} borderRadius={6} />
            </View>
          </View>

          <View style={[styles.cardBlur, { flex: 1 }]}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <SkeletonCircle size={48} />
              </View>
              <Skeleton width={60} height={14} borderRadius={4} style={{ marginBottom: 4 }} />
              <Skeleton width={85} height={20} borderRadius={6} />
            </View>
          </View>
        </View>

        {/* Filters Skeleton */}
        <View style={styles.filtersContainer}>
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} width={80} height={32} borderRadius={16} />
          ))}
        </View>

        {/* Invoices List Skeleton */}
        {[1, 2, 3].map((item) => (
          <View key={item} style={[styles.cardBlur, { marginBottom: 16 }]}>
            <View style={styles.invoiceCard}>
              {/* Invoice Header */}
              <View style={styles.invoiceHeader}>
                <View style={styles.invoiceInfo}>
                  <Skeleton width="55%" height={16} borderRadius={4} style={{ marginBottom: 4 }} />
                  <Skeleton width="40%" height={14} borderRadius={4} />
                </View>
                <Skeleton width={80} height={24} borderRadius={12} />
              </View>

              {/* Invoice Amount */}
              <View style={styles.invoiceAmount}>
                <Skeleton width={50} height={12} borderRadius={4} style={{ marginBottom: 4 }} />
                <Skeleton width={120} height={24} borderRadius={6} />
              </View>

              {/* Due Date */}
              <View style={styles.dueDate}>
                <SkeletonCircle size={14} />
                <Skeleton width={110} height={14} borderRadius={4} style={{ marginLeft: 6 }} />
              </View>

              {/* View Button */}
              <Skeleton width="100%" height={44} borderRadius={12} />
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  cardBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  statCard: {
    padding: 16,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  invoiceCard: {
    padding: 16,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceAmount: {
    marginBottom: 12,
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
});
