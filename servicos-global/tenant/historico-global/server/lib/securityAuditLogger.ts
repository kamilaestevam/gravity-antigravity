/**
 * securityAuditLogger.ts — Logger de eventos de seguranca
 *
 * Complementa o HistoryLog existente com eventos especificos de seguranca.
 * Cada funcao loga no formato padrao do servico de historico.
 *
 * Uso em qualquer servico:
 *   import { securityAudit } from '@tenant/historico-global/server/lib/securityAuditLogger'
 *   securityAudit.permissionChanged(tenantId, actorId, { ... })
 */

import { randomUUID } from 'crypto'

interface SecurityEvent {
  tenant_id: string
  actor_id: string
  actor_type: 'USER' | 'SYSTEM' | 'GABI_IA' | 'ADMIN'
  action: string
  user_id?: string
  product_id?: string
  metadata: Record<string, unknown>
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  correlation_id?: string
}

// Em producao, enviar para o servico de historico via HTTP.
// Em dev, logar no console com formato estruturado.
async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const logEntry = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    ...event,
  }

  // Log estruturado (sempre — para centralizacao futura via Sentry/DataDog)
  const logLine = JSON.stringify({
    level: event.severity === 'CRITICAL' ? 'error' : event.severity === 'WARNING' ? 'warn' : 'info',
    service: 'security-audit',
    ...logEntry,
  })

  if (event.severity === 'CRITICAL') {
    console.error(`[SECURITY-AUDIT] ${logLine}`)
  } else if (event.severity === 'WARNING') {
    console.warn(`[SECURITY-AUDIT] ${logLine}`)
  } else {
    console.info(`[SECURITY-AUDIT] ${logLine}`)
  }

  // Em producao: enviar para servico de historico
  const historicoUrl = process.env.HISTORICO_SERVICE_URL
  if (historicoUrl && process.env.NODE_ENV === 'production') {
    try {
      await fetch(`${historicoUrl}/api/v1/historico/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': process.env.INTERNAL_SERVICE_KEY || '',
          'x-tenant-id': event.tenant_id,
          'x-correlation-id': event.correlation_id || randomUUID(),
        },
        body: JSON.stringify({
          actor_id: event.actor_id,
          actor_type: event.actor_type,
          action: event.action,
          user_id: event.user_id,
          product_id: event.product_id,
          metadata: {
            ...event.metadata,
            severity: event.severity,
            security_event: true,
          },
        }),
      })
    } catch {
      // Nao bloquear a operacao se o log falhar
      console.error('[SECURITY-AUDIT] Falha ao enviar para servico de historico')
    }
  }
}

export const securityAudit = {
  /** Mudanca de permissao de usuario */
  permissionChanged(tenantId: string, actorId: string, details: {
    targetUserId: string
    permission: string
    action: 'GRANTED' | 'REVOKED'
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: actorId,
      actor_type: 'USER',
      action: `PERMISSION_${details.action}`,
      user_id: details.targetUserId,
      severity: 'WARNING',
      metadata: { permission: details.permission, action: details.action },
    })
  },

  /** Atribuicao/remocao de role */
  roleChanged(tenantId: string, actorId: string, details: {
    targetUserId: string
    oldRole: string
    newRole: string
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: actorId,
      actor_type: 'USER',
      action: 'ROLE_CHANGED',
      user_id: details.targetUserId,
      severity: 'CRITICAL',
      metadata: { oldRole: details.oldRole, newRole: details.newRole },
    })
  },

  /** Tentativa de acesso cross-tenant */
  crossTenantAttempt(tenantId: string, actorId: string, details: {
    targetTenantId: string
    resource: string
    blocked: boolean
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: actorId,
      actor_type: 'USER',
      action: 'CROSS_TENANT_ATTEMPT',
      severity: 'CRITICAL',
      metadata: details,
    })
  },

  /** Falha de autenticacao */
  authFailure(tenantId: string, details: {
    ip: string
    reason: string
    endpoint: string
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: 'anonymous',
      actor_type: 'SYSTEM',
      action: 'AUTH_FAILURE',
      severity: 'WARNING',
      metadata: details,
    })
  },

  /** Rate limit atingido */
  rateLimitHit(tenantId: string, details: {
    ip: string
    endpoint: string
    count: number
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: 'system',
      actor_type: 'SYSTEM',
      action: 'RATE_LIMIT_HIT',
      severity: 'WARNING',
      metadata: details,
    })
  },

  /** Operacao em credenciais (create/update/revoke API key, service token) */
  credentialOperation(tenantId: string, actorId: string, details: {
    operation: 'CREATED' | 'REVOKED' | 'ROTATED'
    credentialType: 'API_KEY' | 'SERVICE_TOKEN' | 'INTERNAL_KEY'
    credentialId?: string
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: actorId,
      actor_type: 'USER',
      action: `CREDENTIAL_${details.operation}`,
      severity: 'WARNING',
      metadata: details,
    })
  },

  /** Acesso administrativo a dados de outro tenant */
  adminAccess(tenantId: string, adminId: string, details: {
    targetTenantId: string
    resource: string
    action: string
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: adminId,
      actor_type: 'ADMIN',
      action: 'ADMIN_ACCESS',
      severity: 'INFO',
      metadata: details,
    })
  },

  /** Webhook com assinatura invalida */
  webhookSignatureFailure(tenantId: string, details: {
    source: 'CLERK' | 'STRIPE' | 'RESEND' | 'WHATSAPP'
    ip: string
    reason: string
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: 'webhook',
      actor_type: 'SYSTEM',
      action: 'WEBHOOK_SIGNATURE_FAILURE',
      severity: 'CRITICAL',
      metadata: details,
    })
  },

  /** Exclusao de dados (LGPD) */
  dataDeleted(tenantId: string, actorId: string, details: {
    targetUserId: string
    tablesAffected: string[]
    recordCount: number
    reason: 'LGPD_REQUEST' | 'ADMIN_ACTION' | 'ACCOUNT_CLOSURE'
  }) {
    return logSecurityEvent({
      tenant_id: tenantId,
      actor_id: actorId,
      actor_type: 'ADMIN',
      action: 'DATA_DELETED',
      user_id: details.targetUserId,
      severity: 'CRITICAL',
      metadata: details,
    })
  },
}
