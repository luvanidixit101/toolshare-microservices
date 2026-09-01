import api, { getStoredUser } from './api';
import {
  mockGetTools,
  mockGetToolById,
  mockGetMyTools,
  mockGetReviews,
} from './mockData';
import {
  mapTool,
  mapPagedTools,
  mapReview,
  toToolQueryParams,
  unwrapData,
} from './mappers';
import type { Tool, ToolFilters, PaginatedResult, Review } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function getTools(filters: ToolFilters): Promise<PaginatedResult<Tool>> {
  if (USE_MOCK) return mockGetTools(filters);
  const { data } = await api.get('/tools', { params: toToolQueryParams(filters) });
  if (Array.isArray(data)) {
    return { items: data.map(mapTool), total: data.length, page: 1, size: data.length, totalPages: 1 };
  }
  return mapPagedTools(data as Record<string, unknown>);
}

export async function getToolById(id: string): Promise<Tool> {
  if (USE_MOCK) {
    const t = await mockGetToolById(id);
    if (!t) throw { status: 404, message: 'Tool not found' };
    return t;
  }
  const { data } = await api.get(`/tools/${id}`);
  return mapTool(unwrapData<Record<string, unknown>>(data));
}

export async function createTool(
  payload: Omit<Tool, 'id' | 'createdAt' | 'ownerId' | 'ownerName' | 'ownerRating' | 'rating' | 'reviewCount' | 'views' | 'status'>
): Promise<Tool> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return {
      ...payload,
      id: 't-' + Date.now(),
      createdAt: new Date().toISOString().slice(0, 10),
      ownerId: 'u1',
      ownerName: 'Alex Morgan',
      ownerRating: 4.8,
      rating: 0,
      reviewCount: 0,
      views: 0,
      status: 'ACTIVE',
    } as Tool;
  }
  const { data } = await api.post('/tools', payload);
  return mapTool(unwrapData<Record<string, unknown>>(data));
}

export async function updateTool(id: string, payload: Partial<Tool>): Promise<Tool> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return { ...(await mockGetToolById(id)), ...payload } as Tool;
  }
  const body = { ...payload };
  delete (body as Record<string, unknown>).status;
  const { data } = await api.put(`/tools/${id}`, body);
  return mapTool(unwrapData<Record<string, unknown>>(data));
}

export async function deleteTool(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return;
  }
  await api.delete(`/tools/${id}`);
}

export async function getMyTools(): Promise<Tool[]> {
  if (USE_MOCK) return mockGetMyTools();
  const { data } = await api.get('/tools/my');
  const body = unwrapData<Record<string, unknown>[] | { items?: Record<string, unknown>[] }>(data);
  const items = Array.isArray(body) ? body : body.items ?? [];
  return items.map(mapTool);
}

export async function getReviews(toolId: string): Promise<Review[]> {
  if (USE_MOCK) return mockGetReviews(toolId);
  const { data } = await api.get(`/tools/${toolId}/reviews`);
  const body = unwrapData<Record<string, unknown>[]>(data);
  return (Array.isArray(body) ? body : []).map(mapReview);
}

export async function addReview(toolId: string, rating: number, comment: string): Promise<Review> {
  if (USE_MOCK) {
    const user = getStoredUser();
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      toolId,
      authorName: user ? `${user.firstName} ${user.lastName}` : 'Guest User',
      authorAvatar: `https://i.pravatar.cc/100?u=${user?.id || 'guest'}`,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    return newRev;
  }
  const { data } = await api.post(`/tools/${toolId}/reviews`, { rating, comment });
  const body = unwrapData<Record<string, unknown>>(data);
  return mapReview(body);
}

export async function getCategories(): Promise<string[]> {
  if (USE_MOCK) {
    const { CATEGORIES } = await import('./mockData');
    return CATEGORIES;
  }
  const { data } = await api.get('/tools/categories');
  return unwrapData<string[]>(data) ?? [];
}

export default { getTools, getToolById, createTool, updateTool, deleteTool, getMyTools, getReviews, addReview, getCategories };
