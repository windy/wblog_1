import { useQuery } from '@tanstack/react-query';
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Member } from '../types/database';
import { cacheManager } from '../utils/cache/cacheManager';

/**
 * 获取会员信息的 hook
 * @param memberId 会员ID
 */
export const useMember = (memberId: string) => {
  return useQuery({
    queryKey: ['member', memberId],
    queryFn: async () => {
      // 尝试从缓存获取
      const cached = await cacheManager.getCachedMember(memberId);
      if (cached) {
        return cached;
      }

      // 从数据库获取
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) {
        throw error;
      }

      // 缓存数据
      if (data) {
        await cacheManager.cacheMember(data);
      }

      return data as Member;
    },
    staleTime: 1000 * 60 * 5, // 5分钟后认为数据过期
    cacheTime: 1000 * 60 * 30, // 缓存保留30分钟
    retry: 2, // 失败重试2次
    onError: (error: PostgrestError) => {
      console.error('获取会员信息失败:', error);
    }
  });
};

/**
 * 获取会员签到记录的 hook
 * @param memberId 会员ID
 * @param options 查询选项
 */
export const useCheckInRecords = (memberId: string, options?: { 
  limit?: number;
  filters?: {
    startDate?: string;
    endDate?: string;
    classType?: ClassType;
    isExtra?: boolean;
  };
  pagination?: {
    page: number;
    pageSize: number;
  };
}) => {
  return useQuery({
    queryKey: ['checkIns', memberId, options],
    queryFn: async () => {
      // 使用现有的缓存逻辑
      if (!options?.filters && !options?.pagination) {
        const cached = await cacheManager.getCachedCheckins(memberId);
        if (cached) return cached;
      }

      let query = supabase
        .from('checkins')
        .select(`
          id,
          member_id,
          class_type,
          is_extra,
          created_at,
          check_in_date,
          members!checkins_member_id_fkey (
            id, name, email, membership, remaining_classes, membership_expiry
          )
        `, { count: 'exact' })
        .eq('member_id', memberId);

      // 应用过滤
      if (options?.filters) {
        const { startDate, endDate, classType, isExtra } = options.filters;
        if (startDate) query = query.gte('check_in_date', startDate);
        if (endDate) query = query.lte('check_in_date', endDate);
        if (classType) query = query.eq('class_type', classType);
        if (isExtra !== undefined) query = query.eq('is_extra', isExtra);
      }

      // 应用分页
      if (options?.pagination) {
        const { page, pageSize } = options.pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      } else if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error, count } = await query.order('check_in_date', { ascending: false });

      if (error) throw error;

      // 缓存未过滤的数据
      if (!options?.filters && !options?.pagination) {
        await cacheManager.cacheMember(data);
      }

      return {
        records: data,
        total: count || 0,
        page: options?.pagination?.page || 1,
        pageSize: options?.pagination?.pageSize || options?.limit || 50
      };
    }
  });
};