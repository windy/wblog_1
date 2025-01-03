import React, { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';
import { LogEntry, ErrorCategory } from '../../utils/logger/types';
import { ChevronDown, ChevronUp, RefreshCw, XCircle } from 'lucide-react';

type ErrorStats = Record<ErrorCategory, number>;

export default function ErrorMonitor() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<ErrorStats>(() => {
    const initial: ErrorStats = {} as ErrorStats;
    Object.values(ErrorCategory).forEach(category => {
      initial[category] = 0;
    });
    return initial;
  });
  const [selectedCategory, setSelectedCategory] = useState<ErrorCategory | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const errorLogs = logger.getStoredErrorLogs();
    setLogs(errorLogs);
    calculateStats(errorLogs);
  };

  const calculateStats = (logs: LogEntry[]) => {
    const newStats: ErrorStats = {} as ErrorStats;
    
    // 初始化所有分类的计数为0
    Object.values(ErrorCategory).forEach(category => {
      newStats[category] = 0;
    });
    
    // 统计每个分类的错误数量
    logs.forEach(log => {
      if (log.category) {
        newStats[log.category]++;
      } else {
        newStats[ErrorCategory.UNKNOWN]++;
      }
    });
    
    setStats(newStats);
  };

  const clearLogs = () => {
    if (confirm('确定要清除所有错误日志吗？\nAre you sure to clear all error logs?')) {
      logger.clearStoredErrorLogs();
      setLogs([]);
      setStats(() => {
        const initial: ErrorStats = {} as ErrorStats;
        Object.values(ErrorCategory).forEach(category => {
          initial[category] = 0;
        });
        return initial;
      });
    }
  };

  const filterLogsByCategory = (category: ErrorCategory) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDetails = (details: unknown): string => {
    try {
      return JSON.stringify(details, null, 2);
    } catch {
      return String(details);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">错误监控 Error Monitor</h2>
        <div className="flex gap-2">
          <button
            onClick={loadLogs}
            className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:text-gray-800"
          >
            <RefreshCw className="w-4 h-4" />
            刷新 Refresh
          </button>
          <button
            onClick={clearLogs}
            className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-800"
          >
            <XCircle className="w-4 h-4" />
            清除 Clear
          </button>
        </div>
      </div>

      {/* 错误统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(stats).map(([category, count]) => (
          count > 0 && (
            <button
              key={category}
              onClick={() => filterLogsByCategory(category as ErrorCategory)}
              className={`p-4 rounded-lg border ${
                selectedCategory === category 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-sm text-gray-600">{category}</div>
              <div className="text-2xl font-bold">{count}</div>
            </button>
          )
        ))}
      </div>

      {/* 错误日志列表 */}
      <div className="space-y-4">
        {logs
          .filter(log => !selectedCategory || log.category === selectedCategory)
          .map((log, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-gray-600">
                  {formatTime(log.timestamp)}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {log.category || 'unknown'}
                </div>
              </div>
              <div className="text-red-600">{log.message}</div>
              {log.details && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showDetails ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        隐藏详情 Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        显示详情 Show Details
                      </>
                    )}
                  </button>
                  {showDetails && (
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
                      {formatDetails(log.details)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>

      {logs.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          暂无错误日志
          <br />
          No error logs
        </div>
      )}
    </div>
  );
} 