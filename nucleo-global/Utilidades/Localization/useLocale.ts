/**
 * useLocale — Hook que conecta os formatadores ao idioma ativo do i18n.
 *
 * Retorna versões locale-aware de todas as funções de formatação.
 * O locale é derivado automaticamente de i18n.language.
 *
 * Uso:
 * ```tsx
 * const { formatarMoeda, formatarData } = useLocale()
 * <span>{formatarMoeda(1500.50)}</span>  // R$ 1.500,50 ou $1,500.50
 * ```
 *
 * ⚠️ Regra nucleo-global: componente puro, sem estado de servidor.
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  formatarMoeda,
  formatarNumero,
  formatarPercentual,
  formatarData,
  formatarDataHora,
  formatarHora,
  formatarMesAno,
  formatarTempoRelativo,
  type FormatarMoedaOptions,
  type FormatarDataOptions,
} from '../../utils/src/formatadores'

const LOCALE_MAP: Record<string, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
}

export function useLocale() {
  const { i18n } = useTranslation()
  const locale = LOCALE_MAP[i18n.language] ?? 'pt-BR'

  return useMemo(() => ({
    locale,
    lang: i18n.language,

    formatarMoeda: (valor: number, opcoes?: Omit<FormatarMoedaOptions, 'locale'>) =>
      formatarMoeda(valor, { locale, ...opcoes }),

    formatarNumero: (valor: number, casasDecimais?: number) =>
      formatarNumero(valor, casasDecimais, locale),

    formatarPercentual: (valor: number, casasDecimais?: number) =>
      formatarPercentual(valor, casasDecimais, locale),

    formatarData: (data: Date | string | number, opcoes?: Omit<FormatarDataOptions, 'locale'>) =>
      formatarData(data, { locale, ...opcoes }),

    formatarDataHora: (data: Date | string | number) =>
      formatarDataHora(data, locale),

    formatarHora: (data: Date | string | number) =>
      formatarHora(data, locale),

    formatarMesAno: (data: Date | string | number) =>
      formatarMesAno(data, locale),

    formatarTempoRelativo: (data: Date | string | number) =>
      formatarTempoRelativo(data, locale),
  }), [locale, i18n.language])
}
