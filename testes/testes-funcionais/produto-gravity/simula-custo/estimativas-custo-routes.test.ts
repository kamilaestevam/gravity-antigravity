/// <reference types="vitest/globals" />
// @vitest-environment node

/**
 * estimativas-custo-routes.test.ts — Testes funcionais das rotas CRUD de EstimativaCusto.
 * Valida contratos HTTP, validação Zod, cálculo automático persistido e
 * isolamento por organização (cross-tenant).
 *
 * O Prisma é mockado em memória emulando o comportamento do withTenantIsolation
 * (filtro por id_organizacao vindo do header, nunca do body).
 */
import express, { Response, NextFunction } from 'express'
import request from 'supertest'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// PTAX fixa para tornar o cálculo determinístico (USD → BRL = 5.0)
vi.mock(
  '../../../../servicos-global/produto/simula-custo/server/src/connectors/bacen.js',
  () => ({
    getLatestPtax: vi.fn(async () => ({ venda: 5.0, compra: 4.99, data: '2026-07-18' })),
  }),
)

import { estimativasCustoRouter } from '../../../../servicos-global/produto/simula-custo/server/src/routes/estimativas-custo.js'
import type { TenantRequest } from '../../../../servicos-global/produto/simula-custo/server/src/middleware/isolamento-tenant.js'
import { AppError } from '../../../../servicos-global/produto/simula-custo/server/src/lib/erros.js'

// ─── Mock Prisma em memória ───────────────────────────────────────────────────

interface LinhaEstimativa extends Record<string, unknown> {
  id_estimativa_custo: string
  id_organizacao: string
  taxas_origem: Record<string, unknown>[]
  taxas_destino: Record<string, unknown>[]
  tributos: Record<string, unknown>[]
  documentos: Record<string, unknown>[]
}

let estimativas: LinhaEstimativa[] = []
let sequencias: Record<string, number> = {}
let nextId = 1

function aplicarSelect(linha: LinhaEstimativa, select?: Record<string, boolean>) {
  if (!select) return linha
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(select)) out[k] = linha[k]
  return out
}

/** Emula o withTenantIsolation: todas as queries filtram por id_organizacao. */
function criarPrismaMock(orgId: string) {
  const filtrar = (where?: Record<string, unknown>) =>
    estimativas.filter(e => {
      if (e.id_organizacao !== orgId) return false
      for (const [k, v] of Object.entries(where ?? {})) {
        if (k === 'id_organizacao') continue
        if (k === 'OR' || typeof v === 'object') continue
        if (e[k] !== v) return false
      }
      return true
    })

  return {
    estimativaCusto: {
      create: vi.fn(async ({ data, select }: { data: Record<string, unknown>; select?: Record<string, boolean> }) => {
        const { taxas_origem, taxas_destino, documentos, ...campos } = data
        const linha: LinhaEstimativa = {
          quantidade_estimativa_custo: 1,
          descricao_ncm_estimativa_custo: null,
          ptax_utilizada_estimativa_custo: null,
          valor_aduaneiro_estimativa_custo: null,
          total_tributos_estimativa_custo: null,
          custo_nacionalizado_brl_estimativa_custo: null,
          fonte_calculo_estimativa_custo: null,
          data_criacao_estimativa_custo: new Date(),
          data_atualizacao_estimativa_custo: new Date(),
          ...campos,
          id_estimativa_custo: `est-${nextId++}`,
          id_organizacao: orgId,
          taxas_origem: ((taxas_origem as { create?: Record<string, unknown>[] })?.create ?? []) as Record<string, unknown>[],
          taxas_destino: ((taxas_destino as { create?: Record<string, unknown>[] })?.create ?? []) as Record<string, unknown>[],
          tributos: [],
          documentos: ((documentos as { create?: Record<string, unknown>[] })?.create ?? []) as Record<string, unknown>[],
        }
        estimativas.push(linha)
        return aplicarSelect(linha, select)
      }),
      findFirst: vi.fn(async ({ where, select }: { where?: Record<string, unknown>; select?: Record<string, boolean> }) => {
        const linha = filtrar(where)[0] ?? null
        return linha ? aplicarSelect(linha, select) : null
      }),
      findMany: vi.fn(async ({ where, select, skip = 0, take = 20 }: {
        where?: Record<string, unknown>; select?: Record<string, boolean>; skip?: number; take?: number
      }) => filtrar(where).slice(skip, skip + take).map(l => aplicarSelect(l, select))),
      count: vi.fn(async ({ where }: { where?: Record<string, unknown> } = {}) => filtrar(where).length),
      aggregate: vi.fn(async () => ({
        _avg: { custo_nacionalizado_brl_estimativa_custo: null },
        _max: { custo_nacionalizado_brl_estimativa_custo: null },
        _min: { custo_nacionalizado_brl_estimativa_custo: null },
        _sum: { total_tributos_estimativa_custo: null },
      })),
      update: vi.fn(async ({ where, data, select }: {
        where: Record<string, unknown>; data: Record<string, unknown>; select?: Record<string, boolean>
      }) => {
        const linha = filtrar(where)[0]
        if (!linha) throw Object.assign(new Error('Record not found'), { code: 'P2025' })
        const { tributos, taxas_origem, taxas_destino, documentos, ...campos } = data
        Object.assign(linha, campos, { data_atualizacao_estimativa_custo: new Date() })
        const nestedTributos = (tributos as { create?: Record<string, unknown>[] })?.create
        if (nestedTributos) linha.tributos = nestedTributos
        return aplicarSelect(linha, select)
      }),
      delete: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
        const linha = filtrar(where)[0]
        if (!linha) throw Object.assign(new Error('Record not found'), { code: 'P2025' })
        estimativas = estimativas.filter(e => e !== linha)
        return linha
      }),
    },
    sequenciaEstimativaCusto: {
      upsert: vi.fn(async () => {
        sequencias[orgId] = (sequencias[orgId] ?? 0) + 1
        return { ultimo_numero_sequencia_estimativa_custo: sequencias[orgId] }
      }),
    },
    taxaOrigemEstimativaCusto: { deleteMany: vi.fn(async () => ({ count: 0 })) },
    taxaDestinoEstimativaCusto: { deleteMany: vi.fn(async () => ({ count: 0 })) },
    documentoEstimativaCusto: { deleteMany: vi.fn(async () => ({ count: 0 })) },
    tributoEstimativaCusto: { deleteMany: vi.fn(async () => ({ count: 0 })) },
  }
}

