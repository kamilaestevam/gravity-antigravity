/**
 * audit-client.ts
 * Cliente HTTP leve para produtos enviarem eventos de auditoria ao historico-global.
 * Fire-and-forget: nunca lança erro, nunca bloqueia a operação principal.
 *
 * Uso:
 *   import { auditLog } from '@gravity/historico/audit-client'
 *   auditLog({ id_organizacao, tipo_ator_historico_log: 'USUARIO',
 *               id_ator_historico_log, nome_ator_historico_log,
 *               modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'Pedido',
 *               acao_historico_log: 'CRIAR', detalhe_acao_historico_log: 'Criou pedido #42' })
 */

export type TipoAtorHistoricoLog = 'USUARIO' | 'API' | 'IA' | 'JOB' | 'INTEGRACAO'
export type StatusHistoricoLog = 'SUCESSO' | 'FALHA' | 'PARCIAL'

export interface AuditLogPayload {
  id_organizacao: string

  tipo_ator_historico_log: TipoAtorHistoricoLog
  id_ator_historico_log: string
  nome_ator_historico_log: string
  ip_ator_historico_log?: string
  metadata_ator_historico_log?: Record<string, unknown>

  modulo_historico_log: string
  tipo_recurso_historico_log: string
  id_recurso_historico_log?: string

  acao_historico_log: string
  detalhe_acao_historico_log: string

  estado_anterior_historico_log?: unknown
  estado_posterior_historico_log?: unknown

  status_historico_log?: StatusHistoricoLog
  mensagem_erro_historico_log?: string

  id_produto_historico_log?: string
  id_usuario?: string
}

const HISTORICO_URL =
  process.env.HISTORICO_URL ??
  'http://localhost:3001'

const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY ?? ''

const MAX_RETRY_ATTEMPTS = 3
const RETRY_BASE_DELAY_MS = 300

/**
 * Tenta fazer fetch com backoff exponencial.
 * Não faz retry em erros 4xx (problema no payload, não transitório).
 */
async function fetchWithRetry(url: string, init: RequestInit, attempt = 0): Promise<void> {
  try {
    const res = await fetch(url, init)
    // 4xx = problema no payload, não adianta retentar
    if (res.status >= 400 && res.status < 500) {
      console.error(`[audit-client] Payload inválido (${res.status}) — log descartado`)
      return
    }
    // 5xx ou erro de rede → retentar
    if (!res.ok && attempt < MAX_RETRY_ATTEMPTS - 1) {
      await new Promise((r) => setTimeout(r, RETRY_BASE_DELAY_MS * Math.pow(2, attempt)))
      return fetchWithRetry(url, init, attempt + 1)
    }
  } catch {
    if (attempt < MAX_RETRY_ATTEMPTS - 1) {
      await new Promise((r) => setTimeout(r, RETRY_BASE_DELAY_MS * Math.pow(2, attempt)))
      return fetchWithRetry(url, init, attempt + 1)
    }
    // Esgotou retentativas — log perdido. Em produção, monitorar via Sentry.
    console.error(`[audit-client] FALHA_DEFINITIVA após ${MAX_RETRY_ATTEMPTS} tentativas — log perdido`)
  }
}

/**
 * Enfileira um evento de auditoria via HTTP POST.
 * Fire-and-forget com retry automático (até 3 tentativas, backoff exponencial).
 * Nunca bloqueia a operação principal.
 */
export function auditLog(payload: AuditLogPayload): void {
  const url = `${HISTORICO_URL}/api/v1/historico/logs`

  fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-id-organizacao': payload.id_organizacao,
      'x-internal-key': INTERNAL_KEY,
    },
    body: JSON.stringify(payload),
  }).catch(() => {
    // fetchWithRetry nunca lança, mas por precaução
  })
}
