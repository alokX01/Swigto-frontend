import api from './axios';

export const ordersAPI = {
  // Customer
  list: (params) => api.get('/orders/', { params }),
  get: (id) => api.get(`/orders/${id}/`),
  checkout: (data) => api.post('/orders/checkout/', data),
  cancel: (id, data) => api.post(`/orders/${id}/cancel/`, data),

  // Restaurant
  restaurantOrders: (params) => api.get('/orders/restaurants/', { params }),
  restaurantOrderDetail: (id) => api.get(`/orders/restaurants/${id}/`),

  // Agent
  agentOrders: (params) => api.get('/orders/agents/', { params }),
  agentOrderDetail: (id) => api.get(`/orders/agents/${id}/`),

  // Status update
  updateStatus: (id, data) => api.patch(`/orders/${id}/status/`, data),
};

export const paymentsAPI = {
  get: (orderId) => api.get(`/payments/${orderId}/`),
  initiate: (orderId) => api.post(`/payments/initiate/${orderId}/`),
  verify: (data) => api.post('/payments/verify/', data),
};
