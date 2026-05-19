import { create } from 'zustand';
import { customerAPI } from '@/api/profiles';

export const useProfileStore = create((set, get) => ({
  profile: null,
  addresses: [],
  isLoading: false,
  error: null,

  // Fetch profile
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await customerAPI.getProfile();
      const profile = res.data;
      set({ profile, isLoading: false });
      return profile;
    } catch (err) {
      set({ profile: null, isLoading: false });
      return null;
    }
  },

  // Update profile
  updateProfile: async (data) => {
    try {
      const res = await customerAPI.patchProfile(data);
      const updated = res.data;
      set({ profile: updated });
      return updated;
    } catch (err) {
      throw err;
    }
  },

  // Fetch addresses
  fetchAddresses: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await customerAPI.getAddresses(params);
      const addresses = res.data?.results || res.data || [];
      set({ addresses, isLoading: false });
      return addresses;
    } catch (err) {
      set({ error: err.response?.data?.detail || err.message, isLoading: false });
      return [];
    }
  },

  // Add address
  addAddress: async (data) => {
    try {
      const res = await customerAPI.addAddress(data);
      const newAddr = res.data;
      set((state) => ({ addresses: [...state.addresses, newAddr] }));
      return newAddr;
    } catch (err) {
      throw err;
    }
  },

  // Update address
  updateAddress: async (id, data) => {
    try {
      const res = await customerAPI.patchAddress(id, data);
      const updated = res.data;
      set((state) => ({
        addresses: state.addresses.map((a) => (a.id === id ? updated : a)),
      }));
      return updated;
    } catch (err) {
      throw err;
    }
  },

  // Delete address
  deleteAddress: async (id) => {
    try {
      await customerAPI.deleteAddress(id);
      set((state) => ({
        addresses: state.addresses.filter((a) => a.id !== id),
      }));
    } catch (err) {
      throw err;
    }
  },

  // Set default address
  setDefaultAddress: async (id) => {
    try {
      await customerAPI.setDefaultAddress(id);
      set((state) => ({
        addresses: state.addresses.map((a) => ({
          ...a,
          is_default: a.id === id,
        })),
      }));
    } catch (err) {
      throw err;
    }
  },
}));
