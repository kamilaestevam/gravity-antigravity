import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptTranslations from './locales/pt.json';
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import zhTranslations from './locales/zh.json';
import deTranslations from './locales/de.json';
import itTranslations from './locales/it.json';
import arTranslations from './locales/ar.json';

const resources = {
  pt: { translation: ptTranslations },
  en: { translation: enTranslations },
  es: { translation: esTranslations },
  zh: { translation: zhTranslations },
  de: { translation: deTranslations },
  it: { translation: itTranslations },
  ar: { translation: arTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false, // React já protege contra XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Lógica de direção do documento (RTL/LTR)
i18n.on('languageChanged', (lng) => {
  const direction = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', direction);
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;
