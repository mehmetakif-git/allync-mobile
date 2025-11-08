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
  ip_address?: string | null;
  user_agent?: string | null;
  browser?: string | null;
  device_type?: string | null;
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

export interface ActivityLogFilters {
  company_id?: string;
  user_id?: string;
  action?: string;
  action_category?: string;
  entity_type?: string;
  status?: 'success' | 'failed' | 'pending' | 'warning';
  severity_level?: 'info' | 'warning' | 'error' | 'critical';
  device_type?: string;
  start_date?: string;
  end_date?: string;
  has_error?: boolean;
  tags?: string[];
  search?: string;
}

export interface ActivityLogQueryOptions {
  filters?: ActivityLogFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  includeUser?: boolean;
  includeCompany?: boolean;
}

export interface PaginatedActivityLogs {
  data: ActivityLog[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
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

/**
 * Get activity logs with advanced filtering
 * (Compatible with Settings page)
 */
export async function getActivityLogs(
  options: ActivityLogQueryOptions = {}
): Promise<PaginatedActivityLogs> {
  console.log('📋 [getActivityLogs] Fetching logs with options:', options);

  try {
    const {
      filters = {},
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit = 50,
      offset = 0,
      includeUser = true,
    } = options;

    // Build query with relations
    let selectQuery = '*';

    if (includeUser) {
      selectQuery = `
        *,
        user:profiles!user_id(id, full_name, email, avatar_url, role)
      `;
    }

    let query = supabase.from('activity_logs').select(selectQuery, { count: 'exact' });

    // Apply filters
    if (filters.company_id) {
      query = query.eq('company_id', filters.company_id);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.action_category) {
      query = query.eq('action_category', filters.action_category);
    }
    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.severity_level) {
      query = query.eq('severity_level', filters.severity_level);
    }
    if (filters.device_type) {
      query = query.eq('device_type', filters.device_type);
    }
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters.search) {
      query = query.or(
        `action.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    // Apply sorting and pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalPages = count ? Math.ceil(count / limit) : 0;
    const page = Math.floor(offset / limit) + 1;

    console.log(`✅ [getActivityLogs] Found ${data?.length || 0} logs (total: ${count})`);

    return {
      data: (data as ActivityLog[]) || [],
      count: count || 0,
      page,
      pageSize: limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [getActivityLogs] Error:', error);
    return {
      data: [],
      count: 0,
      page: 1,
      pageSize: limit || 50,
      totalPages: 0,
    };
  }
}
