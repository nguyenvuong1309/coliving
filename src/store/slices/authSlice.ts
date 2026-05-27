import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {all, call, fork, put, takeLatest} from 'redux-saga/effects';
import {createMMKV} from 'react-native-mmkv';
import {
  signUp,
  signIn,
  signOut,
  resetPassword,
  signInWithGoogle,
  signInWithApple,
} from '../../services/auth';
import type {Profile} from '../../types/database';

const storage = createMMKV();

interface AuthState {
  user: Profile | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signUpRequest(
      state,
      _action: PayloadAction<{email: string; password: string; fullName: string; role: 'tenant' | 'landlord'}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    signInRequest(
      state,
      _action: PayloadAction<{email: string; password: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    signOutRequest(state) {
      state.loading = true;
      state.error = null;
    },
    resetPasswordRequest(state, _action: PayloadAction<{email: string}>) {
      state.loading = true;
      state.error = null;
    },
    signInWithGoogleRequest(
      state,
      _action: PayloadAction<{idToken: string; accessToken: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    signInWithAppleRequest(
      state,
      _action: PayloadAction<{idToken: string; fullName?: any}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    setUser(state, action: PayloadAction<Profile | null>) {
      state.user = action.payload;
    },
    setSession(state, action: PayloadAction<any | null>) {
      state.session = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  signUpRequest,
  signInRequest,
  signOutRequest,
  resetPasswordRequest,
  signInWithGoogleRequest,
  signInWithAppleRequest,
  setUser,
  setSession,
  setLoading,
  setError,
  clearError,
} = authSlice.actions;

// Sagas

function* handleSignUp(
  action: ReturnType<typeof signUpRequest>,
): Generator<any, void, any> {
  try {
    const {email, password, fullName, role} = action.payload;
    const {session, user} = yield call(signUp, email, password, fullName, role);
    if (session?.access_token) {
      storage.set('token', session.access_token);
    }
    yield put(setSession(session));
    yield put(setUser(user));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Sign up failed'));
  }
}

function* handleSignIn(
  action: ReturnType<typeof signInRequest>,
): Generator<any, void, any> {
  try {
    const {session, user} = yield call(signIn, action.payload);
    if (session?.access_token) {
      storage.set('token', session.access_token);
    }
    yield put(setSession(session));
    yield put(setUser(user));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Sign in failed'));
  }
}

function* handleSignOut(): Generator<any, void, any> {
  try {
    yield call(signOut);
    storage.delete('token');
    yield put(setSession(null));
    yield put(setUser(null));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Sign out failed'));
  }
}

function* handleResetPassword(
  action: ReturnType<typeof resetPasswordRequest>,
): Generator<any, void, any> {
  try {
    yield call(resetPassword, action.payload.email);
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Reset password failed'));
  }
}

function* handleSignInWithGoogle(
  action: ReturnType<typeof signInWithGoogleRequest>,
): Generator<any, void, any> {
  try {
    const {session, user} = yield call(
      signInWithGoogle,
      action.payload.idToken,
      action.payload.accessToken,
    );
    if (session?.access_token) {
      storage.set('token', session.access_token);
    }
    yield put(setSession(session));
    yield put(setUser(user));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Google sign in failed'));
  }
}

function* handleSignInWithApple(
  action: ReturnType<typeof signInWithAppleRequest>,
): Generator<any, void, any> {
  try {
    const {session, user} = yield call(
      signInWithApple,
      action.payload.idToken,
      action.payload.fullName,
    );
    if (session?.access_token) {
      storage.set('token', session.access_token);
    }
    yield put(setSession(session));
    yield put(setUser(user));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Apple sign in failed'));
  }
}

export function* watchSignUp() {
  yield takeLatest(signUpRequest.type, handleSignUp);
}

export function* watchSignIn() {
  yield takeLatest(signInRequest.type, handleSignIn);
}

export function* watchSignOut() {
  yield takeLatest(signOutRequest.type, handleSignOut);
}

export function* watchResetPassword() {
  yield takeLatest(resetPasswordRequest.type, handleResetPassword);
}

export function* watchSignInWithGoogle() {
  yield takeLatest(signInWithGoogleRequest.type, handleSignInWithGoogle);
}

export function* watchSignInWithApple() {
  yield takeLatest(signInWithAppleRequest.type, handleSignInWithApple);
}

export function* authSaga() {
  yield all([
    fork(watchSignUp),
    fork(watchSignIn),
    fork(watchSignOut),
    fork(watchResetPassword),
    fork(watchSignInWithGoogle),
    fork(watchSignInWithApple),
  ]);
}

export default authSlice.reducer;
