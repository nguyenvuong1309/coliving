import {supabase} from '../config/supabase';
import type {ProfileInsert, ProfileUpdate} from '../types/database';

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: 'tenant' | 'landlord',
) {
  const {data: authData, error: authError} = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error('Sign up failed: no user returned');
  }

  const profile: ProfileInsert = {
    id: authData.user.id,
    full_name: fullName,
    role,
  };

  const {error: profileError} = await supabase
    .from('profiles')
    .insert(profile);

  if (profileError) {
    throw profileError;
  }

  return authData;
}

export async function signIn(email: string, password: string) {
  const {data, error} = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const {error} = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function resetPassword(email: string) {
  const {data, error} = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    throw error;
  }
  return data;
}

export async function getSession() {
  const {data, error} = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
}

export async function getProfile(userId: string) {
  const {data, error} = await supabase
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
  const {data, error} = await supabase
    .from('profiles')
    .update({...updates, updated_at: new Date().toISOString()})
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
  const {data, error} = await supabase.auth.signInWithIdToken({
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
  fullName?: {givenName?: string; familyName?: string},
) {
  const {data, error} = await supabase.auth.signInWithIdToken({
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
