import { create } from 'zustand';
import { ordersAPI } from '@/api/orders';

export const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  // Fetch all orders
  fetchOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ordersAPI.list(params);
      const orders = res.data?.results || res.data || [];
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
    try {
      const res = await ordersAPI.checkout(data);
      const order = res.data;
      set((state) => ({
        orders: [order, ...state.orders],
        currentOrder: order,
      }));
      return order;
    } catch (err) {
      throw err;
    }
  },

  // Cancel order
  cancelOrder: async (id, reason = '') => {
    try {
      const res = await ordersAPI.cancel(id, { reason });
      const updated = res.data;
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? updated : o)),
        currentOrder: state.currentOrder?.id === id ? updated : state.currentOrder,
      }));
      return updated;
    } catch (err) {
      throw err;
    }
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
}));
