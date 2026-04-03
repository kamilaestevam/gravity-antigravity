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
 *   securityAudit.permissionChanged(tenantId, actorId, { ... })
 */

import { randomUUID } from 'crypto'
import { AuditService } from '../services/audit.service.js'
import { ActorType, EventStatus } from '../../../generated/index.js'

const CONFIGURADOR_URL = process.env.CONFIGURADOR_URL || process.env.CONFIGURADOR_SERVICE_URL || ''
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY || ''

interface SecurityEventInput {
  tenant_id: string
  actor_id: string
  actor_type: ActorType
  action: string
  module?: string
  user_id?: string
  product_id?: string
  actor_ip?: string
  metadata: Record<string, unknown>
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  correlation_id?: string
}

async function logSecurityEvent(event: SecurityEventInput): Promise<void> {
  // 1. Gravar no audit trail imutável via AuditService (assíncrono)
  await AuditService.log({
    tenant_id: event.tenant_id,
    actor_type: event.actor_type,
    actor_id: event.actor_id,
    actor_name: event.actor_id,
    actor_ip: event.actor_ip,
    actor_metadata: { severity: event.severity, ...event.metadata },
    module: event.module ?? 'auth',
    resource_type: 'security_event',
    action: event.action,
    action_detail: `${event.action}: ${JSON.stringify(event.metadata).slice(0, 200)}`,
    status: event.metadata?.blocked ? EventStatus.FAILURE : EventStatus.SUCCESS,
    user_id: event.user_id,
    product_id: event.product_id,
  })

  // 2. Persistir na tabela SecurityEvent do Configurador (fire-and-forget)
  if (CONFIGURADOR_URL) {
    fetch(`${CONFIGURADOR_URL}/api/admin/security/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': INTERNAL_KEY,
        'x-correlation-id': event.correlation_id ?? randomUUID(),
      },
      body: JSON.stringify({
        tenant_id: event.tenant_id,
        actor_id: event.actor_id,
        actor_type: event.actor_type,
        action: event.action,
        severity: event.severity,
        status: event.metadata?.blocked ? 'BLOCKED' : 'DETECTED',
        description: `${event.action}: ${JSON.stringify(event.metadata)}`.slice(0, 500),
        ip: event.actor_ip ?? event.metadata?.ip,
        endpoint: event.metadata?.endpoint,
        user_id: event.user_id,
        product_id: event.product_id,
        correlation_id: event.correlation_id,
        metadata: event.metadata,
      }),
    }).catch(() => {
      console.error('[securityAudit] Falha ao persistir no Configurador')
    })
  }
}

export const securityAudit = {
  permissionChanged(tenantId: string, actorId: string, details: {
    targetUserId: string
    permission: string
    action: 'GRANTED' | 'REVOKED'
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: actorId,
      actor_type: ActorType.USER,
      action: `PERMISSION_${details.action}`,
      module: 'configuracao',
      user_id: details.targetUserId,
      severity: 'WARNING',
      metadata: { permission: details.permission, action: details.action },
    })
  },

  roleChanged(tenantId: string, actorId: string, details: {
    targetUserId: string
    oldRole: string
    newRole: string
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: actorId,
      actor_type: ActorType.USER,
      action: 'ROLE_CHANGED',
      module: 'configuracao',
      user_id: details.targetUserId,
      severity: 'CRITICAL',
      metadata: { oldRole: details.oldRole, newRole: details.newRole },
    })
  },

  crossTenantAttempt(tenantId: string, actorId: string, details: {
    targetTenantId: string
    resource: string
    blocked: boolean
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: actorId,
      actor_type: ActorType.USER,
      action: 'CROSS_TENANT_ATTEMPT',
      module: 'auth',
      severity: 'CRITICAL',
      metadata: details,
    })
  },

  authFailure(tenantId: string, details: {
    ip: string
    reason: string
    endpoint: string
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: 'anonymous',
      actor_type: ActorType.USER,
      action: 'AUTH_FAILURE',
      module: 'auth',
      actor_ip: details.ip,
      severity: 'WARNING',
      metadata: details,
    })
  },

  rateLimitHit(tenantId: string, details: {
    ip: string
    endpoint: string
    count: number
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: 'system',
      actor_type: ActorType.INTEGRATION,
      action: 'RATE_LIMIT_HIT',
      module: 'auth',
      actor_ip: details.ip,
      severity: 'WARNING',
      metadata: details,
    })
  },

  credentialOperation(tenantId: string, actorId: string, details: {
    operation: 'CREATED' | 'REVOKED' | 'ROTATED'
    credentialType: 'API_KEY' | 'SERVICE_TOKEN' | 'INTERNAL_KEY'
    credentialId?: string
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: actorId,
      actor_type: ActorType.USER,
      action: `CREDENTIAL_${details.operation}`,
      module: 'configuracao',
      severity: 'WARNING',
      metadata: details,
    })
  },

  adminAccess(tenantId: string, adminId: string, details: {
    targetTenantId: string
    resource: string
    action: string
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: adminId,
      actor_type: ActorType.USER,
      action: 'ADMIN_ACCESS',
      module: 'admin',
      severity: 'INFO',
      metadata: details,
    })
  },

  webhookSignatureFailure(tenantId: string, details: {
    source: 'CLERK' | 'STRIPE' | 'RESEND' | 'WHATSAPP'
    ip: string
    reason: string
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: 'webhook',
      actor_type: ActorType.INTEGRATION,
      action: 'WEBHOOK_SIGNATURE_FAILURE',
      module: 'auth',
      actor_ip: details.ip,
      severity: 'CRITICAL',
      metadata: details,
    })
  },

  dataDeleted(tenantId: string, actorId: string, details: {
    targetUserId: string
    tablesAffected: string[]
    recordCount: number
    reason: 'LGPD_REQUEST' | 'ADMIN_ACTION' | 'ACCOUNT_CLOSURE'
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: actorId,
      actor_type: ActorType.USER,
      action: 'DATA_DELETED',
      module: 'admin',
      user_id: details.targetUserId,
      severity: 'CRITICAL',
      metadata: details,
    })
  },

  apiKeyUsed(tenantId: string, apiKeyId: string, details: {
    module: string
    endpoint: string
    ip: string
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: apiKeyId,
      actor_type: ActorType.API,
      action: 'API_CALL',
      module: details.module,
      actor_ip: details.ip,
      severity: 'INFO',
      metadata: details,
    })
  },
}
