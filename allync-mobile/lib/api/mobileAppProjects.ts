import { supabase } from '../supabase';

export interface MobileAppMilestone {
  id: string;
  project_id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  progress: number;
  notes?: string;
  completed_date?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MobileAppProject {
  id: string;
  company_id?: string | null;
  company_service_id: string;
  project_name?: string | null;
  platform: string; // 'android' | 'ios' | 'both'
  app_name: string;
  package_name?: string | null;
  bundle_id?: string | null;
  play_store_status?: string | null;
  play_store_url?: string | null;
  app_store_status?: string | null;
  app_store_url?: string | null;
  estimated_completion?: string | null;
  overall_progress?: number | null;
  status?: string | null;
  last_update?: string | null;
  milestones?: MobileAppMilestone[];
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Get project by company service ID (for specific service instance)
 */
export async function getMobileAppProjectByCompanyService(
  companyServiceId: string
): Promise<MobileAppProject | null> {
  console.log('📱 [getMobileAppProjectByCompanyService] Fetching project for service:', companyServiceId);

  try {
    const { data, error } = await supabase
      .from('mobile_app_projects')
      .select(`
        *,
        milestones:mobile_app_milestones!mobile_app_milestones_project_id_fkey(*)
      `)
      .eq('company_service_id', companyServiceId)
      .order('display_order', { referencedTable: 'mobile_app_milestones', ascending: true })
      .single();

    if (error) {
      // If no project found, return null instead of throwing
      if (error.code === 'PGRST116') {
        console.log('⚠️ [getMobileAppProjectByCompanyService] No project found for service');
        return null;
      }
      throw error;
    }

    console.log('✅ [getMobileAppProjectByCompanyService] Project found:', data.app_name);
    return data as MobileAppProject;
  } catch (error) {
    console.error('❌ [getMobileAppProjectByCompanyService] Error:', error);
    throw error;
  }
}

/**
 * Get all mobile app projects for a company
 */
export async function getMobileAppProjectsByCompany(companyId: string): Promise<MobileAppProject[]> {
  console.log('📱 [getMobileAppProjectsByCompany] Fetching projects for company:', companyId);

  try {
    const { data, error } = await supabase
      .from('mobile_app_projects')
      .select(`
        *,
        milestones:mobile_app_milestones!mobile_app_milestones_project_id_fkey(*)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .order('display_order', { referencedTable: 'mobile_app_milestones', ascending: true });

    if (error) throw error;

    console.log(`✅ [getMobileAppProjectsByCompany] Found ${data?.length || 0} projects`);
    return (data as MobileAppProject[]) || [];
  } catch (error) {
    console.error('❌ [getMobileAppProjectsByCompany] Error:', error);
    return [];
  }
}

// Helper functions
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Less than an hour ago';
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return '1 day ago';
  return `${diffInDays} days ago`;
};

export const platformLabels: Record<string, string> = {
  'android': 'Android',
  'ios': 'iOS',
  'both': 'Android & iOS'
};

export const storeStatusLabels: Record<string, string> = {
  'pending': 'Pending',
  'submitted': 'Submitted',
  'in-review': 'In Review',
  'approved': 'Approved',
  'published': 'Published',
  'rejected': 'Rejected'
};

export const milestoneStatusLabels: Record<string, string> = {
  'completed': 'Completed',
  'in-progress': 'In Progress',
  'pending': 'Pending',
  'blocked': 'Blocked'
};

export const getMilestoneStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return '#22C55E'; // green
    case 'in-progress': return '#3B82F6'; // blue
    case 'pending': return '#9CA3AF'; // gray
    case 'blocked': return '#EF4444'; // red
    default: return '#9CA3AF';
  }
};

export const getStoreStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return { bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.3)', text: '#9CA3AF' };
    case 'submitted': return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#3B82F6' };
    case 'in-review': return { bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.3)', text: '#EAB308' };
    case 'approved': return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22C55E' };
    case 'published': return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22C55E' };
    case 'rejected': return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#EF4444' };
    default: return { bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.3)', text: '#9CA3AF' };
  }
};
