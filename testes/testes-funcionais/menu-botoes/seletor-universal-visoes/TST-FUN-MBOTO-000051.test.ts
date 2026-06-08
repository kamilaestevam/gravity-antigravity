/**
 * TST-FUN-MBOTO-000051 — GET /api/v1/pedidos/visao-geral/agregado
 */
import express from 'express'
import request from 'supertest'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { visaoGeralAgregadoRouter } from '../../../../servicos-global/produto/pedido/server/src/routes/visao-geral-agregado.js'

const mockRows = [
  {
    status_pedido: 'aberto',
    valor_total_pedido: 100,
    tipo_operacao_pedido: 'importacao',
    incoterm_pedido: 'fob',
    moeda_pedido: 'USD',
    data_emissao_pedido: new Date().toISOString(),
    data_prevista_pedido_pronto: null,
    data_meta_pedido_pronto: null,
    created_at: new Date().toISOString(),
    numero_pedido: 'P-1',
  },
]

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: vi.fn(async (_req: unknown, cb: (db: unknown) => Promise<unknown>) => {
    const db = {
      pedido: {
        findMany: vi.fn(async () => mockRows),
      },
    }
    return cb(db)
  }),
}))

vi.mock('../../../../servicos-global/produto/pedido/server/src/shared/workspace-filtro-pedido.js', () => ({
  clausulaFiltroWorkspacePedido: vi.fn(() => ({})),
}))

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use((req, _res, next) => {
    ;(req as express.Request & { headers: Record<string, string> }).headers['x-workspace-id'] = 'ws_test'
    next()
  })
  app.use('/api/v1/pedidos/visao-geral', visaoGeralAgregadoRouter)
  return app
}

describe('TST-FUN-MBOTO-000051 — visao-geral agregado', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 200 e payload com total', async () => {
    const t0 = Date.now()
    const res = await request(criarApp()).get('/api/v1/pedidos/visao-geral/agregado')
    const elapsed = Date.now() - t0
    expect(res.status).toBe(200)
    expect(res.body.data).toBeDefined()
    expect(res.body.data.total).toBe(1)
    expect(res.body.data.kpis.valor_total).toBe(100)
    expect(elapsed).toBeLessThan(200)
  })
})
