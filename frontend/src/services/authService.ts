import api, { storeAuth, clearAuth, getStoredUser } from './api';
import { mockUser } from './mockData';
import { mapAuthUser, unwrapData } from './mappers';
import type { AuthUser } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    const isAdmin = payload.email.toLowerCase().includes('admin') || payload.email.toLowerCase() === 'dixit@gmail.com';
    const user: AuthUser = {
      id: isAdmin ? 'admin-001' : mockUser.id,
      firstName: isAdmin ? 'Dixit' : mockUser.firstName,
      lastName: isAdmin ? 'Luvani' : mockUser.lastName,
      email: payload.email || (isAdmin ? 'dixit@gmail.com' : mockUser.email),
      token: 'mock-jwt-token-' + Date.now(),
      role: isAdmin ? 'ADMIN' : 'USER',
    };
    storeAuth(user);
    return user;
  }
  const { data } = await api.post('/auth/login', payload);
  const auth = unwrapData<Record<string, unknown>>(data);
  const user = mapAuthUser(auth);
  storeAuth(user);
  return user;
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 700));
    const user: AuthUser = {
      id: 'u-' + Date.now(),
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      token: 'mock-jwt-token-' + Date.now(),
    };
    storeAuth(user);
    return user;
  }
  const { data } = await api.post('/auth/register', payload);
  const auth = unwrapData<Record<string, unknown>>(data);
  const user = mapAuthUser(auth);
  storeAuth(user);
  return user;
}

export async function logout(): Promise<void> {
  if (USE_MOCK) {
    clearAuth();
    return;
  }
  try {
    await api.post('/auth/logout');
  } finally {
    clearAuth();
  }
}

export async function googleLogin(idToken: string): Promise<AuthUser> {
  if (USE_MOCK || idToken.startsWith('mock_google_')) {
    await new Promise((r) => setTimeout(r, 600));
    const user: AuthUser = {
      id: 'g-user-' + Date.now(),
      firstName: 'Google',
      lastName: 'User',
      email: idToken.startsWith('mock_google_')
        ? `${idToken.replace('mock_google_', '')}@gmail.com`
        : 'google.user@example.com',
      token: 'mock-google-jwt-token-' + Date.now(),
      role: 'USER',
    };
    storeAuth(user);
    return user;
  }
  const { data } = await api.post('/auth/google', { idToken });
  const auth = unwrapData<Record<string, unknown>>(data);
  const user = mapAuthUser(auth);
  storeAuth(user);
  return user;
}

export function getCurrentUser(): AuthUser | null {
  return getStoredUser();
}

export async function forgotPassword(email: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return;
  }
  await api.post('/auth/forgot-password', { email });
}

export default { login, register, googleLogin, logout, getCurrentUser, forgotPassword };
