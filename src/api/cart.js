import api from './axios';

const normalizeCartAddPayload = (data = {}) => {
  const payload = { ...data };
  delete payload._meta;
  return {
    ...payload,
    variant: payload.variant ?? null,
    quantity: Number(payload.quantity || 1),
  };
};

const normalizeCartUpdatePayload = (data = {}) => {
  const payload = {
    menu_item: data.menu_item,
    variant: data.variant ?? null,
    quantity: Number(data.quantity || 1),
  };
  if (!payload.variant) delete payload.variant;
  return payload;
};

export const cartAPI = {
  get: () => api.get('/cart/'),
  clear: () => api.delete('/cart/'),
  addItem: (data) => api.post('/cart/items/', normalizeCartAddPayload(data)),
  updateItem: async (id, data) => {
    const payload = normalizeCartUpdatePayload(data);
    try {
      return await api.patch(`/cart/items/${id}/`, payload);
    } catch (error) {
      if (error?.response?.status !== 500) throw error;
      return api.patch('/cart/items/', payload);
    }
  },
  removeItem: (id) => api.delete(`/cart/items/${id}/`),
};
