import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface CheckInStats {
  totalCheckins: number;
  extraCheckins: number;
  regularCheckins: number;
  memberStats: {
    name: string;
    totalCheckins: number;
    extraCheckins: number;
    regularCheckins: number;
  }[];
}

interface StatsFilters {
  memberName?: string;
  startDate?: string;
  endDate?: string;
  classType?: string;
  isExtra?: boolean;
}

export function useCheckInStats() {
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (filters?: StatsFilters) => {
    try {
      setLoading(true);
      setError(null);

      // 基础查询
      let query = supabase
        .from('checkins')
        .select(`
          id,
          member_id,
          class_type,
          is_extra,
          created_at,
          check_in_date,
          members!inner (
            id,
            name
          )
        `);

      // 应用过滤条件
      if (filters?.memberName) {
        query = query.filter('members.name', 'ilike', `%${filters.memberName}%`);
      }
      if (filters?.startDate) {
        query = query.gte('check_in_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('check_in_date', filters.endDate);
      }
      if (filters?.classType) {
        query = query.eq('class_type', filters.classType);
      }
      if (filters?.isExtra !== undefined) {
        query = query.eq('is_extra', filters.isExtra);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      // 处理统计数据
      const stats = processStatsData(data);
      setStats(stats);

    } catch (err) {
      console.error('Error fetching check-in stats:', err);
      setError(err instanceof Error ? err.message : '获取统计数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats
  };
} 