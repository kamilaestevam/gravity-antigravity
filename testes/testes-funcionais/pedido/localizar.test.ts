// @vitest-environment node
/**
 * Testes funcionais — GET /api/v1/pedidos/localizar
 *
 * Cobre:
 *   - Retorna total de matches em campos textuais do Pedido
 *   - Retorna total de matches em campos textuais do PedidoItem
 *   - Retorna total de matches em JSONB detalhes_operacionais
 *   - Retorna total de matches em rótulos de colunas do usuário (PedidoColuna)
 *   - Retorna total de matches em valores de colunas customizadas
 *   - Soma todos os parciais corretamente
 *   - Termo vazio → 400
 *   - Termo muito longo (>200) → 400
 *   - Tenant isolation: tenant-002 não vê dados de tenant-001
 *   - Filtro status: restringe pedidos buscados
 *   - Escaping de % e _ no termo
 *   - Resposta tem shape { total: number }
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'
import { pedidosRouter } from '../../../servicos-global/tenant/processos-core/src/routes/pedidos'

// ── Tipos locais ──────────────────────────────────────────────────────────────

interface HttpError extends Error {
  statusCode?: number
}

type AppRequest = Request & {
  prisma: Record<string, unknown>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function criarApp(prismaMock: Record<string, unknown>, tenantId = 'tenant-001', companyId = 'company-001') {
  const app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as AppRequest).prisma = prismaMock
    req.headers['x-tenant-id'] = tenantId
    req.headers['x-company-id'] = companyId
    next()
  })
  app.use('/api/v1/pedidos', pedidosRouter)
  app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode || 500).json({ error: { message: err.message } })
  })
  return app
}

// Mock padrão: cada sub-query retorna valor controlável
function criarPrismaMock({
  pedidoCount      = 0,
  itemCount        = 0,
  jsonbCount       = BigInt(0),
  colunaCount      = 0,
  valorCount       = BigInt(0),
}: {
  pedidoCount?:  number
  itemCount?:    number
  jsonbCount?:   bigint
  colunaCount?:  number
  valorCount?:   bigint
} = {}) {
  return {
    pedido: {
      count: vi.fn().mockResolvedValue(pedidoCount),
    },
    pedidoItem: {
      count: vi.fn().mockResolvedValue(itemCount),
    },
    pedidoColuna: {
      count: vi.fn().mockResolvedValue(colunaCount),
    },
    $queryRaw: vi.fn()
      // primeira chamada → JSONB detalhes_operacionais
      .mockResolvedValueOnce([{ count: jsonbCount }])
      // segunda chamada → valores_colunas_usuario_pedido
      .mockResolvedValueOnce([{ count: valorCount }]),
  }
}

// ─── 1. Shape da resposta ─────────────────────────────────────────────────────

describe('GET /localizar — shape da resposta', () => {
  it('retorna { total: number } quando há matches', async () => {
    const prisma = criarPrismaMock({ pedidoCount: 5, itemCount: 3 })
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/localizar?termo=exp')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('total')
    expect(typeof res.body.total).toBe('number')
  })

  it('retorna { total: 0 } quando não há matches', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/localizar?termo=xyzxyz_nao_existe')
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(0)
  })
})

// ─── 2. Soma dos parciais ─────────────────────────────────────────────────────

describe('GET /localizar — soma de todas as fontes', () => {
  it('soma pedido + item + jsonb + coluna + valor corretamente', async () => {
    const prisma = criarPrismaMock({
      pedidoCount: 10,
      itemCount:   5,
      jsonbCount:  BigInt(3),
      colunaCount: 2,
      valorCount:  BigInt(1),
    })
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/localizar?termo=exp')
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(21) // 10+5+3+2+1
  })

  it('lida com count retornando bigint (PostgreSQL COUNT retorna bigint)', async () => {
    const prisma = criarPrismaMock({
      pedidoCount: 100,
      jsonbCount:  BigInt(50),
      valorCount:  BigInt(25),
    })
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/localizar?termo=abc')
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(175) // 100+0+50+0+25
  })
})

// ─── 3. Validação Zod ─────────────────────────────────────────────────────────

describe('GET /localizar — validação de entrada', () => {
  it('retorna 400 quando termo está ausente', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app).get('/api/v1/pedidos/localizar')
    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/invalidos/i)
  })

  it('retorna 400 quando termo é string vazia', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app).get('/api/v1/pedidos/localizar?termo=')
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando termo tem mais de 200 caracteres', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)
    const termoLongo = 'a'.repeat(201)

    const res = await request(app)
      .get(`/api/v1/pedidos/localizar?termo=${termoLongo}`)
    expect(res.status).toBe(400)
  })

  it('aceita termo com 1 caractere', async () => {
    const prisma = criarPrismaMock({ pedidoCount: 2 })
    const app = criarApp(prisma)

    const res = await request(app).get('/api/v1/pedidos/localizar?termo=a')
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(2)
  })

  it('aceita termo com exatamente 200 caracteres', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)
    const termo200 = 'a'.repeat(200)

    const res = await request(app)
      .get(`/api/v1/pedidos/localizar?termo=${termo200}`)
    expect(res.status).toBe(200)
  })
})

// ─── 4. Tenant isolation ─────────────────────────────────────────────────────

describe('GET /localizar — tenant isolation', () => {
  it('tenant-002 recebe contagem do seu próprio mock — não vaza tenant-001', async () => {
    // tenant-001 teria 100 matches, tenant-002 tem 3
    const prismaTenant2 = criarPrismaMock({ pedidoCount: 3 })
    const appTenant2 = criarApp(prismaTenant2, 'tenant-002', 'company-002')

    const res = await request(appTenant2)
      .get('/api/v1/pedidos/localizar?termo=exp')

    expect(res.status).toBe(200)
    expect(res.body.total).toBe(3)

    // Verifica que o where passado ao count incluiu o tenant correto
    const whereArg = prismaTenant2.pedido.count.mock.calls[0][0].where
    expect(whereArg.tenant_id).toBe('tenant-002')
    expect(whereArg.company_id).toBe('company-002')
  })

  it('passa tenant_id correto para pedidoItem.count', async () => {
    const prisma = criarPrismaMock({ itemCount: 7 })
    const app = criarApp(prisma, 'tenant-abc')

    await request(app).get('/api/v1/pedidos/localizar?termo=ncm')

    const whereArg = prisma.pedidoItem.count.mock.calls[0][0].where
    expect(whereArg.tenant_id).toBe('tenant-abc')
  })

  it('passa tenant_id correto para pedidoColuna.count', async () => {
    const prisma = criarPrismaMock({ colunaCount: 2 })
    const app = criarApp(prisma, 'tenant-xyz')

    await request(app).get('/api/v1/pedidos/localizar?termo=ref')

    const whereArg = prisma.pedidoColuna.count.mock.calls[0][0].where
    expect(whereArg.tenant_id).toBe('tenant-xyz')
  })
})

// ─── 5. Filtro de status ──────────────────────────────────────────────────────

describe('GET /localizar — filtro de status', () => {
  it('repassa filtro status para o where do pedido.count', async () => {
    const prisma = criarPrismaMock({ pedidoCount: 4 })
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos/localizar?termo=po&status=aberto')

    const whereArg = prisma.pedido.count.mock.calls[0][0].where
    expect(whereArg.status).toBe('aberto')
  })

  it('aceita múltiplos status separados por vírgula', async () => {
    const prisma = criarPrismaMock({ pedidoCount: 8 })
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos/localizar?termo=po&status=aberto,transferencia')

    const whereArg = prisma.pedido.count.mock.calls[0][0].where
    expect(whereArg.status).toEqual({ in: ['aberto', 'transferencia'] })
  })
})

// ─── 6. Escaping de caracteres especiais ILIKE ────────────────────────────────

describe('GET /localizar — escaping de caracteres especiais', () => {
  it('escapa % no termo para evitar wildcard indevido no ILIKE', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    // Não deve explodir — o mock captura o parâmetro escapado
    const res = await request(app)
      .get('/api/v1/pedidos/localizar?termo=100%25')
    expect(res.status).toBe(200)

    // O $queryRaw deve ter sido chamado com o termo contendo \%
    const rawCall = prisma.$queryRaw.mock.calls[0]
    // O parâmetro ilike deve conter \%
    const ilikeParm = rawCall.find((a: unknown) => typeof a === 'string' && a.includes('%'))
    expect(ilikeParm).toMatch(/\\%/)
  })

  it('escapa _ no termo para evitar single-char wildcard', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/localizar?termo=PO_2026')
    expect(res.status).toBe(200)

    const rawCall = prisma.$queryRaw.mock.calls[0]
    const ilikeParm = rawCall.find((a: unknown) => typeof a === 'string' && a.includes('_'))
    expect(ilikeParm).toMatch(/\\_/)
  })
})

// ─── 7. Execução paralela (Promise.all) ──────────────────────────────────────

describe('GET /localizar — execução paralela', () => {
  it('chama todas as 3 queries (pedido.count, item.count, pedidoColuna.count) por request', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app).get('/api/v1/pedidos/localizar?termo=test')

    expect(prisma.pedido.count).toHaveBeenCalledTimes(1)
    expect(prisma.pedidoItem.count).toHaveBeenCalledTimes(1)
    expect(prisma.pedidoColuna.count).toHaveBeenCalledTimes(1)
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(2) // JSONB + valores
  })
})
