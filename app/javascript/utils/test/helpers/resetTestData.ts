import { supabase } from '../../../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

interface ResetResult {
  success: boolean;
  error?: string;
  details?: {
    checkInsDeleted?: number;
    membersReset?: number;
  };
}

/**
 * 重置测试数据
 * 该函数会执行以下操作：
 * 1. 删除所有测试签到记录
 * 2. 重置测试会员的课程数量和新会员状态
 * 
 * @returns 重置结果，包含成功状态和详细信息
 */
export const resetTestData = async (): Promise<ResetResult> => {
  try {
    // 清除测试签到记录
    const { data: deletedCheckIns, error: checkInsError } = await supabase
      .from('checkins')
      .delete()
      .eq('is_test', true)
      .select('id');

    if (checkInsError) {
      throw new Error(`删除签到记录失败: ${checkInsError.message}`);
    }

    // 重置测试会员数据
    const { data: updatedMembers, error: membersError } = await supabase
      .from('members')
      .update({
        remaining_classes: 10,
        is_new_member: false,
        extra_check_ins: 0
      })
      .eq('is_test', true)
      .select('id');

    if (membersError) {
      throw new Error(`重置会员数据失败: ${membersError.message}`);
    }

    return {
      success: true,
      details: {
        checkInsDeleted: deletedCheckIns?.length || 0,
        membersReset: updatedMembers?.length || 0
      }
    };

  } catch (error) {
    console.error('重置测试数据失败:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      details: {
        checkInsDeleted: 0,
        membersReset: 0
      }
    };
  }
};