import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../../lib/supabase';

/**
 * 测试上下文管理器
 * 负责管理测试数据的生命周期和隔离
 */
export class TestContext {
  private testId: string;
  private cleanupTasks: (() => Promise<void>)[] = [];

  constructor() {
    this.testId = `test_${uuidv4()}`;
  }

  /**
   * 获取测试ID
   */
  public getTestId(): string {
    return this.testId;
  }

  /**
   * 添加清理任务
   */
  public addCleanupTask(task: () => Promise<void>): void {
    this.cleanupTasks.push(task);
  }

  /**
   * 创建测试会员
   */
  public async createTestMember(data: {
    name: string;
    membership?: string;
    remaining_classes?: number;
    membership_expiry?: string;
    is_new_member?: boolean;
  }) {
    const email = `${data.name}.${this.testId}@test.mt.example.com`;
    
    const { data: member, error } = await supabase
      .from('members')
      .insert({
        ...data,
        email,
        test_mark: this.testId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`创建测试会员失败: ${error.message}`);
    }

    // 添加清理任务
    this.addCleanupTask(async () => {
      await supabase
        .from('members')
        .delete()
        .eq('id', member.id);
    });

    return member;
  }

  /**
   * 创建测试签到记录
   */
  public async createTestCheckIn(data: {
    member_id: string;
    class_type: string;
    is_extra?: boolean;
    check_in_date?: string;
  }) {
    const { data: checkIn, error } = await supabase
      .from('checkins')
      .insert({
        ...data,
        test_mark: this.testId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`创建测试签到记录失败: ${error.message}`);
    }

    // 添加清理任务
    this.addCleanupTask(async () => {
      await supabase
        .from('checkins')
        .delete()
        .eq('id', checkIn.id);
    });

    return checkIn;
  }

  /**
   * 验证测试数据
   */
  public async verifyTestData() {
    // 验证会员数据
    const { data: members, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('test_mark', this.testId);

    if (memberError) {
      throw new Error(`验证会员数据失败: ${memberError.message}`);
    }

    // 验证签到记录
    const { data: checkIns, error: checkInError } = await supabase
      .from('checkins')
      .select('*')
      .eq('test_mark', this.testId);

    if (checkInError) {
      throw new Error(`验证签到记录失败: ${checkInError.message}`);
    }

    return {
      members,
      checkIns
    };
  }

  /**
   * 清理测试数据
   */
  public async cleanup() {
    try {
      // 按照注册顺序的反序执行清理任务
      for (const task of this.cleanupTasks.reverse()) {
        await task();
      }

      // 清理所有相关数据
      await supabase
        .from('checkins')
        .delete()
        .eq('test_mark', this.testId);

      await supabase
        .from('members')
        .delete()
        .eq('test_mark', this.testId);

    } catch (error) {
      console.error('清理测试数据失败:', error);
      throw error;
    }
  }
} 