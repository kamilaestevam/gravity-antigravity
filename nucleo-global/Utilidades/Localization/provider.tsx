/**
 * I18nProvider — Provider React de internacionalização da plataforma Gravity.
 *
 * Envolve a aplicação raiz com o contexto do i18next.
 * Não gerencia persistência nem detecção — responsabilidade do Shell.
 *
 * Uso:
 * ```tsx
 * import { I18nProvider } from '@nucleo/Utilidades/localization/provider'
 * <I18nProvider><App /></I18nProvider>
 * ```
 */
import React from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'

interface I18nProviderProps {
  children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps): React.JSX.Element {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
