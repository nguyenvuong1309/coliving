import {supabase} from '../config/supabase';
import type {NotificationInsert} from '../types/database';
import {e2eBackend, isE2EMode} from '../e2e/fakeBackend';

export async function createNotification(payload: NotificationInsert) {
  if (isE2EMode) {
    return e2eBackend.createNotification(payload);
  }

  const {data, error} = await supabase
    .from('notifications')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getNotifications(userId: string) {
  if (isE2EMode) {
    return e2eBackend.getNotifications(userId);
  }

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
  if (isE2EMode) {
    return e2eBackend.markAsRead(id);
  }

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
  if (isE2EMode) {
    return e2eBackend.markAllAsRead(userId);
  }

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
  if (isE2EMode) {
    return e2eBackend.getUnreadCount(userId);
  }

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
