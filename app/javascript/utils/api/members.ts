import { supabase } from '../../lib/supabase';
import { handleSupabaseError } from '../errorUtils';

export const deleteMember = async (memberId: string) => {
  try {
    // 1. 首先删除关联的签到记录
    const { error: checkInsError } = await supabase
      .from('checkins')
      .delete()
      .eq('member_id', memberId);

    if (checkInsError) throw checkInsError;

    // 2. 然后删除会员记录
    const { error: memberError } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId);

    if (memberError) throw memberError;

    return { success: true };
  } catch (error) {
    console.error('Delete member error:', error);
    throw new Error(handleSupabaseError(error));
  }
}; 