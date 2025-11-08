import { supabase } from '../supabase';

// =====================================================
// INTERFACES
// =====================================================

export interface Company {
  id: string;
  name: string;
  email: string;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  tax_id?: string | null;
  phone?: string | null;
  payment_gateway?: string | null;
}

export interface Invoice {
  id: string;
  company_id: string;
  invoice_number: string;

  // Amounts
  subtotal: number;
  tax_rate: number | null;
  tax_amount: number | null;
  discount_amount: number | null;
  total_amount: number;
  currency: string;

  // Status & Dates
  status: 'pending' | 'paid' | 'cancelled' | 'overdue';
  issue_date: string;
  due_date: string;
  paid_at: string | null;

  // Payment Gateway
  payment_gateway: string | null;
  gateway_customer_id: string | null;
  gateway_payment_id: string | null;

  // PDF & Notes
  pdf_url: string | null;
  notes: string | null;
  internal_notes: string | null;
  metadata: any;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Relations
  company?: Company;
}

// =====================================================
// CRUD OPERATIONS
// =====================================================

// Get invoices by company (Company Admin)
export async function getInvoicesByCompany(companyId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      company:companies(
        id,
        name,
        email,
        address,
        city,
        postal_code,
        country,
        tax_id,
        phone,
        payment_gateway
      )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching company invoices:', error);
    throw error;
  }

  return data as Invoice[];
}

// Get invoice by ID
export async function getInvoiceById(invoiceId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }

  return data as Invoice;
}

// =====================================================
// HELPERS
// =====================================================

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Get invoice status color (React Native compatible)
export function getInvoiceStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'paid':
      return {
        bg: 'rgba(34, 197, 94, 0.1)',
        text: '#22c55e',
        border: 'rgba(34, 197, 94, 0.3)',
      };
    case 'pending':
      return {
        bg: 'rgba(234, 179, 8, 0.1)',
        text: '#eab308',
        border: 'rgba(234, 179, 8, 0.3)',
      };
    case 'overdue':
      return {
        bg: 'rgba(239, 68, 68, 0.1)',
        text: '#ef4444',
        border: 'rgba(239, 68, 68, 0.3)',
      };
    case 'cancelled':
      return {
        bg: 'rgba(156, 163, 175, 0.1)',
        text: '#9ca3af',
        border: 'rgba(156, 163, 175, 0.3)',
      };
    default:
      return {
        bg: 'rgba(156, 163, 175, 0.1)',
        text: '#9ca3af',
        border: 'rgba(156, 163, 175, 0.3)',
      };
  }
}

// Get payment gateway name
export function getPaymentGatewayName(gateway: string): string {
  switch (gateway) {
    case 'paytr':
      return 'PayTR';
    case 'stripe':
      return 'Stripe';
    case 'qpay':
      return 'QPay';
    case 'tappay':
      return 'Tappay';
    default:
      return gateway || 'Unknown';
  }
}

// Format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
