import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius, Shadows } from '../../constants/Spacing';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import SupportSkeleton from '../../components/skeletons/SupportSkeleton';
import SupportTicketModal from '../../components/SupportTicketModal';
import MeshGlowBackground from '../../components/MeshGlowBackground';
import GlassSurface from '../../components/GlassSurface';
import {
  getTicketsByCompany,
  getTicketMessages,
  createTicket,
  createTicketMessage,
  getTicketCategories,
  formatTicketDate,
  getStatusColor,
  getPriorityColor,
  getStatusDisplayName,
  type SupportTicket,
  type TicketMessage,
  type TicketCategory,
} from '../../lib/api/supportTickets';
import { getUserCompanyId } from '../../lib/api/dashboard';
const AnimatedView = Animated.View;
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
export default function Support() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  // New ticket modal
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    description: '',
    category: 'technical',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });
  // Fetch company ID on mount
  useEffect(() => {
    if (user?.id) {
      fetchCompanyId();
    }
  }, [user?.id]);
  // Fetch tickets when company ID is available
  useEffect(() => {
    if (companyId) {
      loadTickets();
      loadCategories();
    }
  }, [companyId]);
  // Load messages when a ticket is selected
  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
    }
  }, [selectedTicket]);
  const fetchCompanyId = async () => {
    if (!user?.id) return;
    const id = await getUserCompanyId(user.id);
    setCompanyId(id);
  };
  const loadTickets = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const data = await getTicketsByCompany(companyId);
      setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
      Alert.alert('Error', 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };
  const loadCategories = async () => {
    try {
      const data = await getTicketCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };
  const loadMessages = async (ticketId: string) => {
    try {
      setLoadingMessages(true);
      const data = await getTicketMessages(ticketId, false);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !user) return;
    try {
      setSendingMessage(true);
      await createTicketMessage({
        ticket_id: selectedTicket.id,
        sender_id: user.id,
        message: newMessage.trim(),
        is_from_support: false,
      });
      await loadMessages(selectedTicket.id);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };
  const handleCreateTicket = async () => {
    if (!user || !companyId) return;
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    try {
      setCreatingTicket(true);
      await createTicket({
        company_id: companyId,
        created_by: user.id,
        subject: newTicketForm.subject,
        description: newTicketForm.description,
        category: newTicketForm.category,
        priority: newTicketForm.priority,
      });
      await loadTickets();
      setShowNewTicketModal(false);
      setNewTicketForm({
        subject: '',
        description: '',
        category: 'technical',
        priority: 'medium',
      });
      Alert.alert('Success', 'Ticket created successfully!');
    } catch (error) {
      console.error('Error creating ticket:', error);
      Alert.alert('Error', 'Failed to create ticket. Please try again.');
    } finally {
      setCreatingTicket(false);
    }
  };
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  if (loading) {
    return (
      <View style={styles.container}>
        <SupportSkeleton />
      </View>
    );
  }
  return (
    <MeshGlowBackground>
        {/* Tickets List */}
        <View style={styles.ticketsSection}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Support Tickets</Text>
            <TouchableOpacity
              onPress={() => setShowNewTicketModal(true)}
              style={styles.newTicketButton}
            >
              <LinearGradient
                colors={[Colors.blue[600], Colors.blue[700]]}
                style={styles.newTicketGradient}
              >
                <Ionicons name="add" size={24} color={Colors.titanium} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {/* Search and Filter */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainerGlass}>
              <Ionicons name="search" size={20} color={colors.textTertiary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search tickets..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScrollView}
              contentContainerStyle={styles.filterScrollContent}
            >
              {['all', 'open', 'in_progress', 'waiting_customer', 'resolved'].map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFilterStatus(status)}
                  style={[
                    styles.filterChipGlass,
                    filterStatus === status && styles.filterChipActive
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, { color: filterStatus === status ? Colors.titanium : colors.textSecondary }]}>
                    {status === 'all' ? 'All' : getStatusDisplayName(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Tickets List */}
          <ScrollView style={styles.ticketsList} contentContainerStyle={styles.ticketsListContent}>
            {filteredTickets.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={64} color={colors.textTertiary} />
                <Text style={[styles.emptyStateText, { color: colors.text }]}>No tickets found</Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>Create a new ticket to get started</Text>
              </View>
            ) : (
              filteredTickets.map((ticket, index) => (
                <AnimatedTouchable
                  key={ticket.id}
                  entering={FadeInDown.duration(400).delay(index * 50).springify()}
                  onPress={() => setSelectedTicket(ticket)}
                  activeOpacity={0.7}
                >
                  <GlassSurface style={styles.ticketCardGlass}>
                    <TicketCardContent ticket={ticket} colors={colors} />
                  </GlassSurface>
                </AnimatedTouchable>
              ))
            )}
          </ScrollView>
        </View>
        {/* Support Ticket Modal */}
        <SupportTicketModal
          ticket={selectedTicket}
          visible={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          messages={messages}
          loadingMessages={loadingMessages}
          newMessage={newMessage}
          onMessageChange={setNewMessage}
          onSendMessage={handleSendMessage}
          sendingMessage={sendingMessage}
        />
        {/* New Ticket Modal */}
        <Modal
          visible={showNewTicketModal}
          animationType="slide"
          onRequestClose={() => setShowNewTicketModal(false)}
          statusBarTranslucent
        >
          <MeshGlowBackground>
            <View style={styles.modalContainer}>
              <View style={[styles.modalHeader, { borderBottomColor: 'rgba(255,255,255,0.1)' }]}>
                <TouchableOpacity onPress={() => setShowNewTicketModal(false)} style={styles.backButton}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.modalHeaderContent}>
                  <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Create Support Ticket</Text>
                  <Text style={[styles.modalHeaderSubtitle, { color: colors.textSecondary }]}>We'll respond within 24 hours</Text>
                </View>
              </View>
            <ScrollView style={styles.newTicketForm} contentContainerStyle={styles.newTicketFormContent}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Subject *</Text>
                <TextInput
                  style={[styles.formInput, { color: colors.text, backgroundColor: 'rgba(43, 44, 44, 0.5)', borderColor: 'rgba(255,255,255,0.1)' }]}
                  placeholder="Brief description of your issue"
                  placeholderTextColor={colors.textTertiary}
                  value={newTicketForm.subject}
                  onChangeText={(text) => setNewTicketForm({ ...newTicketForm, subject: text })}
                />
              </View>
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: Spacing.md }]}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Category *</Text>
                  <View style={[styles.formPicker, { backgroundColor: 'rgba(43, 44, 44, 0.5)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                    <Text style={[styles.formPickerText, { color: colors.text }]}>{newTicketForm.category}</Text>
                  </View>
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Priority *</Text>
                  <View style={[styles.formPicker, { backgroundColor: 'rgba(43, 44, 44, 0.5)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                    <Text style={[styles.formPickerText, { color: colors.text }]}>{newTicketForm.priority}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Description *</Text>
                <TextInput
                  style={[styles.formTextArea, { color: colors.text, backgroundColor: 'rgba(43, 44, 44, 0.5)', borderColor: 'rgba(255,255,255,0.1)' }]}
                  placeholder="Describe your issue in detail..."
                  placeholderTextColor={colors.textTertiary}
                  value={newTicketForm.description}
                  onChangeText={(text) => setNewTicketForm({ ...newTicketForm, description: text })}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
              <View style={[styles.formInfoBox, { backgroundColor: `${Colors.blue[500]}15`, borderColor: `${Colors.blue[500]}30` }]}>
                <Ionicons name="information-circle" size={24} color={Colors.blue[500]} />
                <View style={styles.formInfoText}>
                  <Text style={[styles.formInfoTitle, { color: Colors.blue[400] }]}>Response Time</Text>
                  <Text style={[styles.formInfoDesc, { color: colors.textSecondary }]}>
                    Urgent: 2h • High: 4h • Medium/Low: 24h
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleCreateTicket}
                disabled={creatingTicket}
                style={[styles.createTicketButton, { opacity: creatingTicket ? 0.5 : 1 }]}
              >
                <LinearGradient
                  colors={[Colors.blue[600], Colors.blue[700]]}
                  style={styles.createTicketGradient}
                >
                  {creatingTicket ? (
                    <>
                      <ActivityIndicator size="small" color={Colors.titanium} />
                      <Text style={[styles.createTicketButtonText, { color: Colors.titanium }]}>Creating...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.titanium} />
                      <Text style={[styles.createTicketButtonText, { color: Colors.titanium }]}>Create Ticket</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
            </View>
          </MeshGlowBackground>
        </Modal>
      </MeshGlowBackground>
  );
}
// Ticket Card Content Component
function TicketCardContent({ ticket, colors }: { ticket: SupportTicket; colors: any }) {
  return (
    <>
      <View style={styles.ticketCardHeader}>
        <Text style={[styles.ticketNumber, { color: colors.textTertiary }]}>{ticket.ticket_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(ticket.status)}20`, borderColor: `${getStatusColor(ticket.status)}40` }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(ticket.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>{getStatusDisplayName(ticket.status)}</Text>
        </View>
      </View>
      <Text style={[styles.ticketTitle, { color: colors.text }]} numberOfLines={1}>{ticket.subject}</Text>
      <Text style={[styles.ticketDescription, { color: colors.textSecondary }]} numberOfLines={2}>{ticket.description}</Text>
      <View style={styles.ticketFooter}>
        <Text style={[styles.ticketPriority, { color: getPriorityColor(ticket.priority) }]}>{ticket.priority.toUpperCase()}</Text>
        <Text style={[styles.ticketDate, { color: colors.textTertiary }]}>{formatTicketDate(ticket.created_at)}</Text>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
  },
  ticketsSection: {
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
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  newTicketButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.md,
  },
  newTicketGradient: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  searchContainerGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterScrollContent: {
    gap: Spacing.sm,
  },
  filterChipGlass: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: Colors.blue[600],
    borderColor: Colors.blue[700],
  },
  filterChipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  ticketsList: {
    flex: 1,
  },
  ticketsListContent: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyStateText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
  },
  emptyStateSubtext: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  ticketCardGlass: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  ticketNumber: {
    fontSize: Typography.fontSize.xs,
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  ticketTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  ticketDescription: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketPriority: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  ticketDate: {
    fontSize: Typography.fontSize.xs,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? Spacing['5xl'] : Spacing['4xl'],
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalHeaderTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  modalHeaderSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  ticketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  ticketInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  ticketInfoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ticketInfoBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  ticketInfoCategory: {
    fontSize: Typography.fontSize.xs,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  messagesLoading: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyMessages: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyMessagesText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
  },
  message: {
    marginBottom: Spacing.md,
  },
  messageUser: {
    alignItems: 'flex-end',
  },
  messageSupport: {
    alignItems: 'flex-start',
  },
  messageSender: {
    fontSize: Typography.fontSize.xs,
    marginBottom: 4,
    fontWeight: Typography.fontWeight.semibold,
  },
  messageContent: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  messageText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.sm * 1.4,
  },
  messageTime: {
    fontSize: Typography.fontSize.xs,
    marginTop: 4,
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  messageTextInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.fontSize.sm,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedTicketBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  closedTicketText: {
    fontSize: Typography.fontSize.sm,
  },
  newTicketForm: {
    flex: 1,
  },
  newTicketFormContent: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  formInput: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.fontSize.sm,
  },
  formRow: {
    flexDirection: 'row',
  },
  formPicker: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  formPickerText: {
    fontSize: Typography.fontSize.sm,
  },
  formTextArea: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.fontSize.sm,
    minHeight: 120,
  },
  formInfoBox: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  formInfoText: {
    flex: 1,
  },
  formInfoTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 4,
  },
  formInfoDesc: {
    fontSize: Typography.fontSize.xs,
  },
  createTicketButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  createTicketGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  createTicketButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  // Glassmorphism Modal Styles
  ticketModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  ticketModalContent: {
    flex: 1,
    overflow: 'hidden',
  },
  ticketModalGlass: {
    flex: 1,
  },
  ticketModalInner: {
    flex: 1,
  },
  ticketModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  ticketModalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.xl * 1.2,
  },
  ticketModalSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  ticketModalClose: {
    padding: 4,
  },
  ticketModalBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
});
