import type {
  Tool,
  Booking,
  Conversation,
  ChatMessage,
  Review,
  User,
  Notification,
  PaginatedResult,
  ToolFilters,
} from '@/types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const CATEGORIES = [
  'Power Tools',
  'Hand Tools',
  'Garden Tools',
  'Construction',
  'Automotive',
  'Cleaning',
  'Electrical',
  'Plumbing',
];

const img = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

const toolImages: Record<string, string[]> = {
  '1': [img(58586), img(58587)],
  '2': [img(84389), img(84390)],
  '3': [img(209276), img(209277)],
  '4': [img(259775), img(259776)],
  '5': [img(409935), img(409936)],
  '6': [img(1072965), img(1072966)],
  '7': [img(259015), img(259016)],
  '8': [img(279735), img(279736)],
};

export const mockUser: User = {
  id: 'u1',
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'alex.morgan@example.com',
  phone: '+1 (555) 123-4567',
  location: 'Portland, OR',
  bio: 'DIY enthusiast and weekend woodworker. Happy to share my tools with the community.',
  avatarUrl: 'https://i.pravatar.cc/150?img=12',
  rating: 4.8,
  reviewCount: 27,
  memberSince: '2024-01-15',
};

export const mockTools: Tool[] = [
  {
    id: '1',
    name: 'DeWalt 20V MAX Cordless Drill',
    category: 'Power Tools',
    description: 'Powerful cordless drill with two batteries and charger. Perfect for home projects and light construction work. Includes a full set of bits.',
    condition: 'LIKE_NEW',
    pricePerDay: 25,
    securityDeposit: 80,
    location: 'Portland, OR',
    available: true,
    status: 'ACTIVE',
    specifications: { Voltage: '20V MAX', 'Battery type': 'Lithium-ion', 'Chuck size': '1/2"', 'Includes': '2 batteries, charger, bit set' },
    images: toolImages['1'],
    ownerId: 'u2',
    ownerName: 'Sam Rivera',
    ownerRating: 4.9,
    rating: 4.7,
    reviewCount: 12,
    views: 340,
    createdAt: '2024-09-01',
  },
  {
    id: '2',
    name: 'Makita Circular Saw 7-1/4"',
    category: 'Power Tools',
    description: 'Smooth-cutting circular saw with laser guide. Great for plywood, framing, and deck building.',
    condition: 'GOOD',
    pricePerDay: 30,
    securityDeposit: 100,
    location: 'Seattle, WA',
    available: true,
    status: 'ACTIVE',
    specifications: { 'Blade size': '7-1/4"', 'Motor': '15A', 'RPM': '5800', Weight: '8.6 lbs' },
    images: toolImages['2'],
    ownerId: 'u3',
    ownerName: 'Jordan Lee',
    ownerRating: 4.6,
    rating: 4.5,
    reviewCount: 8,
    views: 210,
    createdAt: '2024-09-10',
  },
  {
    id: '3',
    name: 'Stihl MS 170 Chainsaw',
    category: 'Garden Tools',
    description: 'Lightweight gas chainsaw ideal for cutting firewood and trimming branches. Recently serviced.',
    condition: 'GOOD',
    pricePerDay: 35,
    securityDeposit: 120,
    location: 'Eugene, OR',
    available: true,
    status: 'ACTIVE',
    specifications: { 'Engine power': '1.7 kW', 'Bar length': '16"', Weight: '8.8 lbs', 'Fuel type': 'Gasoline' },
    images: toolImages['3'],
    ownerId: 'u4',
    ownerName: 'Casey Kim',
    ownerRating: 4.7,
    rating: 4.6,
    reviewCount: 5,
    views: 180,
    createdAt: '2024-08-20',
  },
  {
    id: '4',
    name: 'Bosch Laser Distance Measure',
    category: 'Electrical',
    description: 'Precise laser distance measure with Bluetooth. Measures up to 120 ft with accuracy of 1/16".',
    condition: 'LIKE_NEW',
    pricePerDay: 15,
    securityDeposit: 50,
    location: 'Portland, OR',
    available: false,
    status: 'ACTIVE',
    specifications: { Range: '120 ft', Accuracy: '1/16"', Connectivity: 'Bluetooth', Display: 'Backlit LCD' },
    images: toolImages['4'],
    ownerId: 'u2',
    ownerName: 'Sam Rivera',
    ownerRating: 4.9,
    rating: 4.8,
    reviewCount: 15,
    views: 420,
    createdAt: '2024-09-15',
  },
  {
    id: '5',
    name: 'Honda Pressure Washer',
    category: 'Cleaning',
    description: 'Commercial-grade pressure washer. Great for driveways, decks, and siding. 3100 PSI.',
    condition: 'GOOD',
    pricePerDay: 45,
    securityDeposit: 150,
    location: 'Beaverton, OR',
    available: true,
    status: 'ACTIVE',
    specifications: { PSI: '3100', 'Flow rate': '2.4 GPM', 'Engine': 'Honda GC190', Weight: '65 lbs' },
    images: toolImages['5'],
    ownerId: 'u5',
    ownerName: 'Taylor Brooks',
    ownerRating: 4.5,
    rating: 4.4,
    reviewCount: 9,
    views: 290,
    createdAt: '2024-07-28',
  },
  {
    id: '6',
    name: 'Stanley FatMax Tool Set (200 pc)',
    category: 'Hand Tools',
    description: 'Comprehensive 200-piece mechanic tool set with ratchets, sockets, and wrenches in a sturdy case.',
    condition: 'NEW',
    pricePerDay: 20,
    securityDeposit: 90,
    location: 'Seattle, WA',
    available: true,
    status: 'ACTIVE',
    specifications: { Pieces: '200', Case: 'Hard shell', Material: 'Chrome vanadium', 'Includes': 'Sockets, wrenches, ratchets' },
    images: toolImages['6'],
    ownerId: 'u3',
    ownerName: 'Jordan Lee',
    ownerRating: 4.6,
    rating: 4.9,
    reviewCount: 22,
    views: 510,
    createdAt: '2024-09-20',
  },
  {
    id: '7',
    name: 'Milwaukee M18 FUEL Impact Wrench',
    category: 'Automotive',
    description: 'High-torque cordless impact wrench for lug nuts and heavy bolts. Includes battery and charger.',
    condition: 'LIKE_NEW',
    pricePerDay: 28,
    securityDeposit: 100,
    location: 'Portland, OR',
    available: true,
    status: 'ACTIVE',
    specifications: { Torque: '1400 ft-lbs', 'Battery': 'M18 XC 5.0', 'Drive size': '1/2"', 'Voltage': '18V' },
    images: toolImages['7'],
    ownerId: 'u6',
    ownerName: 'Morgan Patel',
    ownerRating: 4.8,
    rating: 4.7,
    reviewCount: 11,
    views: 240,
    createdAt: '2024-08-05',
  },
  {
    id: '8',
    name: 'RIDGID Wet/Dry Shop Vacuum',
    category: 'Cleaning',
    description: '12-gallon stainless steel wet/dry vac. Powerful motor handles both liquid and dry messes.',
    condition: 'GOOD',
    pricePerDay: 12,
    securityDeposit: 40,
    location: 'Gresham, OR',
    available: true,
    status: 'ACTIVE',
    specifications: { Capacity: '12 gallon', 'Peak HP': '5', 'Hose diameter': '2-1/2"', 'Tank material': 'Stainless steel' },
    images: toolImages['8'],
    ownerId: 'u7',
    ownerName: 'Riley Quinn',
    ownerRating: 4.3,
    rating: 4.2,
    reviewCount: 6,
    views: 150,
    createdAt: '2024-09-25',
  },
];

