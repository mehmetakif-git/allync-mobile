// =====================================================
// WhatsApp Instances API
// =====================================================

import { supabase } from '../supabase';
import type {
  WhatsAppInstance,
  WhatsAppInstanceWithStats,
  CreateInstanceFormData,
  UpdateInstanceFormData
} from '../../types/whatsapp';

/**
 * Get all WhatsApp instances for a company
 */
export async function getWhatsappInstancesByCompany(
  companyId: string
): Promise<WhatsAppInstance[]> {
  console.log('📡 Fetching WhatsApp instances for company:', companyId);

  const { data, error } = await supabase
    .from('whatsapp_instances')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching WhatsApp instances:', error);
    throw error;
  }

  console.log('✅ Fetched', data?.length || 0, 'WhatsApp instances');
  return data || [];
}

/**
 * Get WhatsApp instance by company_service_id
 */
export async function getWhatsappInstanceByCompanyService(
  companyServiceId: string
): Promise<WhatsAppInstance | null> {
  console.log('📡 Fetching WhatsApp instance for company service:', companyServiceId);

  // First get the company_id from company_services
  const { data: serviceData, error: serviceError } = await supabase
    .from('company_services')
    .select('company_id, service_type:service_types(slug)')
    .eq('id', companyServiceId)
    .single();

  if (serviceError) {
    console.error('❌ Error fetching company service:', serviceError);
    throw serviceError;
  }

  if (!serviceData || serviceData.service_type?.slug !== 'whatsapp-automation') {
    console.log('❌ Service is not WhatsApp or not found. Got slug:', serviceData?.service_type?.slug);
    return null;
  }

  // Get the WhatsApp instance for this company
  const { data, error } = await supabase
    .from('whatsapp_instances')
    .select('*')
    .eq('company_id', serviceData.company_id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('❌ Error fetching WhatsApp instance:', error);
    throw error;
  }

  console.log('✅ Fetched WhatsApp instance:', data?.id);
  return data;
}

/**
 * Get all WhatsApp instances with stats (for Super Admin)
 */
