import { LogEntry, LogLevel, ErrorCategory } from './types';

class Logger {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;

  private log(
    level: LogLevel, 
    message: string, 
    category?: ErrorCategory,
    details?: unknown
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      details: details ? JSON.parse(JSON.stringify(details)) : undefined
    };

    this.logs.unshift(entry);
    
    // 保持日志数量在限制内
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.pop();
    }

    // 开发环境下打印日志
    if (process.env.NODE_ENV !== 'production') {
      console[level](message, details);
    }

    // 持久化存储关键错误
    if (level === 'error') {
      this.persistError(entry);
    }
  }

  info(message: string, details?: unknown) {
    this.log('info', message, undefined, details);
  }

  warn(message: string, category?: ErrorCategory, details?: unknown) {
    this.log('warn', message, category, details);
  }

  error(message: string, category?: ErrorCategory, details?: unknown) {
    this.log('error', message, category, details);
  }

  private async persistError(entry: LogEntry) {
    try {
      // 将错误日志存储到 localStorage
      const storedLogs = JSON.parse(
        localStorage.getItem('error-logs') || '[]'
      );
      storedLogs.unshift(entry);
      
      // 只保留最近的100条错误记录
      if (storedLogs.length > 100) {
        storedLogs.pop();
      }
      
      localStorage.setItem('error-logs', JSON.stringify(storedLogs));
    } catch (err) {
      console.error('Failed to persist error log:', err);
    }
  }

  getLogs(
    level?: LogLevel,
    category?: ErrorCategory,
    limit: number = 100
  ): LogEntry[] {
    let filtered = [...this.logs];
    
    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }
    
    if (category) {
      filtered = filtered.filter(log => log.category === category);
    }
    
    return filtered.slice(0, limit);
  }

  getStoredErrorLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('error-logs') || '[]');
    } catch {
      return [];
    }
  }

  clearStoredErrorLogs() {
    localStorage.removeItem('error-logs');
  }
}

export const logger = new Logger();