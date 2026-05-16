import api from './axios';

export const customerAPI = {
  getProfile: () => api.get('/customer/profile/'),
  updateProfile: (data) => api.put('/customer/profile/', data),
  patchProfile: (data) => api.patch('/customer/profile/', data),
  getAddresses: (params) => api.get('/customer/addresses/', { params }),
  addAddress: (data) => api.post('/customer/addresses/', data),
  getAddress: (id) => api.get(`/customer/addresses/${id}/`),
  updateAddress: (id, data) => api.put(`/customer/addresses/${id}/`, data),
  patchAddress: (id, data) => api.patch(`/customer/addresses/${id}/`, data),
  deleteAddress: (id) => api.delete(`/customer/addresses/${id}/`),
  setDefaultAddress: (id) => api.post(`/customer/addresses/${id}/set-default/`),
};

export const restaurantOwnerAPI = {
  getProfile: () => api.get('/restaurant-owner/profile/'),
  updateProfile: (data) => api.put('/restaurant-owner/profile/', data),
  patchProfile: (data) => api.patch('/restaurant-owner/profile/', data),
};

export const agentAPI = {
  getProfile: () => api.get('/delivery-agent/profile/'),
  updateProfile: (data) => api.put('/delivery-agent/profile/', data),
  patchProfile: (data) => api.patch('/delivery-agent/profile/', data),
  toggleAvailability: () => api.patch('/delivery-agent/availability/'),
  pushLocation: (data) => api.post('/delivery-agent/location/', data),
};
