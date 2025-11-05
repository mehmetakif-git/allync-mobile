import { supabase } from '../supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface CompanyService {
  id: string;
  company_id: string;
  service_type_id: string;
  instance_name?: string;
  package: 'basic' | 'pro' | 'premium' | 'custom';
  status: 'active' | 'suspended' | 'inactive' | 'maintenance';
  start_date: string;
  end_date: string | null;
  next_billing_date: string | null;
  usage_limits: any;
  current_usage: any;
  metadata: any;
  price_amount: number | null;
  price_currency: string;
  billing_cycle: 'monthly' | 'yearly' | 'one-time' | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceType {
  id: string;
  name_en: string;
  name_tr: string;
  slug: string;
  category: string;
  icon: string | null;
  color: string | null;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface CompanyServiceWithDetails extends CompanyService {
  service_type: ServiceType;
}

// =====================================================
// GET COMPANY SERVICES
// =====================================================

/**
 * Get all services for a company
 */
export async function getCompanyServices(companyId: string): Promise<CompanyServiceWithDetails[]> {
  console.log('📡 [Mobile - getCompanyServices] Fetching services for company:', companyId);

  try {
    const { data, error } = await supabase
      .from('company_services')
      .select(`
        *,
        service_type:service_types(
          id,
          name_en,
          name_tr,
          slug,
          category,
          icon,
          color,
          status
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [Mobile - getCompanyServices] Error:', error);
      throw error;
    }

    console.log(`✅ [Mobile - getCompanyServices] Found ${data?.length || 0} services`);
    return data as CompanyServiceWithDetails[];
  } catch (error) {
    console.error('❌ [Mobile - getCompanyServices] Error:', error);
    throw error;
  }
}

/**
 * Get single company service by ID
 */
export async function getCompanyServiceById(serviceId: string): Promise<CompanyServiceWithDetails> {
  console.log('📡 [Mobile - getCompanyServiceById] Fetching service:', serviceId);

  try {
    const { data, error } = await supabase
      .from('company_services')
      .select(`
        *,
        service_type:service_types(
          id,
          name_en,
          name_tr,
          slug,
          category,
          icon,
          color,
          status
        )
      `)
      .eq('id', serviceId)
      .single();

    if (error) {
      console.error('❌ [Mobile - getCompanyServiceById] Error:', error);
      throw error;
    }

    console.log('✅ [Mobile - getCompanyServiceById] Service found');
    return data as CompanyServiceWithDetails;
  } catch (error) {
    console.error('❌ [Mobile - getCompanyServiceById] Error:', error);
    throw error;
  }
}

/**
 * Get active services (excluding inactive/deleted)
 */
export async function getActiveServices(companyId: string): Promise<CompanyServiceWithDetails[]> {
  console.log('📡 [Mobile - getActiveServices] Fetching active services for company:', companyId);

  try {
    const allServices = await getCompanyServices(companyId);

    // Filter to show active AND maintenance services (but not inactive/suspended)
    const activeServices = allServices.filter(
      (s) => s.status === 'active' || s.status === 'maintenance'
    );

    console.log(`✅ [Mobile - getActiveServices] Found ${activeServices.length} active services`);
    return activeServices;
  } catch (error) {
    console.error('❌ [Mobile - getActiveServices] Error:', error);
    throw error;
  }
}

// =====================================================
// SERVICE ICON MAPPING
// =====================================================

export const SERVICE_ICON_MAP: Record<string, string> = {
  'whatsapp-automation': 'logo-whatsapp',
  'instagram-automation': 'logo-instagram',
  'google-calendar-integration': 'calendar',
  'google-calendar': 'calendar',
  'google-sheets-integration': 'grid',
  'google-sheets': 'grid',
  'gmail-integration': 'mail',
  'gmail': 'mail',
  'google-docs-integration': 'document-text',
  'google-docs': 'document-text',
  'google-drive-integration': 'folder',
  'google-drive': 'folder',
  'google-photos-integration': 'images',
  'google-photos': 'images',
  'voice-cloning': 'mic',
  'sentiment-analysis': 'heart',
  'website-development': 'globe',
  'mobile-app-development': 'phone-portrait',
};

/**
 * Get icon name for a service slug
 */
export function getServiceIcon(slug: string): string {
  return SERVICE_ICON_MAP[slug] || 'server';
}

// =====================================================
// SERVICE PATH MAPPING
// =====================================================

export const SERVICE_PATH_MAP: Record<string, string> = {
  'whatsapp-automation': 'whatsapp',
  'instagram-automation': 'instagram',
  'google-calendar-integration': 'calendar',
  'google-sheets-integration': 'sheets',
  'gmail-integration': 'gmail',
  'google-docs-integration': 'docs',
  'google-drive-integration': 'drive',
  'google-photos-integration': 'photos',
  'website-development': 'website',
  'mobile-app-development': 'mobile-app',
};

/**
 * Get service path for navigation
 */
export function getServicePath(slug: string, companyServiceId?: string): string {
  const basePath = SERVICE_PATH_MAP[slug] || slug;
  return companyServiceId ? `/services/${basePath}/${companyServiceId}` : `/services/${basePath}`;
}

// =====================================================
// UPDATE SERVICE STATUS
// =====================================================

/**
 * Update service status
 */
export async function updateServiceStatus(
  serviceId: string,
  status: 'active' | 'suspended' | 'inactive' | 'maintenance',
  reason?: string
): Promise<CompanyServiceWithDetails> {
  console.log('🔄 [Mobile - updateServiceStatus] Updating status:', { serviceId, status, reason });

  try {
    // Get current service
    const currentService = await getCompanyServiceById(serviceId);

    // Update metadata with reason if provided
    const updatedMetadata = { ...currentService.metadata };

    if (reason) {
      if (status === 'maintenance') {
        updatedMetadata.maintenance_reason = reason;
        updatedMetadata.maintenance_set_at = new Date().toISOString();
      } else if (status === 'suspended') {
        updatedMetadata.suspension_reason = reason;
        updatedMetadata.suspended_at = new Date().toISOString();
      } else if (status === 'inactive') {
        updatedMetadata.inactive_reason = reason;
        updatedMetadata.inactive_set_at = new Date().toISOString();
      }
    } else if (status === 'active') {
      // Clear status-specific metadata when returning to active
      delete updatedMetadata.maintenance_reason;
      delete updatedMetadata.maintenance_set_at;
      delete updatedMetadata.suspension_reason;
      delete updatedMetadata.suspended_at;
      delete updatedMetadata.inactive_reason;
      delete updatedMetadata.inactive_set_at;
      updatedMetadata.reactivated_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('company_services')
      .update({
        status,
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', serviceId)
      .select(`
        *,
        service_type:service_types(
          id,
          name_en,
          name_tr,
          slug,
          category,
          icon,
          color,
          status
        )
      `)
      .single();

    if (error) {
      console.error('❌ [Mobile - updateServiceStatus] Error:', error);
      throw error;
    }

    console.log('✅ [Mobile - updateServiceStatus] Status updated successfully');
    return data as CompanyServiceWithDetails;
  } catch (error) {
    console.error('❌ [Mobile - updateServiceStatus] Error:', error);
    throw error;
  }
}
