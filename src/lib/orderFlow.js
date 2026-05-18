export const ORDER_FLOW = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED'];

export const ACTIVE_ORDER_STATUSES = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP'];

export const ORDER_STATUS_META = {
  PLACED: {
    label: 'Order Placed',
    shortLabel: 'Placed',
    customerTitle: 'Order Placed',
    customerMessage: 'Waiting for the restaurant to accept your order.',
    bg: '#DBEAFE',
    color: '#1D4ED8',
  },
  ACCEPTED: {
    label: 'Accepted by Restaurant',
    shortLabel: 'Accepted',
    customerTitle: 'Order Accepted',
    customerMessage: 'The restaurant has accepted your order.',
    bg: '#CFFAFE',
    color: '#0E7490',
  },
  PREPARING: {
    label: 'Preparing Your Order',
    shortLabel: 'Preparing',
    customerTitle: 'Being Prepared',
    customerMessage: 'Your food is being prepared now.',
    bg: '#FEF3C7',
    color: '#B45309',
  },
  READY: {
    label: 'Ready for Pickup',
    shortLabel: 'Ready',
    customerTitle: 'Ready for Pickup',
    customerMessage: 'The restaurant has packed your order. A delivery partner will pick it up soon.',
    bg: '#E9DDFF',
    color: '#4F378A',
  },
  PICKED_UP: {
    label: 'Out for Delivery',
    shortLabel: 'On the way',
    customerTitle: 'Out for Delivery',
    customerMessage: 'Your delivery partner is on the way.',
    bg: '#E0E7FF',
    color: '#4338CA',
  },
  DELIVERED: {
    label: 'Delivered',
    shortLabel: 'Delivered',
    customerTitle: 'Delivered',
    customerMessage: 'Enjoy your meal.',
    bg: '#D1FAE5',
    color: '#065F46',
  },
  CANCELLED: {
    label: 'Cancelled',
    shortLabel: 'Cancelled',
    customerTitle: 'Order Cancelled',
    customerMessage: 'This order was cancelled.',
    bg: '#FFDAD6',
    color: '#93000A',
  },
};

export function getOrderMeta(status) {
  return ORDER_STATUS_META[status] || ORDER_STATUS_META.PLACED;
}

export function getOrderStep(status) {
  return ORDER_FLOW.indexOf(status);
}

export function isActiveOrder(status) {
  return ACTIVE_ORDER_STATUSES.includes(status);
}

export function canCustomerCancel(status) {
  return status === 'PLACED';
}

export function shortOrderId(id) {
  if (!id) return 'N/A';
  return String(id).slice(-6).toUpperCase();
}

