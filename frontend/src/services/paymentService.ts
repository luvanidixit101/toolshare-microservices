import api from './api';
import { mapPayment, unwrapData } from './mappers';
import type { Payment, CreatePaymentPayload } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function createPayment(payload: CreatePaymentPayload): Promise<Payment> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return {
      id: 'PAY-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      bookingId: payload.bookingId,
      payerId: 'u1',
      ownerId: 'u2',
      amount: payload.amount,
      currency: payload.currency || 'INR',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const { data } = await api.post('/payments/create', payload);
  return mapPayment(unwrapData<Record<string, unknown>>(data));
}

export async function confirmMockPayment(paymentId: string): Promise<Payment> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return {
      id: paymentId,
      bookingId: 'BK-' + Math.floor(Math.random() * 9000 + 1000),
      payerId: 'u1',
      ownerId: 'u2',
      amount: 1500,
      currency: 'INR',
      status: 'TEST_SUCCESS',
      transactionRef: 'MOCK_TXN_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const { data } = await api.patch(`/payments/${paymentId}/mock-success`);
  return mapPayment(unwrapData<Record<string, unknown>>(data));
}

export async function getPaymentById(paymentId: string): Promise<Payment> {
  if (USE_MOCK) {
    return {
      id: paymentId,
      bookingId: 'BK-1001',
      payerId: 'u1',
      ownerId: 'u2',
      amount: 1500,
      currency: 'INR',
      status: 'TEST_SUCCESS',
      transactionRef: 'MOCK_TXN_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const { data } = await api.get(`/payments/${paymentId}`);
  return mapPayment(unwrapData<Record<string, unknown>>(data));
}

export async function getMyPayments(): Promise<Payment[]> {
  if (USE_MOCK) return [];
  const { data } = await api.get('/payments');
  const body = unwrapData<Record<string, unknown>[]>(data);
  return (Array.isArray(body) ? body : []).map(mapPayment);
}

export default { createPayment, confirmMockPayment, getPaymentById, getMyPayments };
