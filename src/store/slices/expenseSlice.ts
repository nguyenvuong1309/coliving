import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {all, call, put, takeLatest} from 'redux-saga/effects';
import {
  createExpense,
  createExpenseShares,
  createSettlement,
  getBalances,
  getExpense,
  getExpenses,
  getSettlements,
  updateSettlementStatus,
  createNotification,
} from '../../services';
import {formatCurrency} from '../../utils';
import type {
  Expense,
  ExpenseShareInsert,
  MemberBalance,
  Settlement,
  SettlementStatus,
  SplitType,
  ExpenseCategory,
} from '../../types';

interface CreateExpensePayload {
  apartment_id: string;
  payer_id: string;
  created_by: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  note?: string | null;
  receipt_image_url?: string | null;
  split_type: SplitType;
  // share da tinh san o UI: member_id + share_amount
  shares: {member_id: string; share_amount: number}[];
}

interface CreateSettlementPayload {
  apartment_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  note?: string | null;
}

interface ExpenseState {
  expenses: Expense[];
  currentExpense: Expense | null;
  settlements: Settlement[];
  balances: MemberBalance[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  currentExpense: null,
  settlements: [],
  balances: [],
  loading: false,
  error: null,
};

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    fetchExpensesRequest(state, _action: PayloadAction<{apartmentId: string}>) {
      state.loading = true;
      state.error = null;
    },
    createExpenseRequest(state, _action: PayloadAction<CreateExpensePayload>) {
      state.loading = true;
      state.error = null;
    },
    fetchExpenseDetailRequest(state, _action: PayloadAction<{id: string}>) {
      state.loading = true;
      state.error = null;
    },
    fetchSettlementsRequest(
      state,
      _action: PayloadAction<{apartmentId: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    createSettlementRequest(
      state,
      _action: PayloadAction<CreateSettlementPayload>,
    ) {
      state.loading = true;
      state.error = null;
    },
    updateSettlementStatusRequest(
      state,
      _action: PayloadAction<{id: string; status: SettlementStatus}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchBalancesRequest(state, _action: PayloadAction<{apartmentId: string}>) {
      state.loading = true;
      state.error = null;
    },
    setExpenses(state, action: PayloadAction<Expense[]>) {
      state.expenses = action.payload;
    },
    setCurrentExpense(state, action: PayloadAction<Expense | null>) {
      state.currentExpense = action.payload;
    },
    setSettlements(state, action: PayloadAction<Settlement[]>) {
      state.settlements = action.payload;
    },
    setBalances(state, action: PayloadAction<MemberBalance[]>) {
      state.balances = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  fetchExpensesRequest,
  createExpenseRequest,
  fetchExpenseDetailRequest,
  fetchSettlementsRequest,
  createSettlementRequest,
  updateSettlementStatusRequest,
  fetchBalancesRequest,
  setExpenses,
  setCurrentExpense,
  setSettlements,
  setBalances,
  setLoading,
  setError,
} = expenseSlice.actions;

// Sagas

function* handleFetchExpenses(
  action: ReturnType<typeof fetchExpensesRequest>,
): Generator<any, void, any> {
  try {
    const expenses = yield call(getExpenses, action.payload.apartmentId);
    yield put(setExpenses(expenses));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Khong the tai danh sach chi tieu'));
  }
}

function* handleCreateExpense(
  action: ReturnType<typeof createExpenseRequest>,
): Generator<any, void, any> {
  try {
    const {shares, ...expenseData} = action.payload;
    const created = yield call(createExpense, {
      apartment_id: expenseData.apartment_id,
      payer_id: expenseData.payer_id,
      created_by: expenseData.created_by,
      title: expenseData.title,
      category: expenseData.category,
      amount: expenseData.amount,
      note: expenseData.note ?? null,
      receipt_image_url: expenseData.receipt_image_url ?? null,
      split_type: expenseData.split_type,
    });

    const shareRows: ExpenseShareInsert[] = shares.map(s => ({
      expense_id: created.id,
      member_id: s.member_id,
      share_amount: s.share_amount,
    }));
    yield call(createExpenseShares, shareRows);

    // Refresh list.
    const expenses = yield call(getExpenses, expenseData.apartment_id);
    yield put(setExpenses(expenses));

    // Thong bao cho nhung nguoi tham gia (tru nguoi tao) ve khoan chi moi.
    try {
      for (const s of shares) {
        if (s.member_id === expenseData.created_by || s.share_amount <= 0) {
          continue;
        }
        yield call(createNotification, {
          user_id: s.member_id,
          apartment_id: expenseData.apartment_id,
          type: 'expense',
          title: 'Co khoan chi chung moi',
          body: `${expenseData.title}: ban can chia ${formatCurrency(
            s.share_amount,
          )}.`,
          data: {
            route: 'ExpenseDetail',
            params: {id: created.id},
            entityType: 'expense',
            entityId: created.id,
          },
        });
      }
    } catch {
      // Notification khong duoc chan luong tao chi tieu.
    }

    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Khong the tao khoan chi'));
  }
}

function* handleFetchExpenseDetail(
  action: ReturnType<typeof fetchExpenseDetailRequest>,
): Generator<any, void, any> {
  try {
    const expense = yield call(getExpense, action.payload.id);
    yield put(setCurrentExpense(expense));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Khong the tai chi tiet khoan chi'));
  }
}

function* handleFetchSettlements(
  action: ReturnType<typeof fetchSettlementsRequest>,
): Generator<any, void, any> {
  try {
    const settlements = yield call(getSettlements, action.payload.apartmentId);
    yield put(setSettlements(settlements));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Khong the tai danh sach tat toan'));
  }
}

function* handleCreateSettlement(
  action: ReturnType<typeof createSettlementRequest>,
): Generator<any, void, any> {
  try {
    const created = yield call(createSettlement, {
      apartment_id: action.payload.apartment_id,
      from_user: action.payload.from_user,
      to_user: action.payload.to_user,
      amount: action.payload.amount,
      note: action.payload.note ?? null,
    });

    const settlements = yield call(
      getSettlements,
      action.payload.apartment_id,
    );
    yield put(setSettlements(settlements));

    // Thong bao cho nguoi nhan tien xac nhan.
    try {
      yield call(createNotification, {
        user_id: action.payload.to_user,
        apartment_id: action.payload.apartment_id,
        type: 'expense',
        title: 'Yeu cau xac nhan tat toan',
        body: `Co nguoi vua tra ban ${formatCurrency(
          action.payload.amount,
        )}. Vui long xac nhan.`,
        data: {
          route: 'SettleUp',
          params: {settlementId: created.id},
          entityType: 'settlement',
          entityId: created.id,
        },
      });
    } catch {
      // Notification khong chan luong.
    }

    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Khong the tao yeu cau tat toan'));
  }
}

function* handleUpdateSettlementStatus(
  action: ReturnType<typeof updateSettlementStatusRequest>,
): Generator<any, void, any> {
  try {
    const updated = yield call(
      updateSettlementStatus,
      action.payload.id,
      action.payload.status,
    );

    const settlements = yield call(getSettlements, updated.apartment_id);
    yield put(setSettlements(settlements));

    // Thong bao cho nguoi tra (from_user) ket qua.
    try {
      const confirmed = action.payload.status === 'confirmed';
      yield call(createNotification, {
        user_id: updated.from_user,
        apartment_id: updated.apartment_id,
        type: 'expense',
        title: confirmed
          ? 'Tat toan da duoc xac nhan'
          : 'Tat toan bi tu choi',
        body: confirmed
          ? `Khoan tra ${formatCurrency(updated.amount)} da duoc xac nhan.`
          : `Khoan tra ${formatCurrency(updated.amount)} da bi tu choi.`,
        data: {
          route: 'Balance',
          entityType: 'settlement',
          entityId: updated.id,
          status: action.payload.status,
        },
      });
    } catch {
      // Notification khong chan luong.
    }

    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Khong the cap nhat tat toan'));
  }
}

function* handleFetchBalances(
  action: ReturnType<typeof fetchBalancesRequest>,
): Generator<any, void, any> {
  try {
    const balances = yield call(getBalances, action.payload.apartmentId);
    yield put(setBalances(balances));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Khong the tinh so no'));
  }
}

export function* expenseSaga() {
  yield all([
    takeLatest(fetchExpensesRequest.type, handleFetchExpenses),
    takeLatest(createExpenseRequest.type, handleCreateExpense),
    takeLatest(fetchExpenseDetailRequest.type, handleFetchExpenseDetail),
    takeLatest(fetchSettlementsRequest.type, handleFetchSettlements),
    takeLatest(createSettlementRequest.type, handleCreateSettlement),
    takeLatest(
      updateSettlementStatusRequest.type,
      handleUpdateSettlementStatus,
    ),
    takeLatest(fetchBalancesRequest.type, handleFetchBalances),
  ]);
}

export default expenseSlice.reducer;
