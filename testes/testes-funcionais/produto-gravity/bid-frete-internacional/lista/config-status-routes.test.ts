/// <reference types="vitest/globals" />
// @vitest-environment node

/**
 * config-status-routes.test.ts — Testes funcionais das rotas CRUD de StatusCotacaoConfigBidFreteInternacional
 * Valida contratos HTTP, validação Zod, isolamento por organização, lazy seed.
 */

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

const ID_CAMPO = 'id_status_cotacao_config_bid_frete_internacional'
const NOME_CAMPO = 'nome_status_cotacao_config_bid_frete_internacional'
const ROTULO_CAMPO = 'rotulo_status_cotacao_config_bid_frete_internacional'
const COR_CAMPO = 'cor_status_cotacao_config_bid_frete_internacional'
const ORDEM_CAMPO = 'ordem_status_cotacao_config_bid_frete_internacional'
const GERENCIADO_CAMPO = 'gerenciado_sistema_status_cotacao_config_bid_frete_internacional'

const mockStatusList: Record<string, unknown>[] = []
let nextId = 1

const mockStatusCotacaoConfigBidFreteInternacional = {
  count: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
    return mockStatusList.filter(s => s.id_organizacao === where?.id_organizacao).length
  }),
  findMany: vi.fn(async ({
    where,
    orderBy,
    select,
  }: {
    where?: Record<string, unknown>
    orderBy?: Record<string, string>
    select?: Record<string, boolean>
  }) => {
    const filtered = mockStatusList
      .filter(s => s.id_organizacao === where?.id_organizacao)
      .sort((a, b) => (a[ORDEM_CAMPO] as number) - (b[ORDEM_CAMPO] as number))

    if (select) {
      return filtered.map((item) => {
        const picked: Record<string, unknown> = {}
        for (const key of Object.keys(select)) {
          picked[key] = item[key]
        }
        return picked
      })
    }

    if (orderBy?.[ORDEM_CAMPO] === 'desc') {
      return [...filtered].sort((a, b) => (b[ORDEM_CAMPO] as number) - (a[ORDEM_CAMPO] as number))
    }

    return filtered
  }),
  findFirst: vi.fn(async ({
    where,
    orderBy,
    select,
  }: {
    where: Record<string, unknown>
    orderBy?: Record<string, string>
    select?: Record<string, boolean>
  }) => {
    let filtered = mockStatusList.filter(s => s.id_organizacao === where.id_organizacao)
    if (where[ID_CAMPO]) {
      filtered = filtered.filter(s => s[ID_CAMPO] === where[ID_CAMPO])
    }
    if (orderBy?.[ORDEM_CAMPO] === 'desc') {
      filtered = [...filtered].sort((a, b) => (b[ORDEM_CAMPO] as number) - (a[ORDEM_CAMPO] as number))
    }
    const item = filtered[0] ?? null
    if (!item) return null
    if (select) {
      const picked: Record<string, unknown> = {}
      for (const key of Object.keys(select)) {
        picked[key] = item[key]
      }
      return picked
    }
    return item
  }),
  create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
    const status = {
      [ID_CAMPO]: `status_${nextId++}`,
      ...data,
    }
    mockStatusList.push(status)
    return status
  }),
  update: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
    const status = mockStatusList.find(s => s[ID_CAMPO] === where[ID_CAMPO])
    if (!status) throw new Error('Status nao encontrado')
    Object.assign(status, data)
    return status
  }),
  updateMany: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
    const matches = mockStatusList.filter(s => {
      if (s.id_organizacao !== where.id_organizacao) return false
      if (where[ID_CAMPO] && s[ID_CAMPO] !== where[ID_CAMPO]) return false
      const nomeIn = (where[NOME_CAMPO] as { in?: string[] } | undefined)?.in
      if (nomeIn && !nomeIn.includes(s[NOME_CAMPO] as string)) return false
      return true
    })
    for (const m of matches) Object.assign(m, data)
    return { count: matches.length }
  }),
  delete: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
    const idx = mockStatusList.findIndex(s => s[ID_CAMPO] === where[ID_CAMPO])
    if (idx === -1) throw new Error('Status nao encontrado')
    return mockStatusList.splice(idx, 1)[0]
  }),
}

