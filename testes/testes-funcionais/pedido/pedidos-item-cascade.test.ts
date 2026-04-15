// @vitest-environment node
/**
 * Testes funcionais — PATCH /:id/itens/:itemId/campo com cascata de saldo
 *
 * Cobre o handler que foi reescrito na Fase 1 (commit 28f1929) para ler
 * a fórmula do saldo do workspace (PedidoSaldoFormulaConfig) e as casas
 * decimais (PedidoCasasDecimaisConfig) antes de aplicar a cascata.
 *
 * Cenários:
 *   - Edição de campo texto/enum: update simples, sem cascata
 *   - Edição de quantidade_inicial_item_pedido: recalcula saldo via fórmula default
 *   - Edição de quantidade_inicial com fórmula custom do workspace
 *   - Edição de valor_unitario_item: recalcula valor_total_itens (saldo não muda)
 *   - Casas decimais do workspace aplicadas ao valor_total_itens
 *   - Fallback para default quando fórmula salva está quebrada (não deve travar edição)
 *   - Rejeita valor negativo
 *   - Rejeita valor não numérico
 *   - Rejeita saldo negativo resultante (proteção de invariante)
 *   - Campo fora da whitelist rejeitado com 400
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { type Request, type Response, type NextFunction } from 'express'
import { pedidosRouter } from '../../../servicos-global/tenant/processos-core/src/routes/pedidos.js'

type AppRequest = Request & { prisma: unknown }

function criarApp(prismaMock: unknown) {
  const app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as AppRequest).prisma = prismaMock
    if (!req.headers['x-tenant-id']) req.headers['x-tenant-id'] = 'tenant-test'
    if (!req.headers['x-company-id']) req.headers['x-company-id'] = 'company-test'
    next()
  })
  app.use('/api/v1/pedidos', pedidosRouter)
  app.use((err: { statusCode?: number; message?: string; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode || 500).json({ error: { message: err.message, code: err.code } })
  })
  return app
}

// Item base — A=1000, B=200, C=100, D=200 → saldo default A-C-D = 700
const ITEM_BASE = {
  id: 'pite_abc',
  tenant_id: 'tenant-test',
  company_id: 'company-test',
  pedido_id: 'pedi_001',
  sequencia_item: 1,
  part_number: 'SKU-001',
  ncm: '8542.31.90',
  descricao_item: 'teste',
  quantidade_inicial_item_pedido:      1000,
  saldo_item_pedido:                   700,
  quantidade_pronta_total_item_pedido: 200,
  quantidade_transferida_item_pedido:  200,
  quantidade_cancelada_item_pedido:    100,
  valor_unitario_item: 10,
  valor_total_itens: 10000,
  moeda_item: 'USD',
  casas_decimais_quantidade_item: 2,
  casas_decimais_valor_item: 2,
}

interface PrismaUpdateArgs {
  where: { id: string }
  data: Record<string, unknown>
}

/** Cria um mock de prisma com findFirst do pedidoItem retornando ITEM_BASE
 *  (ou override), e com config mocks configuráveis. */
function mkPrisma(opts: {
  item?: Partial<typeof ITEM_BASE>
  saldoFormulaConfig?: { formula_expressao: string } | null
  casasDecimaisConfig?: { valor_total_pedido: number } | null
  updateImpl?: (args: PrismaUpdateArgs) => unknown
} = {}) {
  const itemFinal = { ...ITEM_BASE, ...opts.item }
  const updateFn = vi.fn().mockImplementation(
    opts.updateImpl ??
    ((args: PrismaUpdateArgs) => Promise.resolve({ ...itemFinal, ...args.data }))
  )
  return {
    pedidoItem: {
      findFirst: vi.fn().mockResolvedValue(itemFinal),
      update: updateFn,
    },
    pedidoSaldoFormulaConfig: {
      findUnique: vi.fn().mockResolvedValue(opts.saldoFormulaConfig ?? null),
    },
    pedidoCasasDecimaisConfig: {
      findUnique: vi.fn().mockResolvedValue(opts.casasDecimaisConfig ?? null),
    },
    __updateFn: updateFn,
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// CAMPOS TEXTO/ENUM — update simples, sem cascata
// ──────────────────────────────────────────────────────────────────────────────

describe('PATCH item.campo — texto/enum (sem cascata)', () => {
  it('edita part_number — não toca saldo nem total', async () => {
    const prisma = mkPrisma()
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'part_number', valor: 'SKU-NEW' })

    expect(res.status).toBe(200)
    expect(prisma.__updateFn).toHaveBeenCalledWith({
      where: { id: 'pite_abc' },
      data: { part_number: 'SKU-NEW' },
    })
    // Config NÃO foi lida — update simples não precisa de fórmula/casas
    expect(prisma.pedidoSaldoFormulaConfig.findUnique).not.toHaveBeenCalled()
    expect(prisma.pedidoCasasDecimaisConfig.findUnique).not.toHaveBeenCalled()
  })

  it('edita descricao_item', async () => {
    const prisma = mkPrisma()
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'descricao_item', valor: 'nova descrição' })

    expect(res.status).toBe(200)
  })

  it('edita tipo_operacao com enum válido', async () => {
    const prisma = mkPrisma()
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'tipo_operacao', valor: 'exportacao' })

    expect(res.status).toBe(200)
  })

  it('rejeita tipo_operacao com valor inválido', async () => {
    const prisma = mkPrisma()
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'tipo_operacao', valor: 'importacao_errado' })

    expect(res.status).toBe(400)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// CAMPOS NUMÉRICOS COM CASCATA
