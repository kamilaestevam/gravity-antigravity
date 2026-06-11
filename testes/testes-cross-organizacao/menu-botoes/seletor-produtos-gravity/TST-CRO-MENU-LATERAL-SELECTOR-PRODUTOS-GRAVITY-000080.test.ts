/**
 * TST-CRO-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000080 — Isolamento cross-org no seletor de produtos
 *
 * Vetor: usuário org A não lista produtos de workspace da org B via
 * GET /api/v1/workspaces/:id_workspace/produtos-gravity
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

const { mockWorkspaceFindFirst } = vi.hoisted(() => ({
  mockWorkspaceFindFirst: vi.fn(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    workspace: { findFirst: mockWorkspaceFindFirst },
    produtoGravityWorkspace: { findMany: vi.fn() },
    produtoGravity: { findMany: vi.fn() },
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req.auth = {
      id_usuario: 'usr_org_a',
      id_organizacao: 'org_a',
      tipo_usuario: 'PADRAO',
    }
    next()
  },
}))

vi.mock('../../../../servicos-global/configurador/server/services/produtos-acessiveis-service.js', () => ({
  listarSlugsProdutosAcessiveis: vi.fn(async () => new Set(['pedido'])),
}))

import { companyProductsRouter } from '../../../../servicos-global/configurador/server/routes/produto-gravity-workspace.js'

const ORG_A = 'org_a'
const ORG_B = 'org_b'
const WS_B = 'ws_org_b'

describe('TST-CRO-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000080 — Cross-tenant seletor produtos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('org A recebe 404 ao consultar workspace da org B (filtro id_organizacao no findFirst)', async () => {
    mockWorkspaceFindFirst.mockImplementation(async (args: { where: Record<string, string> }) => {
      const bateOrg = args.where.id_organizacao === ORG_A && args.where.id_workspace === WS_B
      return bateOrg ? null : null
    })

    const app = express()
    app.use('/api/v1/workspaces/:id_workspace/produtos-gravity', companyProductsRouter)

    const res = await request(app).get(`/api/v1/workspaces/${WS_B}/produtos-gravity`)
    expect(res.status).toBe(404)
    expect(mockWorkspaceFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id_workspace: WS_B,
          id_organizacao: ORG_A,
        }),
      }),
    )
  })

  describe('pendente — ambiente integrado', () => {
    it.todo(`Org ${ORG_A} não vê product_key exclusivo habilitado só em workspace ${ORG_B}`)
    it.todo(`Portão 3: usuário ${ORG_A} sem chave no produto não recebe slug no seletor`)
  })
})
