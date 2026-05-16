import api from './axios';

export const reviewsAPI = {
  submitRestaurantReview: (orderId, data) => api.post(`/reviews/orders/${orderId}/restaurant/`, data),
  submitDeliveryReview: (orderId, data) => api.post(`/reviews/orders/${orderId}/delivery/`, data),
  getReviewStatus: (orderId) => api.get(`/reviews/orders/${orderId}/status/`),
  getRestaurantReviews: (restaurantId, params) => api.get(`/reviews/restaurants/${restaurantId}/`, { params }),
};
