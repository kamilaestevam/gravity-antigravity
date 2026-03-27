/**
 * i18n — Configuração central de internacionalização da plataforma Gravity.
 *
 * Responsabilidades:
 * - Registrar os 7 idiomas suportados pela plataforma.
 * - Definir o fallback (pt) para chaves não traduzidas.
 * - Exportar a instância configurada para uso via I18nProvider.
 *
 * ⚠️ Regra nucleo-global: este módulo NÃO acessa localStorage ou sessionStorage.
 * A detecção e persistência do idioma é responsabilidade do Shell (servicos-global).
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ptTranslations from './locales/pt.json'
import enTranslations from './locales/en.json'
import esTranslations from './locales/es.json'
import zhTranslations from './locales/zh.json'
import deTranslations from './locales/de.json'
import itTranslations from './locales/it.json'
import arTranslations from './locales/ar.json'

// Idiomas RTL — usados pelo Shell para aplicar dir="rtl" no documento
export const RTL_LANGUAGES = ['ar'] as const
export type SupportedLanguage = 'pt' | 'en' | 'es' | 'zh' | 'de' | 'it' | 'ar'

const resources = {
  pt: { translation: ptTranslations },
  en: { translation: enTranslations },
  es: { translation: esTranslations },
  zh: { translation: zhTranslations },
  de: { translation: deTranslations },
  it: { translation: itTranslations },
  ar: { translation: arTranslations },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'pt',             // idioma inicial — o Shell sobrescreve via changeLanguage()
  fallbackLng: 'pt',
  interpolation: {
    escapeValue: false,  // React já protege contra XSS
  },
})

export default i18n
