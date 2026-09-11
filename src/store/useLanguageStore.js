import { create } from 'zustand';
import { translations } from '../utils/translations';

const getInitialLanguage = () => {
  // 1. Check URL query param: ?lang=es or ?lang=en
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');
    if (langParam === 'es' || langParam === 'en') {
      return langParam;
    }

    // 2. Check localStorage
    const saved = localStorage.getItem('ctrl_lang');
    if (saved === 'es' || saved === 'en') {
      return saved;
    }

    // 3. Fallback to browser language
    const browserLang = navigator.language || navigator.userLanguage || '';
    if (browserLang.toLowerCase().startsWith('es')) {
      return 'es';
    }
  }

  return 'en';
};

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

  // Update URL param smoothly without reloading
  try {
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
  } catch (e) {}
};

export const useLanguageStore = create((set, get) => {
  const initial = getInitialLanguage();
  if (typeof window !== 'undefined') {
    updateSeoMetadata(initial);
  }

  return {
    lang: initial,
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
