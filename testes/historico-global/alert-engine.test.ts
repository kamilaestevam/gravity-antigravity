// testes/historico-global/alert-engine.test.ts
// Testes unitários do AlertEngine — lógica de avaliação de regras.

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────────

const mockPrisma = {
  alertRule: { findMany: vi.fn() },
  historyLog: { count: vi.fn(), findMany: vi.fn() },
  alertEvent: { create: vi.fn() },
}

vi.mock('../../servicos-global/tenant/generated/index.js', () => ({
  PrismaClient: vi.fn().mockImplementation(() => mockPrisma),
  ActorType: { USER: 'USER', API: 'API', AI: 'AI', JOB: 'JOB', INTEGRATION: 'INTEGRATION' },
  AlertStatus: { PENDING: 'PENDING', REVIEWED: 'REVIEWED', ESCALATED: 'ESCALATED' },
}))

vi.mock(
  '../../servicos-global/tenant/historico-global/server/services/notification-dispatcher.js',
  () => ({ NotificationDispatcher: { dispatch: vi.fn().mockResolvedValue(undefined) } })
)

const baseLog = {
  tenant_id: 'tenant-test',
  actor_type: 'USER' as const,
  actor_id: 'user-1',
  actor_name: 'João',
  module: 'pedido',
  resource_type: 'Pedido',
  action: 'DELETE',
  action_detail: 'Deletou pedido',
}

// ── Testes ────────────────────────────────────────────────────────