export const mockReviews: Review[] = [
  { id: 'r1', toolId: '1', authorName: 'Jamie Chen', authorAvatar: 'https://i.pravatar.cc/100?img=5', rating: 5, comment: 'Drill worked great, batteries lasted all day. Sam was very accommodating!', createdAt: '2024-09-20' },
  { id: 'r2', toolId: '1', authorName: 'Dev Wright', authorAvatar: 'https://i.pravatar.cc/100?img=8', rating: 4, comment: 'Solid drill, picked up easily. Would rent again.', createdAt: '2024-09-18' },
  { id: 'r3', toolId: '1', authorName: 'Pat Lee', authorAvatar: 'https://i.pravatar.cc/100?img=15', rating: 5, comment: 'Exactly as described. Great experience overall.', createdAt: '2024-09-12' },
];

export const mockBookings: Booking[] = [
  {
    id: 'BK-001',
    toolId: '1',
    toolName: 'DeWalt 20V MAX Cordless Drill',
    toolImage: toolImages['1'][0],
    ownerId: 'u2',
    ownerName: 'Sam Rivera',
    renterId: 'u1',
    renterName: 'Alex Morgan',
    startDate: '2024-10-15',
    endDate: '2024-10-18',
    totalPrice: 75,
    status: 'ACTIVE',
    createdAt: '2024-10-10',
  },
  {
    id: 'BK-002',
    toolId: '6',
    toolName: 'Stanley FatMax Tool Set (200 pc)',
    toolImage: toolImages['6'][0],
    ownerId: 'u3',
    ownerName: 'Jordan Lee',
    renterId: 'u1',
    renterName: 'Alex Morgan',
    startDate: '2024-10-20',
    endDate: '2024-10-22',
    totalPrice: 40,
    status: 'PENDING',
    createdAt: '2024-10-12',
  },
  {
    id: 'BK-003',
    toolId: '3',
    toolName: 'Stihl MS 170 Chainsaw',
    toolImage: toolImages['3'][0],
    ownerId: 'u4',
    ownerName: 'Casey Kim',
    renterId: 'u1',
    renterName: 'Alex Morgan',
    startDate: '2024-09-28',
    endDate: '2024-09-30',
    totalPrice: 70,
    status: 'COMPLETED',
    createdAt: '2024-09-25',
  },
  {
    id: 'BK-004',
    toolId: '5',
    toolName: 'Honda Pressure Washer',
    toolImage: toolImages['5'][0],
    ownerId: 'u5',
    ownerName: 'Taylor Brooks',
    renterId: 'u1',
    renterName: 'Alex Morgan',
    startDate: '2024-09-10',
    endDate: '2024-09-11',
    totalPrice: 45,
    status: 'CANCELLED',
    createdAt: '2024-09-05',
  },
];