// ──────────────────────────────────────────────────────────────────────────────

describe('PATCH item.campo — quantidade_inicial_item_pedido (cascata via fórmula)', () => {
  it('com fórmula DEFAULT: A=2000, C=100, D=200 → saldo = 1700', async () => {
    const prisma = mkPrisma() // saldoFormulaConfig = null → usa default
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'quantidade_inicial_item_pedido', valor: 2000 })

    expect(res.status).toBe(200)
    // Config foi lida
    expect(prisma.pedidoSaldoFormulaConfig.findUnique).toHaveBeenCalledWith({
      where: { tenant_id: 'tenant-test' },
    })
    // Update chamado com saldo novo E valor_total recalculado
    expect(prisma.__updateFn).toHaveBeenCalledWith({
      where: { id: 'pite_abc' },
      data: {
        quantidade_inicial_item_pedido: 2000,
        saldo_item_pedido: 1700, // 2000 - 100 - 200
        valor_total_itens: 20000, // unit=10 × A=2000
      },
    })
  })

  it('com fórmula CUSTOM "A - D" (sem cancelada): A=2000, D=200 → saldo = 1800', async () => {
    const prisma = mkPrisma({
      saldoFormulaConfig: {
        formula_expressao: 'quantidade_total_inicial_pedido - quantidade_transferida_total',
      },
    })
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'quantidade_inicial_item_pedido', valor: 2000 })

    expect(res.status).toBe(200)
    // Update usa a fórmula custom: 2000 - 200 (transferida) = 1800
    // Cancelada não entra porque a fórmula não referencia
    expect(prisma.__updateFn).toHaveBeenCalledWith({
      where: { id: 'pite_abc' },
      data: {
        quantidade_inicial_item_pedido: 2000,
        saldo_item_pedido: 1800,
        valor_total_itens: 20000,
      },
    })
  })

  it('com fórmula custom inválida no banco → fallback para default (edição não trava)', async () => {
    const prisma = mkPrisma({
      saldoFormulaConfig: {
        formula_expressao: 'a + + b', // quebrada
      },
    })
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'quantidade_inicial_item_pedido', valor: 2000 })

    // Deve usar default mesmo com config quebrada
    expect(res.status).toBe(200)
    expect(prisma.__updateFn).toHaveBeenCalledWith({
      where: { id: 'pite_abc' },
      data: {
        quantidade_inicial_item_pedido: 2000,
        saldo_item_pedido: 1700, // fallback: 2000 - 100 - 200
        valor_total_itens: 20000,
      },
    })
  })

  it('rejeita quando saldo resultante fica negativo', async () => {
    // A_novo=50, C=100, D=200 → saldo = 50 - 100 - 200 = -250
    const prisma = mkPrisma()
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'quantidade_inicial_item_pedido', valor: 50 })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/saldo negativ/i)
    expect(prisma.__updateFn).not.toHaveBeenCalled()
  })

  it('rejeita valor negativo na entrada (≥ 0)', async () => {
    const prisma = mkPrisma()
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'quantidade_inicial_item_pedido', valor: -10 })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/maior ou igual a zero/i)
  })

  it('rejeita valor não numérico', async () => {
    const prisma = mkPrisma()
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'quantidade_inicial_item_pedido', valor: 'abc' })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/numero finito/i)
  })

  it('rejeita Infinity e NaN', async () => {
    const prisma = mkPrisma()
    const app = criarApp(prisma)

    // NaN vira null em JSON — teste a proteção isFinite
    const res1 = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'quantidade_inicial_item_pedido', valor: null })
    expect(res1.status).toBe(400)
  })
})

