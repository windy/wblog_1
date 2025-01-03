import { describe, it, expect, beforeAll } from 'vitest';
import { checkIn } from '../../business/checkIn';
import { initializeTestData } from '../helpers/testData';

// 等待函数
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Class-based Membership Check-in Tests', () => {
  beforeAll(async () => {
    await initializeTestData();
    // 等待数据创建完成
    await wait(2000);
  });

  describe('Ten Classes Package', () => {
    it('should deduct one class after check-in', async () => {
      const result = await checkIn({
        name: '李四',
        email: 'li.si.test.mt@example.com',
        classType: 'muaythai'
      });
      expect(result.is_extra).toBe(false);
    });
  });

  describe('No Remaining Classes', () => {
    it('should mark check-in as extra when no classes remain', async () => {
      // 先用完所有课时
      for (let i = 0; i < 10; i++) {
        await checkIn({
          name: '李四',
          email: 'li.si.test.mt@example.com',
          classType: 'muaythai'
        });
      }

      // 再次签到应该标记为extra
      const result = await checkIn({
        name: '李四',
        email: 'li.si.test.mt@example.com',
        classType: 'muaythai'
      });
      expect(result.is_extra).toBe(true);
    });
  });
});