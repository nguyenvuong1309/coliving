import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({
  id: 'coliving-storage',
});

// ── Auth-specific helpers ────────────────────────────────────────────

const AUTH_TOKEN_KEY = 'auth_token';
const USER_ROLE_KEY = 'user_role';
const APARTMENT_ID_KEY = 'apartment_id';

export function setAuthToken(token: string): void {
  storage.set(AUTH_TOKEN_KEY, token);
}

export function getAuthToken(): string | undefined {
  return storage.getString(AUTH_TOKEN_KEY);
}

export function setUserRole(role: 'tenant' | 'landlord'): void {
  storage.set(USER_ROLE_KEY, role);
}

export function getUserRole(): 'tenant' | 'landlord' | undefined {
  const role = storage.getString(USER_ROLE_KEY);
  if (role === 'tenant' || role === 'landlord') {
    return role;
  }
  return undefined;
}

export function clearAuth(): void {
  storage.remove(AUTH_TOKEN_KEY);
  storage.remove(USER_ROLE_KEY);
  storage.remove(APARTMENT_ID_KEY);
}
