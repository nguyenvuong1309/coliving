import { supabase } from '../config/supabase';
import Config from 'react-native-config';
import type { ProfileInsert, ProfileUpdate } from '../types/database';
import {e2eBackend, isE2EMode} from '../e2e/fakeBackend';

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: 'tenant' | 'landlord',
) {
  if (isE2EMode) {
    return e2eBackend.signUp(email, password, fullName, role);
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error('Sign up failed: no user returned');
  }

  if (authData.session) {
    const profile: ProfileInsert = {
      id: authData.user.id,
      full_name: fullName,
      role,
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profile, {onConflict: 'id'});

    if (profileError) {
      throw profileError;
    }
  }

  return authData;
}

export async function signIn(email: string, password: string) {
  if (isE2EMode) {
    return e2eBackend.signIn(email, password);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  if (isE2EMode) {
    return e2eBackend.signOut();
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function resetPassword(email: string) {
  if (isE2EMode) {
    return e2eBackend.resetPassword(email);
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      Config.APP_PASSWORD_RESET_REDIRECT_URL ??
      'coliving://auth/reset-password',
  });
  if (error) {
    throw error;
  }
  return data;
}

export async function resendEmailConfirmation(email: string) {
  if (isE2EMode) {
    return e2eBackend.resendEmailConfirmation(email);
  }

  const {data, error} = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function changePassword(newPassword: string) {
  if (isE2EMode) {
    return e2eBackend.changePassword(newPassword);
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) {
    throw error;
  }
  return data;
}

export async function getProfile(userId: string) {
  if (isE2EMode) {
    return e2eBackend.getProfile(userId);
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProfile(userId: string, updates: ProfileUpdate) {
  if (isE2EMode) {
    return e2eBackend.updateProfile(userId, updates);
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// ── OAuth Functions ──────────────────────────────────────────────

export async function signInWithGoogle(idToken: string, accessToken: string) {
  if (isE2EMode) {
    return e2eBackend.signInWithProvider();
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
    access_token: accessToken,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithApple(
  idToken: string,
  fullName?: { givenName?: string; familyName?: string },
) {
  if (isE2EMode) {
    return e2eBackend.signInWithProvider();
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: idToken,
  });

  if (error) {
    throw error;
  }

  // Save full name to user metadata if available
  if (fullName && (fullName.givenName || fullName.familyName)) {
    const nameParts = [];
    if (fullName.givenName) nameParts.push(fullName.givenName);
    if (fullName.familyName) nameParts.push(fullName.familyName);

    const fullNameStr = nameParts.join(' ');

    await supabase.auth.updateUser({
      data: {
        full_name: fullNameStr,
        given_name: fullName.givenName,
        family_name: fullName.familyName,
      },
    });
  }

  return data;
}
