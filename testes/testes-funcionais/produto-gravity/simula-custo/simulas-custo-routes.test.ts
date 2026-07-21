/// <reference types="vitest/globals" />
// @vitest-environment node

/**
 * simulas-custo-routes.test.ts — Testes funcionais das rotas CRUD de SimulaCusto.
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
  '../../../../servicos-global/produto/simula-custo/server/src/lib/taxas-moeda-client.js',
  () => ({
    obterPtaxVendaSimulaCusto: vi.fn(async () => 5.0),
    obterPtaxMoedaSimulaCusto: vi.fn(async () => ({
      venda: 5.0,
      compra: 4.99,
      data_cotacao: '2026-07-18',
      boletim: 'Fechamento',
      fonte: 'BCB/PTAX',
    })),
  }),
)

import { simulasCustoRouter } from '../../../../servicos-global/produto/simula-custo/server/src/routes/simulas-custo.js'
import type { TenantRequest } from '../../../../servicos-global/produto/simula-custo/server/src/middleware/isolamento-tenant.js'
import { AppError } from '../../../../servicos-global/produto/simula-custo/server/src/lib/erros.js'

// ─── Mock Prisma em memória ───────────────────────────────────────────────────

interface LinhaSimula extends Record<string, unknown> {
  id_simula_custo: string
  id_organizacao: string
  taxas_origem_simula_custo: Record<string, unknown>[]
  taxas_destino_simula_custo: Record<string, unknown>[]
  documentos_simula_custo: Record<string, unknown>[]
  prazos_pagamento_simula_custo: Record<string, unknown>[]
}

let simulas: LinhaSimula[] = []
let sequencias: Record<string, number> = {}
let nextId = 1

function aplicarSelect(linha: LinhaSimula, select?: Record<string, boolean>) {
  if (!select) return linha
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(select)) out[k] = linha[k]
  return out
}

/** Emula o withTenantIsolation: todas as queries filtram por id_organizacao. */
function criarPrismaMock(orgId: string) {
  const filtrar = (where?: Record<string, unknown>) =>
    simulas.filter(e => {
      if (e.id_organizacao !== orgId) return false
      for (const [k, v] of Object.entries(where ?? {})) {
        if (k === 'id_organizacao') continue
        if (k === 'OR' || typeof v === 'object') continue
        if (e[k] !== v) return false
      }
      return true
    })

  return {
    simulaCusto: {
      create: vi.fn(async ({ data, select }: { data: Record<string, unknown>; select?: Record<string, boolean> }) => {
        const { taxas_origem_simula_custo, taxas_destino_simula_custo, documentos_simula_custo, prazos_pagamento_simula_custo, ...campos } = data
        const linha: LinhaSimula = {
          quantidade_simula_custo: 1,
          descricao_ncm_simula_custo: null,
          ptax_utilizada_simula_custo: null,
          valor_aduaneiro_simula_custo: null,
          total_tributos_simula_custo: null,
          custo_nacionalizado_brl_simula_custo: null,
          fonte_calculo_simula_custo: null,
          data_criacao_simula_custo: new Date(),
          data_atualizacao_simula_custo: new Date(),
          ...campos,
          id_simula_custo: `est-${nextId++}`,
          id_organizacao: orgId,
          taxas_origem_simula_custo: ((taxas_origem_simula_custo as { create?: Record<string, unknown>[] })?.create ?? []) as Record<string, unknown>[],
          taxas_destino_simula_custo: ((taxas_destino_simula_custo as { create?: Record<string, unknown>[] })?.create ?? []) as Record<string, unknown>[],
          documentos_simula_custo: ((documentos_simula_custo as { create?: Record<string, unknown>[] })?.create ?? []) as Record<string, unknown>[],
          prazos_pagamento_simula_custo: ((prazos_pagamento_simula_custo as { create?: Record<string, unknown>[] })?.create ?? []) as Record<string, unknown>[],
        }
        simulas.push(linha)
        return aplicarSelect(linha, select)
      }),
      findFirst: vi.fn(async ({ where, select, include }: {
        where?: Record<string, unknown>
        select?: Record<string, boolean>
        include?: Record<string, boolean>
      }) => {
        const linha = filtrar(where)[0] ?? null
        if (!linha) return null
        if (include) return linha
        return aplicarSelect(linha, select)
      }),
      findMany: vi.fn(async ({ where, select, skip = 0, take = 20 }: {
        where?: Record<string, unknown>; select?: Record<string, boolean>; skip?: number; take?: number
      }) => filtrar(where).slice(skip, skip + take).map(l => aplicarSelect(l, select))),
      count: vi.fn(async ({ where }: { where?: Record<string, unknown> } = {}) => filtrar(where).length),
      aggregate: vi.fn(async () => ({
        _avg: { custo_nacionalizado_brl_simula_custo: null },
        _max: { custo_nacionalizado_brl_simula_custo: null },
        _min: { custo_nacionalizado_brl_simula_custo: null },
        _sum: { total_tributos_simula_custo: null },
      })),
      update: vi.fn(async ({ where, data, select }: {
        where: Record<string, unknown>; data: Record<string, unknown>; select?: Record<string, boolean>
      }) => {
        const linha = filtrar(where)[0]
        if (!linha) throw Object.assign(new Error('Record not found'), { code: 'P2025' })
        const { taxas_origem_simula_custo, taxas_destino_simula_custo, documentos_simula_custo, prazos_pagamento_simula_custo, ...campos } = data
        Object.assign(linha, campos, { data_atualizacao_simula_custo: new Date() })
        return aplicarSelect(linha, select)
      }),
      delete: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
        const linha = filtrar(where)[0]
        if (!linha) throw Object.assign(new Error('Record not found'), { code: 'P2025' })
        simulas = simulas.filter(e => e !== linha)
        return linha
      }),
    },
    sequenciaSimulaCusto: {
      upsert: vi.fn(async () => {
        sequencias[orgId] = (sequencias[orgId] ?? 0) + 1
        return { ultimo_numero_sequencia_simula_custo: sequencias[orgId] }
      }),
    },
    taxaOrigemSimulaCusto: { deleteMany: vi.fn(async () => ({ count: 0 })) },
    taxaDestinoSimulaCusto: { deleteMany: vi.fn(async () => ({ count: 0 })) },
    documentoSimulaCusto: { deleteMany: vi.fn(async () => ({ count: 0 })) },
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
  app.use('/api/v1/simula-custo/simulas-custo', simulasCustoRouter)
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
  referencia_simula_custo: 'FUN-TEST',
  ncm_simula_custo: '84713012',
  valor_produto_simula_custo: 10_000,
  moeda_produto_simula_custo: 'USD',
  aliquota_ii_simula_custo: 0.16,
  aliquota_ipi_simula_custo: 0.0325,
  aliquota_pis_simula_custo: 0.021,
  aliquota_cofins_simula_custo: 0.0965,
  aliquota_icms_simula_custo: 0.18,
  taxas_origem_simula_custo: [{
    nome_taxa_origem_simula_custo: 'THC',
    moeda_taxa_origem_simula_custo: 'USD',
    valor_total_taxa_origem_simula_custo: 120,
  }],
  documentos_simula_custo: [{ tipo_documento_simula_custo: 'INVOICE', numero_documento_simula_custo: 'INV-1' }],
}

