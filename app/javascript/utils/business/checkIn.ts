import { supabase } from '../../lib/supabase';
import { CheckInParams, CheckInResult, CheckInValidationResult } from '../types/checkIn';

/**
 * 验证签到信息
 * @param name 会员姓名
 * @param email 会员邮箱（可选）
 * @returns 验证结果
 */
export const validateCheckIn = async (
  name: string, 
  email?: string
): Promise<CheckInValidationResult> => {
  try {
    console.log('开始验证签到信息:', { name, email });

    // 1. 构建基础查询
    const query = supabase
      .from('members')
      .select('id, email, name')
      .eq('name', name);

    // 2. 执行查询
    const { data: members, error: memberError } = await query;

    if (memberError) {
      console.error('查找会员失败:', memberError);
      throw memberError;
    }

    // 3. 如果没有找到会员
    if (!members || members.length === 0) {
      console.log('未找到会员:', name);
      return {
        needs_email: false,
        error: '会员不存在'
      };
    }

    console.log('找到会员:', members);

    // 4. 如果有多个会员
    if (members.length > 1) {
      // 4.1 如果没有提供邮箱
      if (!email) {
        console.log('找到多个会员，需要邮箱:', members);
        return {
          needs_email: true,
          error: '存在多个同名会员，请提供邮箱'
        };
      }

      // 4.2 如果提供了邮箱，查找匹配的会员
      const member = members.find(m => m.email === email);
      if (!member) {
        console.log('未找到匹配邮箱的会员:', { email, members });
        return {
          needs_email: true,
          error: '邮箱不匹配'
        };
      }

      console.log('找到匹配邮箱的会员:', member);
      return {
        needs_email: false,
        member_id: member.id
      };
    }

    // 5. 如果只有一个会员
    const member = members[0];

    // 5.1 如果提供了邮箱，验证是否匹配
    if (email && member.email !== email) {
      console.log('邮箱不匹配:', { expected: member.email, actual: email });
      return {
        needs_email: false,
        error: '邮箱不匹配'
      };
    }

    console.log('找到唯一会员:', member);
    return {
      needs_email: false,
      member_id: member.id
    };
  } catch (error) {
    console.error('验证签到信息失败:', error);
    return {
      needs_email: false,
      error: error instanceof Error ? error.message : '验证失败'
    };
  }
};

/**
 * 执行签到操作
 * @param params 签到参数
 * @returns 签到结果
 */
export const checkIn = async (
  params: CheckInParams
): Promise<CheckInResult> => {
  try {
    console.log('开始签到:', { params });
    const { name, email, classType } = params;

    // 1. 验证签到信息
    const validation = await validateCheckIn(name, email);
    console.log('验证结果:', validation);
    
    if (validation.needs_email && !email) {
      throw new Error('需要提供邮箱');
    }

    if (!validation.member_id) {
      throw new Error(validation.error || '会员不存在');
    }

    const memberId = validation.member_id;

    // 2. 获取会员信息
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (memberError) {
      console.error('获取会员信息失败:', memberError);
      throw memberError;
    }

    if (!member) {
      console.error('未找到会员:', memberId);
      throw new Error('会员不存在');
    }

    console.log('获取到会员信息:', member);

    // 3. 检查今日签到记录
    const today = new Date().toISOString().split('T')[0];
    const { data: todayCheckIns, error: checkInError } = await supabase
      .from('checkins')
      .select('*')
      .eq('member_id', memberId)
      .eq('check_in_date', today)
      .eq('is_extra', false);

    if (checkInError) {
      console.error('获取今日签到记录失败:', checkInError);
      throw checkInError;
    }

    console.log('今日签到记录:', todayCheckIns);

    // 4. 判断是否为extra签到
    let isExtra = false;

    // 4.1 无卡会员或新会员
    if (!member.membership || member.is_new_member) {
      console.log('无卡会员或新会员，标记为extra');
      isExtra = true;
    }
    // 4.2 月卡会员
    else if (member.membership.includes('monthly')) {
      // 检查会员卡是否过期
      if (member.membership_expiry && new Date(member.membership_expiry) < new Date()) {
        console.log('会员卡已过期，标记为extra');
        isExtra = true;
      } else {
        const dailyCheckIns = todayCheckIns?.length || 0;
        console.log('月卡会员今日签到次数:', dailyCheckIns);
        
        if (member.membership === 'single_daily_monthly' && dailyCheckIns >= 1) {
          console.log('单次月卡超出每日限制，标记为extra');
          isExtra = true;
        } else if (member.membership === 'double_daily_monthly' && dailyCheckIns >= 2) {
          console.log('双次月卡超出每日限制，标记为extra');
          isExtra = true;
        }
      }
    }
    // 4.3 次卡会员
    else {
      console.log('次卡会员剩余次数:', member.remaining_classes);
      isExtra = member.remaining_classes <= 0;
    }

    // 5. 创建签到记录
    const checkInData = {
      member_id: memberId,
      class_type: classType,
      check_in_date: today,
      is_extra: isExtra
    };

    const { data: newCheckIn, error: insertError } = await supabase
      .from('checkins')
      .insert(checkInData)
      .select()
      .single();

    if (insertError) {
      console.error('创建签到记录失败:', insertError);
      throw insertError;
    }

    if (!newCheckIn) {
      console.error('创建签到记录失败: 未返回数据');
      throw new Error('创建签到记录失败');
    }

    console.log('创建签到记录成功:', newCheckIn);

    // 6. 如果是普通签到(非extra),更新剩余课时
    if (!isExtra && !member.membership.includes('monthly')) {
      console.log('更新剩余课时:', {
        memberId,
        currentClasses: member.remaining_classes,
        newClasses: member.remaining_classes - 1
      });

      const { error: updateError } = await supabase
        .from('members')
        .update({
          remaining_classes: member.remaining_classes - 1
        })
        .eq('id', memberId);

      if (updateError) {
        console.error('更新剩余课时失败:', updateError);
        throw updateError;
      }
    }

    // 7. 如果是新会员的第一次签到，更新新会员状态
    if (member.is_new_member) {
      console.log('更新新会员状态:', memberId);
      const { error: updateError } = await supabase
        .from('members')
        .update({
          is_new_member: false
        })
        .eq('id', memberId);

      if (updateError) {
        console.error('更新新会员状态失败:', updateError);
        throw updateError;
      }
    }

    return {
      ...newCheckIn,
      members: member
    };
  } catch (error) {
    console.error('签到失败:', error);
    throw error;
  }
}; 