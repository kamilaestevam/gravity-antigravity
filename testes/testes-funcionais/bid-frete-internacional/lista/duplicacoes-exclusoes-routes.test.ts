/// <reference types="vitest/globals" />
// @vitest-environment node

/**
 * Testes funcionais — duplicações e exclusões em lote (lista BID Frete Internacional)
 *
 * POST /cotacoes/duplicacoes
 * POST /bids-frete-internacional/duplicacoes
 * POST /cotacoes/exclusoes/preview | /confirmar
 * POST /bids-frete-internacional/exclusoes/preview | /confirmar
 */

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

// ── Stores em memória ────────────────────────────────────────────────────────

const mockCotacoes: Record<string, unknown>[] = []
const mockBids: Record<string, unknown>[] = []
let nextCotacaoId = 1
let nextBidId = 1

function idsDoWhere(where: Record<string, unknown> | undefined, campo: string): string[] | null {
  const filtro = where?.[campo] as { in?: string[] } | string | undefined
  if (filtro && typeof filtro === 'object' && Array.isArray(filtro.in)) return filtro.in
  if (typeof filtro === 'string') return [filtro]
  return null
}

const mockPrisma = {
  cotacaoBidFreteInternacional: {
    findMany: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
      const ids = idsDoWhere(where, 'id_cotacao_bid_frete_internacional')
      if (ids) return mockCotacoes.filter(c => ids.includes(c.id_cotacao_bid_frete_internacional as string))
      return [...mockCotacoes]
    }),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const cotacao = {
        id_cotacao_bid_frete_internacional: `cotacao_nova_${nextCotacaoId++}`,
        _count: { propostas: 0, disparos_cotacao: 0 },
        ...data,
      }
      mockCotacoes.push(cotacao)
      return cotacao
    }),
    deleteMany: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
      const ids = idsDoWhere(where, 'id_cotacao_bid_frete_internacional')
      const idBid = where.id_bid_bid_frete_internacional as string | undefined
      let count = 0
      for (let i = mockCotacoes.length - 1; i >= 0; i--) {
        const c = mockCotacoes[i]
        const match = ids
          ? ids.includes(c.id_cotacao_bid_frete_internacional as string)
          : idBid != null && c.id_bid_bid_frete_internacional === idBid
        if (match) {
          mockCotacoes.splice(i, 1)
          count++
        }
      }
      return { count }
    }),
  },
  bidFreteInternacional: {
    findMany: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
      const ids = idsDoWhere(where, 'id_bid_bid_frete_internacional')
      const bids = ids
        ? mockBids.filter(b => ids.includes(b.id_bid_bid_frete_internacional as string))
        : [...mockBids]
      return bids.map(b => ({
        ...b,
        cotacoes: mockCotacoes.filter(c => c.id_bid_bid_frete_internacional === b.id_bid_bid_frete_internacional),
      }))
    }),
    findFirst: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
      const bid = mockBids.find(b => b.id_bid_bid_frete_internacional === where.id_bid_bid_frete_internacional)
      if (!bid) return null
      return {
        ...bid,
        cotacoes: mockCotacoes.filter(c => c.id_bid_bid_frete_internacional === bid.id_bid_bid_frete_internacional),
      }
    }),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const bid = { id_bid_bid_frete_internacional: `bid_novo_${nextBidId++}`, ...data }
      mockBids.push(bid)
      return bid
    }),
    delete: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
      const idx = mockBids.findIndex(b => b.id_bid_bid_frete_internacional === where.id_bid_bid_frete_internacional)
      if (idx === -1) throw new Error('BID nao encontrado')
      return mockBids.splice(idx, 1)[0]
    }),
  },
  $transaction: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
}

// ── Mocks de serviços ────────────────────────────────────────────────────────

