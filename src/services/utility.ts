import {supabase} from '../config/supabase';
import type {
  UtilityConfig,
  UtilityConfigInsert,
  UtilityConfigUpdate,
} from '../types/database';
import {e2eBackend, isE2EMode} from '../e2e/fakeBackend';

export async function getUtilityConfigs(
  apartmentId: string,
): Promise<UtilityConfig[]> {
  if (isE2EMode) {
    return e2eBackend.getUtilityConfigs(apartmentId);
  }

  const {data, error} = await supabase
    .from('utility_configs')
    .select('*')
    .eq('apartment_id', apartmentId)
    .order('utility_type', {ascending: true});

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function upsertUtilityConfig(
  payload: UtilityConfigInsert,
): Promise<UtilityConfig> {
  if (isE2EMode) {
    return e2eBackend.upsertUtilityConfig(payload);
  }

  const {data, error} = await supabase
    .from('utility_configs')
    .upsert(payload, {onConflict: 'apartment_id,utility_type'})
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUtilityConfig(
  id: string,
  updates: UtilityConfigUpdate,
): Promise<UtilityConfig> {
  if (isE2EMode) {
    return e2eBackend.updateUtilityConfig(id, updates);
  }

  const {data, error} = await supabase
    .from('utility_configs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
