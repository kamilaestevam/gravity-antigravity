// @vitest-environment node
/**
 * bulk-tipo-operacao.test.ts — Testes funcionais das rotas bulk de tipo_operacao
 *
 * Testa o pipeline completo de validação de tipo_operacao nas rotas:
 *   POST /api/v1/pedidos/consolidar/preview   — conflito_tipo_operacao
 *   POST /api/v1/pedidos/consolidar/confirmar — 422 se tipos mistos
 *   POST /api/v1/pedidos/transferir/preview   — aviso_tipo_operacao
 *   POST /api/v1/pedidos/transferir/confirmar — 422 sem confirmar_tipos_divergentes
 *
 * BANCO REAL: usa PrismaClient conectado via TEST_DATABASE_URL.
 * Os dados são isolados por tenant_id 'tenant-teste-bulk'.
 * afterEach limpa todos os pedidos do tenant de teste.
 *
 * Skill: antigravity-testes (testes funcionais com banco real)
 * Skill: antigravity-tenant-isolation (tenant_id em toda query)
 *
 * INFRAESTRUTURA NECESSÁRIA:
 *   - TEST_DATABASE_URL no .env apontando para banco PostgreSQL de teste
 *   - Migrate aplicada: npx prisma migrate deploy --schema produto/pedido/server/prisma/schema.prisma
 *
 * BLOQUEIO: se TEST_DATABASE_URL não estiver configurada, os testes são
 * pulados com mensagem clara. Nunca usar mock de banco em testes funcionais.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import type { Express } from 'express'
import { PrismaClient } from '@prisma/client'
import { consolidarRouter } from '../../../produto/pedido/server/src/routes/consolidar.js'
import { transferirRouter } from '../../../produto/pedido/server/src/routes/transferir.js'

// ── Constantes de isolamento ──────────────────────────────────────────────────

const TENANT_ID = 'tenant-teste-bulk'
const COMPANY_ID = 'company-test-bulk'

// ── Conexão com banco real ────────────────────────────────────────────────────

const TEST_DATABASE_URL = process.env['TEST_DATABASE_URL']

/**
 * Flag que indica se o banco de teste está disponível.
 * Se TEST_DATABASE_URL não estiver configurada, todos os testes são pulados.
 */
const bancoDeTeste = !!TEST_DATABASE_URL

let prisma: PrismaClient

beforeAll(async () => {
  if (!bancoDeTeste) return

  prisma = new PrismaClient({
    datasources: { db: { url: TEST_DATABASE_URL } },
  })
  await prisma.$connect()
})

afterAll(async () => {
  if (!bancoDeTeste) return
  await prisma.$disconnect()
})

afterEach(async () => {
  if (!bancoDeTeste) return
  // Limpar todos os pedidos do tenant de teste (cascata remove itens via Cascade)
  await prisma.pedido.deleteMany({ where: { tenant_id: TENANT_ID } })
})

// ── Helpers de criação de pedidos no banco ────────────────────────────────────

function gerarId(prefixo: string): string {
  return `${prefixo}_${Math.random().toString(36).slice(2, 11)}`
}

interface CriarPedidoOpts {
  id?: string
  numero_pedido: string
  tipo_operacao: 'importacao' | 'exportacao'
  incoterm?: string
  moeda_pedido?: string
  status?: string
}

async function criarPedido(opts: CriarPedidoOpts) {
  const id = opts.id ?? gerarId('pedi')
  await prisma.pedido.create({
    data: {
      id,
      tenant_id: TENANT_ID,
      company_id: COMPANY_ID,
      tipo_operacao: opts.tipo_operacao,
      numero_pedido: opts.numero_pedido,
      status: opts.status ?? 'draft',
      incoterm: opts.incoterm ?? 'FOB',
      moeda_pedido: opts.moeda_pedido ?? 'USD',
    },
  })
  return id
}

async function criarPedidoComItem(opts: CriarPedidoOpts & { partNumber?: string }) {
  const pedidoId = await criarPedido(opts)
  const itemId = gerarId('pite')
  await prisma.pedidoItem.create({
    data: {
      id: itemId,
      tenant_id: TENANT_ID,
      company_id: COMPANY_ID,
      pedido_id: pedidoId,
      part_number: opts.partNumber ?? 'SKU-BULK-001',
      ncm: '8542.31.90',
      descricao_item: 'Componente bulk',
      quantidade_inicial_item_pedido: 100,
      saldo_item_pedido: 100,
    },
  })
  return { pedidoId, itemId }
}