describe('AlertEngine.check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.alertEvent.create.mockResolvedValue({ id: 'alert-new' })
  })

  it('não dispara alerta quando nenhuma regra está ativa', async () => {
    mockPrisma.alertRule.findMany.mockResolvedValue([])
    const { AlertEngine } = await import(
      '../../servicos-global/tenant/historico-global/server/services/alert-engine.js'
    )
    await AlertEngine.check(baseLog, 'log-1')
    expect(mockPrisma.alertEvent.create).not.toHaveBeenCalled()
  })

  it('dispara alerta para regra sem threshold (dispara sempre)', async () => {
    mockPrisma.alertRule.findMany.mockResolvedValue([
      {
        id: 'rule-1',
        tenant_id: 'tenant-test',
        enabled: true,
        actor_type: 'USER',
        action: 'DELETE',
        module: null,
        threshold_count: null,
        threshold_window_seconds: null,
        channel_inapp: true,
        channel_email: false,
        channel_whatsapp: false,
        recipients_email: [],
        recipients_whatsapp: [],
        recipients_user_ids: [],
      },
    ])
    const { AlertEngine } = await import(
      '../../servicos-global/tenant/historico-global/server/services/alert-engine.js'
    )
    await AlertEngine.check(baseLog, 'log-1')
    expect(mockPrisma.alertEvent.create).toHaveBeenCalledOnce()
    expect(mockPrisma.alertEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          event_count: 1,
          window_seconds: 0,
          audit_log_ids: ['log-1'],
        }),
      })
    )
  })

  it('não dispara alerta quando filtro de module não bate', async () => {
    mockPrisma.alertRule.findMany.mockResolvedValue([
      {
        id: 'rule-2',
        tenant_id: null,
        enabled: true,
        actor_type: null,
        action: null,
        module: 'email', // diferente do log (pedido)
        threshold_count: null,
        threshold_window_seconds: null,
        channel_inapp: true,
        channel_email: false,
        channel_whatsapp: false,
        recipients_email: [],
        recipients_whatsapp: [],
        recipients_user_ids: [],
      },
    ])
    const { AlertEngine } = await import(
      '../../servicos-global/tenant/historico-global/server/services/alert-engine.js'
    )
    await AlertEngine.check(baseLog, 'log-1')
    expect(mockPrisma.alertEvent.create).not.toHaveBeenCalled()
  })

  it('não dispara alerta de threshold quando count < threshold', async () => {
    mockPrisma.alertRule.findMany.mockResolvedValue([
      {
        id: 'rule-3',
        tenant_id: null,
        enabled: true,
        actor_type: 'USER',
        action: 'DELETE',
        module: null,
        threshold_count: 10,
        threshold_window_seconds: 60,
        channel_inapp: true,
        channel_email: false,
        channel_whatsapp: false,
        recipients_email: [],
        recipients_whatsapp: [],
        recipients_user_ids: [],
      },
    ])
    mockPrisma.historyLog.count.mockResolvedValue(5) // abaixo do threshold de 10

    const { AlertEngine } = await import(
      '../../servicos-global/tenant/historico-global/server/services/alert-engine.js'
    )
    await AlertEngine.check(baseLog, 'log-1')
    expect(mockPrisma.alertEvent.create).not.toHaveBeenCalled()
  })

  it('dispara alerta de threshold quando count >= threshold', async () => {
    mockPrisma.alertRule.findMany.mockResolvedValue([
      {
        id: 'rule-4',
        tenant_id: null,
        enabled: true,
        actor_type: 'USER',
        action: 'DELETE',
        module: null,
        threshold_count: 10,
        threshold_window_seconds: 60,
        channel_inapp: true,
        channel_email: false,
        channel_whatsapp: false,
        recipients_email: [],
        recipients_whatsapp: [],
        recipients_user_ids: [],
      },
    ])
    mockPrisma.historyLog.count.mockResolvedValue(12) // acima do threshold
    mockPrisma.historyLog.findMany.mockResolvedValue([
      { id: 'log-a' }, { id: 'log-b' },
    ])

    const { AlertEngine } = await import(
      '../../servicos-global/tenant/historico-global/server/services/alert-engine.js'
    )
    await AlertEngine.check(baseLog, 'log-1')
    expect(mockPrisma.alertEvent.create).toHaveBeenCalledOnce()
    expect(mockPrisma.alertEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          event_count: 12,
          window_seconds: 60,
        }),
      })
    )
  })

  it('não dispara alerta quando actor_type não bate', async () => {
    mockPrisma.alertRule.findMany.mockResolvedValue([
      {
        id: 'rule-5',
        tenant_id: null,
        enabled: true,
        actor_type: 'AI', // log é USER
        action: null,
        module: null,
        threshold_count: null,
        threshold_window_seconds: null,
        channel_inapp: true,
        channel_email: false,
        channel_whatsapp: false,
        recipients_email: [],
        recipients_whatsapp: [],
        recipients_user_ids: [],
      },
    ])
    const { AlertEngine } = await import(
      '../../servicos-global/tenant/historico-global/server/services/alert-engine.js'
    )
    await AlertEngine.check(baseLog, 'log-1')
    expect(mockPrisma.alertEvent.create).not.toHaveBeenCalled()
  })

  it('avalia múltiplas regras em paralelo', async () => {
    mockPrisma.alertRule.findMany.mockResolvedValue([
      {
        id: 'rule-a', tenant_id: null, enabled: true,
        actor_type: null, action: null, module: null,
        threshold_count: null, threshold_window_seconds: null,
        channel_inapp: true, channel_email: false, channel_whatsapp: false,
        recipients_email: [], recipients_whatsapp: [], recipients_user_ids: [],
      },
      {
        id: 'rule-b', tenant_id: null, enabled: true,
        actor_type: null, action: null, module: null,
        threshold_count: null, threshold_window_seconds: null,
        channel_inapp: true, channel_email: false, channel_whatsapp: false,
        recipients_email: [], recipients_whatsapp: [], recipients_user_ids: [],
      },
    ])
    const { AlertEngine } = await import(
      '../../servicos-global/tenant/historico-global/server/services/alert-engine.js'
    )
    await AlertEngine.check(baseLog, 'log-1')
    expect(mockPrisma.alertEvent.create).toHaveBeenCalledTimes(2)
  })
})