const mockPrisma = {
  statusCotacaoConfigBidFreteInternacional: mockStatusCotacaoConfigBidFreteInternacional,
  $transaction: vi.fn(async (fns: Promise<unknown>[]) => Promise.all(fns)),
}

interface SeedPrismaMock {
  statusCotacaoConfigBidFreteInternacional: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>
  }
  $transaction: (fns: Promise<unknown>[]) => Promise<unknown[]>
}

vi.mock('../../../../servicos-global/produto/bid-frete-internacional/server/src/services/seedStatusPadrao.js', () => ({
  seedStatusPadrao: vi.fn(async (prisma: SeedPrismaMock, idOrg: string) => {
    const defaults = [
      'RASCUNHO', 'ENVIADA_FORNECEDORES', 'EM_COTACAO', 'AGUARDANDO_APROVACAO',
      'APROVADA', 'REPROVADA', 'CANCELADA', 'FALTA_INFORMACAO', 'EXPIRADA',
    ]
    for (let i = 0; i < defaults.length; i++) {
      await prisma.statusCotacaoConfigBidFreteInternacional.create({
        data: {
          id_organizacao: idOrg,
          [NOME_CAMPO]: defaults[i],
          [ROTULO_CAMPO]: defaults[i],
          [COR_CAMPO]: '#94a3b8',
          [ORDEM_CAMPO]: i + 1,
          padrao_status_cotacao_config_bid_frete_internacional: i === 0,
          [GERENCIADO_CAMPO]: i < 4,
        },
      })
    }
  }),
  garantirStatusCanonicos: vi.fn(async () => {}),
}))

vi.mock('../../../../servicos-global/produto/bid-frete-internacional/server/src/lib/erros.js', () => ({
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

let app: express.Express

beforeEach(async () => {
  vi.clearAllMocks()
  mockStatusList.length = 0
  nextId = 1

  const { configStatusRouter } = await import(
    '../../../../servicos-global/produto/bid-frete-internacional/server/src/routes/config-status.js'
  )

  app = express()
  app.use(express.json())

  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as Request & { prisma: typeof mockPrisma }).prisma = mockPrisma
    next()
  })

  app.use('/api/v1/bid-frete/config/status', configStatusRouter)

  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.statusCode ?? 500
    res.status(status).json({ error: err.message, code: err.code ?? 'INTERNAL_ERROR' })
  })
})

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
    expect(mockStatusCotacaoConfigBidFreteInternacional.count).toHaveBeenCalled()
  })

  it('deve retornar status existentes sem fazer seed', async () => {
    mockStatusList.push({
      [ID_CAMPO]: 'existing_1',
      id_organizacao: 'org_test_002',
      [NOME_CAMPO]: 'RASCUNHO',
      [ROTULO_CAMPO]: 'Rascunho',
      [COR_CAMPO]: '#94a3b8',
      [ORDEM_CAMPO]: 1,
      [GERENCIADO_CAMPO]: true,
    })

    const res = await request(app)
      .get('/api/v1/bid-frete/config/status')
      .set('x-id-organizacao', 'org_test_002')

    expect(res.status).toBe(200)
    expect(res.body.status).toHaveLength(1)
  })

  it('deve isolar status por organização (cross-tenant)', async () => {
    mockStatusList.push({
      [ID_CAMPO]: 'other_org',
      id_organizacao: 'org_OUTRA',
      [NOME_CAMPO]: 'PRIVADO',
      [ROTULO_CAMPO]: 'Privado',
      [COR_CAMPO]: '#ff0000',
      [ORDEM_CAMPO]: 1,
      [GERENCIADO_CAMPO]: false,
    })

    const res = await request(app)
      .get('/api/v1/bid-frete/config/status')
      .set('x-id-organizacao', 'org_test_003')

    expect(res.status).toBe(200)
    const nomes = res.body.status.map((s: Record<string, string>) => s[NOME_CAMPO])
    expect(nomes).not.toContain('PRIVADO')
  })
})