export const mockConversations: Conversation[] = [
  { id: 'c1', participantId: 'u2', participantName: 'Sam Rivera', participantAvatar: 'https://i.pravatar.cc/100?img=13', online: true, lastMessage: 'Sure, you can pick it up at 9am!', lastMessageAt: '2024-10-12T10:30:00', unreadCount: 2 },
  { id: 'c2', participantId: 'u3', participantName: 'Jordan Lee', participantAvatar: 'https://i.pravatar.cc/100?img=14', online: false, lastMessage: 'Thanks for returning the tools on time.', lastMessageAt: '2024-10-11T16:00:00', unreadCount: 0 },
  { id: 'c3', participantId: 'u4', participantName: 'Casey Kim', participantAvatar: 'https://i.pravatar.cc/100?img=20', online: true, lastMessage: 'Is the chainsaw still available next weekend?', lastMessageAt: '2024-10-10T08:15:00', unreadCount: 1 },
];

export const mockMessages: Record<string, ChatMessage[]> = {
  c1: [
    { id: 'm1', conversationId: 'c1', senderId: 'u2', text: 'Hi Alex! I saw your booking request for the drill.', sentAt: '2024-10-12T10:00:00', mine: false },
    { id: 'm2', conversationId: 'c1', senderId: 'u1', text: 'Hi Sam! Yes, is it available from the 15th to the 18th?', sentAt: '2024-10-12T10:05:00', mine: true },
    { id: 'm3', conversationId: 'c1', senderId: 'u2', text: 'Absolutely. What time would you like to pick it up?', sentAt: '2024-10-12T10:10:00', mine: false },
    { id: 'm4', conversationId: 'c1', senderId: 'u1', text: 'Would 9am work for you?', sentAt: '2024-10-12T10:20:00', mine: true },
    { id: 'm5', conversationId: 'c1', senderId: 'u2', text: 'Sure, you can pick it up at 9am!', sentAt: '2024-10-12T10:30:00', mine: false },
  ],
  c2: [
    { id: 'm6', conversationId: 'c2', senderId: 'u3', text: 'Thanks for returning the tools on time.', sentAt: '2024-10-11T16:00:00', mine: false },
  ],
  c3: [
    { id: 'm7', conversationId: 'c3', senderId: 'u4', text: 'Is the chainsaw still available next weekend?', sentAt: '2024-10-10T08:15:00', mine: false },
  ],
};

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'booking', title: 'Booking Approved', body: 'Your booking for DeWalt Cordless Drill was approved.', read: false, createdAt: '2024-10-12T11:00:00' },
  { id: 'n3', type: 'review', title: 'New Review', body: 'Someone reviewed your tool listing.', read: true, createdAt: '2024-10-09T14:00:00' },
];

