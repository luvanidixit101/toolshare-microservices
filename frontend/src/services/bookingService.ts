import api from './api';
import { mockGetBookings } from './mockData';
import { mapBooking, unwrapData } from './mappers';
import type { Booking, BookingStatus } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export interface CreateBookingPayload {
  toolId: string;
  startDate: string;
  endDate: string;
}

export async function getBookings(): Promise<Booking[]> {
  if (USE_MOCK) return mockGetBookings();
  const { data } = await api.get('/bookings');
  const body = unwrapData<Record<string, unknown>[]>(data);
  return (Array.isArray(body) ? body : []).map(mapBooking);
}

export async function getBookingById(id: string): Promise<Booking> {
  if (USE_MOCK) {
    const all = await mockGetBookings();
    const b = all.find((x) => x.id === id);
    if (!b) throw { status: 404, message: 'Booking not found' };
    return b;
  }
  const { data } = await api.get(`/bookings/${id}`);
  return mapBooking(unwrapData<Record<string, unknown>>(data));
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return {
      id: 'BK-' + Math.floor(Math.random() * 9000 + 1000),
      toolId: payload.toolId,
      toolName: 'Tool',
      ownerId: 'u2',
      ownerName: 'Owner',
      renterId: 'u1',
      renterName: 'Alex Morgan',
      startDate: payload.startDate,
      endDate: payload.endDate,
      totalPrice: 0,
      status: 'PENDING',
      createdAt: new Date().toISOString().slice(0, 10),
    };
  }
  const { data } = await api.post('/bookings', payload);
  return mapBooking(unwrapData<Record<string, unknown>>(data));
}

export async function cancelBooking(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return;
  }
  await api.put(`/bookings/${id}/cancel`);
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const all = await mockGetBookings();
    const b = all.find((x) => x.id === id);
    return { ...(b as Booking), status };
  }
  const { data } = await api.put(`/bookings/${id}/status`, { status });
  return mapBooking(unwrapData<Record<string, unknown>>(data));
}

export async function approveBooking(id: string): Promise<Booking> {
  if (USE_MOCK) return updateBookingStatus(id, 'APPROVED');
  const { data } = await api.patch(`/bookings/${id}/approve`);
  return mapBooking(unwrapData<Record<string, unknown>>(data));
}

export async function rejectBooking(id: string): Promise<Booking> {
  if (USE_MOCK) return updateBookingStatus(id, 'REJECTED');
  const { data } = await api.patch(`/bookings/${id}/reject`);
  return mapBooking(unwrapData<Record<string, unknown>>(data));
}

export default { getBookings, getBookingById, createBooking, cancelBooking, updateBookingStatus, approveBooking, rejectBooking };
