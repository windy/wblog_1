/**
 * 测试配置
 */
export const TEST_CONFIG = {
  // 数据库相关
  DATABASE: {
    // 测试数据标记前缀
    TEST_MARK_PREFIX: 'test_',
    // 测试邮箱域名
    TEST_EMAIL_DOMAIN: 'test.mt@example.com'
  },

  // 测试执行相关
  EXECUTION: {
    // 默认超时时间（毫秒）
    DEFAULT_TIMEOUT: 5000,
    // 默认重试次数
    DEFAULT_RETRIES: 3,
    // 默认重试间隔（毫秒）
    DEFAULT_RETRY_DELAY: 1000,
    // 默认等待时间（毫秒）
    DEFAULT_WAIT: 1000
  },

  // 会员类型
  MEMBERSHIP: {
    // 单次月卡
    SINGLE_DAILY_MONTHLY: 'single_daily_monthly',
    // 双次月卡
    DOUBLE_DAILY_MONTHLY: 'double_daily_monthly',
    // 次卡
    TEN_CLASSES: 'ten_classes'
  },

  // 课程类型
  CLASS_TYPE: {
    // 泰拳
    MUAYTHAI: 'muaythai',
    // 拳击
    BOXING: 'boxing'
  },

  // 错误消息
  ERROR_MESSAGES: {
    // 会员不存在
    MEMBER_NOT_FOUND: '会员不存在',
    // 重复签到
    DUPLICATE_CHECKIN: '今日该时段已签到',
    // 会员卡过期
    MEMBERSHIP_EXPIRED: '会员卡已过期',
    // 课时不足
    NO_REMAINING_CLASSES: '剩余课时不足',
    // 超出每日限制
    DAILY_LIMIT_EXCEEDED: '超出每日签到限制'
  }
} as const;

/**
 * 测试工具函数
 */
export const TEST_UTILS = {
  /**
   * 生成测试邮箱
   */
  generateTestEmail(name: string, testMark: string): string {
    return `${name}.${testMark}@${TEST_CONFIG.DATABASE.TEST_EMAIL_DOMAIN}`;
  },

  /**
   * 生成过期时间
   */
  generateExpiryDate(days: number): string {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  },

  /**
   * 格式化日期
   */
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
} as const; 