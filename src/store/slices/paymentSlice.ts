import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {call, put, select, takeLatest} from 'redux-saga/effects';
import {
  createBillingPeriod,
  getBillingPeriods,
  getPayments,
  getPaymentsForApartment,
  getPayment,
  getMyPayments,
  reportPayment,
  confirmPayment,
  rejectPayment,
} from '../../services/payment';
import {createNotification} from '../../services/notification';
import {uploadImage, getImageUrl} from '../../services/storage';
import type {BillingPeriod, Json, Payment} from '../../types/database';
import type {RootState} from '../index';

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
        dueDate: string;
        payments?: Array<{
          tenantId: string;
          amount: number;
          rentAmount?: number;
          utilityTotal?: number;
          extraCharges?: Json;
        }>;
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
      _action: PayloadAction<{
        paymentId: string;
        method: 'bank_transfer' | 'cash';
        receiptUri?: string;
      }>,
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
    rejectPaymentRequest(
      state,
      _action: PayloadAction<{paymentId: string; note?: string}>,
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
  rejectPaymentRequest,
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
    const userId = yield select((s: RootState) => s.auth.user?.id);
    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }
    yield call(
      createBillingPeriod,
      action.payload.apartmentId,
      action.payload.month,
      action.payload.year,
      action.payload.dueDate,
      userId,
      action.payload.payments?.map(payment => ({
        tenant_id: payment.tenantId,
        amount: payment.amount,
        rent_amount: payment.rentAmount ?? payment.amount,
        utility_total: payment.utilityTotal ?? 0,
        extra_charges: payment.extraCharges ?? [],
      })),
    );
    const periods = yield call(
      getBillingPeriods,
      action.payload.apartmentId,
    );
    const payments = yield call(
      getPaymentsForApartment,
      action.payload.apartmentId,
    );
    yield put(setBillingPeriods(periods));
    yield put(setPayments(payments));
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
      getBillingPeriods,
      action.payload.apartmentId,
    );
    const payments = yield call(
      getPaymentsForApartment,
      action.payload.apartmentId,
    );
    yield put(setBillingPeriods(periods));
    yield put(setPayments(payments));
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
      getPayments,
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
    const payments = yield call(getMyPayments, action.payload.userId);
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
    const {paymentId, method, receiptUri} = action.payload;
    let receiptUrl: string | undefined;
    if (receiptUri) {
      const ext = receiptUri.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${paymentId}/${Date.now()}.${ext}`;
      yield call(uploadImage, 'payment-receipts', path, {
        uri: receiptUri,
        type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        name: path.split('/').pop()!,
      });
      receiptUrl = getImageUrl('payment-receipts', path);
    }
    yield call(reportPayment, paymentId, method, receiptUrl);
    const payment = yield call(getPayment, paymentId);
    const tenantName =
      (payment as any).tenant?.full_name ?? 'Nguoi thue';
    const billing = (payment as any).billing_periods;
    if (billing?.created_by) {
      try {
        yield call(createNotification, {
          user_id: billing.created_by,
          apartment_id: billing.apartment_id,
          type: 'payment',
          title: 'Nguoi thue da bao thanh toan',
          body: `${tenantName} da bao thanh toan.`,
          data: {
            route: 'PaymentConfirm',
            params: {id: paymentId},
            entityType: 'payment',
            entityId: paymentId,
          },
        });
      } catch {
        // Notification delivery must not block payment reporting.
      }
    }

    const userId = yield select((s: RootState) => s.auth.user?.id);
    if (userId) {
      const payments = yield call(getMyPayments, userId);
      yield put(setMyPayments(payments));
    }
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to report payment'));
  }
}

function* handleConfirmPayment(
  action: ReturnType<typeof confirmPaymentRequest>,
): Generator<any, void, any> {
  try {
    const userId = yield select((s: RootState) => s.auth.user?.id);
    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }
    yield call(confirmPayment, action.payload.paymentId, userId);
    const payment = yield call(getPayment, action.payload.paymentId);
    const billing = (payment as any).billing_periods;
    if (payment.billing_period_id) {
      const payments = yield call(getPayments, payment.billing_period_id);
      yield put(setPayments(payments));
    }
    try {
      yield call(createNotification, {
        user_id: payment.tenant_id,
        apartment_id: billing?.apartment_id ?? null,
        type: 'payment',
        title: 'Thanh toan da duoc xac nhan',
        body: 'Chu nha da xac nhan thanh toan cua ban.',
        data: {
          route: 'PaymentDetail',
          params: {id: payment.id},
          entityType: 'payment',
          entityId: payment.id,
        },
      });
    } catch {
      // Notification delivery must not block payment confirmation.
    }
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to confirm payment'));
  }
}

function* handleRejectPayment(
  action: ReturnType<typeof rejectPaymentRequest>,
): Generator<any, void, any> {
  try {
    yield call(
      rejectPayment,
      action.payload.paymentId,
      action.payload.note,
    );
    const payment = yield call(getPayment, action.payload.paymentId);
    const billing = (payment as any).billing_periods;
    if (payment.billing_period_id) {
      const payments = yield call(getPayments, payment.billing_period_id);
      yield put(setPayments(payments));
    }
    try {
      yield call(createNotification, {
        user_id: payment.tenant_id,
        apartment_id: billing?.apartment_id ?? null,
        type: 'payment',
        title: 'Thanh toan can kiem tra lai',
        body:
          action.payload.note ??
          'Chu nha chua xac nhan duoc thanh toan cua ban.',
        data: {
          route: 'PaymentDetail',
          params: {id: payment.id},
          entityType: 'payment',
          entityId: payment.id,
        },
      });
    } catch {
      // Notification delivery must not block payment rejection.
    }
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to reject payment'));
  }
}

export function* paymentSaga() {
  yield takeLatest(createBillingRequest.type, handleCreateBilling);
  yield takeLatest(fetchBillingPeriodsRequest.type, handleFetchBillingPeriods);
  yield takeLatest(fetchPaymentsRequest.type, handleFetchPayments);
  yield takeLatest(fetchMyPaymentsRequest.type, handleFetchMyPayments);
  yield takeLatest(reportPaymentRequest.type, handleReportPayment);
  yield takeLatest(confirmPaymentRequest.type, handleConfirmPayment);
  yield takeLatest(rejectPaymentRequest.type, handleRejectPayment);
}

export default paymentSlice.reducer;
