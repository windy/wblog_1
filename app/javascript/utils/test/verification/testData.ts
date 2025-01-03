import { supabase } from '../../../lib/supabase';
import { Member, CheckIn } from '../../../types/database';

interface VerificationResult {
  checkIns: CheckIn[];
  members: Member[];
}

/**
 * 验证测试数据
 * @returns 验证结果，包含测试会员和签到记录
 */
export const verifyTestData = async (): Promise<VerificationResult> => {
  try {
    // 验证测试签到记录
    const { data: checkIns, error: checkInsError } = await supabase
      .from('checkins')
      .select('*')
      .eq('is_test', true);

    if (checkInsError) throw checkInsError;

    // 验证测试会员
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .eq('is_test', true);

    if (membersError) throw membersError;

    // 验证数据完整性
    const invalidCheckIns = checkIns.filter(checkIn => 
      !members.some(member => member.id === checkIn.member_id)
    );

    if (invalidCheckIns.length > 0) {
      throw new Error(
        `发现 ${invalidCheckIns.length} 条无效的签到记录，这些记录引用了不存在的会员ID`
      );
    }

    return {
      checkIns,
      members
    };
  } catch (error) {
    console.error('Failed to verify test data:', error);
    throw error;
  }
};