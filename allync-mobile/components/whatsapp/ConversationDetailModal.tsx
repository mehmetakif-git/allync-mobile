import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSessionById } from '../../lib/api/whatsappSessions';
import type { WhatsAppMessage, SessionWithMessages } from '../../types/whatsapp';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/Spacing';

interface ConversationDetailModalProps {
  visible: boolean;
  sessionId: string | null;
  onClose: () => void;
}

export default function ConversationDetailModal({
  visible,
  sessionId,
  onClose,
}: ConversationDetailModalProps) {
  const [session, setSession] = useState<SessionWithMessages | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible && sessionId) {
      loadSession();
    }
  }, [visible, sessionId]);

  const loadSession = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const data = await getSessionById(sessionId);
      setSession(data);

      // Auto scroll to bottom after messages load
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: WhatsAppMessage) => {
    const isCustomer = message.sender === 'customer';
    const isBot = message.sender === 'bot';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isCustomer ? styles.customerMessage : styles.botMessage,
        ]}
      >
        {/* Sender Avatar */}
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: isCustomer
                ? 'rgba(34, 197, 94, 0.2)'
                : isBot
                ? 'rgba(59, 130, 246, 0.2)'
                : 'rgba(168, 85, 247, 0.2)',
            },
          ]}
        >
          {isCustomer ? (
            <Ionicons name="person" size={16} color={Colors.green[400]} />
          ) : isBot ? (
            <Text style={styles.avatarText}>AI</Text>
          ) : (
            <Ionicons name="person" size={16} color={Colors.purple[400]} />
          )}
        </View>

        {/* Message Bubble */}
        <View style={styles.messageBubbleContainer}>
          {/* Sender Name */}
          <Text style={styles.senderName}>
            {isCustomer
              ? session?.customer_name || 'Customer'
              : isBot
              ? 'AI Assistant'
              : 'Support Agent'}
          </Text>

          {/* Message Content */}
          <View
            style={[
              styles.messageBubble,
              {
                backgroundColor: isCustomer
                  ? 'rgba(34, 197, 94, 0.2)'
                  : 'rgba(255, 255, 255, 0.12)',
                borderTopRightRadius: isCustomer ? 4 : BorderRadius['2xl'],
                borderTopLeftRadius: isCustomer ? BorderRadius['2xl'] : 4,
              },
            ]}
          >
            {/* Text Message */}
            {message.message_type === 'text' && (
              <Text style={styles.messageText}>{message.message_body}</Text>
            )}

            {/* Image Message */}
            {message.message_type === 'image' && (
              <View>
                {message.media_url && (
                  <Image
                    source={{ uri: message.media_url }}
                    style={styles.messageImage}
                    resizeMode="cover"
                  />
                )}
                {message.message_body && (
                  <Text style={styles.messageText}>{message.message_body}</Text>
                )}
              </View>
            )}

            {/* Document Message */}
            {message.message_type === 'document' && (
              <View style={styles.documentContainer}>
                <Ionicons name="document" size={32} color={Colors.blue[400]} />
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={1}>
                    {message.media_name || 'Document'}
                  </Text>
                  <Text style={styles.documentSize}>
                    {message.media_size
                      ? `${(message.media_size / 1024).toFixed(1)} KB`
                      : 'Document file'}
                  </Text>
                </View>
              </View>
            )}

            {/* AI Intent Badge */}
            {message.ai_intent && (
              <View style={styles.intentBadge}>
                <Text style={styles.intentText}>Intent: {message.ai_intent}</Text>
              </View>
            )}
          </View>

          {/* Message Meta */}
          <View style={styles.messageMeta}>
            <Text style={styles.messageTime}>{formatTime(message.created_at)}</Text>
            {!isCustomer && (
              <View>
                {message.status === 'delivered' && (
                  <Ionicons name="checkmark-done" size={14} color={Colors.text.secondary} />
                )}
                {message.status === 'read' && (
                  <Ionicons name="checkmark-done" size={14} color={Colors.blue[400]} />
                )}
                {message.status === 'sent' && (
                  <Ionicons name="checkmark" size={14} color={Colors.text.secondary} />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {session?.customer_name || 'Conversation'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {session?.customer_phone || ''}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="call" size={20} color={Colors.green[500]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.green[500]} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : !session ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles" size={64} color={Colors.text.tertiary} />
            <Text style={styles.emptyText}>No conversation found</Text>
          </View>
        ) : session.messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={Colors.text.tertiary} />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Messages will appear here when the conversation starts
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {session.messages.map(renderMessage)}
          </ScrollView>
        )}

        {/* Session Info Footer */}
        {session && (
          <View style={styles.footer}>
            <View style={styles.footerInfo}>
              <Text style={styles.footerLabel}>Status:</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      session.status === 'active'
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'rgba(156, 163, 175, 0.2)',
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        session.status === 'active' ? Colors.green[400] : Colors.text.tertiary,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        session.status === 'active' ? Colors.green[400] : Colors.text.tertiary,
                    },
                  ]}
                >
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.footerInfo}>
              <Ionicons name="chatbubble" size={16} color={Colors.blue[400]} />
              <Text style={styles.footerLabel}>Messages:</Text>
              <Text style={styles.footerValue}>
                {session.messages?.length || session.message_count || 0}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1429',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['5xl'],
    paddingBottom: Spacing.md,
    backgroundColor: '#0B1429',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  messageContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  customerMessage: {
    flexDirection: 'row-reverse',
  },
  botMessage: {
    flexDirection: 'row',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.blue[400],
  },
  messageBubbleContainer: {
    flex: 1,
    maxWidth: '85%',
  },
  senderName: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  messageBubble: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.md,
  },
  messageText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  documentSize: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  intentBadge: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  intentText: {
    fontSize: 12,
    color: Colors.blue[400],
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  footerLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
