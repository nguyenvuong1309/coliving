import {Platform} from 'react-native';
import {supabase} from '../config/supabase';
import type {
  DeviceToken,
  NotificationPreference,
  NotificationPreferenceUpdate,
} from '../types';
import {e2eBackend, isE2EMode} from '../e2e/fakeBackend';

export async function registerDeviceToken(
  userId: string,
  token: string,
): Promise<DeviceToken> {
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  if (isE2EMode) {
    return e2eBackend.registerDeviceToken(userId, token, platform);
  }

  const {data, error} = await supabase
    .from('device_tokens')
    .upsert(
      {
        user_id: userId,
        token,
        platform,
        is_active: true,
      },
      {onConflict: 'user_id,token'},
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getNotificationPreference(
  userId: string,
): Promise<NotificationPreference> {
  if (isE2EMode) {
    return e2eBackend.getNotificationPreference(userId);
  }

  const {data, error} = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  return upsertNotificationPreference(userId, {});
}

export async function upsertNotificationPreference(
  userId: string,
  updates: NotificationPreferenceUpdate,
): Promise<NotificationPreference> {
  if (isE2EMode) {
    return e2eBackend.upsertNotificationPreference(userId, updates);
  }

  const {data, error} = await supabase
    .from('notification_preferences')
    .upsert(
      {
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      {onConflict: 'user_id'},
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
