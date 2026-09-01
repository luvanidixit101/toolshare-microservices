// Shared domain types for ToolShare

export type ToolCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
export type ToolStatus = 'ACTIVE' | 'INACTIVE';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'TEST_SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  memberSince: string;
  role?: 'USER' | 'ADMIN';
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  role?: 'USER' | 'ADMIN';
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  condition: ToolCondition;
  pricePerDay: number;
  securityDeposit: number;
  location: string;
  available: boolean;
  status: ToolStatus;
  specifications: Record<string, string>;
  images: string[];
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  ownerRating: number;
  rating: number;
  reviewCount: number;
  views: number;
  createdAt: string;
}

export interface Review {
  id: string;
  toolId?: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  toolId: string;
  toolName: string;
  toolImage?: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  renterId: string;
  renterName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  payerId: string;
  ownerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transactionRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentPayload {
  bookingId: string;
  amount: number;
  currency: string;
}

export type PaymentMethodType = 'CARD' | 'UPI' | 'NET_BANKING' | 'WALLET' | 'CASH_ON_PICKUP' | 'RAZORPAY';

export interface ToolFormState {
  name: string;
  category: string;
  description: string;
  condition: ToolCondition;
  pricePerDay: number;
  securityDeposit: number;
  location: string;
  available: boolean;
  specifications: { key: string; value: string }[];
  images: string[];
}

export interface CheckoutDetails {
  startDate: string;
  endDate: string;
  fulfillmentType: 'PICKUP' | 'DELIVERY';
  contactPhone: string;
  deliveryAddress?: string;
  notes?: string;
  paymentMethod: PaymentMethodType;
  // Card details
  cardNumber?: string;
  cardHolderName?: string;
  cardExpiry?: string;
  cardCvv?: string;
  // UPI details
  upiId?: string;
  // Bank details
  selectedBank?: string;
  // Wallet details
  selectedWallet?: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  online: boolean;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: string;
  mine: boolean;
}

export interface Notification {
  id: string;
  type: 'booking' | 'message' | 'review' | 'system';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface ToolFilters {
  search?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availableOnly?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';
  page?: number;
  size?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}
