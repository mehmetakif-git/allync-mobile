import { supabase } from '../supabase';

export interface WebsiteMilestone {
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

export interface WebsiteProject {
  id: string;
  company_id?: string | null;
  company_service_id: string;
  project_name: string;
  project_type: 'e-commerce' | 'corporate' | 'personal';
  domain?: string | null;
  email?: string | null;
  estimated_completion?: string | null;
  overall_progress?: number | null;
  status?: string | null;
  last_update?: string | null;
  milestones?: WebsiteMilestone[];
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Get project by company service ID (for specific service instance)
 */
export async function getWebsiteProjectByCompanyService(
  companyServiceId: string
): Promise<WebsiteProject | null> {
  console.log('🌐 [getWebsiteProjectByCompanyService] Fetching project for service:', companyServiceId);

  try {
    const { data, error } = await supabase
      .from('website_projects')
      .select(`
        *,
        milestones:website_milestones(*)
      `)
      .eq('company_service_id', companyServiceId)
      .order('display_order', { foreignTable: 'website_milestones', ascending: true })
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ No website project found for service:', companyServiceId);
        return null;
      }
      throw error;
    }

    console.log('✅ [getWebsiteProjectByCompanyService] Project fetched:', data);
    return data;
  } catch (err) {
    console.error('❌ [getWebsiteProjectByCompanyService] Error:', err);
    throw err;
  }
}

// Helper functions
export const projectTypeLabels: Record<string, string> = {
  'e-commerce': 'E-commerce Website',
  'corporate': 'Corporate Website',
  'personal': 'Personal Website',
};

export const statusLabels: Record<string, string> = {
  'completed': 'Completed',
  'in-progress': 'In Progress',
  'pending': 'Pending',
  'blocked': 'Blocked',
};

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Less than an hour ago';
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return '1 day ago';
  return `${diffInDays} days ago`;
}

export function getMilestoneStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return '#10b981'; // green-500
    case 'in-progress':
      return '#3b82f6'; // blue-500
    case 'pending':
      return '#6b7280'; // gray-500
    case 'blocked':
      return '#ef4444'; // red-500
    default:
      return '#6b7280';
  }
}