// --- Mock API helpers ---

export async function mockGetTools(filters: ToolFilters): Promise<PaginatedResult<Tool>> {
  await delay(400);
  let items = [...mockTools];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }
  if (filters.category && filters.category !== 'All') {
    items = items.filter((t) => t.category === filters.category);
  }
  if (filters.location) {
    items = items.filter((t) => t.location.toLowerCase().includes(filters.location!.toLowerCase()));
  }
  if (filters.minPrice != null) items = items.filter((t) => t.pricePerDay >= filters.minPrice!);
  if (filters.maxPrice != null) items = items.filter((t) => t.pricePerDay <= filters.maxPrice!);
  if (filters.minRating != null) items = items.filter((t) => t.rating >= filters.minRating!);
  if (filters.availableOnly) items = items.filter((t) => t.available);

  switch (filters.sort) {
    case 'price_asc': items.sort((a, b) => a.pricePerDay - b.pricePerDay); break;
    case 'price_desc': items.sort((a, b) => b.pricePerDay - a.pricePerDay); break;
    case 'rating_desc': items.sort((a, b) => b.rating - a.rating); break;
    case 'newest': items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
  }

  const page = filters.page || 1;
  const size = filters.size || 9;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const start = (page - 1) * size;
  items = items.slice(start, start + size);

  return { items, total, page, size, totalPages };
}

export async function mockGetToolById(id: string): Promise<Tool | null> {
  await delay(300);
  return mockTools.find((t) => t.id === id) ?? null;
}

export async function mockGetMyTools(): Promise<Tool[]> {
  await delay(300);
  return mockTools.filter((t) => t.ownerId === 'u1');
}

export async function mockGetBookings(): Promise<Booking[]> {
  await delay(400);
  return [...mockBookings];
}

export async function mockGetReviews(toolId: string): Promise<Review[]> {
  await delay(300);
  return mockReviews.filter((r) => r.toolId === toolId);
}

export async function mockGetConversations(): Promise<Conversation[]> {
  await delay(300);
  return [...mockConversations];
}

export async function mockGetMessages(conversationId: string): Promise<ChatMessage[]> {
  await delay(300);
  return mockMessages[conversationId] ?? [];
}

export async function mockGetProfile(): Promise<User> {
  await delay(300);
  return { ...mockUser };
}

export async function mockGetNotifications(): Promise<Notification[]> {
  await delay(200);
  return [...mockNotifications];
}
