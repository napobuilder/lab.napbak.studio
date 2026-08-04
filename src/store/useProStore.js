import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProStore = create(
  persist(
    (set) => ({
      isPro: false,
      licenseKey: null,
      activatedAt: null,
      unlockPro: (key) => set({ isPro: true, licenseKey: key, activatedAt: Date.now() }),
      lockPro: () => set({ isPro: false, licenseKey: null, activatedAt: null }),
    }),
    { 
      name: 'napbak-pro-storage' 
    }
  )
);
