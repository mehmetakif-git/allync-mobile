import { supabase } from '../supabase';

export interface DailyMetric {
  id: string;
  company_id: string;
  metric_date: string;
  total_messages: number;
  customer_messages: number;
  bot_messages: number;
  agent_messages: number;
  unique_users: number;
  active_sessions: number;
  avg_response_time: number | null;
  avg_session_duration: number | null;
  created_at: string;
}

export interface HourlyMetric {
  id: string;
  company_id: string;
  metric_hour: string;
  messages_count: number;
  sessions_count: number;
  users_count: number;
  created_at: string;
}

/**
 * Get daily metrics for a company
 */
export async function getDailyMetrics(
  companyId: string,
  dateRange: { start: string; end: string }
): Promise<DailyMetric[]> {
  const { data, error } = await supabase
    .from('whatsapp_metrics')
    .select('*')
    .eq('company_id', companyId)
    .gte('metric_date', dateRange.start)
    .lte('metric_date', dateRange.end)
    .order('metric_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get hourly metrics for a company (last 24 hours)
 */
export async function getHourlyMetrics(companyId: string): Promise<HourlyMetric[]> {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const { data, error } = await supabase
    .from('whatsapp_hourly_metrics')
    .select('*')
    .eq('company_id', companyId)
    .gte('metric_hour', twentyFourHoursAgo.toISOString())
    .order('metric_hour', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get latest daily metric for a company
 */
export async function getLatestDailyMetric(companyId: string): Promise<DailyMetric | null> {
  const { data, error } = await supabase
    .from('whatsapp_metrics')
    .select('*')
    .eq('company_id', companyId)
    .order('metric_date', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data || null;
}

/**
 * Get metrics comparison (current vs previous period)
 */
export async function getMetricsComparison(
  companyId: string,
  currentPeriod: { start: string; end: string }
): Promise<{
  current: DailyMetric[];
  previous: DailyMetric[];
  comparison: {
    messages: { value: number; change: number };
    users: { value: number; change: number };
    sessions: { value: number; change: number };
    responseTime: { value: number; change: number };
  };
}> {
  // Calculate previous period dates
  const currentStart = new Date(currentPeriod.start);
  const currentEnd = new Date(currentPeriod.end);
  const periodDuration = currentEnd.getTime() - currentStart.getTime();

  const previousStart = new Date(currentStart.getTime() - periodDuration);
  const previousEnd = new Date(currentStart.getTime() - 1);

  // Fetch both periods
  const [current, previous] = await Promise.all([
    getDailyMetrics(companyId, currentPeriod),
    getDailyMetrics(companyId, {
      start: previousStart.toISOString(),
      end: previousEnd.toISOString()
    })
  ]);

  // Calculate totals
  const currentTotals = current.reduce(
    (acc, metric) => ({
      messages: acc.messages + metric.total_messages,
      users: acc.users + metric.unique_users,
      sessions: acc.sessions + metric.active_sessions,
      responseTime: acc.responseTime + (metric.avg_response_time || 0),
      count: acc.count + 1
    }),
    { messages: 0, users: 0, sessions: 0, responseTime: 0, count: 0 }
  );

  const previousTotals = previous.reduce(
    (acc, metric) => ({
      messages: acc.messages + metric.total_messages,
      users: acc.users + metric.unique_users,
      sessions: acc.sessions + metric.active_sessions,
      responseTime: acc.responseTime + (metric.avg_response_time || 0),
      count: acc.count + 1
    }),
    { messages: 0, users: 0, sessions: 0, responseTime: 0, count: 0 }
  );

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    current,
    previous,
    comparison: {
      messages: {
        value: currentTotals.messages,
        change: calculateChange(currentTotals.messages, previousTotals.messages)
      },
      users: {
        value: currentTotals.users,
        change: calculateChange(currentTotals.users, previousTotals.users)
      },
      sessions: {
        value: currentTotals.sessions,
        change: calculateChange(currentTotals.sessions, previousTotals.sessions)
      },
      responseTime: {
        value: currentTotals.count > 0 ? currentTotals.responseTime / currentTotals.count : 0,
        change: calculateChange(
          currentTotals.count > 0 ? currentTotals.responseTime / currentTotals.count : 0,
          previousTotals.count > 0 ? previousTotals.responseTime / previousTotals.count : 0
        )
      }
    }
  };
}

/**
 * Aggregate metrics by time period (for charts)
 */
export async function getAggregatedMetrics(
  companyId: string,
  dateRange: { start: string; end: string },
  granularity: 'hour' | 'day' | 'week' = 'day'
): Promise<Array<{
  timestamp: string;
  messages: number;
  users: number;
  sessions: number;
}>> {
  if (granularity === 'hour') {
    const hourlyData = await getHourlyMetrics(companyId);
    return hourlyData.map((metric) => ({
      timestamp: metric.metric_hour,
      messages: metric.messages_count,
      users: metric.users_count,
      sessions: metric.sessions_count
    }));
  }

  const dailyData = await getDailyMetrics(companyId, dateRange);

  if (granularity === 'day') {
    return dailyData.map((metric) => ({
      timestamp: metric.metric_date,
      messages: metric.total_messages,
      users: metric.unique_users,
      sessions: metric.active_sessions
    }));
  }

  // Week aggregation
  const weeklyData: Record<string, { messages: number; users: number; sessions: number }> = {};

  dailyData.forEach((metric) => {
    const date = new Date(metric.metric_date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { messages: 0, users: 0, sessions: 0 };
    }

    weeklyData[weekKey].messages += metric.total_messages;
    weeklyData[weekKey].users += metric.unique_users;
    weeklyData[weekKey].sessions += metric.active_sessions;
  });

  return Object.entries(weeklyData)
    .map(([timestamp, data]) => ({
      timestamp,
      ...data
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
