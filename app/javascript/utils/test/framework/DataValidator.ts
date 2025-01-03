import { supabase } from '../../../lib/supabase';
import { TEST_CONFIG } from './config';

/**
 * 数据验证结果
 */
interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 测试数据验证器
 * 负责验证测试数据的完整性和正确性
 */
export class DataValidator {
  private testMark: string;
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor(testMark: string) {
    this.testMark = testMark;
  }

  /**
   * 验证会员数据
   */
  private async validateMembers(): Promise<void> {
    // 获取所有测试会员
    const { data: members, error } = await supabase
      .from('members')
      .select('*')
      .eq('test_mark', this.testMark);

    if (error) {
      this.errors.push(`获取会员数据失败: ${error.message}`);
      return;
    }

    if (!members || members.length === 0) {
      this.warnings.push('未找到测试会员数据');
      return;
    }

    // 验证每个会员的数据
    members.forEach(member => {
      // 验证必填字段
      if (!member.name) {
        this.errors.push(`会员 ${member.id} 缺少名字`);
      }
      if (!member.email) {
        this.errors.push(`会员 ${member.id} 缺少邮箱`);
      }

      // 验证邮箱格式
      if (member.email && !member.email.endsWith(TEST_CONFIG.DATABASE.TEST_EMAIL_DOMAIN)) {
        this.errors.push(`会员 ${member.id} 邮箱格式不正确`);
      }

      // 验证会员卡信息
      if (member.membership) {
        // 验证会员卡类型
        if (!Object.values(TEST_CONFIG.MEMBERSHIP).includes(member.membership)) {
          this.errors.push(`会员 ${member.id} 会员卡类型无效`);
        }

        // 验证月卡过期时间
        if (member.membership.includes('monthly') && !member.membership_expiry) {
          this.errors.push(`会员 ${member.id} 缺少会员卡过期时间`);
        }

        // 验证次卡剩余次数
        if (member.membership === TEST_CONFIG.MEMBERSHIP.TEN_CLASSES && member.remaining_classes === null) {
          this.errors.push(`会员 ${member.id} 缺少剩余课时`);
        }
      }
    });
  }

  /**
   * 验证签到记录
   */
  private async validateCheckIns(): Promise<void> {
    // 获取所有测试签到记录
    const { data: checkIns, error } = await supabase
      .from('checkins')
      .select(`
        *,
        members!inner (
          id,
          name,
          email,
          membership,
          membership_expiry,
          remaining_classes,
          test_mark
        )
      `)
      .eq('test_mark', this.testMark);

    if (error) {
      this.errors.push(`获取签到记录失败: ${error.message}`);
      return;
    }

    if (!checkIns || checkIns.length === 0) {
      this.warnings.push('未找到测试签到记录');
      return;
    }

    // 验证每条签到记录
    checkIns.forEach(checkIn => {
      // 验证必填字段
      if (!checkIn.member_id) {
        this.errors.push(`签到记录 ${checkIn.id} 缺少会员ID`);
      }
      if (!checkIn.class_type) {
        this.errors.push(`签到记录 ${checkIn.id} 缺少课程类型`);
      }
      if (checkIn.is_extra === null) {
        this.errors.push(`签到记录 ${checkIn.id} 缺少签到类型标记`);
      }

      // 验证课程类型
      if (!Object.values(TEST_CONFIG.CLASS_TYPE).includes(checkIn.class_type)) {
        this.errors.push(`签到记录 ${checkIn.id} 课程类型无效`);
      }

      // 验证关联会员
      if (checkIn.members?.test_mark !== this.testMark) {
        this.errors.push(`签到记录 ${checkIn.id} 关联的会员不属于当前测试`);
      }
    });
  }

  /**
   * 验证数据一致性
   */
  private async validateConsistency(): Promise<void> {
    // 获取所有测试数据
    const { data: members } = await supabase
      .from('members')
      .select('id, test_mark')
      .eq('test_mark', this.testMark);

    const { data: checkIns } = await supabase
      .from('checkins')
      .select('id, member_id, test_mark')
      .eq('test_mark', this.testMark);

    if (!members || !checkIns) return;

    // 验证所有签到记录都关联到有效的会员
    const memberIds = new Set(members.map(m => m.id));
    checkIns.forEach(checkIn => {
      if (!memberIds.has(checkIn.member_id)) {
        this.errors.push(`签到记录 ${checkIn.id} 关联到无效的会员ID`);
      }
    });
  }

  /**
   * 执行验证
   */
  public async validate(): Promise<ValidationResult> {
    // 清空之前的验证结果
    this.errors = [];
    this.warnings = [];

    // 执行所有验证
    await Promise.all([
      this.validateMembers(),
      this.validateCheckIns(),
      this.validateConsistency()
    ]);

    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }
} 