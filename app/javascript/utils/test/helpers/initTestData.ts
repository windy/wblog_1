import { supabase } from '../../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface TestDataResult {
  testMark: string;
}

export async function initializeTestData(): Promise<TestDataResult> {
  const testMark = uuidv4();
  
  // 创建测试会员数据
  const members = [
    {
      name: 'regular_member',
      email: `test_${testMark}@test.com`,
      member_type: 'regular',
      test_mark: testMark
    },
    {
      name: 'vip_member',
      email: `vip_${testMark}@test.com`,
      member_type: 'vip',
      test_mark: testMark
    },
    {
      name: 'expired_member',
      email: `expired_${testMark}@test.com`,
      member_type: 'expired',
      test_mark: testMark
    }
  ];
  
  const { error: membersError } = await supabase
    .from('members')
    .insert(members);
    
  if (membersError) {
    throw new Error(`Failed to create test members: ${membersError.message}`);
  }
  
  return { testMark };
} 