// ── Factory de app Express ─────────────────────────────────────────────────────

function criarAppConsolidar(tenantId: string = TENANT_ID): Express {
  const app = express()
  app.use(express.json())

  // Middleware que injeta o PrismaClient real e o tenantId
  app.use((req, _res, next) => {
    ;(req as unknown as { prisma: PrismaClient; tenantId: string }).prisma = prisma
    ;(req as unknown as { prisma: PrismaClient; tenantId: string }).tenantId =
      (req.headers['x-tenant-id'] as string) ?? tenantId
    next()
  })

  app.use('/api/v1/pedidos/consolidar', consolidarRouter)

  app.use((err: { statusCode?: number; code?: string; message: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.statusCode ?? 500).json({
      error: { code: err.code ?? 'INTERNAL_ERROR', message: err.message },
    })
  })

  return app
}

function criarAppTransferir(tenantId: string = TENANT_ID): Express {
  const app = express()
  app.use(express.json())

  app.use((req, _res, next) => {
    ;(req as unknown as { prisma: PrismaClient; tenantId: string; userId: string }).prisma = prisma
    ;(req as unknown as { prisma: PrismaClient; tenantId: string; userId: string }).tenantId =
      (req.headers['x-tenant-id'] as string) ?? tenantId
    ;(req as unknown as { prisma: PrismaClient; tenantId: string; userId: string }).userId = 'user-test'
    next()
  })

  app.use('/api/v1/pedidos/transferir', transferirRouter)

  app.use((err: { statusCode?: number; code?: string; message: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.statusCode ?? 500).json({
      error: { code: err.code ?? 'INTERNAL_ERROR', message: err.message },
    })
  })

  return app
}

// ── Guarda de skip global ─────────────────────────────────────────────────────

function skipSeBancoIndisponivel() {
  if (!bancoDeTeste) {
    // biome-ignore lint: aviso intencional de infraestrutura ausente
    console.warn(
      '[BLOQUEIO] TEST_DATABASE_URL não configurada. ' +
      'Testes funcionais com banco real não podem executar. ' +
      'Configure TEST_DATABASE_URL no .env e rode: ' +
      'npx prisma migrate deploy --schema produto/pedido/server/prisma/schema.prisma'
    )
  }
  return !bancoDeTeste
}

// ══════════════════════════════════════════════════════════════════════════════
// POST /consolidar/preview
// ══════════════════════════════════════════════════════════════════════════════

