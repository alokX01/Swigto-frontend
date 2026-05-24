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
  return {
    menu_item: data.menu_item,
    variant: data.variant ?? null,
    quantity: Number(data.quantity || 1),
  };
};

const shouldTryCollectionRoute = (error) => [404, 405, 500].includes(error?.response?.status);

export const cartAPI = {
  get: () => api.get('/cart/'),
  clear: () => api.delete('/cart/'),
  addItem: (data) => api.post('/cart/items/', normalizeCartAddPayload(data)),
  updateItem: async (id, data) => {
    const payload = normalizeCartUpdatePayload(data);
    try {
      return await api.patch(`/cart/items/${id}/`, payload);
    } catch (error) {
      if (!shouldTryCollectionRoute(error)) throw error;
      return api.patch('/cart/items/', payload);
    }
  },
  removeItem: async (id, data = {}) => {
    const payload = normalizeCartUpdatePayload(data);
    try {
      return await api.delete(`/cart/items/${id}/`);
    } catch (error) {
      if (!shouldTryCollectionRoute(error) || !payload.menu_item) throw error;
      return api.delete('/cart/items/', { data: payload });
    }
  },
};
