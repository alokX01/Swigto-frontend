import { create } from 'zustand';
import { cartAPI } from '@/api/cart';

const META_KEY = 'cartItemMeta';

const toNumber = (value) => {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const readMeta = () => {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeMeta = (meta) => {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // Local cart metadata is a visual fallback only.
  }
};

const rememberMeta = (data = {}) => {
  if (!data._meta || !data.menu_item) return;
  const meta = readMeta();
  meta[data.menu_item] = { ...(meta[data.menu_item] || {}), ...data._meta };
  writeMeta(meta);
};

const enrichCart = (cart) => {
  if (!cart) return cart;
  const meta = readMeta();
  const items = (cart.items || []).map((item) => {
    const key = item.menu_item || item.menu_item_id;
    const local = key ? meta[key] : null;
    const unitPrice = toNumber(item.unit_price) || toNumber(local?.price);
    const subtotal = toNumber(item.subtotal) || unitPrice * Number(item.quantity || 1);

    return {
      ...item,
      menu_item_image: item.menu_item_image || item.image || local?.image || '',
      menu_item_name: item.menu_item_name || item.item_name || local?.name || 'Menu item',
      unit_price: item.unit_price || (unitPrice ? String(unitPrice) : item.unit_price),
      subtotal: item.subtotal || (subtotal ? String(subtotal) : item.subtotal),
    };
  });
  const computedSubtotal = items.reduce((sum, item) => sum + toNumber(item.subtotal), 0);
  const delivery = toNumber(cart.delivery_fee);
  const platform = toNumber(cart.platform_fee);
  const gst = toNumber(cart.gst);
  const computedTotal = computedSubtotal + delivery + platform + gst;

  return {
    ...cart,
    items,
    subtotal: toNumber(cart.subtotal) ? cart.subtotal : String(computedSubtotal),
    total_amount: toNumber(cart.total_amount) ? cart.total_amount : String(computedTotal),
  };
};

export const useCartStore = create((set, get) => ({
  cart: null,
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await cartAPI.get();
      const cart = enrichCart(res.data);
      set({ cart, items: cart.items || [], isLoading: false });
      return cart;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },

  addItem: async (data) => {
    rememberMeta(data);
    const res = await cartAPI.addItem(data);
    const cart = enrichCart(res.data);
    set({ cart, items: cart.items || [] });
    return cart;
  },

  updateItem: async (id, data) => {
    const res = await cartAPI.updateItem(id, data);
    const cart = enrichCart(res.data);
    set({ cart, items: cart.items || [] });
    return cart;
  },

  removeItem: async (id) => {
    await cartAPI.removeItem(id);
    await get().fetchCart();
  },

  clearCart: async () => {
    await cartAPI.clear();
    writeMeta({});
    set({ cart: null, items: [] });
  },

  getItemCount: () => {
    const { items, cart } = get();
    const list = cart?.items?.length ? cart.items : items;
    return list.reduce((sum, item) => sum + (item.quantity || 0), 0);
  },
}));
