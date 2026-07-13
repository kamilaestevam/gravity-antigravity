/**
 * SSOT — status de fluxo do wizard (coluna Status da Lista).
 * Independente de `status_leitura` (DATI / IA).
 *
 * 05 EM_INTEGRACAO e 06 INTEGRACAO_CONFIRMADA: reservados — só quando houver integração via API.
 * KPI «concluída(s)» (enquanto 05/06 não usados): RESULTADO_LEITURAS (04).
 */

import { z } from 'zod'

export const StatusFluxoLeituraEnum = z.enum([
  'ANEXAR_ARQUIVO',
  'ANALISE_ARQUIVO',
  'CONFERENCIA',
  'RESULTADO_LEITURAS',
  'EM_INTEGRACAO',
  'INTEGRACAO_CONFIRMADA',
  'FALHOU',
])
export type StatusFluxoLeitura = z.infer<typeof StatusFluxoLeituraEnum>

/** Status ativos na UI agora (05/06 reservados, nunca atribuídos nesta entrega). */
export const STATUS_FLUXO_LEITURA_ATIVOS = [
  'ANEXAR_ARQUIVO',
  'ANALISE_ARQUIVO',
  'CONFERENCIA',
  'RESULTADO_LEITURAS',
  'FALHOU',
] as const satisfies readonly StatusFluxoLeitura[]

export const ROTULO_STATUS_FLUXO_LEITURA: Record<StatusFluxoLeitura, string> = {
  ANEXAR_ARQUIVO: 'Anexar arquivo',
  ANALISE_ARQUIVO: 'Análise de arquivo',
  CONFERENCIA: 'Conferência',
  RESULTADO_LEITURAS: 'Resultado das leituras',
  EM_INTEGRACAO: 'Em integração',
  INTEGRACAO_CONFIRMADA: 'Integração confirmada',
  FALHOU: 'Falhou',
}

export const CLASSE_PILL_STATUS_FLUXO_LEITURA: Record<StatusFluxoLeitura, string> = {
  ANEXAR_ARQUIVO: 'sr-pill-fluxo-anexar',
  ANALISE_ARQUIVO: 'sr-pill-fluxo-analise',
  CONFERENCIA: 'sr-pill-fluxo-conferencia',
  RESULTADO_LEITURAS: 'sr-pill-fluxo-resultado',
  EM_INTEGRACAO: 'sr-pill-fluxo-em-integracao',
  INTEGRACAO_CONFIRMADA: 'sr-pill-fluxo-integracao-confirmada',
  FALHOU: 'sr-pill-fluxo-falhou',
}

/** Conta no subtexto «concluída(s) nesta página» até existir integração API. */
export const STATUS_FLUXO_CONCLUIDA_KPI: StatusFluxoLeitura = 'RESULTADO_LEITURAS'

export type EntradaDerivarStatusFluxoLeitura = {
  status_leitura: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  passo_atual_leitura?: number | null
}

export function statusFluxoPorPasso(passo: number): StatusFluxoLeitura {
  if (passo <= 1) return 'ANEXAR_ARQUIVO'
  if (passo === 2) return 'ANALISE_ARQUIVO'
  if (passo === 3) return 'CONFERENCIA'
  return 'RESULTADO_LEITURAS'
}

/**
 * Deriva o fluxo Gravity a partir do passo persistido e do status DATI.
 * Nunca retorna EM_INTEGRACAO / INTEGRACAO_CONFIRMADA nesta fase.
 */
export function derivarStatusFluxoLeitura(
  entrada: EntradaDerivarStatusFluxoLeitura,
): StatusFluxoLeitura {
  if (entrada.status_leitura === 'FAILED') return 'FALHOU'

  const passo = entrada.passo_atual_leitura
  if (typeof passo === 'number' && passo >= 1 && passo <= 4) {
    return statusFluxoPorPasso(passo)
  }

  if (entrada.status_leitura === 'PENDING') return 'ANEXAR_ARQUIVO'
  if (entrada.status_leitura === 'PROCESSING') return 'ANALISE_ARQUIVO'
  return 'RESULTADO_LEITURAS'
}

export function ehStatusFluxoConcluidaKpi(status: StatusFluxoLeitura): boolean {
  return status === STATUS_FLUXO_CONCLUIDA_KPI
}
