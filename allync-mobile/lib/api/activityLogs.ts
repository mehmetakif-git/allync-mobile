import { supabase } from '../supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface ActivityLog {
  id: string;
  company_id: string | null;
  user_id: string | null;
  action: string;
  action_category: string | null;
  entity_type: string | null;
  description: string | null;
  status: 'success' | 'failed' | 'pending' | 'warning';
  severity_level: 'info' | 'warning' | 'error' | 'critical';
  created_at: string;

  // Relations (joined data)
  user?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role: string;
  };
}

// =====================================================
// GET RECENT ACTIVITY LOGS FOR COMPANY
// =====================================================

/**
 * Get recent activity logs for a specific company
 */
export async function getRecentActivityLogs(
  companyId: string,
  limit: number = 10
): Promise<ActivityLog[]> {
  console.log('⏱️ [getRecentActivityLogs] Fetching recent logs for company:', companyId);

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles!user_id(id, full_name, email, avatar_url, role)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    console.log(`✅ [getRecentActivityLogs] Found ${data?.length || 0} logs`);
    return (data as ActivityLog[]) || [];
  } catch (error) {
    console.error('❌ [getRecentActivityLogs] Error:', error);
    return [];
  }
}

/**
 * Get activity logs for a specific user
 */
export async function getUserActivityLogs(
  userId: string,
  limit: number = 10
): Promise<ActivityLog[]> {
  console.log('👤 [getUserActivityLogs] Fetching logs for user:', userId);

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    console.log(`✅ [getUserActivityLogs] Found ${data?.length || 0} logs`);
    return (data as ActivityLog[]) || [];
  } catch (error) {
    console.error('❌ [getUserActivityLogs] Error:', error);
    return [];
  }
}
