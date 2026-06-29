/**
 * audit-client.ts
 * Cliente leve para produtos enviarem eventos de auditoria ao historico-global.
 * Fire-and-forget: nunca lança erro, nunca bloqueia a operação principal.
 *
 * Uso:
 *   import { auditLog } from '@gravity/historico/audit-client'
 *   auditLog({ id_organizacao, tipo_ator_historico_log: 'USUARIO',
 *               id_ator_historico_log, nome_ator_historico_log,
 *               modulo_historico_log: 'pedido', tipo_recurso_historico_log: 'Pedido',
 *               acao_historico_log: 'CRIAR', detalhe_acao_historico_log: 'Criou pedido #42' })
 */

export type { AuditLogPayload, TipoAtorHistoricoLog, StatusHistoricoLog } from './audit-types.js'
import type { AuditLogPayload } from './audit-types.js'
import { persistAuditEvent } from './persist-audit-event.js'

/**
 * Enfileira um evento de auditoria.
 * Delega a `persistAuditEvent` (fila local ou HTTP S2S no Configurador).
 */
export function auditLog(payload: AuditLogPayload): void {
  persistAuditEvent(payload)
}
