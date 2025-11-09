// =====================================================
// WhatsApp Sessions API
// =====================================================

import { supabase } from '../supabase';
import type {
  WhatsAppSession,
  SessionWithMessages,
  ConversationFilter
} from '../../types/whatsapp';

/**
 * Get sessions by company with optional filters
 */
export async function getSessionsByCompany(
  companyId: string,
  filters?: ConversationFilter
): Promise<WhatsAppSession[]> {
  console.log('📡 Fetching sessions for company:', companyId);

  let query = supabase
    .from('whatsapp_sessions')
    .select(`
      *,
      user:whatsapp_user_profiles(*)
    `)
    .eq('company_id', companyId);

  // Apply filters
  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  if (filters?.searchQuery) {
    query = query.or(
      `customer_name.ilike.%${filters.searchQuery}%,customer_phone.ilike.%${filters.searchQuery}%`
    );
  }

  if (filters?.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.start)
      .lte('created_at', filters.dateRange.end);
  }

  query = query.order('last_message_time', { ascending: false, nullsFirst: false });

  const { data, error } = await query;

  if (error) {
    console.error('❌ Error fetching sessions:', error);
    throw error;
  }

  // Fetch actual message counts for each session
  if (data && data.length > 0) {
    const sessionIds = data.map(s => s.id);

    const { data: messageCounts, error: countError } = await supabase
      .from('whatsapp_messages')
      .select('session_id')
      .in('session_id', sessionIds);

    if (!countError && messageCounts) {
      // Count messages per session
      const countMap = messageCounts.reduce((acc: Record<string, number>, msg: any) => {
        acc[msg.session_id] = (acc[msg.session_id] || 0) + 1;
        return acc;
      }, {});

      // Add message_count to each session
      data.forEach(session => {
        session.message_count = countMap[session.id] || 0;
      });

      console.log('✅ Message counts fetched for sessions');
    }
  }

  console.log('✅ Fetched', data?.length || 0, 'sessions');
  return data || [];
}

/**
 * Get session by ID with full message history
 */
export async function getSessionById(sessionId: string): Promise<SessionWithMessages | null> {
  console.log('📡 Fetching session:', sessionId);

  const { data: session, error: sessionError } = await supabase
    .from('whatsapp_sessions')
    .select(`
      *,
      user:whatsapp_user_profiles(*)
    `)
    .eq('id', sessionId)
    .single();

  if (sessionError) {
    console.error('❌ Error fetching session:', sessionError);
    throw sessionError;
  }

  // Get messages for this session
  const { data: messages, error: messagesError } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (messagesError) {
    console.error('❌ Error fetching messages:', messagesError);
    throw messagesError;
  }

  // TODO: Fetch integration actions from request tables
  const integration_actions: any[] = [];

  // Add message count to session
  const message_count = messages?.length || 0;

  console.log('✅ Fetched session with', message_count, 'messages');

  return {
    ...session,
    messages: messages || [],
    message_count,
    integration_actions,
  };
}

/**
 * Get active sessions count
 */
export async function getActiveSessionsCount(
  companyId: string,
  instanceId?: string
): Promise<number> {
  let query = supabase
    .from('whatsapp_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('is_active', true);

  const { count, error } = await query;

  if (error) {
    console.error('❌ Error counting active sessions:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Update session status
 */
export async function updateSessionStatus(
  sessionId: string,
  status: 'active' | 'closed' | 'archived'
): Promise<void> {
  console.log('📡 Updating session status:', sessionId, status);

  const updates: any = { status };

  if (status === 'closed') {
    updates.is_active = false;
    updates.session_end = new Date().toISOString();
  }

  const { error } = await supabase
    .from('whatsapp_sessions')
    .update(updates)
    .eq('id', sessionId);

  if (error) {
    console.error('❌ Error updating session:', error);
    throw error;
  }

  console.log('✅ Session status updated');
}

/**
 * Close session
 */
export async function closeSession(sessionId: string): Promise<void> {
  return updateSessionStatus(sessionId, 'closed');
}

/**
 * Archive session
 */
export async function archiveSession(sessionId: string): Promise<void> {
  return updateSessionStatus(sessionId, 'archived');
}

/**
 * Get archived sessions
 */
export async function getArchivedSessions(companyId: string): Promise<WhatsAppSession[]> {
  const { data, error } = await supabase
    .from('whatsapp_sessions')
    .select(`
      *,
      user:whatsapp_user_profiles(*)
    `)
    .eq('company_id', companyId)
    .eq('status', 'archived')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching archived sessions:', error);
    throw error;
  }

  return data || [];
}
