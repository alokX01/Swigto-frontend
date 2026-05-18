import api from './axios';

const normalizeCartItemPayload = (data = {}) => {
  const payload = { ...data };
  delete payload._meta;
  return {
    ...payload,
    variant: payload.variant ?? null,
    quantity: Number(payload.quantity || 1),
  };
};

export const cartAPI = {
  get: () => api.get('/cart/'),
  clear: () => api.delete('/cart/'),
  addItem: (data) => api.post('/cart/items/', normalizeCartItemPayload(data)),
  updateItem: (id, data) => api.patch(`/cart/items/${id}/`, normalizeCartItemPayload(data)),
  removeItem: (id) => api.delete(`/cart/items/${id}/`),
};
