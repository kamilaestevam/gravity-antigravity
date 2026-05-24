/// <reference types="vitest/globals" />
// @vitest-environment node

/**
 * config-status-routes.test.ts — Testes funcionais das rotas CRUD de StatusCotacaoBidFrete
 * Valida contratos HTTP, validação Zod, isolamento por organização, lazy seed.
 */

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

// ── Mock data store ─────────────────────────────────────────────────────────

const mockStatusList: Record<string, unknown>[] = []
let nextId = 1

const mockStatusCotacaoBidFrete = {
  count: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
    return mockStatusList.filter(s => s.id_organizacao === where?.id_organizacao).length
  }),
  findMany: vi.fn(async ({ where, orderBy }: { where?: Record<string, unknown>; orderBy?: Record<string, unknown> }) => {
    return mockStatusList
      .filter(s => s.id_organizacao === where?.id_organizacao)
      .sort((a, b) => (a.ordem_status_cotacao_bid_frete as number) - (b.ordem_status_cotacao_bid_frete as number))
  }),
  findFirst: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
    return mockStatusList.find(s =>
      s.id_status_cotacao_bid_frete === where.id_status_cotacao_bid_frete &&
      s.id_organizacao === where.id_organizacao
    ) ?? null
  }),
  create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
    const status = {
      id_status_cotacao_bid_frete: `status_${nextId++}`,
      ...data,
      data_criacao_status_cotacao_bid_frete: new Date().toISOString(),
      data_atualizacao_status_cotacao_bid_frete: new Date().toISOString(),
    }
    mockStatusList.push(status)
    return status
  }),
  update: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
    const status = mockStatusList.find(s => s.id_status_cotacao_bid_frete === where.id_status_cotacao_bid_frete)
    if (!status) throw new Error('Status nao encontrado')
    Object.assign(status, data, { data_atualizacao_status_cotacao_bid_frete: new Date().toISOString() })
    return status
  }),
  updateMany: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
    const matches = mockStatusList.filter(s =>
      s.id_status_cotacao_bid_frete === where.id_status_cotacao_bid_frete &&
      s.id_organizacao === where.id_organizacao
    )
    for (const m of matches) Object.assign(m, data)
    return { count: matches.length }
  }),
  delete: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
    const idx = mockStatusList.findIndex(s => s.id_status_cotacao_bid_frete === where.id_status_cotacao_bid_frete)
    if (idx === -1) throw new Error('Status nao encontrado')
    return mockStatusList.splice(idx, 1)[0]
  }),
}

const mockPrisma = {
  statusCotacaoBidFrete: mockStatusCotacaoBidFrete,
  $transaction: vi.fn(async (fns: Promise<unknown>[]) => Promise.all(fns)),
}

// ── Mock do seedStatusPadrao ────────────────────────────────────────────────

interface SeedPrismaMock {
  statusCotacaoBidFrete: { create: (args: { data: Record<string, unknown> }) => Promise<unknown> }
}

vi.mock('../../../servicos-global/produto/bid-frete/server/src/services/seedStatusPadrao.js', () => ({
  seedStatusPadrao: vi.fn(async (prisma: SeedPrismaMock, idOrg: string) => {
    const defaults = ['RASCUNHO', 'ENVIADA_FORNECEDORES', 'EM_COTACAO', 'AGUARDANDO_APROVACAO', 'APROVADA', 'REPROVADA', 'CANCELADA', 'FALTA_INFORMACAO', 'EXPIRADA']
    for (let i = 0; i < defaults.length; i++) {
      await prisma.statusCotacaoBidFrete.create({
        data: {
          id_organizacao: idOrg,
          nome_status_cotacao_bid_frete: defaults[i],
          rotulo_status_cotacao_bid_frete: defaults[i],
          cor_status_cotacao_bid_frete: '#94a3b8',
          ordem_status_cotacao_bid_frete: i + 1,
          padrao_status_cotacao_bid_frete: i === 0,
          gerenciado_sistema_status_cotacao_bid_frete: i < 4,
        },
      })
    }
  }),
}))

// ── Mock do AppError ────────────────────────────────────────────────────────

vi.mock('../../../servicos-global/produto/bid-frete/server/src/lib/errors.js', () => ({
  AppError: class AppError extends Error {
    statusCode: number
    code: string
    constructor(message: string, statusCode = 400, code = 'ERROR') {
      super(message)
      this.statusCode = statusCode
      this.code = code
    }
  },
}))

// ── Setup express app ───────────────────────────────────────────────────────

let app: express.Express

