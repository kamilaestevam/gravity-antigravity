/**
 * utils/formatters.ts
 * Utilitários de formatação para a plataforma Gravity.
 */

/** Traduz códigos de moeda ISO para símbolos */
export function getSimboloMoeda(moeda: string): string {
  switch (moeda) {
    case 'BRL': return 'R$'
    case 'USD': return '$'
    case 'EUR': return '€'
    case 'GBP': return '£'
    case 'ARS': return 'AR$'
    case 'CNY': return '¥'
    case 'JPY': return '¥'
    default: return moeda
  }
}

/** Formata valor monetário para exibição */
export function formatarMoeda(valor: string, moeda: string): string {
  return `${getSimboloMoeda(moeda)} ${valor}`
}
