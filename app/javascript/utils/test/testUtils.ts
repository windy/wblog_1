import { supabase } from '../../lib/supabase';

export const clearTestData = async () => {
  try {
    // 先获取所有测试会员的ID
    const { data: testMembers, error: memberQueryError } = await supabase
      .from('members')
      .select('id')
      .like('email', '%.test.mt@example.com');

    if (memberQueryError) {
      console.error('Error querying test members:', memberQueryError);
      return;
    }

    if (testMembers && testMembers.length > 0) {
      // 删除这些会员的签到记录
      const memberIds = testMembers.map(m => m.id);
      const { error: checkInError } = await supabase
        .from('checkins')
        .delete()
        .in('member_id', memberIds);

      if (checkInError) {
        console.error('Error deleting test check-ins:', checkInError);
        return;
      }
    }

    // 删除测试会员
    const { error: memberError } = await supabase
      .from('members')
      .delete()
      .like('email', '%.test.mt@example.com');

    if (memberError) {
      console.error('Error deleting test members:', memberError);
      return;
    }
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
    const { error } = await supabase.from('members').insert(member);
    if (error) {
      console.error('Error inserting test member:', error);
      throw error;
    }
  }
}