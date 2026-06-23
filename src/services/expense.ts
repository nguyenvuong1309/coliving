import {supabase} from '../config/supabase';
import type {
  Expense,
  ExpenseInsert,
  ExpenseShare,
  ExpenseShareInsert,
  MemberBalance,
  Settlement,
  SettlementInsert,
  SettlementStatus,
} from '../types';
import {
  applyConfirmedSettlements,
  computeBalances,
} from '../utils';

// Cac bang nay moi them o migration 0005 — e2eBackend chua ho tro, nen goi
// supabase truc tiep (theo huong dan giu sach, bo nhanh isE2EMode cho bang moi).

export async function createExpense(
  data: Omit<ExpenseInsert, 'id' | 'created_at' | 'updated_at'>,
): Promise<Expense> {
  const {data: expense, error} = await supabase
    .from('expenses')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return expense as Expense;
}

export async function getExpenses(apartmentId: string): Promise<Expense[]> {
  const {data, error} = await supabase
    .from('expenses')
    .select(
      '*, payer:payer_id(id, full_name, avatar_url), creator:created_by(id, full_name, avatar_url)',
    )
    .eq('apartment_id', apartmentId)
    .order('created_at', {ascending: false});

  if (error) {
    throw error;
  }

  return (data ?? []) as Expense[];
}

export async function getExpense(id: string): Promise<Expense> {
  const {data, error} = await supabase
    .from('expenses')
    .select(
      '*, payer:payer_id(id, full_name, avatar_url), creator:created_by(id, full_name, avatar_url), expense_shares(*)',
    )
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data as Expense;
}

export async function createExpenseShares(
  shares: ExpenseShareInsert[],
): Promise<ExpenseShare[]> {
  if (shares.length === 0) {
    return [];
  }

  const {data, error} = await supabase
    .from('expense_shares')
    .insert(shares)
    .select();

  if (error) {
    throw error;
  }

  return (data ?? []) as ExpenseShare[];
}

export async function getExpenseShares(
  apartmentId: string,
): Promise<ExpenseShare[]> {
  // Lay tat ca share cua cac expense trong can ho (de tinh balance).
  const {data, error} = await supabase
    .from('expense_shares')
    .select('*, expenses!inner(apartment_id)')
    .eq('expenses.apartment_id', apartmentId);

  if (error) {
    throw error;
  }

  return (data ?? []) as ExpenseShare[];
}

export async function getSettlements(
  apartmentId: string,
): Promise<Settlement[]> {
  const {data, error} = await supabase
    .from('settlements')
    .select(
      '*, from_profile:from_user(id, full_name, avatar_url), to_profile:to_user(id, full_name, avatar_url)',
    )
    .eq('apartment_id', apartmentId)
    .order('created_at', {ascending: false});

  if (error) {
    throw error;
  }

  return (data ?? []) as Settlement[];
}

export async function createSettlement(
  data: Omit<SettlementInsert, 'id' | 'created_at' | 'confirmed_at' | 'status'>,
): Promise<Settlement> {
  const {data: settlement, error} = await supabase
    .from('settlements')
    .insert({...data, status: 'pending'})
    .select()
    .single();

  if (error) {
    throw error;
  }

  return settlement as Settlement;
}

export async function updateSettlementStatus(
  id: string,
  status: SettlementStatus,
): Promise<Settlement> {
  const updates: Partial<Settlement> = {status};
  if (status === 'confirmed') {
    updates.confirmed_at = new Date().toISOString();
  }

  const {data, error} = await supabase
    .from('settlements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Settlement;
}

/**
 * Tinh so no rong cua tung thanh vien trong can ho, da tru cac settlement da
 * confirmed. Tra ve danh sach { userId, balance } (chi nhung nguoi co so du !=0).
 */
export async function getBalances(
  apartmentId: string,
): Promise<MemberBalance[]> {
  const [expenses, shares, settlements] = await Promise.all([
    getExpenses(apartmentId),
    getExpenseShares(apartmentId),
    getSettlements(apartmentId),
  ]);

  const rawBalances = computeBalances(
    expenses.map(e => ({payer_id: e.payer_id, amount: e.amount, id: e.id})),
    shares,
  );

  const confirmed = settlements
    .filter(s => s.status === 'confirmed')
    .map(s => ({
      from_user: s.from_user,
      to_user: s.to_user,
      amount: s.amount,
    }));

  return applyConfirmedSettlements(rawBalances, confirmed);
}
