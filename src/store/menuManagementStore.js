import { create } from 'zustand';
import { restaurantsAPI } from '@/api/restaurants';

export const useMenuManagementStore = create((set) => ({
  // Categories
  categories: [],
  selectedCategory: null,
  
  // Menu Items
  menuItems: [],
  selectedMenuItem: null,
  
  // Variants
  variants: [],
  
  // Loading & Error
  isLoading: false,
  error: null,

  // ==================== CATEGORIES ====================
  fetchCategories: async (restaurantId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantAPI.getCategories(restaurantId, params);
      const categories = res.data.results || res.data;
      set({ categories, isLoading: false });
      return categories;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  createCategory: async (restaurantId, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantAPI.createCategory(restaurantId, data);
      set((state) => ({
        categories: [...state.categories, res.data],
        isLoading: false,
      }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  updateCategory: async (restaurantId, categoryId, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantAPI.updateCategory(restaurantId, categoryId, data);
      set((state) => ({
        categories: state.categories.map((cat) => (cat.id === categoryId ? res.data : cat)),
        isLoading: false,
      }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  patchCategory: async (restaurantId, categoryId, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantAPI.patchCategory(restaurantId, categoryId, data);
      set((state) => ({
        categories: state.categories.map((cat) => (cat.id === categoryId ? res.data : cat)),
        isLoading: false,
      }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  deleteCategory: async (restaurantId, categoryId) => {
    set({ isLoading: true, error: null });
    try {
      await restaurantAPI.deleteCategory(restaurantId, categoryId);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== categoryId),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  // ==================== MENU ITEMS ====================
  fetchMenuItems: async (restaurantId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantAPI.getMenuItems(restaurantId, params);
      const menuItems = res.data.results || res.data;
      set({ menuItems, isLoading: false });
      return menuItems;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  fetchMenuItem: async (restaurantId, itemId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantAPI.getMenuItem(restaurantId, itemId);
      set({ selectedMenuItem: res.data, isLoading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  createMenuItem: async (restaurantId, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantAPI.createMenuItem(restaurantId, data);
      set((state) => ({
        menuItems: [...state.menuItems, res.data],
        isLoading: false,
      }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  updateMenuItem: async (restaurantId, itemId, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantAPI.updateMenuItem(restaurantId, itemId, data);
      set((state) => ({
        menuItems: state.menuItems.map((item) => (item.id === itemId ? res.data : item)),
        selectedMenuItem: state.selectedMenuItem?.id === itemId ? res.data : state.selectedMenuItem,
        isLoading: false,
      }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  patchMenuItem: async (restaurantId, itemId, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantAPI.patchMenuItem(restaurantId, itemId, data);
      set((state) => ({
        menuItems: state.menuItems.map((item) => (item.id === itemId ? res.data : item)),
        selectedMenuItem: state.selectedMenuItem?.id === itemId ? res.data : state.selectedMenuItem,
        isLoading: false,
      }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  deleteMenuItem: async (restaurantId, itemId) => {
    set({ isLoading: true, error: null });
    try {
      await restaurantsAPI.deleteMenuItem(restaurantId, itemId);
      set((state) => ({
        menuItems: state.menuItems.filter((item) => item.id !== itemId),
        selectedMenuItem: state.selectedMenuItem?.id === itemId ? null : state.selectedMenuItem,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  toggleMenuItemStatus: async (restaurantId, itemId) => {
    try {
      set({ isLoading: true, error: null });
      const res = await restaurantsAPI.toggleMenuItem(restaurantId, itemId);
      set(state => ({
        menuItems: state.menuItems.map(item => item.id === itemId ? { ...item, ...res.data } : item),
        currentItem: state.currentItem?.id === itemId ? { ...state.currentItem, ...res.data } : state.currentItem,
        isLoading: false
      }));
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to toggle status', isLoading: false });
      throw error;
    }
  },

  // ==================== VARIANTS ====================
  fetchVariants: async (restaurantId, itemId, params = {}) => {
    try {
      set({ isLoading: true, error: null });
      const res = await restaurantsAPI.getVariants(restaurantId, itemId, params);
      set({ 
        variants: res.data.results || res.data, 
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to fetch variants', isLoading: false });
      throw error;
    }
  },

  createVariant: async (restaurantId, itemId, data) => {
    try {
      set({ isLoading: true, error: null });
      const res = await restaurantsAPI.createVariant(restaurantId, itemId, data);
      set(state => ({ 
        variants: [...state.variants, res.data],
        isLoading: false 
      }));
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to create variant', isLoading: false });
      throw error;
    }
  },

  updateVariant: async (restaurantId, itemId, variantId, data) => {
    try {
      set({ isLoading: true, error: null });
      const res = await restaurantsAPI.updateVariant(restaurantId, itemId, variantId, data);
      set(state => ({
        variants: state.variants.map(v => v.id === variantId ? res.data : v),
        isLoading: false
      }));
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to update variant', isLoading: false });
      throw error;
    }
  },

  patchVariant: async (restaurantId, itemId, variantId, data) => {
    try {
      set({ isLoading: true, error: null });
      const res = await restaurantsAPI.patchVariant(restaurantId, itemId, variantId, data);
      set(state => ({
        variants: state.variants.map(v => v.id === variantId ? { ...v, ...res.data } : v),
        isLoading: false
      }));
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to update variant', isLoading: false });
      throw error;
    }
  },

  deleteVariant: async (restaurantId, itemId, variantId) => {
    set({ isLoading: true, error: null });
    try {
      await restaurantsAPI.deleteVariant(restaurantId, itemId, variantId);
      set((state) => ({
        variants: state.variants.filter((v) => v.id !== variantId),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  // ==================== UTILITIES ====================
  clearSelectedMenuItem: () => set({ selectedMenuItem: null }),
  clearVariants: () => set({ variants: [] }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
}));
