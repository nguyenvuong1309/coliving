import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {call, put, select, takeLatest} from 'redux-saga/effects';
import {
  createApartment,
  getApartment,
  getApartmentsForUser,
  getApartmentByInviteCode,
  joinApartment,
  getMembers,
  removeMember,
  updateMember,
  generateInviteCode,
} from '../../services/apartment';
import {createNotification} from '../../services/notification';
import type {
  Apartment,
  ApartmentMember,
  ApartmentMemberUpdate,
} from '../../types/database';
import type {RootState} from '../index';

interface ApartmentMemberWithProfile extends ApartmentMember {
  profile: any;
}

interface ApartmentState {
  apartment: Apartment | null;
  apartments: Apartment[];
  members: ApartmentMemberWithProfile[];
  loading: boolean;
  error: string | null;
}

const initialState: ApartmentState = {
  apartment: null,
  apartments: [],
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
      _action: PayloadAction<{
        name: string;
        address: string;
        num_rooms: number;
      }>,
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchApartmentRequest(state, _action: PayloadAction<{id: string}>) {
      state.loading = true;
      state.error = null;
    },
    fetchCurrentApartmentRequest(
      state,
      _action: PayloadAction<{userId: string; role: 'tenant' | 'landlord'}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchApartmentsRequest(
      state,
      _action: PayloadAction<{userId: string; role: 'tenant' | 'landlord'}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    selectApartmentRequest(state, _action: PayloadAction<{apartmentId: string}>) {
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
    updateMemberRequest(
      state,
      _action: PayloadAction<{memberId: string; updates: ApartmentMemberUpdate}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    setApartment(state, action: PayloadAction<Apartment | null>) {
      state.apartment = action.payload;
    },
    setApartments(state, action: PayloadAction<Apartment[]>) {
      state.apartments = action.payload;
    },
    upsertApartment(state, action: PayloadAction<Apartment>) {
      const idx = state.apartments.findIndex(a => a.id === action.payload.id);
      if (idx === -1) {
        state.apartments = [action.payload, ...state.apartments];
      } else {
        state.apartments[idx] = action.payload;
      }
    },
    setMembers(state, action: PayloadAction<ApartmentMemberWithProfile[]>) {
      state.members = action.payload;
    },
    upsertMember(state, action: PayloadAction<ApartmentMemberWithProfile>) {
      const idx = state.members.findIndex(m => m.id === action.payload.id);
      if (idx === -1) {
        state.members = [...state.members, action.payload];
      } else {
        state.members[idx] = action.payload;
      }
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
  fetchCurrentApartmentRequest,
  fetchApartmentsRequest,
  selectApartmentRequest,
  joinApartmentRequest,
  fetchMembersRequest,
  removeMemberRequest,
  updateMemberRequest,
  setApartment,
  setApartments,
  upsertApartment,
  setMembers,
  upsertMember,
  setLoading,
  setError,
} = apartmentSlice.actions;

// Sagas

function* handleCreateApartment(
  action: ReturnType<typeof createApartmentRequest>,
): Generator<any, void, any> {
  try {
    const userId = yield select((s: RootState) => s.auth.user?.id);
    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }
    const inviteCode = generateInviteCode();
    const apartment = yield call(createApartment, {
      ...action.payload,
      landlord_id: userId,
      invite_code: inviteCode,
    });
    yield put(setApartment(apartment));
    const apartments = yield select((s: RootState) => s.apartment.apartments);
    yield put(setApartments([apartment, ...apartments]));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to create apartment'));
  }
}

function* handleFetchApartment(
  action: ReturnType<typeof fetchApartmentRequest>,
): Generator<any, void, any> {
  try {
    const apartment = yield call(getApartment, action.payload.id);
    yield put(setApartment(apartment));
    yield put(upsertApartment(apartment));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch apartment'));
  }
}

function* handleFetchCurrentApartment(
  action: ReturnType<typeof fetchCurrentApartmentRequest>,
): Generator<any, void, any> {
  try {
    const apartments = yield call(
      getApartmentsForUser,
      action.payload.userId,
      action.payload.role,
    );
    const apartment = apartments[0] ?? null;
    yield put(setApartments(apartments));
    yield put(setApartment(apartment));
    if (apartment?.id) {
      const members = yield call(getMembers, apartment.id);
      yield put(setMembers(members));
    } else {
      yield put(setMembers([]));
    }
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setApartment(null));
    yield put(setApartments([]));
    yield put(setMembers([]));
    yield put(setError(error.message ?? 'Failed to fetch apartment'));
  }
}

function* handleFetchApartments(
  action: ReturnType<typeof fetchApartmentsRequest>,
): Generator<any, void, any> {
  try {
    const apartments = yield call(
      getApartmentsForUser,
      action.payload.userId,
      action.payload.role,
    );
    yield put(setApartments(apartments));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch apartments'));
  }
}

function* handleSelectApartment(
  action: ReturnType<typeof selectApartmentRequest>,
): Generator<any, void, any> {
  try {
    const apartments: Apartment[] = yield select(
      (s: RootState) => s.apartment.apartments,
    );
    let apartment =
      apartments.find(item => item.id === action.payload.apartmentId) ?? null;
    if (!apartment) {
      apartment = yield call(getApartment, action.payload.apartmentId);
    }
    yield put(setApartment(apartment));
    if (apartment?.id) {
      const members = yield call(getMembers, apartment.id);
      yield put(setMembers(members));
    } else {
      yield put(setMembers([]));
    }
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to select apartment'));
  }
}

function* handleJoinApartment(
  action: ReturnType<typeof joinApartmentRequest>,
): Generator<any, void, any> {
  try {
    const userId = yield select((s: RootState) => s.auth.user?.id);
    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }
    const apartment = yield call(
      getApartmentByInviteCode,
      action.payload.inviteCode,
    );
    yield call(joinApartment, apartment.id, userId);
    yield put(setApartment(apartment));
    yield put(upsertApartment(apartment));
    const members = yield call(getMembers, apartment.id);
    yield put(setMembers(members));
    try {
      const joinedMember = members.find(
        (member: ApartmentMemberWithProfile) => member.user_id === userId,
      );
      yield call(createNotification, {
        user_id: apartment.landlord_id,
        apartment_id: apartment.id,
        type: 'tenant_joined',
        title: 'Nguoi thue moi da tham gia',
        body: `${
          joinedMember?.profile?.full_name ?? 'Nguoi thue moi'
        } vua tham gia can ho ${apartment.name}.`,
        data: {
          route: 'TenantDetail',
          params: {id: userId},
          entityType: 'tenant',
          entityId: userId,
        },
      });
    } catch {
      // Notification delivery must not block apartment onboarding.
    }
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to join apartment'));
  }
}

function* handleFetchMembers(
  action: ReturnType<typeof fetchMembersRequest>,
): Generator<any, void, any> {
  try {
    const members = yield call(getMembers, action.payload.apartmentId);
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

function* handleUpdateMember(
  action: ReturnType<typeof updateMemberRequest>,
): Generator<any, void, any> {
  try {
    const member = yield call(
      updateMember,
      action.payload.memberId,
      action.payload.updates,
    );
    yield put(upsertMember(member));
    if (
      action.payload.updates.room_name !== undefined ||
      action.payload.updates.rent_amount !== undefined
    ) {
      try {
        yield call(createNotification, {
          user_id: member.user_id,
          apartment_id: member.apartment_id,
          type: 'tenant_profile_updated',
          title: 'Thong tin phong da duoc cap nhat',
          body: 'Chu nha da cap nhat phong hoac tien thue cua ban.',
          data: {
            route: 'TenantProfile',
            entityType: 'tenant',
            entityId: member.user_id,
          },
        });
      } catch {
        // Notification delivery must not block member updates.
      }
    }
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to update member'));
  }
}

export function* apartmentSaga() {
  yield takeLatest(createApartmentRequest.type, handleCreateApartment);
  yield takeLatest(fetchApartmentRequest.type, handleFetchApartment);
  yield takeLatest(fetchApartmentsRequest.type, handleFetchApartments);
  yield takeLatest(selectApartmentRequest.type, handleSelectApartment);
  yield takeLatest(
    fetchCurrentApartmentRequest.type,
    handleFetchCurrentApartment,
  );
  yield takeLatest(joinApartmentRequest.type, handleJoinApartment);
  yield takeLatest(fetchMembersRequest.type, handleFetchMembers);
  yield takeLatest(removeMemberRequest.type, handleRemoveMember);
  yield takeLatest(updateMemberRequest.type, handleUpdateMember);
}

export default apartmentSlice.reducer;