describe('POST /api/v1/pedidos/consolidar/preview', () => {
  it('ids todos importacao → conflito_tipo_operacao: false', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: id1 } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-BULK-001', tipo_operacao: 'importacao' })
    const { pedidoId: id2 } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-BULK-002', tipo_operacao: 'importacao', partNumber: 'SKU-BULK-002' })
    const app = criarAppConsolidar()

    const res = await request(app)
      .post('/api/v1/pedidos/consolidar/preview')
      .set('x-tenant-id', TENANT_ID)
      .send({ ids: [id1, id2] })

    expect(res.status).toBe(200)
    expect(res.body.conflito_tipo_operacao).toBe(false)
  })

  it('ids todos exportacao → conflito_tipo_operacao: false', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: id1 } = await criarPedidoComItem({ numero_pedido: 'PO-EXP-BULK-001', tipo_operacao: 'exportacao' })
    const { pedidoId: id2 } = await criarPedidoComItem({ numero_pedido: 'PO-EXP-BULK-002', tipo_operacao: 'exportacao', partNumber: 'SKU-BULK-002' })
    const app = criarAppConsolidar()

    const res = await request(app)
      .post('/api/v1/pedidos/consolidar/preview')
      .set('x-tenant-id', TENANT_ID)
      .send({ ids: [id1, id2] })

    expect(res.status).toBe(200)
    expect(res.body.conflito_tipo_operacao).toBe(false)
  })

  it('ids mistos (importacao + exportacao) → conflito_tipo_operacao: true', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: idImp } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-BULK-003', tipo_operacao: 'importacao' })
    const { pedidoId: idExp } = await criarPedidoComItem({ numero_pedido: 'PO-EXP-BULK-003', tipo_operacao: 'exportacao', partNumber: 'SKU-BULK-002' })
    const app = criarAppConsolidar()

    const res = await request(app)
      .post('/api/v1/pedidos/consolidar/preview')
      .set('x-tenant-id', TENANT_ID)
      .send({ ids: [idImp, idExp] })

    expect(res.status).toBe(200)
    expect(res.body.conflito_tipo_operacao).toBe(true)
  })

  it('menos de 2 ids → 400 (validação Zod)', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: id1 } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-BULK-004', tipo_operacao: 'importacao' })
    const app = criarAppConsolidar()

    const res = await request(app)
      .post('/api/v1/pedidos/consolidar/preview')
      .set('x-tenant-id', TENANT_ID)
      .send({ ids: [id1] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('tenant isolation: pedido de outro tenant não aparece', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: id1 } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-BULK-005', tipo_operacao: 'importacao' })
    const { pedidoId: id2 } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-BULK-006', tipo_operacao: 'importacao', partNumber: 'SKU-002' })
    const app = criarAppConsolidar()

    // Enviar com tenant diferente → banco filtra por tenant_id, pedidos não são encontrados → 404
    const res = await request(app)
      .post('/api/v1/pedidos/consolidar/preview')
      .set('x-tenant-id', 'tenant-OUTRO')
      .send({ ids: [id1, id2] })

    expect(res.status).toBe(404)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// POST /consolidar/confirmar
// ══════════════════════════════════════════════════════════════════════════════

describe('POST /api/v1/pedidos/consolidar/confirmar', () => {
  it('ids todos importacao → 201 (sucesso)', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: id1 } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-CONF-001', tipo_operacao: 'importacao' })
    const { pedidoId: id2 } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-CONF-002', tipo_operacao: 'importacao', partNumber: 'SKU-002' })
    const app = criarAppConsolidar()

    const res = await request(app)
      .post('/api/v1/pedidos/consolidar/confirmar')
      .set('x-tenant-id', TENANT_ID)
      .send({
        ids: [id1, id2],
        numero_pedido: 'PO-CONS-REAL-001',
        campos_escolhidos: {},
        fundir_itens_mesmo_part_number: false,
      })

    expect(res.status).toBe(201)
  })

  it('ids mistos → 422 com codigo TIPO_OPERACAO_MISTO', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: idImp } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-CONF-003', tipo_operacao: 'importacao' })
    const { pedidoId: idExp } = await criarPedidoComItem({ numero_pedido: 'PO-EXP-CONF-003', tipo_operacao: 'exportacao', partNumber: 'SKU-002' })
    const app = criarAppConsolidar()

    const res = await request(app)
      .post('/api/v1/pedidos/consolidar/confirmar')
      .set('x-tenant-id', TENANT_ID)
      .send({
        ids: [idImp, idExp],
        numero_pedido: 'PO-CONS-REAL-002',
        campos_escolhidos: {},
        fundir_itens_mesmo_part_number: false,
      })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('TIPO_OPERACAO_MISTO')
  })

  it('ids mistos → mensagem de erro informativa', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: idImp } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-CONF-004', tipo_operacao: 'importacao' })
    const { pedidoId: idExp } = await criarPedidoComItem({ numero_pedido: 'PO-EXP-CONF-004', tipo_operacao: 'exportacao', partNumber: 'SKU-002' })
    const app = criarAppConsolidar()

    const res = await request(app)
      .post('/api/v1/pedidos/consolidar/confirmar')
      .set('x-tenant-id', TENANT_ID)
      .send({
        ids: [idImp, idExp],
        numero_pedido: 'PO-CONS-REAL-003',
        campos_escolhidos: {},
        fundir_itens_mesmo_part_number: false,
      })

    expect(res.body.error.message).toContain('importação')
    expect(res.body.error.message).toContain('exportação')
  })

  it('payload incompleto → 400 (validação Zod)', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: id1 } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-CONF-005', tipo_operacao: 'importacao' })
    const { pedidoId: id2 } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-CONF-006', tipo_operacao: 'importacao', partNumber: 'SKU-002' })
    const app = criarAppConsolidar()

    const res = await request(app)
      .post('/api/v1/pedidos/consolidar/confirmar')
      .set('x-tenant-id', TENANT_ID)
      .send({ ids: [id1, id2] })
    // Falta numero_pedido, campos_escolhidos, fundir_itens_mesmo_part_number

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('tenant isolation: pedidos de outro tenant não podem ser consolidados', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: id1 } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-CONF-007', tipo_operacao: 'importacao' })
    const { pedidoId: id2 } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-CONF-008', tipo_operacao: 'importacao', partNumber: 'SKU-002' })
    const app = criarAppConsolidar()

    // Usar tenant diferente → banco filtra por tenant_id, pedidos não encontrados → 404
    const res = await request(app)
      .post('/api/v1/pedidos/consolidar/confirmar')
      .set('x-tenant-id', 'tenant-OUTRO')
      .send({
        ids: [id1, id2],
        numero_pedido: 'PO-HACK',
        campos_escolhidos: {},
        fundir_itens_mesmo_part_number: false,
      })

    expect(res.status).toBe(404)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// POST /transferir/preview
