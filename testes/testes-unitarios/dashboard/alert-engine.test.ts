/**
 * Testes unitários — Dashboard / AlertEngine
 * Valida avaliação de condições, anti-spam, notificação e SSE.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock do módulo sse-handler (importado internamente pelo alert-engine)
// vi.mock é hoisted antes da inicialização de variáveis, por isso usamos
// vi.fn() diretamente dentro da factory e obtemos a referência depois.
// ---------------------------------------------------------------------------

vi.mock('../../../servicos-global/tenant/dashboard/server/lib/sse-handler.js', () => ({
  sseHandler: {
    sendToTenant: vi.fn(),
  },
}))

// ---------------------------------------------------------------------------
// Importação do módulo sob teste e do mock (após os mocks declarados)
// ---------------------------------------------------------------------------

import { AlertEngine } from '../../../servicos-global/tenant/dashboard/server/lib/alert-engine.js'
import { sseHandler } from '../../../servicos-global/tenant/dashboard/server/lib/sse-handler.js'

// Referência tipada para inspecionar chamadas
const mockSendToTenant = sseHandler.sendToTenant as ReturnType<typeof vi.fn>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAlert(overrides: Partial<{
  id: string
  tenant_id: string
  user_id: string
  metric_key: string
  condition: string
  threshold: unknown
  last_triggered: Date | null
  widget_id: string | null
}> = {}) {
  return {
    id: 'alert-1',
    tenant_id: 'tenant-1',
    user_id: 'user-1',
    metric_key: 'bid-cambio.saving_total',
    condition: 'gt',
    threshold: { value: 100000 },
    last_triggered: null,
    widget_id: null,
    ...overrides,
  }
}

function makeWidgetResult(data: Record<string, unknown> = {}) {
  return {
    data: { 'bid-cambio.saving_total': 150000, ...data },
    chartType: 'KPI_CARD',
    partial: false,
    cached: false,
    computed_at: new Date().toISOString(),
  }
}

function makePrisma(alerts: ReturnType<typeof makeAlert>[] = [makeAlert()]) {
  return {
    dashboardAlert: {
      findMany: vi.fn().mockResolvedValue(alerts),
      update: vi.fn().mockResolvedValue({}),
    },
  }
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

describe('AlertEngine.checkAlerts', () => {
  let engine: AlertEngine
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    engine = new AlertEngine()
    fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // ── 1 ──────────────────────────────────────────────────────────────────
  it('should fire alert when condition gt is satisfied', async () => {
    const prisma = makePrisma([makeAlert({ condition: 'gt', threshold: { value: 100000 } })])
    // saving_total = 150000 > 100000 → triggered
    const widgetResult = makeWidgetResult()

    const results = await engine.checkAlerts(prisma as never, 'tenant-1', widgetResult as never)

    expect(results).toHaveLength(1)
    expect(results[0].triggered).toBe(true)
    expect(results[0].currentValue).toBe(150000)
    expect(results[0].threshold).toBe(100000)
  })

  // ── 2 ──────────────────────────────────────────────────────────────────
  it('should NOT fire when condition gt is not satisfied', async () => {
    const prisma = makePrisma([makeAlert({ condition: 'gt', threshold: { value: 200000 } })])
    // saving_total = 150000 is NOT > 200000
    const widgetResult = makeWidgetResult()

    const results = await engine.checkAlerts(prisma as never, 'tenant-1', widgetResult as never)

    expect(results).toHaveLength(1)
    expect(results[0].triggered).toBe(false)
    // fetch should not be called when not triggered
    expect(fetchMock).not.toHaveBeenCalled()
  })

  // ── 3 ──────────────────────────────────────────────────────────────────
  it('should NOT fire when last_triggered is within 1 hour (anti-spam)', async () => {
    const recentDate = new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    const prisma = makePrisma([makeAlert({ last_triggered: recentDate })])
    const widgetResult = makeWidgetResult()

    const results = await engine.checkAlerts(prisma as never, 'tenant-1', widgetResult as never)

    // Condition is satisfied but cooldown blocks execution
    expect(results[0].triggered).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(prisma.dashboardAlert.update).not.toHaveBeenCalled()
    expect(mockSendToTenant).not.toHaveBeenCalled()
  })

  // ── 4 ──────────────────────────────────────────────────────────────────
  it('should fire when last_triggered is older than 1 hour', async () => {
    const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    const prisma = makePrisma([makeAlert({ last_triggered: oldDate })])
    const widgetResult = makeWidgetResult()

    const results = await engine.checkAlerts(prisma as never, 'tenant-1', widgetResult as never)

    expect(results[0].triggered).toBe(true)
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(prisma.dashboardAlert.update).toHaveBeenCalledOnce()
  })

  // ── 5 ──────────────────────────────────────────────────────────────────
  it('should call fetch to notify when alert fires', async () => {
    const prisma = makePrisma()
    const widgetResult = makeWidgetResult()

    await engine.checkAlerts(prisma as never, 'tenant-1', widgetResult as never)

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:3001/api/v1/notificacoes')
    expect(options.method).toBe('POST')
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.headers['x-tenant-id']).toBe('tenant-1')

    const body = JSON.parse(options.body)
    expect(body.tenant_id).toBe('tenant-1')
    expect(body.user_id).toBe('user-1')
    expect(body.type).toBe('dashboard_alert')
  })

  // ── 6 ──────────────────────────────────────────────────────────────────
  it('should update last_triggered in DB when alert fires', async () => {
    const prisma = makePrisma()
    const widgetResult = makeWidgetResult()

    await engine.checkAlerts(prisma as never, 'tenant-1', widgetResult as never)

    expect(prisma.dashboardAlert.update).toHaveBeenCalledOnce()
    expect(prisma.dashboardAlert.update).toHaveBeenCalledWith({
      where: { id: 'alert-1' },
      data: { last_triggered: expect.any(Date) },
    })
  })

  // ── 7 ──────────────────────────────────────────────────────────────────
  it('should call sseHandler.sendToTenant when alert fires', async () => {
    const prisma = makePrisma()
    const widgetResult = makeWidgetResult()

    await engine.checkAlerts(prisma as never, 'tenant-1', widgetResult as never)

    expect(mockSendToTenant).toHaveBeenCalledOnce()
    const [tenantId, event] = mockSendToTenant.mock.calls[0]
    expect(tenantId).toBe('tenant-1')
    expect(event.type).toBe('alert_triggered')
    expect(event.data.alert_id).toBe('alert-1')
    expect(event.data.metric_key).toBe('bid-cambio.saving_total')
    expect(event.data.current_value).toBe(150000)
    expect(event.data.threshold).toBe(100000)
    expect(event.data.condition).toBe('gt')
  })

  // ── 8 ──────────────────────────────────────────────────────────────────
  it('should handle multiple alerts with mixed results', async () => {
    const alerts = [
      makeAlert({ id: 'alert-1', metric_key: 'bid-cambio.saving_total', condition: 'gt', threshold: { value: 100000 } }),
      makeAlert({ id: 'alert-2', metric_key: 'bid-cambio.saving_total', condition: 'gt', threshold: { value: 200000 } }),
    ]
    const prisma = makePrisma(alerts)
    const widgetResult = makeWidgetResult() // saving_total = 150000

    const results = await engine.checkAlerts(prisma as never, 'tenant-1', widgetResult as never)

    expect(results).toHaveLength(2)
    const fired = results.find(r => r.alertId === 'alert-1')
    const notFired = results.find(r => r.alertId === 'alert-2')
    expect(fired?.triggered).toBe(true)
    expect(notFired?.triggered).toBe(false)

    // Only alert-1 should trigger fetch / update / SSE
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(prisma.dashboardAlert.update).toHaveBeenCalledOnce()
    expect(mockSendToTenant).toHaveBeenCalledOnce()
  })

  // ── 9 ──────────────────────────────────────────────────────────────────
  it('should handle fetch error gracefully (not throw)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'))
    const prisma = makePrisma()
    const widgetResult = makeWidgetResult()

    // Should not throw despite fetch failing
    await expect(
      engine.checkAlerts(prisma as never, 'tenant-1', widgetResult as never)
    ).resolves.toBeDefined()

    // DB update and SSE still run after the caught fetch error
    expect(prisma.dashboardAlert.update).toHaveBeenCalledOnce()
    expect(mockSendToTenant).toHaveBeenCalledOnce()
  })

  // ── 10 ─────────────────────────────────────────────────────────────────
  it('condition lt should work correctly', async () => {
    const alerts = [
      makeAlert({ id: 'alert-yes', condition: 'lt', threshold: { value: 200000 } }), // 150000 < 200000 → triggered
      makeAlert({ id: 'alert-no',  condition: 'lt', threshold: { value: 100000 } }), // 150000 NOT < 100000
    ]
    const prisma = makePrisma(alerts)
    const widgetResult = makeWidgetResult()

    const results = await engine.checkAlerts(prisma as never, 'tenant-1', widgetResult as never)

    expect(results).toHaveLength(2)
    expect(results.find(r => r.alertId === 'alert-yes')?.triggered).toBe(true)
    expect(results.find(r => r.alertId === 'alert-no')?.triggered).toBe(false)
    expect(fetchMock).toHaveBeenCalledOnce()
  })
})
