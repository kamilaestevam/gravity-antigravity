// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// TST-UNIT-TENANT-AE-001..010
// Plano: testes/testes-unitarios/historico/_planos/alert-engine.plan.json

const { mockPrisma, MockPrismaClient } = vi.hoisted(() => {
  const mockPrisma = {
    regraAlerta: { findMany: vi.fn() },
    historicoLog: { count: vi.fn(), findMany: vi.fn() },
    eventoAlerta: { create: vi.fn() },
  }
  return { mockPrisma, MockPrismaClient: vi.fn(() => mockPrisma) }
})

vi.mock('../../../servicos-global/tenant/generated/index.js', () => ({
  PrismaClient: MockPrismaClient,
  AcaoExecutadaPor: { USUARIO: 'USUARIO', API: 'API', IA: 'IA', JOB: 'JOB', INTEGRACAO: 'INTEGRACAO' },
  AlertaStatus: { PENDENTE: 'PENDENTE', REVISADO: 'REVISADO', ESCALADO: 'ESCALADO' },
}))

const { mockDispatch } = vi.hoisted(() => ({ mockDispatch: vi.fn() }))

vi.mock('../../../servicos-global/tenant/historico-global/server/services/notification-dispatcher.js', () => ({
  NotificationDispatcher: { dispatch: mockDispatch },
}))

import { AlertEngine } from '../../../servicos-global/tenant/historico-global/server/services/alert-engine.js'
import { AcaoExecutadaPor, AlertaStatus } from '../../../servicos-global/tenant/generated/index.js'

const BASE_LOG = {
  tenant_id: 'tenant-abc',
  actor_type: 'USER',
  actor_id: 'user-123',
  actor_name: 'Test User',
  module: 'pedido',
  resource_type: 'Pedido',
  action: 'CREATE',
  action_detail: 'Criou pedido #001',
}

const BASE_RULE = {
  id: 'rule-1',
  tenant_id: 'tenant-abc',
  enabled: true,
  actor_type: null as string | null,
  action: null as string | null,
  module: null as string | null,
  threshold_count: null as number | null,
  threshold_window_seconds: null as number | null,
}

describe('AlertEngine.check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.eventoAlerta.create.mockResolvedValue({ id: 'evt-1' })
    mockDispatch.mockResolvedValue(undefined)
  })

  it('TST-UNIT-TENANT-AE-001: regras vazias → resolve sem criar nenhum evento', async () => {
    mockPrisma.regraAlerta.findMany.mockResolvedValue([])

    await AlertEngine.check(BASE_LOG as any, 'log-1')

    expect(mockPrisma.eventoAlerta.create).not.toHaveBeenCalled()
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('TST-UNIT-TENANT-AE-002: 1 regra ativa sem threshold → eventoAlerta criado e dispatch chamado', async () => {
    mockPrisma.regraAlerta.findMany.mockResolvedValue([BASE_RULE])

    await AlertEngine.check(BASE_LOG as any, 'log-1')

    expect(mockPrisma.eventoAlerta.create).toHaveBeenCalledOnce()
    expect(mockDispatch).toHaveBeenCalledOnce()
  })

  it('TST-UNIT-TENANT-AE-003: busca inclui regras globais (tenant_id null) via OR', async () => {
    mockPrisma.regraAlerta.findMany.mockResolvedValue([])

    await AlertEngine.check(BASE_LOG as any, 'log-1')

    expect(mockPrisma.regraAlerta.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([{ tenant_id: null }]),
        }),
      })
    )
  })
})

describe('AlertEngine.evaluateRule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.eventoAlerta.create.mockResolvedValue({ id: 'evt-1' })
    mockPrisma.historicoLog.count.mockResolvedValue(0)
    mockPrisma.historicoLog.findMany.mockResolvedValue([])
    mockDispatch.mockResolvedValue(undefined)
  })

  it('TST-UNIT-TENANT-AE-004: rule=null → retorna sem criar evento', async () => {
    await AlertEngine.evaluateRule(null as any, BASE_LOG as any, 'log-1')

    expect(mockPrisma.eventoAlerta.create).not.toHaveBeenCalled()
  })

  it('TST-UNIT-TENANT-AE-005: actor_type filter não bate com o log → sem evento criado', async () => {
    const rule = { ...BASE_RULE, actor_type: 'API' }

    await AlertEngine.evaluateRule(rule as any, { ...BASE_LOG, actor_type: 'USER' } as any, 'log-1')

    expect(mockPrisma.eventoAlerta.create).not.toHaveBeenCalled()
  })

  it('TST-UNIT-TENANT-AE-006: action filter não bate com o log → sem evento criado', async () => {
    const rule = { ...BASE_RULE, action: 'DELETE' }

    await AlertEngine.evaluateRule(rule as any, { ...BASE_LOG, action: 'CREATE' } as any, 'log-1')

    expect(mockPrisma.eventoAlerta.create).not.toHaveBeenCalled()
  })

  it('TST-UNIT-TENANT-AE-007: sem threshold → evento criado com AlertaStatus.PENDENTE e audit_log_ids=[logId]', async () => {
    await AlertEngine.evaluateRule(BASE_RULE as any, BASE_LOG as any, 'log-xyz')

    expect(mockPrisma.eventoAlerta.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: AlertaStatus.PENDENTE,
          audit_log_ids: ['log-xyz'],
        }),
      })
    )
  })

  it('TST-UNIT-TENANT-AE-008: sem threshold → actor_type castado para AcaoExecutadaPor.USUARIO no evento', async () => {
    const log = { ...BASE_LOG, actor_type: AcaoExecutadaPor.USUARIO }

    await AlertEngine.evaluateRule(BASE_RULE as any, log as any, 'log-1')

    expect(mockPrisma.eventoAlerta.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ actor_type: AcaoExecutadaPor.USUARIO }),
      })
    )
  })

  it('TST-UNIT-TENANT-AE-009: com threshold, count < mínimo → sem evento e sem dispatch', async () => {
    const rule = { ...BASE_RULE, threshold_count: 5, threshold_window_seconds: 60 }
    mockPrisma.historicoLog.count.mockResolvedValue(3)

    await AlertEngine.evaluateRule(rule as any, BASE_LOG as any, 'log-1')

    expect(mockPrisma.eventoAlerta.create).not.toHaveBeenCalled()
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('TST-UNIT-TENANT-AE-010: com threshold, count >= mínimo → evento criado com AlertaStatus.PENDENTE', async () => {
    const rule = { ...BASE_RULE, threshold_count: 5, threshold_window_seconds: 60 }
    mockPrisma.historicoLog.count.mockResolvedValue(5)
    mockPrisma.historicoLog.findMany.mockResolvedValue([{ id: 'l1' }, { id: 'l2' }])

    await AlertEngine.evaluateRule(rule as any, BASE_LOG as any, 'log-1')

    expect(mockPrisma.eventoAlerta.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: AlertaStatus.PENDENTE,
          event_count: 5,
        }),
      })
    )
    expect(mockDispatch).toHaveBeenCalledOnce()
  })
})
