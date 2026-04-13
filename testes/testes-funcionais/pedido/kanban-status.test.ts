// @vitest-environment node
/**
 * Testes funcionais — Contrato do endpoint GET /config/status para o Kanban
 *
 * Valida que GET /api/v1/pedidos/config/status entrega exatamente o que
 * KanbanPedidos.tsx precisa:
 *
 *   F01 — campos obrigatórios (nome, rotulo, cor, ordem) presentes em cada status
 *   F02 — ordenação por `ordem` asc
 *   F03 — statuses customizados (is_sistema=false) incluídos na resposta
 *   F04 — isolamento cross-tenant: cada tenant vê apenas seus status
 *   F05 — PUT /kanban/preferencias aceita colunas_ocultas
 *   F06 — colunas_ocultas é opcional (backward compat)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { type Request, type Response, type NextFunction } from 'express'
import { pedidosConfigRouter } from '../../../servicos-global/tenant/processos-core/src/routes/pedidos-config'
import { kanbanPreferenciasRouter } from '../../../produto/pedido/server/src/routes/kanbanPreferencias'

// ── Tipos locais ──────────────────────────────────────────────────────────────

type AppRequest = Request & {
  prisma: unknown
}

// ── Setup ─────────────────────────────────────────────────────────────────────

function criarApp(prismaMock: unknown, tenantId = 'tenant-test') {
  const app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as AppRequest).prisma = prismaMock
    if (!req.headers['x-tenant-id']) req.headers['x-tenant-id'] = tenantId
    if (!req.headers['x-company-id']) req.headers['x-company-id'] = 'company-test'
    if (!req.headers['x-user-id']) req.headers['x-user-id'] = 'user-test'
    next()
  })
  app.use('/api/v1/pedidos/config', pedidosConfigRouter)
  app.use((err: { statusCode?: number; message?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode || 500).json({ error: { message: err.message, code: err.code } })
  })
  return app
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

/** Todos os 8 status (5 sistema + 3 customizados) como o banco retornaria */
const STATUS_COMPLETO = [
  { id: 's1', tenant_id: 'tenant-test', company_id: 'c1', nome: 'draft',         rotulo: 'Rascunho',     cor: '#64748b', ordem: 1,  is_sistema: true,  is_padrao: true,  icone: null, created_at: new Date(), updated_at: new Date() },
  { id: 's2', tenant_id: 'tenant-test', company_id: 'c1', nome: 'aberto',        rotulo: 'Aberto',       cor: '#3b82f6', ordem: 2,  is_sistema: true,  is_padrao: false, icone: null, created_at: new Date(), updated_at: new Date() },
  { id: 's3', tenant_id: 'tenant-test', company_id: 'c1', nome: 'transferencia', rotulo: 'Em Andamento', cor: '#f97316', ordem: 3,  is_sistema: true,  is_padrao: false, icone: null, created_at: new Date(), updated_at: new Date() },
  { id: 's4', tenant_id: 'tenant-test', company_id: 'c1', nome: 'consolidado',   rotulo: 'Consolidado',  cor: '#22c55e', ordem: 4,  is_sistema: true,  is_padrao: false, icone: null, created_at: new Date(), updated_at: new Date() },
  { id: 's5', tenant_id: 'tenant-test', company_id: 'c1', nome: 'cancelado',     rotulo: 'Cancelado',    cor: '#ef4444', ordem: 5,  is_sistema: true,  is_padrao: false, icone: null, created_at: new Date(), updated_at: new Date() },
  { id: 's6', tenant_id: 'tenant-test', company_id: 'c1', nome: 'aprovado',      rotulo: 'Aprovado',     cor: '#8b5cf6', ordem: 6,  is_sistema: false, is_padrao: false, icone: null, created_at: new Date(), updated_at: new Date() },
  { id: 's7', tenant_id: 'tenant-test', company_id: 'c1', nome: 'DANIEL',        rotulo: 'Daniel',       cor: '#0ea5e9', ordem: 7,  is_sistema: false, is_padrao: false, icone: null, created_at: new Date(), updated_at: new Date() },
  { id: 's8', tenant_id: 'tenant-test', company_id: 'c1', nome: 'em_revisao',    rotulo: 'Em Revisão',   cor: '#eab308', ordem: 8,  is_sistema: false, is_padrao: false, icone: null, created_at: new Date(), updated_at: new Date() },
]

