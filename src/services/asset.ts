import {supabase} from '../config/supabase';
import type {Asset, AssetInsert, AssetUpdate} from '../types/database';

export async function getAssets(apartmentId: string): Promise<Asset[]> {
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
  const {error} = await supabase.from('assets').delete().eq('id', id);

  if (error) {
    throw error;
  }
}
