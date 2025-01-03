import { supabase } from '../../lib/supabase';
import { SearchParams } from '../../types/api';

export const searchCheckInRecords = async (params: SearchParams) => {
  const { memberName, startDate, endDate, page = 1, pageSize = 20 } = params;
  
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
        id,
        name,
        email,
        membership,
        remaining_classes,
        membership_expiry
      )
    `, { count: 'exact' });

  // 会员姓名搜索
  if (memberName) {
    const processedName = memberName.trim();
    query = query.filter('members!checkins_member_id_fkey.name', 'ilike', `%${processedName}%`);
  }

  // 日期范围过滤
  if (startDate) {
    query = query.gte('check_in_date', startDate);
  }
  if (endDate) {
    const endDateWithTime = new Date(endDate);
    endDateWithTime.setHours(23, 59, 59, 999);
    query = query.lte('check_in_date', endDateWithTime.toISOString());
  }

  // 添加排序和分页
  query = query
    .order('check_in_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  
  if (error) {
    console.error('Search check-in records error:', error);
    throw error;
  }
  
  // 处理返回数据
  const processedData = data?.map(record => ({
    ...record,
    members: record.members || { name: '未知会员' }
  }));

  return {
    records: processedData,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}; 