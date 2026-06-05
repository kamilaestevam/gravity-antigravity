// @vitest-environment node
// TST-FUN-STORE-000002 — GET /api/v1/produtos-gravity (catálogo Store)
/// <reference types="vitest/globals" />

const { mockListarPublico } = vi.hoisted(() => ({
  mockListarPublico: vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/services/produto-gravity-catalogo-service.js', () => ({
  produtoGravityCatalogoServico: { listarPublico: mockListarPublico },
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {},
}))

import express from 'express'
import request from 'supertest'
import { productsRouter } from '../../../servicos-global/configurador/server/routes/produto-gravity.js'

const app = express()
app.use('/api/v1/produtos-gravity', productsRouter)

describe('TST-FUN-STORE-000002 — GET /api/v1/produtos-gravity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 200 com products mapeados do listarPublico()', async () => {
    mockListarPublico.mockResolvedValue([
      {
        id: '1',
        name: 'Pedido',
        slug: 'pedido',
        description: 'Gestão de pedidos',
        status: 'ATIVO',
        unit_price: 10,
        unit_currency: 'BRL',
        backend_module: 'pedido',
        billing_type: 'POR_PRODUTO',
      },
    ])

    const res = await request(app).get('/api/v1/produtos-gravity')

    expect(res.status).toBe(200)
    expect(res.body.products).toHaveLength(1)
    expect(res.body.products[0]).toMatchObject({
      slug: 'pedido',
      status: 'ATIVO',
      currency: 'BRL',
    })
  })

  it('retorna products vazio quando serviço lança erro', async () => {
    mockListarPublico.mockRejectedValue(new Error('db down'))

    const res = await request(app).get('/api/v1/produtos-gravity')

    expect(res.status).toBe(200)
    expect(res.body.products).toEqual([])
  })
})
