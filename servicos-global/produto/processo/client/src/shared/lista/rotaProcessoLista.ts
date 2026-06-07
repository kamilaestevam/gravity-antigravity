import type { ProcessoAvoLinha } from './mockListaHierarquica'
import { ID_ORGANIZACAO_MOCK_LISTA, MOCK_PROCESSOS_AVO } from './mockListaHierarquica'
import { PREFIXO_ACESSO_PROCESSOS, rotaSubpaginaProcessoWorkspace } from '../rotaDetalheProcessoWorkspace'

/** Slug URL do processo na lista — ex.: IMP-2026/0150 → processo-20260150 */
export function slugProcessoLista(numeroProcesso: string): string {
  const nucleo = numeroProcesso
    .replace(/^IMP-/i, '')
    .replace(/^Gravity-/i, '')
    .replace(/\//g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
  return `processo-${nucleo}`
}

/**
 * Detalhe completo (sidebar + Visão Geral / Dados / Pedidos).
 * Rota validada no EMT: /processo/detalhe/workflow?id=&idOrganizacao=
 */
export function rotaDetalheProcessoLista(
  processo: Pick<ProcessoAvoLinha, 'numero_processo' | 'id_processo' | 'id_organizacao'>,
): string {
  const qs = new URLSearchParams({
    id: processo.id_processo,
    idOrganizacao: processo.id_organizacao ?? ID_ORGANIZACAO_MOCK_LISTA,
  })
  return `/processo/detalhe/workflow?${qs.toString()}`
}

/** Subpágina do detalhe legado — ex.: /processo/detalhe/pedidos/resumo?id=… */
export function rotaSubpaginaProcessoLista(
  processo: Pick<ProcessoAvoLinha, 'numero_processo' | 'id_processo' | 'id_organizacao'>,
  subpagina: string,
): string {
  const qs = new URLSearchParams({
    id: processo.id_processo,
    idOrganizacao: processo.id_organizacao ?? ID_ORGANIZACAO_MOCK_LISTA,
  })
  const limpo = subpagina.replace(/^\//, '')
  return `/processo/detalhe/${limpo}?${qs.toString()}`
}

/** Atalho workspace — /acesso-processos/p1/workflow */
export function rotaWorkflowProcessoLista(
  processo: Pick<ProcessoAvoLinha, 'id_processo'>,
): string {
  return rotaSubpaginaProcessoWorkspace({ id: processo.id_processo }, 'workflow')
}

export function resolverProcessoListaPorSlug(
  slug: string,
  processos: readonly ProcessoAvoLinha[] = MOCK_PROCESSOS_AVO,
): ProcessoAvoLinha | undefined {
  return processos.find(p => slugProcessoLista(p.numero_processo) === slug)
}

export { PREFIXO_ACESSO_PROCESSOS }
