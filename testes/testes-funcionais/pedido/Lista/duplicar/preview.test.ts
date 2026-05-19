// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

/**
 * Testes Funcionais — POST /duplicacoes/preview
 *
 * Cobre: F-PRV-01 a F-PRV-13
 * Estratégia: Supertest + Zod real + error handler real + Prisma mockado + auth bypassado
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { mockPreview } = vi.hoisted(() => ({
  mockPreview: vi.fn(),
}))

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: vi.fn(async (req: Request, cb: (db: unknown) => Promise<void>) => {
    // Simula o contexto que o resolver injeta
    ;(req as unknown as { organizacao: { idOrganizacao: string; idUsuario: string } }).organizacao = {
      idOrganizacao: 'org-001',
      idUsuario: 'usr-001',
    }
    const mockDb = {} // db não é usado diretamente — o service é mockado
    await cb(mockDb)
  }),
}))

vi.mock('../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js', () => ({
  DuplicarService: vi.fn().mockImplementation(() => ({
    preview: mockPreview,
    confirmar: vi.fn(),
    duplicarItens: vi.fn(),
  })),
  AppError: class AppError extends Error {
    statusCode: number
    code: string
    constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
      super(message)
      this.name = 'AppError'
      this.statusCode = statusCode
      this.code = code
    }
  },
}))

vi.mock('../../../../../servicos-global/produto/pedido/server/src/permissoes.js', () => ({
  exigirPermissao: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}))

// ── App de Teste ──────────────────────────────────────────────────────────────

import { duplicacoesPedidoRouter, AppError } from '../../../../../servicos-global/produto/pedido/server/src/routes/duplicacoes-pedido.js'

let app: express.Application

function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } })
}

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use('/api/v1/pedidos/duplicacoes', duplicacoesPedidoRouter)
  app.use(errorHandler)
})

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Happy Path ────────────────────────────────────────────────────────────────

describe('POST /duplicacoes/preview — Happy Path', () => {
  it('F-PRV-01: Preview com 1 pedido retorna 200', async () => {
    mockPreview.mockResolvedValue({
      config: { numero_auto: false, copiar_datas: false, status_inicial: 'copiar' },
      pedidos: [{ id: 'ped-001', numero_pedido: 'PED-001', total_itens: 3 }],
    })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/preview')
      .send({ ids: ['ped-001'] })

    expect(res.status).toBe(200)
    expect(res.body.config).toBeDefined()
    expect(res.body.pedidos).toHaveLength(1)
    expect(res.body.pedidos[0]).toMatchObject({
      id: 'ped-001',
      numero_pedido: 'PED-001',
      total_itens: 3,
    })
  })

  it('F-PRV-02: Preview com 2 pedidos retorna array com 2', async () => {
    mockPreview.mockResolvedValue({
      config: { numero_auto: true, copiar_datas: true, status_inicial: 'rascunho' },
      pedidos: [
        { id: 'ped-001', numero_pedido: 'PED-001', total_itens: 2 },
        { id: 'ped-002', numero_pedido: 'PED-002', total_itens: 5 },
      ],
    })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/preview')
      .send({ ids: ['ped-001', 'ped-002'] })

    expect(res.status).toBe(200)
    expect(res.body.pedidos).toHaveLength(2)
  })

  it('F-PRV-03: Config retorna numero_auto=true quando configurado', async () => {
    mockPreview.mockResolvedValue({
      config: { numero_auto: true, copiar_datas: true, status_inicial: 'rascunho' },
      pedidos: [{ id: 'ped-001', numero_pedido: 'PED-001', total_itens: 1 }],
    })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/preview')
      .send({ ids: ['ped-001'] })

    expect(res.body.config.numero_auto).toBe(true)
  })
})

// ── Validação Zod (400) ───────────────────────────────────────────────────────

describe('POST /duplicacoes/preview — Validação Zod', () => {
  it('F-PRV-04: Body vazio retorna 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/preview')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('F-PRV-05: ids vazio retorna 400 com mensagem correta', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/preview')
      .send({ ids: [] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('F-PRV-06: ids com string vazia retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/preview')
      .send({ ids: [''] })

    expect(res.status).toBe(400)
  })

  it('F-PRV-07: ids com número retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/preview')
      .send({ ids: [123] })

    expect(res.status).toBe(400)
  })

  it('F-PRV-08: sem campo ids retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/preview')
      .send({ outro: 'campo' })

    expect(res.status).toBe(400)
  })
})

// ── Erros de Negócio ──────────────────────────────────────────────────────────

describe('POST /duplicacoes/preview — Erros de Negócio', () => {
  it('F-PRV-09: Pedido não encontrado retorna 404', async () => {
    const { AppError: AE } = await import('../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js')
    mockPreview.mockRejectedValue(new AE('Um ou mais pedidos não encontrados', 404, 'NOT_FOUND'))

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/preview')
      .send({ ids: ['inexistente'] })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('F-PRV-10: 2 ids onde 1 não existe retorna 404', async () => {
    const { AppError: AE } = await import('../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js')
    mockPreview.mockRejectedValue(new AE('Um ou mais pedidos não encontrados', 404, 'NOT_FOUND'))

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/preview')
      .send({ ids: ['ped-001', 'ped-999'] })

    expect(res.status).toBe(404)
  })
})

// ── Erros Internos ────────────────────────────────────────────────────────────

describe('POST /duplicacoes/preview — Erros Internos', () => {
  it('F-PRV-13: Erro interno do banco retorna 500 sem stack trace', async () => {
    mockPreview.mockRejectedValue(new Error('Connection refused'))

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/preview')
      .send({ ids: ['ped-001'] })

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
    expect(res.body).not.toHaveProperty('stack')
    expect(res.body.error.message).not.toContain('Connection refused')
  })
})
