import { supabase } from '../../../lib/supabase';

export async function checkTableSchema(tableName: string) {
  console.log(`Checking schema for table: ${tableName}`);
  
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('*')
    .eq('table_name', tableName);

  if (error) {
    console.error('Error checking schema:', error);
    return;
  }

  console.log('Table columns:', data);
  return data;
}

// 检查members表结构
checkTableSchema('members'); 