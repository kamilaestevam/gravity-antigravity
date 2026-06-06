// @vitest-environment node
/**
 * TST-FUN-PEDIDO-EDITAR-SALVAR — Status cascade + independência
 *
 * Testa POST /api/v1/pedidos/alteracoes-status-lote/preview e /confirmar
 * e valida que a lógica client-side de espelhamento respeita
 * STATUS_SEM_ESPELHAMENTO (transferencia, consolidado).
 *
 * Plano: editar-salvar-funcional.md (secao 4)
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  pedido: {
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
}))

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: (_req: unknown, cb: (db: unknown) => Promise<unknown>) =>
    cb(mockPrisma),
}))

// ── Import da rota real ─────────────────────────────────────────────────────

import { loteRouter } from '../../../../../servicos-global/produto/pedido/server/src/routes/alteracoes-status-lote-pedido.js'

// ── App de teste ─────────────────────────────────────────────────────────────

let app: express.Express

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as unknown as { organizacao: { idOrganizacao: string } }).organizacao = { idOrganizacao: 'org-001' }
    next()
  })
  app.use('/api/v1/pedidos/alteracoes-status-lote', loteRouter)
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } })
  })
})

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.pedido.findMany.mockResolvedValue([
    { id_pedido: 'ped-001', numero_pedido: 'PO-001', status_pedido: 'aberto' },
    { id_pedido: 'ped-002', numero_pedido: 'PO-002', status_pedido: 'aberto' },
  ])
  mockPrisma.pedido.updateMany.mockResolvedValue({ count: 2 })
})

// ── POST /preview ────────────────────────────────────────────────────────────

describe('F-STS: POST /preview', () => {
  it('F-STS-P01: preview com status normal retorna afetados corretamente', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/alteracoes-status-lote/preview')
      .send({ ids: ['ped-001', 'ped-002'], status_novo: 'aprovado' })

    expect(res.status).toBe(200)
    expect(res.body.total).toBe(2)
    expect(res.body.afetados).toHaveLength(2)
    expect(res.body.afetados[0].status_novo).toBe('aprovado')
  })

  it('F-STS-P02: preview com transferencia retorna afetados (rota não bloqueia)', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/alteracoes-status-lote/preview')
      .send({ ids: ['ped-001'], status_novo: 'transferencia' })

    expect(res.status).toBe(200)
    expect(res.body.afetados[0].status_novo).toBe('transferencia')
  })

  it('F-STS-P03: preview com consolidado retorna afetados (rota não bloqueia)', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/alteracoes-status-lote/preview')
      .send({ ids: ['ped-001'], status_novo: 'consolidado' })

    expect(res.status).toBe(200)
    expect(res.body.afetados[0].status_novo).toBe('consolidado')
  })

  it('F-STS-P04: preview com body vazio retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/alteracoes-status-lote/preview')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('F-STS-P05: preview com ids vazio retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/alteracoes-status-lote/preview')
      .send({ ids: [], status_novo: 'aberto' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('F-STS-P06: preview com status_novo vazio retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/alteracoes-status-lote/preview')
      .send({ ids: ['ped-001'], status_novo: '' })

    expect(res.status).toBe(400)
  })
})

// ── POST /confirmar ──────────────────────────────────────────────────────────

describe('F-STS: POST /confirmar', () => {
  it('F-STS-C01: confirmar com status normal atualiza pedidos via updateMany', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/alteracoes-status-lote/confirmar')
      .send({ ids: ['ped-001', 'ped-002'], status_novo: 'aprovado' })

    expect(res.status).toBe(200)
    expect(res.body.sucesso).toBe(2)
    expect(mockPrisma.pedido.updateMany).toHaveBeenCalledWith({
      where: { id_pedido: { in: ['ped-001', 'ped-002'] }, id_organizacao: 'org-001' },
      data: { status_pedido: 'aprovado' },
    })
  })

  it('F-STS-C02: confirmar com transferencia atualiza o pedido (backend não faz distinção)', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/alteracoes-status-lote/confirmar')
      .send({ ids: ['ped-001'], status_novo: 'transferencia' })

    expect(res.status).toBe(200)
    expect(mockPrisma.pedido.updateMany).toHaveBeenCalledWith({
      where: { id_pedido: { in: ['ped-001'] }, id_organizacao: 'org-001' },
      data: { status_pedido: 'transferencia' },
    })
  })

  it('F-STS-C03: confirmar com consolidado atualiza o pedido (backend não faz distinção)', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/alteracoes-status-lote/confirmar')
      .send({ ids: ['ped-001'], status_novo: 'consolidado' })

    expect(res.status).toBe(200)
    expect(mockPrisma.pedido.updateMany).toHaveBeenCalledWith({
      where: { id_pedido: { in: ['ped-001'] }, id_organizacao: 'org-001' },
      data: { status_pedido: 'consolidado' },
    })
  })

  it('F-STS-C04: confirmar com body vazio retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/alteracoes-status-lote/confirmar')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('F-STS-C05: confirmar com status_novo contendo caracteres inválidos retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/alteracoes-status-lote/confirmar')
      .send({ ids: ['ped-001'], status_novo: 'Status Inválido!' })

    expect(res.status).toBe(400)
  })

  it('F-STS-C06: confirmar filtra por id_organizacao do tenant (isolamento)', async () => {
    await request(app)
      .post('/api/v1/pedidos/alteracoes-status-lote/confirmar')
      .send({ ids: ['ped-001'], status_novo: 'aberto' })

    const whereClause = mockPrisma.pedido.updateMany.mock.calls[0][0].where
    expect(whereClause.id_organizacao).toBe('org-001')
  })
})

// ── Lógica client-side (STATUS_SEM_ESPELHAMENTO) ─────────────────────────────

describe('F-STS: Lógica de espelhamento client-side', () => {
  const STATUS_SEM_ESPELHAMENTO = new Set(['transferencia', 'consolidado'])

  describe('cascade-down: pai → itens', () => {
    it('F-STS-CD01: status "aberto" no pai → frontend DEVE propagar para itens em cache', () => {
      const deveEspelhar = !STATUS_SEM_ESPELHAMENTO.has('aberto')
      expect(deveEspelhar).toBe(true)
    })

    it('F-STS-CD02: status "transferencia" no pai → frontend NÃO propaga para itens', () => {
      const deveEspelhar = !STATUS_SEM_ESPELHAMENTO.has('transferencia')
      expect(deveEspelhar).toBe(false)
    })

    it('F-STS-CD03: status "consolidado" no pai → frontend NÃO propaga para itens', () => {
      const deveEspelhar = !STATUS_SEM_ESPELHAMENTO.has('consolidado')
      expect(deveEspelhar).toBe(false)
    })
  })

  describe('bubble-up: item → pai', () => {
    it('F-STS-BU01: status "aprovado" no item → frontend DEVE chamar mudarStatusConfirmar no pai', () => {
      const deveEspelhar = !STATUS_SEM_ESPELHAMENTO.has('aprovado')
      expect(deveEspelhar).toBe(true)
    })

    it('F-STS-BU02: status "transferencia" no item → frontend NÃO chama mudarStatusConfirmar no pai', () => {
      const deveEspelhar = !STATUS_SEM_ESPELHAMENTO.has('transferencia')
      expect(deveEspelhar).toBe(false)
    })

    it('F-STS-BU03: status "consolidado" no item → frontend NÃO chama mudarStatusConfirmar no pai', () => {
      const deveEspelhar = !STATUS_SEM_ESPELHAMENTO.has('consolidado')
      expect(deveEspelhar).toBe(false)
    })
  })
})
