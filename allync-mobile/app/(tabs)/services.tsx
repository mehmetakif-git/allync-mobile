import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView, RNCBlurView } from '../../components/BlurViewCompat';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { PageTransition } from '../../components/PageTransition';
import RequestServiceModal from '../../components/RequestServiceModal';
import ServicesSkeleton from '../../components/skeletons/ServicesSkeleton';
import {
  getActiveServices,
  getCompanyServices,
  getCompanyServiceRequests,
  createServiceRequest,
  type Service,
  type CompanyService,
  type ServiceRequest,
} from '../../lib/api/services';
import { getUserCompanyId } from '../../lib/api/dashboard';
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
type Category = 'all' | 'ai' | 'digital';
export default function Services() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [services, setServices] = useState<Service[]>([]);
  const [companyServices, setCompanyServices] = useState<CompanyService[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  useEffect(() => {
    if (user?.id) {
      fetchCompanyId();
    }
  }, [user?.id]);
  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);
  const fetchCompanyId = async () => {
    if (!user?.id) return;
    const id = await getUserCompanyId(user.id);
    setCompanyId(id);
  };
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch services
      const servicesData = await getActiveServices();
      setServices(servicesData);
      if (companyId) {
        // Fetch company services and requests in parallel
        const [companyServicesData, requestsData] = await Promise.all([
          getCompanyServices(companyId),
          getCompanyServiceRequests(companyId),
        ]);
        setCompanyServices(companyServicesData);
        setServiceRequests(requestsData);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };
  const handleRequestService = (service: Service) => {
    setSelectedService(service);
    setModalVisible(true);
  };
  const handleSubmitRequest = async (packageType: 'basic' | 'standard' | 'premium', notes: string) => {
    if (!selectedService || !companyId || !user?.id) return;
    await createServiceRequest({
      company_id: companyId,
      service_type_id: selectedService.id,
      package: packageType,
      requested_by: user.id,
      notes: notes || undefined,
    });
    // Refresh data to show new request
    await fetchData();
  };
  // Filter services by category
  const filteredServices = services.filter(service => {
    if (service.status === 'inactive') return false;
    const companyServiceStatus = companyServices.find(cs => cs.service_type_id === service.id);
    if (companyServiceStatus?.status === 'inactive') return false;
    if (selectedCategory === 'all') return true;
    return service.category === selectedCategory;
  });
  // Check if service is active
  const isServiceActive = (serviceId: string) => {
    return companyServices.some(
      cs => cs.service_type_id === serviceId && cs.status === 'active'
    );
  };
  // Get service status
  const getServiceStatus = (serviceId: string) => {
    const companyService = companyServices.find(cs => cs.service_type_id === serviceId);
    if (companyService && companyService.status === 'active') {
      return { status: 'approved', package: companyService.package };
    }
    const request = serviceRequests.find(req => req.service_type_id === serviceId);
    return request || null;
  };
  // Get service icon name
  const getServiceIcon = (slug: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'whatsapp-automation': 'logo-whatsapp',
      'instagram-automation': 'logo-instagram',
      'google-calendar-integration': 'calendar',
      'google-sheets-integration': 'document-text',
      'gmail-integration': 'mail',
      'google-docs-integration': 'document',
      'google-drive-integration': 'folder',
      'google-photos-integration': 'images',
      'voice-cloning': 'mic',
      'sentiment-analysis': 'heart',
      'website-development': 'globe',
      'mobile-app-development': 'phone-portrait',
    };
    return iconMap[slug] || 'cube';
  };
  // Get gradient colors for service category
  const getGradientColors = (category: string, colorScheme?: string): [string, string] => {
    if (colorScheme) {
      // Parse custom gradient from service.color
      const match = colorScheme.match(/from-(\w+)-(\d+)\s+to-(\w+)-(\d+)/);
      if (match) {
        const [, color1, shade1, color2, shade2] = match;
        const colorMap: Record<string, any> = {
          blue: Colors.blue,
          cyan: Colors.cyan,
          green: Colors.green,
          purple: Colors.purple,
          orange: Colors.orange,
        };
        return [
          colorMap[color1]?.[parseInt(shade1)] || Colors.blue[500],
          colorMap[color2]?.[parseInt(shade2)] || Colors.cyan[500],
        ];
      }
    }
    // Default gradients by category
    if (category === 'ai') {
      return [Colors.blue[500], Colors.cyan[500]];
    }
    return [Colors.purple[500], Colors.purple[700]];
  };
  if (loading) {
    return (
      <PageTransition>
        <View style={styles.container}>
          <ServicesSkeleton />
        </View>
      </PageTransition>
    );
  }
  const categoryButtons: { key: Category; labelEn: string; labelTr: string }[] = [
    { key: 'all', labelEn: 'All Services', labelTr: 'Tüm Servisler' },
    { key: 'ai', labelEn: 'AI Services', labelTr: 'AI Servisleri' },
    { key: 'digital', labelEn: 'Digital', labelTr: 'Dijital' },
  ];
  return (
    <PageTransition>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue[500]} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {language === 'en' ? 'Services Catalog' : 'Servis Kataloğu'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {language === 'en' ? 'Explore and manage your services' : 'Servislerinizi keşfedin ve yönetin'}
            </Text>
          </View>
          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {categoryButtons.map((cat, index) => {
              const isSelected = selectedCategory === cat.key;
              const count = cat.key === 'all'
                ? filteredServices.length
                : services.filter(s => s.category === cat.key && s.status !== 'inactive').length;
              return (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setSelectedCategory(cat.key)}
                  activeOpacity={0.7}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: isSelected
                        ? (Colors.blue[500])
                        : ('rgba(43, 44, 44, 0.5)'),
                      borderColor: isSelected
                        ? 'transparent'
                        : ('rgba(248, 249, 250, 0.1)'),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {language === 'en' ? cat.labelEn : cat.labelTr} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {/* Services Grid */}
          <View style={styles.servicesGrid}>
            {filteredServices.map((service, index) => {
              const isActive = isServiceActive(service.id);
              const status = getServiceStatus(service.id);
              const isInMaintenance = service.status === 'maintenance';
              const iconName = getServiceIcon(service.slug);
              const [gradientStart, gradientEnd] = getGradientColors(service.category, service.color);
              const serviceName = language === 'en' ? service.name_en : service.name_tr;
              const serviceDesc = language === 'en'
                ? (service.short_description_en || service.description_en)
                : (service.short_description_tr || service.description_tr);
              return (
                <AnimatedTouchable
                  key={service.id}
                  entering={FadeInDown.duration(600).delay(index * 100).springify()}
                  activeOpacity={0.8}
                  style={styles.serviceCardWrapper}
                >
                  <View style={styles.serviceCard}>
                    {/* Colored gradient background */}
                    <LinearGradient
                      colors={[`${gradientStart}20`, `${gradientEnd}05`]}
                      style={StyleSheet.absoluteFillObject}
                    />
                    {/* Glass overlay */}
                    {Platform.OS === 'ios' ? (
                      <BlurView
                        intensity={40}
                        tint={'dark'}
                        style={[styles.serviceCardGlass, {
                          backgroundColor: 'rgba(43, 44, 44, 0.3)',
                        }]}
                      >
                        {/* Icon */}
                        <LinearGradient
                          colors={[gradientStart, gradientEnd]}
                          style={styles.serviceIcon}
                        >
                          <Ionicons name={iconName} size={28} color="#FFFFFF" />
                        </LinearGradient>
                        {/* Service Name */}
                        <Text style={[styles.serviceName, { color: colors.text }]} numberOfLines={2}>
                          {serviceName}
                        </Text>
                        {/* Description */}
                        <Text style={[styles.serviceDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                          {serviceDesc}
                        </Text>
                        {/* Status Badge */}
                        {isActive && (
                          <View style={[styles.statusBadge, { backgroundColor: `${Colors.green[500]}20`, borderColor: `${Colors.green[500]}30` }]}>
                            <Ionicons name="checkmark-circle" size={14} color={Colors.green[500]} />
                            <Text style={[styles.statusText, { color: Colors.green[500] }]}>
                              {language === 'en' ? 'Active' : 'Aktif'} - {status?.package?.toUpperCase()}
                            </Text>
                          </View>
                        )}
                        {status && status.status === 'pending' && (
                          <View style={[styles.statusBadge, { backgroundColor: `${Colors.yellow[500]}20`, borderColor: `${Colors.yellow[500]}30` }]}>
                            <Ionicons name="time" size={14} color={Colors.yellow[500]} />
                            <Text style={[styles.statusText, { color: Colors.yellow[500] }]}>
                              {language === 'en' ? 'Pending' : 'Beklemede'}
                            </Text>
                          </View>
                        )}
                        {status && status.status === 'rejected' && (
                          <View style={[styles.statusBadge, { backgroundColor: `${Colors.red[500]}20`, borderColor: `${Colors.red[500]}30` }]}>
                            <Ionicons name="close-circle" size={14} color={Colors.red[500]} />
                            <Text style={[styles.statusText, { color: Colors.red[500] }]}>
                              {language === 'en' ? 'Rejected' : 'Reddedildi'}
                            </Text>
                          </View>
                        )}
                        {isInMaintenance && (
                          <View style={[styles.statusBadge, { backgroundColor: `${Colors.orange[500]}20`, borderColor: `${Colors.orange[500]}30` }]}>
                            <Ionicons name="construct" size={14} color={Colors.orange[500]} />
                            <Text style={[styles.statusText, { color: Colors.orange[500] }]}>
                              {language === 'en' ? 'Maintenance' : 'Bakımda'}
                            </Text>
                          </View>
                        )}
                        {/* Action Button */}
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            {
                              backgroundColor: isActive
                                ? `${Colors.blue[500]}20`
                                : isInMaintenance
                                ? `${Colors.gray[500]}20`
                                : `${Colors.green[500]}20`,
                            },
                          ]}
                          disabled={isInMaintenance}
                          activeOpacity={0.7}
                          onPress={() => {
                            if (!isActive && !isInMaintenance) {
                              handleRequestService(service);
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.actionButtonText,
                              {
                                color: isActive
                                  ? Colors.blue[500]
                                  : isInMaintenance
                                  ? Colors.gray[500]
                                  : Colors.green[500],
                              },
                            ]}
                          >
                            {isActive
                              ? (language === 'en' ? 'View Dashboard' : 'Paneli Gör')
                              : isInMaintenance
                              ? (language === 'en' ? 'Under Maintenance' : 'Bakımda')
                              : (language === 'en' ? 'Request Service' : 'Servis Talep Et')}
                          </Text>
                        </TouchableOpacity>
                      </BlurView>
                    ) : (
                      <>
                        <RNCBlurView
                          style={StyleSheet.absoluteFillObject}
                          blurType={'dark'}
                          blurAmount={5}
                          reducedTransparencyFallbackColor={
                            'rgba(10, 14, 39, 0.85)'
                          }
                        >
                          <View
                            style={[
                              StyleSheet.absoluteFillObject,
                              {
                                backgroundColor: 'rgba(43, 44, 44, 0.3)',
                              },
                            ]}
                          />
                          {/* Top edge highlight gradient */}
                          <LinearGradient
                            colors={
                              true
                                ? ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.03)', 'transparent']
                                : ['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.15)', 'transparent']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 0.5 }}
                            style={StyleSheet.absoluteFillObject}
                            pointerEvents="none"
                          />
                          {/* Bottom subtle shine */}
                          <LinearGradient
                            colors={
                              true
                                ? ['transparent', 'rgba(255, 255, 255, 0.04)']
                                : ['transparent', 'rgba(255, 255, 255, 0.25)']
                            }
                            start={{ x: 0, y: 0.6 }}
                            end={{ x: 0, y: 1 }}
                            style={StyleSheet.absoluteFillObject}
                            pointerEvents="none"
                          />
                        </RNCBlurView>
                        {/* Card Content */}
                        <View style={styles.serviceCardGlass}>
                          {/* Icon */}
                          <LinearGradient
                            colors={[gradientStart, gradientEnd]}
                            style={styles.serviceIcon}
                          >
                            <Ionicons name={iconName} size={28} color="#FFFFFF" />
                          </LinearGradient>
                          {/* Service Name */}
                          <Text style={[styles.serviceName, { color: colors.text }]} numberOfLines={2}>
                            {serviceName}
                          </Text>
                          {/* Description */}
                          <Text style={[styles.serviceDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                            {serviceDesc}
                          </Text>
                          {/* Status Badge */}
                          {isActive && (
                            <View style={[styles.statusBadge, { backgroundColor: `${Colors.green[500]}20`, borderColor: `${Colors.green[500]}30` }]}>
                              <Ionicons name="checkmark-circle" size={14} color={Colors.green[500]} />
                              <Text style={[styles.statusText, { color: Colors.green[500] }]}>
                                {language === 'en' ? 'Active' : 'Aktif'} - {status?.package?.toUpperCase()}
                              </Text>
                            </View>
                          )}
                          {status && status.status === 'pending' && (
                            <View style={[styles.statusBadge, { backgroundColor: `${Colors.yellow[500]}20`, borderColor: `${Colors.yellow[500]}30` }]}>
                              <Ionicons name="time" size={14} color={Colors.yellow[500]} />
                              <Text style={[styles.statusText, { color: Colors.yellow[500] }]}>
                                {language === 'en' ? 'Pending' : 'Beklemede'}
                              </Text>
                            </View>
                          )}
                          {status && status.status === 'rejected' && (
                            <View style={[styles.statusBadge, { backgroundColor: `${Colors.red[500]}20`, borderColor: `${Colors.red[500]}30` }]}>
                              <Ionicons name="close-circle" size={14} color={Colors.red[500]} />
                              <Text style={[styles.statusText, { color: Colors.red[500] }]}>
                                {language === 'en' ? 'Rejected' : 'Reddedildi'}
                              </Text>
                            </View>
                          )}
                          {isInMaintenance && (
                            <View style={[styles.statusBadge, { backgroundColor: `${Colors.orange[500]}20`, borderColor: `${Colors.orange[500]}30` }]}>
                              <Ionicons name="construct" size={14} color={Colors.orange[500]} />
                              <Text style={[styles.statusText, { color: Colors.orange[500] }]}>
                                {language === 'en' ? 'Maintenance' : 'Bakımda'}
                              </Text>
                            </View>
                          )}
                          {/* Action Button */}
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              {
                                backgroundColor: isActive
                                  ? `${Colors.blue[500]}20`
                                  : isInMaintenance
                                  ? `${Colors.gray[500]}20`
                                  : `${Colors.green[500]}20`,
                              },
                            ]}
                            disabled={isInMaintenance}
                            activeOpacity={0.7}
                            onPress={() => {
                              if (!isActive && !isInMaintenance) {
                                handleRequestService(service);
                              }
                            }}
                          >
                            <Text
                              style={[
                                styles.actionButtonText,
                                {
                                  color: isActive
                                    ? Colors.blue[500]
                                    : isInMaintenance
                                    ? Colors.gray[500]
                                    : Colors.green[500],
                                },
                              ]}
                            >
                              {isActive
                                ? (language === 'en' ? 'View Dashboard' : 'Paneli Gör')
                                : isInMaintenance
                                ? (language === 'en' ? 'Under Maintenance' : 'Bakımda')
                                : (language === 'en' ? 'Request Service' : 'Servis Talep Et')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                </AnimatedTouchable>
              );
            })}
          </View>
        </ScrollView>
        {/* Request Service Modal */}
        <RequestServiceModal
          visible={modalVisible}
          service={selectedService}
          onClose={() => {
            setModalVisible(false);
            setSelectedService(null);
          }}
          onSubmit={handleSubmitRequest}
        />
      </View>
    </PageTransition>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing['5xl'],
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
  },
  filtersContainer: {
    marginBottom: Spacing.xl,
  },
  filtersContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  filterButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  servicesGrid: {
    gap: Spacing.lg,
  },
  serviceCardWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  serviceCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  serviceCardGlass: {
    padding: Spacing.lg,
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  serviceName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  serviceDescription: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeight.sm * 1.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  actionButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});
