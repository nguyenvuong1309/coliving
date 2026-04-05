import {supabase} from '../config/supabase';

export async function getNotifications(userId: string) {
  const {data, error} = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {ascending: false});

  if (error) {
    throw error;
  }

  return data;
}

export async function markAsRead(id: string) {
  const {data, error} = await supabase
    .from('notifications')
    .update({is_read: true})
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function markAllAsRead(userId: string) {
  const {data, error} = await supabase
    .from('notifications')
    .update({is_read: true})
    .eq('user_id', userId)
    .eq('is_read', false)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUnreadCount(userId: string) {
  const {count, error} = await supabase
    .from('notifications')
    .select('*', {count: 'exact', head: true})
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    throw error;
  }

  return count ?? 0;
}
