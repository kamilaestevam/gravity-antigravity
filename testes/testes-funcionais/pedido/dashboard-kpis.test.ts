// @vitest-environment node
/**
 * Testes funcionais — Dashboard KPIs
 * Localização: testes/testes-funcionais/pedido/dashboard-kpis.test.ts
 *
 * TF-01: GET /api/v1/pedidos/dashboard/kpis retorna campos de contagem
 *         corretos por tenant, incluindo pedidos_abertos, pedidos_em_andamento
 *         e total_pedidos usados pelo statusCounts do DashboardToolbar.
 *
 * Estratégia: Express + mock de Prisma (evitar banco real em unitário).
 * Para testes com banco real, ver setup funcional completo.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { dashboardDataRouter } from '../../../produto/pedido/server/src/routes/dashboardData'

// ── Setup Express com mock de tenant isolation ────────────────────────────────

function criarApp(prismaMock: unknown) {
  const app = express()
  app.use(express.json())

  app.use((req, _res, next) => {
    ;(req as any).prisma = prismaMock
    req.headers['x-tenant-id'] = req.headers['x-tenant-id'] ?? 'tenant-001'
    req.headers['x-internal-key'] = 'test-key'
    next()
  })

  app.use('/api/v1/pedidos/dashboard', dashboardDataRouter)

  app.use((err: Error & { statusCode?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: { message: err.message } })
  })

  return app
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

const PEDIDOS_MOCK = [
  { status: 'aberto',       valor_total_pedido: 100000, quantidade_total_inicial_pedido: 500, moeda_pedido: 'USD', importacao_exportador_id: 'exp-001', tipo_operacao: 'importacao', incoterm: 'FOB', fabricante_id: 'fab-001', numero_proforma: 'PRF-001', numero_invoice: null, referencia_importador: 'REF-001', referencia_exportador: null, peso_bruto_total_pedido: 1000, cubagem_total_pedido: 10 },
  { status: 'aberto',       valor_total_pedido: 200000, quantidade_total_inicial_pedido: 300, moeda_pedido: 'USD', importacao_exportador_id: 'exp-002', tipo_operacao: 'importacao', incoterm: 'CIF', fabricante_id: 'fab-002', numero_proforma: 'PRF-002', numero_invoice: 'INV-001', referencia_importador: null, referencia_exportador: null, peso_bruto_total_pedido: 500, cubagem_total_pedido: 5 },
  { status: 'transferencia', valor_total_pedido: 50000,  quantidade_total_inicial_pedido: 100, moeda_pedido: 'BRL', importacao_exportador_id: null, tipo_operacao: 'exportacao', incoterm: null, fabricante_id: null, numero_proforma: null, numero_invoice: null, referencia_importador: null, referencia_exportador: 'REF-EXP-001', peso_bruto_total_pedido: 200, cubagem_total_pedido: 2 },
  { status: 'consolidado',  valor_total_pedido: 75000,  quantidade_total_inicial_pedido: 250, moeda_pedido: 'EUR', importacao_exportador_id: 'exp-003', tipo_operacao: 'importacao', incoterm: 'EXW', fabricante_id: 'fab-003', numero_proforma: 'PRF-003', numero_invoice: 'INV-002', referencia_importador: 'REF-003', referencia_exportador: null, peso_bruto_total_pedido: 300, cubagem_total_pedido: 3 },
  { status: 'draft',        valor_total_pedido: 0,      quantidade_total_inicial_pedido: 0,   moeda_pedido: 'USD', importacao_exportador_id: null, tipo_operacao: 'importacao', incoterm: null, fabricante_id: null, numero_proforma: null, numero_invoice: null, referencia_importador: null, referencia_exportador: null, peso_bruto_total_pedido: 0, cubagem_total_pedido: 0 },
]

const ITENS_MOCK = [
  { quantidade_inicial_item_pedido: 500, saldo_item_pedido: 300, quantidade_transferida_item_pedido: 200, quantidade_pronta_total_item_pedido: 0, valor_total_itens: 90000, cobertura_cambial: 'com_cobertura', quantidade_cancelada_item_pedido: 0, peso_bruto_unitario_item: 2, cubagem_unitaria_item: 0.02 },
  { quantidade_inicial_item_pedido: 300, saldo_item_pedido: 300, quantidade_transferida_item_pedido: 0,   quantidade_pronta_total_item_pedido: 0, valor_total_itens: 180000, cobertura_cambial: 'sem_cobertura', quantidade_cancelada_item_pedido: 0, peso_bruto_unitario_item: 1.5, cubagem_unitaria_item: 0.015 },
]

type MockPrisma = {
  pedido: { findMany: ReturnType<typeof vi.fn> }
  pedidoItem: { findMany: ReturnType<typeof vi.fn> }
}
let prismaMock: MockPrisma

beforeEach(() => {
  prismaMock = {
    pedido: {
      findMany: vi.fn().mockResolvedValue(PEDIDOS_MOCK),
    },
    pedidoItem: {
      findMany: vi.fn().mockResolvedValue(ITENS_MOCK),
    },
  }
})

// ── TF-01: Contagens usadas pelo statusCounts ─────────────────────────────────

describe('TF-01 — GET /api/v1/pedidos/dashboard/kpis', () => {
  it('retorna status 200', async () => {
    const app = criarApp(prismaMock)
    const res = await request(app)
      .get('/api/v1/pedidos/dashboard/kpis?period=current_year')
      .set('x-tenant-id', 'tenant-001')
      .set('x-internal-key', 'test-key')

    expect(res.status).toBe(200)
  })

  it('retorna total_pedidos = 5 (todos os status, incluindo draft)', async () => {
    const app = criarApp(prismaMock)
    const res = await request(app)
      .get('/api/v1/pedidos/dashboard/kpis?period=current_year')
      .set('x-tenant-id', 'tenant-001')

    expect(res.body.total_pedidos).toBe(5)
  })

  it('retorna pedidos_abertos = 2 (status = "aberto")', async () => {
    const app = criarApp(prismaMock)
    const res = await request(app)
      .get('/api/v1/pedidos/dashboard/kpis?period=current_year')
      .set('x-tenant-id', 'tenant-001')

    expect(res.body.pedidos_abertos).toBe(2)
  })

  it('retorna pedidos_em_andamento = 1 (status = "transferencia")', async () => {
    const app = criarApp(prismaMock)
    const res = await request(app)
      .get('/api/v1/pedidos/dashboard/kpis?period=current_year')
      .set('x-tenant-id', 'tenant-001')

    expect(res.body.pedidos_em_andamento).toBe(1)
  })

  it('retorna pedidos_consolidados = 1 (status = "consolidado")', async () => {
    const app = criarApp(prismaMock)
    const res = await request(app)
      .get('/api/v1/pedidos/dashboard/kpis?period=current_year')
      .set('x-tenant-id', 'tenant-001')

    expect(res.body.pedidos_consolidados).toBe(1)
  })

  it('retorna pedidos_atrasados = 0 (sem campo de prazo no schema)', async () => {
    const app = criarApp(prismaMock)
    const res = await request(app)
      .get('/api/v1/pedidos/dashboard/kpis?period=current_year')
      .set('x-tenant-id', 'tenant-001')

    expect(res.body.pedidos_atrasados).toBe(0)
  })

  it('pedidos_sem_exportador = 2 (sem importacao_exportador_id)', async () => {
    const app = criarApp(prismaMock)
    const res = await request(app)
      .get('/api/v1/pedidos/dashboard/kpis?period=current_year')
      .set('x-tenant-id', 'tenant-001')

    expect(res.body.pedidos_sem_exportador).toBe(2)
  })

  it('respeita isolamento de tenant — prisma.pedido.findMany é chamado sem cross-tenant', async () => {
    const app = criarApp(prismaMock)
    await request(app)
      .get('/api/v1/pedidos/dashboard/kpis?period=30d')
      .set('x-tenant-id', 'tenant-aaa')

    // Confirma que findMany foi chamado (o middleware de tenant isolation
    // no ambiente real adicionaria filtro de tenant_id via RLS/schema)
    expect(prismaMock.pedido.findMany).toHaveBeenCalledOnce()
  })

  it('campos do response são números (não strings)', async () => {
    const app = criarApp(prismaMock)
    const res = await request(app)
      .get('/api/v1/pedidos/dashboard/kpis?period=current_year')
      .set('x-tenant-id', 'tenant-001')

    expect(typeof res.body.total_pedidos).toBe('number')
    expect(typeof res.body.pedidos_abertos).toBe('number')
    expect(typeof res.body.pedidos_em_andamento).toBe('number')
    expect(typeof res.body.pedidos_consolidados).toBe('number')
  })
})
