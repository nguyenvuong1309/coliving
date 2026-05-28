import { supabase } from '../config/supabase';
import type { BorrowRequestInsert } from '../types/database';

export async function createBorrowRequest(
  data: Omit<BorrowRequestInsert, 'id' | 'created_at' | 'updated_at'>,
) {
  const { data: request, error } = await supabase
    .from('borrow_requests')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return request;
}

export async function getBorrowRequests(apartmentId: string) {
  const { data, error } = await supabase
    .from('borrow_requests')
    .select(
      '*, assets:asset_id(*), borrower:borrower_id(id, full_name, avatar_url), lender:lender_id(id, full_name, avatar_url)',
    )
    .eq('apartment_id', apartmentId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getBorrowRequest(id: string) {
  const { data, error } = await supabase
    .from('borrow_requests')
    .select(
      '*, assets:asset_id(*), borrower:borrower_id(id, full_name, avatar_url), lender:lender_id(id, full_name, avatar_url)',
    )
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBorrowStatus(
  id: string,
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'in_use'
    | 'return_requested'
    | 'returned',
) {
  const { data, error } = await supabase
    .from('borrow_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
