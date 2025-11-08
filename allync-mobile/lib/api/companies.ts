import { supabase } from '../supabase';

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  country: string;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  tax_id?: string | null;
  registration_number?: string | null;
  billing_email?: string | null;
  website?: string | null;
  logo_url?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get company by ID
 */
export async function getCompanyById(companyId: string): Promise<Company> {
  console.log('🏢 [getCompanyById] Fetching company:', companyId);

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) {
    console.error('❌ [getCompanyById] Error:', error);
    throw error;
  }

  console.log('✅ [getCompanyById] Company found:', data.name);
  return data as Company;
}

/**
 * Get all service types
 */
export async function getServiceTypes() {
  console.log('📦 [getServiceTypes] Fetching service types');

  const { data, error } = await supabase
    .from('service_types')
    .select('*')
    .eq('status', 'active')
    .order('name_en', { ascending: true });

  if (error) {
    console.error('❌ [getServiceTypes] Error:', error);
    throw error;
  }

  console.log(`✅ [getServiceTypes] Found ${data?.length || 0} service types`);
  return data;
}