beforeEach(() => {
  simulas = []
  sequencias = {}
  nextId = 1
})

describe('POST /simulas-custo', () => {
  it('retorna 401 sem x-id-organizacao', async () => {
    const res = await request(criarApp())
      .post('/api/v1/simula-custo/simulas-custo')
      .send(PAYLOAD_VALIDO)
    expect(res.status).toBe(401)
  })

  it('retorna 400 com payload inválido (Zod)', async () => {
    const res = await request(criarApp())
      .post('/api/v1/simula-custo/simulas-custo')
      .set(HEADERS_ORG_A)
      .send({ ncm_simula_custo: '12' })
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })

  it('cria com número sequencial e cálculo fiscal persistido', async () => {
    const res = await request(criarApp())
      .post('/api/v1/simula-custo/simulas-custo')
      .set(HEADERS_ORG_A)
      .send(PAYLOAD_VALIDO)

    expect(res.status).toBe(201)
    const e = res.body.simula_custo
    expect(e.numero_simula_custo).toMatch(/^EST-IMP-00001\/\d{2}$/)
    expect(e.status_simula_custo).toBe('EM_CRIACAO')
    // PTAX mockada em 5.0 → VA = (10.000 + 120) × 5 = 50.600 BRL
    expect(e.ptax_utilizada_simula_custo).toBe(5)
    expect(e.valor_aduaneiro_simula_custo).toBeCloseTo(50_600, 2)
    expect(e.custo_nacionalizado_brl_simula_custo).toBeGreaterThan(e.valor_aduaneiro_simula_custo)
    expect(e.fonte_calculo_simula_custo).toBe('gravity-engine')
    expect(e.valor_ii_simula_custo).toBeGreaterThan(0)
    expect(e.base_calculo_ii_simula_custo).toBeCloseTo(e.valor_aduaneiro_simula_custo, 2)
  })

  it('injeta id_organizacao do header nas taxas e documentos aninhados (nunca do body)', async () => {
    await request(criarApp())
      .post('/api/v1/simula-custo/simulas-custo')
      .set(HEADERS_ORG_A)
      .send({ ...PAYLOAD_VALIDO, id_organizacao: 'org-maliciosa' })

    const criada = simulas[0]
    expect(criada.id_organizacao).toBe('org-a')
    expect(criada.taxas_origem_simula_custo[0].id_organizacao).toBe('org-a')
    expect(criada.documentos_simula_custo[0].id_organizacao).toBe('org-a')
  })
})

