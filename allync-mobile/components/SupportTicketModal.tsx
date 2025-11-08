import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, Modal, ActivityIndicator } from 'react-native';
import { useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';
import { useTheme } from '../contexts/ThemeContext';
import GlassSurface from './GlassSurface';
import {
  formatTicketDate,
  getStatusColor,
  getPriorityColor,
  getStatusDisplayName,
  type SupportTicket,
  type TicketMessage,
} from '../lib/api/supportTickets';

interface SupportTicketModalProps {
  ticket: SupportTicket | null;
  visible: boolean;
  onClose: () => void;
  messages: TicketMessage[];
  loadingMessages: boolean;
  newMessage: string;
  onMessageChange: (text: string) => void;
  onSendMessage: () => void;
  sendingMessage: boolean;
}

export default function SupportTicketModal({
  ticket,
  visible,
  onClose,
  messages,
  loadingMessages,
  newMessage,
  onMessageChange,
  onSendMessage,
  sendingMessage,
}: SupportTicketModalProps) {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  if (!ticket) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)} style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          activeOpacity={1}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View
            entering={SlideInDown.duration(400).springify()}
            exiting={SlideOutDown.duration(300)}
            style={styles.modalContent}
          >
            <GlassSurface style={styles.glassContainer}>
              <View style={styles.innerContainer}>
                {/* Header - Fixed */}
                <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
                  <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={2}>
                      {ticket.subject}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                      {ticket.ticket_number}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close-circle" size={32} color={Colors.red[500]} />
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: colors.textTertiary }]} />

                {/* Badges - Fixed */}
                <View style={styles.badges}>
                  <View style={[styles.badge, { backgroundColor: `${getStatusColor(ticket.status)}20`, borderColor: `${getStatusColor(ticket.status)}40` }]}>
                    <View style={[styles.badgeDot, { backgroundColor: getStatusColor(ticket.status) }]} />
                    <Text style={[styles.badgeText, { color: getStatusColor(ticket.status) }]}>
                      {getStatusDisplayName(ticket.status)}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: `${getPriorityColor(ticket.priority)}20`, borderColor: `${getPriorityColor(ticket.priority)}40` }]}>
                    <Text style={[styles.badgeText, { color: getPriorityColor(ticket.priority) }]}>
                      {ticket.priority.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.category, { color: colors.textSecondary }]}>
                    {ticket.category}
                  </Text>
                </View>

                {/* Messages - Scrollable */}
                <ScrollView
                  ref={scrollViewRef}
                  style={styles.messagesScroll}
                  contentContainerStyle={styles.messagesContent}
                  onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                  showsVerticalScrollIndicator={false}
                >
                  {loadingMessages ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={Colors.blue[500]} />
                    </View>
                  ) : messages.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="chatbubble-outline" size={48} color={colors.textTertiary} />
                      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No messages yet</Text>
                    </View>
                  ) : (
                    messages.map((message) => (
                      <View
                        key={message.id}
                        style={[
                          styles.messageRow,
                          !message.is_from_support ? styles.messageRowUser : styles.messageRowSupport
                        ]}
                      >
                        <Text style={[styles.messageSender, { color: message.is_from_support ? Colors.blue[400] : colors.textTertiary }]}>
                          {message.is_from_support ? 'Support Team' : 'You'}
                        </Text>
                        <View
                          style={[
                            styles.messageBubble,
                            !message.is_from_support
                              ? { backgroundColor: Colors.blue[600] }
                              : { backgroundColor: 'rgba(43, 44, 44, 0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }
                          ]}
                        >
                          <Text style={[styles.messageText, { color: !message.is_from_support ? Colors.titanium : colors.text }]}>
                            {message.message}
                          </Text>
                        </View>
                        <Text style={[styles.messageTime, { color: colors.textTertiary }]}>
                          {formatTicketDate(message.created_at)}
                        </Text>
                      </View>
                    ))
                  )}
                </ScrollView>

                {/* Input Area - Fixed at bottom */}
                {ticket.status !== 'closed' && ticket.status !== 'resolved' ? (
                  <View style={[styles.inputContainer, { backgroundColor: 'rgba(43, 44, 44, 0.5)', borderTopColor: 'rgba(255,255,255,0.1)' }]}>
                    <TextInput
                      style={[styles.input, { color: colors.text, backgroundColor: 'rgba(43, 44, 44, 0.3)', borderColor: 'rgba(255,255,255,0.1)' }]}
                      placeholder="Type your message..."
                      placeholderTextColor={colors.textTertiary}
                      value={newMessage}
                      onChangeText={onMessageChange}
                      multiline
                      maxLength={500}
                    />
                    <TouchableOpacity
                      onPress={onSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      style={[styles.sendButton, { opacity: !newMessage.trim() || sendingMessage ? 0.5 : 1 }]}
                    >
                      <LinearGradient
                        colors={[Colors.blue[600], Colors.blue[700]]}
                        style={styles.sendButtonGradient}
                      >
                        {sendingMessage ? (
                          <ActivityIndicator size="small" color={Colors.titanium} />
                        ) : (
                          <Ionicons name="send" size={20} color={Colors.titanium} />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[styles.closedBanner, { backgroundColor: 'rgba(43, 44, 44, 0.5)' }]}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.green[500]} />
                    <Text style={[styles.closedText, { color: colors.textSecondary }]}>
                      This ticket is {ticket.status}
                    </Text>
                  </View>
                )}
              </View>
            </GlassSurface>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  keyboardView: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  glassContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  // Header - Fixed
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.xl * 1.2,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  closeButton: {
    padding: 4,
  },
  // Divider
  divider: {
    height: 1,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.sm,
    opacity: 0.15,
  },
  // Badges - Fixed
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  category: {
    fontSize: Typography.fontSize.xs,
  },
  // Messages - Scrollable
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
  },
  messageRow: {
    marginBottom: Spacing.md,
  },
  messageRowUser: {
    alignItems: 'flex-end',
  },
  messageRowSupport: {
    alignItems: 'flex-start',
  },
  messageSender: {
    fontSize: Typography.fontSize.xs,
    marginBottom: 4,
    fontWeight: Typography.fontWeight.semibold,
  },
  messageBubble: {
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
  // Input - Fixed at bottom
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  input: {
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
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  closedText: {
    fontSize: Typography.fontSize.sm,
  },
});
