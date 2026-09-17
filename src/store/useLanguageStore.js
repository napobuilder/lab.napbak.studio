import { create } from 'zustand';
import { translations } from '../utils/translations';


const updateSeoMetadata = (lang) => {
  if (typeof document === 'undefined') return;

  const t = translations[lang] || translations.en;
  document.documentElement.lang = lang;
  document.title = t.seo.title;

  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', t.seo.description);
  }

  // Update URL param smoothly without reloading if on client
  try {
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
  } catch {}
};

export const useLanguageStore = create((set, get) => {
  return {
    lang: 'en',
    initClientLanguage: () => {
      if (typeof window === 'undefined') return;
      
      // 1. Check explicit URL query param: ?lang=es or ?lang=en
      const params = new URLSearchParams(window.location.search);
      const langParam = params.get('lang');
      if (langParam === 'es' || langParam === 'en') {
        if (langParam !== 'en') {
          set({ lang: langParam });
        }
        updateSeoMetadata(langParam);
        return;
      }

      // 2. Check localStorage
      const saved = localStorage.getItem('ctrl_lang');
      if (saved === 'es' || saved === 'en') {
        if (saved !== 'en') {
          set({ lang: saved });
        }
        updateSeoMetadata(saved);
        return;
      }

      // 3. Fallback to browser language
      const browserLang = navigator.language || navigator.userLanguage || '';
      if (browserLang.toLowerCase().startsWith('es')) {
        set({ lang: 'es' });
        updateSeoMetadata('es');
      }
    },

    setLang: (newLang) => {
      if (newLang !== 'es' && newLang !== 'en') return;
      localStorage.setItem('ctrl_lang', newLang);
      updateSeoMetadata(newLang);
      set({ lang: newLang });
    },
    toggleLang: () => {
      const current = get().lang;
      const next = current === 'es' ? 'en' : 'es';
      get().setLang(next);
    }
  };
});

