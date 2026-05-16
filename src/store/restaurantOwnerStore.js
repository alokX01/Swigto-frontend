import { create } from 'zustand';
import { restaurantOwnerAPI } from '@/api/profiles';
import { restaurantsAPI } from '@/api/restaurants';

export const useRestaurantOwnerStore = create((set, get) => ({
  // Restaurant Owner Profile
  profile: null,
  restaurant: null,
  restaurants: [],
  
  // UI State
  isLoading: false,
  error: null,

  // Profile Management
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantOwnerAPI.getProfile();
      set({ profile: res.data, isLoading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantOwnerAPI.updateProfile(data);
      set({ profile: res.data, isLoading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  patchProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantOwnerAPI.patchProfile(data);
      set({ profile: res.data, isLoading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  // Restaurant Management
  fetchMyRestaurant: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantsAPI.getMyRestaurant();
      set({ restaurant: res.data, isLoading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  fetchRestaurant: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantsAPI.get(id);
      set({ restaurant: res.data, isLoading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  updateRestaurant: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantsAPI.updateRestaurant(id, data);
      set({ restaurant: res.data, isLoading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  toggleRestaurantStatus: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await restaurantsAPI.toggleRestaurantStatus(id);
      set({ restaurant: res.data, isLoading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  // Bulk Operations
  setProfile: (profile) => set({ profile }),
  setRestaurant: (restaurant) => set({ restaurant }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
