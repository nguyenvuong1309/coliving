import { supabase } from '../config/supabase';
import type {
  Apartment,
  ApartmentInsert,
  ApartmentUpdate,
  ApartmentMemberUpdate,
} from '../types/database';
import { e2eBackend, isE2EMode } from '../e2e/fakeBackend';

const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateInviteCode(length: number = 8): string {
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
  if (isE2EMode) {
    return e2eBackend.createApartment(data);
  }

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
  if (isE2EMode) {
    return e2eBackend.getApartment(id);
  }

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

export async function updateApartment(id: string, updates: ApartmentUpdate) {
  if (isE2EMode) {
    return e2eBackend.updateApartment(id, updates);
  }

  const { data, error } = await supabase
    .from('apartments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getApartmentsForUser(
  userId: string,
  role: 'tenant' | 'landlord',
) {
  if (isE2EMode) {
    return e2eBackend.getApartmentsForUser(userId, role);
  }

  if (role === 'landlord') {
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .eq('landlord_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  const { data, error } = await supabase
    .from('apartment_members')
    .select('apartment:apartment_id(*)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).reduce<Apartment[]>((list, row) => {
    if (row.apartment) {
      list.push(row.apartment as unknown as Apartment);
    }
    return list;
  }, []);
}

export async function getApartmentByInviteCode(code: string) {
  if (isE2EMode) {
    return e2eBackend.getApartmentByInviteCode(code);
  }

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
  if (isE2EMode) {
    return e2eBackend.joinApartment(apartmentId, userId);
  }

  const { data, error } = await supabase
    .from('apartment_members')
    .upsert(
      {
        apartment_id: apartmentId,
        user_id: userId,
        rent_amount: 0,
      },
      {
        onConflict: 'apartment_id,user_id',
      },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getMembers(apartmentId: string) {
  if (isE2EMode) {
    return e2eBackend.getMembers(apartmentId);
  }

  const { data, error } = await supabase
    .from('apartment_members')
    .select('*, profile:user_id(*)')
    .eq('apartment_id', apartmentId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function updateMember(
  memberId: string,
  updates: ApartmentMemberUpdate,
) {
  if (isE2EMode) {
    return e2eBackend.updateMember(memberId, updates);
  }

  const { data, error } = await supabase
    .from('apartment_members')
    .update(updates)
    .eq('id', memberId)
    .select('*, profile:user_id(*)')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeMember(memberId: string) {
  if (isE2EMode) {
    return e2eBackend.removeMember(memberId);
  }

  const { error } = await supabase
    .from('apartment_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    throw error;
  }
}
