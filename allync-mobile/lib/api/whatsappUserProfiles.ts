import { supabase } from '../supabase';

export interface WhatsAppUserProfile {
  id: string;
  company_id: string;
  phone_number: string;
  name: string | null;
  email: string | null;
  preferences: any;
  tags: string[] | null;
  notes: string | null;
  total_messages: number;
  last_seen: string | null;
  customer_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileWithStats extends WhatsAppUserProfile {
  stats: {
    recent_sessions: number;
    recent_messages: number;
    avg_response_time: number;
    integrations_used: string[];
  };
}

/**
 * Get all user profiles for a company
 */
export async function getUserProfiles(
  companyId: string,
  filters?: {
    search?: string;
    tags?: string[];
    isBusiness?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<WhatsAppUserProfile[]> {
  let query = supabase
    .from('whatsapp_user_profiles')
    .select('*')
    .eq('company_id', companyId);

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%`);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  query = query.order('last_seen', { ascending: false, nullsFirst: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Get user profile by ID with statistics
 */
export async function getUserProfileById(userId: string): Promise<UserProfileWithStats | null> {
  const { data: profile, error: profileError } = await supabase
    .from('whatsapp_user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') throw profileError;
  if (!profile) return null;

  // Get recent sessions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: recentSessions } = await supabase
    .from('whatsapp_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Get recent messages
  const { count: recentMessages } = await supabase
    .from('whatsapp_messages')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Get integrations used
  const { data: messages } = await supabase
    .from('whatsapp_messages')
    .select('triggered_integrations')
    .eq('customer_id', userId)
    .not('triggered_integrations', 'is', null);

  const integrationsSet = new Set<string>();
  messages?.forEach((msg) => {
    if (msg.triggered_integrations && Array.isArray(msg.triggered_integrations)) {
      msg.triggered_integrations.forEach((integration: string) => {
        integrationsSet.add(integration);
      });
    }
  });

  return {
    ...profile,
    stats: {
      recent_sessions: recentSessions || 0,
      recent_messages: recentMessages || 0,
      avg_response_time: 0, // TODO: Calculate from sessions
      integrations_used: Array.from(integrationsSet)
    }
  };
}

/**
 * Get user profile by phone number
 */
export async function getUserProfileByPhone(
  companyId: string,
  phoneNumber: string
): Promise<WhatsAppUserProfile | null> {
  const { data, error } = await supabase
    .from('whatsapp_user_profiles')
    .select('*')
    .eq('company_id', companyId)
    .eq('phone_number', phoneNumber)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Create user profile
 */
export async function createUserProfile(
  profile: Omit<WhatsAppUserProfile, 'id' | 'created_at' | 'updated_at'>
): Promise<WhatsAppUserProfile> {
  const { data, error } = await supabase
    .from('whatsapp_user_profiles')
    .insert(profile)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<WhatsAppUserProfile, 'id' | 'company_id' | 'created_at' | 'updated_at'>>
): Promise<WhatsAppUserProfile> {
  const { data, error } = await supabase
    .from('whatsapp_user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add tag to user profile
 */
export async function addTagToUser(userId: string, tag: string): Promise<void> {
  const { data: profile } = await supabase
    .from('whatsapp_user_profiles')
    .select('tags')
    .eq('id', userId)
    .single();

  const currentTags = profile?.tags || [];
  const newTags = [...currentTags, tag].filter((t, i, arr) => arr.indexOf(t) === i); // Remove duplicates

  await updateUserProfile(userId, { tags: newTags });
}

/**
 * Remove tag from user profile
 */
export async function removeTagFromUser(userId: string, tag: string): Promise<void> {
  const { data: profile } = await supabase
    .from('whatsapp_user_profiles')
    .select('tags')
    .eq('id', userId)
    .single();

  const currentTags = profile?.tags || [];
  const newTags = currentTags.filter((t) => t !== tag);

  await updateUserProfile(userId, { tags: newTags });
}

/**
 * Get top users by message count
 */
export async function getTopUsers(
  companyId: string,
  limit: number = 10
): Promise<WhatsAppUserProfile[]> {
  const { data, error } = await supabase
    .from('whatsapp_user_profiles')
    .select('*')
    .eq('company_id', companyId)
    .order('total_messages', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Get recently active users
 */
export async function getRecentlyActiveUsers(
  companyId: string,
  limit: number = 10
): Promise<WhatsAppUserProfile[]> {
  const { data, error } = await supabase
    .from('whatsapp_user_profiles')
    .select('*')
    .eq('company_id', companyId)
    .not('last_interaction', 'is', null)
    .order('last_interaction', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Get all user profiles for Super Admin with company details
 */
export async function getAllUserProfilesWithDetails(limit: number = 100): Promise<any[]> {
  console.log('📡 Fetching all user profiles with details for Super Admin');

  const { data, error } = await supabase
    .from('whatsapp_user_profiles')
    .select(`
      *,
      company:companies(id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching all user profiles:', error);
    throw error;
  }

  console.log('✅ Fetched', data?.length || 0, 'user profiles with details');
  return data || [];
}
