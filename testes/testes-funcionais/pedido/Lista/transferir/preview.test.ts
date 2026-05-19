// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

/**
 * Testes Funcionais — POST /:id_pedido/transferencias/preview
 *
 * Cobre: F-TPV-01 a F-TPV-30
 * Estratégia: Supertest + Zod real + error handler do router + Prisma mockado via withOrganizacao
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  pedido: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  pedidoItem: {
    findMany: vi.fn(),
  },
  pedidoTransferencia: {
    findMany: vi.fn(),
  },
  statusPedido: {
    findFirst: vi.fn(),
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

// ── Import da rota real ─────────────────────────────────────────────────────

import { transferirRouter } from '../../../../../servicos-global/produto/pedido/server/src/routes/transferencias-pedido.js'

// ── App de teste ─────────────────────────────────────────────────────────────

let app: express.Express

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as unknown as { organizacao: { idOrganizacao: string; idUsuario: string } }).organizacao = {
      idOrganizacao: 'org-001',
      idUsuario: 'usr-001',
    }
    req.params = { ...req.params, id_pedido: 'ped-001' }
    next()
  })
  app.use('/api/v1/pedidos/:id_pedido/transferencias', transferirRouter)
})

// ── Helpers ──────────────────────────────────────────────────────────────────

const PEDIDO_ORIGEM = {
  id_pedido: 'ped-001',
  id_organizacao: 'org-001',
  id_workspace: 'ws-001',
  numero_pedido: 'PED-001',
  tipo_operacao_pedido: 'importacao',
  incoterm_pedido: 'FOB',
  moeda_pedido: 'USD',
  itens_pedido: [
    {
      id_item: 'itm-001',
      id_organizacao: 'org-001',
      id_workspace: 'ws-001',
      id_pedido: 'ped-001',
      part_number_item: 'PN-001',
      descricao_item: 'Item A',
      ncm_item: '8471.30.19',
      unidade_comercializada_item: 'UN',
      moeda_item: 'USD',
      valor_por_unidade_item: 50,
      quantidade_atual_item: 100,
      quantidade_inicial_item: 100,
      quantidade_transferida_item: 0,
      sequencia_item_pedido: 1,
    },
  ],
}

const PEDIDO_DESTINO_EXISTENTE = {
  id_pedido: 'ped-002',
  id_organizacao: 'org-001',
  numero_pedido: 'PED-002',
  tipo_operacao_pedido: 'importacao',
  itens_pedido: [],
}

const PAYLOAD_PREVIEW_VALIDO = {
  cenario: 'split_novo_pedido',
  pedido_id: 'ped-001',
  item_id: 'itm-001',
  quantidade_origem: 30,
  destinos: [{ tipo: 'novo', quantidade: 30 }],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.pedido.findFirst.mockResolvedValue(PEDIDO_ORIGEM)
  mockPrisma.pedido.findMany.mockResolvedValue([])
})

// ── Happy Path ────────────────────────────────────────────────────────────────

describe('POST /transferencias/preview — Happy Path', () => {
  it('F-TPV-01: Preview split_novo_pedido → 200, origem com quantidade_apos', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send(PAYLOAD_PREVIEW_VALIDO)

    expect(res.status).toBe(200)
    expect(res.body.cenario).toBe('split_novo_pedido')
    expect(res.body.origem.pedido_numero).toBe('PED-001')
    expect(res.body.origem.quantidade_apos).toBe(70)
    expect(res.body.origem.encerra).toBe(false)
  })

  it('F-TPV-02: Preview detecta quantidade excedida → alerta global', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send({ ...PAYLOAD_PREVIEW_VALIDO, quantidade_origem: 150 })

    expect(res.status).toBe(200)
    expect(res.body.alertas_globais.length).toBeGreaterThan(0)
    expect(res.body.alertas_globais[0]).toContain('excede')
  })

  it('F-TPV-03: Preview com destino existente resolve número do pedido', async () => {
    mockPrisma.pedido.findFirst.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
      if (where.id_pedido === 'ped-001') return PEDIDO_ORIGEM
      if (where.id_pedido === 'ped-002') return PEDIDO_DESTINO_EXISTENTE
      return null
    })

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send({
        ...PAYLOAD_PREVIEW_VALIDO,
        cenario: 'split_pedido_existente',
        destinos: [{ tipo: 'existente', pedido_id: 'ped-002', quantidade: 30 }],
      })

    expect(res.status).toBe(200)
    expect(res.body.destinos[0].pedido_numero).toBe('PED-002')
  })

  it('F-TPV-04: Preview com destino existente inexistente → alerta no destino', async () => {
    mockPrisma.pedido.findFirst.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
      if (where.id_pedido === 'ped-001') return PEDIDO_ORIGEM
      return null
    })

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send({
        ...PAYLOAD_PREVIEW_VALIDO,
        cenario: 'split_pedido_existente',
        destinos: [{ tipo: 'existente', pedido_id: 'ped-inexistente', quantidade: 30 }],
      })

    expect(res.status).toBe(200)
    expect(res.body.destinos[0].alertas).toContain('Pedido destino não encontrado')
  })

  it('F-TPV-05: Preview com quantidade que zera pedido → encerra=true', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send({ ...PAYLOAD_PREVIEW_VALIDO, quantidade_origem: 100 })

    expect(res.status).toBe(200)
    expect(res.body.origem.encerra).toBe(true)
    expect(res.body.origem.quantidade_apos).toBe(0)
  })

  it('F-TPV-06: Preview detecta tipo_operacao divergente entre origem e destino existente', async () => {
    const pedidoDestinoExportacao = {
      ...PEDIDO_DESTINO_EXISTENTE,
      tipo_operacao_pedido: 'exportacao',
    }
    mockPrisma.pedido.findFirst.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
      if (where.id_pedido === 'ped-001') return PEDIDO_ORIGEM
      if (where.id_pedido === 'ped-002') return pedidoDestinoExportacao
      return null
    })
    mockPrisma.pedido.findMany.mockResolvedValue([pedidoDestinoExportacao])

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send({
        ...PAYLOAD_PREVIEW_VALIDO,
        cenario: 'split_pedido_existente',
        destinos: [{ tipo: 'existente', pedido_id: 'ped-002', quantidade: 30 }],
      })

    expect(res.status).toBe(200)
    expect(res.body.aviso_tipo_operacao).toBe(true)
  })
})

// ── Validação Zod (400) ───────────────────────────────────────────────────────

describe('POST /transferencias/preview — Validação Zod', () => {
  it('F-TPV-10: Body vazio retorna 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('F-TPV-11: Cenário inválido retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send({ ...PAYLOAD_PREVIEW_VALIDO, cenario: 'nao_existe' })

    expect(res.status).toBe(400)
  })

  it('F-TPV-12: pedido_id vazio retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send({ ...PAYLOAD_PREVIEW_VALIDO, pedido_id: '' })

    expect(res.status).toBe(400)
  })

  it('F-TPV-13: item_id vazio retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send({ ...PAYLOAD_PREVIEW_VALIDO, item_id: '' })

    expect(res.status).toBe(400)
  })

  it('F-TPV-14: quantidade_origem negativa retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send({ ...PAYLOAD_PREVIEW_VALIDO, quantidade_origem: -5 })

    expect(res.status).toBe(400)
  })

  it('F-TPV-15: quantidade_origem zero retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send({ ...PAYLOAD_PREVIEW_VALIDO, quantidade_origem: 0 })

    expect(res.status).toBe(400)
  })
})

// ── Erros de Negócio ──────────────────────────────────────────────────────────

describe('POST /transferencias/preview — Erros de Negócio', () => {
  it('F-TPV-20: Pedido não encontrado → 404', async () => {
    mockPrisma.pedido.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send(PAYLOAD_PREVIEW_VALIDO)

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('F-TPV-21: Item não encontrado no pedido → 404', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send({ ...PAYLOAD_PREVIEW_VALIDO, item_id: 'itm-inexistente' })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})

// ── Erro Interno ──────────────────────────────────────────────────────────────

describe('POST /transferencias/preview — Erro Interno', () => {
  it('F-TPV-30: Erro interno do banco retorna 500 sem stack trace', async () => {
    mockPrisma.pedido.findFirst.mockRejectedValue(new Error('Connection refused'))

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/preview')
      .send(PAYLOAD_PREVIEW_VALIDO)

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
    expect(res.body).not.toHaveProperty('stack')
  })
})
