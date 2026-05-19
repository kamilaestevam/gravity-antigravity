// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

/**
 * Testes Funcionais — POST /duplicacoes/confirmar
 *
 * Cobre: F-CNF-01 a F-CNF-37
 * Estratégia: Supertest + Zod real + error handler real + Service mockado
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { mockConfirmar } = vi.hoisted(() => ({
  mockConfirmar: vi.fn(),
}))

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: vi.fn(async (req: Request, cb: (db: unknown) => Promise<void>) => {
    ;(req as unknown as { organizacao: { idOrganizacao: string; idUsuario: string } }).organizacao = {
      idOrganizacao: 'org-001',
      idUsuario: 'usr-001',
    }
    ;(req as unknown as { auth: { nome_usuario: string } }).auth = { nome_usuario: 'Test User' }
    await cb({})
  }),
}))

vi.mock('../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js', () => ({
  DuplicarService: vi.fn().mockImplementation(() => ({
    preview: vi.fn(),
    confirmar: mockConfirmar,
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

// ── App de Teste ───��──────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

const OPCOES_ALL_TRUE = {
  copiar_datas: true,
  copiar_valores_precos: true,
  copiar_referencias_externas: true,
  copiar_pesos_cubagem: true,
  copiar_descricoes_complementares: true,
}

// ── Happy Path — 1 pedido ─────────────────────────────────────────────────────

describe('POST /duplicacoes/confirmar — Happy Path (1 pedido)', () => {
  it('F-CNF-01: Duplicar 1 pedido retorna 201 com criados.length=1', async () => {
    mockConfirmar.mockResolvedValue({
      criados: [{ original_id: 'ped-001', novo_id: 'ped-novo-001', numero_pedido: 'PED-COPIA' }],
      erros: [],
    })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({ ids: ['ped-001'] })

    expect(res.status).toBe(201)
    expect(res.body.criados).toHaveLength(1)
    expect(res.body.erros).toHaveLength(0)
  })

  it('F-CNF-02: Duplicar 1 pedido com número fornecido', async () => {
    mockConfirmar.mockResolvedValue({
      criados: [{ original_id: 'ped-001', novo_id: 'ped-novo', numero_pedido: 'COPIA-001' }],
      erros: [],
    })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({ ids: ['ped-001'], numeros: { 'ped-001': 'COPIA-001' } })

    expect(res.status).toBe(201)
    expect(res.body.criados[0].numero_pedido).toBe('COPIA-001')
  })

  it('F-CNF-03: Response body é { criados: [...], erros: [...] }', async () => {
    mockConfirmar.mockResolvedValue({
      criados: [{ original_id: 'x', novo_id: 'y', numero_pedido: 'Z' }],
      erros: [],
    })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({ ids: ['ped-001'] })

    expect(res.body).toHaveProperty('criados')
    expect(res.body).toHaveProperty('erros')
    expect(Array.isArray(res.body.criados)).toBe(true)
    expect(Array.isArray(res.body.erros)).toBe(true)
  })
})

// ── Happy Path — 2 pedidos ────────────────────────────────────────────────────

describe('POST /duplicacoes/confirmar — Happy Path (2 pedidos)', () => {
  it('F-CNF-04: Duplicar 2 pedidos retorna criados.length=2', async () => {
    mockConfirmar.mockResolvedValue({
      criados: [
        { original_id: 'ped-001', novo_id: 'ped-a', numero_pedido: 'A' },
        { original_id: 'ped-002', novo_id: 'ped-b', numero_pedido: 'B' },
      ],
      erros: [],
    })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({ ids: ['ped-001', 'ped-002'] })

    expect(res.status).toBe(201)
    expect(res.body.criados).toHaveLength(2)
  })

  it('F-CNF-05: Duplicar 2 pedidos com números distintos', async () => {
    mockConfirmar.mockResolvedValue({
      criados: [
        { original_id: 'ped-001', novo_id: 'p1', numero_pedido: 'NUM-A' },
        { original_id: 'ped-002', novo_id: 'p2', numero_pedido: 'NUM-B' },
      ],
      erros: [],
    })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({
        ids: ['ped-001', 'ped-002'],
        numeros: { 'ped-001': 'NUM-A', 'ped-002': 'NUM-B' },
      })

    expect(res.status).toBe(201)
    expect(res.body.criados[0].numero_pedido).toBe('NUM-A')
    expect(res.body.criados[1].numero_pedido).toBe('NUM-B')
  })

  it('F-CNF-06: 2 pedidos, 1 com número duplicado retorna criados=1, erros=1', async () => {
    mockConfirmar.mockResolvedValue({
      criados: [{ original_id: 'ped-001', novo_id: 'p1', numero_pedido: 'A' }],
      erros: [{ id: 'ped-002', motivo: 'Número "B" já está em uso' }],
    })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({ ids: ['ped-001', 'ped-002'] })

    expect(res.status).toBe(201)
    expect(res.body.criados).toHaveLength(1)
    expect(res.body.erros).toHaveLength(1)
    expect(res.body.erros[0].motivo).toContain('já está em uso')
  })
})

// ── Opções de Duplicação ──────────────────────────────────────────────────────

describe('POST /duplicacoes/confirmar — Opções de Duplicação', () => {
  it('F-CNF-10: copiar_valores_precos=false é passado ao service', async () => {
    mockConfirmar.mockResolvedValue({ criados: [], erros: [] })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({
        ids: ['ped-001'],
        opcoes: { ...OPCOES_ALL_TRUE, copiar_valores_precos: false },
      })

    expect(res.status).toBe(201)
    // Verificar que o service recebeu as opcoes corretas
    expect(mockConfirmar).toHaveBeenCalledWith(
      expect.anything(), // db
      'org-001', // id_organizacao
      undefined, // id_workspace (sem header)
      'usr-001', // id_usuario
      expect.any(String), // nome_usuario
      expect.objectContaining({
        ids: ['ped-001'],
        opcoes: expect.objectContaining({ copiar_valores_precos: false }),
      }),
    )
  })

  it('F-CNF-18: Sem opcoes no payload (retrocompat)', async () => {
    mockConfirmar.mockResolvedValue({ criados: [{ original_id: 'x', novo_id: 'y', numero_pedido: 'Z' }], erros: [] })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({ ids: ['ped-001'] })

    expect(res.status).toBe(201)
    expect(mockConfirmar).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(String),
      undefined,
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ ids: ['ped-001'] }),
    )
  })
})

// ── Validação Zod (400) ───────────────────────────────────────────────────────

describe('POST /duplicacoes/confirmar — Validação Zod', () => {
  it('F-CNF-31: Body vazio retorna 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('F-CNF-32: ids vazio retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({ ids: [] })

    expect(res.status).toBe(400)
  })

  it('F-CNF-33: opcoes com campo faltando retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({ ids: ['x'], opcoes: { copiar_datas: true } })

    expect(res.status).toBe(400)
  })

  it('F-CNF-34: ids com <script> aceita (Zod não faz sanitização HTML)', async () => {
    mockConfirmar.mockResolvedValue({ criados: [], erros: [] })

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({ ids: ['<script>alert(1)</script>'] })

    // Zod aceita qualquer string.min(1) — não quebra
    expect(res.status).toBe(201)
  })
})

// ── Erros de Negócio ──────────────────────────────────────────────────────────

describe('POST /duplicacoes/confirmar — Erros de Negócio', () => {
  it('F-CNF-35: Pedido não encontrado retorna 404', async () => {
    const { AppError: AE } = await import('../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js')
    mockConfirmar.mockRejectedValue(new AE('Um ou mais pedidos não encontrados', 404, 'NOT_FOUND'))

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({ ids: ['nao-existe'] })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('F-CNF-36: auto=false sem número fornecido retorna 400', async () => {
    const { AppError: AE } = await import('../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js')
    mockConfirmar.mockRejectedValue(new AE('Número do pedido não fornecido', 400, 'VALIDATION_ERROR'))

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({ ids: ['ped-001'] })

    expect(res.status).toBe(400)
  })

  it('F-CNF-37: Erro interno retorna 500 sem stack trace', async () => {
    mockConfirmar.mockRejectedValue(new Error('DB connection lost'))

    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({ ids: ['ped-001'] })

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
    expect(res.body.error.message).not.toContain('DB connection')
  })
})
