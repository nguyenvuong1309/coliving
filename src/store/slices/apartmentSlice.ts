import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {call, put, takeLatest} from 'redux-saga/effects';
import {
  createApartment,
  fetchApartment,
  getApartmentByInviteCode,
  joinApartment,
  fetchMembers,
  removeMember,
} from '../../services/apartment';
import type {Apartment, ApartmentMember} from '../../types/database';

interface ApartmentMemberWithProfile extends ApartmentMember {
  profile: any;
}

interface ApartmentState {
  apartment: Apartment | null;
  members: ApartmentMemberWithProfile[];
  loading: boolean;
  error: string | null;
}

const initialState: ApartmentState = {
  apartment: null,
  members: [],
  loading: false,
  error: null,
};

const apartmentSlice = createSlice({
  name: 'apartment',
  initialState,
  reducers: {
    createApartmentRequest(
      state,
      _action: PayloadAction<{name: string; address: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchApartmentRequest(state, _action: PayloadAction<{id: string}>) {
      state.loading = true;
      state.error = null;
    },
    joinApartmentRequest(
      state,
      _action: PayloadAction<{inviteCode: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchMembersRequest(
      state,
      _action: PayloadAction<{apartmentId: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    removeMemberRequest(
      state,
      _action: PayloadAction<{memberId: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    setApartment(state, action: PayloadAction<Apartment | null>) {
      state.apartment = action.payload;
    },
    setMembers(state, action: PayloadAction<ApartmentMemberWithProfile[]>) {
      state.members = action.payload;
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
  createApartmentRequest,
  fetchApartmentRequest,
  joinApartmentRequest,
  fetchMembersRequest,
  removeMemberRequest,
  setApartment,
  setMembers,
  setLoading,
  setError,
} = apartmentSlice.actions;

// Sagas

function* handleCreateApartment(
  action: ReturnType<typeof createApartmentRequest>,
): Generator<any, void, any> {
  try {
    const apartment = yield call(createApartment, action.payload);
    yield put(setApartment(apartment));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to create apartment'));
  }
}

function* handleFetchApartment(
  action: ReturnType<typeof fetchApartmentRequest>,
): Generator<any, void, any> {
  try {
    const apartment = yield call(fetchApartment, action.payload.id);
    yield put(setApartment(apartment));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch apartment'));
  }
}

function* handleJoinApartment(
  action: ReturnType<typeof joinApartmentRequest>,
): Generator<any, void, any> {
  try {
    const apartment = yield call(
      getApartmentByInviteCode,
      action.payload.inviteCode,
    );
    yield call(joinApartment, apartment.id);
    yield put(setApartment(apartment));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to join apartment'));
  }
}

function* handleFetchMembers(
  action: ReturnType<typeof fetchMembersRequest>,
): Generator<any, void, any> {
  try {
    const members = yield call(fetchMembers, action.payload.apartmentId);
    yield put(setMembers(members));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch members'));
  }
}

function* handleRemoveMember(
  action: ReturnType<typeof removeMemberRequest>,
): Generator<any, void, any> {
  try {
    yield call(removeMember, action.payload.memberId);
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to remove member'));
  }
}

export function* apartmentSaga() {
  yield takeLatest(createApartmentRequest.type, handleCreateApartment);
  yield takeLatest(fetchApartmentRequest.type, handleFetchApartment);
  yield takeLatest(joinApartmentRequest.type, handleJoinApartment);
  yield takeLatest(fetchMembersRequest.type, handleFetchMembers);
  yield takeLatest(removeMemberRequest.type, handleRemoveMember);
}

export default apartmentSlice.reducer;
