import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/Colors';
import GlassSurface from './GlassSurface';
import {
  formatCurrency,
  formatDate,
  getInvoiceStatusColor,
  getPaymentGatewayName,
  type Invoice,
} from '../lib/api/invoices';

interface InvoicePreviewModalProps {
  invoice: Invoice | null;
  visible: boolean;
  onClose: () => void;
}

export default function InvoicePreviewModal({ invoice, visible, onClose }: InvoicePreviewModalProps) {
  const { colors } = useTheme();

  if (!invoice) return null;

  const statusColors = getInvoiceStatusColor(invoice.status);
  const fullAddress = [
    invoice.company?.address,
    invoice.company?.city,
    invoice.company?.postal_code,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)} style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          activeOpacity={1}
        />
        <Animated.View
          entering={FadeIn.duration(300).delay(100)}
          exiting={FadeOut.duration(200)}
          style={styles.modalContent}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ flex: 1 }}
          >
            <GlassSurface style={styles.modalGlass}>
              {/* Header with Close Button */}
              <View style={styles.header}>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>INVOICE</Text>
                <Text style={[styles.invoiceNumber, { color: colors.text }]}>{invoice.invoice_number}</Text>
              </View>
              <View style={styles.headerRight}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColors.bg, borderColor: statusColors.border },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColors.text }]}>
                    {invoice.status.toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
              >
              {/* Invoice Details & Bill To */}
              <View style={styles.infoSection}>
                {/* Invoice Details Card */}
                <View style={[styles.detailsCard, { backgroundColor: 'rgba(0, 217, 255, 0.1)' }]}>
                  <LinearGradient
                    colors={['rgba(0, 217, 255, 0.2)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.detailsContent}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Invoice Number</Text>
                      <Text style={[styles.detailValue, { color: colors.text, fontFamily: 'monospace' }]}>
                        {invoice.invoice_number}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Issue Date</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {formatDate(invoice.issue_date)}
                      </Text>
                    </View>

                    {invoice.due_date && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Due Date</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>
                          {formatDate(invoice.due_date)}
                        </Text>
                      </View>
                    )}

                    {invoice.paid_at && invoice.status === 'paid' && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Paid Date</Text>
                        <Text style={[styles.detailValue, { color: Colors.green[500], fontWeight: '700' }]}>
                          {formatDate(invoice.paid_at)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Bill To Card */}
                <View style={[styles.billToCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                  <Text style={[styles.billToTitle, { color: colors.textSecondary }]}>BILL TO</Text>
                  <Text style={[styles.companyName, { color: colors.text }]}>{invoice.company?.name || 'N/A'}</Text>

                  <View style={styles.companyDetail}>
                    <Ionicons name="mail" size={14} color={colors.textSecondary} />
                    <Text style={[styles.companyDetailText, { color: colors.text }]}>
                      {invoice.company?.email || 'N/A'}
                    </Text>
                  </View>

                  {invoice.company?.phone && (
                    <View style={styles.companyDetail}>
                      <Ionicons name="call" size={14} color={colors.textSecondary} />
                      <Text style={[styles.companyDetailText, { color: colors.text }]}>
                        {invoice.company.phone}
                      </Text>
                    </View>
                  )}

                  {fullAddress && (
                    <View style={styles.companyDetail}>
                      <Ionicons name="location" size={14} color={colors.textSecondary} />
                      <Text style={[styles.companyDetailText, { color: colors.text }]}>{fullAddress}</Text>
                    </View>
                  )}

                  {invoice.company?.tax_id && (
                    <View style={styles.companyDetail}>
                      <Ionicons name="document-text" size={14} color={colors.textSecondary} />
                      <Text style={[styles.companyDetailText, { color: colors.text }]}>
                        Tax ID: {invoice.company.tax_id}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Amount Breakdown */}
              <View style={styles.breakdownSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Amount Breakdown</Text>
                <GlassSurface style={styles.breakdownCard}>
                  <View style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                    <Text style={[styles.breakdownValue, { color: colors.text }]}>
                      {formatCurrency(invoice.subtotal, invoice.currency)}
                    </Text>
                  </View>

                  {invoice.tax_amount && invoice.tax_amount > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                        Tax {invoice.tax_rate ? `(${invoice.tax_rate}%)` : ''}
                      </Text>
                      <Text style={[styles.breakdownValue, { color: colors.text }]}>
                        {formatCurrency(invoice.tax_amount, invoice.currency)}
                      </Text>
                    </View>
                  )}

                  {invoice.discount_amount && invoice.discount_amount > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Discount</Text>
                      <Text style={[styles.breakdownValue, { color: Colors.green[500] }]}>
                        -{formatCurrency(invoice.discount_amount, invoice.currency)}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.separator, { backgroundColor: 'rgba(0, 217, 255, 0.3)' }]} />

                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: colors.text }]}>TOTAL</Text>
                    <LinearGradient
                      colors={['#00d9ff', '#b537f2']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.totalValueContainer}
                    >
                      <Text style={styles.totalValue}>{formatCurrency(invoice.total_amount, invoice.currency)}</Text>
                    </LinearGradient>
                  </View>
                </GlassSurface>
              </View>

              {/* Payment Information (if paid) */}
              {invoice.status === 'paid' && invoice.payment_gateway && (
                <View style={styles.paymentSection}>
                  <View style={[styles.paymentCard, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                    <View style={styles.paymentHeader}>
                      <Ionicons name="checkmark-circle" size={24} color={Colors.green[500]} />
                      <Text style={[styles.paymentTitle, { color: Colors.green[500] }]}>PAYMENT CONFIRMED</Text>
                    </View>

                    <View style={styles.paymentDetail}>
                      <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>Payment Method</Text>
                      <Text style={[styles.paymentValue, { color: Colors.green[600] }]}>
                        {getPaymentGatewayName(invoice.payment_gateway)}
                      </Text>
                    </View>

                    {invoice.gateway_payment_id && (
                      <View style={styles.paymentDetail}>
                        <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>Payment ID</Text>
                        <Text style={[styles.paymentValue, { color: Colors.green[600], fontFamily: 'monospace' }]}>
                          {invoice.gateway_payment_id}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Notes */}
              {invoice.notes && (
                <View style={styles.notesSection}>
                  <View style={[styles.notesCard, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                    <View style={styles.notesHeader}>
                      <Ionicons name="document-text" size={20} color={Colors.orange[500]} />
                      <Text style={[styles.notesTitle, { color: Colors.orange[500] }]}>NOTES</Text>
                    </View>
                    <Text style={[styles.notesText, { color: colors.text }]}>{invoice.notes}</Text>
                  </View>
                </View>
              )}

              {/* Thank You Message */}
              <View style={styles.thankYouSection}>
                <Text style={[styles.thankYouTitle, { color: colors.text }]}>Thank you for your business!</Text>
                <Text style={[styles.thankYouText, { color: colors.textSecondary }]}>
                  If you have any questions about this invoice, please contact us
                </Text>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <LinearGradient
                  colors={['#00d9ff', '#b537f2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.footerGradient}
                >
                  <Text style={styles.footerBrand}>Allync AI</Text>
                </LinearGradient>
                <Text style={[styles.footerCopyright, { color: colors.textSecondary }]}>
                  © 2025 Allync AI. All rights reserved.
                </Text>
              </View>
              </ScrollView>
            </GlassSurface>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
    padding: 0,
  },
  modalContent: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  modalGlass: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 217, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
    fontFamily: 'monospace',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  infoSection: {
    gap: 16,
    marginBottom: 24,
  },
  detailsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#00d9ff',
  },
  detailsContent: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  billToCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  billToTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  companyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  companyDetailText: {
    fontSize: 14,
    flex: 1,
  },
  breakdownSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  breakdownCard: {
    padding: 20,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  separator: {
    height: 2,
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  totalValueContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  paymentSection: {
    marginBottom: 24,
  },
  paymentCard: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.green[500],
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  paymentDetail: {
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesCard: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.orange[500],
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 22,
  },
  thankYouSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  thankYouTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  thankYouText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  footerBrand: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  footerCopyright: {
    fontSize: 12,
  },
});
