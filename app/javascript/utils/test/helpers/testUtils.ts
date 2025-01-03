import { supabase } from '../../../lib/supabase';

export const clearTestData = async () => {
  try {
    await supabase
      .from('checkins')
      .delete()
      .eq('is_test', true);

    await supabase
      .from('members')
      .delete()
      .eq('is_test', true);
  } catch (error) {
    console.error('Failed to clear test data:', error);
    throw error;
  }
};

export async function setupTestData() {
  await clearTestData();

  // Re-insert test data
  const testMembers = [
    {
      name: '张三',
      email: 'zhang.san.test.mt@example.com',
      membership: 'single_daily_monthly',
      remaining_classes: 0,
      membership_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_new_member: false
    },
    {
      name: '李四',
      email: 'li.si.test.mt@example.com', 
      membership: 'double_daily_monthly',
      remaining_classes: 0,
      membership_expiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      is_new_member: false
    },
    {
      name: '王小明',
      email: 'wang.xm1.test.mt@example.com',
      membership: 'ten_classes',
      remaining_classes: 3,
      is_new_member: false
    },
    {
      name: '王小明',
      email: 'wang.xm2.test.mt@example.com',
      membership: 'single_daily_monthly',
      remaining_classes: 0,
      membership_expiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      is_new_member: false
    },
    {
      name: '新学员',
      email: 'new.member.test.mt@example.com',
      membership: null,
      remaining_classes: 0,
      is_new_member: true
    }
  ];

  for (const member of testMembers) {
    await supabase.from('members').insert(member);
  }
}