const { mockSincronizarResumoBid, mockRegistrar } = vi.hoisted(() => ({
  mockSincronizarResumoBid: vi.fn(async () => undefined),
  mockRegistrar: vi.fn(),
}))

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/agregar-resumo-bid-frete-internacional.js',
  () => ({
    sincronizarResumoBid: mockSincronizarResumoBid,
    gerarNumeroBidFreteInternacional: vi.fn(() => 'BIDG-TEST-0001'),
  }),
)

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/integracoes-tenant.js',
  () => ({
    atividadesIntegration: { cotacaoCriada: vi.fn() },
    historicoIntegration: { cotacaoCriada: vi.fn(), registrar: mockRegistrar },
  }),
)

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/motor-bid-frete-internacional.js',
  () => ({
    motorBid: { disparar: vi.fn(), dispararCotacaoAberta: vi.fn() },
  }),
)

// ── App de teste ─────────────────────────────────────────────────────────────

import { duplicacoesBidFreteInternacionalRouter } from '../../../../servicos-global/produto/bid-frete-internacional/server/src/routes/duplicacoes-bid-frete-internacional'
import { exclusoesBidFreteInternacionalRouter } from '../../../../servicos-global/produto/bid-frete-internacional/server/src/routes/exclusoes-bid-frete-internacional'

function criarApp() {
  const app = express()
  app.use(express.json())

  app.use((req: Request & { prisma?: typeof mockPrisma; tenantId?: string }, _res: Response, next: NextFunction) => {
    req.prisma = mockPrisma as unknown as typeof req.prisma
    req.tenantId = 'org_test_01'
    next()
  })

  app.use('/api/v1/bid-frete-internacional', duplicacoesBidFreteInternacionalRouter)
  app.use('/api/v1/bid-frete-internacional', exclusoesBidFreteInternacionalRouter)

  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode ?? 500
    res.status(statusCode).json({ error: { code: err.code ?? 'INTERNAL_ERROR', message: err.message } })
  })

  return app
}

const HEADERS = { 'x-id-usuario': 'user_test_01' }

function cotacaoBase(id: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id_cotacao_bid_frete_internacional: id,
    id_bid_bid_frete_internacional: null,
    id_organizacao: 'org_test_01',
    id_usuario: 'user_original',
    numero_cotacao_bid_frete_internacional: `BID-20260601-${id}`,
    status_cotacao_bid_frete_internacional: 'RASCUNHO',
    tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
    modal_cotacao_bid_frete_internacional: 'MARITIMO',
    modalidade_cotacao_bid_frete_internacional: 'FCL',
    origem_codigo_cotacao_bid_frete_internacional: 'BRSSZ',
    origem_nome_cotacao_bid_frete_internacional: 'Santos',
    origem_pais_cotacao_bid_frete_internacional: 'Brasil',
    destino_codigo_cotacao_bid_frete_internacional: 'NLRTM',
    destino_nome_cotacao_bid_frete_internacional: 'Roterdã',
    destino_pais_cotacao_bid_frete_internacional: 'Holanda',
    descricao_mercadoria_cotacao_bid_frete_internacional: 'Autopeças',
    incoterm_cotacao_bid_frete_internacional: 'FOB',
    data_aprovacao_cotacao_bid_frete_internacional: null,
    id_fornecedor_vencedor_cotacao_bid_frete_internacional: null,
    _count: { propostas: 0, disparos_cotacao: 0 },
    ...overrides,
  }
}

beforeEach(() => {
  mockCotacoes.length = 0
  mockBids.length = 0
  nextCotacaoId = 1
  nextBidId = 1
  vi.clearAllMocks()
})

// ── Duplicações ──────────────────────────────────────────────────────────────

