import {supabase} from '../config/supabase';
import type {Asset, AssetInsert, AssetUpdate} from '../types';
import {e2eBackend, isE2EMode} from '../e2e/fakeBackend';

export async function getAssets(apartmentId: string): Promise<Asset[]> {
  if (isE2EMode) {
    return e2eBackend.getAssets(apartmentId);
  }

  const {data, error} = await supabase
    .from('assets')
    .select('*')
    .eq('apartment_id', apartmentId)
    .order('created_at', {ascending: false});

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getAsset(id: string): Promise<Asset> {
  if (isE2EMode) {
    return e2eBackend.getAsset(id);
  }

  const {data, error} = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createAsset(
  payload: Omit<AssetInsert, 'id' | 'created_at'>,
): Promise<Asset> {
  if (isE2EMode) {
    return e2eBackend.createAsset(payload);
  }

  const {data, error} = await supabase
    .from('assets')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateAsset(
  id: string,
  updates: AssetUpdate,
): Promise<Asset> {
  if (isE2EMode) {
    return e2eBackend.updateAsset(id, updates);
  }

  const {data, error} = await supabase
    .from('assets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteAsset(id: string): Promise<void> {
  if (isE2EMode) {
    return e2eBackend.deleteAsset(id);
  }

  const {error} = await supabase.from('assets').delete().eq('id', id);

  if (error) {
    throw error;
  }
}
