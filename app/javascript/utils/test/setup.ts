import { beforeAll, afterAll } from 'vitest';
import { supabase } from '../../lib/supabase';
import '@testing-library/jest-dom';

beforeAll(async () => {
  // 在所有测试开始前执行
  console.log('开始测试...');

  // 创建数据库表和函数
  const { error: createTablesError } = await supabase.rpc('create_test_tables');
  if (createTablesError) {
    console.error('创建测试表失败:', createTablesError);
    throw createTablesError;
  }

  const { error: createFunctionsError } = await supabase.rpc('create_test_functions');
  if (createFunctionsError) {
    console.error('创建测试函数失败:', createFunctionsError);
    throw createFunctionsError;
  }
});

afterAll(async () => {
  // 在所有测试结束后执行
  console.log('测试结束...');

  // 清理测试数据
  const { error: cleanupError } = await supabase.rpc('cleanup_all_test_data', {
    test_email_domain: 'test.com'
  });
  if (cleanupError) {
    console.error('清理测试数据失败:', cleanupError);
  }
}); 