import type {
  AuthUser,
  Tool,
  Booking,
  Review,
  User,
  Payment,
  Conversation,
  ChatMessage,
  PaginatedResult,
  ToolFilters,
} from '@/types';

/** Unwrap `{ data: T }` ApiResponse envelopes from the backend. */
export function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as { data?: T }).data;
    if (data !== undefined && data !== null) return data;
  }
  return payload as T;
}

export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

export function toString(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  return String(value);
}

export function toDateString(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value.split('T')[0];
  return String(value);
}

export function mapAuthUser(raw: Record<string, unknown>): AuthUser {
  const roleStr = toString(raw.role).toUpperCase();
  return {
    id: toString(raw.id ?? raw.userId),
    firstName: toString(raw.firstName),
    lastName: toString(raw.lastName),
    email: toString(raw.email),
    token: toString(raw.token ?? raw.accessToken),
    role: (roleStr === 'ADMIN' ? 'ADMIN' : 'USER') as 'USER' | 'ADMIN',
  };
}

import { getToolImage } from '@/utils';

export function mapTool(raw: Record<string, unknown>): Tool {
  const specs = raw.specifications;
  const category = toString(raw.category);
  const rawImages = Array.isArray(raw.images)
    ? (raw.images as string[]).filter((img) => typeof img === 'string' && img.trim().length > 0 && !img.startsWith('blob:'))
    : [];
  const images = rawImages.length > 0 ? rawImages : [getToolImage([], category)];

  return {
    id: toString(raw.id),
    name: toString(raw.name),
    category,
    description: toString(raw.description),
    condition: (raw.condition as Tool['condition']) ?? 'GOOD',
    pricePerDay: toNumber(raw.pricePerDay),
    securityDeposit: toNumber(raw.securityDeposit),
    location: toString(raw.location),
    available: raw.available !== false,
    status: (raw.status as Tool['status']) ?? 'ACTIVE',
    specifications:
      specs && typeof specs === 'object' && !Array.isArray(specs)
        ? (specs as Record<string, string>)
        : {},
    images,
    ownerId: toString(raw.ownerId),
    ownerName: toString(raw.ownerName, 'Unknown'),
    ownerPhone: toString(raw.ownerPhone || raw.phone || raw.ownerContact, '+91 98765 43210'),
    ownerRating: toNumber(raw.ownerRating),
    rating: toNumber(raw.rating),
    reviewCount: toNumber(raw.reviewCount),
    views: toNumber(raw.views),
    createdAt: toDateString(raw.createdAt),
  };
}

export function mapPagedTools(payload: Record<string, unknown>): PaginatedResult<Tool> {
  const rawItems = (payload.items ?? payload.data ?? []) as Record<string, unknown>[];
  const items = rawItems.map(mapTool);
  const backendPage = toNumber(payload.page);
  const size = toNumber(payload.size, items.length || 20);
  const total = toNumber(payload.total ?? payload.totalElements, items.length);
  const totalPages = toNumber(payload.totalPages, Math.max(1, Math.ceil(total / size)));

  return {
    items,
    total,
    page: backendPage + 1,
    size,
    totalPages,
  };
}

export function mapReview(raw: Record<string, unknown>): Review {
  return {
    id: toString(raw.id),
    toolId: raw.toolId ? toString(raw.toolId) : undefined,
    authorName: toString(raw.authorName, 'Anonymous'),
    authorAvatar: raw.authorAvatar ? toString(raw.authorAvatar) : undefined,
    rating: toNumber(raw.rating),
    comment: toString(raw.comment),
    createdAt: toDateString(raw.createdAt),
  };
}

export function mapBooking(raw: Record<string, unknown>): Booking {
  return {
    id: toString(raw.id),
    toolId: toString(raw.toolId),
    toolName: toString(raw.toolName, 'Tool'),
    toolImage: raw.toolImage ? toString(raw.toolImage) : undefined,
    ownerId: toString(raw.ownerId),
    ownerName: toString(raw.ownerName, 'Owner'),
    ownerPhone: toString(raw.ownerPhone || raw.phone || raw.ownerContact, '+91 98765 43210'),
    renterId: toString(raw.renterId),
    renterName: toString(raw.renterName, 'Renter'),
    startDate: toDateString(raw.startDate),
    endDate: toDateString(raw.endDate),
    totalPrice: toNumber(raw.totalPrice),
    status: (raw.status as Booking['status']) ?? 'PENDING',
    createdAt: toDateString(raw.createdAt),
  };
}

export function mapConversation(raw: Record<string, unknown>): Conversation {
  return {
    id: toString(raw.id),
    participantId: toString(raw.participantId),
    participantName: toString(raw.participantName, 'User'),
    participantAvatar: raw.participantAvatar ? toString(raw.participantAvatar) : undefined,
    online: raw.online === true,
    lastMessage: toString(raw.lastMessage),
    lastMessageAt: toString(raw.lastMessageAt),
    unreadCount: toNumber(raw.unreadCount),
  };
}

export function mapMessage(raw: Record<string, unknown>, currentUserId?: string): ChatMessage {
  const senderId = toString(raw.senderId);
  return {
    id: toString(raw.id),
    conversationId: toString(raw.conversationId),
    senderId,
    text: toString(raw.text ?? raw.message),
    sentAt: toString(raw.sentAt ?? raw.createdAt),
    mine: raw.mine === true || (!!currentUserId && senderId === currentUserId),
  };
}

export function mapUserProfile(raw: Record<string, unknown>): User {
  return {
    id: toString(raw.id),
    firstName: toString(raw.firstName),
    lastName: toString(raw.lastName),
    email: toString(raw.email),
    phone: raw.phone ? toString(raw.phone) : undefined,
    location: raw.location ? toString(raw.location) : undefined,
    bio: raw.bio ? toString(raw.bio) : undefined,
    avatarUrl: raw.avatarUrl ? toString(raw.avatarUrl) : undefined,
    rating: toNumber(raw.rating),
    reviewCount: toNumber(raw.reviewCount),
    memberSince: toDateString(raw.memberSince),
  };
}

export function mapPayment(raw: Record<string, unknown>): Payment {
  return {
    id: toString(raw.id),
    bookingId: toString(raw.bookingId),
    payerId: toString(raw.payerId),
    ownerId: toString(raw.ownerId),
    amount: toNumber(raw.amount),
    currency: toString(raw.currency, 'INR'),
    status: (raw.status as Payment['status']) ?? 'PENDING',
    transactionRef: raw.transactionRef ? toString(raw.transactionRef) : undefined,
    createdAt: toDateString(raw.createdAt),
    updatedAt: toDateString(raw.updatedAt),
  };
}

/** Convert frontend filter params to backend query params (0-based page). */
export function toToolQueryParams(filters: ToolFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  if (filters.search) params.search = filters.search;
  if (filters.category && filters.category !== 'All') params.category = filters.category;
  if (filters.location) params.location = filters.location;
  if (filters.minPrice != null) params.minPrice = filters.minPrice;
  if (filters.maxPrice != null) params.maxPrice = filters.maxPrice;
  if (filters.minRating != null) params.minRating = filters.minRating;
  if (filters.availableOnly != null) {
    params.availableOnly = filters.availableOnly;
    params.available = filters.availableOnly;
  }
  if (filters.sort) params.sort = filters.sort;
  params.page = Math.max(0, (filters.page ?? 1) - 1);
  params.size = filters.size ?? 9;

  return params;
}
