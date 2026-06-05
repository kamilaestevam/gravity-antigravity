// @vitest-environment node
// TST-FUN-STORE-000001 — POST /api/v1/organizacoes/me/assinaturas-produto-gravity/assinar-produto
/// <reference types="vitest/globals" />

const {
  mockFindFirst,
  mockTransaction,
  mockAssinaturaUpsert,
  mockConfigUpsert,
  mockWorkspaceFindMany,
  mockPgWorkspaceUpsert,
  mockWorkspaceFindManyAfter,
  mockAoHabilitar,
} = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockTransaction: vi.fn(),
  mockAssinaturaUpsert: vi.fn(),
  mockConfigUpsert: vi.fn(),
  mockWorkspaceFindMany: vi.fn(),
  mockPgWorkspaceUpsert: vi.fn(),
  mockWorkspaceFindManyAfter: vi.fn(),
  mockAoHabilitar: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    produtoGravity: { findFirst: mockFindFirst },
    workspace: { findMany: mockWorkspaceFindManyAfter },
    $transaction: mockTransaction,
  },
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = {
      id_usuario: 'usr_store_01',
      id_organizacao: 'org_store_alpha',
      tipo_usuario: 'MASTER',
    }
    next()
  },
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireConfiguradorAccess.js', () => ({
  requireConfiguradorMutation: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

vi.mock('../../../servicos-global/configurador/server/services/sincronizar-acesso-usuario-produtos-service.js', () => ({
  aoHabilitarProdutoNoWorkspace: mockAoHabilitar,
  aoDesabilitarProdutoNoWorkspace: vi.fn(),
}))

vi.mock('../../../../configurador/generated/index.js', () => ({
  StatusProdutoGravity: { ATIVO: 'ATIVO', EM_BREVE: 'EM_BREVE' },
  StatusAssinaturaProdutoGravity: { ATIVA: 'ATIVA', SUSPENSA: 'SUSPENSA', EM_TESTE: 'EM_TESTE', CANCELADA: 'CANCELADA' },
}))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { assinaturaProdutoGravityRouter } from '../../../servicos-global/configurador/server/routes/assinatura-produto-gravity.js'
import { AppError } from '../../../servicos-global/configurador/server/lib/appError.js'

const app = express()
app.use(express.json())
app.use('/api/v1/organizacoes/me/assinaturas-produto-gravity', assinaturaProdutoGravityRouter)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
    return
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } })
})

const PRODUTO_ATIVO = {
  id_produto_gravity: 'prod_pedido_01',
  slug_produto_gravity: 'pedido',
  status_produto_gravity: 'ATIVO',
}

describe('TST-FUN-STORE-000001 — assinar-produto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWorkspaceFindMany.mockResolvedValue([{ id_workspace: 'ws_01' }])
    mockWorkspaceFindManyAfter.mockResolvedValue([{ id_workspace: 'ws_01' }])
    mockAssinaturaUpsert.mockResolvedValue({
      id_assinatura_produto_gravity: 'ass_01',
      produto: PRODUTO_ATIVO,
    })
    mockConfigUpsert.mockResolvedValue({
      chave_produto_configuracao_produto_gravity: 'pedido',
      ativo_configuracao_produto_gravity: true,
    })
    mockPgWorkspaceUpsert.mockResolvedValue({})
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        produtoGravityAssinatura: { upsert: mockAssinaturaUpsert },
        produtoGravityConfiguracao: { upsert: mockConfigUpsert },
        workspace: { findMany: mockWorkspaceFindMany },
        produtoGravityWorkspace: { upsert: mockPgWorkspaceUpsert },
      }
      return fn(tx)
    })
  })

  it('retorna 201 ao contratar produto ATIVO', async () => {
    mockFindFirst.mockResolvedValue(PRODUTO_ATIVO)

    const res = await request(app)
      .post('/api/v1/organizacoes/me/assinaturas-produto-gravity/assinar-produto')
      .send({ slug_produto_gravity: 'pedido' })

    expect(res.status).toBe(201)
    expect(res.body.configuracao.ativo_configuracao_produto_gravity).toBe(true)
    expect(mockAssinaturaUpsert).toHaveBeenCalled()
  })

  it('upsert usa id_organizacao do req.auth', async () => {
    mockFindFirst.mockResolvedValue(PRODUTO_ATIVO)

    await request(app)
      .post('/api/v1/organizacoes/me/assinaturas-produto-gravity/assinar-produto')
      .send({ slug_produto_gravity: 'pedido' })

    expect(mockAssinaturaUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ id_organizacao: 'org_store_alpha' }),
      }),
    )
  })

  it('retorna 400 quando slug_produto_gravity ausente', async () => {
    const res = await request(app)
      .post('/api/v1/organizacoes/me/assinaturas-produto-gravity/assinar-produto')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockFindFirst).not.toHaveBeenCalled()
  })

  it('retorna 404 quando produto não está ATIVO no catálogo', async () => {
    mockFindFirst.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/organizacoes/me/assinaturas-produto-gravity/assinar-produto')
      .send({ slug_produto_gravity: 'produto-inexistente' })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(mockTransaction).not.toHaveBeenCalled()
  })
})
