import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {call, put, takeLatest} from 'redux-saga/effects';
import {
  getBorrowRequests,
  createBorrowRequest,
  updateBorrowStatus,
  getBorrowRequest,
} from '../../services/borrow';
import type {BorrowRequest, BorrowRequestInsert} from '../../types/database';

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
    const request = yield call(createBorrowRequest, action.payload);
    yield put(setCurrentRequest(request));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to create borrow request'));
  }
}

function* handleUpdateBorrowStatus(
  action: ReturnType<typeof updateBorrowStatusRequest>,
): Generator<any, void, any> {
  try {
    const request = yield call(
      updateBorrowStatus,
      action.payload.id,
      action.payload.status,
    );
    yield put(setCurrentRequest(request));
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
