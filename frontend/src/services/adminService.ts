import api from './api';
import { getTools } from './toolService';
import { mockGetBookings } from './mockData';
import { mapBooking, unwrapData } from './mappers';
import type { Tool, Booking } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export interface SystemStats {
  totalTools: number;
  totalBookings: number;
  activeBookings: number;
  totalUsers: number | null;
  totalRevenue: number | null;
}

export async function getAdminStats(): Promise<SystemStats> {
    const toolsRes = await getTools({});
    const bookings = await getAllAdminBookings();
    const active = bookings.filter((b) => b.status === 'ACTIVE' || b.status === 'APPROVED');
    return {
      totalTools: toolsRes.total,
      totalBookings: bookings.length,
      activeBookings: active.length,
      totalUsers: null,
      totalRevenue: null,
    };
}

export async function getAllAdminTools(): Promise<Tool[]> {
  const paged = await getTools({});
  return paged.items;
}

export async function getAllAdminBookings(): Promise<Booking[]> {
  if (USE_MOCK) return mockGetBookings();
  const { data } = await api.get('/bookings');
  const body = unwrapData<Record<string, unknown>[]>(data);
  return (Array.isArray(body) ? body : []).map(mapBooking);
}

export default { getAdminStats, getAllAdminTools, getAllAdminBookings };
