// @vitest-environment node
/**
 * TST-FUN-PEDIDO-PAINEL-LISTA — Persistência de colunas e ordenação no painel
 *
 * PUT /api/v1/pedidos/lista/paineis/:id (config_json) → GET /paineis confirma
 * colunas_visiveis e ordenacao persistidas (regressão TASK-000281).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { listaPaineisRouter } from '../../../../servicos-global/produto/pedido/server/src/routes/lista-pedido-paineis.js'
import {
  configListaPainelPadraoV1,
  ID_PRODUTO_GRAVITY_PEDIDO,
  parsearConfigListaPainel,
  serializarConfigListaPainel,
} from '../../../../servicos-global/produto/pedido/shared/listaPainelConfigSchema.js'
import { AppError } from '../../../../servicos-global/produto/pedido/server/src/errors/AppError.js'

interface PainelMock {
  id_lista_painel_usuario_global: string
  id_organizacao: string
  id_usuario: string
  id_produto_gravity: string
  nome_lista_painel_usuario_global: string
  ordem_lista_painel_usuario_global: number
  visivel_lista_painel_usuario_global: boolean
  config_json_lista_painel_usuario_global: string
  data_criacao_lista_painel_usuario_global: Date
  data_atualizacao_lista_painel_usuario_global: Date
}

const ORG = 'org_test_01'
const USER = 'user_test_01'

const mockPaineis: PainelMock[] = []
let nextPainelId = 1

function criarPainelSeed(configJson: string): PainelMock {
  const painel: PainelMock = {
    id_lista_painel_usuario_global: `painel_${nextPainelId++}`,
    id_organizacao: ORG,
    id_usuario: USER,
    id_produto_gravity: ID_PRODUTO_GRAVITY_PEDIDO,
    nome_lista_painel_usuario_global: 'Principal',
    ordem_lista_painel_usuario_global: 0,
    visivel_lista_painel_usuario_global: true,
    config_json_lista_painel_usuario_global: configJson,
    data_criacao_lista_painel_usuario_global: new Date('2026-06-01T00:00:00Z'),
    data_atualizacao_lista_painel_usuario_global: new Date('2026-06-01T00:00:00Z'),
  }
  mockPaineis.push(painel)
  return painel
}

const mockDb = {
  listaPainelUsuarioGlobal: {
    findMany: vi.fn(async ({ where, orderBy }: {
      where: Record<string, unknown>
      orderBy?: { ordem_lista_painel_usuario_global?: 'asc' | 'desc' }
    }) => {
      let rows = mockPaineis.filter(
        p =>
          p.id_organizacao === where.id_organizacao
          && p.id_usuario === where.id_usuario
          && p.id_produto_gravity === where.id_produto_gravity,
      )
      if (orderBy?.ordem_lista_painel_usuario_global === 'asc') {
        rows = [...rows].sort(
          (a, b) => a.ordem_lista_painel_usuario_global - b.ordem_lista_painel_usuario_global,
        )
      }
      return rows
    }),
    findFirst: vi.fn(async ({ where, orderBy, select }: {
      where: Record<string, unknown>
      orderBy?: { ordem_lista_painel_usuario_global?: 'asc' | 'desc' }
      select?: Record<string, boolean>
    }) => {
      let rows = mockPaineis.filter(p => {
        if (where.id_organizacao && p.id_organizacao !== where.id_organizacao) return false
        if (where.id_usuario && p.id_usuario !== where.id_usuario) return false
        if (where.id_produto_gravity && p.id_produto_gravity !== where.id_produto_gravity) return false
        if (
          where.id_lista_painel_usuario_global
          && p.id_lista_painel_usuario_global !== where.id_lista_painel_usuario_global
        ) {
          return false
        }
        return true
      })
      if (orderBy?.ordem_lista_painel_usuario_global === 'desc') {
        rows = [...rows].sort(
          (a, b) => b.ordem_lista_painel_usuario_global - a.ordem_lista_painel_usuario_global,
        )
      }
      const row = rows[0] ?? null
      if (!row || !select) return row
      return Object.fromEntries(
        Object.keys(select).filter(k => select[k]).map(k => [k, row[k as keyof PainelMock]]),
      )
    }),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const painel = criarPainelSeed(
        String(data.config_json_lista_painel_usuario_global ?? serializarConfigListaPainel(configListaPainelPadraoV1())),
      )
      Object.assign(painel, data)
      return painel
    }),
    update: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const painel = mockPaineis.find(
        p => p.id_lista_painel_usuario_global === where.id_lista_painel_usuario_global,
      )
      if (!painel) throw new AppError('Painel não encontrado', 404, 'NOT_FOUND')
      Object.assign(painel, data, {
        data_atualizacao_lista_painel_usuario_global: new Date('2026-06-02T00:00:00Z'),
      })
      return painel
    }),
    updateMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(async () => mockPaineis.length),
  },
  preferenciaUsuarioColunaPedido: {
    findUnique: vi.fn(async () => null),
  },
}

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: vi.fn(async (req: Request, cb: (db: typeof mockDb) => Promise<unknown>) => {
    ;(req as unknown as { organizacao: { idOrganizacao: string; idUsuario: string } }).organizacao = {
      idOrganizacao: ORG,
      idUsuario: USER,
    }
    return cb(mockDb)
  }),
}))

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/pedidos/lista', listaPaineisRouter)
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: { message: err.message, code: err.code } })
    }
    const message = err instanceof Error ? err.message : 'Erro interno'
    return res.status(500).json({ error: { message } })
  })
  return app
}

describe('PUT→GET painel lista — colunas_visiveis e ordenacao', () => {
  const app = criarApp()
  let painelId: string

  beforeEach(() => {
    mockPaineis.length = 0
    nextPainelId = 1
    vi.clearAllMocks()
    const configInicial = configListaPainelPadraoV1({
      colunas_visiveis: ['numero_pedido', 'status', 'data_emissao_pedido'],
      ordenacao: { campo: 'data_emissao_pedido', direcao: 'desc' },
    })
    painelId = criarPainelSeed(serializarConfigListaPainel(configInicial)).id_lista_painel_usuario_global
  })

  it('persiste colunas reordenadas e confirma no GET /paineis', async () => {
    const configAtualizado = configListaPainelPadraoV1({
      colunas_visiveis: ['status', 'numero_pedido', 'data_emissao_pedido'],
      ordenacao: { campo: 'data_emissao_pedido', direcao: 'desc' },
    })
    const configJson = serializarConfigListaPainel(configAtualizado)

    const putRes = await request(app)
      .put(`/api/v1/pedidos/lista/paineis/${painelId}`)
      .send({ config_json: configJson })

    expect(putRes.status).toBe(200)
    const configPut = parsearConfigListaPainel(String(putRes.body.data.config_json))
    expect(configPut.colunas_visiveis).toEqual(['status', 'numero_pedido', 'data_emissao_pedido'])

    const getRes = await request(app).get('/api/v1/pedidos/lista/paineis')
    expect(getRes.status).toBe(200)

    const painelGet = (getRes.body.data as Array<{ id: string; config_json: string }>)
      .find(p => p.id === painelId)
    expect(painelGet).toBeDefined()

    const configGet = parsearConfigListaPainel(String(painelGet!.config_json))
    expect(configGet.colunas_visiveis).toEqual(['status', 'numero_pedido', 'data_emissao_pedido'])
  })

  it('persiste ordenacao alterada e confirma no GET /paineis', async () => {
    const configAtualizado = configListaPainelPadraoV1({
      colunas_visiveis: ['numero_pedido', 'status', 'data_emissao_pedido'],
      ordenacao: { campo: 'numero_pedido', direcao: 'asc' },
    })
    const configJson = serializarConfigListaPainel(configAtualizado)

    const putRes = await request(app)
      .put(`/api/v1/pedidos/lista/paineis/${painelId}`)
      .send({ config_json: configJson })

    expect(putRes.status).toBe(200)
    const configPut = parsearConfigListaPainel(String(putRes.body.data.config_json))
    expect(configPut.ordenacao).toEqual({ campo: 'numero_pedido', direcao: 'asc' })

    const getRes = await request(app).get('/api/v1/pedidos/lista/paineis')
    expect(getRes.status).toBe(200)

    const painelGet = (getRes.body.data as Array<{ id: string; config_json: string }>)
      .find(p => p.id === painelId)
    const configGet = parsearConfigListaPainel(String(painelGet!.config_json))
    expect(configGet.ordenacao).toEqual({ campo: 'numero_pedido', direcao: 'asc' })
  })

  it('400 — rejeita config_json inválido', async () => {
    const res = await request(app)
      .put(`/api/v1/pedidos/lista/paineis/${painelId}`)
      .send({ config_json: JSON.stringify({ versao: 2, colunas_visiveis: [] }) })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('404 — painel inexistente não persiste', async () => {
    const configJson = serializarConfigListaPainel(configListaPainelPadraoV1())
    const res = await request(app)
      .put('/api/v1/pedidos/lista/paineis/painel_inexistente')
      .send({ config_json: configJson })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})
