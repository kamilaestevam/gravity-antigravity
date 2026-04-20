// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// TST-UNIT-TENANT-SAL-001..008
// Plano: testes/testes-unitarios/historico/_planos/securityAuditLogger.plan.json

const { mockAuditLog } = vi.hoisted(() => ({
  mockAuditLog: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../servicos-global/tenant/historico-global/server/services/audit.service.js', () => ({
  AuditService: { log: mockAuditLog },
}))

vi.mock('../../../servicos-global/tenant/generated/index.js', () => ({
  TipoAtor: { USER: 'USER', API: 'API', AI: 'AI', JOB: 'JOB', INTEGRATION: 'INTEGRATION' },
  StatusEvento: { SUCCESS: 'SUCCESS', FAILURE: 'FAILURE', PARTIAL: 'PARTIAL' },
}))

import { securityAudit } from '../../../servicos-global/tenant/historico-global/server/lib/securityAuditLogger.js'
import { TipoAtor, StatusEvento } from '../../../servicos-global/tenant/generated/index.js'

describe('securityAudit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('TST-UNIT-TENANT-SAL-001: permissionChanged → AuditService.log com actor_type=TipoAtor.USER', async () => {
    await securityAudit.permissionChanged('t-1', 'u-1', {
      targetUserId: 'u-2',
      permission: 'pedido:create',
      action: 'GRANTED',
    })

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ actor_type: TipoAtor.USER })
    )
  })

  it('TST-UNIT-TENANT-SAL-002: rateLimitHit → AuditService.log com actor_type=TipoAtor.INTEGRATION', async () => {
    await securityAudit.rateLimitHit('t-1', {
      ip: '1.2.3.4',
      endpoint: '/api/test',
      count: 10,
    })

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ actor_type: TipoAtor.INTEGRATION })
    )
  })

  it('TST-UNIT-TENANT-SAL-003: apiKeyUsed → AuditService.log com actor_type=TipoAtor.API', async () => {
    await securityAudit.apiKeyUsed('t-1', 'key-abc', {
      module: 'pedido',
      endpoint: '/api/pedidos',
      ip: '1.2.3.4',
    })

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ actor_type: TipoAtor.API })
    )
  })

  it('TST-UNIT-TENANT-SAL-004: webhookSignatureFailure → AuditService.log com actor_type=TipoAtor.INTEGRATION', async () => {
    await securityAudit.webhookSignatureFailure('t-1', {
      source: 'STRIPE',
      ip: '54.1.2.3',
      reason: 'invalid signature',
    })

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ actor_type: TipoAtor.INTEGRATION })
    )
  })

  it('TST-UNIT-TENANT-SAL-005: crossTenantAttempt com blocked=true → status=StatusEvento.FAILURE', async () => {
    await securityAudit.crossTenantAttempt('t-1', 'u-1', {
      targetTenantId: 't-2',
      resource: 'pedido',
      blocked: true,
    })

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ status: StatusEvento.FAILURE })
    )
  })

  it('TST-UNIT-TENANT-SAL-006: authFailure sem blocked → status=StatusEvento.SUCCESS', async () => {
    await securityAudit.authFailure('t-1', {
      ip: '1.2.3.4',
      reason: 'invalid token',
      endpoint: '/api/me',
    })

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ status: StatusEvento.SUCCESS })
    )
  })

  it('TST-UNIT-TENANT-SAL-007: dataDeleted → actor_type=TipoAtor.USER e module=admin', async () => {
    await securityAudit.dataDeleted('t-1', 'admin-1', {
      targetUserId: 'u-2',
      tablesAffected: ['pedido', 'item_pedido'],
      recordCount: 150,
      reason: 'LGPD_REQUEST',
    })

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_type: TipoAtor.USER,
        module: 'admin',
      })
    )
  })

  it('TST-UNIT-TENANT-SAL-008: sem CONFIGURADOR_URL (env não definido) → fetch não é chamado', async () => {
    await securityAudit.adminAccess('t-1', 'admin-1', {
      targetTenantId: 't-2',
      resource: 'configuracoes',
      action: 'READ',
    })

    expect(mockAuditLog).toHaveBeenCalledOnce()
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