describe('GET /simulas-custo (isolamento por organização)', () => {
  it('org B não enxerga simulas da org A', async () => {
    const app = criarApp()
    await request(app).post('/api/v1/simula-custo/simulas-custo').set(HEADERS_ORG_A).send(PAYLOAD_VALIDO)

    const listaA = await request(app).get('/api/v1/simula-custo/simulas-custo').set(HEADERS_ORG_A)
    const listaB = await request(app).get('/api/v1/simula-custo/simulas-custo').set(HEADERS_ORG_B)

    expect(listaA.status).toBe(200)
    expect(listaA.body.simulas_custo).toHaveLength(1)
    expect(listaB.body.simulas_custo).toHaveLength(0)
  })

  it('GET detalhe cross-tenant retorna 404', async () => {
    const app = criarApp()
    const criada = await request(app).post('/api/v1/simula-custo/simulas-custo').set(HEADERS_ORG_A).send(PAYLOAD_VALIDO)
    const id = criada.body.simula_custo.id_simula_custo

    const res = await request(app).get(`/api/v1/simula-custo/simulas-custo/${id}`).set(HEADERS_ORG_B)
    expect(res.status).toBe(404)
  })
})

describe('PATCH /simulas-custo/:id/status', () => {
  it('atualiza status válido e rejeita status fora do enum', async () => {
    const app = criarApp()
    const criada = await request(app).post('/api/v1/simula-custo/simulas-custo').set(HEADERS_ORG_A).send(PAYLOAD_VALIDO)
    const id = criada.body.simula_custo.id_simula_custo

    const ok = await request(app)
      .patch(`/api/v1/simula-custo/simulas-custo/${id}/status`)
      .set(HEADERS_ORG_A)
      .send({ status_simula_custo: 'CRIADA' })
    expect(ok.status).toBe(200)
    expect(ok.body.simula_custo.status_simula_custo).toBe('CRIADA')

    const invalido = await request(app)
      .patch(`/api/v1/simula-custo/simulas-custo/${id}/status`)
      .set(HEADERS_ORG_A)
      .send({ status_simula_custo: 'CANCELADA' })
    expect(invalido.status).toBe(400)
  })
})

describe('POST /simulas-custo/:id/duplicar', () => {
  it('duplica com novo número e status EM_CRIACAO', async () => {
    const app = criarApp()
    const criada = await request(app).post('/api/v1/simula-custo/simulas-custo').set(HEADERS_ORG_A).send(PAYLOAD_VALIDO)
    const id = criada.body.simula_custo.id_simula_custo

    const dup = await request(app)
      .post(`/api/v1/simula-custo/simulas-custo/${id}/duplicar`)
      .set(HEADERS_ORG_A)
    expect(dup.status).toBe(201)
    expect(dup.body.simula_custo.numero_simula_custo).toMatch(/^EST-IMP-00002\/\d{2}$/)
    expect(dup.body.simula_custo.status_simula_custo).toBe('EM_CRIACAO')
  })
})

describe('DELETE /simulas-custo/:id', () => {
  it('exclui e retorna 404 para id inexistente', async () => {
    const app = criarApp()
    const criada = await request(app).post('/api/v1/simula-custo/simulas-custo').set(HEADERS_ORG_A).send(PAYLOAD_VALIDO)
    const id = criada.body.simula_custo.id_simula_custo

    const del = await request(app).delete(`/api/v1/simula-custo/simulas-custo/${id}`).set(HEADERS_ORG_A)
    expect([200, 204]).toContain(del.status)

    const denovo = await request(app).delete(`/api/v1/simula-custo/simulas-custo/${id}`).set(HEADERS_ORG_A)
    expect(denovo.status).toBe(404)
  })
})
