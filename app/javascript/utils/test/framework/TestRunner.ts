import { TestContext } from './TestContext';
import { DataValidator } from './DataValidator';
import { TEST_CONFIG } from './config';

/**
 * 测试运行器配置
 */
interface TestRunnerConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * 测试运行器
 * 负责管理测试执行流程
 */
export class TestRunner {
  private config: Required<TestRunnerConfig>;
  private contexts: TestContext[] = [];

  constructor(config: TestRunnerConfig = {}) {
    this.config = {
      timeout: config.timeout ?? TEST_CONFIG.EXECUTION.DEFAULT_TIMEOUT,
      retries: config.retries ?? TEST_CONFIG.EXECUTION.DEFAULT_RETRIES,
      retryDelay: config.retryDelay ?? TEST_CONFIG.EXECUTION.DEFAULT_RETRY_DELAY
    };
  }

  /**
   * 运行测试
   */
  public async runTest<T>(
    testFn: (context: TestContext) => Promise<T>
  ): Promise<T> {
    const context = new TestContext();
    this.contexts.push(context);

    let lastError: Error | null = null;
    
    // 重试机制
    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        // 设置超时
        const result = await Promise.race([
          testFn(context),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('测试超时')), this.config.timeout)
          )
        ]);

        // 验证测试数据
        const validator = new DataValidator(context.getTestId());
        const validation = await validator.validate();
        
        if (!validation.success) {
          throw new Error(
            `测试数据验证失败:\n${validation.errors.join('\n')}`
          );
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        
        // 最后一次重试失败,直接抛出错误
        if (attempt === this.config.retries) {
          throw new Error(
            `测试失败(重试${this.config.retries}次):\n${lastError.message}`
          );
        }

        // 等待后重试
        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryDelay)
        );
      }
    }

    // 不应该到达这里
    throw new Error('未知错误');
  }

  /**
   * 清理所有测试数据
   */
  public async cleanup(): Promise<void> {
    for (const context of this.contexts) {
      try {
        await context.cleanup();
      } catch (error) {
        console.error('清理测试数据失败:', error);
      }
    }
    this.contexts = [];
  }
} 