describe('POST /api/v1/bid-frete-internacional/cotacoes/duplicacoes', () => {
  const app = criarApp()

  it('deve duplicar cotacao com numero novo, status RASCUNHO e campos de ciclo de vida zerados', async () => {
    mockCotacoes.push(cotacaoBase('c1', {
      status_cotacao_bid_frete_internacional: 'APROVADA',
      data_aprovacao_cotacao_bid_frete_internacional: '2026-06-01T00:00:00Z',
      id_fornecedor_vencedor_cotacao_bid_frete_internacional: 'forn_1',
      ganho_valor_cotacao_bid_frete_internacional: 500,
    }))

    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes/duplicacoes')
      .set(HEADERS)
      .send({ ids: ['c1'] })

    expect(res.status).toBe(201)
    expect(res.body.total_duplicadas).toBe(1)
    const copia = res.body.cotacoes[0]
    expect(copia.id_cotacao_bid_frete_internacional).not.toBe('c1')
    expect(copia.numero_cotacao_bid_frete_internacional).not.toBe('BID-20260601-c1')
    expect(copia.numero_cotacao_bid_frete_internacional).toContain('BID-')
    expect(copia.status_cotacao_bid_frete_internacional).toBe('RASCUNHO')
    expect(copia.data_aprovacao_cotacao_bid_frete_internacional).toBeNull()
    expect(copia.id_fornecedor_vencedor_cotacao_bid_frete_internacional).toBeNull()
    expect(copia.ganho_valor_cotacao_bid_frete_internacional).toBeNull()
    // Campos operacionais preservados
    expect(copia.origem_codigo_cotacao_bid_frete_internacional).toBe('BRSSZ')
    expect(copia.incoterm_cotacao_bid_frete_internacional).toBe('FOB')
    // Autoria passa a ser de quem duplicou
    expect(copia.id_usuario).toBe('user_test_01')
  })

  it('deve manter cotacao filha duplicada dentro do mesmo BID e sincronizar resumo', async () => {
    mockBids.push({ id_bid_bid_frete_internacional: 'bid_1', numero_bid_bid_frete_internacional: 'BIDG-001' })
    mockCotacoes.push(cotacaoBase('c2', { id_bid_bid_frete_internacional: 'bid_1' }))

    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes/duplicacoes')
      .set(HEADERS)
      .send({ ids: ['c2'] })

    expect(res.status).toBe(201)
    expect(res.body.cotacoes[0].id_bid_bid_frete_internacional).toBe('bid_1')
    expect(mockSincronizarResumoBid).toHaveBeenCalledWith(expect.anything(), 'bid_1')
  })

  it('deve retornar 404 quando nenhuma cotacao for encontrada', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes/duplicacoes')
      .set(HEADERS)
      .send({ ids: ['inexistente'] })

    expect(res.status).toBe(404)
  })

  it('deve retornar 400 quando ids estiver vazio', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes/duplicacoes')
      .set(HEADERS)
      .send({ ids: [] })

    expect(res.status).toBe(400)
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  it('deve retornar 401 sem x-id-usuario', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes/duplicacoes')
      .send({ ids: ['c1'] })

    expect(res.status).toBe(401)
  })
})

describe('POST /api/v1/bid-frete-internacional/bids-frete-internacional/duplicacoes', () => {
  const app = criarApp()

  it('deve duplicar BID com cotacoes filhas em RASCUNHO', async () => {
    mockBids.push({
      id_bid_bid_frete_internacional: 'bid_1',
      numero_bid_bid_frete_internacional: 'BIDG-001',
      referencia_interna_bid_bid_frete_internacional: 'REF-XYZ',
      status_bid_bid_frete_internacional: 'EM_ANDAMENTO',
      id_workspace: 'ws_1',
    })
    mockCotacoes.push(
      cotacaoBase('c1', { id_bid_bid_frete_internacional: 'bid_1', status_cotacao_bid_frete_internacional: 'EM_COTACAO' }),
      cotacaoBase('c2', { id_bid_bid_frete_internacional: 'bid_1' }),
    )

    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/bids-frete-internacional/duplicacoes')
      .set(HEADERS)
      .send({ ids: ['bid_1'] })

    expect(res.status).toBe(201)
    expect(res.body.total_duplicadas).toBe(1)
    const novoBid = res.body.bids_frete_internacional[0]
    expect(novoBid.id_bid_bid_frete_internacional).not.toBe('bid_1')
    expect(novoBid.status_bid_bid_frete_internacional).toBe('RASCUNHO')
    expect(novoBid.referencia_interna_bid_bid_frete_internacional).toBe('REF-XYZ')
    expect(novoBid.cotacoes).toHaveLength(2)
    for (const cotacao of novoBid.cotacoes) {
      expect(cotacao.status_cotacao_bid_frete_internacional).toBe('RASCUNHO')
      expect(cotacao.id_bid_bid_frete_internacional).toBe(novoBid.id_bid_bid_frete_internacional)
    }
  })

  it('deve retornar 404 quando nenhum BID for encontrado', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/bids-frete-internacional/duplicacoes')
      .set(HEADERS)
      .send({ ids: ['inexistente'] })

    expect(res.status).toBe(404)
  })
})

