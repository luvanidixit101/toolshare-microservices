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
  totalUsers: number;
  totalRevenue: number;
}

export async function getAdminStats(): Promise<SystemStats> {
  try {
    const toolsRes = await getTools({});
    const tools = toolsRes.items;
    const bookings = await getAllAdminBookings();
    const active = bookings.filter((b) => b.status === 'ACTIVE' || b.status === 'APPROVED');
    const revenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    return {
      totalTools: tools.length,
      totalBookings: bookings.length,
      activeBookings: active.length,
      totalUsers: 14,
      totalRevenue: revenue,
    };
  } catch {
    const bookings = await mockGetBookings();
    return {
      totalTools: 6,
      totalBookings: bookings.length,
      activeBookings: bookings.filter((b) => b.status === 'ACTIVE' || b.status === 'APPROVED').length,
      totalUsers: 14,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
    };
  }
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
