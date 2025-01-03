import { supabase } from '../../../lib/supabase';

export async function cleanupTestData() {
  try {
    console.log('Starting test data cleanup...');

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

    console.log('Test data cleanup completed successfully');
  } catch (error) {
    console.error('Error in cleanupTestData:', error);
  }
}

async function cleanup() {
  try {
    console.log('开始清理测试数据...');
    await cleanupTestData();
    console.log('测试数据清理完成');
  } catch (error) {
    console.error('清理测试数据失败:', error);
  }
}

cleanup(); 