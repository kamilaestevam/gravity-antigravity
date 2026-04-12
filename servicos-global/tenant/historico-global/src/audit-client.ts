/**
 * audit-client.ts
 * Cliente HTTP leve para produtos enviarem eventos de auditoria ao historico-global.
 * Fire-and-forget: nunca lança erro, nunca bloqueia a operação principal.
 *
 * Uso:
 *   import { auditLog } from '@gravity/historico/audit-client'
 *   auditLog({ tenant_id, actor_type: 'USER', actor_id, actor_name,
 *               module: 'pedido', resource_type: 'Pedido',
 *               action: 'CREATE', action_detail: 'Criou pedido #42' })
 */

export interface AuditLogPayload {
  tenant_id: string

  actor_type: 'USER' | 'API' | 'AI' | 'JOB' | 'INTEGRATION'
  actor_id: string
  actor_name: string
  actor_ip?: string
  actor_metadata?: Record<string, unknown>

  module: string
  resource_type: string
  resource_id?: string

  action: string
  action_detail: string

  before?: unknown
  after?: unknown

  status?: 'SUCCESS' | 'FAILURE' | 'PARTIAL'
  error_message?: string

  product_id?: string
  user_id?: string
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
      'x-tenant-id': payload.tenant_id,
      'x-internal-key': INTERNAL_KEY,
    },
    body: JSON.stringify(payload),
  }).catch(() => {
    // fetchWithRetry nunca lança, mas por precaução
  })
}
