import type { ProcessoLinha } from '../pages/todos/_mocks'

/** Prefixo canônico — lista e detalhe do workspace (configurador /acesso-processos/*). */
export const PREFIXO_ACESSO_PROCESSOS = '/acesso-processos'

/** Visão geral do processo — ex.: /acesso-processos/p1/workflow */
export function rotaWorkflowProcessoWorkspace(processo: Pick<ProcessoLinha, 'id'>): string {
  return `${PREFIXO_ACESSO_PROCESSOS}/${processo.id}/workflow`
}

/** Subpágina do detalhe — ex.: /acesso-processos/p1/dados-tecnicos */
export function rotaSubpaginaProcessoWorkspace(
  processo: Pick<ProcessoLinha, 'id'>,
  subpagina: string,
): string {
  const limpo = subpagina.replace(/^\//, '')
  return `${PREFIXO_ACESSO_PROCESSOS}/${processo.id}/${limpo}`
}
