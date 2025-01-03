export type LogLevel = 'info' | 'warn' | 'error';

export enum ErrorCategory {
  // 业务错误
  CHECKIN = 'checkin',           // 签到相关错误
  VALIDATION = 'validation',     // 数据验证错误
  MEMBERSHIP = 'membership',     // 会员卡相关错误
  AUTHENTICATION = 'auth',       // 认证相关错误
  
  // 技术错误
  NETWORK = 'network',          // 网络错误
  DATABASE = 'database',        // 数据库错误
  SYSTEM = 'system',           // 系统错误
  
  // 其他
  UNKNOWN = 'unknown'          // 未知错误
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  category?: ErrorCategory;
  details?: unknown;
}

export interface CheckInLogDetails {
  memberId?: string;
  classType?: string;
  isExtra?: boolean;
  success?: boolean;
  error?: string;
}