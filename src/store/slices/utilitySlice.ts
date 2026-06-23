import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {call, put, takeLatest} from 'redux-saga/effects';
import {
  getUtilityConfigs,
  upsertUtilityConfig,
  updateUtilityConfig,
} from '../../services';
import type {
  UtilityConfig,
  UtilityConfigInsert,
  UtilityConfigUpdate,
} from '../../types';

interface UtilityState {
  configs: UtilityConfig[];
  loading: boolean;
  error: string | null;
}

const initialState: UtilityState = {
  configs: [],
  loading: false,
  error: null,
};

const utilitySlice = createSlice({
  name: 'utility',
  initialState,
  reducers: {
    fetchUtilityConfigsRequest(
      state,
      _action: PayloadAction<{apartmentId: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    upsertUtilityConfigRequest(
      state,
      _action: PayloadAction<UtilityConfigInsert>,
    ) {
      state.loading = true;
      state.error = null;
    },
    updateUtilityConfigRequest(
      state,
      _action: PayloadAction<{id: string; updates: UtilityConfigUpdate}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    setUtilityConfigs(state, action: PayloadAction<UtilityConfig[]>) {
      state.configs = action.payload;
    },
    upsertConfig(state, action: PayloadAction<UtilityConfig>) {
      const idx = state.configs.findIndex(c => c.id === action.payload.id);
      if (idx === -1) {
        state.configs = [...state.configs, action.payload];
      } else {
        state.configs[idx] = action.payload;
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
  fetchUtilityConfigsRequest,
  upsertUtilityConfigRequest,
  updateUtilityConfigRequest,
  setUtilityConfigs,
  upsertConfig,
  setLoading,
  setError,
} = utilitySlice.actions;

function* handleFetchUtilityConfigs(
  action: ReturnType<typeof fetchUtilityConfigsRequest>,
): Generator<any, void, any> {
  try {
    const configs = yield call(getUtilityConfigs, action.payload.apartmentId);
    yield put(setUtilityConfigs(configs));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch utility configs'));
  }
}

function* handleUpsertUtilityConfig(
  action: ReturnType<typeof upsertUtilityConfigRequest>,
): Generator<any, void, any> {
  try {
    const config = yield call(upsertUtilityConfig, action.payload);
    yield put(upsertConfig(config));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to save utility config'));
  }
}

function* handleUpdateUtilityConfig(
  action: ReturnType<typeof updateUtilityConfigRequest>,
): Generator<any, void, any> {
  try {
    const config = yield call(
      updateUtilityConfig,
      action.payload.id,
      action.payload.updates,
    );
    yield put(upsertConfig(config));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to update utility config'));
  }
}

export function* utilitySaga() {
  yield takeLatest(fetchUtilityConfigsRequest.type, handleFetchUtilityConfigs);
  yield takeLatest(upsertUtilityConfigRequest.type, handleUpsertUtilityConfig);
  yield takeLatest(updateUtilityConfigRequest.type, handleUpdateUtilityConfig);
}

export default utilitySlice.reducer;
