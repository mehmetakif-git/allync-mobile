import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { PageTransition } from '../../components/PageTransition';
import GlassSurface from '../../components/GlassSurface';
import InvoicesSkeleton from '../../components/skeletons/InvoicesSkeleton';
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
    <PageTransition>
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
        {selectedInvoice && showDetailsModal && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={() => {
                setSelectedInvoice(null);
                setShowDetailsModal(false);
              }}
              activeOpacity={1}
            />
            <GlassSurface style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Invoice Details</Text>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedInvoice(null);
                    setShowDetailsModal(false);
                  }}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Invoice Number</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{selectedInvoice.invoice_number}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Issue Date</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(selectedInvoice.issue_date)}</Text>
                </View>

                {selectedInvoice.due_date && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Due Date</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(selectedInvoice.due_date)}</Text>
                  </View>
                )}

                <View style={styles.separator} />

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}
                  </Text>
                </View>

                {selectedInvoice.tax_amount && selectedInvoice.tax_amount > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Tax ({selectedInvoice.tax_rate}%)
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {formatCurrency(selectedInvoice.tax_amount, selectedInvoice.currency)}
                    </Text>
                  </View>
                )}

                {selectedInvoice.discount_amount && selectedInvoice.discount_amount > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Discount</Text>
                    <Text style={[styles.detailValue, { color: Colors.green[500] }]}>
                      -{formatCurrency(selectedInvoice.discount_amount, selectedInvoice.currency)}
                    </Text>
                  </View>
                )}

                <View style={[styles.separator, { marginVertical: 12 }]} />

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.text, fontWeight: '700', fontSize: 18 }]}>Total</Text>
                  <Text style={[styles.detailValue, { color: colors.text, fontWeight: '700', fontSize: 20 }]}>
                    {formatCurrency(selectedInvoice.total_amount, selectedInvoice.currency)}
                  </Text>
                </View>

                {selectedInvoice.notes && (
                  <>
                    <View style={styles.separator} />
                    <View style={styles.notesContainer}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Notes</Text>
                      <Text style={[styles.notesText, { color: colors.text }]}>{selectedInvoice.notes}</Text>
                    </View>
                  </>
                )}
              </ScrollView>
            </GlassSurface>
          </View>
        )}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    borderRadius: 24,
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
});
