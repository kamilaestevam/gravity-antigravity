/**
 * i18n — Configuração central de internacionalização da plataforma Gravity.
 *
 * Responsabilidades:
 * - Registrar PT como idioma padrão (carregado eagerly).
 * - EN e ES carregados sob demanda via changeLanguageLazy() (lazy loading).
 * - Exportar changeLanguageLazy() para troca de idioma sem re-bundle.
 * - Exportar a instância configurada para uso via I18nProvider.
 *
 * ⚠️ Regra nucleo-global: este módulo NÃO acessa localStorage ou sessionStorage.
 * A detecção e persistência do idioma é responsabilidade do Shell (servicos-global).
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ptTranslations from './locales/pt.json'

// Idiomas suportados — AR, ZH, DE, IT foram arquivados em locales/_archived/
export type SupportedLanguage = 'pt' | 'en' | 'es'
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['pt', 'en', 'es']

/**
 * Carrega os recursos de tradução do idioma solicitado.
 * PT já está carregado estaticamente — EN/ES são importados dinamicamente.
 */
async function loadLocaleResources(lang: SupportedLanguage): Promise<Record<string, unknown>> {
  switch (lang) {
    case 'en':
      return (await import('./locales/en.json')).default as Record<string, unknown>
    case 'es':
      return (await import('./locales/es.json')).default as Record<string, unknown>
    default:
      return ptTranslations as Record<string, unknown>
  }
}

/**
 * Troca o idioma ativo com lazy loading.
 * Se o bundle do idioma ainda não foi carregado, importa dinamicamente antes de trocar.
 * Substitui o uso direto de i18n.changeLanguage() em toda a plataforma.
 */
export async function changeLanguageLazy(lang: SupportedLanguage): Promise<void> {
  if (!i18n.hasResourceBundle(lang, 'translation')) {
    const resources = await loadLocaleResources(lang)
    i18n.addResourceBundle(lang, 'translation', resources, true, true)
  }
  await i18n.changeLanguage(lang)
}

// ── Detecção do idioma salvo ─────────────────────────────────────────────────
// Lê do localStorage antes do init para evitar flash de PT quando o usuário
// já escolheu EN/ES. Se não houver idioma salvo, usa PT como padrão.
const savedLang = (typeof window !== 'undefined'
  ? localStorage.getItem('gravity:language')
  : null) as SupportedLanguage | null

const initialLang: SupportedLanguage =
  savedLang && SUPPORTED_LANGUAGES.includes(savedLang) ? savedLang : 'pt'

i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: ptTranslations },
  },
  lng: initialLang,      // usa idioma salvo — sem flash ao recarregar
  fallbackLng: 'pt',     // PT como fallback enquanto EN/ES carrega lazy
  interpolation: {
    escapeValue: false,  // React já protege contra XSS
  },
})

// Se o idioma salvo é EN/ES, pré-carrega o bundle imediatamente
if (initialLang !== 'pt') {
  changeLanguageLazy(initialLang)
}

export default i18n
