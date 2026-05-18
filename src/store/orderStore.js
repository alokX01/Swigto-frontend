import { create } from 'zustand';
import { ordersAPI } from '@/api/orders';

const readOrderList = (data) => (Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []);

const mergeOrder = (state, order) => {
  if (!order?.id) return state.orders;
  const exists = state.orders.some((item) => item.id === order.id);
  if (!exists) return [order, ...state.orders];
  return state.orders.map((item) => (item.id === order.id ? { ...item, ...order } : item));
};

export const useOrderStore = create((set) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  // Fetch all orders
  fetchOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ordersAPI.list(params);
      const orders = readOrderList(res.data);
      set({ orders, isLoading: false });
      return orders;
    } catch (err) {
      set({ error: err.response?.data?.detail || err.message, isLoading: false });
      return [];
    }
  },

  // Fetch single order
  fetchOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ordersAPI.get(id);
      const order = res.data;
      set({ currentOrder: order, isLoading: false });
      return order;
    } catch (err) {
      set({ error: err.response?.data?.detail || err.message, isLoading: false });
      return null;
    }
  },

  // Place order
  placeOrder: async (data) => {
    const res = await ordersAPI.checkout(data);
    const order = res.data;
    set((state) => ({
      orders: [order, ...state.orders],
      currentOrder: order,
    }));
    return order;
  },

  // Cancel order
  cancelOrder: async (id, reason = '') => {
    await ordersAPI.cancel(id, { status: 'CANCELLED', note: reason || 'Cancelled by customer' });

    let updated = null;
    try {
      const detailRes = await ordersAPI.get(id);
      updated = detailRes.data;
    } catch {
      updated = { id, status: 'CANCELLED' };
    }

    set((state) => ({
      orders: mergeOrder(state, updated),
      currentOrder: state.currentOrder?.id === id ? { ...state.currentOrder, ...updated } : state.currentOrder,
    }));
    return updated;
  },

  // Update order status (for real-time updates)
  updateOrderStatus: (orderId, newStatus) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ),
      currentOrder:
        state.currentOrder?.id === orderId
          ? { ...state.currentOrder, status: newStatus }
          : state.currentOrder,
    }));
  },

  clearCurrentOrder: () => set({ currentOrder: null }),
  clearOrders: () => set({ orders: [], currentOrder: null, error: null, isLoading: false }),
}));
