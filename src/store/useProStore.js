import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

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
      name: 'napbak-pro-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : dummyStorage),
      skipHydration: true,
    }
  )
);

