import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const CUISINE_TYPES = [
  { value: 'PIZZA', label: 'Pizza', emoji: '🍕' },
  { value: 'BURGER', label: 'Burger', emoji: '🍔' },
  { value: 'BIRYANI', label: 'Biryani', emoji: '🍛' },
  { value: 'CHINESE', label: 'Chinese', emoji: '🥡' },
  { value: 'NORTH_INDIAN', label: 'North Indian', emoji: '🍲' },
  { value: 'SOUTH_INDIAN', label: 'South Indian', emoji: '🥘' },
  { value: 'DESSERTS', label: 'Desserts', emoji: '🍰' },
  { value: 'ITALIAN', label: 'Italian', emoji: '🍝' },
  { value: 'STREET_FOOD', label: 'Street Food', emoji: '🌮' },
  { value: 'BEVERAGES', label: 'Beverages', emoji: '🥤' },
  { value: 'VEGETARIAN', label: 'Vegetarian', emoji: '🥗' },
  { value: 'VEGAN', label: 'Vegan', emoji: '🌱' },
];

export const ORDER_STATUSES = [
  { value: 'PLACED', label: 'Placed', color: 'bg-blue-100 text-blue-700' },
  { value: 'ACCEPTED', label: 'Accepted', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'PREPARING', label: 'Preparing', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'READY', label: 'Ready', color: 'bg-purple-100 text-purple-700' },
  { value: 'PICKED_UP', label: 'Picked Up', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-700' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
];

export const PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Credit/Debit Card' },
  { value: 'NETBANKING', label: 'Net Banking' },
  { value: 'COD', label: 'Cash on Delivery' },
];

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount) {
  const num = typeof amount === 'string' ? Number.parseFloat(amount) : Number(amount);
  return inrFormatter.format(Number.isFinite(num) ? num : 0);
}

export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;

  const base = import.meta.env.VITE_API_BASE_URL || '';
  try {
    const origin = new URL(base).origin;
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  } catch {
    return url;
  }
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(dateStr) {
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
}

export function getStatusStep(status) {
  const steps = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED'];
  return steps.indexOf(status);
}

export function getStatusInfo(status) {
  return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>]/g, '').trim();
}