// ── F01 — Campos obrigatórios presentes em cada status ────────────────────────

describe('F01 — GET /config/status retorna campos obrigatórios para o Kanban', () => {
  it('retorna status 200 com array `data`', async () => {
    const prisma = { pedidoStatus: { findMany: vi.fn().mockResolvedValue(STATUS_COMPLETO) } }
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/config/status')
      .set('x-tenant-id', 'tenant-test')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('cada status tem nome, rotulo, cor, ordem', async () => {
    const prisma = { pedidoStatus: { findMany: vi.fn().mockResolvedValue(STATUS_COMPLETO) } }
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/config/status')
      .set('x-tenant-id', 'tenant-test')

    for (const s of res.body.data) {
      expect(s).toHaveProperty('nome')
      expect(s).toHaveProperty('rotulo')
      expect(s).toHaveProperty('cor')
      expect(s).toHaveProperty('ordem')
    }
  })

  it('campo `id` presente em cada status', async () => {
    const prisma = { pedidoStatus: { findMany: vi.fn().mockResolvedValue(STATUS_COMPLETO) } }
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/config/status')
      .set('x-tenant-id', 'tenant-test')

    for (const s of res.body.data) {
      expect(typeof s.id).toBe('string')
      expect(s.id.length).toBeGreaterThan(0)
    }
  })
})

// ── F02 — Ordenação por `ordem` asc ──────────────────────────────────────────

describe('F02 — GET /config/status consulta banco com orderBy { ordem: asc }', () => {
  it('chama findMany com orderBy { ordem: asc }', async () => {
    const prisma = { pedidoStatus: { findMany: vi.fn().mockResolvedValue(STATUS_COMPLETO) } }
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos/config/status')
      .set('x-tenant-id', 'tenant-test')

    expect(prisma.pedidoStatus.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: expect.objectContaining({ ordem: 'asc' }),
      })
    )
  })

  it('retorna status na ordem do banco (sem reordenar client-side)', async () => {
    // Banco retorna já ordenado (ordem: asc) — response deve preservar essa ordem
    const prisma = { pedidoStatus: { findMany: vi.fn().mockResolvedValue(STATUS_COMPLETO) } }
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/config/status')
      .set('x-tenant-id', 'tenant-test')

    const ordens = res.body.data.map((s: { ordem: number }) => s.ordem)
    const ordenado = [...ordens].sort((a: number, b: number) => a - b)
    expect(ordens).toEqual(ordenado)
  })
})

// ── F03 — Statuses customizados (is_sistema=false) incluídos ─────────────────

describe('F03 — GET /config/status inclui statuses customizados', () => {
  it('retorna todos os status independente de is_sistema', async () => {
    const prisma = { pedidoStatus: { findMany: vi.fn().mockResolvedValue(STATUS_COMPLETO) } }
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/config/status')
      .set('x-tenant-id', 'tenant-test')

    expect(res.body.data).toHaveLength(8)

    const nomes = res.body.data.map((s: { nome: string }) => s.nome)
    expect(nomes).toContain('aprovado')
    expect(nomes).toContain('DANIEL')
    expect(nomes).toContain('em_revisao')
  })

  it('nao filtra por is_sistema na query (consulta tudo do tenant)', async () => {
    const prisma = { pedidoStatus: { findMany: vi.fn().mockResolvedValue([]) } }
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos/config/status')
      .set('x-tenant-id', 'tenant-test')

    // where NÃO deve ter is_sistema
    const chamada = (prisma.pedidoStatus.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0] as { where?: { is_sistema?: unknown } }
    expect(chamada?.where?.is_sistema).toBeUndefined()
  })
})

// ── F04 — Isolamento cross-tenant ─────────────────────────────────────────────

