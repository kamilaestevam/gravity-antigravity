// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

/**
 * Testes Funcionais — POST /duplicacoes/itens
 *
 * Cobre: F-ITN-01 a F-ITN-36
 * Estratégia: Supertest + Zod real + error handler real + Service mockado
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { mockDuplicarItens } = vi.hoisted(() => ({
  mockDuplicarItens: vi.fn(),
}))

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: vi.fn(async (req: Request, cb: (db: unknown) => Promise<void>) => {
    ;(req as unknown as { organizacao: { idOrganizacao: string; idUsuario: string } }).organizacao = {
      idOrganizacao: 'org-001',
      idUsuario: 'usr-001',
    }
    await cb({})
  }),
}))

vi.mock('../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js', () => ({
  DuplicarService: vi.fn().mockImplementation(() => ({
    preview: vi.fn(),
    confirmar: vi.fn(),
    duplicarItens: mockDuplicarItens,
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

// ── App de Teste ──────────────���──────────────────────────��────────────────────

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

// ── Helpers ───────���───────────────────────────────────────────────────────────

const OPCOES_ALL_TRUE = {
  copiar_datas: true,
  copiar_valores_precos: true,
  copiar_referencias_externas: true,
  copiar_pesos_cubagem: true,
  copiar_descricoes_complementares: true,
}

// ── Happy Path — 1 item ──────────────────────────────────────────────────────

describe('POST /duplicacoes/itens — Happy Path (1 item)', () => {
  it('F-ITN-01: Duplicar 1 item retorna 201 com criados.length=1', async () => {
    mockDuplicarItens.mockResolvedValue({
      criados: [{ original_id: 'it-001', novo_id: 'it-novo-001', numero_pedido: 'PED-001' }],
      erros: [],
    })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({ pedido_id: 'ped-001', item_ids: ['it-001'] })

    expect(res.status).toBe(201)
    expect(res.body.criados).toHaveLength(1)
    expect(res.body.erros).toHaveLength(0)
  })

  it('F-ITN-02: Item duplicado fica no mesmo pedido_id', async () => {
    mockDuplicarItens.mockResolvedValue({
      criados: [{ original_id: 'it-001', novo_id: 'it-novo', numero_pedido: 'PED-001' }],
      erros: [],
    })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({ pedido_id: 'ped-001', item_ids: ['it-001'] })

    expect(res.status).toBe(201)
    // Service foi chamado com pedido_id correto
    expect(mockDuplicarItens).toHaveBeenCalledWith(
      expect.anything(),
      'org-001',
      undefined,
      expect.objectContaining({ pedido_id: 'ped-001' }),
    )
  })
})

// ── Happy Path — múltiplos itens ──────────────────────────────────────────────

describe('POST /duplicacoes/itens — Happy Path (múltiplos itens)', () => {
  it('F-ITN-04: Duplicar 2 itens do mesmo pedido', async () => {
    mockDuplicarItens.mockResolvedValue({
      criados: [
        { original_id: 'it-001', novo_id: 'it-a', numero_pedido: 'PED-001' },
        { original_id: 'it-002', novo_id: 'it-b', numero_pedido: 'PED-001' },
      ],
      erros: [],
    })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({ pedido_id: 'ped-001', item_ids: ['it-001', 'it-002'] })

    expect(res.status).toBe(201)
    expect(res.body.criados).toHaveLength(2)
  })

  it('F-ITN-05: Duplicar 3 itens retorna 201', async () => {
    mockDuplicarItens.mockResolvedValue({
      criados: [
        { original_id: 'it-001', novo_id: 'a', numero_pedido: 'P' },
        { original_id: 'it-002', novo_id: 'b', numero_pedido: 'P' },
        { original_id: 'it-003', novo_id: 'c', numero_pedido: 'P' },
      ],
      erros: [],
    })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({ pedido_id: 'ped-001', item_ids: ['it-001', 'it-002', 'it-003'] })

    expect(res.status).toBe(201)
    expect(res.body.criados).toHaveLength(3)
  })
})

// ── Opções de Duplicação nos Itens ──────────────────────────────────────���─────

describe('POST /duplicacoes/itens — Opções de Duplicação', () => {
  it('F-ITN-10: copiar_valores_precos=false é passado ao service', async () => {
    mockDuplicarItens.mockResolvedValue({ criados: [], erros: [] })

    await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({
        pedido_id: 'ped-001',
        item_ids: ['it-001'],
        opcoes: { ...OPCOES_ALL_TRUE, copiar_valores_precos: false },
      })

    expect(mockDuplicarItens).toHaveBeenCalledWith(
      expect.anything(),
      'org-001',
      undefined,
      expect.objectContaining({
        opcoes: expect.objectContaining({ copiar_valores_precos: false }),
      }),
    )
  })

  it('F-ITN-15: Sem opcoes no payload (retrocompat)', async () => {
    mockDuplicarItens.mockResolvedValue({ criados: [{ original_id: 'x', novo_id: 'y', numero_pedido: 'Z' }], erros: [] })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({ pedido_id: 'ped-001', item_ids: ['it-001'] })

    expect(res.status).toBe(201)
    // Service recebe payload sem opcoes
    const payload = mockDuplicarItens.mock.calls[0][3]
    expect(payload.opcoes).toBeUndefined()
  })
})

// ── Validação Zod (400) ───────��───────────────────────────────────────────────

describe('POST /duplicacoes/itens — Validação Zod', () => {
  it('F-ITN-30: pedido_id vazio retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({ pedido_id: '', item_ids: ['it-001'] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('F-ITN-31: item_ids vazio retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({ pedido_id: 'ped-001', item_ids: [] })

    expect(res.status).toBe(400)
  })

  it('F-ITN-32: Body vazio retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({})

    expect(res.status).toBe(400)
  })

  it('F-ITN-33: pedido_id ausente retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({ item_ids: ['it-001'] })

    expect(res.status).toBe(400)
  })
})

// ── Erros de Negócio ──────────────────────────────────────────────────────────

describe('POST /duplicacoes/itens — Erros de Negócio', () => {
  it('F-ITN-34: Pedido não encontrado retorna 404', async () => {
    const { AppError: AE } = await import('../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js')
    mockDuplicarItens.mockRejectedValue(new AE('Pedido não encontrado', 404, 'NOT_FOUND'))

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({ pedido_id: 'nao-existe', item_ids: ['it-001'] })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('F-ITN-35: Item não pertence ao pedido retorna 404', async () => {
    const { AppError: AE } = await import('../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js')
    mockDuplicarItens.mockRejectedValue(new AE('Um ou mais itens não encontrados', 404, 'NOT_FOUND'))

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({ pedido_id: 'ped-001', item_ids: ['it-de-outro-pedido'] })

    expect(res.status).toBe(404)
  })

  it('F-ITN-36: 3 itens onde 1 não encontrado retorna 404', async () => {
    const { AppError: AE } = await import('../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js')
    mockDuplicarItens.mockRejectedValue(new AE('Um ou mais itens não encontrados', 404, 'NOT_FOUND'))

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({ pedido_id: 'ped-001', item_ids: ['it-001', 'it-002', 'it-999'] })

    expect(res.status).toBe(404)
  })
})
