import { supabase } from '../../../lib/supabase';

const TEST_EMAIL_DOMAIN = 'test.com';

export async function cleanupTestData() {
  const { error } = await supabase.rpc('cleanup_all_test_data', {
    test_email_domain: TEST_EMAIL_DOMAIN
  });
  
  if (error) {
    throw new Error(`Failed to cleanup test data: ${error.message}`);
  }
}

export async function verifyTestDataCleanup() {
  const { data, error } = await supabase.rpc('verify_test_data', {
    test_email_domain: TEST_EMAIL_DOMAIN
  });

  if (error) {
    throw new Error(`Failed to verify test data cleanup: ${error.message}`);
  }

  if (data[0].remaining_members > 0 || data[0].remaining_checkins > 0) {
    throw new Error(`Test data cleanup incomplete: ${JSON.stringify(data[0])}`);
  }
}

export function generateTestEmail(prefix: string, testMark: string) {
  return `${prefix}_${testMark}@${TEST_EMAIL_DOMAIN}`;
}

export async function createTestMember(name: string, memberType: string = 'regular', testMark: string) {
  const email = generateTestEmail(name, testMark);
  
  const { data: member, error } = await supabase
    .from('members')
    .insert([
      { 
        name, 
        email, 
        member_type: memberType,
        test_mark: testMark
      }
    ])
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to create test member: ${error.message}`);
  }
  
  return member;
}

export async function createTestCheckIn(memberId: string, testMark: string) {
  const { data: checkIn, error } = await supabase
    .from('checkins')
    .insert([
      { 
        member_id: memberId,
        test_mark: testMark
      }
    ])
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to create test check-in: ${error.message}`);
  }
  
  return checkIn;
}