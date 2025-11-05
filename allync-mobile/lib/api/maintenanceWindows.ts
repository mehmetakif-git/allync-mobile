import { supabase } from '../supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface MaintenanceWindow {
  id: string;
  scheduled_by: string;
  start_time: string;
  end_time: string;
  message_tr: string;
  message_en: string;
  affected_services: string[] | null;
  is_active: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
  scheduled_by_profile?: {
    full_name: string;
    email: string;
  };
}

// =====================================================
// GET ACTIVE MAINTENANCE WINDOW
// =====================================================

/**
 * Get currently active maintenance window (if any)
 */
export async function getActiveMaintenanceWindow(): Promise<MaintenanceWindow | null> {
  console.log('📅 [Mobile - getActiveMaintenanceWindow] Checking for active maintenance');

  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('maintenance_windows')
      .select(`
        *,
        scheduled_by_profile:profiles!scheduled_by(full_name, email)
      `)
      .eq('is_active', true)
      .lte('start_time', now)
      .gte('end_time', now)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ [Mobile - getActiveMaintenanceWindow] Error:', error);
      throw error;
    }

    if (data) {
      console.log('⚠️ [Mobile - getActiveMaintenanceWindow] Active maintenance found:', data.id);
    } else {
      console.log('✅ [Mobile - getActiveMaintenanceWindow] No active maintenance');
    }

    return data as MaintenanceWindow | null;
  } catch (error) {
    console.error('❌ [Mobile - getActiveMaintenanceWindow] Error:', error);
    return null;
  }
}

// =====================================================
// GET UPCOMING MAINTENANCE WINDOWS
// =====================================================

/**
 * Get upcoming maintenance windows
 */
export async function getUpcomingMaintenanceWindows(limit: number = 5): Promise<MaintenanceWindow[]> {
  console.log('📅 [Mobile - getUpcomingMaintenanceWindows] Fetching upcoming maintenance');

  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('maintenance_windows')
      .select(`
        *,
        scheduled_by_profile:profiles!scheduled_by(full_name, email)
      `)
      .eq('is_active', true)
      .gt('start_time', now)
      .order('start_time', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('❌ [Mobile - getUpcomingMaintenanceWindows] Error:', error);
      throw error;
    }

    console.log(`✅ [Mobile - getUpcomingMaintenanceWindows] Found ${data?.length || 0} upcoming windows`);
    return data as MaintenanceWindow[];
  } catch (error) {
    console.error('❌ [Mobile - getUpcomingMaintenanceWindows] Error:', error);
    throw error;
  }
}

// =====================================================
// CHECK IF IN MAINTENANCE
// =====================================================

/**
 * Simple check if system is currently in maintenance mode
 */
export async function isInMaintenance(): Promise<boolean> {
  console.log('🔍 [Mobile - isInMaintenance] Checking maintenance status');

  try {
    const activeWindow = await getActiveMaintenanceWindow();
    const result = activeWindow !== null;

    console.log(`✅ [Mobile - isInMaintenance] Status: ${result ? 'IN MAINTENANCE' : 'NORMAL'}`);
    return result;
  } catch (error) {
    console.error('❌ [Mobile - isInMaintenance] Error:', error);
    return false; // On error, assume no maintenance to avoid blocking users
  }
}

// =====================================================
// GET MAINTENANCE STATUS
// =====================================================

/**
 * Get comprehensive maintenance status
 */
export async function getMaintenanceStatus() {
  console.log('📊 [Mobile - getMaintenanceStatus] Getting full status');

  try {
    const [active, upcoming] = await Promise.all([
      getActiveMaintenanceWindow(),
      getUpcomingMaintenanceWindows(),
    ]);

    const status = {
      is_in_maintenance: active !== null,
      active_window: active,
      upcoming_windows: upcoming,
      next_maintenance: upcoming.length > 0 ? upcoming[0] : null,
    };

    console.log('✅ [Mobile - getMaintenanceStatus] Status retrieved');
    return status;
  } catch (error) {
    console.error('❌ [Mobile - getMaintenanceStatus] Error:', error);
    throw error;
  }
}

// =====================================================
// SUBSCRIBE TO MAINTENANCE CHANGES (REALTIME)
// =====================================================

/**
 * Subscribe to maintenance window changes for real-time updates
 */
export function subscribeToMaintenance(
  callback: (payload: any) => void
) {
  console.log('🔔 [Mobile - subscribeToMaintenance] Setting up realtime subscription');

  const subscription = supabase
    .channel('maintenance-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'maintenance_windows',
      },
      (payload) => {
        console.log('🔔 [Mobile - subscribeToMaintenance] Maintenance change detected:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Unsubscribe from maintenance changes
 */
export function unsubscribeFromMaintenance(subscription: any) {
  console.log('🔕 [Mobile - unsubscribeFromMaintenance] Cleaning up subscription');
  supabase.removeChannel(subscription);
}

// =====================================================
// EXPORT ALL
// =====================================================

export default {
  getActiveMaintenanceWindow,
  getUpcomingMaintenanceWindows,
  isInMaintenance,
  getMaintenanceStatus,
  subscribeToMaintenance,
  unsubscribeFromMaintenance,
};
