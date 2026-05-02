/**
 * securityAuditLogger.ts — Logger de eventos de segurança
 *
 * Encaminha todos os eventos de segurança para o AuditService,
 * que os grava via fila PG Boss de forma assíncrona.
 *
 * Também persiste na tabela SecurityEvent do Configurador para
 * alimentar o painel /admin/seguranca.
 *
 * Uso:
 *   import { securityAudit } from '@tenant/historico-global/server/lib/securityAuditLogger'
 *   securityAudit.permissionChanged(idOrganizacao, idAtor, { ... })
 */

import { randomUUID } from 'crypto'
import { AuditService } from '../services/audit.service.js'
import { AcaoExecutadaPor, EventoStatus } from '../../../generated/index.js'

const CONFIGURADOR_URL = process.env.CONFIGURADOR_URL || process.env.CONFIGURADOR_SERVICE_URL || ''
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY || ''

interface SecurityEventInput {
  id_organizacao: string
  id_ator_historico_log: string
  tipo_ator_historico_log: AcaoExecutadaPor
  acao_historico_log: string
  modulo_historico_log?: string
  id_usuario?: string
  id_produto_historico_log?: string
  ip_ator_historico_log?: string
  metadata: Record<string, unknown>
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  correlation_id?: string
}

async function logSecurityEvent(event: SecurityEventInput): Promise<void> {
  // 1. Gravar no audit trail imutável via AuditService (assíncrono)
  await AuditService.log({
    id_organizacao: event.id_organizacao,
    tipo_ator_historico_log: event.tipo_ator_historico_log,
    id_ator_historico_log: event.id_ator_historico_log,
    nome_ator_historico_log: event.id_ator_historico_log,
    ip_ator_historico_log: event.ip_ator_historico_log,
    metadata_ator_historico_log: { severity: event.severity, ...event.metadata },
    modulo_historico_log: event.modulo_historico_log ?? 'auth',
    tipo_recurso_historico_log: 'security_event',
    acao_historico_log: event.acao_historico_log,
    detalhe_acao_historico_log: `${event.acao_historico_log}: ${JSON.stringify(event.metadata).slice(0, 200)}`,
    status_historico_log: event.metadata?.blocked ? EventoStatus.FALHA : EventoStatus.SUCESSO,
    id_usuario: event.id_usuario,
    id_produto_historico_log: event.id_produto_historico_log,
  })

  // 2. Persistir na tabela SecurityEvent do Configurador (fire-and-forget)
  // Usa a rota INTERNA /api/v1/internal/eventos-seguranca que valida x-internal-key.
  // A rota /api/v1/admin/seguranca-admin (admin) está atrás de requireAuth+
  // requireGravityAdmin e caía em 401 para esta chamada S2S, quebrando o
  // audit trail silenciosamente.
  if (CONFIGURADOR_URL) {
    const ipFromMetadata = typeof event.metadata?.ip === 'string' ? event.metadata.ip : undefined
    const endpointFromMetadata = typeof event.metadata?.endpoint === 'string' ? event.metadata.endpoint : undefined
    fetch(`${CONFIGURADOR_URL}/api/v1/internal/eventos-seguranca`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': INTERNAL_KEY,
        'x-correlation-id': event.correlation_id ?? randomUUID(),
      },
      body: JSON.stringify({
        id_organizacao: event.id_organizacao,
        id_ator_historico_log: event.id_ator_historico_log,
        tipo_ator_historico_log: event.tipo_ator_historico_log,
        acao_historico_log: event.acao_historico_log,
        severity: event.severity,
        status: event.metadata?.blocked ? 'BLOCKED' : 'DETECTED',
        description: `${event.acao_historico_log}: ${JSON.stringify(event.metadata)}`.slice(0, 500),
        ip: event.ip_ator_historico_log ?? ipFromMetadata,
        endpoint: endpointFromMetadata,
        id_usuario: event.id_usuario,
        id_produto_historico_log: event.id_produto_historico_log,
        correlation_id: event.correlation_id,
        metadata: event.metadata,
      }),
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : 'unknown'
      console.error(`[securityAudit] Falha ao persistir no Configurador: ${msg}`)
    })
  }
}

