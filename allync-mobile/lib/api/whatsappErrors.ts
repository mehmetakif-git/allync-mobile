import { supabase } from '../supabase';

export interface WhatsAppError {
  id: string;
  company_id: string;
  instance_id: string | null;
  session_id: string | null;
  error_type: string;
  error_message: string;
  error_details: any | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export interface ErrorStatistics {
  total: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
  unresolved: number;
  resolved: number;
  recent_errors: WhatsAppError[];
}

/**
 * Get errors for a company
 */
export async function getErrors(
  companyId: string,
  filters?: {
    instanceId?: string;
    errorType?: string;
    severity?: string;
    isResolved?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<WhatsAppError[]> {
  let query = supabase
    .from('whatsapp_errors')
    .select('*')
    .eq('company_id', companyId);

  if (filters?.instanceId) {
    query = query.eq('instance_id', filters.instanceId);
  }

  if (filters?.errorType) {
    query = query.eq('error_type', filters.errorType);
  }

  if (filters?.severity) {
    query = query.eq('severity', filters.severity);
  }

  if (filters?.isResolved !== undefined) {
    query = query.eq('is_resolved', filters.isResolved);
  }

  query = query.order('created_at', { ascending: false });

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
 * Get error by ID
 */
export async function getErrorById(errorId: string): Promise<WhatsAppError | null> {
  const { data, error } = await supabase
    .from('whatsapp_errors')
    .select('*')
    .eq('id', errorId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Create error log
 */
export async function logError(
  error: Omit<WhatsAppError, 'id' | 'created_at' | 'is_resolved' | 'resolved_at' | 'resolved_by'>
): Promise<WhatsAppError> {
  const { data, error: dbError } = await supabase
    .from('whatsapp_errors')
    .insert({
      ...error,
      is_resolved: false
    })
    .select()
    .single();

  if (dbError) throw dbError;
  return data;
}

/**
 * Mark error as resolved
 */
export async function resolveError(
  errorId: string,
  resolvedBy: string
): Promise<WhatsAppError> {
  const { data, error } = await supabase
    .from('whatsapp_errors')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy
    })
    .eq('id', errorId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get error statistics
 */
export async function getErrorStatistics(
  companyId: string,
  dateRange?: { start: string; end: string }
): Promise<ErrorStatistics> {
  let query = supabase
    .from('whatsapp_errors')
    .select('*')
    .eq('company_id', companyId);

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);
  }

  const { data, error } = await query;

  if (error) throw error;

  const errors = data || [];

  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  let unresolved = 0;
  let resolved = 0;

  errors.forEach((err) => {
    // Count by type
    byType[err.error_type] = (byType[err.error_type] || 0) + 1;

    // Count by severity
    bySeverity[err.severity] = (bySeverity[err.severity] || 0) + 1;

    // Count resolved status
    if (err.is_resolved) {
      resolved++;
    } else {
      unresolved++;
    }
  });

  // Get 10 most recent errors
  const recentErrors = errors
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return {
    total: errors.length,
    by_type: byType,
    by_severity: bySeverity,
    unresolved,
    resolved,
    recent_errors: recentErrors
  };
}

/**
 * Get unresolved errors count
 */
export async function getUnresolvedErrorsCount(companyId: string): Promise<number> {
  const { count, error } = await supabase
    .from('whatsapp_errors')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('is_resolved', false);

  if (error) throw error;
  return count || 0;
}

/**
 * Get critical errors (unresolved high/critical severity)
 */
export async function getCriticalErrors(companyId: string): Promise<WhatsAppError[]> {
  const { data, error } = await supabase
    .from('whatsapp_errors')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_resolved', false)
    .in('severity', ['high', 'critical'])
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

/**
 * Bulk resolve errors
 */
export async function bulkResolveErrors(
  errorIds: string[],
  resolvedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('whatsapp_errors')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy
    })
    .in('id', errorIds);

  if (error) throw error;
}

/**
 * Delete old resolved errors (cleanup)
 */
export async function deleteOldResolvedErrors(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { data, error } = await supabase
    .from('whatsapp_errors')
    .delete()
    .eq('is_resolved', true)
    .lt('resolved_at', cutoffDate.toISOString())
    .select();

  if (error) throw error;
  return data?.length || 0;
}

/**
 * Get all errors for Super Admin with company details
 */
export async function getAllErrorsWithDetails(limit: number = 100): Promise<any[]> {
  console.log('📡 Fetching all errors with details for Super Admin');

  const { data, error } = await supabase
    .from('whatsapp_errors')
    .select(`
      *,
      company:companies(id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching all errors:', error);
    throw error;
  }

  console.log('✅ Fetched', data?.length || 0, 'errors with details');
  return data || [];
}