describe('PATCH item.campo — valor_unitario_item (cascata sem tocar saldo)', () => {
  it('edita unit para 15 → total = 15 × A=1000 = 15000, saldo inalterado', async () => {
    const prisma = mkPrisma()
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'valor_unitario_item', valor: 15 })

    expect(res.status).toBe(200)
    expect(prisma.__updateFn).toHaveBeenCalledWith({
      where: { id: 'pite_abc' },
      data: expect.objectContaining({
        valor_unitario_item: 15,
        valor_total_itens: 15000,
        // saldo é recalculado pela fórmula default — com A=1000, C=100, D=200 → 700
        saldo_item_pedido: 700,
      }),
    })
  })

  it('casas decimais do workspace aplicadas ao valor_total_itens (0 casas)', async () => {
    const prisma = mkPrisma({
      casasDecimaisConfig: { valor_total_pedido: 0 },
    })
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'valor_unitario_item', valor: 10.789 })

    expect(res.status).toBe(200)
    // 10.789 × 1000 = 10789 → 0 casas → 10789
    const callArgs = prisma.__updateFn.mock.calls[0][0]
    expect(callArgs.data.valor_total_itens).toBe(10789)
  })

  it('casas decimais 4: 10.789 × 1000 → 10789.0000 → 10789 (int preservado)', async () => {
    const prisma = mkPrisma({
      casasDecimaisConfig: { valor_total_pedido: 4 },
    })
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'valor_unitario_item', valor: 10.789 })

    expect(res.status).toBe(200)
    const callArgs = prisma.__updateFn.mock.calls[0][0]
    expect(callArgs.data.valor_total_itens).toBeCloseTo(10789, 4)
  })

  it('casas decimais 2 (default): 3.14159 × 1000 → 3141.59', async () => {
    const prisma = mkPrisma() // casasDecimaisConfig = null → default 2
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'valor_unitario_item', valor: 3.14159 })

    expect(res.status).toBe(200)
    const callArgs = prisma.__updateFn.mock.calls[0][0]
    // 3.14159 × 1000 = 3141.59
    expect(callArgs.data.valor_total_itens).toBeCloseTo(3141.59, 2)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// WHITELIST — campo fora dela rejeita
// ──────────────────────────────────────────────────────────────────────────────

describe('PATCH item.campo — whitelist', () => {
  it('rejeita campo fora da whitelist com 400', async () => {
    const prisma = mkPrisma()
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'id', valor: 'hacker' })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/nao pode ser editado inline/i)
  })

  it('rejeita campo vazio', async () => {
    const prisma = mkPrisma()
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: '', valor: 'x' })

    expect(res.status).toBe(400)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// 404 — item não encontrado
// ──────────────────────────────────────────────────────────────────────────────

describe('PATCH item.campo — 404', () => {
  it('retorna 404 quando item não existe', async () => {
    const prisma = {
      pedidoItem: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      pedidoSaldoFormulaConfig: { findUnique: vi.fn().mockResolvedValue(null) },
      pedidoCasasDecimaisConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    }
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_fake/campo')
      .send({ campo: 'part_number', valor: 'X' })

    expect(res.status).toBe(404)
    expect(prisma.pedidoItem.update).not.toHaveBeenCalled()
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// CENÁRIO REGRESSÃO: item real do seed (pedi_med_0000425)
// ──────────────────────────────────────────────────────────────────────────────

describe('PATCH item.campo — cenário do item_pedi_med_0000425_001', () => {
  it('A=1603.11, C=89.09, D=106.67 → editar A=2500 → saldo = 2304.24', async () => {
    const prisma = mkPrisma({
      item: {
        quantidade_inicial_item_pedido:      1603.11,
        quantidade_cancelada_item_pedido:    89.09,
        quantidade_transferida_item_pedido:  106.67,
        quantidade_pronta_total_item_pedido: 669.45,
        valor_unitario_item:                 23.5234,
      },
    })
    const app = criarApp(prisma)
    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_001/itens/pite_abc/campo')
      .send({ campo: 'quantidade_inicial_item_pedido', valor: 2500 })

    expect(res.status).toBe(200)
    const callArgs = prisma.__updateFn.mock.calls[0][0]
    // Formula default A-D-C: 2500 - 106.67 - 89.09 = 2304.24
    expect(callArgs.data.saldo_item_pedido).toBeCloseTo(2304.24, 2)
    // valor_total: 23.5234 × 2500 = 58808.5
    expect(callArgs.data.valor_total_itens).toBeCloseTo(58808.5, 2)
  })
})
