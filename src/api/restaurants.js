import api from "./axios";

export const restaurantsAPI = {
  // Restaurants CRUD
  list: (params) => api.get("/restaurants/", { params }),
  get: (id) => api.get(`/restaurants/${id}/`),
  create: (data) => api.post("/restaurants/", data),
  updateRestaurant: (id, data) => api.put(`/restaurants/${id}/`, data),
  patchRestaurant: (id, data) => api.patch(`/restaurants/${id}/`, data),
  deleteRestaurant: (id) => api.delete(`/restaurants/${id}/`),
  toggleRestaurantStatus: (id) =>
    api.patch(`/restaurants/${id}/toggle-status/`),
  getMyRestaurant: () => api.get("/restaurants/mine/"),
  getMine: () => api.get("/restaurants/mine/"),
  toggleStatus: (id) => api.patch(`/restaurants/${id}/toggle-status/`),

  // Categories CRUD
  getCategories: (restaurantId, params) =>
    api.get(`/restaurants/${restaurantId}/categories/`, { params }),
  getCategory: (restaurantId, categoryId) =>
    api.get(`/restaurants/${restaurantId}/categories/${categoryId}/`),
  createCategory: (restaurantId, data) =>
    api.post(`/restaurants/${restaurantId}/categories/`, data),
  updateCategory: (restaurantId, catId, data) =>
    api.put(`/restaurants/${restaurantId}/categories/${catId}/`, data),
  patchCategory: (restaurantId, catId, data) =>
    api.patch(`/restaurants/${restaurantId}/categories/${catId}/`, data),
  deleteCategory: (restaurantId, catId) =>
    api.delete(`/restaurants/${restaurantId}/categories/${catId}/`),

  // Menu Items CRUD
  getMenuItems: (restaurantId, params) =>
    api.get(`/restaurants/${restaurantId}/menu-items/`, { params }),
  getMenuItem: (restaurantId, itemId) =>
    api.get(`/restaurants/${restaurantId}/menu-items/${itemId}/`),
  createMenuItem: (restaurantId, data) =>
    api.post(`/restaurants/${restaurantId}/menu-items/`, data),
  updateMenuItem: (restaurantId, itemId, data) =>
    api.put(`/restaurants/${restaurantId}/menu-items/${itemId}/`, data),
  patchMenuItem: (restaurantId, itemId, data) =>
    api.patch(`/restaurants/${restaurantId}/menu-items/${itemId}/`, data),
  deleteMenuItem: (restaurantId, itemId) =>
    api.delete(`/restaurants/${restaurantId}/menu-items/${itemId}/`),
  toggleMenuItem: (restaurantId, itemId) =>
    api.patch(`/restaurants/${restaurantId}/menu-items/${itemId}/toggle/`),

  // Variants CRUD
  getVariants: (restaurantId, itemId, params) =>
    api.get(`/restaurants/${restaurantId}/menu-items/${itemId}/variants/`, {
      params,
    }),
  getVariant: (restaurantId, itemId, variantId) =>
    api.get(
      `/restaurants/${restaurantId}/menu-items/${itemId}/variants/${variantId}/`,
    ),
  createVariant: (restaurantId, itemId, data) =>
    api.post(
      `/restaurants/${restaurantId}/menu-items/${itemId}/variants/`,
      data,
    ),
  updateVariant: (restaurantId, itemId, variantId, data) =>
    api.put(
      `/restaurants/${restaurantId}/menu-items/${itemId}/variants/${variantId}/`,
      data,
    ),
  patchVariant: (restaurantId, itemId, variantId, data) =>
    api.patch(
      `/restaurants/${restaurantId}/menu-items/${itemId}/variants/${variantId}/`,
      data,
    ),
  deleteVariant: (restaurantId, itemId, variantId) =>
    api.delete(
      `/restaurants/${restaurantId}/menu-items/${itemId}/variants/${variantId}/`,
    ),
};

export const searchAPI = {
  restaurants: (params) => api.get("/search/restaurants/", { params }),
  auto: (params) => api.get("/search/auto/", { params }),
  menuItems: (params) => api.get("/search/menu-items/", { params }),
};
