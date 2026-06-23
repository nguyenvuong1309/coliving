// Pure functions de chia tien va toi gian no (simplify debts).
import type {
  DebtTransfer,
  ExpenseShare,
  MemberBalance,
} from '../types';

/**
 * Chia deu so tien cho cac thanh vien. Phan du (do lam tron) duoc don vao
 * nhung nguoi dau danh sach de tong khop chinh xac voi `amount`.
 */
export function splitEqual(
  amount: number,
  memberIds: string[],
): {memberId: string; shareAmount: number}[] {
  const n = memberIds.length;
  if (n === 0) {
    return [];
  }
  const base = Math.floor(amount / n);
  let remainder = amount - base * n;
  return memberIds.map(memberId => {
    let share = base;
    if (remainder > 0) {
      share += 1;
      remainder -= 1;
    }
    return {memberId, shareAmount: share};
  });
}

/**
 * Chia theo so tien cu the tung nguoi. Tra ve dung cac gia tri da nhap
 * (lam tron). Goi y kiem tra tong bang `amount` qua validateExactSplit.
 */
export function splitExact(
  exactAmounts: {memberId: string; amount: number}[],
): {memberId: string; shareAmount: number}[] {
  return exactAmounts.map(e => ({
    memberId: e.memberId,
    shareAmount: Math.round(e.amount),
  }));
}

export function validateExactSplit(
  amount: number,
  exactAmounts: {memberId: string; amount: number}[],
): boolean {
  const total = exactAmounts.reduce((sum, e) => sum + Math.round(e.amount), 0);
  return total === amount;
}

/**
 * Chia theo phan tram. `percentages` la map memberId -> % (tong nen bang 100).
 * Phan du do lam tron don vao nguoi dau tien.
 */
export function splitPercentage(
  amount: number,
  percentages: {memberId: string; percent: number}[],
): {memberId: string; shareAmount: number}[] {
  if (percentages.length === 0) {
    return [];
  }
  const result = percentages.map(p => ({
    memberId: p.memberId,
    shareAmount: Math.floor((amount * p.percent) / 100),
  }));
  const allocated = result.reduce((sum, r) => sum + r.shareAmount, 0);
  const remainder = amount - allocated;
  if (remainder !== 0) {
    result[0].shareAmount += remainder;
  }
  return result;
}

/**
 * Tinh so no rong tu danh sach expense + share.
 * Quy uoc: balance duong = tong cong nguoi khac dang no minh; am = minh dang no.
 * Voi moi expense: payer duoc cong (amount - shareCuaPayer), moi nguoi tham gia
 * bi tru phan share cua minh.
 */
export function computeBalances(
  expenses: {payer_id: string; amount: number; id: string}[],
  shares: ExpenseShare[],
): MemberBalance[] {
  const balanceMap = new Map<string, number>();
  const add = (userId: string, delta: number) => {
    balanceMap.set(userId, (balanceMap.get(userId) ?? 0) + delta);
  };

  const sharesByExpense = new Map<string, ExpenseShare[]>();
  for (const s of shares) {
    const list = sharesByExpense.get(s.expense_id) ?? [];
    list.push(s);
    sharesByExpense.set(s.expense_id, list);
  }

  for (const exp of expenses) {
    // Payer da tra truoc toan bo amount.
    add(exp.payer_id, exp.amount);
    const expShares = sharesByExpense.get(exp.id) ?? [];
    for (const s of expShares) {
      add(s.member_id, -s.share_amount);
    }
  }

  return Array.from(balanceMap.entries())
    .map(([userId, balance]) => ({userId, balance}))
    .filter(b => b.balance !== 0);
}

/**
 * Ap dung cac settlement da confirmed vao balances (nguoi tra no bot am di,
 * nguoi nhan bot duong di).
 */
export function applyConfirmedSettlements(
  balances: MemberBalance[],
  confirmedSettlements: {from_user: string; to_user: string; amount: number}[],
): MemberBalance[] {
  const map = new Map<string, number>();
  for (const b of balances) {
    map.set(b.userId, b.balance);
  }
  for (const s of confirmedSettlements) {
    // from tra cho to: from bot no (balance tang), to bot duoc no (balance giam).
    map.set(s.from_user, (map.get(s.from_user) ?? 0) + s.amount);
    map.set(s.to_user, (map.get(s.to_user) ?? 0) - s.amount);
  }
  return Array.from(map.entries())
    .map(([userId, balance]) => ({userId, balance}))
    .filter(b => b.balance !== 0);
}

/**
 * Thuat toan toi gian no: tu danh sach so du rong, sinh ra so giao dich
 * chuyen tien it nhat (greedy ghep nguoi no nhieu nhat voi nguoi duoc no
 * nhieu nhat). Tong cac balance gia dinh bang 0.
 */
export function simplifyDebts(balances: MemberBalance[]): DebtTransfer[] {
  const debtors = balances
    .filter(b => b.balance < 0)
    .map(b => ({userId: b.userId, amount: -b.balance}))
    .sort((a, b) => b.amount - a.amount);
  const creditors = balances
    .filter(b => b.balance > 0)
    .map(b => ({userId: b.userId, amount: b.balance}))
    .sort((a, b) => b.amount - a.amount);

  const transfers: DebtTransfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const transfer = Math.min(debtor.amount, creditor.amount);
    if (transfer > 0) {
      transfers.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: transfer,
      });
      debtor.amount -= transfer;
      creditor.amount -= transfer;
    }
    if (debtor.amount === 0) {
      i += 1;
    }
    if (creditor.amount === 0) {
      j += 1;
    }
  }
  return transfers;
}
