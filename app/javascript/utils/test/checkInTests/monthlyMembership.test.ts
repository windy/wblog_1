import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { checkIn } from '../../business/checkIn';
import { initializeTestData } from '../helpers/testData';
import { cleanupTestCheckIns } from '../helpers/checkInHelpers';
import { supabase } from '../../../lib/supabase';

// 等待函数
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Monthly Membership Check-in Tests', () => {
  let testMark: string;

  beforeAll(async () => {
    // 初始化测试数据并获取测试标记
    const result = await initializeTestData();
    testMark = result.testMark;
    // 等待数据创建完成
    await wait(2000);
  });

  afterAll(async () => {
    if (testMark) {
      await cleanupTestCheckIns(testMark);
    }
  });

  describe('Single Daily Monthly', () => {
    it('should allow first check-in of the day', async () => {
      // 验证会员存在
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('name', '王五')
        .eq('test_mark', testMark)
        .single();

      expect(member).toBeTruthy();
      expect(member.membership).toBe('single_daily_monthly');

      const result = await checkIn({
        name: '王五',
        classType: 'muaythai'
      });
      expect(result.is_extra).toBe(false);
    });

    it('should mark second check-in of the day as extra', async () => {
      const result = await checkIn({
        name: '王五',
        classType: 'muaythai'
      });
      expect(result.is_extra).toBe(true);
    });
  });

  describe('Double Daily Monthly', () => {
    it('should allow first two check-ins of the day', async () => {
      // 验证会员存在
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('name', '赵六')
        .eq('test_mark', testMark)
        .single();

      expect(member).toBeTruthy();
      expect(member.membership).toBe('double_daily_monthly');

      const result1 = await checkIn({
        name: '赵六',
        classType: 'muaythai'
      });
      expect(result1.is_extra).toBe(false);

      const result2 = await checkIn({
        name: '赵六',
        classType: 'muaythai'
      });
      expect(result2.is_extra).toBe(false);
    });

    it('should mark third check-in of the day as extra', async () => {
      const result = await checkIn({
        name: '赵六',
        classType: 'muaythai'
      });
      expect(result.is_extra).toBe(true);
    });
  });

  // 验证签到记录
  afterEach(async () => {
    const { data: checkIns } = await supabase
      .from('checkins')
      .select('*')
      .eq('test_mark', testMark);

    expect(checkIns).toBeTruthy();
    checkIns?.forEach(checkIn => {
      expect(checkIn.test_mark).toBe(testMark);
    });
  });
});