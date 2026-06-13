import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../store';
import {
  signInRequest,
  signUpRequest,
  signOutRequest,
  resetPasswordRequest,
  signInWithGoogleRequest,
  signInWithAppleRequest,
  setUser,
  setSession,
} from '../store/slices/authSlice';
import {getAuthToken, clearAuth} from '../utils/mmkv';
import {supabase} from '../config/supabase';
import type {Profile} from '../types/database';
import {isE2EMode} from '../e2e/fakeBackend';

export function useAuth() {
  const dispatch = useAppDispatch();
  const {user, session, loading, error} = useAppSelector(state => state.auth);

  const signIn = useCallback(
    (email: string, password: string) => {
      dispatch(signInRequest({email, password}));
    },
    [dispatch],
  );

  const signUp = useCallback(
    (
      email: string,
      password: string,
      fullName: string,
      role: 'tenant' | 'landlord',
    ) => {
      dispatch(signUpRequest({email, password, fullName, role}));
    },
    [dispatch],
  );

  const signOut = useCallback(() => {
    dispatch(signOutRequest());
  }, [dispatch]);

  const resetPassword = useCallback(
    (email: string) => {
      dispatch(resetPasswordRequest({email}));
    },
    [dispatch],
  );

  const signInWithGoogle = useCallback(
    (idToken: string, accessToken: string) => {
      dispatch(signInWithGoogleRequest({idToken, accessToken}));
    },
    [dispatch],
  );

  const signInWithApple = useCallback(
    (idToken: string, fullName?: any) => {
      dispatch(signInWithAppleRequest({idToken, fullName}));
    },
    [dispatch],
  );

  const checkSession = useCallback(async () => {
    if (isE2EMode) {
      clearAuth();
      return false;
    }

    const token = getAuthToken();
    if (!token) {
      return false;
    }
    try {
      const {data} = await supabase.auth.getSession();
      if (data.session) {
        dispatch(setSession(data.session));
        const {data: profile} = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        if (profile) {
          dispatch(setUser(profile as Profile));
        } else {
          dispatch(setUser(null));
          return 'needs_profile';
        }
        return true;
      }
    } catch {
      clearAuth();
    }
    return false;
  }, [dispatch]);

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
    signInWithApple,
    checkSession,
    isAuthenticated: !!session,
    isLandlord: user?.role === 'landlord',
    isTenant: user?.role === 'tenant',
  };
}
