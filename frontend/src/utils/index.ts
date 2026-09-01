import type { ToolCondition, BookingStatus } from '@/types';

export const CURRENCY_SYMBOL = '₹';

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export const conditionLabels: Record<ToolCondition, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
};

export const bookingStatusConfig: Record<
  BookingStatus,
  { label: string; color: string }
> = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-800' },
  APPROVED: { label: 'Approved', color: 'bg-blue-100 text-blue-800' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800' },
  COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

export function classNames(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(' ');
}

export const DEFAULT_TOOL_IMAGES: Record<string, string> = {
  'Hand Tools': 'https://images.pexels.com/photos/209276/pexels-photo-209276.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Power Tools': 'https://images.pexels.com/photos/58586/pexels-photo-58586.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Garden Tools': 'https://images.pexels.com/photos/1072965/pexels-photo-1072965.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Construction': 'https://images.pexels.com/photos/259015/pexels-photo-259015.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Automotive': 'https://images.pexels.com/photos/449935/pexels-photo-449935.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Cleaning': 'https://images.pexels.com/photos/279735/pexels-photo-279735.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Electrical': 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Plumbing': 'https://images.pexels.com/photos/84389/pexels-photo-84389.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Default': 'https://images.pexels.com/photos/209276/pexels-photo-209276.jpeg?auto=compress&cs=tinysrgb&w=800',
};

export const SVG_FALLBACK_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f3f4f6"/><path d="M260 160h80v120h-80z" fill="%23d1d5db"/><circle cx="300" cy="130" r="36" fill="%239ca3af"/><text x="50%" y="82%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="22" fill="%236b7280">Tool Share</text></svg>`;

export function getToolImage(images?: string[], category?: string, index = 0): string {
  if (Array.isArray(images) && images.length > index && images[index]) {
    const url = images[index].trim();
    if (url && !url.startsWith('blob:') && url.length > 5) {
      return url;
    }
  }
  const cat = (category || '').toLowerCase();
  if (cat.includes('hand')) return DEFAULT_TOOL_IMAGES['Hand Tools'];
  if (cat.includes('power')) return DEFAULT_TOOL_IMAGES['Power Tools'];
  if (cat.includes('garden')) return DEFAULT_TOOL_IMAGES['Garden Tools'];
  if (cat.includes('construction')) return DEFAULT_TOOL_IMAGES['Construction'];
  if (cat.includes('auto')) return DEFAULT_TOOL_IMAGES['Automotive'];
  if (cat.includes('clean')) return DEFAULT_TOOL_IMAGES['Cleaning'];
  if (cat.includes('electric')) return DEFAULT_TOOL_IMAGES['Electrical'];
  if (cat.includes('plumb')) return DEFAULT_TOOL_IMAGES['Plumbing'];
  return DEFAULT_TOOL_IMAGES['Default'];
}

export function toolToFormState(tool: {
  name: string;
  category: string;
  description: string;
  condition: ToolCondition;
  pricePerDay: number;
  securityDeposit: number;
  location: string;
  available: boolean;
  specifications: Record<string, string>;
  images: string[];
}) {
  return {
    name: tool.name,
    category: tool.category,
    description: tool.description,
    condition: tool.condition,
    pricePerDay: tool.pricePerDay,
    securityDeposit: tool.securityDeposit,
    location: tool.location,
    available: tool.available,
    specifications: Object.entries(tool.specifications || {}).map(([key, value]) => ({ key, value })),
    images: [...(tool.images || [])],
  };
}

export function formStateToToolPayload(form: {
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
}) {
  const specs: Record<string, string> = {};
  (form.specifications || []).forEach((s) => {
    if (s.key.trim()) specs[s.key.trim()] = s.value.trim();
  });
  return {
    name: form.name,
    category: form.category,
    description: form.description,
    condition: form.condition,
    pricePerDay: Number(form.pricePerDay),
    securityDeposit: Number(form.securityDeposit),
    location: form.location,
    available: form.available,
    specifications: specs,
    images: form.images,
  };
}
