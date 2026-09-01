import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { AuthUser } from '@/types';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

const TOKEN_KEY = 'toolshare_token';
const USER_KEY = 'toolshare_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function storeAuth(user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, user.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Request interceptor: attach JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: global error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string> }>) => {
    const status = error.response?.status;
    const body = error.response?.data;
    let message = body?.message;
    if (body?.errors && Object.keys(body.errors).length > 0) {
      message = Object.values(body.errors).join('. ');
    }

    if (status === 401) {
      const currentToken = getStoredToken();
      if (currentToken && !currentToken.startsWith('mock-jwt-token-')) {
        clearAuth();
        if (!window.location.pathname.startsWith('/auth/login')) {
          window.location.href = '/auth/login?session=expired';
        }
      }
    }

    // Normalize the error shape for consumers
    const friendly = mapErrorToMessage(status, message, error.message);
    return Promise.reject({ status, message: friendly, raw: error });
  }
);

export function mapErrorToMessage(
  status: number | undefined,
  backendMessage: string | undefined,
  fallback: string
): string {
  if (!status) return 'Network error — please check your connection and try again.';
  switch (status) {
    case 400:
      return backendMessage || 'The request was invalid. Please check your input.';
    case 401:
      return backendMessage || (window.location.pathname.startsWith('/auth/login') ? 'Invalid login ID or password.' : 'Your session has expired. Please log in again.');
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The resource you are looking for was not found.';
    case 409:
      return backendMessage || 'This action conflicts with existing data.';
    case 422:
      return backendMessage || 'The submitted data could not be processed.';
    case 500:
      return 'Something went wrong on our end. Please try again later.';
    default:
      return backendMessage || fallback || 'An unexpected error occurred.';
  }
}

export default api;
