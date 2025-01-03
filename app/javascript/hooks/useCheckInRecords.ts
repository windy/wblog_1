import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { CheckInRecord, CheckInFilters } from '../types';

export function useCheckInRecords(options: {
  memberId?: string;
  filters?: CheckInFilters;
  pagination?: {
    page: number;
    pageSize: number;
  };
}) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['checkInRecords', options],
    queryFn: async () => {
      // ... 查询逻辑
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5分钟
  });
}