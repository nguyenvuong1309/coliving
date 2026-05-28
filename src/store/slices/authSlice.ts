import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { all, call, fork, put, select, takeLatest } from 'redux-saga/effects';
import type { RootState } from '../index';
import {clearAuth, setAuthToken} from '../../utils/mmkv';
import {
  signUp,
  signIn,
  signOut,
  resetPassword,
  signInWithGoogle,
  signInWithApple,
  getProfile,
  updateProfile,
  changePassword,
} from '../../services/auth';
import type { Profile, ProfileUpdate } from '../../types/database';

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
      _action: PayloadAction<{
        email: string;
        password: string;
        fullName: string;
        role: 'tenant' | 'landlord';
      }>,
    ) {
      state.loading = true;
      state.error = null;
    },
    signInRequest(
      state,
      _action: PayloadAction<{ email: string; password: string }>,
    ) {
      state.loading = true;
      state.error = null;
    },
    signOutRequest(state) {
      state.loading = true;
      state.error = null;
    },
    resetPasswordRequest(state, _action: PayloadAction<{ email: string }>) {
      state.loading = true;
      state.error = null;
    },
    signInWithGoogleRequest(
      state,
      _action: PayloadAction<{ idToken: string; accessToken: string }>,
    ) {
      state.loading = true;
      state.error = null;
    },
    signInWithAppleRequest(
      state,
      _action: PayloadAction<{ idToken: string; fullName?: any }>,
    ) {
      state.loading = true;
      state.error = null;
    },
    updateProfileRequest(
      state,
      _action: PayloadAction<{ updates: ProfileUpdate }>,
    ) {
      state.loading = true;
      state.error = null;
    },
    changePasswordRequest(
      state,
      _action: PayloadAction<{ newPassword: string }>,
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
  updateProfileRequest,
  changePasswordRequest,
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
    const { email, password, fullName, role } = action.payload;
    const { session, user } = yield call(
      signUp,
      email,
      password,
      fullName,
      role,
    );
    if (session?.access_token) {
      setAuthToken(session.access_token);
    }
    yield put(setSession(session));
    if (session && user?.id) {
      try {
        const profile = yield call(getProfile, user.id);
        yield put(setUser(profile));
      } catch {
        yield put(setUser(null));
      }
    } else {
      yield put(setUser(null));
    }
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Sign up failed'));
  }
}

function* handleSignIn(
  action: ReturnType<typeof signInRequest>,
): Generator<any, void, any> {
  try {
    const { email, password } = action.payload;
    const { session, user } = yield call(signIn, email, password);
    if (session?.access_token) {
      setAuthToken(session.access_token);
    }
    yield put(setSession(session));
    if (user?.id) {
      try {
        const profile = yield call(getProfile, user.id);
        yield put(setUser(profile));
      } catch {
        yield put(setUser(null));
      }
    }
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Sign in failed'));
  }
}

function* handleSignOut(): Generator<any, void, any> {
  try {
    yield call(signOut);
    clearAuth();
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
    const { session, user } = yield call(
      signInWithGoogle,
      action.payload.idToken,
      action.payload.accessToken,
    );
    if (session?.access_token) {
      setAuthToken(session.access_token);
    }
    yield put(setSession(session));
    if (user?.id) {
      try {
        const profile = yield call(getProfile, user.id);
        yield put(setUser(profile));
      } catch {
        yield put(setUser(null));
      }
    }
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Google sign in failed'));
  }
}

function* handleSignInWithApple(
  action: ReturnType<typeof signInWithAppleRequest>,
): Generator<any, void, any> {
  try {
    const { session, user } = yield call(
      signInWithApple,
      action.payload.idToken,
      action.payload.fullName,
    );
    if (session?.access_token) {
      setAuthToken(session.access_token);
    }
    yield put(setSession(session));
    if (user?.id) {
      try {
        const profile = yield call(getProfile, user.id);
        yield put(setUser(profile));
      } catch {
        yield put(setUser(null));
      }
    }
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Apple sign in failed'));
  }
}

function* watchSignUp() {
  yield takeLatest(signUpRequest.type, handleSignUp);
}

function* watchSignIn() {
  yield takeLatest(signInRequest.type, handleSignIn);
}

function* watchSignOut() {
  yield takeLatest(signOutRequest.type, handleSignOut);
}

function* watchResetPassword() {
  yield takeLatest(resetPasswordRequest.type, handleResetPassword);
}

function* watchSignInWithGoogle() {
  yield takeLatest(signInWithGoogleRequest.type, handleSignInWithGoogle);
}

function* watchSignInWithApple() {
  yield takeLatest(signInWithAppleRequest.type, handleSignInWithApple);
}

function* handleUpdateProfile(
  action: ReturnType<typeof updateProfileRequest>,
): Generator<any, void, any> {
  try {
    const userId = yield select((s: RootState) => s.auth.user?.id);
    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }
    const updated = yield call(updateProfile, userId, action.payload.updates);
    yield put(setUser(updated));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to update profile'));
  }
}

function* handleChangePassword(
  action: ReturnType<typeof changePasswordRequest>,
): Generator<any, void, any> {
  try {
    yield call(changePassword, action.payload.newPassword);
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to change password'));
  }
}

function* watchUpdateProfile() {
  yield takeLatest(updateProfileRequest.type, handleUpdateProfile);
}

function* watchChangePassword() {
  yield takeLatest(changePasswordRequest.type, handleChangePassword);
}

export function* authSaga() {
  yield all([
    fork(watchSignUp),
    fork(watchSignIn),
    fork(watchSignOut),
    fork(watchResetPassword),
    fork(watchSignInWithGoogle),
    fork(watchSignInWithApple),
    fork(watchUpdateProfile),
    fork(watchChangePassword),
  ]);
}

export default authSlice.reducer;
