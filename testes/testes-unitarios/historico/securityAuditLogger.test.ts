// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// TST-UNIT-TENANT-SAL-001..008
// Plano: testes/testes-unitarios/historico/_planos/securityAuditLogger.plan.json

const { mockAuditLog } = vi.hoisted(() => ({
  mockAuditLog: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../servicos-global/organizacao/historico-global/server/services/audit.service.js', () => ({
  AuditService: { log: mockAuditLog },
}))

vi.mock('../../../servicos-global/tenant/generated/index.js', () => ({
  AcaoExecutadaPor: { USUARIO: 'USUARIO', API: 'API', IA: 'IA', JOB: 'JOB', INTEGRACAO: 'INTEGRACAO' },
  EventoStatus: { SUCESSO: 'SUCESSO', FALHA: 'FALHA', PARCIAL: 'PARCIAL' },
}))

import { securityAudit } from '../../../servicos-global/organizacao/historico-global/server/lib/securityAuditLogger.js'
import { AcaoExecutadaPor, EventoStatus } from '../../../servicos-global/tenant/generated/index.js'

describe('securityAudit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('TST-UNIT-TENANT-SAL-001: permissionChanged → AuditService.log com actor_type=AcaoExecutadaPor.USUARIO', async () => {
    await securityAudit.permissionChanged('t-1', 'u-1', {
      targetUserId: 'u-2',
      permission: 'pedido:create',
      action: 'GRANTED',
    })

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ actor_type: AcaoExecutadaPor.USUARIO })
    )
  })

  it('TST-UNIT-TENANT-SAL-002: rateLimitHit → AuditService.log com actor_type=AcaoExecutadaPor.INTEGRACAO', async () => {
    await securityAudit.rateLimitHit('t-1', {
      ip: '1.2.3.4',
      endpoint: '/api/test',
      count: 10,
    })

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ actor_type: AcaoExecutadaPor.INTEGRACAO })
    )
  })

  it('TST-UNIT-TENANT-SAL-003: apiKeyUsed → AuditService.log com actor_type=AcaoExecutadaPor.API', async () => {
    await securityAudit.apiKeyUsed('t-1', 'key-abc', {
      module: 'pedido',
      endpoint: '/api/pedidos',
      ip: '1.2.3.4',
    })

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ actor_type: AcaoExecutadaPor.API })
    )
  })

  it('TST-UNIT-TENANT-SAL-004: webhookSignatureFailure → AuditService.log com actor_type=AcaoExecutadaPor.INTEGRACAO', async () => {
    await securityAudit.webhookSignatureFailure('t-1', {
      source: 'STRIPE',
      ip: '54.1.2.3',
      reason: 'invalid signature',
    })

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ actor_type: AcaoExecutadaPor.INTEGRACAO })
    )
  })

  it('TST-UNIT-TENANT-SAL-005: crossTenantAttempt com blocked=true → status=EventoStatus.FALHA', async () => {
    await securityAudit.crossTenantAttempt('t-1', 'u-1', {
      targetTenantId: 't-2',
      resource: 'pedido',
      blocked: true,
    })

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ status: EventoStatus.FALHA })
    )
  })

  it('TST-UNIT-TENANT-SAL-006: authFailure sem blocked → status=EventoStatus.SUCESSO', async () => {
    await securityAudit.authFailure('t-1', {
      ip: '1.2.3.4',
      reason: 'invalid token',
      endpoint: '/api/me',
    })

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ status: EventoStatus.SUCESSO })
    )
  })

  it('TST-UNIT-TENANT-SAL-007: dataDeleted → actor_type=AcaoExecutadaPor.USUARIO e module=admin', async () => {
    await securityAudit.dataDeleted('t-1', 'admin-1', {
      targetUserId: 'u-2',
      tablesAffected: ['pedido', 'item_pedido'],
      recordCount: 150,
      reason: 'LGPD_REQUEST',
    })

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_type: AcaoExecutadaPor.USUARIO,
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