// ─── App de teste (emula chave interna + tenant isolation) ────────────────────

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use((req: TenantRequest, _res, next) => {
    const org = req.headers['x-id-organizacao'] as string | undefined
    if (org) {
      req.tenantId = org
      req.idWorkspace = (req.headers['x-id-workspace'] as string | undefined) ?? undefined
      req.idUsuario = (req.headers['x-id-usuario'] as string | undefined) ?? undefined
      req.prisma = criarPrismaMock(org) as never
    }
    next()
  })
  app.use('/api/v1/simula-custo/estimativas-custo', estimativasCustoRouter)
  app.use((err: Error, _req: TenantRequest, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message, code: err.code })
    res.status(500).json({ error: err.message })
  })
  return app
}

const HEADERS_ORG_A = {
  'x-id-organizacao': 'org-a',
  'x-id-workspace': 'ws-a',
  'x-id-usuario': 'user-a',
}
const HEADERS_ORG_B = {
  'x-id-organizacao': 'org-b',
  'x-id-workspace': 'ws-b',
  'x-id-usuario': 'user-b',
}

const PAYLOAD_VALIDO = {
  referencia_estimativa_custo: 'FUN-TEST',
  ncm_estimativa_custo: '84713012',
  valor_produto_estimativa_custo: 10_000,
  moeda_produto_estimativa_custo: 'USD',
  aliquota_ii_estimativa_custo: 0.16,
  aliquota_ipi_estimativa_custo: 0.0325,
  aliquota_pis_estimativa_custo: 0.021,
  aliquota_cofins_estimativa_custo: 0.0965,
  aliquota_icms_estimativa_custo: 0.18,
  taxas_origem: [{ nome: 'THC', moeda: 'USD', valor_total: 120 }],
  documentos: [{ tipo_documento_estimativa_custo: 'INVOICE', numero_documento_estimativa_custo: 'INV-1' }],
}

beforeEach(() => {
  estimativas = []
  sequencias = {}
  nextId = 1
})

describe('POST /estimativas-custo', () => {
  it('retorna 401 sem x-id-organizacao', async () => {
    const res = await request(criarApp())
      .post('/api/v1/simula-custo/estimativas-custo')
      .send(PAYLOAD_VALIDO)
    expect(res.status).toBe(401)
  })

  it('retorna 400 com payload inválido (Zod)', async () => {
    const res = await request(criarApp())
      .post('/api/v1/simula-custo/estimativas-custo')
      .set(HEADERS_ORG_A)
      .send({ ncm_estimativa_custo: '12' })
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })

  it('cria com número sequencial e cálculo fiscal persistido', async () => {
    const res = await request(criarApp())
      .post('/api/v1/simula-custo/estimativas-custo')
      .set(HEADERS_ORG_A)
      .send(PAYLOAD_VALIDO)

    expect(res.status).toBe(201)
    const e = res.body.estimativa_custo
    expect(e.numero_estimativa_custo).toMatch(/^EST-IMP-00001\/\d{2}$/)
    expect(e.status_estimativa_custo).toBe('EM_CRIACAO')
    // PTAX mockada em 5.0 → VA = (10.000 + 120) × 5 = 50.600 BRL
    expect(e.ptax_utilizada_estimativa_custo).toBe(5)
    expect(e.valor_aduaneiro_estimativa_custo).toBeCloseTo(50_600, 2)
    expect(e.custo_nacionalizado_brl_estimativa_custo).toBeGreaterThan(e.valor_aduaneiro_estimativa_custo)
    expect(e.fonte_calculo_estimativa_custo).toBe('gravity-engine')
  })

  it('injeta id_organizacao do header nas taxas e documentos aninhados (nunca do body)', async () => {
    await request(criarApp())
      .post('/api/v1/simula-custo/estimativas-custo')
      .set(HEADERS_ORG_A)
      .send({ ...PAYLOAD_VALIDO, id_organizacao: 'org-maliciosa' })

    const criada = estimativas[0]
    expect(criada.id_organizacao).toBe('org-a')
    expect(criada.taxas_origem[0].id_organizacao).toBe('org-a')
    expect(criada.documentos[0].id_organizacao).toBe('org-a')
  })
})

