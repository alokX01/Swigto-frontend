import api from './axios';

export const authAPI = {
  login: (data) => api.post('/auth/login/', data),
  registerCustomer: (data) => api.post('/auth/register/customer/', data),
  registerRestaurantOwner: (data) => api.post('/auth/register/restaurant-owner/', data),
  registerDeliveryAgent: (data) => api.post('/auth/register/delivery-agent/', data),
  getMe: () => api.get('/auth/me/'),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
  forgotPassword: (data) => api.post('/auth/password/forgot/', data),
  resetPassword: (data) => api.post('/auth/password/reset/', data),
  resendVerification: (data) => api.post('/auth/email/resend-verification/', data),
  changePassword: (data) => api.post('/auth/password/change/', data),
};