beforeEach(async () => {
  vi.clearAllMocks()
  mockStatusList.length = 0
  nextId = 1

  const { configStatusRouter } = await import(
    '../../../servicos-global/produto/bid-frete/server/src/routes/config-status.js'
  )

  app = express()
  app.use(express.json())

  // Inject mock prisma + headers
  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as any).prisma = mockPrisma
    next()
  })

  app.use('/api/v1/bid-frete/config/status', configStatusRouter)

  // Error handler
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.statusCode ?? 500
    res.status(status).json({ error: err.message, code: err.code ?? 'INTERNAL_ERROR' })
  })
})

// ── GET / — Listar + lazy seed ──────────────────────────────────────────────

describe('GET /api/v1/bid-frete/config/status', () => {
  it('deve retornar 401 sem header x-id-organizacao', async () => {
    const res = await request(app).get('/api/v1/bid-frete/config/status')
    expect(res.status).toBe(401)
  })

  it('deve fazer lazy seed quando nenhum status existe', async () => {
    const res = await request(app)
      .get('/api/v1/bid-frete/config/status')
      .set('x-id-organizacao', 'org_test_001')

    expect(res.status).toBe(200)
    expect(res.body.status).toHaveLength(9)
    expect(mockStatusCotacaoBidFrete.count).toHaveBeenCalled()
  })

  it('deve retornar status existentes sem fazer seed', async () => {
    // Pre-populate
    mockStatusList.push({
      id_status_cotacao_bid_frete: 'existing_1',
      id_organizacao: 'org_test_002',
      nome_status_cotacao_bid_frete: 'RASCUNHO',
      rotulo_status_cotacao_bid_frete: 'Rascunho',
      cor_status_cotacao_bid_frete: '#94a3b8',
      ordem_status_cotacao_bid_frete: 1,
      gerenciado_sistema_status_cotacao_bid_frete: true,
    })

    const res = await request(app)
      .get('/api/v1/bid-frete/config/status')
      .set('x-id-organizacao', 'org_test_002')

    expect(res.status).toBe(200)
    expect(res.body.status).toHaveLength(1)
  })

  it('deve isolar status por organização (cross-tenant)', async () => {
    mockStatusList.push({
      id_status_cotacao_bid_frete: 'other_org',
      id_organizacao: 'org_OUTRA',
      nome_status_cotacao_bid_frete: 'PRIVADO',
      rotulo_status_cotacao_bid_frete: 'Privado',
      cor_status_cotacao_bid_frete: '#ff0000',
      ordem_status_cotacao_bid_frete: 1,
      gerenciado_sistema_status_cotacao_bid_frete: false,
    })

    // Deve fazer seed para org_test_003 (não tem nenhum) e NÃO retornar status de org_OUTRA
    const res = await request(app)
      .get('/api/v1/bid-frete/config/status')
      .set('x-id-organizacao', 'org_test_003')

    expect(res.status).toBe(200)
    const nomes = res.body.status.map((s: { nome_status_cotacao_bid_frete: string }) => s.nome_status_cotacao_bid_frete)
    expect(nomes).not.toContain('PRIVADO')
  })
})

// ── POST / — Criar status ───────────────────────────────────────────────────

describe('POST /api/v1/bid-frete/config/status', () => {
  it('deve criar status customizado com sucesso', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/config/status')
      .set('x-id-organizacao', 'org_test_004')
      .send({
        nome_status_cotacao_bid_frete: 'EM_ANALISE_ARMADOR',
        rotulo_status_cotacao_bid_frete: 'Em Análise do Armador',
        cor_status_cotacao_bid_frete: '#8b5cf6',
      })

    expect(res.status).toBe(201)
    expect(res.body.status.nome_status_cotacao_bid_frete).toBe('EM_ANALISE_ARMADOR')
    expect(res.body.status.id_organizacao).toBe('org_test_004')
  })

  it('deve rejeitar body inválido (nome vazio)', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/config/status')
      .set('x-id-organizacao', 'org_test_005')
      .send({
        nome_status_cotacao_bid_frete: '',
        rotulo_status_cotacao_bid_frete: 'Vazio',
        cor_status_cotacao_bid_frete: '#fff',
      })

    expect(res.status).toBe(400)
  })

  it('deve rejeitar sem header x-id-organizacao', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/config/status')
      .send({
        nome_status_cotacao_bid_frete: 'TESTE',
        rotulo_status_cotacao_bid_frete: 'Teste',
        cor_status_cotacao_bid_frete: '#000000',
      })

    expect(res.status).toBe(401)
  })
})

// ── PATCH /:id — Editar status ──────────────────────────────────────────────

