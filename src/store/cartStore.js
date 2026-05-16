import { create } from 'zustand';
import { cartAPI } from '@/api/cart';

export const useCartStore = create((set, get) => ({
  cart: null,
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await cartAPI.get();
      set({ cart: res.data, items: res.data.items || [], isLoading: false });
      return res.data;
    } catch (e) {
      set({ isLoading: false });
      return null;
    }
  },

  addItem: async (data) => {
    try {
      const res = await cartAPI.addItem(data);
      set({ cart: res.data, items: res.data.items || [] });
      return res.data;
    } catch (e) {
      throw e;
    }
  },

  updateItem: async (id, data) => {
    try {
      const res = await cartAPI.updateItem(id, data);
      set({ cart: res.data, items: res.data.items || [] });
      return res.data;
    } catch (e) {
      throw e;
    }
  },

  removeItem: async (id) => {
    try {
      await cartAPI.removeItem(id);
      await get().fetchCart();
    } catch (e) {
      throw e;
    }
  },

  clearCart: async () => {
    try {
      await cartAPI.clear();
      set({ cart: null, items: [] });
    } catch (e) {
      throw e;
    }
  },

  getItemCount: () => {
    const { items, cart } = get();
    const list = cart?.items?.length ? cart.items : items;
    return list.reduce((sum, item) => sum + (item.quantity || 0), 0);
  },
}));
