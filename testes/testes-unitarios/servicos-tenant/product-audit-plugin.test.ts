/**
 * Testes unitários — product-audit-plugin.ts
 *
 * Cobre:
 *   - Plugin não bloqueia a resposta HTTP (fire-and-forget via setImmediate)
 *   - 50 requests simultâneos não causam erros silenciosos
 *   - Erro interno no setImmediate é capturado (não propaga para o cliente)
 *   - Rotas GET/HEAD/OPTIONS são ignoradas (não auditadas)
 *   - Ausência de actor (getActorFromReq retorna null) passa sem auditoria
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { createProductAuditPlugin } from '../../../servicos-global/tenant/historico-global/src/product-audit-plugin.js'

// ── Mock do auditLog ──────────────────────────────────────────────────────────
const mockAuditLog = vi.fn().mockResolvedValue(undefined)

vi.mock('../../../servicos-global/tenant/historico-global/src/audit-client.js', () => ({
  auditLog: (...args: unknown[]) => mockAuditLog(...args),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    method: 'POST',
    path: '/api/v1/pedidos',
    originalUrl: '/api/v1/pedidos',
    ip: '127.0.0.1',
    params: {},
    headers: {
      'user-agent': 'vitest',
      'x-correlation-id': 'corr-001',
    },
    ...overrides,
  } as unknown as Request
}

function makeRes(statusCode = 201, body: unknown = { id: 'new-id' }): Response {
  const res = {
    statusCode,
    json: vi.fn(),
  } as unknown as Response

  // Simula que res.json é chamado ao final do handler
  ;(res as any).json = vi.fn((b: unknown) => {
    ;(res as any)._body = b
    return res
  })

  return res
}

function makePlugin() {
  return createProductAuditPlugin({
    product_id: 'pedido',
    module: 'pedido',
    getActorFromReq: (req) => ({
      tenant_id: (req.headers['x-tenant-id'] as string) ?? 'tenant-test',
      actor_id: 'user-123',
      actor_name: 'Test User',
      actor_type: 'USER',
    }),
  })
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe('ProductAuditPlugin — comportamento básico', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('chama next() imediatamente (não bloqueia a resposta)', () => {
    const plugin = makePlugin()
    const req = makeReq()
    const res = makeRes()
    const next = vi.fn()

    plugin(req, res, next)

    // next deve ser chamado de forma síncrona, antes do auditLog
    expect(next).toHaveBeenCalledOnce()
  })

  it('não audita requisições GET', () => {
    const plugin = makePlugin()
    const req = makeReq({ method: 'GET' })
    const res = makeRes(200)
    const next = vi.fn()

    plugin(req, res, next)
    ;(res as any).json({ data: [] })

    // auditLog nunca deve ser chamado para GET
    expect(mockAuditLog).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledOnce()
  })

  it('não audita quando actor é null (request não autenticado)', () => {
    const plugin = createProductAuditPlugin({
      product_id: 'pedido',
      module: 'pedido',
      getActorFromReq: () => null,
    })
    const req = makeReq()
    const res = makeRes()
    const next = vi.fn()

    plugin(req, res, next)
    ;(res as any).json({ id: 'x' })

    expect(mockAuditLog).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledOnce()
  })

  it('chama auditLog via setImmediate após res.json (fire-and-forget)', async () => {
    const plugin = makePlugin()
    const req = makeReq({ headers: { 'x-tenant-id': 'tenant-test' } as any })
    const res = makeRes(201, { id: 'ped-001' })
    const next = vi.fn()

    plugin(req, res, next)
    ;(res as any).json({ id: 'ped-001' })

    // Aguarda o setImmediate executar
    await new Promise(resolve => setImmediate(resolve))

    expect(mockAuditLog).toHaveBeenCalledOnce()
    const callArg = mockAuditLog.mock.calls[0][0]
    expect(callArg.tenant_id).toBe('tenant-test')
    expect(callArg.resource_id).toBe('ped-001')
    expect(callArg.action).toBe('POST')
    expect(callArg.status).toBe('SUCCESS')
  })

  it('classifica status 4xx como FAILURE', async () => {
    const plugin = makePlugin()
    const req = makeReq({ method: 'DELETE', path: '/api/v1/pedidos/abc', params: { id: 'abc' } as any })
    const res = makeRes(404, { message: 'Não encontrado' })
    const next = vi.fn()

    plugin(req, res, next)
    ;(res as any).json({ message: 'Não encontrado' })

    await new Promise(resolve => setImmediate(resolve))

    const callArg = mockAuditLog.mock.calls[0][0]
    expect(callArg.status).toBe('FAILURE')
    expect(callArg.error_message).toBe('Não encontrado')
  })
})

describe('ProductAuditPlugin — resiliência a erros internos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('erro no auditLog não propaga para o cliente', async () => {
    mockAuditLog.mockRejectedValueOnce(new Error('Banco indisponível'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const plugin = makePlugin()
    const req = makeReq()
    const res = makeRes(200)
    const next = vi.fn()

    plugin(req, res, next)
    ;(res as any).json({ id: 'ok' })

    // Aguarda setImmediate — não deve lançar exceção não capturada
    await new Promise(resolve => setImmediate(resolve))
    await new Promise(resolve => setImmediate(resolve))

    // next foi chamado normalmente (resposta não bloqueada)
    expect(next).toHaveBeenCalledOnce()
    // O erro foi logado
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ProductAuditPlugin]'),
      expect.any(Error),
    )

    consoleSpy.mockRestore()
  })
})

describe('ProductAuditPlugin — teste de carga (50 requests simultâneos)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('50 requests POST simultâneos: auditLog chamado 50x sem erros', async () => {
    const plugin = makePlugin()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const promises = Array.from({ length: 50 }, (_, i) => {
      const req = makeReq({
        path: `/api/v1/pedidos/${i}`,
        params: { id: String(i) } as any,
        headers: { 'x-tenant-id': `tenant-${i % 5}` } as any,
      })
      const res = makeRes(200, { id: String(i) })
      const next = vi.fn()

      plugin(req, res, next)
      ;(res as any).json({ id: String(i) })

      // Retorna Promise que resolve após o setImmediate do request
      return new Promise<void>(resolve => setImmediate(resolve))
    })

    await Promise.all(promises)
    // Aguarda todos os setImmediate
    await new Promise(resolve => setImmediate(resolve))

    expect(mockAuditLog).toHaveBeenCalledTimes(50)
    // Nenhum erro deve ter sido logado
    expect(consoleSpy).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})
