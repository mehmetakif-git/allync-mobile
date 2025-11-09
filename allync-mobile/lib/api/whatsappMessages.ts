// =====================================================
// WhatsApp Messages API
// =====================================================

import { supabase } from '../supabase';
import type { WhatsAppMessage } from '../../types/whatsapp';

/**
 * Get messages by session
 */
export async function getMessagesBySession(sessionId: string): Promise<WhatsAppMessage[]> {
  console.log('📡 Fetching messages for session:', sessionId);

  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching messages:', error);
    throw error;
  }

  console.log('✅ Fetched', data?.length || 0, 'messages');
  return data || [];
}

/**
 * Get messages count for company with date range
 */
export async function getMessagesCount(
  companyId: string,
  dateRange?: { start: string; end: string },
  filters?: {
    sender?: string;
    message_type?: string;
  }
): Promise<number> {
  let query = supabase
    .from('whatsapp_messages')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);
  }

  if (filters?.sender) {
    query = query.eq('sender', filters.sender);
  }

  if (filters?.message_type) {
    query = query.eq('message_type', filters.message_type);
  }

  const { count, error } = await query;

  if (error) {
    console.error('❌ Error counting messages:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get message statistics
 */
export async function getMessageStatistics(
  companyId: string,
  dateRange: { start: string; end: string }
): Promise<{
  total: number;
  customer: number;
  bot: number;
  agent: number;
  by_type: Record<string, number>;
  by_sentiment: Record<string, number>;
}> {
  console.log('📡 Fetching message statistics for company:', companyId, dateRange);

  // First, get all session IDs for this company
  const { data: sessions, error: sessionsError } = await supabase
    .from('whatsapp_sessions')
    .select('id')
    .eq('company_id', companyId);

  if (sessionsError) {
    console.error('❌ Error fetching sessions:', sessionsError);
    throw sessionsError;
  }

  const sessionIds = sessions?.map(s => s.id) || [];

  if (sessionIds.length === 0) {
    console.log('ℹ️ No sessions found for company, returning empty stats');
    return {
      total: 0,
      customer: 0,
      bot: 0,
      agent: 0,
      by_type: {},
      by_sentiment: {},
    };
  }

  // Now get messages for these sessions
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('sender, message_type, sentiment')
    .in('session_id', sessionIds)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  if (error) {
    console.error('❌ Error fetching statistics:', error);
    throw error;
  }

  const stats = {
    total: data?.length || 0,
    customer: 0,
    bot: 0,
    agent: 0,
    by_type: {} as Record<string, number>,
    by_sentiment: {} as Record<string, number>,
  };

  data?.forEach((msg) => {
    // Count by sender
    if (msg.sender === 'customer') stats.customer++;
    else if (msg.sender === 'bot') stats.bot++;
    else if (msg.sender === 'agent') stats.agent++;

    // Count by type
    if (msg.message_type) {
      stats.by_type[msg.message_type] = (stats.by_type[msg.message_type] || 0) + 1;
    }

    // Count by sentiment
    if (msg.sentiment) {
      stats.by_sentiment[msg.sentiment] = (stats.by_sentiment[msg.sentiment] || 0) + 1;
    }
  });

  console.log('✅ Message statistics calculated:', stats);
  return stats;
}

/**
 * Search messages
 */
export async function searchMessages(
  companyId: string,
  query: string
): Promise<WhatsAppMessage[]> {
  console.log('📡 Searching messages for:', query);

  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .eq('company_id', companyId)
    .ilike('message_body', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('❌ Error searching messages:', error);
    throw error;
  }

  console.log('✅ Found', data?.length || 0, 'messages');
  return data || [];
}

/**
 * Get messages by customer
 */
export async function getMessagesByCustomer(customerId: string): Promise<WhatsAppMessage[]> {
  console.log('📡 Fetching messages for customer:', customerId);

  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .eq('user_id', customerId)
    .order('created_at', { ascending: false})
    .limit(100);

  if (error) {
    console.error('❌ Error fetching customer messages:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get all messages for Super Admin with company and instance details
 */
export async function getAllMessagesWithDetails(limit: number = 100): Promise<any[]> {
  console.log('📡 Fetching all messages with details for Super Admin');

  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select(`
      *,
      company:companies(id, name),
      user_profile:whatsapp_user_profiles(id, name, phone_number),
      session:whatsapp_sessions(id, customer_name, customer_phone, status)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching all messages:', error);
    throw error;
  }

  console.log('✅ Fetched', data?.length || 0, 'messages with details');
  return data || [];
}
