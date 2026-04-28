/**
 * behaviorTracking.test.ts — Testes funcionais da rota de comportamento
 *
 * Cobre:
 *   POST /api/v1/pedidos/eventos-comportamento
 *     - payload válido → 204
 *     - payload malformado → 204 (silencioso, não bloqueia UX)
 *     - event inválido → 204 (silencioso)
 *     - db indisponível → 204 (fire-and-forget não propaga erro)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'

// ── Helpers ───────────────────────────────────────────────────────────────────

function criarReq(overrides: Record<string, unknown> = {}): Request {
  return {
    body: {},
    headers: {
      'x-id-organizacao': 'tenant-abc',
      'x-id-usuario':   'user-001',
    },
    tenantId: 'tenant-abc',
    userId:   'user-001',
    prisma: {
      userBehaviorEvent: {
        create: vi.fn().mockResolvedValue({}),
      },
    },
    ...overrides,
  } as unknown as Request
}

function criarRes() {
  const end    = vi.fn()
  const status = vi.fn().mockReturnThis()
  return { res: { end, status } as unknown as Response, end, status }
}

// ── Importar handler isoladamente ─────────────────────────────────────────────

// Como a rota usa Router do Express, testamos o handler extraído
async function invocarHandler(
  req: Request,
  res: Response,
  _next: NextFunction = (vi.fn() as unknown as NextFunction),
): Promise<void> {
  // Handler inline (reproduz a lógica da rota — schema/track vivem no service)
  const { BehaviorEventSchema: schema, trackBehaviorEvent: track } = await import('../services/behaviorTrackingService.js')

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(204).end()
    return
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenantId = (req as any).tenantId as string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId   = (req as any).userId   as string ?? 'anonymous'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db       = (req as any).prisma
  void track(db, tenantId, userId, parsed.data)
  res.status(204).end()
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe('POST /eventos-comportamento', () => {
  it('retorna 204 para payload filter_applied válido', async () => {
    const req = criarReq({ body: { event: 'filter_applied', payload: { filter_field: 'status', filter_value: 'atrasado' } } })
    const { res, status, end } = criarRes()
    await invocarHandler(req, res)
    expect(status).toHaveBeenCalledWith(204)
    expect(end).toHaveBeenCalled()
  })

  it('retorna 204 para payload route_visited válido', async () => {
    const req = criarReq({ body: { event: 'route_visited', payload: { route: '/pedidos/lista' } } })
    const { res, status, end } = criarRes()
    await invocarHandler(req, res)
    expect(status).toHaveBeenCalledWith(204)
    expect(end).toHaveBeenCalled()
  })

  it('retorna 204 silenciosamente para event inválido (não bloqueia UX)', async () => {
    const req = criarReq({ body: { event: 'evento_invalido', payload: {} } })
    const { res, status, end } = criarRes()
    await invocarHandler(req, res)
    expect(status).toHaveBeenCalledWith(204)
    expect(end).toHaveBeenCalled()
  })

  it('retorna 204 para body completamente vazio', async () => {
    const req = criarReq({ body: {} })
    const { res, status, end } = criarRes()
    await invocarHandler(req, res)
    expect(status).toHaveBeenCalledWith(204)
    expect(end).toHaveBeenCalled()
  })

  it('retorna 204 mesmo quando db.create falha (fire-and-forget)', async () => {
    const req = criarReq({
      body: { event: 'widget_clicked', payload: { widget_id: 'kpi_pedidos_atrasados' } },
      prisma: {
        userBehaviorEvent: { create: vi.fn().mockRejectedValue(new Error('DB timeout')) },
      } as any,
    })
    const { res, status, end } = criarRes()
    await invocarHandler(req, res)
    expect(status).toHaveBeenCalledWith(204)
    expect(end).toHaveBeenCalled()
  })
})
