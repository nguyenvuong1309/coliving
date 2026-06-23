// Types cho tinh nang Quy chung & Chia tien thong minh (Shared Wallet).
// Khong sua database.ts — dinh nghia plain TS interface khop voi cot SQL trong
// migration 0005_shared_expenses.sql.

export type ExpenseCategory =
  | 'food'
  | 'household'
  | 'utility'
  | 'party'
  | 'transport'
  | 'other';

export type SplitType = 'equal' | 'exact' | 'percentage';

export type SettlementStatus = 'pending' | 'confirmed' | 'rejected';

export interface Expense {
  id: string;
  apartment_id: string;
  payer_id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  note: string | null;
  receipt_image_url: string | null;
  split_type: SplitType;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInsert {
  id?: string;
  apartment_id: string;
  payer_id: string;
  title: string;
  category?: ExpenseCategory;
  amount: number;
  note?: string | null;
  receipt_image_url?: string | null;
  split_type?: SplitType;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseShare {
  id: string;
  expense_id: string;
  member_id: string;
  share_amount: number;
  created_at: string;
}

export interface ExpenseShareInsert {
  id?: string;
  expense_id: string;
  member_id: string;
  share_amount: number;
  created_at?: string;
}

export interface Settlement {
  id: string;
  apartment_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  status: SettlementStatus;
  note: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export interface SettlementInsert {
  id?: string;
  apartment_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  status?: SettlementStatus;
  note?: string | null;
  created_at?: string;
  confirmed_at?: string | null;
}

// Expense kem danh sach share (dung cho man chi tiet).
export interface ExpenseWithShares extends Expense {
  expense_shares?: ExpenseShare[];
}

// So no rong cua mot thanh vien: duong = duoc nguoi khac no minh, am = minh no.
export interface MemberBalance {
  userId: string;
  balance: number;
}

// Mot giao dich chuyen tien toi gian: from no to so tien amount.
export interface DebtTransfer {
  from: string;
  to: string;
  amount: number;
}
