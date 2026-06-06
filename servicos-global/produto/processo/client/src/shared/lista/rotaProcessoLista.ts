import type { ProcessoAvoLinha } from './mockListaHierarquica'

/** Detalhe plano — ProcessoLayout + mock completo (Visão Geral, Pedidos, etc.). */
const ROTA_DETALHE_PLANO = '/processo/workflow'

/** Slug URL do processo na lista — ex.: IMP-2026/0150 → processo-imp20260150 */
export function slugProcessoLista(numeroProcesso: string): string {
  const nucleo = numeroProcesso
    .replace(/^IMP-/i, '')
    .replace(/^Gravity-/i, '')
    .replace(/\//g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
  return `processo-${nucleo}`
}

/** Abre o detalhe do processo — modelo com sidebar (workflow / visão geral). */
export function rotaDetalheProcessoLista(
  _processo: Pick<ProcessoAvoLinha, 'numero_processo' | 'id_processo'>,
): string {
  return ROTA_DETALHE_PLANO
}

/** Subpágina do detalhe — ex.: /processo/pedidos/resumo */
export function rotaSubpaginaProcessoLista(
  processo: Pick<ProcessoAvoLinha, 'numero_processo' | 'id_processo'>,
  subpagina: string,
): string {
  const limpo = subpagina.replace(/^\//, '')
  return `/processo/${limpo}`
}

export function resolverProcessoListaPorSlug(
  slug: string,
  processos: readonly ProcessoAvoLinha[],
): ProcessoAvoLinha | undefined {
  return processos.find(p => slugProcessoLista(p.numero_processo) === slug)
}
