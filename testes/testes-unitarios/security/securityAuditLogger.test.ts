// @vitest-environment node
/**
 * Testes unitários — securityAuditLogger.ts
 * Verifica que eventos de segurança são logados corretamente.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { securityAudit } from '../../../servicos-global/tenant/historico-global/server/lib/securityAuditLogger.js'

describe('securityAuditLogger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('permissionChanged', () => {
    it('deve logar PERMISSION_GRANTED como WARNING', async () => {
      await securityAudit.permissionChanged('tenant-A', 'admin-1', {
        targetUserId: 'user-1',
        permission: 'email:write',
        action: 'GRANTED',
      })

      expect(console.warn).toHaveBeenCalledOnce()
      const logOutput = (console.warn as any).mock.calls[0][0] as string
      expect(logOutput).toContain('PERMISSION_GRANTED')
      expect(logOutput).toContain('tenant-A')
    })

    it('deve logar PERMISSION_REVOKED como WARNING', async () => {
      await securityAudit.permissionChanged('tenant-A', 'admin-1', {
        targetUserId: 'user-1',
        permission: 'dashboard:read',
        action: 'REVOKED',
      })

      expect(console.warn).toHaveBeenCalledOnce()
      const logOutput = (console.warn as any).mock.calls[0][0] as string
      expect(logOutput).toContain('PERMISSION_REVOKED')
    })
  })

  describe('roleChanged', () => {
    it('deve logar como CRITICAL', async () => {
      await securityAudit.roleChanged('tenant-A', 'master-1', {
        targetUserId: 'user-1',
        oldRole: 'STANDARD',
        newRole: 'ADMIN',
      })

      expect(console.error).toHaveBeenCalledOnce()
      const logOutput = (console.error as any).mock.calls[0][0] as string
      expect(logOutput).toContain('ROLE_CHANGED')
      expect(logOutput).toContain('STANDARD')
      expect(logOutput).toContain('ADMIN')
    })
  })

  describe('crossTenantAttempt', () => {
    it('deve logar como CRITICAL', async () => {
      await securityAudit.crossTenantAttempt('tenant-A', 'user-mal', {
        targetTenantId: 'tenant-B',
        resource: 'cotacao',
        blocked: true,
      })

      expect(console.error).toHaveBeenCalledOnce()
      const logOutput = (console.error as any).mock.calls[0][0] as string
      expect(logOutput).toContain('CROSS_TENANT_ATTEMPT')
      expect(logOutput).toContain('tenant-B')
    })
  })

  describe('authFailure', () => {
    it('deve logar como WARNING com IP', async () => {
      await securityAudit.authFailure('system', {
        ip: '192.168.1.1',
        reason: 'JWT expirado',
        endpoint: '/api/v1/tenants',
      })

      expect(console.warn).toHaveBeenCalledOnce()
      const logOutput = (console.warn as any).mock.calls[0][0] as string
      expect(logOutput).toContain('AUTH_FAILURE')
      expect(logOutput).toContain('192.168.1.1')
    })
  })

  describe('rateLimitHit', () => {
    it('deve logar como WARNING', async () => {
      await securityAudit.rateLimitHit('tenant-A', {
        ip: '10.0.0.1',
        endpoint: '/api/v1/plans',
        count: 31,
      })

      expect(console.warn).toHaveBeenCalledOnce()
      const logOutput = (console.warn as any).mock.calls[0][0] as string
      expect(logOutput).toContain('RATE_LIMIT_HIT')
    })
  })

  describe('credentialOperation', () => {
    it('deve logar criacao de API key como WARNING', async () => {
      await securityAudit.credentialOperation('tenant-A', 'admin-1', {
        operation: 'CREATED',
        credentialType: 'API_KEY',
        credentialId: 'key-123',
      })

      expect(console.warn).toHaveBeenCalledOnce()
      const logOutput = (console.warn as any).mock.calls[0][0] as string
      expect(logOutput).toContain('CREDENTIAL_CREATED')
    })
  })

  describe('adminAccess', () => {
    it('deve logar como INFO', async () => {
      await securityAudit.adminAccess('gravity-hq', 'admin-root', {
        targetTenantId: 'tenant-abc',
        resource: 'users',
        action: 'LIST',
      })

      expect(console.info).toHaveBeenCalledOnce()
      const logOutput = (console.info as any).mock.calls[0][0] as string
      expect(logOutput).toContain('ADMIN_ACCESS')
      expect(logOutput).toContain('tenant-abc')
    })
  })

  describe('webhookSignatureFailure', () => {
    it('deve logar como CRITICAL', async () => {
      await securityAudit.webhookSignatureFailure('system', {
        source: 'CLERK',
        ip: '52.18.93.1',
        reason: 'Svix signature mismatch',
      })

      expect(console.error).toHaveBeenCalledOnce()
      const logOutput = (console.error as any).mock.calls[0][0] as string
      expect(logOutput).toContain('WEBHOOK_SIGNATURE_FAILURE')
      expect(logOutput).toContain('CLERK')
    })
  })

  describe('dataDeleted', () => {
    it('deve logar exclusao LGPD como CRITICAL', async () => {
      await securityAudit.dataDeleted('tenant-A', 'admin-1', {
        targetUserId: 'user-old',
        tablesAffected: ['User', 'UserPermission', 'HistoryLog'],
        recordCount: 47,
        reason: 'LGPD_REQUEST',
      })

      expect(console.error).toHaveBeenCalledOnce()
      const logOutput = (console.error as any).mock.calls[0][0] as string
      expect(logOutput).toContain('DATA_DELETED')
      expect(logOutput).toContain('LGPD_REQUEST')
    })
  })

  describe('formato do log', () => {
    it('deve incluir timestamp, service e severity em todos os logs', async () => {
      await securityAudit.authFailure('system', {
        ip: '1.2.3.4',
        reason: 'test',
        endpoint: '/test',
      })

      const logOutput = (console.warn as any).mock.calls[0][0] as string
      // Log é JSON stringificado dentro do prefixo [SECURITY-AUDIT]
      expect(logOutput).toContain('[SECURITY-AUDIT]')
      expect(logOutput).toContain('"service":"security-audit"')
      expect(logOutput).toContain('"severity":"WARNING"')
      expect(logOutput).toContain('"timestamp"')
    })
  })
})
