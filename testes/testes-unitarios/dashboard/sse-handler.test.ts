/**
 * Testes unitários — Dashboard / DashboardSSEHandler
 * Valida addClient, removeClient, sendToDashboard e sendToTenant.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DashboardSSEHandler } from '../../../servicos-global/tenant/dashboard/server/lib/sse-handler.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRes() {
  return {
    write: vi.fn(),
    setHeader: vi.fn(),
    flushHeaders: vi.fn(),
  }
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

describe('DashboardSSEHandler', () => {
  let handler: DashboardSSEHandler

  beforeEach(() => {
    vi.useFakeTimers()
    handler = new DashboardSSEHandler()
  })

  afterEach(() => {
    handler.destroy()
    vi.useRealTimers()
  })

  // ── 1 ──────────────────────────────────────────────────────────────────
  it('addClient: should set SSE headers on response', () => {
    const res = makeRes()
    handler.addClient('client-1', 'tenant-1', 'user-1', 'dash-1', res as never)

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream')
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache')
    expect(res.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive')
    expect(res.setHeader).toHaveBeenCalledWith('X-Accel-Buffering', 'no')
    expect(res.flushHeaders).toHaveBeenCalledOnce()
  })

  // ── 2 ──────────────────────────────────────────────────────────────────
  it('addClient: should write initial connection event', () => {
    const res = makeRes()
    handler.addClient('client-1', 'tenant-1', 'user-1', 'dash-1', res as never)

    expect(res.write).toHaveBeenCalledOnce()
    const written: string = res.write.mock.calls[0][0]
    const payload = JSON.parse(written.replace(/^data: /, '').replace(/\n\n$/, ''))
    expect(payload.type).toBe('heartbeat')
  })

  // ── 3 ──────────────────────────────────────────────────────────────────
  it('sendToDashboard: should write SSE event to correct clients', () => {
    const res = makeRes()
    handler.addClient('client-1', 'tenant-1', 'user-1', 'dash-1', res as never)
    res.write.mockClear() // ignore the initial heartbeat

    handler.sendToDashboard('tenant-1', 'dash-1', { type: 'widget_update', data: { value: 42 } })

    expect(res.write).toHaveBeenCalledOnce()
  })

  // ── 4 ──────────────────────────────────────────────────────────────────
  it('sendToDashboard: should NOT write to clients on different dashboard', () => {
    const res = makeRes()
    handler.addClient('client-1', 'tenant-1', 'user-1', 'dash-OTHER', res as never)
    res.write.mockClear()

    handler.sendToDashboard('tenant-1', 'dash-1', { type: 'widget_update' })

    expect(res.write).not.toHaveBeenCalled()
  })

  // ── 5 ──────────────────────────────────────────────────────────────────
  it('sendToTenant: should write to all clients of same tenant', () => {
    const res1 = makeRes()
    const res2 = makeRes()
    handler.addClient('client-1', 'tenant-1', 'user-1', 'dash-A', res1 as never)
    handler.addClient('client-2', 'tenant-1', 'user-2', 'dash-B', res2 as never)
    res1.write.mockClear()
    res2.write.mockClear()

    handler.sendToTenant('tenant-1', { type: 'alert_triggered' })

    expect(res1.write).toHaveBeenCalledOnce()
    expect(res2.write).toHaveBeenCalledOnce()
  })

  // ── 6 ──────────────────────────────────────────────────────────────────
  it('sendToTenant: should NOT write to clients of different tenant', () => {
    const resTenant1 = makeRes()
    const resTenant2 = makeRes()
    handler.addClient('client-1', 'tenant-1', 'user-1', 'dash-1', resTenant1 as never)
    handler.addClient('client-2', 'tenant-2', 'user-2', 'dash-2', resTenant2 as never)
    resTenant1.write.mockClear()
    resTenant2.write.mockClear()

    handler.sendToTenant('tenant-1', { type: 'alert_triggered' })

    expect(resTenant1.write).toHaveBeenCalledOnce()
    expect(resTenant2.write).not.toHaveBeenCalled()
  })

  // ── 7 ──────────────────────────────────────────────────────────────────
  it('removeClient: should remove client from registry', () => {
    const res = makeRes()
    handler.addClient('client-1', 'tenant-1', 'user-1', 'dash-1', res as never)
    res.write.mockClear()

    handler.removeClient('client-1')

    handler.sendToDashboard('tenant-1', 'dash-1', { type: 'widget_update' })
    expect(res.write).not.toHaveBeenCalled()
  })

  // ── 8 ──────────────────────────────────────────────────────────────────
  it('removeClient: after removal, sendToDashboard should not write to removed client', () => {
    const res1 = makeRes()
    const res2 = makeRes()
    handler.addClient('client-1', 'tenant-1', 'user-1', 'dash-1', res1 as never)
    handler.addClient('client-2', 'tenant-1', 'user-2', 'dash-1', res2 as never)
    res1.write.mockClear()
    res2.write.mockClear()

    handler.removeClient('client-1')
    handler.sendToDashboard('tenant-1', 'dash-1', { type: 'widget_update' })

    expect(res1.write).not.toHaveBeenCalled()
    expect(res2.write).toHaveBeenCalledOnce()
  })

  // ── 9 ──────────────────────────────────────────────────────────────────
  it('sendToDashboard: should format SSE event correctly (data:\\n\\n format)', () => {
    const res = makeRes()
    handler.addClient('client-1', 'tenant-1', 'user-1', 'dash-1', res as never)
    res.write.mockClear()

    const event = { type: 'widget_update' as const, widgetId: 'w-1', data: { value: 99 } }
    handler.sendToDashboard('tenant-1', 'dash-1', event)

    expect(res.write).toHaveBeenCalledOnce()
    const written: string = res.write.mock.calls[0][0]

    // Must start with "data: " and end with double newline
    expect(written).toMatch(/^data: .+\n\n$/)

    // The JSON payload must match the event object
    const jsonPart = written.replace(/^data: /, '').replace(/\n\n$/, '')
    const parsed = JSON.parse(jsonPart)
    expect(parsed.type).toBe('widget_update')
    expect(parsed.widgetId).toBe('w-1')
    expect(parsed.data).toEqual({ value: 99 })
  })

  // ── 10 ─────────────────────────────────────────────────────────────────
  it('addClient: multiple clients same dashboard → both receive events', () => {
    const res1 = makeRes()
    const res2 = makeRes()
    handler.addClient('client-1', 'tenant-1', 'user-1', 'dash-1', res1 as never)
    handler.addClient('client-2', 'tenant-1', 'user-2', 'dash-1', res2 as never)
    res1.write.mockClear()
    res2.write.mockClear()

    handler.sendToDashboard('tenant-1', 'dash-1', { type: 'widget_update' })

    expect(res1.write).toHaveBeenCalledOnce()
    expect(res2.write).toHaveBeenCalledOnce()
  })
})
