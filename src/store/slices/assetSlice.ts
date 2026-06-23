import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {call, put, select, takeLatest} from 'redux-saga/effects';
import {
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  uploadImage,
  getImageUrl,
} from '../../services';
import type {Asset, AssetInsert, AssetUpdate} from '../../types';
import type {RootState} from '../index';

interface AssetState {
  assets: Asset[];
  currentAsset: Asset | null;
  loading: boolean;
  error: string | null;
}

const initialState: AssetState = {
  assets: [],
  currentAsset: null,
  loading: false,
  error: null,
};

type CreateAssetPayload = Omit<AssetInsert, 'id' | 'created_at' | 'image_url'> & {
  imageUri?: string;
};

type UpdateAssetPayload = {
  id: string;
  updates: AssetUpdate;
  imageUri?: string;
};

const assetSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    fetchAssetsRequest(state, _action: PayloadAction<{apartmentId: string}>) {
      state.loading = true;
      state.error = null;
    },
    fetchAssetRequest(state, _action: PayloadAction<{id: string}>) {
      state.loading = true;
      state.error = null;
    },
    createAssetRequest(state, _action: PayloadAction<CreateAssetPayload>) {
      state.loading = true;
      state.error = null;
    },
    updateAssetRequest(state, _action: PayloadAction<UpdateAssetPayload>) {
      state.loading = true;
      state.error = null;
    },
    deleteAssetRequest(state, _action: PayloadAction<{id: string}>) {
      state.loading = true;
      state.error = null;
    },
    setAssets(state, action: PayloadAction<Asset[]>) {
      state.assets = action.payload;
    },
    setCurrentAsset(state, action: PayloadAction<Asset | null>) {
      state.currentAsset = action.payload;
    },
    upsertAsset(state, action: PayloadAction<Asset>) {
      const idx = state.assets.findIndex(a => a.id === action.payload.id);
      if (idx === -1) {
        state.assets = [action.payload, ...state.assets];
      } else {
        state.assets[idx] = action.payload;
      }
    },
    removeAsset(state, action: PayloadAction<string>) {
      state.assets = state.assets.filter(a => a.id !== action.payload);
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
  fetchAssetsRequest,
  fetchAssetRequest,
  createAssetRequest,
  updateAssetRequest,
  deleteAssetRequest,
  setAssets,
  setCurrentAsset,
  upsertAsset,
  removeAsset,
  setLoading,
  setError,
} = assetSlice.actions;

function* uploadAssetImage(
  apartmentId: string,
  imageUri: string,
): Generator<any, string, any> {
  const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${apartmentId}/${Date.now()}.${ext}`;
  yield call(uploadImage, 'asset-images', path, {
    uri: imageUri,
    type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    name: path.split('/').pop()!,
  });
  return getImageUrl('asset-images', path);
}

function* handleFetchAssets(
  action: ReturnType<typeof fetchAssetsRequest>,
): Generator<any, void, any> {
  try {
    const assets = yield call(getAssets, action.payload.apartmentId);
    yield put(setAssets(assets));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch assets'));
  }
}

function* handleFetchAsset(
  action: ReturnType<typeof fetchAssetRequest>,
): Generator<any, void, any> {
  try {
    const asset = yield call(getAsset, action.payload.id);
    yield put(setCurrentAsset(asset));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch asset'));
  }
}

function* handleCreateAsset(
  action: ReturnType<typeof createAssetRequest>,
): Generator<any, void, any> {
  try {
    const {imageUri, ...rest} = action.payload;
    let image_url: string | null = null;
    if (imageUri) {
      image_url = yield* uploadAssetImage(rest.apartment_id, imageUri);
    }
    const asset = yield call(createAsset, {...rest, image_url});
    yield put(upsertAsset(asset));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to create asset'));
  }
}

function* handleUpdateAsset(
  action: ReturnType<typeof updateAssetRequest>,
): Generator<any, void, any> {
  try {
    const {id, updates, imageUri} = action.payload;
    const apartmentId = yield select(
      (s: RootState) => s.apartment.apartment?.id,
    );
    let finalUpdates: AssetUpdate = {...updates};
    if (imageUri && apartmentId) {
      finalUpdates.image_url = yield* uploadAssetImage(apartmentId, imageUri);
    }
    const asset = yield call(updateAsset, id, finalUpdates);
    yield put(upsertAsset(asset));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to update asset'));
  }
}

function* handleDeleteAsset(
  action: ReturnType<typeof deleteAssetRequest>,
): Generator<any, void, any> {
  try {
    yield call(deleteAsset, action.payload.id);
    yield put(removeAsset(action.payload.id));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to delete asset'));
  }
}

export function* assetSaga() {
  yield takeLatest(fetchAssetsRequest.type, handleFetchAssets);
  yield takeLatest(fetchAssetRequest.type, handleFetchAsset);
  yield takeLatest(createAssetRequest.type, handleCreateAsset);
  yield takeLatest(updateAssetRequest.type, handleUpdateAsset);
  yield takeLatest(deleteAssetRequest.type, handleDeleteAsset);
}

export default assetSlice.reducer;
