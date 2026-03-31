/**
 * idGenerator.ts — Gera IDs corporativos para LPCO
 *
 * Formato: {prefixo}{sequencial_7_digitos}/{ano_2_digitos}
 * Exemplo: lpco_id_0000001/26
 *
 * Prefixos:
 * - lpco_id_ — Lpco
 * - lpit_id_ — LpcoItem
 * - lpex_id_ — LpcoExigencia
 * - lpvc_id_ — LpcoVinculo
 */

export function gerarId(prefixo: string, sequencial: number): string {
  const ano = new Date().getFullYear().toString().slice(-2)
  const seq = sequencial.toString().padStart(7, '0')
  return `${prefixo}${seq}/${ano}`
}

export const PREFIXOS = {
  LPCO: 'lpco_id_',
  ITEM: 'lpit_id_',
  EXIGENCIA: 'lpex_id_',
  VINCULO: 'lpvc_id_',
} as const
