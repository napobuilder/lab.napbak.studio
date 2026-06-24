import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProStore = create(
  persist(
    (set) => ({
      isPro: false,
      licenseKey: null,
      unlockPro: (key) => set({ isPro: true, licenseKey: key }),
      lockPro: () => set({ isPro: false, licenseKey: null }),
    }),
    { 
      name: 'napbak-pro-storage' 
    }
  )
);