describe('GET /estimativas-custo (isolamento por organização)', () => {
  it('org B não enxerga estimativas da org A', async () => {
    const app = criarApp()
    await request(app).post('/api/v1/simula-custo/estimativas-custo').set(HEADERS_ORG_A).send(PAYLOAD_VALIDO)

    const listaA = await request(app).get('/api/v1/simula-custo/estimativas-custo').set(HEADERS_ORG_A)
    const listaB = await request(app).get('/api/v1/simula-custo/estimativas-custo').set(HEADERS_ORG_B)

    expect(listaA.status).toBe(200)
    expect(listaA.body.estimativas_custo).toHaveLength(1)
    expect(listaB.body.estimativas_custo).toHaveLength(0)
  })

  it('GET detalhe cross-tenant retorna 404', async () => {
    const app = criarApp()
    const criada = await request(app).post('/api/v1/simula-custo/estimativas-custo').set(HEADERS_ORG_A).send(PAYLOAD_VALIDO)
    const id = criada.body.estimativa_custo.id_estimativa_custo

    const res = await request(app).get(`/api/v1/simula-custo/estimativas-custo/${id}`).set(HEADERS_ORG_B)
    expect(res.status).toBe(404)
  })
})

describe('PATCH /estimativas-custo/:id/status', () => {
  it('atualiza status válido e rejeita status fora do enum', async () => {
    const app = criarApp()
    const criada = await request(app).post('/api/v1/simula-custo/estimativas-custo').set(HEADERS_ORG_A).send(PAYLOAD_VALIDO)
    const id = criada.body.estimativa_custo.id_estimativa_custo

    const ok = await request(app)
      .patch(`/api/v1/simula-custo/estimativas-custo/${id}/status`)
      .set(HEADERS_ORG_A)
      .send({ status_estimativa_custo: 'CRIADA' })
    expect(ok.status).toBe(200)
    expect(ok.body.estimativa_custo.status_estimativa_custo).toBe('CRIADA')

    const invalido = await request(app)
      .patch(`/api/v1/simula-custo/estimativas-custo/${id}/status`)
      .set(HEADERS_ORG_A)
      .send({ status_estimativa_custo: 'CANCELADA' })
    expect(invalido.status).toBe(400)
  })
})

describe('POST /estimativas-custo/:id/duplicar', () => {
  it('duplica com novo número e status EM_CRIACAO', async () => {
    const app = criarApp()
    const criada = await request(app).post('/api/v1/simula-custo/estimativas-custo').set(HEADERS_ORG_A).send(PAYLOAD_VALIDO)
    const id = criada.body.estimativa_custo.id_estimativa_custo

    const dup = await request(app)
      .post(`/api/v1/simula-custo/estimativas-custo/${id}/duplicar`)
      .set(HEADERS_ORG_A)
    expect(dup.status).toBe(201)
    expect(dup.body.estimativa_custo.numero_estimativa_custo).toMatch(/^EST-IMP-00002\/\d{2}$/)
    expect(dup.body.estimativa_custo.status_estimativa_custo).toBe('EM_CRIACAO')
  })
})

describe('DELETE /estimativas-custo/:id', () => {
  it('exclui e retorna 404 para id inexistente', async () => {
    const app = criarApp()
    const criada = await request(app).post('/api/v1/simula-custo/estimativas-custo').set(HEADERS_ORG_A).send(PAYLOAD_VALIDO)
    const id = criada.body.estimativa_custo.id_estimativa_custo

    const del = await request(app).delete(`/api/v1/simula-custo/estimativas-custo/${id}`).set(HEADERS_ORG_A)
    expect([200, 204]).toContain(del.status)

    const denovo = await request(app).delete(`/api/v1/simula-custo/estimativas-custo/${id}`).set(HEADERS_ORG_A)
    expect(denovo.status).toBe(404)
  })
})
