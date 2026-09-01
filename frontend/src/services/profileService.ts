import api from './api';
import { mockGetProfile } from './mockData';
import { mapUserProfile, unwrapData } from './mappers';
import type { User } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function getProfile(): Promise<User> {
  if (USE_MOCK) return mockGetProfile();
  const { data } = await api.get('/profile');
  return mapUserProfile(unwrapData<Record<string, unknown>>(data));
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return { ...(await mockGetProfile()), ...payload };
  }
  const { data } = await api.put('/profile', payload);
  return mapUserProfile(unwrapData<Record<string, unknown>>(data));
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return;
  }
  await api.put('/profile/password', payload);
}

export async function deleteAccount(): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return;
  }
  await api.delete('/profile');
}

export default { getProfile, updateProfile, changePassword, deleteAccount };
