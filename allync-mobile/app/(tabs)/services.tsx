import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useServiceNavigation } from '../../contexts/ServiceNavigationContext';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import RequestServiceModal from '../../components/RequestServiceModal';
import ServicesSkeleton from '../../components/skeletons/ServicesSkeleton';
import MobileAppServiceView from '../../components/services/MobileAppServiceView';
import WebsiteDevelopmentView from '../../components/services/WebsiteDevelopmentView';
import WhatsAppServiceView from '../../components/services/WhatsAppServiceView';
import MeshGlowBackground from '../../components/MeshGlowBackground';
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
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { selectedServiceDetail, setSelectedServiceDetail } = useServiceNavigation();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [services, setServices] = useState<Service[]>([]);
  const [companyServices, setCompanyServices] = useState<CompanyService[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState<ServiceRequest | null>(null);
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

  const handleViewRejectionReason = (request: ServiceRequest) => {
    setSelectedRejectionReason(request);
    setShowRejectionModal(true);
  };

  const handleRequestAgain = (service: Service) => {
    setShowRejectionModal(false);
    setSelectedRejectionReason(null);
    handleRequestService(service);
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
  // If a service detail is selected, show the detail view
  if (selectedServiceDetail) {
    if (selectedServiceDetail.type === 'mobile-app') {
      return (
        <View style={styles.container}>
          <MobileAppServiceView
            serviceId={selectedServiceDetail.serviceId}
            onBack={() => setSelectedServiceDetail(null)}
          />
        </View>
      );
    }
    if (selectedServiceDetail.type === 'website') {
      return (
        <View style={styles.container}>
          <WebsiteDevelopmentView
            serviceId={selectedServiceDetail.serviceId}
            onBack={() => setSelectedServiceDetail(null)}
          />
        </View>
      );
    }
    if (selectedServiceDetail.type === 'whatsapp') {
      return (
        <View style={styles.container}>
          <WhatsAppServiceView
            serviceId={selectedServiceDetail.serviceId}
            onBack={() => setSelectedServiceDetail(null)}
          />
        </View>
      );
    }
    // For other service types, show placeholder for now
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedServiceDetail(null)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Back to Services</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Service Details
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Service detail view coming soon...
          </Text>
        </ScrollView>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ServicesSkeleton />
      </View>
    );
  }
  const categoryButtons: { key: Category; labelEn: string; labelTr: string }[] = [
    { key: 'all', labelEn: 'All Services', labelTr: 'Tüm Servisler' },
    { key: 'ai', labelEn: 'AI Services', labelTr: 'AI Servisleri' },
    { key: 'digital', labelEn: 'Digital', labelTr: 'Dijital' },
  ];
  return (
    <MeshGlowBackground>
      <View style={styles.container}>
        {/* Sticky Header */}
        <View style={styles.stickyHeader}>
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
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue[500]} />
          }
        >
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
                  onPress={() => {
                    if (isActive) {
                      const companyService = companyServices.find(cs => cs.service_type_id === service.id);
                      if (companyService) {
                        const slug = service.slug;
                        if (slug === 'mobile-app-development') {
                          setSelectedServiceDetail({ type: 'mobile-app', serviceId: companyService.id });
                        } else if (slug === 'website-development') {
                          setSelectedServiceDetail({ type: 'website', serviceId: companyService.id });
                        } else if (slug === 'whatsapp-automation' || slug === 'whatsapp-service') {
                          setSelectedServiceDetail({ type: 'whatsapp', serviceId: companyService.id });
                        }
                      }
                    }
                  }}
                >
                  <BlurView intensity={20} tint="dark" style={styles.serviceCardBlur}>
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
                          <>
                            <View style={[styles.statusBadge, { backgroundColor: `${Colors.red[500]}20`, borderColor: `${Colors.red[500]}30` }]}>
                              <Ionicons name="close-circle" size={14} color={Colors.red[500]} />
                              <Text style={[styles.statusText, { color: Colors.red[500] }]}>
                                {language === 'en' ? 'Rejected' : 'Reddedildi'}
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={[
                                styles.rejectionButton,
                                {
                                  backgroundColor: `${Colors.red[500]}10`,
                                  borderColor: `${Colors.red[500]}30`,
                                },
                              ]}
                              activeOpacity={0.7}
                              onPress={() => handleViewRejectionReason(status)}
                            >
                              <Text style={[styles.rejectionButtonText, { color: Colors.red[400] }]}>
                                {language === 'en' ? 'View Rejection Reason' : 'Red Sebebini Gör'}
                              </Text>
                            </TouchableOpacity>
                          </>
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
                        {!isActive && !isInMaintenance && !status && (
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              {
                                backgroundColor: Colors.green[500],
                              },
                            ]}
                            activeOpacity={0.7}
                            onPress={() => handleRequestService(service)}
                          >
                            <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                              {language === 'en' ? 'Request Service' : 'Servis Talep Et'}
                            </Text>
                          </TouchableOpacity>
                        )}
                        {status && status.status === 'rejected' && (
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              {
                                backgroundColor: Colors.orange[600],
                              },
                            ]}
                            activeOpacity={0.7}
                            onPress={() => handleRequestAgain(service)}
                          >
                            <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                              {language === 'en' ? 'Request Again' : 'Tekrar Talep Et'}
                            </Text>
                          </TouchableOpacity>
                        )}
                        {status && status.status === 'pending' && (
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              {
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                              },
                            ]}
                            disabled
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
                              {language === 'en' ? 'Request Pending' : 'Talep Beklemede'}
                            </Text>
                          </TouchableOpacity>
                        )}
                        {isActive && (
                          <>
                            <TouchableOpacity
                              style={[
                                styles.actionButton,
                                {
                                  backgroundColor: Colors.blue[500],
                                },
                              ]}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                                {language === 'en' ? 'View Dashboard' : 'Paneli Gör'}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.secondaryActionButton,
                                {
                                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                  borderColor: 'rgba(255, 255, 255, 0.2)',
                                },
                              ]}
                              activeOpacity={0.7}
                              onPress={() => handleRequestService(service)}
                            >
                              <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                              <Text style={[styles.secondaryActionButtonText, { color: '#FFFFFF' }]}>
                                {language === 'en' ? 'Request Another Instance' : 'Yeni Örnek Talep Et'}
                              </Text>
                            </TouchableOpacity>
                          </>
                        )}
                        {isInMaintenance && (
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              {
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                              },
                            ]}
                            disabled
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
                              {language === 'en' ? 'Under Maintenance' : 'Bakımda'}
                            </Text>
                          </TouchableOpacity>
                        )}
                    </View>
                  </BlurView>
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

        {/* Rejection Reason Modal */}
        {showRejectionModal && selectedRejectionReason && (
          <Modal
            visible={showRejectionModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowRejectionModal(false)}
          >
            <View style={styles.modalOverlay}>
              <TouchableOpacity
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                activeOpacity={1}
                onPress={() => setShowRejectionModal(false)}
              />
              <BlurView intensity={20} tint="dark" style={styles.modalContent}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="close-circle" size={24} color={Colors.red[500]} />
                    <Text style={styles.modalTitle}>
                      {language === 'en' ? 'Service Request Rejected' : 'Servis Talebi Reddedildi'}
                    </Text>
                  </View>
                  <Text style={styles.modalSubtitle}>
                    {services.find(s => s.id === selectedRejectionReason.service_type_id)?.name_en || 'Service'}
                  </Text>
                </View>

                {/* Modal Body */}
                <View style={styles.modalBody}>
                  {/* Warning */}
                  <View style={styles.modalWarning}>
                    <Text style={styles.modalWarningText}>
                      ⚠️ {language === 'en'
                        ? 'Your service request has been rejected by the Super Admin. Please review the reason below and make necessary adjustments before requesting again.'
                        : 'Servis talebiniz Süper Yönetici tarafından reddedildi. Lütfen aşağıdaki nedeni inceleyin ve tekrar talep etmeden önce gerekli ayarlamaları yapın.'}
                    </Text>
                  </View>

                  {/* Rejection Reason */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionLabel}>
                      {language === 'en' ? 'Rejection Reason:' : 'Red Nedeni:'}
                    </Text>
                    <View style={styles.modalReasonBox}>
                      <Text style={styles.modalReasonText}>
                        {selectedRejectionReason.admin_notes || (language === 'en' ? 'No reason provided' : 'Neden belirtilmedi')}
                      </Text>
                    </View>
                  </View>

                  {/* Info */}
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalInfoText}>
                      💡 {language === 'en'
                        ? 'You can request this service again after addressing the concerns mentioned above.'
                        : 'Yukarıda belirtilen endişeleri giderdikten sonra bu servisi tekrar talep edebilirsiniz.'}
                    </Text>
                  </View>
                </View>

                {/* Modal Footer */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
                    activeOpacity={0.7}
                    onPress={() => setShowRejectionModal(false)}
                  >
                    <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                      {language === 'en' ? 'Close' : 'Kapat'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: Colors.green[600] }]}
                    activeOpacity={0.7}
                    onPress={() => {
                      const service = services.find(s => s.id === selectedRejectionReason.service_type_id);
                      if (service) handleRequestAgain(service);
                    }}
                  >
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                      {language === 'en' ? 'Request Again' : 'Tekrar Talep Et'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </Modal>
        )}
      </View>
    </MeshGlowBackground>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    backgroundColor: '#0B1429',
    paddingTop: Spacing['5xl'],
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
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
    marginBottom: Spacing.md,
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
    marginTop: Spacing.sm,
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
    marginBottom: Spacing.md,
  },
  serviceCardBlur: {
    padding: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
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
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  secondaryActionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  rejectionButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  rejectionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#0B1429',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  modalBody: {
    padding: Spacing.lg,
  },
  modalWarning: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modalWarningText: {
    fontSize: Typography.fontSize.sm,
    color: '#EF4444',
    lineHeight: Typography.lineHeight.sm * 1.3,
  },
  modalSection: {
    marginBottom: Spacing.lg,
  },
  modalSectionLabel: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: Spacing.sm,
  },
  modalReasonBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  modalReasonText: {
    fontSize: Typography.fontSize.base,
    color: '#FFFFFF',
    lineHeight: Typography.lineHeight.base * 1.4,
  },
  modalInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  modalInfoText: {
    fontSize: Typography.fontSize.sm,
    color: '#3B82F6',
    lineHeight: Typography.lineHeight.sm * 1.3,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});
