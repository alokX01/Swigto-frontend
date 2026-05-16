import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLocationStore = create(
  persist(
    (set) => ({
      selectedCity: 'Kanpur',
      coordinates: null,

      setCity: (city) => set({ selectedCity: city }),
      setCoordinates: (coords) => set({ coordinates: coords }),
    }),
    { name: 'foodrevolut-location' }
  )
);
