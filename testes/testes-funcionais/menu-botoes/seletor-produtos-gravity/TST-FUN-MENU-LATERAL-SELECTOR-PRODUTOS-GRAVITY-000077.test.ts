/**
 * TST-FUN-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000077 — GET /api/v1/workspaces/:id_workspace/produtos-gravity
 * Fonte do seletor de produtos (useProdutosSwitcher).
 */
import express from 'express'
import request from 'supertest'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const {
  mockWorkspaceFindFirst,
  mockProdutoGravityWorkspaceFindMany,
  mockProdutoGravityFindMany,
  mockListarSlugsProdutosAcessiveis,
} = vi.hoisted(() => ({
  mockWorkspaceFindFirst: vi.fn(),
  mockProdutoGravityWorkspaceFindMany: vi.fn(),
  mockProdutoGravityFindMany: vi.fn(),
  mockListarSlugsProdutosAcessiveis: vi.fn(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    workspace: { findFirst: mockWorkspaceFindFirst },
    produtoGravityWorkspace: { findMany: mockProdutoGravityWorkspaceFindMany },
    produtoGravity: { findMany: mockProdutoGravityFindMany },
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req.auth = (globalThis as Record<string, unknown>).__testAuth ?? {
      id_usuario: 'usr_a',
      id_organizacao: 'org_a',
      tipo_usuario: 'PADRAO',
    }
    next()
  },
}))

vi.mock('../../../../servicos-global/configurador/server/services/produtos-acessiveis-service.js', () => ({
  listarSlugsProdutosAcessiveis: mockListarSlugsProdutosAcessiveis,
}))

import { companyProductsRouter } from '../../../../servicos-global/configurador/server/routes/produto-gravity-workspace.js'

function criarApp() {
  const app = express()
  app.use('/api/v1/workspaces/:id_workspace/produtos-gravity', companyProductsRouter)
  return app
}

describe('TST-FUN-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000077 — GET produtos-gravity workspace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(globalThis as Record<string, unknown>).__testAuth = {
      id_usuario: 'usr_a',
      id_organizacao: 'org_a',
      tipo_usuario: 'PADRAO',
    }
  })

  it('retorna 200 e contrato { products[] } para workspace da org autenticada', async () => {
    mockWorkspaceFindFirst.mockResolvedValue({
      id_workspace: 'ws_a',
      id_organizacao: 'org_a',
    })
    mockListarSlugsProdutosAcessiveis.mockResolvedValue(new Set(['pedido']))
    mockProdutoGravityWorkspaceFindMany.mockResolvedValue([
      {
        id_produto_gravity_workspace: 'pgw_1',
        ativo_produto_gravity_workspace: true,
        data_contratacao_produto_gravity_workspace: new Date('2026-06-01'),
        produto: { slug_produto_gravity: 'pedido' },
      },
    ])
    mockProdutoGravityFindMany.mockResolvedValue([
      {
        id_produto_gravity: 'pg_1',
        nome_produto_gravity: 'Pedido',
        slug_produto_gravity: 'pedido',
        descricao_produto_gravity: 'Pedidos',
        status_produto_gravity: 'active',
      },
    ])

    const res = await request(criarApp()).get('/api/v1/workspaces/ws_a/produtos-gravity')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.products)).toBe(true)
    expect(res.body.products[0]).toMatchObject({
      product_key: 'pedido',
      is_active: true,
      catalog: { name: 'Pedido', slug: 'pedido' },
    })
  })

  it('retorna 404 quando workspace pertence a outra organização (PADRAO)', async () => {
    mockWorkspaceFindFirst.mockResolvedValue(null)

    const res = await request(criarApp()).get('/api/v1/workspaces/ws_outra_org/produtos-gravity')
    expect(res.status).toBe(404)
  })
})
