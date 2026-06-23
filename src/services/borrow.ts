import { supabase } from '../config/supabase';
import type { BorrowRequestInsert } from '../types';
import {e2eBackend, isE2EMode} from '../e2e/fakeBackend';

export async function createBorrowRequest(
  data: Omit<BorrowRequestInsert, 'id' | 'created_at' | 'updated_at'>,
) {
  if (isE2EMode) {
    return e2eBackend.createBorrowRequest(data);
  }

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
  if (isE2EMode) {
    return e2eBackend.getBorrowRequests(apartmentId);
  }

  const { data, error } = await supabase
    .from('borrow_requests')
    .select(
      '*, assets:asset_id(*), borrower:borrower_id(id, full_name, avatar_url, role), lender:lender_id(id, full_name, avatar_url, role)',
    )
    .eq('apartment_id', apartmentId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getBorrowRequest(id: string) {
  if (isE2EMode) {
    return e2eBackend.getBorrowRequest(id);
  }

  const { data, error } = await supabase
    .from('borrow_requests')
    .select(
      '*, assets:asset_id(*), borrower:borrower_id(id, full_name, avatar_url, role), lender:lender_id(id, full_name, avatar_url, role)',
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
  if (isE2EMode) {
    return e2eBackend.updateBorrowStatus(id, status);
  }

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
