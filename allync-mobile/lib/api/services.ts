import { supabase } from '../supabase';

export interface PricingTier {
  price: number;
  currency?: string;
  period?: 'month' | 'year' | 'one-time';
  features_tr?: string[];
  features_en?: string[];
  limits?: Record<string, any>;
}

export interface Service {
  id: string;
  name_en: string;
  name_tr: string;
  slug: string;
  description_en: string;
  description_tr: string;
  short_description_en?: string;
  short_description_tr?: string;
  category: 'ai' | 'digital';
  status: 'active' | 'inactive' | 'maintenance';
  color?: string;
  features?: any;
  pricing_basic?: PricingTier | null;
  pricing_standard?: PricingTier | null;
  pricing_premium?: PricingTier | null;
  metadata?: Record<string, any> | null;
}

export interface CompanyService {
  id: string;
  company_id: string;
  service_type_id: string;
  package: 'basic' | 'standard' | 'premium';
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  company_id: string;
  service_type_id: string;
  package: 'basic' | 'standard' | 'premium';
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string;
  notes?: string;
  admin_notes?: string;
  created_at: string;
}

// Get all active services
export async function getActiveServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('service_types')
    .select('*')
    .eq('status', 'active')
    .order('name_en');

  if (error) {
    console.error('Error fetching services:', error);
    throw error;
  }

  return data || [];
}

// Get company's active services
export async function getCompanyServices(companyId: string): Promise<CompanyService[]> {
  const { data, error } = await supabase
    .from('company_services')
    .select('*')
    .eq('company_id', companyId);

  if (error) {
    console.error('Error fetching company services:', error);
    throw error;
  }

  return data || [];
}

// Get company's service requests
export async function getCompanyServiceRequests(companyId: string): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching service requests:', error);
    throw error;
  }

  return data || [];
}

// Create a new service request
export async function createServiceRequest(request: {
  company_id: string;
  service_type_id: string;
  package: 'basic' | 'standard' | 'premium';
  requested_by: string;
  notes?: string;
}): Promise<ServiceRequest> {
  const { data, error } = await supabase
    .from('service_requests')
    .insert([{
      ...request,
      status: 'pending',
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating service request:', error);
    throw error;
  }

  return data;
}
