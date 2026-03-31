/**
 * Gerador de IDs corporativos para NF Importacao
 * Formato: {prefixo}{sequencial_7_digitos}/{ano_2_digitos}
 * Exemplo: nfim_id_0000001/26
 */

export const PREFIXOS = {
  NF: 'nfim_id_',
  ITEM: 'nfit_id_',
  DESPESA: 'nfdp_id_',
  RATEIO: 'nfrt_id_',
} as const

export type PrefixoId = typeof PREFIXOS[keyof typeof PREFIXOS]

export function gerarId(prefixo: PrefixoId, sequencial: number): string {
  const ano = new Date().getFullYear().toString().slice(-2)
  const seq = sequencial.toString().padStart(7, '0')
  return `${prefixo}${seq}/${ano}`
}

export function parseId(id: string): { prefixo: string; sequencial: number; ano: string } | null {
  const match = id.match(/^([a-z]+_id_)(\d{7})\/(\d{2})$/)
  if (!match) return null
  return {
    prefixo: match[1],
    sequencial: parseInt(match[2], 10),
    ano: match[3],
  }
}
