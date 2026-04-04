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
  process.env.CONFIGURADOR_URL ??
  'http://localhost:8005'

const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY ?? ''

/**
 * Enfileira um evento de auditoria via HTTP POST.
 * Nunca lança exceção — falhas são apenas logadas no console.
 */
export function auditLog(payload: AuditLogPayload): void {
  const url = `${HISTORICO_URL}/api/tenant/historico-global/logs`

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': payload.tenant_id,
      'x-internal-key': INTERNAL_KEY,
    },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.error('[audit-client] Falha ao enviar audit log:', err)
  })
}
