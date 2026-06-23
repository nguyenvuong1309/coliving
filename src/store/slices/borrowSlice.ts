import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {call, put, takeLatest} from 'redux-saga/effects';
import {
  getBorrowRequests,
  createBorrowRequest,
  updateBorrowStatus,
  getBorrowRequest,
  createNotification,
} from '../../services';
import type {BorrowRequest, BorrowRequestInsert} from '../../types';

type BorrowStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_use'
  | 'return_requested'
  | 'returned';

type CreateBorrowPayload = Omit<
  BorrowRequestInsert,
  'id' | 'created_at' | 'updated_at' | 'status'
>;

interface BorrowState {
  requests: BorrowRequest[];
  currentRequest: BorrowRequest | null;
  loading: boolean;
  error: string | null;
}

const initialState: BorrowState = {
  requests: [],
  currentRequest: null,
  loading: false,
  error: null,
};

function getBorrowStatusMessage(status: BorrowStatus, assetName: string) {
  switch (status) {
    case 'approved':
      return {
        title: 'Yeu cau muon do da duoc duyet',
        body: `Yeu cau muon ${assetName} da duoc chap nhan.`,
      };
    case 'rejected':
      return {
        title: 'Yeu cau muon do bi tu choi',
        body: `Yeu cau muon ${assetName} da bi tu choi.`,
      };
    case 'in_use':
      return {
        title: 'Tai san dang duoc muon',
        body: `${assetName} da duoc danh dau dang muon.`,
      };
    case 'return_requested':
      return {
        title: 'Nguoi muon da bao tra do',
        body: `Nguoi muon da bao tra ${assetName}.`,
      };
    case 'returned':
      return {
        title: 'Da xac nhan tra do',
        body: `${assetName} da duoc xac nhan da tra.`,
      };
    default:
      return {
        title: 'Yeu cau muon do duoc cap nhat',
        body: `Yeu cau muon ${assetName} vua duoc cap nhat.`,
      };
  }
}

const borrowSlice = createSlice({
  name: 'borrow',
  initialState,
  reducers: {
    fetchBorrowRequestsRequest(
      state,
      _action: PayloadAction<{apartmentId: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    createBorrowRequestRequest(
      state,
      _action: PayloadAction<CreateBorrowPayload>,
    ) {
      state.loading = true;
      state.error = null;
    },
    updateBorrowStatusRequest(
      state,
      _action: PayloadAction<{id: string; status: BorrowStatus}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchBorrowDetailRequest(state, _action: PayloadAction<{id: string}>) {
      state.loading = true;
      state.error = null;
    },
    setRequests(state, action: PayloadAction<BorrowRequest[]>) {
      state.requests = action.payload;
    },
    setCurrentRequest(state, action: PayloadAction<BorrowRequest | null>) {
      state.currentRequest = action.payload;
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
  fetchBorrowRequestsRequest,
  createBorrowRequestRequest,
  updateBorrowStatusRequest,
  fetchBorrowDetailRequest,
  setRequests,
  setCurrentRequest,
  setLoading,
  setError,
} = borrowSlice.actions;

// Sagas

function* handleFetchBorrowRequests(
  action: ReturnType<typeof fetchBorrowRequestsRequest>,
): Generator<any, void, any> {
  try {
    const requests = yield call(
      getBorrowRequests,
      action.payload.apartmentId,
    );
    yield put(setRequests(requests));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch borrow requests'));
  }
}

function* handleCreateBorrowRequest(
  action: ReturnType<typeof createBorrowRequestRequest>,
): Generator<any, void, any> {
  try {
    const created = yield call(createBorrowRequest, action.payload);
    const request = yield call(getBorrowRequest, created.id);
    yield put(setCurrentRequest(request));
    const assetName = (request as any).assets?.name ?? 'tai san';
    const borrowerName =
      (request as any).borrower?.full_name ?? 'Nguoi thue';
    const lenderRoute =
      (request as any).lender?.role === 'landlord'
        ? 'LandlordBorrowDetail'
        : 'BorrowDetail';
    try {
      yield call(createNotification, {
        user_id: request.lender_id,
        apartment_id: request.apartment_id,
        type: 'borrow',
        title: 'Co yeu cau muon do moi',
        body: `${borrowerName} muon ${assetName}.`,
        data: {
          route: lenderRoute,
          params: {id: request.id},
          entityType: 'borrow',
          entityId: request.id,
        },
      });
    } catch {
      // Notification delivery must not block borrow creation.
    }
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to create borrow request'));
  }
}

function* handleUpdateBorrowStatus(
  action: ReturnType<typeof updateBorrowStatusRequest>,
): Generator<any, void, any> {
  try {
    const updated = yield call(
      updateBorrowStatus,
      action.payload.id,
      action.payload.status,
    );
    const request = yield call(getBorrowRequest, updated.id);
    yield put(setCurrentRequest(request));
    const assetName = (request as any).assets?.name ?? 'tai san';
    const message = getBorrowStatusMessage(action.payload.status, assetName);
    const recipientId =
      action.payload.status === 'return_requested'
        ? request.lender_id
        : request.borrower_id;
    const recipientRole =
      recipientId === request.lender_id
        ? (request as any).lender?.role
        : (request as any).borrower?.role;
    const route =
      recipientRole === 'landlord' ? 'LandlordBorrowDetail' : 'BorrowDetail';
    try {
      yield call(createNotification, {
        user_id: recipientId,
        apartment_id: request.apartment_id,
        type: 'borrow',
        title: message.title,
        body: message.body,
        data: {
          route,
          params: {id: request.id},
          entityType: 'borrow',
          entityId: request.id,
          status: action.payload.status,
        },
      });
    } catch {
      // Notification delivery must not block borrow status updates.
    }
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to update borrow status'));
  }
}

function* handleFetchBorrowDetail(
  action: ReturnType<typeof fetchBorrowDetailRequest>,
): Generator<any, void, any> {
  try {
    const request = yield call(getBorrowRequest, action.payload.id);
    yield put(setCurrentRequest(request));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch borrow detail'));
  }
}

export function* borrowSaga() {
  yield takeLatest(fetchBorrowRequestsRequest.type, handleFetchBorrowRequests);
  yield takeLatest(createBorrowRequestRequest.type, handleCreateBorrowRequest);
  yield takeLatest(updateBorrowStatusRequest.type, handleUpdateBorrowStatus);
  yield takeLatest(fetchBorrowDetailRequest.type, handleFetchBorrowDetail);
}

export default borrowSlice.reducer;
