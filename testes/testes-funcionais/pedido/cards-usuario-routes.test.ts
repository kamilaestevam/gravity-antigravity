/// <reference types="vitest/globals" />

import express from 'express'
import request from 'supertest'
import { cardsUsuarioRouter } from '../../../servicos-global/produto/pedido/server/src/routes/cards-usuario-pedido.js'

// ── Mock do withOrganizacao ──────────────────────────────────────────────────

const mockCards: Record<string, unknown>[] = []
let nextId = 1

const mockDb = {
  cardUsuario: {
    findMany: vi.fn(async ({ where, orderBy }: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }) => {
      return mockCards
        .filter(c => c.tenant_id === where.tenant_id)
        .sort((a, b) => a.ordem - b.ordem)
    }),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const card = { id: `card_${nextId++}`, ...data, created_at: '2026-05-17T00:00:00Z' }
      mockCards.push(card)
      return card
    }),
    update: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const card = mockCards.find(c => c.id === where.id && c.tenant_id === where.tenant_id)
      if (!card) throw new Error('Card não encontrado')
      Object.assign(card, data)
      return card
    }),
    delete: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
      const idx = mockCards.findIndex(c => c.id === where.id && c.tenant_id === where.tenant_id)
      if (idx === -1) throw new Error('Card não encontrado')
      mockCards.splice(idx, 1)
    }),
  },
  $transaction: vi.fn(async (ops: Promise<unknown>[]) => {
    for (const op of ops) await op
  }),
}

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: vi.fn(async (req: Record<string, unknown>, cb: (db: typeof mockDb) => Promise<unknown>) => {
    req.organizacao = {
      idOrganizacao: 'org_test_01',
      idUsuario: 'user_test_01',
    }
    return cb(mockDb)
  }),
}))

// ── App de teste ─────────────────────────────────────────────────────────────

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/pedidos/cards-usuario', cardsUsuarioRouter)
  app.use((err: Error & { statusCode?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: { message: err.message } })
  })
  return app
}

// ── Testes ───────────────────────────────────────────────────────────────────

describe('POST /api/v1/pedidos/cards-usuario', () => {
  const app = criarApp()

  const payloadValido = {
    nome: 'Total Valor',
    icone: 'CurrencyDollar',
    cor: '#34d399',
    formula_expressao: 'valor_total_pedido',
    formula_dependencias: ['valor_total_pedido'],
    ordem: 0,
    ativo: true,
  }

  beforeEach(() => {
    mockCards.length = 0
    nextId = 1
    vi.clearAllMocks()
  })

  it('201 — cria card com payload válido', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/cards-usuario')
      .send(payloadValido)

    expect(res.status).toBe(201)
    expect(res.body.nome).toBe('Total Valor')
    expect(res.body.tenant_id).toBe('org_test_01')
    expect(res.body.created_by).toBe('user_test_01')
    expect(res.body.id).toBeDefined()
  })

  it('400 — rejeita nome vazio', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/cards-usuario')
      .send({ ...payloadValido, nome: '' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('400 — rejeita cor inválida', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/cards-usuario')
      .send({ ...payloadValido, cor: 'nao-hex' })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita body vazio', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/cards-usuario')
      .send({})

    expect(res.status).toBe(400)
  })
})

describe('GET /api/v1/pedidos/cards-usuario', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCards.length = 0
    mockCards.push(
      { id: 'c1', tenant_id: 'org_test_01', nome: 'Card A', ordem: 1 },
      { id: 'c2', tenant_id: 'org_test_01', nome: 'Card B', ordem: 0 },
      { id: 'c3', tenant_id: 'org_outro', nome: 'Outro Tenant', ordem: 0 },
    )
    vi.clearAllMocks()
  })

  it('200 — retorna cards do tenant correto', async () => {
    const res = await request(app)
      .get('/api/v1/pedidos/cards-usuario')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(mockDb.cardUsuario.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenant_id: 'org_test_01' } }),
    )
  })
})

describe('PUT /api/v1/pedidos/cards-usuario/:id', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCards.length = 0
    mockCards.push({
      id: 'c1', tenant_id: 'org_test_01', nome: 'Antigo', icone: 'Star', cor: '#818cf8',
      formula_expressao: 'total_pedidos', ordem: 0, ativo: true,
    })
    vi.clearAllMocks()
  })

  it('200 — atualiza card com dados parciais', async () => {
    const res = await request(app)
      .put('/api/v1/pedidos/cards-usuario/c1')
      .send({ nome: 'Novo Nome' })

    expect(res.status).toBe(200)
    expect(res.body.nome).toBe('Novo Nome')
  })

  it('400 — rejeita cor inválida em update', async () => {
    const res = await request(app)
      .put('/api/v1/pedidos/cards-usuario/c1')
      .send({ cor: 'invalido' })

    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/v1/pedidos/cards-usuario/:id', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCards.length = 0
    mockCards.push({
      id: 'c1', tenant_id: 'org_test_01', nome: 'Card', ordem: 0,
    })
    vi.clearAllMocks()
  })

  it('204 — exclui card existente', async () => {
    const res = await request(app)
      .delete('/api/v1/pedidos/cards-usuario/c1')

    expect(res.status).toBe(204)
    expect(mockCards.length).toBe(0)
  })
})

describe('POST /api/v1/pedidos/cards-usuario/reordenar', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCards.length = 0
    mockCards.push(
      { id: 'c1', tenant_id: 'org_test_01', nome: 'A', ordem: 0 },
      { id: 'c2', tenant_id: 'org_test_01', nome: 'B', ordem: 1 },
    )
    vi.clearAllMocks()
  })

  it('200 — reordena com ids válidos', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/cards-usuario/reordenar')
      .send({ ids: ['c2', 'c1'] })

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(mockDb.$transaction).toHaveBeenCalled()
  })

  it('400 — rejeita ids vazio', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/cards-usuario/reordenar')
      .send({ ids: [] })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita body sem campo ids', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/cards-usuario/reordenar')
      .send({})

    expect(res.status).toBe(400)
  })
})