describe('F04 — GET /config/status isolamento cross-tenant', () => {
  it('filtra status pelo tenant_id do header x-tenant-id', async () => {
    const prisma = { pedidoStatus: { findMany: vi.fn().mockResolvedValue([]) } }
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos/config/status')
      .set('x-tenant-id', 'tenant-OUTRO')

    expect(prisma.pedidoStatus.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'tenant-OUTRO' }),
      })
    )
  })

  it('tenant A nao vê status do tenant B', async () => {
    const statusTenantA = [STATUS_COMPLETO[0]]    // apenas 'draft' para tenant-A
    const statusTenantB = STATUS_COMPLETO.slice(1) // todos os outros para tenant-B

    const prismaA = {
      pedidoStatus: {
        findMany: vi.fn().mockImplementation((args: Record<string, unknown>) => {
          return args?.where?.tenant_id === 'tenant-A' ? Promise.resolve(statusTenantA) : Promise.resolve([])
        }),
      },
    }

    const appA = criarApp(prismaA, 'tenant-A')

    const resA = await request(appA)
      .get('/api/v1/pedidos/config/status')
      .set('x-tenant-id', 'tenant-A')

    expect(resA.body.data).toHaveLength(1)
    expect(resA.body.data[0].nome).toBe('draft')
  })
})

// ── F05/F06 — PUT /kanban/preferencias aceita colunas_ocultas ─────────────────

const PREFS_BASE = {
  abas: [
    { aba: 'pedido', campos: [] },
    { aba: 'quantidades', campos: [] },
    { aba: 'datas', campos: [] },
  ],
  card: { campos: [], dataCritica: null },
}

function criarAppKanban(prismaMock: unknown) {
  const app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as AppRequest).prisma = prismaMock
    req.headers['x-tenant-id'] = 'tenant-test'
    req.headers['x-user-id']   = 'user-test'
    next()
  })
  app.use('/api/v1/pedidos/kanban', kanbanPreferenciasRouter)
  app.use((err: { statusCode?: number; message?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode || 500).json({ error: { message: err.message, code: err.code } })
  })
  return app
}

describe('F05 — PUT /kanban/preferencias aceita colunas_ocultas', () => {
  it('salva colunas_ocultas no payload e retorna no response', async () => {
    const registro = { preferencias: { ...PREFS_BASE, colunas_ocultas: ['cancelado'] } }
    const prisma = {
      kanbanPreferencias: {
        upsert: vi.fn().mockResolvedValue(registro),
      },
    }
    const app = criarAppKanban(prisma)

    const res = await request(app)
      .put('/api/v1/pedidos/kanban/preferencias')
      .send({ ...PREFS_BASE, colunas_ocultas: ['cancelado'] })
      .set('Content-Type', 'application/json')

    expect(res.status).toBe(200)
    expect(res.body.data.colunas_ocultas).toEqual(['cancelado'])
  })

  it('aceita múltiplos status ocultos', async () => {
    const registro = { preferencias: { ...PREFS_BASE, colunas_ocultas: ['cancelado', 'draft'] } }
    const prisma = {
      kanbanPreferencias: {
        upsert: vi.fn().mockResolvedValue(registro),
      },
    }
    const app = criarAppKanban(prisma)

    const res = await request(app)
      .put('/api/v1/pedidos/kanban/preferencias')
      .send({ ...PREFS_BASE, colunas_ocultas: ['cancelado', 'draft'] })
      .set('Content-Type', 'application/json')

    expect(res.status).toBe(200)
  })
})

describe('F06 — colunas_ocultas é opcional (backward compat)', () => {
  it('PUT sem colunas_ocultas retorna 200 sem rejeitar payload', async () => {
    const registro = { preferencias: PREFS_BASE }
    const prisma = {
      kanbanPreferencias: {
        upsert: vi.fn().mockResolvedValue(registro),
      },
    }
    const app = criarAppKanban(prisma)

    const res = await request(app)
      .put('/api/v1/pedidos/kanban/preferencias')
      .send(PREFS_BASE)
      .set('Content-Type', 'application/json')

    expect(res.status).toBe(200)
  })
})
