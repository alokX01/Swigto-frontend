import api from './axios';

const normalizeCartItemPayload = (data = {}) => ({
  ...data,
  variant: data.variant ?? null,
  quantity: Number(data.quantity || 1),
});

export const cartAPI = {
  get: () => api.get('/cart/'),
  clear: () => api.delete('/cart/'),
  addItem: (data) => api.post('/cart/items/', normalizeCartItemPayload(data)),
  updateItem: (id, data) => api.patch(`/cart/items/${id}/`, normalizeCartItemPayload(data)),
  removeItem: (id) => api.delete(`/cart/items/${id}/`),
};