// ══════════════════════════════════════════════════════════════════════════════

describe('POST /api/v1/pedidos/transferir/preview', () => {
  it('origem e destino mesmo tipo → aviso_tipo_operacao: false', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: idOrigem, itemId } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-TRAN-001', tipo_operacao: 'importacao' })
    const { pedidoId: idDestino } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-TRAN-002', tipo_operacao: 'importacao', partNumber: 'SKU-002' })
    const app = criarAppTransferir()

    const res = await request(app)
      .post('/api/v1/pedidos/transferir/preview')
      .set('x-tenant-id', TENANT_ID)
      .send({
        cenario: 'split_pedido_existente',
        pedido_id: idOrigem,
        item_id: itemId,
        quantidade_origem: 50,
        destinos: [{ tipo: 'existente', pedido_id: idDestino, quantidade: 50 }],
      })

    expect(res.status).toBe(200)
    expect(res.body.aviso_tipo_operacao).toBe(false)
  })

  it('origem e destino tipos diferentes → aviso_tipo_operacao: true', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: idImp, itemId } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-TRAN-003', tipo_operacao: 'importacao' })
    const { pedidoId: idExp } = await criarPedidoComItem({ numero_pedido: 'PO-EXP-TRAN-003', tipo_operacao: 'exportacao', partNumber: 'SKU-002' })
    const app = criarAppTransferir()

    const res = await request(app)
      .post('/api/v1/pedidos/transferir/preview')
      .set('x-tenant-id', TENANT_ID)
      .send({
        cenario: 'split_pedido_existente',
        pedido_id: idImp,
        item_id: itemId,
        quantidade_origem: 50,
        destinos: [{ tipo: 'existente', pedido_id: idExp, quantidade: 50 }],
      })

    expect(res.status).toBe(200)
    expect(res.body.aviso_tipo_operacao).toBe(true)
  })

  it('sem destinos existentes → aviso_tipo_operacao: false (sem mistura possível)', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId, itemId } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-TRAN-004', tipo_operacao: 'importacao' })
    const app = criarAppTransferir()

    const res = await request(app)
      .post('/api/v1/pedidos/transferir/preview')
      .set('x-tenant-id', TENANT_ID)
      .send({
        cenario: 'split_pedido_existente',
        pedido_id: pedidoId,
        item_id: itemId,
        quantidade_origem: 50,
        destinos: [{ tipo: 'novo', quantidade: 50 }],
      })

    expect(res.status).toBe(200)
    expect(res.body.aviso_tipo_operacao).toBe(false)
  })

  it('payload inválido → 400 (validação Zod)', async () => {
    if (skipSeBancoIndisponivel()) return

    const app = criarAppTransferir()

    const res = await request(app)
      .post('/api/v1/pedidos/transferir/preview')
      .set('x-tenant-id', TENANT_ID)
      .send({ cenario: 'cenario-invalido' }) // cenario inválido + campos faltando

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// POST /transferir/confirmar
// ══════════════════════════════════════════════════════════════════════════════

describe('POST /api/v1/pedidos/transferir/confirmar', () => {
  it('tipos iguais → 201 (sucesso)', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: idOrigem, itemId } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-TRAN-005', tipo_operacao: 'importacao' })
    const { pedidoId: idDestino } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-TRAN-006', tipo_operacao: 'importacao', partNumber: 'SKU-002' })
    const app = criarAppTransferir()

    const res = await request(app)
      .post('/api/v1/pedidos/transferir/confirmar')
      .set('x-tenant-id', TENANT_ID)
      .send({
        cenario: 'split_pedido_existente',
        pedido_id: idOrigem,
        item_id: itemId,
        quantidade_origem: 50,
        destinos: [{ tipo: 'existente', pedido_id: idDestino, quantidade: 50 }],
      })

    expect(res.status).toBe(201)
  })

  it('tipos diferentes sem confirmar_tipos_divergentes → 422 com TIPO_OPERACAO_DIVERGENTE', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: idImp, itemId } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-TRAN-007', tipo_operacao: 'importacao' })
    const { pedidoId: idExp } = await criarPedidoComItem({ numero_pedido: 'PO-EXP-TRAN-007', tipo_operacao: 'exportacao', partNumber: 'SKU-002' })
    const app = criarAppTransferir()

    const res = await request(app)
      .post('/api/v1/pedidos/transferir/confirmar')
      .set('x-tenant-id', TENANT_ID)
      .send({
        cenario: 'split_pedido_existente',
        pedido_id: idImp,
        item_id: itemId,
        quantidade_origem: 50,
        destinos: [{ tipo: 'existente', pedido_id: idExp, quantidade: 50 }],
        // confirmar_tipos_divergentes ausente
      })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('TIPO_OPERACAO_DIVERGENTE')
  })

  it('tipos diferentes com confirmar_tipos_divergentes: true → 201 (sucesso)', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: idImp, itemId } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-TRAN-008', tipo_operacao: 'importacao' })
    const { pedidoId: idExp } = await criarPedidoComItem({ numero_pedido: 'PO-EXP-TRAN-008', tipo_operacao: 'exportacao', partNumber: 'SKU-002' })
    const app = criarAppTransferir()

    const res = await request(app)
      .post('/api/v1/pedidos/transferir/confirmar')
      .set('x-tenant-id', TENANT_ID)
      .send({
        cenario: 'split_pedido_existente',
        pedido_id: idImp,
        item_id: itemId,
        quantidade_origem: 50,
        destinos: [{ tipo: 'existente', pedido_id: idExp, quantidade: 50 }],
        confirmar_tipos_divergentes: true,
      })

    expect(res.status).toBe(201)
  })

  it('tipos diferentes com confirmar_tipos_divergentes: false → 422', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: idImp, itemId } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-TRAN-009', tipo_operacao: 'importacao' })
    const { pedidoId: idExp } = await criarPedidoComItem({ numero_pedido: 'PO-EXP-TRAN-009', tipo_operacao: 'exportacao', partNumber: 'SKU-002' })
    const app = criarAppTransferir()

    const res = await request(app)
      .post('/api/v1/pedidos/transferir/confirmar')
      .set('x-tenant-id', TENANT_ID)
      .send({
        cenario: 'split_pedido_existente',
        pedido_id: idImp,
        item_id: itemId,
        quantidade_origem: 50,
        destinos: [{ tipo: 'existente', pedido_id: idExp, quantidade: 50 }],
        confirmar_tipos_divergentes: false,
      })

    expect(res.status).toBe(422)
  })

  it('tenant isolation: pedidos de outro tenant não podem ser transferidos', async () => {
    if (skipSeBancoIndisponivel()) return

    const { pedidoId: idOrigem, itemId } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-TRAN-010', tipo_operacao: 'importacao' })
    const { pedidoId: idDestino } = await criarPedidoComItem({ numero_pedido: 'PO-IMP-TRAN-011', tipo_operacao: 'importacao', partNumber: 'SKU-002' })
    const app = criarAppTransferir()

    // Usar tenant diferente → banco filtra por tenant_id, origem não encontrada → erro de negócio
    const res = await request(app)
      .post('/api/v1/pedidos/transferir/confirmar')
      .set('x-tenant-id', 'tenant-OUTRO')
      .send({
        cenario: 'split_pedido_existente',
        pedido_id: idOrigem,
        item_id: itemId,
        quantidade_origem: 50,
        destinos: [{ tipo: 'existente', pedido_id: idDestino, quantidade: 50 }],
      })

    // Deve falhar com 404 ou 400 — nunca com 201 (não pode acessar dados de outro tenant)
    expect(res.status).toBeGreaterThanOrEqual(400)
  })
})
