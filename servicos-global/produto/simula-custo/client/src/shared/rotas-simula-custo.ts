/**
 * rotas-simula-custo.ts — Rotas canônicas do produto (base /simula-custo).
 * Navegação SEMPRE absoluta — corrige o bug de duplicação de URL
 * (/dashboard/dashboard) causado por links relativos no menu lateral.
 */
export const BASE_ROTA_SIMULA_CUSTO = '/simula-custo'

export type SegmentoRotaSimulaCusto =
  | 'insights'
  | 'lista'
  | 'dashboard'
  | 'kanban'
  | 'configuracoes'
  | 'simulas/nova'

export function rotaSimulaCusto(segmento: SegmentoRotaSimulaCusto | string): string {
  return `${BASE_ROTA_SIMULA_CUSTO}/${segmento}`
}

export function rotaDetalheSimulaCusto(idSimulaCusto: string): string {
  return `${BASE_ROTA_SIMULA_CUSTO}/simulas/${idSimulaCusto}`
}
