import { TestContext } from './TestContext';
import { ClassType } from '../../../types/database';

/**
 * 等待指定时间
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 创建月卡会员
 */
export const createMonthlyMember = async (
  context: TestContext,
  {
    name,
    type = 'single_daily_monthly',
    expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }: {
    name: string;
    type?: 'single_daily_monthly' | 'double_daily_monthly';
    expiry?: string;
  }
) => {
  return await context.createTestMember({
    name,
    membership: type,
    membership_expiry: expiry,
    is_new_member: false
  });
};

/**
 * 创建次卡会员
 */
export const createClassBasedMember = async (
  context: TestContext,
  {
    name,
    remainingClasses = 10
  }: {
    name: string;
    remainingClasses?: number;
  }
) => {
  return await context.createTestMember({
    name,
    membership: 'ten_classes',
    remaining_classes: remainingClasses,
    is_new_member: false
  });
};

/**
 * 创建新会员
 */
export const createNewMember = async (
  context: TestContext,
  { name }: { name: string }
) => {
  return await context.createTestMember({
    name,
    membership: null,
    is_new_member: true
  });
};

/**
 * 创建签到记录
 */
export const createCheckIn = async (
  context: TestContext,
  {
    memberId,
    classType,
    isExtra = false,
    checkInDate = new Date().toISOString()
  }: {
    memberId: string;
    classType: ClassType;
    isExtra?: boolean;
    checkInDate?: string;
  }
) => {
  return await context.createTestCheckIn({
    member_id: memberId,
    class_type: classType,
    is_extra: isExtra,
    check_in_date: checkInDate
  });
};

/**
 * 验证会员数据
 */
export const verifyMember = async (
  context: TestContext,
  memberId: string,
  expectedData: Partial<{
    name: string;
    membership: string | null;
    remaining_classes: number;
    is_new_member: boolean;
  }>
) => {
  const { data: member, error } = await context.supabase
    .from('members')
    .select('*')
    .eq('id', memberId)
    .eq('test_mark', context.getTestId())
    .single();

  if (error) {
    throw new Error(`验证会员数据失败: ${error.message}`);
  }

  Object.entries(expectedData).forEach(([key, value]) => {
    if (member[key] !== value) {
      throw new Error(
        `会员数据验证失败: ${key} 期望值为 ${value}，实际值为 ${member[key]}`
      );
    }
  });

  return member;
};

/**
 * 验证签到记录
 */
export const verifyCheckIn = async (
  context: TestContext,
  checkInId: string,
  expectedData: Partial<{
    member_id: string;
    class_type: ClassType;
    is_extra: boolean;
  }>
) => {
  const { data: checkIn, error } = await context.supabase
    .from('checkins')
    .select('*')
    .eq('id', checkInId)
    .eq('test_mark', context.getTestId())
    .single();

  if (error) {
    throw new Error(`验证签到记录失败: ${error.message}`);
  }

  Object.entries(expectedData).forEach(([key, value]) => {
    if (checkIn[key] !== value) {
      throw new Error(
        `签到记录验证失败: ${key} 期望值为 ${value}，实际值为 ${checkIn[key]}`
      );
    }
  });

  return checkIn;
}; 