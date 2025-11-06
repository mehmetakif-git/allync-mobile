import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { PageTransition } from '../../components/PageTransition';
import GlassSurface from '../../components/GlassSurface';
import { getActiveServices, type CompanyService } from '../../lib/api/services';
import { getUserCompanyId } from '../../lib/api/dashboard';

export default function ActiveServices() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<CompanyService[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchCompanyId();
    }
  }, [user?.id]);

  useEffect(() => {
    if (companyId) {
      fetchServices();
    }
  }, [companyId]);

  const fetchCompanyId = async () => {
    if (!user?.id) return;
    const id = await getUserCompanyId(user.id);
    setCompanyId(id);
  };

  const fetchServices = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const data = await getActiveServices(companyId);
      setServices(data);
    } catch (error) {
      console.error('Error fetching active services:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textSecondary }}>Loading active services...</Text>
        </View>
      </View>
    );
  }

  return (
    <PageTransition>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue[500]} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Active Services</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {services.length} service{services.length !== 1 ? 's' : ''} running
            </Text>
          </View>

          {/* Services List */}
          {services.map((service, index) => (
            <GlassSurface key={service.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="server" size={24} color={Colors.blue[500]} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.serviceName, { color: colors.text }]}>
                    {service.service_type?.name_en || 'Service'}
                  </Text>
                  <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
                    Status: {service.status}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: Colors.green[500] + '20' }]}>
                  <Text style={[styles.statusText, { color: Colors.green[500] }]}>Active</Text>
                </View>
              </View>
            </GlassSurface>
          ))}

          {services.length === 0 && (
            <GlassSurface style={styles.emptyCard}>
              <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No active services found
              </Text>
            </GlassSurface>
          )}
        </ScrollView>
      </View>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.blue[500] + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
