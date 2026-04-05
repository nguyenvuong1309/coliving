import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {call, put, takeLatest} from 'redux-saga/effects';
import {
  createBilling,
  fetchBillingPeriods,
  fetchPayments,
  fetchMyPayments,
  reportPayment,
  confirmPayment,
} from '../../services/payment';
import type {BillingPeriod, Payment} from '../../types/database';

interface PaymentState {
  billingPeriods: BillingPeriod[];
  payments: Payment[];
  myPayments: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  billingPeriods: [],
  payments: [],
  myPayments: [],
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    createBillingRequest(
      state,
      _action: PayloadAction<{
        apartmentId: string;
        month: number;
        year: number;
        totalAmount: number;
      }>,
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchBillingPeriodsRequest(
      state,
      _action: PayloadAction<{apartmentId: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchPaymentsRequest(
      state,
      _action: PayloadAction<{billingPeriodId: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchMyPaymentsRequest(
      state,
      _action: PayloadAction<{userId: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    reportPaymentRequest(
      state,
      _action: PayloadAction<{paymentId: string; proofUrl?: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    confirmPaymentRequest(
      state,
      _action: PayloadAction<{paymentId: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    setBillingPeriods(state, action: PayloadAction<BillingPeriod[]>) {
      state.billingPeriods = action.payload;
    },
    setPayments(state, action: PayloadAction<Payment[]>) {
      state.payments = action.payload;
    },
    setMyPayments(state, action: PayloadAction<Payment[]>) {
      state.myPayments = action.payload;
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
  createBillingRequest,
  fetchBillingPeriodsRequest,
  fetchPaymentsRequest,
  fetchMyPaymentsRequest,
  reportPaymentRequest,
  confirmPaymentRequest,
  setBillingPeriods,
  setPayments,
  setMyPayments,
  setLoading,
  setError,
} = paymentSlice.actions;

// Sagas

function* handleCreateBilling(
  action: ReturnType<typeof createBillingRequest>,
): Generator<any, void, any> {
  try {
    yield call(createBilling, action.payload);
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to create billing'));
  }
}

function* handleFetchBillingPeriods(
  action: ReturnType<typeof fetchBillingPeriodsRequest>,
): Generator<any, void, any> {
  try {
    const periods = yield call(
      fetchBillingPeriods,
      action.payload.apartmentId,
    );
    yield put(setBillingPeriods(periods));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch billing periods'));
  }
}

function* handleFetchPayments(
  action: ReturnType<typeof fetchPaymentsRequest>,
): Generator<any, void, any> {
  try {
    const payments = yield call(
      fetchPayments,
      action.payload.billingPeriodId,
    );
    yield put(setPayments(payments));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch payments'));
  }
}

function* handleFetchMyPayments(
  action: ReturnType<typeof fetchMyPaymentsRequest>,
): Generator<any, void, any> {
  try {
    const payments = yield call(fetchMyPayments, action.payload.userId);
    yield put(setMyPayments(payments));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch my payments'));
  }
}

function* handleReportPayment(
  action: ReturnType<typeof reportPaymentRequest>,
): Generator<any, void, any> {
  try {
    yield call(
      reportPayment,
      action.payload.paymentId,
      action.payload.proofUrl,
    );
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to report payment'));
  }
}

function* handleConfirmPayment(
  action: ReturnType<typeof confirmPaymentRequest>,
): Generator<any, void, any> {
  try {
    yield call(confirmPayment, action.payload.paymentId);
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to confirm payment'));
  }
}

export function* paymentSaga() {
  yield takeLatest(createBillingRequest.type, handleCreateBilling);
  yield takeLatest(fetchBillingPeriodsRequest.type, handleFetchBillingPeriods);
  yield takeLatest(fetchPaymentsRequest.type, handleFetchPayments);
  yield takeLatest(fetchMyPaymentsRequest.type, handleFetchMyPayments);
  yield takeLatest(reportPaymentRequest.type, handleReportPayment);
  yield takeLatest(confirmPaymentRequest.type, handleConfirmPayment);
}

export default paymentSlice.reducer;