// ── Exclusões ────────────────────────────────────────────────────────────────

describe('POST /api/v1/bid-frete-internacional/cotacoes/exclusoes/preview', () => {
  const app = criarApp()

  it('deve separar permitidas e bloqueadas com motivo', async () => {
    mockCotacoes.push(
      cotacaoBase('c_rascunho'),
      cotacaoBase('c_enviada', {
        status_cotacao_bid_frete_internacional: 'ENVIADA_FORNECEDORES',
        _count: { propostas: 0, disparos_cotacao: 2 },
      }),
      cotacaoBase('c_com_propostas', {
        status_cotacao_bid_frete_internacional: 'EM_COTACAO',
        _count: { propostas: 3, disparos_cotacao: 2 },
      }),
    )

    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes/exclusoes/preview')
      .set(HEADERS)
      .send({ ids: ['c_rascunho', 'c_enviada', 'c_com_propostas'] })

    expect(res.status).toBe(200)
    expect(res.body.permitidas).toHaveLength(1)
    expect(res.body.permitidas[0].id_cotacao_bid_frete_internacional).toBe('c_rascunho')
    expect(res.body.bloqueadas).toHaveLength(2)
    const motivos = Object.fromEntries(
      res.body.bloqueadas.map((b: { id_cotacao_bid_frete_internacional: string; motivo_bloqueio: string }) =>
        [b.id_cotacao_bid_frete_internacional, b.motivo_bloqueio]),
    )
    expect(motivos.c_enviada).toBe('ENVIADA_FORNECEDOR')
    expect(motivos.c_com_propostas).toBe('COM_PROPOSTAS')
  })

  it('deve retornar 404 quando algum id nao existir', async () => {
    mockCotacoes.push(cotacaoBase('c_existente'))

    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes/exclusoes/preview')
      .set(HEADERS)
      .send({ ids: ['c_existente', 'c_inexistente'] })

    expect(res.status).toBe(404)
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND')
  })

  it('RASCUNHO com propostas deve ser bloqueada (propostas tem precedencia)', async () => {
    mockCotacoes.push(cotacaoBase('c_x', { _count: { propostas: 1, disparos_cotacao: 0 } }))

    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes/exclusoes/preview')
      .set(HEADERS)
      .send({ ids: ['c_x'] })

    expect(res.status).toBe(200)
    expect(res.body.permitidas).toHaveLength(0)
    expect(res.body.bloqueadas[0].motivo_bloqueio).toBe('COM_PROPOSTAS')
  })
})

describe('POST /api/v1/bid-frete-internacional/cotacoes/exclusoes/confirmar', () => {
  const app = criarApp()

  it('deve excluir apenas as permitidas e reportar bloqueadas', async () => {
    mockCotacoes.push(
      cotacaoBase('c_ok'),
      cotacaoBase('c_bloq', {
        status_cotacao_bid_frete_internacional: 'EM_COTACAO',
        _count: { propostas: 2, disparos_cotacao: 1 },
      }),
    )

    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes/exclusoes/confirmar')
      .set(HEADERS)
      .send({ ids: ['c_ok', 'c_bloq'] })

    expect(res.status).toBe(200)
    expect(res.body.total_excluidas).toBe(1)
    expect(res.body.ids_excluidos).toEqual(['c_ok'])
    expect(res.body.bloqueadas).toHaveLength(1)
    // c_bloq permanece no banco
    expect(mockCotacoes.map(c => c.id_cotacao_bid_frete_internacional)).toEqual(['c_bloq'])
    expect(mockRegistrar).toHaveBeenCalled()
  })

  it('deve retornar 404 quando algum id nao existir', async () => {
    mockCotacoes.push(cotacaoBase('c_ok'))

    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes/exclusoes/confirmar')
      .set(HEADERS)
      .send({ ids: ['c_ok', 'c_fantasma'] })

    expect(res.status).toBe(404)
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND')
  })

  it('deve sincronizar resumo do BID quando cotacao filha e excluida', async () => {
    mockBids.push({ id_bid_bid_frete_internacional: 'bid_1', numero_bid_bid_frete_internacional: 'BIDG-001' })
    mockCotacoes.push(cotacaoBase('c_filha', { id_bid_bid_frete_internacional: 'bid_1' }))

    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes/exclusoes/confirmar')
      .set(HEADERS)
      .send({ ids: ['c_filha'] })

    expect(res.status).toBe(200)
    expect(mockSincronizarResumoBid).toHaveBeenCalledWith(expect.anything(), 'bid_1')
  })
})

