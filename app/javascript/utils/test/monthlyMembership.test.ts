import { describe, it, expect, beforeAll } from 'vitest';
import { checkIn } from '../business/checkIn';
import { initializeTestData } from './helpers/testData';

// 等待函数
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Monthly Membership Check-in Tests', () => {
  beforeAll(async () => {
    await initializeTestData();
    // 等待数据创建完成
    await wait(2000);
  });

  describe('Single Daily Monthly', () => {
    it('should allow first check-in of the day', async () => {
      const result = await checkIn({
        name: '王五',
        email: 'wang.wu.test.mt@example.com',
        classType: 'muaythai'
      });
      expect(result.is_extra).toBe(false);
    });

    it('should mark second check-in of the day as extra', async () => {
      const result = await checkIn({
        name: '王五',
        email: 'wang.wu.test.mt@example.com',
        classType: 'muaythai'
      });
      expect(result.is_extra).toBe(true);
    });
  });

  describe('Double Daily Monthly', () => {
    it('should allow first two check-ins of the day', async () => {
      const result1 = await checkIn({
        name: '王五',
        email: 'wang.wu2.test.mt@example.com',
        classType: 'muaythai'
      });
      expect(result1.is_extra).toBe(false);

      const result2 = await checkIn({
        name: '王五',
        email: 'wang.wu2.test.mt@example.com',
        classType: 'muaythai'
      });
      expect(result2.is_extra).toBe(false);
    });

    it('should mark third check-in of the day as extra', async () => {
      const result = await checkIn({
        name: '王五',
        email: 'wang.wu2.test.mt@example.com',
        classType: 'muaythai'
      });
      expect(result.is_extra).toBe(true);
    });
  });
}); 