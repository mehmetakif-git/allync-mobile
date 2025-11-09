// =====================================================
// Project Media API
// =====================================================
// For managing images/videos for website and mobile app projects

import { supabase } from '../supabase';

export interface ProjectMedia {
  id: string;
  project_id: string;
  project_type: 'website' | 'mobile-app';
  company_id: string;
  milestone_id?: string | null;
  milestone_name?: string | null;
  file_path: string;
  file_name: string;
  file_type: 'image' | 'video';
  mime_type: string;
  file_size: number;
  title?: string | null;
  description?: string | null;
  display_order: number;
  is_featured: boolean;
  uploaded_by: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
  signedUrl?: string; // Added for mobile to store signed URL
}

/**
 * Get all media for a project
 */
export async function getProjectMedia(projectId: string, projectType: 'website' | 'mobile-app'): Promise<ProjectMedia[]> {
  console.log('📱📡 Fetching project media for:', projectId, projectType);

  const { data, error } = await supabase
    .from('project_media')
    .select('*')
    .eq('project_id', projectId)
    .eq('project_type', projectType)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching project media:', error);
    throw error;
  }

  console.log('✅ Fetched', data?.length || 0, 'media items');
  return data || [];
}

/**
 * Get media by milestone
 */
export async function getMediaByMilestone(milestoneId: string): Promise<ProjectMedia[]> {
  const { data, error } = await supabase
    .from('project_media')
    .select('*')
    .eq('milestone_id', milestoneId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get all media for a company (across all projects)
 */
export async function getCompanyMedia(companyId: string, projectType?: 'website' | 'mobile-app'): Promise<ProjectMedia[]> {
  let query = supabase
    .from('project_media')
    .select('*')
    .eq('company_id', companyId);

  if (projectType) {
    query = query.eq('project_type', projectType);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get signed URL for media file (for private bucket)
 * Returns a temporary URL that expires in 1 hour
 */
export async function getMediaPublicUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('project-media')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error) {
    console.error('❌ Error creating signed URL:', error);
    throw error;
  }

  return data.signedUrl;
}

/**
 * Get featured media for a project
 */
export async function getFeaturedMedia(projectId: string, projectType: 'website' | 'mobile-app'): Promise<ProjectMedia[]> {
  const { data, error } = await supabase
    .from('project_media')
    .select('*')
    .eq('project_id', projectId)
    .eq('project_type', projectType)
    .eq('is_featured', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export default {
  getProjectMedia,
  getMediaByMilestone,
  getCompanyMedia,
  getMediaPublicUrl,
  getFeaturedMedia,
};