export const securityAudit = {
  permissionChanged(id_organizacao: string, actorId: string, details: {
    targetUserId: string
    permission: string
    action: 'GRANTED' | 'REVOKED'
  }) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log: actorId,
      tipo_ator_historico_log: AcaoExecutadaPor.USUARIO,
      acao_historico_log: `PERMISSION_${details.action}`,
      modulo_historico_log: 'configuracao',
      id_usuario: details.targetUserId,
      severity: 'WARNING',
      metadata: { permission: details.permission, action: details.action },
    })
  },

  roleChanged(id_organizacao: string, actorId: string, details: {
    targetUserId: string
    oldRole: string
    newRole: string
  }) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log: actorId,
      tipo_ator_historico_log: AcaoExecutadaPor.USUARIO,
      acao_historico_log: 'ROLE_CHANGED',
      modulo_historico_log: 'configuracao',
      id_usuario: details.targetUserId,
      severity: 'CRITICAL',
      metadata: { oldRole: details.oldRole, newRole: details.newRole },
    })
  },

  crossTenantAttempt(id_organizacao: string, actorId: string, details: {
    targetTenantId: string
    resource: string
    blocked: boolean
  }) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log: actorId,
      tipo_ator_historico_log: AcaoExecutadaPor.USUARIO,
      acao_historico_log: 'CROSS_TENANT_ATTEMPT',
      modulo_historico_log: 'auth',
      severity: 'CRITICAL',
      metadata: details,
    })
  },

  authFailure(id_organizacao: string, details: {
    ip: string
    reason: string
    endpoint: string
  }) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log: 'anonymous',
      tipo_ator_historico_log: AcaoExecutadaPor.USUARIO,
      acao_historico_log: 'AUTH_FAILURE',
      modulo_historico_log: 'auth',
      ip_ator_historico_log: details.ip,
      severity: 'WARNING',
      metadata: details,
    })
  },

  rateLimitHit(id_organizacao: string, details: {
    ip: string
    endpoint: string
    count: number
  }) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log: 'system',
      tipo_ator_historico_log: AcaoExecutadaPor.INTEGRACAO,
      acao_historico_log: 'RATE_LIMIT_HIT',
      modulo_historico_log: 'auth',
      ip_ator_historico_log: details.ip,
      severity: 'WARNING',
      metadata: details,
    })
  },

  credentialOperation(id_organizacao: string, actorId: string, details: {
    operation: 'CREATED' | 'REVOKED' | 'ROTATED'
    credentialType: 'API_KEY' | 'SERVICE_TOKEN' | 'INTERNAL_KEY'
    credentialId?: string
  }) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log: actorId,
      tipo_ator_historico_log: AcaoExecutadaPor.USUARIO,
      acao_historico_log: `CREDENTIAL_${details.operation}`,
      modulo_historico_log: 'configuracao',
      severity: 'WARNING',
      metadata: details,
    })
  },

  adminAccess(id_organizacao: string, adminId: string, details: {
    targetTenantId: string
    resource: string
    action: string
  }) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log: adminId,
      tipo_ator_historico_log: AcaoExecutadaPor.USUARIO,
      acao_historico_log: 'ADMIN_ACCESS',
      modulo_historico_log: 'admin',
      severity: 'INFO',
      metadata: details,
    })
  },

  webhookSignatureFailure(id_organizacao: string, details: {
    source: 'CLERK' | 'STRIPE' | 'RESEND' | 'WHATSAPP'
    ip: string
    reason: string
  }) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log: 'webhook',
      tipo_ator_historico_log: AcaoExecutadaPor.INTEGRACAO,
      acao_historico_log: 'WEBHOOK_SIGNATURE_FAILURE',
      modulo_historico_log: 'auth',
      ip_ator_historico_log: details.ip,
      severity: 'CRITICAL',
      metadata: details,
    })
  },

  dataDeleted(id_organizacao: string, actorId: string, details: {
    targetUserId: string
    tablesAffected: string[]
    recordCount: number
    reason: 'LGPD_REQUEST' | 'ADMIN_ACTION' | 'ACCOUNT_CLOSURE'
  }) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log: actorId,
      tipo_ator_historico_log: AcaoExecutadaPor.USUARIO,
      acao_historico_log: 'DATA_DELETED',
      modulo_historico_log: 'admin',
      id_usuario: details.targetUserId,
      severity: 'CRITICAL',
      metadata: details,
    })
  },

  apiKeyUsed(id_organizacao: string, apiKeyId: string, details: {
    module: string
    endpoint: string
    ip: string
  }) {
    return logSecurityEvent({
      id_organizacao,
      id_ator_historico_log: apiKeyId,
      tipo_ator_historico_log: AcaoExecutadaPor.API,
      acao_historico_log: 'API_CALL',
      modulo_historico_log: details.module,
      ip_ator_historico_log: details.ip,
      severity: 'INFO',
      metadata: details,
    })
  },
}
