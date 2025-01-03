import { supabase } from '../../lib/supabase';
import { memberCache, checkInCache } from './cacheManager';

/**
 * Optimizes database queries with caching
 */
export const queryOptimizer = {
  // Batch fetch members with cache
  async batchGetMembers(ids: string[]) {
    const uncachedIds = ids.filter(id => !memberCache.get(id));
    
    if (uncachedIds.length > 0) {
      const { data } = await supabase
        .from('members')
        .select('*')
        .in('id', uncachedIds);
        
      data?.forEach(member => {
        memberCache.set(member.id, member);
      });
    }
    
    return ids.map(id => memberCache.get(id));
  },

  // Get check-in records with cache
  async getCheckInRecords(memberId: string, limit: number = 10) {
    const cacheKey = `checkins:${memberId}:${limit}`;
    const cached = checkInCache.get(cacheKey);
    
    if (cached) return cached;

    const { data } = await supabase
      .from('checkins')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (data) {
      checkInCache.set(cacheKey, data);
    }
    
    return data || [];
  }
};

/**
 * 获取指定日期范围内的签到记录
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 签到记录数组
 */
export const getCheckInsByDateRange = async (startDate: Date, endDate: Date) => {
  try {
    const { data, error } = await supabase
      .from('checkins')
      .select(`
        *,
        members (
          name,
          email,
          membership,
          membership_expiry
        )
      `)
      .gte('check_in_date', startDate.toISOString())
      .lte('check_in_date', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to fetch check-ins:', error);
    throw error;
  }
};