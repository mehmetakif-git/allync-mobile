import { supabase } from '../supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface SupportTicket {
  id: string;
  ticket_number: string;
  company_id: string;
  created_by: string;
  assigned_to: string | null;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'waiting_customer';
  created_at: string;
  updated_at: string;
  company?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    full_name: string;
    email: string;
  };
  assignee?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal: boolean;
  is_from_support: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface TicketCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  sort_order: number;
}

// =====================================================
// TICKETS
// =====================================================

/**
 * Get tickets by company
 */
export async function getTicketsByCompany(companyId: string): Promise<SupportTicket[]> {
  console.log('🎫 [getTicketsByCompany] Fetching tickets for company:', companyId);

  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        company:companies(id, name),
        creator:profiles!created_by(id, full_name, email),
        assignee:profiles!assigned_to(id, full_name, email)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ [getTicketsByCompany] Found ${data?.length || 0} tickets`);
    return (data as SupportTicket[]) || [];
  } catch (error) {
    console.error('❌ [getTicketsByCompany] Error:', error);
    return [];
  }
}

/**
 * Get ticket by ID
 */
export async function getTicketById(ticketId: string): Promise<SupportTicket | null> {
  console.log('🎫 [getTicketById] Fetching ticket:', ticketId);

  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        company:companies(id, name),
        creator:profiles!created_by(id, full_name, email),
        assignee:profiles!assigned_to(id, full_name, email)
      `)
      .eq('id', ticketId)
      .single();

    if (error) throw error;

    console.log('✅ [getTicketById] Ticket found');
    return data as SupportTicket;
  } catch (error) {
    console.error('❌ [getTicketById] Error:', error);
    return null;
  }
}

/**
 * Create new ticket
 */
export async function createTicket(ticketData: {
  company_id: string;
  created_by: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
}): Promise<SupportTicket | null> {
  console.log('🎫 [createTicket] Creating new ticket');

  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([{
        ...ticketData,
        status: 'open',
      }])
      .select(`
        *,
        company:companies(id, name),
        creator:profiles!created_by(id, full_name, email)
      `)
      .single();

    if (error) throw error;

    console.log('✅ [createTicket] Ticket created:', data.ticket_number);
    return data as SupportTicket;
  } catch (error) {
    console.error('❌ [createTicket] Error:', error);
    throw error;
  }
}

// =====================================================
// MESSAGES
// =====================================================

/**
 * Get messages for a ticket
 */
export async function getTicketMessages(ticketId: string, includeInternal: boolean = false): Promise<TicketMessage[]> {
  console.log('💬 [getTicketMessages] Fetching messages for ticket:', ticketId);

  try {
    let query = supabase
      .from('support_ticket_messages')
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, email)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    // Filter out internal messages for non-support users
    if (!includeInternal) {
      query = query.eq('is_internal', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    console.log(`✅ [getTicketMessages] Found ${data?.length || 0} messages`);
    return (data as TicketMessage[]) || [];
  } catch (error) {
    console.error('❌ [getTicketMessages] Error:', error);
    return [];
  }
}

/**
 * Create a new message/reply
 */
export async function createTicketMessage(messageData: {
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal?: boolean;
  is_from_support?: boolean;
}): Promise<TicketMessage | null> {
  console.log('💬 [createTicketMessage] Creating new message');

  try {
    const { data, error } = await supabase
      .from('support_ticket_messages')
      .insert([{
        ticket_id: messageData.ticket_id,
        sender_id: messageData.sender_id,
        message: messageData.message,
        is_internal: messageData.is_internal || false,
        is_from_support: messageData.is_from_support || false,
        attachments: [],
      }])
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, email)
      `)
      .single();

    if (error) throw error;

    console.log('✅ [createTicketMessage] Message created');
    return data as TicketMessage;
  } catch (error) {
    console.error('❌ [createTicketMessage] Error:', error);
    throw error;
  }
}

// =====================================================
// CATEGORIES
// =====================================================

/**
 * Get all active categories
 */
export async function getTicketCategories(): Promise<TicketCategory[]> {
  console.log('📂 [getTicketCategories] Fetching categories');

  try {
    const { data, error } = await supabase
      .from('support_ticket_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    console.log(`✅ [getTicketCategories] Found ${data?.length || 0} categories`);
    return (data as TicketCategory[]) || [];
  } catch (error) {
    console.error('❌ [getTicketCategories] Error:', error);
    return [];
  }
}

// =====================================================
// HELPERS
// =====================================================

/**
 * Format date for display
 */
export function formatTicketDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get status color
 */
export function getStatusColor(status: string) {
  switch (status) {
    case 'open': return '#3B82F6'; // blue
    case 'in_progress': return '#EAB308'; // yellow
    case 'waiting_customer': return '#A855F7'; // purple
    case 'resolved': return '#10B981'; // green
    case 'closed': return '#6B7280'; // gray
    default: return '#6B7280';
  }
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent': return '#EF4444'; // red
    case 'high': return '#F97316'; // orange
    case 'medium': return '#EAB308'; // yellow
    case 'low': return '#10B981'; // green
    default: return '#6B7280';
  }
}

/**
 * Get status display name
 */
export function getStatusDisplayName(status: string): string {
  switch (status) {
    case 'open': return 'Open';
    case 'in_progress': return 'In Progress';
    case 'waiting_customer': return 'Waiting Customer';
    case 'resolved': return 'Resolved';
    case 'closed': return 'Closed';
    default: return status;
  }
}
