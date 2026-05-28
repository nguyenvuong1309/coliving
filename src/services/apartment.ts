import { supabase } from '../config/supabase';
import type { ApartmentInsert } from '../types/database';

const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateInviteCode(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * INVITE_CODE_ALPHABET.length);
    code += INVITE_CODE_ALPHABET[idx];
  }
  return code;
}

export async function createApartment(
  data: Omit<ApartmentInsert, 'id' | 'created_at' | 'updated_at'>,
) {
  const { data: apartment, error: apartmentError } = await supabase
    .from('apartments')
    .insert(data)
    .select()
    .single();

  if (apartmentError) {
    throw apartmentError;
  }

  // Add landlord as a member of the apartment
  const { error: memberError } = await supabase
    .from('apartment_members')
    .insert({
      apartment_id: apartment.id,
      user_id: data.landlord_id,
      rent_amount: 0,
    });

  if (memberError) {
    throw memberError;
  }

  return apartment;
}

export async function getApartment(id: string) {
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getApartmentByInviteCode(code: string) {
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('invite_code', code)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function joinApartment(apartmentId: string, userId: string) {
  const { data, error } = await supabase
    .from('apartment_members')
    .insert({
      apartment_id: apartmentId,
      user_id: userId,
      rent_amount: 0,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getMembers(apartmentId: string) {
  const { data, error } = await supabase
    .from('apartment_members')
    .select('*, profiles:user_id(*)')
    .eq('apartment_id', apartmentId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function removeMember(memberId: string) {
  const { error } = await supabase
    .from('apartment_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    throw error;
  }
}
