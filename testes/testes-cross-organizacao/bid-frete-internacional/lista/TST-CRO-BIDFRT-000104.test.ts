// @vitest-environment node
/**
 * TST-CRO-BIDFRT-000104 — Isolamento cross-org nas rotas de exclusão (lista BID Frete)
 *
 * Simula Prisma tenant-scoped: ids de outra organização não aparecem no findMany → 404.
 */

import express, { type NextFunction, type Request, type Response } from 'express'
import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const ORG_A = 'org-A'
const ORG_B = 'org-B'

const mockCotacoes: Record<string, unknown>[] = []
const mockBids: Record<string, unknown>[] = []

function idsDoWhere(where: Record<string, unknown> | undefined, campo: string): string[] | null {
  const filtro = where?.[campo] as { in?: string[] } | string | undefined
  if (filtro && typeof filtro === 'object' && Array.isArray(filtro.in)) return filtro.in
  if (typeof filtro === 'string') return [filtro]
  return null
}

function filtrarPorTenant(items: Record<string, unknown>[], tenantId: string | undefined): Record<string, unknown>[] {
  if (!tenantId) return items
  return items.filter(i => i.id_organizacao === tenantId)
}

const mockPrisma = {
  cotacaoBidFreteInternacional: {
    findMany: vi.fn(async ({ where }: { where?: Record<string, unknown> }, req?: Request & { tenantId?: string }) => {
      const tenantId = (req as Request & { tenantId?: string } | undefined)?.tenantId
      const ids = idsDoWhere(where, 'id_cotacao_bid_frete_internacional')
      const base = filtrarPorTenant(mockCotacoes, tenantId)
      if (ids) return base.filter(c => ids.includes(c.id_cotacao_bid_frete_internacional as string))
      return base
    }),
    deleteMany: vi.fn(async () => ({ count: 0 })),
  },
  bidFreteInternacional: {
    findMany: vi.fn(async ({ where }: { where?: Record<string, unknown> }, req?: Request & { tenantId?: string }) => {
      const tenantId = (req as Request & { tenantId?: string } | undefined)?.tenantId
      const ids = idsDoWhere(where, 'id_bid_bid_frete_internacional')
      const base = filtrarPorTenant(mockBids, tenantId)
      const bids = ids
        ? base.filter(b => ids.includes(b.id_bid_bid_frete_internacional as string))
        : base
      return bids.map(b => ({
        ...b,
        cotacoes: mockCotacoes.filter(
          c =>
            c.id_bid_bid_frete_internacional === b.id_bid_bid_frete_internacional
            && c.id_organizacao === tenantId,
        ),
      }))
    }),
    delete: vi.fn(async () => ({})),
  },
  $transaction: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
}

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/agregar-resumo-bid-frete-internacional.js',
  () => ({
    sincronizarResumoBid: vi.fn(async () => undefined),
    gerarNumeroBidFreteInternacional: vi.fn(() => 'BIDG-TEST-0001'),
  }),
)

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/integracoes-tenant.js',
  () => ({
    atividadesIntegration: { cotacaoCriada: vi.fn() },
    historicoIntegration: { cotacaoCriada: vi.fn(), registrar: vi.fn() },
  }),
)

import { exclusoesBidFreteInternacionalRouter } from '../../../../servicos-global/produto/bid-frete-internacional/server/src/routes/exclusoes-bid-frete-internacional'

function criarApp(tenantId: string) {
  const app = express()
  app.use(express.json())
  app.use((req: Request & { prisma?: typeof mockPrisma; tenantId?: string }, _res: Response, next: NextFunction) => {
    req.tenantId = tenantId
    req.prisma = {
      ...mockPrisma,
      cotacaoBidFreteInternacional: {
        ...mockPrisma.cotacaoBidFreteInternacional,
        findMany: (args: { where?: Record<string, unknown> }) =>
          mockPrisma.cotacaoBidFreteInternacional.findMany(args, req),
      },
      bidFreteInternacional: {
        ...mockPrisma.bidFreteInternacional,
        findMany: (args: { where?: Record<string, unknown> }) =>
          mockPrisma.bidFreteInternacional.findMany(args, req),
      },
    } as unknown as typeof req.prisma
    next()
  })
  app.use('/api/v1/bid-frete-internacional', exclusoesBidFreteInternacionalRouter)
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: { code: err.code ?? 'INTERNAL_ERROR', message: err.message } })
  })
  return app
}

const HEADERS = { 'x-id-usuario': 'user_org_b' }

beforeEach(() => {
  mockCotacoes.length = 0
  mockBids.length = 0
  vi.clearAllMocks()
  mockCotacoes.push({
    id_cotacao_bid_frete_internacional: `cot-${ORG_A}`,
    id_organizacao: ORG_A,
    numero_cotacao_bid_frete_internacional: 'BID-ORG-A-001',
    status_cotacao_bid_frete_internacional: 'RASCUNHO',
    id_bid_bid_frete_internacional: null,
    _count: { propostas: 0, disparos_cotacao: 0 },
  })
  mockBids.push({
    id_bid_bid_frete_internacional: `bid-${ORG_A}`,
    id_organizacao: ORG_A,
    numero_bid_bid_frete_internacional: 'BIDG-ORG-A-001',
    cotacoes: [],
  })
})

describe('TST-CRO-BIDFRT-000104 — Exclusões cross-org', () => {
  it('CRO-BF-01: preview cotação de outra org → 404', async () => {
    const app = criarApp(ORG_B)
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes/exclusoes/preview')
      .set(HEADERS)
      .send({ ids: [`cot-${ORG_A}`] })

    expect(res.status).toBe(404)
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND')
  })

  it('CRO-BF-02: confirmar cotação de outra org → 404', async () => {
    const app = criarApp(ORG_B)
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes/exclusoes/confirmar')
      .set(HEADERS)
      .send({ ids: [`cot-${ORG_A}`] })

    expect(res.status).toBe(404)
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND')
  })

  it('CRO-BF-03: preview BID de outra org → 404', async () => {
    const app = criarApp(ORG_B)
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/bids-frete-internacional/exclusoes/preview')
      .set(HEADERS)
      .send({ ids: [`bid-${ORG_A}`] })

    expect(res.status).toBe(404)
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND')
  })
})
