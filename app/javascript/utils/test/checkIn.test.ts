import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { validateCheckIn } from '../../services/checkin';
import { 
  createTestMember, 
  createTestCheckIn, 
  cleanupTestData,
  verifyTestDataCleanup
} from './helpers/testData';
import { initializeTestData } from './helpers/initTestData';

describe('签到功能测试', () => {
  let testMark: string;

  beforeEach(async () => {
    const result = await initializeTestData();
    testMark = result.testMark;
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
    await verifyTestDataCleanup();
  });

  it('普通会员可以正常签到', async () => {
    const member = await createTestMember('regular_member', 'regular', testMark);
    const result = await validateCheckIn(member.id);
    expect(result.success).toBe(true);
  });

  it('会员不能重复签到', async () => {
    const member = await createTestMember('duplicate_member', 'regular', testMark);
    await createTestCheckIn(member.id, testMark);
    
    const result = await validateCheckIn(member.id);
    expect(result.success).toBe(false);
    expect(result.message).toContain('今天已经签到');
  });

  it('VIP会员可以正常签到', async () => {
    const member = await createTestMember('vip_member', 'vip', testMark);
    const result = await validateCheckIn(member.id);
    expect(result.success).toBe(true);
  });

  it('过期会员不能签到', async () => {
    const member = await createTestMember('expired_member', 'expired', testMark);
    const result = await validateCheckIn(member.id);
    expect(result.success).toBe(false);
    expect(result.message).toContain('会员已过期');
  });
}); 