describe('PATCH /api/v1/bid-frete/config/status/:id', () => {
  it('deve editar rótulo e cor de um status existente', async () => {
    mockStatusList.push({
      id_status_cotacao_bid_frete: 'edit_1',
      id_organizacao: 'org_test_006',
      nome_status_cotacao_bid_frete: 'TESTE',
      rotulo_status_cotacao_bid_frete: 'Teste Original',
      cor_status_cotacao_bid_frete: '#aaa',
      ordem_status_cotacao_bid_frete: 1,
      gerenciado_sistema_status_cotacao_bid_frete: false,
    })

    const res = await request(app)
      .patch('/api/v1/bid-frete/config/status/edit_1')
      .set('x-id-organizacao', 'org_test_006')
      .send({
        rotulo_status_cotacao_bid_frete: 'Teste Editado',
        cor_status_cotacao_bid_frete: '#ff0000',
      })

    expect(res.status).toBe(200)
    expect(res.body.status.rotulo_status_cotacao_bid_frete).toBe('Teste Editado')
  })

  it('deve retornar 404 para status inexistente', async () => {
    const res = await request(app)
      .patch('/api/v1/bid-frete/config/status/nao_existe')
      .set('x-id-organizacao', 'org_test_007')
      .send({ rotulo_status_cotacao_bid_frete: 'Teste' })

    expect(res.status).toBe(404)
  })
})

// ── DELETE /:id — Excluir status ────────────────────────────────────────────

describe('DELETE /api/v1/bid-frete/config/status/:id', () => {
  it('deve excluir status não-sistema', async () => {
    mockStatusList.push({
      id_status_cotacao_bid_frete: 'del_1',
      id_organizacao: 'org_test_008',
      nome_status_cotacao_bid_frete: 'CUSTOMIZADO',
      rotulo_status_cotacao_bid_frete: 'Custom',
      cor_status_cotacao_bid_frete: '#ccc',
      ordem_status_cotacao_bid_frete: 1,
      gerenciado_sistema_status_cotacao_bid_frete: false,
    })

    const res = await request(app)
      .delete('/api/v1/bid-frete/config/status/del_1')
      .set('x-id-organizacao', 'org_test_008')

    expect(res.status).toBe(200)
    expect(res.body.deleted).toBe(true)
  })

  it('deve bloquear exclusão de status gerenciado pelo sistema', async () => {
    mockStatusList.push({
      id_status_cotacao_bid_frete: 'del_sistema',
      id_organizacao: 'org_test_009',
      nome_status_cotacao_bid_frete: 'RASCUNHO',
      rotulo_status_cotacao_bid_frete: 'Rascunho',
      cor_status_cotacao_bid_frete: '#94a3b8',
      ordem_status_cotacao_bid_frete: 1,
      gerenciado_sistema_status_cotacao_bid_frete: true,
    })

    const res = await request(app)
      .delete('/api/v1/bid-frete/config/status/del_sistema')
      .set('x-id-organizacao', 'org_test_009')

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('SYSTEM_STATUS')
  })

  it('deve retornar 404 para status inexistente', async () => {
    const res = await request(app)
      .delete('/api/v1/bid-frete/config/status/nao_existe')
      .set('x-id-organizacao', 'org_test_010')

    expect(res.status).toBe(404)
  })
})

// ── PATCH /reordenar — Reordenar status ─────────────────────────────────────

describe('PATCH /api/v1/bid-frete/config/status/reordenar', () => {
  it('deve reordenar status e retornar lista atualizada', async () => {
    mockStatusList.push(
      { id_status_cotacao_bid_frete: 'r1', id_organizacao: 'org_test_011', nome_status_cotacao_bid_frete: 'A', ordem_status_cotacao_bid_frete: 1 },
      { id_status_cotacao_bid_frete: 'r2', id_organizacao: 'org_test_011', nome_status_cotacao_bid_frete: 'B', ordem_status_cotacao_bid_frete: 2 },
    )

    const res = await request(app)
      .patch('/api/v1/bid-frete/config/status/reordenar')
      .set('x-id-organizacao', 'org_test_011')
      .send({ ids: ['r2', 'r1'] })

    expect(res.status).toBe(200)
    expect(mockPrisma.$transaction).toHaveBeenCalled()
  })

  it('deve rejeitar body inválido (ids vazio)', async () => {
    const res = await request(app)
      .patch('/api/v1/bid-frete/config/status/reordenar')
      .set('x-id-organizacao', 'org_test_012')
      .send({ ids: [] })

    expect(res.status).toBe(400)
  })
})
