import { supabase } from '../supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface DashboardStats {
  activeServicesCount: number;
  pendingInvoicesCount: number;
  pendingInvoicesAmount: number;
  openTicketsCount: number;
  urgentTicketsCount: number;
  totalSpent: number;
  currency: string;
}

export interface ActiveService {
  id: string;
  company_id: string;
  service_type_id: string;
  status: string;
  package: string;
  instance_name: string | null;
  created_at: string;
  service_type: {
    id: string;
    name_en: string;
    name_tr: string;
    slug: string;
    icon: string | null;
    status: string;
  };
}

// =====================================================
// GET COMPANY FROM USER
// =====================================================

/**
 * Get company_id for the current logged-in user
 */
export async function getUserCompanyId(userId: string): Promise<string | null> {
  console.log('📡 [getUserCompanyId] Fetching company for user:', userId);

  const { data, error } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('❌ [getUserCompanyId] Error:', error);
    return null;
  }

  console.log('✅ [getUserCompanyId] Company found:', data?.company_id);
  return data?.company_id || null;
}

// =====================================================
// GET DASHBOARD STATS
// =====================================================

/**
 * Get all dashboard statistics for a company
 * This fetches real-time data from Supabase
 */
export async function getDashboardStats(companyId: string): Promise<DashboardStats> {
  console.log('📊 [getDashboardStats] Fetching stats for company:', companyId);

  try {
    // Parallel fetch for better performance
    const [
      servicesResult,
      invoicesResult,
      ticketsResult,
    ] = await Promise.all([
      // Active services count
      supabase
        .from('company_services')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active'),

      // All invoices for this company
      supabase
        .from('invoices')
        .select('status, total_amount, currency')
        .eq('company_id', companyId),

      // All support tickets for this company
      supabase
        .from('support_tickets')
        .select('status, priority')
        .eq('company_id', companyId),
    ]);

    // Process services
    const activeServicesCount = servicesResult.count || 0;

    // Process invoices
    const invoices = invoicesResult.data || [];
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue');
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');

    const pendingInvoicesCount = pendingInvoices.length;
    const pendingInvoicesAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const totalSpent = paidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const currency = invoices[0]?.currency || 'USD';

    // Process tickets
    const tickets = ticketsResult.data || [];
    const openTicketsCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    const urgentTicketsCount = tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length;

    const stats: DashboardStats = {
      activeServicesCount,
      pendingInvoicesCount,
      pendingInvoicesAmount,
      openTicketsCount,
      urgentTicketsCount,
      totalSpent,
      currency,
    };

    console.log('✅ [getDashboardStats] Stats fetched:', stats);
    return stats;

  } catch (error) {
    console.error('❌ [getDashboardStats] Error:', error);

    // Return zero stats on error (don't crash the app)
    return {
      activeServicesCount: 0,
      pendingInvoicesCount: 0,
      pendingInvoicesAmount: 0,
      openTicketsCount: 0,
      urgentTicketsCount: 0,
      totalSpent: 0,
      currency: 'USD',
    };
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Format currency based on currency code
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const locale = currency === 'TRY' ? 'tr-TR' : currency === 'QAR' ? 'ar-QA' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Get change text for stats
 */
export function getChangeText(current: number, previous: number): string {
  const diff = current - previous;
  if (diff === 0) return 'No change';
  if (diff > 0) return `+${diff} this month`;
  return `${diff} this month`;
}

// =====================================================
// GET ACTIVE SERVICES
// =====================================================

/**
 * Get all active services for a company
 */
export async function getActiveServices(companyId: string): Promise<ActiveService[]> {
  console.log('🔧 [getActiveServices] Fetching active services for company:', companyId);

  try {
    const { data, error } = await supabase
      .from('company_services')
      .select(`
        *,
        service_type:service_types!service_type_id(id, name_en, name_tr, slug, icon, status)
      `)
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ [getActiveServices] Found ${data?.length || 0} active services`);
    return (data as ActiveService[]) || [];
  } catch (error) {
    console.error('❌ [getActiveServices] Error:', error);
    return [];
  }
}
