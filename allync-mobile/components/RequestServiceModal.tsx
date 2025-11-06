import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView, RNCBlurView } from './BlurViewCompat';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';
import type { Service } from '../lib/api/services';
import GlassSurface from './GlassSurface';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
interface RequestServiceModalProps {
  visible: boolean;
  service: Service | null;
  onClose: () => void;
  onSubmit: (packageType: 'basic' | 'pro' | 'premium', notes: string) => Promise<void>;
}
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
export default function RequestServiceModal({
  visible,
  service,
  onClose,
  onSubmit,
}: RequestServiceModalProps) {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'pro' | 'premium'>('pro');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successScale = useSharedValue(0);
  useEffect(() => {
    if (showSuccess) {
      successScale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      );
    } else {
      successScale.value = 0;
    }
  }, [showSuccess]);
  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));
  const handleSubmit = async () => {
    if (!service) return;
    setIsSubmitting(true);
    try {
      await onSubmit(selectedPackage, notes);
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setNotes('');
        setSelectedPackage('pro');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting request:', error);
      setIsSubmitting(false);
    }
  };
  if (!service || !visible) return null;
  // Helper function to safely parse pricing data
  const parsePricing = (pricingData: any) => {
    if (!pricingData) return null;
    if (typeof pricingData === 'object' && !Array.isArray(pricingData)) {
      return pricingData;
    }
    if (typeof pricingData === 'string') {
      try {
        return JSON.parse(pricingData);
      } catch {
        return null;
      }
    }
    return null;
  };
  const basicPricing = parsePricing(service.pricing_basic);
  const standardPricing = parsePricing(service.pricing_standard);
  const premiumPricing = parsePricing(service.pricing_premium);
  const basicFeatures = Array.isArray(basicPricing?.features_en)
    ? basicPricing.features_en
    : ['Standard features', 'Email support', 'Monthly reports', 'Basic analytics'];
  const standardFeatures = Array.isArray(standardPricing?.features_en)
    ? standardPricing.features_en
    : ['All Basic features', 'Priority support', 'Weekly reports', 'Advanced analytics', 'API access'];
  const premiumFeatures = Array.isArray(premiumPricing?.features_en)
    ? premiumPricing.features_en
    : ['All Standard features', '24/7 dedicated support', 'Daily reports', 'Custom integrations', 'SLA guarantee', 'Dedicated account manager'];
  const packages = [
    {
      id: 'basic' as const,
      name: 'Basic',
      icon: 'flash' as const,
      price: basicPricing?.price || 0,
      gradientColors: ['#6b7280', '#4b5563'],
      features: basicFeatures,
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      icon: 'star' as const,
      price: standardPricing?.price || 0,
      gradientColors: [Colors.blue[500], Colors.blue[700]],
      features: standardFeatures,
      popular: true,
    },
    {
      id: 'premium' as const,
      name: 'Premium',
      icon: 'trophy' as const,
      price: premiumPricing?.price || 0,
      gradientColors: [Colors.purple[500], Colors.purple[700]],
      features: premiumFeatures,
    },
  ];
  const serviceName = language === 'en' ? service.name_en : service.name_tr;
  const selectedPkg = packages.find(p => p.id === selectedPackage);
  // Success Screen
  if (showSuccess) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        <StatusBar barStyle="light-content" />
        {/* Glass backdrop overlay */}
        <GlassSurface
          style={StyleSheet.absoluteFillObject}
          borderRadius={0}
          borderWidth={0}
          opacity={0.9}
          brightness={10}
          theme="dark"
        />
        <Animated.View style={[styles.successContainer, successAnimatedStyle]}>
          <View
            style={[
              styles.successCard,
              {
                backgroundColor: 'rgba(43, 44, 44, 0.3)',
                borderColor: Colors.green[500] + '50',
              },
            ]}
          >
            <View style={styles.successIconWrapper}>
              <LinearGradient
                colors={[Colors.green[500], Colors.green[600]]}
                style={styles.successIconGradient}
              >
                <Ionicons name="checkmark-circle" size={64} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>
              {language === 'en' ? 'Request Submitted!' : 'Talep Gönderildi!'}
            </Text>
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              {language === 'en'
                ? 'Your service request has been sent successfully. We will review it shortly.'
                : 'Servis talebiniz başarıyla gönderildi. Kısa süre içinde incelenecektir.'}
            </Text>
          </View>
        </Animated.View>
      </Modal>
    );
  }
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      {/* Glass backdrop overlay */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={StyleSheet.absoluteFillObject}
      >
        <GlassSurface
          style={StyleSheet.absoluteFillObject}
          borderRadius={0}
          borderWidth={0}
          opacity={0.85}
          brightness={10}
          theme="dark"
        />
      </TouchableOpacity>
      <Animated.View
        entering={SlideInDown.duration(350).damping(18).stiffness(90)}
        exiting={SlideOutDown.duration(250)}
        style={styles.fullScreenModal}
      >
        <TouchableOpacity activeOpacity={1} style={styles.glassContainer} onPress={(e) => e.stopPropagation()}>
          {/* Glassmorphism background */}
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={95}
              tint={'dark'}
              style={styles.glassBlur}
            >
              <View style={[styles.glassTint, { backgroundColor: 'rgba(43, 44, 44, 0.3)' }]} />
            </BlurView>
          ) : (
            // Android: Real blur with RNC BlurView
            <RNCBlurView
              style={styles.glassBlur}
              blurType={'dark'}
              blurAmount={5}
              reducedTransparencyFallbackColor={'rgba(10, 14, 39, 0.85)'}
            >
              <View style={[styles.glassTint, { backgroundColor: 'rgba(10, 14, 39, 0.45)' }]} />
            </RNCBlurView>
          )}
            {/* Content */}
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: true ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
                <View style={styles.headerLeft}>
                  <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {language === 'en' ? 'Request Service' : 'Servis Talep Et'}
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    {serviceName}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeButton, { backgroundColor: 'rgba(43, 44, 44, 0.3)' }]}
                >
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Package Selection */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {language === 'en' ? 'Select Package' : 'Paket Seçin'}
                  </Text>
                  <View style={styles.packagesGrid}>
                    {packages.map((pkg, index) => {
                      const isSelected = selectedPackage === pkg.id;
                      return (
                        <AnimatedTouchable
                          key={pkg.id}
                          entering={FadeIn.duration(300).delay(index * 80)}
                          onPress={() => setSelectedPackage(pkg.id)}
                          activeOpacity={0.7}
                          style={[
                            styles.packageCard,
                            {
                              backgroundColor: isSelected
                                ? (true ? Colors.blue[500] + '25' : Colors.blue[500] + '20')
                                : (true ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'),
                              borderColor: isSelected
                                ? Colors.blue[500]
                                : (true ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'),
                              borderWidth: isSelected ? 2 : 1,
                            },
                          ]}
                        >
                          {pkg.popular && (
                            <View style={styles.popularBadge}>
                              <LinearGradient
                                colors={[Colors.blue[500], Colors.blue[600]]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.popularBadgeGradient}
                              >
                                <Ionicons name="star" size={10} color="#FFFFFF" style={{ marginRight: 4 }} />
                                <Text style={styles.popularBadgeText}>
                                  {language === 'en' ? 'POPULAR' : 'POPÜLER'}
                                </Text>
                              </LinearGradient>
                            </View>
                          )}
                          <LinearGradient
                            colors={pkg.gradientColors}
                            style={styles.packageIconGradient}
                          >
                            <Ionicons name={pkg.icon} size={24} color="#FFFFFF" />
                          </LinearGradient>
                          <Text style={[styles.packageName, { color: colors.text }]}>
                            {pkg.name}
                          </Text>
                          <View style={styles.priceContainer}>
                            <Text style={[styles.priceLabel, { color: Colors.blue[500] }]}>
                              {language === 'en' ? 'Contact for pricing' : 'Fiyat için iletişim'}
                            </Text>
                          </View>
                          <View style={styles.featuresList}>
                            {pkg.features.map((feature, idx) => (
                              <View key={idx} style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={14} color={Colors.green[500]} />
                                <Text style={[styles.featureText, { color: colors.textSecondary }]} numberOfLines={1}>
                                  {feature}
                                </Text>
                              </View>
                            ))}
                          </View>
                          {isSelected && (
                            <View style={[styles.selectedBadge, { backgroundColor: Colors.blue[500] }]}>
                              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                              <Text style={styles.selectedText}>
                                {language === 'en' ? 'Selected' : 'Seçildi'}
                              </Text>
                            </View>
                          )}
                        </AnimatedTouchable>
                      );
                    })}
                  </View>
                </View>
                {/* Notes Section */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {language === 'en' ? 'Additional Notes' : 'Ek Notlar'}{' '}
                    <Text style={[styles.optionalText, { color: colors.textSecondary }]}>
                      ({language === 'en' ? 'Optional' : 'Opsiyonel'})
                    </Text>
                  </Text>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder={
                      language === 'en'
                        ? 'Any specific requirements or questions...'
                        : 'Özel gereksinimler veya sorular...'
                    }
                    placeholderTextColor={colors.textSecondary + '80'}
                    multiline
                    numberOfLines={4}
                    style={[
                      styles.notesInput,
                      {
                        color: colors.text,
                        backgroundColor: 'rgba(43, 44, 44, 0.3)',
                        borderColor: true ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                      },
                    ]}
                  />
                </View>
                {/* Summary Section */}
                <View
                  style={[
                    styles.summaryCard,
                    {
                      backgroundColor: 'rgba(43, 44, 44, 0.3)',
                      borderColor: Colors.blue[500] + '30',
                    },
                  ]}
                >
                  <Text style={[styles.summaryTitle, { color: colors.text }]}>
                    {language === 'en' ? 'Request Summary' : 'Talep Özeti'}
                  </Text>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      {language === 'en' ? 'Service:' : 'Servis:'}
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={1}>
                      {serviceName}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      {language === 'en' ? 'Package:' : 'Paket:'}
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {selectedPkg?.name}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      {language === 'en' ? 'Monthly Cost:' : 'Aylık Maliyet:'}
                    </Text>
                    <Text style={[styles.summaryValue, { color: Colors.green[500], fontWeight: 'bold' }]}>
                      ${selectedPkg?.price || 0}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      {language === 'en' ? 'Delivery Time:' : 'Teslimat Süresi:'}
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {(() => {
                        try {
                          if (!service.metadata) return language === 'en' ? '1-2 weeks' : '1-2 hafta';
                          const metadata = typeof service.metadata === 'string' ? JSON.parse(service.metadata) : service.metadata;
                          return metadata?.delivery_time || (language === 'en' ? '1-2 weeks' : '1-2 hafta');
                        } catch {
                          return language === 'en' ? '1-2 weeks' : '1-2 hafta';
                        }
                      })()}
                    </Text>
                  </View>
                </View>
              </ScrollView>
              {/* Action Buttons */}
              <View style={[styles.footer, { borderTopColor: true ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { backgroundColor: 'rgba(43, 44, 44, 0.3)' },
                  ]}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                    {language === 'en' ? 'Cancel' : 'İptal'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                  style={[styles.button, styles.submitButton]}
                >
                  <LinearGradient
                    colors={isSubmitting ? ['#6b7280', '#4b5563'] : [Colors.green[500], Colors.green[600]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.submitButtonText}>
                          {language === 'en' ? 'Submit Request' : 'Talebi Gönder'}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenModal: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  glassContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  glassBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  glassTint: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  optionalText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal,
  },
  packagesGrid: {
    gap: Spacing.md,
  },
  packageCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    zIndex: 10,
  },
  popularBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  packageIconGradient: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  packageName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  priceContainer: {
    marginBottom: Spacing.md,
  },
  priceLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  featuresList: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  featureText: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  notesInput: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
  },
  summaryValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl + 20 : Spacing.xl,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  submitButton: {
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  successContainer: {
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  successCard: {
    padding: Spacing['3xl'],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 2,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.green[500],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  successIconWrapper: {
    marginBottom: Spacing.xl,
  },
  successIconGradient: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.base * 1.5,
  },
});
