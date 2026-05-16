import { io } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

const WS_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

let socket = null;

/**
 * Get or create a singleton socket.io connection.
 * Authenticates with the current access token.
 */
export function getSocket() {
  if (socket?.connected) return socket;

  const token = useAuthStore.getState().accessToken;
  if (!token) return null;

  socket = io(WS_URL, {
    transports: ['websocket', 'polling'],
    auth: { token },
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    // Connection established
  });

  socket.on('connect_error', () => {
    // Silently handle - the app falls back to polling
  });

  return socket;
}

/**
 * Subscribe to real-time status updates for a specific order.
 * @param {string} orderId  - UUID of the order to track
 * @param {function} onStatusUpdate - callback receiving { status, updated_at }
 * @returns {function} unsubscribe function
 */
export function subscribeToOrder(orderId, onStatusUpdate) {
  const sock = getSocket();
  if (!sock) return () => {};

  const channel = `order_${orderId}`;

  sock.emit('join_order', { order_id: orderId });

  const handler = (data) => {
    if (typeof onStatusUpdate === 'function') {
      onStatusUpdate(data);
    }
  };

  sock.on(channel, handler);

  return () => {
    sock.off(channel, handler);
    sock.emit('leave_order', { order_id: orderId });
  };
}

/**
 * Disconnect the socket entirely (e.g. on logout).
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
