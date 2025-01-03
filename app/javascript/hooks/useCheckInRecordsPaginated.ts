import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CheckIn, ClassType } from '../types/database';

interface FetchRecordsParams {
  memberName?: string;
  startDate?: string;
  endDate?: string;
  classType?: ClassType;
  isExtra?: boolean;
  page?: number;
  pageSize?: number;
}

interface CheckInStats {
  total: number;
  regular: number;
  extra: number;
}

interface UseCheckInRecordsPaginatedProps {
  initialPageSize?: number;
  memberId?: string;
}

export function useCheckInRecordsPaginated({ 
  initialPageSize = 10,
  memberId
}: UseCheckInRecordsPaginatedProps = {}) {
  const [records, setRecords] = useState<CheckIn[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CheckInStats>({ total: 0, regular: 0, extra: 0 });

  const fetchStats = useCallback(async (params: FetchRecordsParams) => {
    try {
      // 创建独立的统计查询
      const { data: statsData, error: statsError } = await supabase.rpc(
        'get_checkin_stats',
        {
          params: {
            p_member_name: params.memberName?.trim() || null,
            p_member_id: memberId || null,
            p_start_date: params.startDate || null,
            p_end_date: params.endDate || null,
            p_class_type: params.classType || null,
            p_is_extra: params.isExtra || null
          }
        }
      );

      if (statsError) {
        console.error('Stats error:', statsError);
        throw statsError;
      }

      if (!statsData) {
        console.warn('No stats data returned');
        return { total: 0, regular: 0, extra: 0 };
      }

      console.log('Stats data:', statsData);
      return statsData;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { total: 0, regular: 0, extra: 0 };
    }
  }, [memberId]);

  const fetchRecords = useCallback(async ({
    memberName,
    startDate,
    endDate,
    classType,
    isExtra,
    page = 1,
    pageSize = initialPageSize
  }: FetchRecordsParams) => {
    try {
      setLoading(true);
      setError(null);

      // 获取分页数据
      let query = supabase
        .from('checkins')
        .select(`
          id,
          member_id,
          class_type,
          is_extra,
          created_at,
          check_in_date,
          members (
            id,
            name,
            email,
            membership,
            remaining_classes,
            membership_expiry
          )
        `, {
          count: 'exact'
        });

      // 应用过滤条件
      if (memberId) {
        query = query.eq('member_id', memberId);
      } else if (memberName) {
        // 先找到匹配的会员ID
        const { data: memberData } = await supabase
          .from('members')
          .select('id')
          .ilike('name', `%${memberName.trim()}%`);

        if (memberData && memberData.length > 0) {
          const memberIds = memberData.map(m => m.id);
          query = query.in('member_id', memberIds);
        } else {
          // 如果没有找到匹配的会员，返回空结果
          setRecords([]);
          setTotalCount(0);
          setCurrentPage(1);
          setTotalPages(0);
          setStats({ total: 0, regular: 0, extra: 0 });
          setLoading(false);
          return;
        }
      }

      if (startDate) {
        query = query.gte('check_in_date', startDate);
      }

      if (endDate) {
        const endDateWithTime = new Date(endDate);
        endDateWithTime.setHours(23, 59, 59, 999);
        query = query.lte('check_in_date', endDateWithTime.toISOString());
      }

      if (classType) {
        query = query.eq('class_type', classType);
      }

      if (isExtra !== undefined) {
        query = query.eq('is_extra', isExtra);
      }

      // 添加排序和分页
      query = query
        .order('check_in_date', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      if (!data) {
        setRecords([]);
        setTotalCount(0);
        setCurrentPage(1);
        setTotalPages(0);
        setStats({ total: 0, regular: 0, extra: 0 });
        return;
      }

      // 更新状态
      const processedData = data.map(record => {
        const members = record.members as unknown as {
          id: string;
          name: string;
          email: string;
          membership: string | null;
          remaining_classes: number | null;
          membership_expiry: string | null;
        };

        if (!members || !members.name) {
          return null;
        }

        const memberData = {
          id: members.id,
          name: members.name,
          email: members.email || '',
          membership: members.membership || null,
          remaining_classes: members.remaining_classes || null,
          membership_expiry: members.membership_expiry || null
        };

        return {
          id: record.id,
          member_id: record.member_id,
          class_type: record.class_type as ClassType,
          is_extra: record.is_extra,
          created_at: record.created_at,
          check_in_date: record.check_in_date,
          members: memberData
        };
      }).filter((record): record is CheckIn => record !== null);
      
      setRecords(processedData);
      setTotalCount(count || 0);
      setCurrentPage(page);
      setTotalPages(Math.ceil((count || 0) / pageSize));

      // 获取统计数据
      const statsData = await fetchStats({
        memberName,
        startDate,
        endDate,
        classType,
        isExtra
      });
      setStats(statsData);

    } catch (error) {
      console.error('Error fetching check-in records:', error);
      setError(error instanceof Error ? error.message : '获取签到记录失败');
      setRecords([]);
      setTotalCount(0);
      setCurrentPage(1);
      setTotalPages(0);
      setStats({ total: 0, regular: 0, extra: 0 });
    } finally {
      setLoading(false);
    }
  }, [memberId, initialPageSize, fetchStats]);

  return {
    records,
    totalCount,
    currentPage,
    totalPages,
    loading,
    error,
    fetchRecords,
    stats
  };
}