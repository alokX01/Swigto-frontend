/** Map Django API roles (CUSTOMER, RESTAURANT_OWNER, …) to frontend route roles */
export function normalizeRole(role) {
  if (!role) return null;
  const key = String(role).toUpperCase().replace(/\s+/g, '_');
  const map = {
    CUSTOMER: 'customer',
    RESTAURANT_OWNER: 'restaurant_owner',
    RESTAURANT: 'restaurant',
    DELIVERY_AGENT: 'delivery_agent',
    AGENT: 'agent',
    ADMIN: 'admin',
  };
  return map[key] || String(role).toLowerCase();
}

export function getRoleRedirectPath(role) {
  const paths = {
    customer: '/',
    restaurant_owner: '/restaurant/dashboard',
    restaurant: '/restaurant/dashboard',
    delivery_agent: '/agent/dashboard',
    agent: '/agent/dashboard',
    admin: '/admin/dashboard',
  };
  return paths[normalizeRole(role)] || '/';
}

export function getApiError(error, defaultMsg = 'Something went wrong') {
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return defaultMsg;
}

export function toNumber(value) {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function toBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'True';
}

export function extractInitials(firstName = '', lastName = '') {
  const f = firstName?.charAt(0)?.toUpperCase() || '';
  const l = lastName?.charAt(0)?.toUpperCase() || '';
  return `${f}${l}`;
}

export function getAddressLabel(label) {
  const labels = {
    HOME: '🏠 Home',
    WORK: '💼 Work',
    OTHER: '📍 Other',
  };
  return labels[label] || label;
}

export function getOrderStatusColor(status) {
  const colors = {
    PLACED: '#3B82F6',
    ACCEPTED: '#06B6D4',
    PREPARING: '#F59E0B',
    READY: '#A855F7',
    PICKED_UP: '#6366F1',
    DELIVERED: '#10B981',
    CANCELLED: '#EF4444',
  };
  return colors[status] || '#6B7280';
}

export function getOrderStatusLabel(status) {
  const labels = {
    PLACED: 'Order Placed',
    ACCEPTED: 'Accepted by Restaurant',
    PREPARING: 'Preparing Your Order',
    READY: 'Ready for Pickup',
    PICKED_UP: 'In Transit',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
}

export const ADDRESS_LABELS = [
  { value: 'HOME', label: '🏠 Home' },
  { value: 'WORK', label: '💼 Work' },
  { value: 'OTHER', label: '📍 Other' },
];

export function formatCurrency(amount = 0) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}