export async function getAllWhatsappInstancesWithStats(): Promise<WhatsAppInstanceWithStats[]> {
  console.log('📡 Fetching all WhatsApp instances with stats');

  const { data, error } = await supabase
    .from('whatsapp_instances')
    .select(`
      *,
      company:companies(id, name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching instances with stats:', error);
    throw error;
  }

  // Fetch stats for each instance
  const instancesWithStats = await Promise.all(
    (data || []).map(async (instance) => {
      // Get active sessions count
      const { count: activeSessions } = await supabase
        .from('whatsapp_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', instance.company_id)
        .eq('is_active', true);

      // Get today's messages count from whatsapp_messages
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { count: todayMessages } = await supabase
        .from('whatsapp_messages')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', instance.company_id)
        .gte('created_at', todayISO);

      // Get total users count
      const { count: totalUsers } = await supabase
        .from('whatsapp_user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', instance.company_id);

      // Get unresolved errors count
      const { count: errorCount } = await supabase
        .from('whatsapp_errors')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', instance.company_id)
        .eq('is_resolved', false);

      return {
        ...instance,
        stats: {
          active_sessions: activeSessions || 0,
          today_messages: todayMessages || 0,
          total_users: totalUsers || 0,
          error_count: errorCount || 0,
        },
      };
    })
  );

  console.log('✅ Fetched', instancesWithStats.length, 'instances with stats');
  return instancesWithStats;
}

/**
 * Create new WhatsApp instance
 */
export async function createWhatsappInstance(
  instanceData: any
): Promise<WhatsAppInstance> {
  console.log('📡 Creating WhatsApp instance for company:', instanceData);

  const { data, error } = await supabase
    .from('whatsapp_instances')
    .insert([instanceData])
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating WhatsApp instance:', error);
    throw error;
  }

  console.log('✅ WhatsApp instance created:', data?.id);
  return data;
}

/**
 * Update WhatsApp instance
 */
export async function updateWhatsappInstance(
  instanceId: string,
  updateData: any
): Promise<WhatsAppInstance> {
  console.log('📡 Updating WhatsApp instance:', instanceId);

  const { data, error } = await supabase
    .from('whatsapp_instances')
    .update(updateData)
    .eq('id', instanceId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error updating WhatsApp instance:', error);
    throw error;
  }

  console.log('✅ WhatsApp instance updated:', data?.id);
  return data;
}

/**
 * Delete WhatsApp instance
 */
export async function deleteWhatsappInstance(instanceId: string): Promise<void> {
  console.log('📡 Deleting WhatsApp instance:', instanceId);

  const { error } = await supabase
    .from('whatsapp_instances')
    .delete()
    .eq('id', instanceId);

  if (error) {
    console.error('❌ Error deleting WhatsApp instance:', error);
    throw error;
  }

  console.log('✅ WhatsApp instance deleted');
}

/**
 * Test Evolution API connection
 */
export async function testConnection(instanceId: string): Promise<{
  success: boolean;
  message: string;
  qr_code?: string;
}> {
  console.log('📡 Testing connection for instance:', instanceId);

  // Get instance details
  const { data: instance, error } = await supabase
    .from('whatsapp_instances')
    .select('evolution_api_url, evolution_api_key, instance_id, instance_name')
    .eq('id', instanceId)
    .single();

  if (error || !instance) {
    console.error('❌ Instance not found');
    return { success: false, message: 'Instance not found' };
  }

  try {
    // Clean up URL - remove trailing slash from base URL to prevent double slashes
    const baseUrl = instance.evolution_api_url.replace(/\/+$/, '');

    // Check connection state using Evolution API
    const connectionEndpoint = `${baseUrl}/instance/connectionState/${instance.instance_name}`;
    console.log('🔗 Testing connection at:', connectionEndpoint);
    console.log('📋 Instance name:', instance.instance_name);

    const response = await fetch(connectionEndpoint, {
      method: 'GET',
      headers: {
        'apikey': instance.evolution_api_key,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response status:', response.status, response.statusText);

    // Try to parse response
    let result;
    try {
      const text = await response.text();
      console.log('📄 Raw response:', text);
      result = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      return {
        success: false,
        message: 'Invalid response from Evolution API',
      };
    }

    console.log('📊 Parsed result:', result);

    // Check if instance is connected
    // Evolution API returns different formats, check multiple possibilities
    const isConnected =
      result.state === 'open' ||
      result.instance?.state === 'open' ||
      result.status === 'connected' ||
      result.instance?.status === 'connected';

    if (response.ok && isConnected) {
      // Update instance as connected
      await supabase
        .from('whatsapp_instances')
        .update({
          is_connected: true,
          last_connected_at: new Date().toISOString(),
        })
        .eq('id', instanceId);

      return {
        success: true,
        message: 'WhatsApp instance is connected and active!',
      };
    } else if (result.qr_code || result.instance?.qr_code) {
      // Return QR code for scanning
      return {
        success: false,
        message: 'Scan QR code to connect',
        qr_code: result.qr_code || result.instance?.qr_code,
      };
    } else {
      // Not connected - provide detailed message
      const stateMsg = result.state || result.instance?.state || 'unknown';
      return {
        success: false,
        message: `Instance state: ${stateMsg}. ${result.message || 'Please check Evolution API connection.'}`,
      };
    }
  } catch (err: any) {
    console.error('❌ Connection test failed:', err);
    return {
      success: false,
      message: `Connection test failed: ${err.message}`,
    };
  }
}

/**
 * Get QR code for instance
 */
export async function getQRCode(instanceId: string): Promise<string | null> {
  console.log('📡 Getting QR code for instance:', instanceId);

  const { data: instance, error } = await supabase
    .from('whatsapp_instances')
    .select('evolution_api_url, evolution_api_key, instance_id, instance_name')
    .eq('id', instanceId)
    .single();

  if (error || !instance) {
    console.error('❌ Instance not found');
    return null;
  }

  try {
    // Clean up URL
    const baseUrl = instance.evolution_api_url.replace(/\/+$/, '');
    const endpoint = `${baseUrl}/instance/connect/${instance.instance_name}`;
    console.log('🔗 QR Code endpoint:', endpoint);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': instance.evolution_api_key,
      },
    });

    const result = await response.json();

    if (result.qr_code) {
      // Update QR code in database
      await supabase
        .from('whatsapp_instances')
        .update({ qr_code: result.qr_code })
        .eq('id', instanceId);

      return result.qr_code;
    }

    return null;
  } catch (err) {
    console.error('❌ Failed to get QR code:', err);
    return null;
  }
}

/**
 * Toggle connection (connect/disconnect)
 */
export async function toggleConnection(
  instanceId: string,
  connect: boolean
): Promise<{ success: boolean; message: string }> {
  console.log(`📡 ${connect ? 'Connecting' : 'Disconnecting'} instance:`, instanceId);

  const { data: instance, error } = await supabase
    .from('whatsapp_instances')
    .select('evolution_api_url, evolution_api_key, instance_id, instance_name')
    .eq('id', instanceId)
    .single();

  if (error || !instance) {
    return { success: false, message: 'Instance not found' };
  }

  try {
    // Clean up URL
    const baseUrl = instance.evolution_api_url.replace(/\/+$/, '');
    const endpoint = connect ? 'connect' : 'logout';
    const url = `${baseUrl}/instance/${endpoint}/${instance.instance_name}`;
    console.log('🔗 Toggle connection endpoint:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': instance.evolution_api_key,
      },
    });

    if (response.ok) {
      await supabase
        .from('whatsapp_instances')
        .update({
          is_connected: connect,
          last_connected_at: connect ? new Date().toISOString() : null,
        })
        .eq('id', instanceId);

      return {
        success: true,
        message: connect ? 'Connected successfully' : 'Disconnected successfully',
      };
    }

    return { success: false, message: 'Failed to toggle connection' };
  } catch (err: any) {
    console.error('❌ Toggle connection failed:', err);
    return { success: false, message: err.message };
  }
}
