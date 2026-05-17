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
      // The backend /mine/ endpoint returns a list of restaurants
      let myRest = Array.isArray(res.data) ? res.data[0] : res.data;
      
      set({ restaurant: myRest || null, isLoading: false });
      return myRest || null;
    } catch (err) {
      if (err.response?.status === 404) {
        set({ restaurant: null, isLoading: false, error: null });
        return null;
      }
      set({ error: err.response?.data || err.message, isLoading: false });
      throw err;
    }
  },

  createRestaurant: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // Create the restaurant
      const createRes = await restaurantsAPI.create(data);
      let myRest = createRes.data;
      
      // The POST response doesn't return the ID, so fetch via mine/
      try {
        const res = await restaurantsAPI.getMyRestaurant();
        const mineData = Array.isArray(res.data) ? res.data[res.data.length - 1] : res.data;
        if (mineData && mineData.id) {
          myRest = { ...myRest, ...mineData };
        }
      } catch(e) {}

      set({ restaurant: myRest, isLoading: false });
      return myRest;
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
