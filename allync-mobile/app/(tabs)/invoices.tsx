import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import GlassSurface from '../../components/GlassSurface';
import InvoicesSkeleton from '../../components/skeletons/InvoicesSkeleton';
import InvoicePreviewModal from '../../components/InvoicePreviewModal';
import {
  getInvoicesByCompany,
  formatCurrency,
  getInvoiceStatusColor,
  formatDate,
  type Invoice,
} from '../../lib/api/invoices';
import { getUserCompanyId } from '../../lib/api/dashboard';

type FilterStatus = 'all' | 'paid' | 'pending' | 'overdue';

export default function Invoices() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchCompanyId();
    }
  }, [user?.id]);

  useEffect(() => {
    if (companyId) {
      fetchInvoices();
    }
  }, [companyId]);

  const fetchCompanyId = async () => {
    if (!user?.id) return;
    const id = await getUserCompanyId(user.id);
    setCompanyId(id);
  };

  const fetchInvoices = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const data = await getInvoicesByCompany(companyId);
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvoices();
    setRefreshing(false);
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === 'all') return true;
    return inv.status === filterStatus;
  });

  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0);
  const totalPending = invoices.filter((i) => i.status === 'pending').reduce((sum, i) => sum + i.total_amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'overdue':
        return 'alert-circle';
      default:
        return 'document';
    }
  };

  if (loading) {
    return <InvoicesSkeleton />;
  }

  return (
    <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue[500]} />}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Invoices</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Manage your billing and payments
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <GlassSurface style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.green[500]} />
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Paid</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(totalPaid)}</Text>
            </GlassSurface>

            <GlassSurface style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]}>
                <Ionicons name="time" size={24} color={Colors.orange[500]} />
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(totalPending)}</Text>
            </GlassSurface>
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            {(['all', 'paid', 'pending', 'overdue'] as FilterStatus[]).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: filterStatus === status ? Colors.blue[500] : 'rgba(255, 255, 255, 0.05)',
                  },
                ]}
                onPress={() => setFilterStatus(status)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    {
                      color: filterStatus === status ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: filterStatus === status ? '700' : '500',
                    },
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Invoices List */}
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => {
              const statusColors = getInvoiceStatusColor(invoice.status);
              return (
                <GlassSurface key={invoice.id} style={styles.invoiceCard}>
                  <View style={styles.invoiceHeader}>
                    <View style={styles.invoiceInfo}>
                      <Text style={[styles.invoiceNumber, { color: colors.text }]}>{invoice.invoice_number}</Text>
                      <Text style={[styles.invoiceDate, { color: colors.textSecondary }]}>
                        {formatDate(invoice.issue_date)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusColors.bg,
                          borderColor: statusColors.border,
                        },
                      ]}
                    >
                      <Ionicons name={getStatusIcon(invoice.status)} size={14} color={statusColors.text} />
                      <Text style={[styles.statusText, { color: statusColors.text }]}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.invoiceAmount}>
                    <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Amount</Text>
                    <Text style={[styles.amountValue, { color: colors.text }]}>
                      {formatCurrency(invoice.total_amount, invoice.currency)}
                    </Text>
                  </View>

                  {invoice.due_date && (
                    <View style={styles.dueDate}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.dueDateText, { color: colors.textSecondary }]}>
                        Due: {formatDate(invoice.due_date)}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.viewButton, { backgroundColor: Colors.blue[500] }]}
                    onPress={() => {
                      setSelectedInvoice(invoice);
                      setShowDetailsModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                </GlassSurface>
              );
            })
          ) : (
            <GlassSurface style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No invoices found</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {filterStatus !== 'all' ? 'Try adjusting your filter' : 'Invoices will appear here when created'}
              </Text>
            </GlassSurface>
          )}
        </ScrollView>

        {/* Invoice Details Modal */}
        <Modal
          visible={showDetailsModal && !!selectedInvoice}
          transparent
          animationType="none"
          onRequestClose={() => {
            setSelectedInvoice(null);
            setShowDetailsModal(false);
          }}
        >
          {selectedInvoice && (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              style={styles.modalOverlay}
            >
              <TouchableOpacity
                style={StyleSheet.absoluteFillObject}
                onPress={() => {
                  setSelectedInvoice(null);
                  setShowDetailsModal(false);
                }}
                activeOpacity={1}
              />
              <Animated.View
                entering={SlideInDown.duration(400).springify()}
                exiting={SlideOutDown.duration(300)}
                style={styles.modalContent}
              >
                <GlassSurface style={styles.modalGlass}>
                  <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Invoice Details</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedInvoice(null);
                      setShowDetailsModal(false);
                    }}
                    style={styles.closeButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={32} color={Colors.red[500]} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalStatusContainer}>
                    <View
                      style={[
                        styles.modalStatusBadge,
                        {
                          backgroundColor: getInvoiceStatusColor(selectedInvoice.status || 'pending').bg,
                          borderColor: getInvoiceStatusColor(selectedInvoice.status || 'pending').border,
                        },
                      ]}
                    >
                    <Ionicons
                      name={getStatusIcon(selectedInvoice.status || 'pending')}
                      size={16}
                      color={getInvoiceStatusColor(selectedInvoice.status || 'pending').text}
                    />
                    <Text
                      style={[
                        styles.modalStatusText,
                        { color: getInvoiceStatusColor(selectedInvoice.status || 'pending').text },
                      ]}
                    >
                      {(selectedInvoice.status || 'pending').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Invoice Info Grid */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoGridItem}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Invoice Number</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {selectedInvoice.invoice_number || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoGridItem}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Invoice Date</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {selectedInvoice.issue_date ? formatDate(selectedInvoice.issue_date) : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoGridItem}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Due Date</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {selectedInvoice.due_date ? formatDate(selectedInvoice.due_date) : '-'}
                    </Text>
                  </View>
                  <View style={styles.infoGridItem}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Amount</Text>
                    <Text style={[styles.infoValue, { color: colors.text, fontSize: 18, fontWeight: '700' }]}>
                      {formatCurrency(selectedInvoice.total_amount || 0, selectedInvoice.currency || 'USD')}
                    </Text>
                  </View>
                </View>

                {/* Payment Info (if paid) */}
                {selectedInvoice.status === 'paid' && selectedInvoice.paid_at && (
                  <View
                    style={{
                      padding: 16,
                      marginBottom: 20,
                      borderRadius: 16,
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      borderColor: 'rgba(34, 197, 94, 0.3)',
                      borderWidth: 1,
                    }}
                  >
                    <View style={styles.paymentInfoRow}>
                      <View>
                        <Text style={[styles.paymentLabel, { color: 'rgba(34, 197, 94, 0.7)' }]}>
                          Payment Method
                        </Text>
                        <Text style={[styles.paymentValue, { color: Colors.green[500] }]}>
                          {String(selectedInvoice.payment_gateway || 'N/A')}
                        </Text>
                      </View>
                      <View>
                        <Text style={[styles.paymentLabel, { color: 'rgba(34, 197, 94, 0.7)' }]}>Paid On</Text>
                        <Text style={[styles.paymentValue, { color: Colors.green[500] }]}>
                          {selectedInvoice.paid_at ? formatDate(selectedInvoice.paid_at) : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Amount Breakdown */}
                <View style={styles.breakdownSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Amount Breakdown</Text>
                  <GlassSurface style={styles.breakdownCard}>
                    <View style={styles.breakdownRow}>
                      <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                      <Text style={[styles.breakdownValue, { color: colors.text }]}>
                        {formatCurrency(selectedInvoice.subtotal || 0, selectedInvoice.currency || 'USD')}
                      </Text>
                    </View>

                    {selectedInvoice.tax_amount && selectedInvoice.tax_amount > 0 && (
                      <View style={styles.breakdownRow}>
                        <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                          Tax ({selectedInvoice.tax_rate ? `${selectedInvoice.tax_rate}%` : '0%'})
                        </Text>
                        <Text style={[styles.breakdownValue, { color: colors.text }]}>
                          {formatCurrency(selectedInvoice.tax_amount, selectedInvoice.currency || 'USD')}
                        </Text>
                      </View>
                    )}

                    {selectedInvoice.discount_amount && selectedInvoice.discount_amount > 0 && (
                      <View style={styles.breakdownRow}>
                        <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Discount</Text>
                        <Text style={[styles.breakdownValue, { color: Colors.green[500] }]}>
                          -{formatCurrency(selectedInvoice.discount_amount, selectedInvoice.currency || 'USD')}
                        </Text>
                      </View>
                    )}

                    <View style={[styles.separator, { marginVertical: 12 }]} />

                    <View style={styles.breakdownRow}>
                      <Text style={[styles.breakdownLabel, { color: colors.text, fontWeight: '700', fontSize: 16 }]}>
                        Total
                      </Text>
                      <Text style={[styles.breakdownValue, { color: colors.text, fontWeight: '700', fontSize: 18 }]}>
                        {formatCurrency(selectedInvoice.total_amount || 0, selectedInvoice.currency || 'USD')}
                      </Text>
                    </View>
                  </GlassSurface>
                </View>

                {/* Notes */}
                {selectedInvoice.notes && (
                  <View style={styles.notesSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
                    <GlassSurface style={styles.notesCard}>
                      <Text style={[styles.notesText, { color: colors.text }]}>
                        {String(selectedInvoice.notes)}
                      </Text>
                    </GlassSurface>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
                    onPress={() => {
                      setSelectedInvoice(null);
                      setShowDetailsModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalButtonText, { color: colors.text }]}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: Colors.blue[500] }]}
                    onPress={() => {
                      setShowDetailsModal(false);
                      setShowPreviewModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Preview Invoice</Text>
                  </TouchableOpacity>

                  {selectedInvoice.status === 'pending' && (
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: Colors.green[500] }]}
                      onPress={() => {
                        // TODO: Implement payment functionality
                        console.log('Pay Now clicked for invoice:', selectedInvoice.invoice_number);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="card-outline" size={18} color="#FFFFFF" />
                      <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Pay Now</Text>
                    </TouchableOpacity>
                  )}

                  {selectedInvoice.status === 'paid' && selectedInvoice.pdf_url && (
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: Colors.purple[500] }]}
                      onPress={() => {
                        // TODO: Implement PDF download
                        console.log('Download PDF for invoice:', selectedInvoice.invoice_number);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                      <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Download PDF</Text>
                    </TouchableOpacity>
                  )}
                  </View>
                </ScrollView>
                </GlassSurface>
              </Animated.View>
            </Animated.View>
          )}
        </Modal>

        {/* Invoice Preview Modal */}
        <InvoicePreviewModal
          invoice={selectedInvoice}
          visible={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedInvoice(null);
          }}
        />
      </View>
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterButtonText: {
    fontSize: 14,
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
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  invoiceDate: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceAmount: {
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dueDateText: {
    fontSize: 14,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    padding: 0,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGlass: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  notesContainer: {
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  modalStatusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  infoGridItem: {
    width: '47%',
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentInfo: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 16,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  breakdownCard: {
    padding: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  breakdownLabel: {
    fontSize: 14,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesSection: {
    marginBottom: 20,
  },
  notesCard: {
    padding: 16,
  },
  modalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: '47%',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