describe('POST /api/v1/bid-frete/config/status', () => {
  it('deve criar status customizado com sucesso', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/config/status')
      .set('x-id-organizacao', 'org_test_004')
      .send({
        [NOME_CAMPO]: 'EM_ANALISE_ARMADOR',
        [ROTULO_CAMPO]: 'Em Análise do Armador',
        [COR_CAMPO]: '#8b5cf6',
      })

    expect(res.status).toBe(201)
    expect(res.body.status[NOME_CAMPO]).toBe('EM_ANALISE_ARMADOR')
    expect(res.body.status.id_organizacao).toBe('org_test_004')
  })

  it('deve rejeitar body inválido (nome vazio)', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/config/status')
      .set('x-id-organizacao', 'org_test_005')
      .send({
        [NOME_CAMPO]: '',
        [ROTULO_CAMPO]: 'Vazio',
        [COR_CAMPO]: '#fff',
      })

    expect(res.status).toBe(400)
  })

  it('deve rejeitar sem header x-id-organizacao', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/config/status')
      .send({
        [NOME_CAMPO]: 'TESTE',
        [ROTULO_CAMPO]: 'Teste',
        [COR_CAMPO]: '#000000',
      })

    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/v1/bid-frete/config/status/:id', () => {
  it('deve editar rótulo e cor de um status existente', async () => {
    mockStatusList.push({
      [ID_CAMPO]: 'edit_1',
      id_organizacao: 'org_test_006',
      [NOME_CAMPO]: 'TESTE',
      [ROTULO_CAMPO]: 'Teste Original',
      [COR_CAMPO]: '#aaa',
      [ORDEM_CAMPO]: 1,
      [GERENCIADO_CAMPO]: false,
    })

    const res = await request(app)
      .patch('/api/v1/bid-frete/config/status/edit_1')
      .set('x-id-organizacao', 'org_test_006')
      .send({
        [ROTULO_CAMPO]: 'Teste Editado',
        [COR_CAMPO]: '#ff0000',
      })

    expect(res.status).toBe(200)
    expect(res.body.status[ROTULO_CAMPO]).toBe('Teste Editado')
  })

  it('deve retornar 404 para status inexistente', async () => {
    const res = await request(app)
      .patch('/api/v1/bid-frete/config/status/nao_existe')
      .set('x-id-organizacao', 'org_test_007')
      .send({ [ROTULO_CAMPO]: 'Teste' })

    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/v1/bid-frete/config/status/:id', () => {
  it('deve excluir status não-sistema', async () => {
    mockStatusList.push({
      [ID_CAMPO]: 'del_1',
      id_organizacao: 'org_test_008',
      [NOME_CAMPO]: 'CUSTOMIZADO',
      [ROTULO_CAMPO]: 'Custom',
      [COR_CAMPO]: '#ccc',
      [ORDEM_CAMPO]: 1,
      [GERENCIADO_CAMPO]: false,
    })

    const res = await request(app)
      .delete('/api/v1/bid-frete/config/status/del_1')
      .set('x-id-organizacao', 'org_test_008')

    expect(res.status).toBe(200)
    expect(res.body.deleted).toBe(true)
  })

  it('deve bloquear exclusão de status gerenciado pelo sistema', async () => {
    mockStatusList.push({
      [ID_CAMPO]: 'del_sistema',
      id_organizacao: 'org_test_009',
      [NOME_CAMPO]: 'RASCUNHO',
      [ROTULO_CAMPO]: 'Rascunho',
      [COR_CAMPO]: '#94a3b8',
      [ORDEM_CAMPO]: 1,
      [GERENCIADO_CAMPO]: true,
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

describe('PATCH /api/v1/bid-frete/config/status/reordenar', () => {
  it('deve reordenar status e retornar lista atualizada', async () => {
    mockStatusList.push(
      { [ID_CAMPO]: 'r1', id_organizacao: 'org_test_011', [NOME_CAMPO]: 'A', [ORDEM_CAMPO]: 1 },
      { [ID_CAMPO]: 'r2', id_organizacao: 'org_test_011', [NOME_CAMPO]: 'B', [ORDEM_CAMPO]: 2 },
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