describe('POST /api/v1/bid-frete-internacional/bids-frete-internacional/exclusoes — preview e confirmar', () => {
  const app = criarApp()

  it('preview: BID com qualquer filha bloqueada fica bloqueado inteiro', async () => {
    mockBids.push(
      { id_bid_bid_frete_internacional: 'bid_ok', numero_bid_bid_frete_internacional: 'BIDG-001' },
      { id_bid_bid_frete_internacional: 'bid_bloq', numero_bid_bid_frete_internacional: 'BIDG-002' },
    )
    mockCotacoes.push(
      cotacaoBase('c1', { id_bid_bid_frete_internacional: 'bid_ok' }),
      cotacaoBase('c2', {
        id_bid_bid_frete_internacional: 'bid_bloq',
        status_cotacao_bid_frete_internacional: 'EM_COTACAO',
        _count: { propostas: 1, disparos_cotacao: 1 },
      }),
    )

    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/bids-frete-internacional/exclusoes/preview')
      .set(HEADERS)
      .send({ ids: ['bid_ok', 'bid_bloq'] })

    expect(res.status).toBe(200)
    expect(res.body.permitidos).toHaveLength(1)
    expect(res.body.permitidos[0].id_bid_bid_frete_internacional).toBe('bid_ok')
    expect(res.body.bloqueados).toHaveLength(1)
    expect(res.body.bloqueados[0].cotacoes_bloqueadas[0].motivo_bloqueio).toBe('COM_PROPOSTAS')
  })

  it('preview: deve retornar 404 quando algum BID nao existir', async () => {
    mockBids.push({ id_bid_bid_frete_internacional: 'bid_ok', numero_bid_bid_frete_internacional: 'BIDG-001' })

    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/bids-frete-internacional/exclusoes/preview')
      .set(HEADERS)
      .send({ ids: ['bid_ok', 'bid_fantasma'] })

    expect(res.status).toBe(404)
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND')
  })

  it('confirmar: exclui BID permitido com as filhas e mantem o bloqueado', async () => {
    mockBids.push(
      { id_bid_bid_frete_internacional: 'bid_ok', numero_bid_bid_frete_internacional: 'BIDG-001' },
      { id_bid_bid_frete_internacional: 'bid_bloq', numero_bid_bid_frete_internacional: 'BIDG-002' },
    )
    mockCotacoes.push(
      cotacaoBase('c1', { id_bid_bid_frete_internacional: 'bid_ok' }),
      cotacaoBase('c2', {
        id_bid_bid_frete_internacional: 'bid_bloq',
        status_cotacao_bid_frete_internacional: 'EM_COTACAO',
        _count: { propostas: 1, disparos_cotacao: 1 },
      }),
    )

    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/bids-frete-internacional/exclusoes/confirmar')
      .set(HEADERS)
      .send({ ids: ['bid_ok', 'bid_bloq'] })

    expect(res.status).toBe(200)
    expect(res.body.total_excluidos).toBe(1)
    expect(res.body.ids_excluidos).toEqual(['bid_ok'])
    expect(mockBids.map(b => b.id_bid_bid_frete_internacional)).toEqual(['bid_bloq'])
    expect(mockCotacoes.map(c => c.id_cotacao_bid_frete_internacional)).toEqual(['c2'])
  })
})
