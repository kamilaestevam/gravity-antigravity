// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

/**
 * Testes Funcionais — POST /consolidacoes/preview
 *
 * Cobre: F-PRV-01 a F-PRV-30
 * Estratégia: Supertest + Zod real + error handler do router + Prisma mockado via withOrganizacao
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  pedido: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
}))

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: (_req: unknown, cb: (db: unknown) => Promise<unknown>) =>
    cb(mockPrisma),
}))

vi.mock('../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js', () => ({
  auditLog: vi.fn(),
}))

vi.mock('../../../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js', () => ({
  recalcularAgregadosPedido: vi.fn().mockResolvedValue({}),
}))

vi.mock('../../../../../servicos-global/produto/pedido/server/src/services/statusPedidoLookup.js', () => ({
  resolverIdStatusPedidoOpcional: vi.fn().mockResolvedValue('st-consolidado-001'),
}))

// ── Import da rota real ─────────────────────────────────────────────────────

import { consolidarRouter } from '../../../../../servicos-global/produto/pedido/server/src/routes/consolidacoes-pedido.js'

// ── App de teste ─────────────────────────────────────────────────────────────

let app: express.Express

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as unknown as { organizacao: { idOrganizacao: string } }).organizacao = { idOrganizacao: 'org-001' }
    next()
  })
  app.use('/api/v1/pedidos/consolidacoes', consolidarRouter)
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function criarPedidoMock(overrides: Record<string, unknown> = {}) {
  return {
    id_pedido: 'ped-001',
    id_organizacao: 'org-001',
    numero_pedido: 'PED-001',
    tipo_operacao_pedido: 'importacao',
    incoterm_pedido: 'FOB',
    moeda_pedido: 'USD',
    condicao_pagamento_pedido: '30 dias',
    valor_total_pedido: 5000,
    detalhes_operacionais_pedido: {},
    itens_pedido: [
      {
        id_item: 'itm-001',
        part_number_item: 'PN-001',
        descricao_item: 'Item A',
        ncm_item: '8471.30.19',
        unidade_comercializada_item: 'UN',
        moeda_item: 'USD',
        valor_por_unidade_item: 50,
        quantidade_atual_item: 100,
      },
    ],
    ...overrides,
  }
}

const PEDIDO_1 = criarPedidoMock()
const PEDIDO_2 = criarPedidoMock({
  id_pedido: 'ped-002',
  numero_pedido: 'PED-002',
  valor_total_pedido: 3000,
  itens_pedido: [
    {
      id_item: 'itm-002',
      part_number_item: 'PN-002',
      descricao_item: 'Item B',
      ncm_item: '8471.30.20',
      unidade_comercializada_item: 'UN',
      moeda_item: 'USD',
      valor_por_unidade_item: 30,
      quantidade_atual_item: 100,
    },
  ],
})

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.pedido.findMany.mockResolvedValue([PEDIDO_1, PEDIDO_2])
  mockPrisma.pedido.count.mockResolvedValue(10)
})

// ── Happy Path ────────────────────────────────────────────────────────────────

describe('POST /consolidacoes/preview — Happy Path', () => {
  it('F-PRV-01: Preview com 2 pedidos iguais → 200, campos_iguais preenchido', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: ['ped-001', 'ped-002'] })

    expect(res.status).toBe(200)
    expect(res.body.ids).toEqual(['ped-001', 'ped-002'])
    expect(Array.isArray(res.body.campos_divergentes)).toBe(true)
    expect(Array.isArray(res.body.campos_iguais)).toBe(true)
  })

  it('F-PRV-02: Preview detecta divergência quando incoterm difere', async () => {
    const pedido2Divergente = criarPedidoMock({
      id_pedido: 'ped-002',
      numero_pedido: 'PED-002',
      incoterm_pedido: 'CIF',
    })
    mockPrisma.pedido.findMany.mockResolvedValue([PEDIDO_1, pedido2Divergente])

    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: ['ped-001', 'ped-002'] })

    expect(res.status).toBe(200)
    const incotermDiv = res.body.campos_divergentes.find(
      (c: { campo: string }) => c.campo === 'incoterm_pedido',
    )
    expect(incotermDiv).toBeDefined()
    expect(incotermDiv.valores).toHaveLength(2)
  })

  it('F-PRV-03: Preview retorna itens consolidados por part_number', async () => {
    const pedido2MesmoPart = criarPedidoMock({
      id_pedido: 'ped-002',
      numero_pedido: 'PED-002',
      itens_pedido: [
        {
          id_item: 'itm-003',
          part_number_item: 'PN-001',
          descricao_item: 'Item A duplicado',
          ncm_item: '8471.30.19',
          unidade_comercializada_item: 'UN',
          moeda_item: 'USD',
          valor_por_unidade_item: 50,
          quantidade_atual_item: 200,
        },
      ],
    })
    mockPrisma.pedido.findMany.mockResolvedValue([PEDIDO_1, pedido2MesmoPart])

    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: ['ped-001', 'ped-002'] })

    expect(res.status).toBe(200)
    const itemPN001 = res.body.itens.find((i: { part_number: string }) => i.part_number === 'PN-001')
    expect(itemPN001).toBeDefined()
    expect(itemPN001.quantidade_total).toBe(300)
    expect(itemPN001.pode_fundir).toBe(true)
  })

  it('F-PRV-04: Preview retorna valor_total_soma = soma dos pedidos', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: ['ped-001', 'ped-002'] })

    expect(res.status).toBe(200)
    expect(res.body.valor_total_soma).toBe(8000)
  })

  it('F-PRV-05: Preview retorna numero_sugerido no formato PO-CONS-{ANO}/{SEQ}', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: ['ped-001', 'ped-002'] })

    expect(res.status).toBe(200)
    expect(res.body.numero_sugerido).toMatch(/^PO-CONS-\d{4}\/\d{3}$/)
  })

  it('F-PRV-06: Preview detecta conflito_tipo_operacao quando tipos mistos', async () => {
    const pedidoExportacao = criarPedidoMock({
      id_pedido: 'ped-002',
      numero_pedido: 'PED-002',
      tipo_operacao_pedido: 'exportacao',
    })
    mockPrisma.pedido.findMany.mockResolvedValue([PEDIDO_1, pedidoExportacao])

    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: ['ped-001', 'ped-002'] })

    expect(res.status).toBe(200)
    expect(res.body.conflito_tipo_operacao).toBe(true)
  })

  it('F-PRV-07: Preview retorna pedidos_info com shape correto', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: ['ped-001', 'ped-002'] })

    expect(res.status).toBe(200)
    expect(res.body.pedidos_info).toHaveLength(2)
    expect(res.body.pedidos_info[0]).toMatchObject({
      id: expect.any(String),
      numero: expect.any(String),
      total_itens: expect.any(Number),
    })
  })
})

// ── Validação Zod (400) ───────────────────────────────────────────────────────

describe('POST /consolidacoes/preview — Validação Zod', () => {
  it('F-PRV-10: Body vazio retorna 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('F-PRV-11: ids vazio retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: [] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('F-PRV-12: ids com 1 só pedido retorna 400 (min 2)', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: ['ped-001'] })

    expect(res.status).toBe(400)
  })

  it('F-PRV-13: ids com string vazia retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: ['', 'ped-002'] })

    expect(res.status).toBe(400)
  })

  it('F-PRV-14: ids com número retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: [123, 456] })

    expect(res.status).toBe(400)
  })

  it('F-PRV-15: Sem campo ids retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ outro: 'campo' })

    expect(res.status).toBe(400)
  })
})

// ── Erros de Negócio ──────────────────────────────────────────────────────────

describe('POST /consolidacoes/preview — Erros de Negócio', () => {
  it('F-PRV-20: Nenhum pedido encontrado retorna 404', async () => {
    mockPrisma.pedido.findMany.mockResolvedValue([])

    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: ['inexistente-1', 'inexistente-2'] })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('F-PRV-21: 2 ids onde 1 não existe retorna 404 (parcial)', async () => {
    mockPrisma.pedido.findMany.mockResolvedValue([PEDIDO_1])

    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: ['ped-001', 'ped-999'] })

    expect(res.status).toBe(404)
    expect(res.body.error.message).toContain('Não foram encontrados')
  })
})

// ── Erro Interno ──────────────────────────────────────────────────────────────

describe('POST /consolidacoes/preview — Erro Interno', () => {
  it('F-PRV-30: Erro interno do banco retorna 500 sem stack trace', async () => {
    mockPrisma.pedido.findMany.mockRejectedValue(new Error('Connection refused'))

    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: ['ped-001', 'ped-002'] })

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
    expect(res.body).not.toHaveProperty('stack')
  })
})
