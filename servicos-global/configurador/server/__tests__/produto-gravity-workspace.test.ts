// server/__tests__/produto-gravity-workspace.test.ts
// Testes do GET /api/v1/workspaces/:id_workspace/produtos-gravity
//
// Cobre o fix dos 2 bugs encontrados no Core:
//   1. Produto com assinatura SUSPENSA aparecia como ATIVO no Core
//   2. Produto contratado pela organização mas não habilitado no workspace
//      aparecia mesmo assim (via fallback tenantConfigs, agora removido)
//
// Regras validadas:
//   - Só aparece produto com ProdutoGravityWorkspace.ativo_produto_gravity_workspace=true
//   - E assinatura status IN ('ATIVA', 'EM_TESTE') para a organização
//   - Isolamento cross-organização (filtro id_organizacao no `some` da assinatura)
//
// REGRAS: Mandamento 03 (DDD), Mandamento 08 (sem fallback silencioso),
//         Mandamento — isolamento de organização

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import supertest from 'supertest'

// ─── Mocks ──────────────────────────────────────────────────────────────────

const defaultAuth = {
  id_usuario: 'user-001',
  clerkUserId: 'clerk_001',
  id_organizacao: 'org-A',
  tipo_usuario: 'ADMIN',
}

let authOverride: typeof defaultAuth | null = null

vi.mock('../middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req.auth = authOverride ?? defaultAuth
    next()
  },
}))

// requireConfiguradorMutation não é exercitado nos GETs, mas tem que estar mocado para o module load
vi.mock('../middleware/requireConfiguradorAccess.js', () => ({
  requireConfiguradorMutation: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

// Mock do prisma — só dos métodos exercitados pelo GET
const workspaceFindFirst = vi.fn()
const produtoGravityWorkspaceFindMany = vi.fn()
const produtoGravityFindMany = vi.fn()

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    workspace: { findFirst: workspaceFindFirst },
    produtoGravityWorkspace: { findMany: produtoGravityWorkspaceFindMany },
    produtoGravity: { findMany: produtoGravityFindMany },
  },
}))

// ─── App setup ──────────────────────────────────────────────────────────────

let app: express.Express
let request: ReturnType<typeof supertest>

beforeAll(async () => {
  const { companyProductsRouter } = await import('../routes/produto-gravity-workspace.js')

  app = express()
  app.use(express.json())
  app.use('/api/v1/workspaces/:id_workspace/produtos-gravity', companyProductsRouter)

  interface HttpError extends Error {
    statusCode?: number
    code?: string
  }
  app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({
      error: { code: err.code ?? 'INTERNAL', message: err.message },
    })
  })

  request = supertest(app)
})

beforeEach(() => {
  authOverride = null
  workspaceFindFirst.mockReset()
  produtoGravityWorkspaceFindMany.mockReset()
  produtoGravityFindMany.mockReset()

  // Default: workspace válido pertence à organização autenticada
  workspaceFindFirst.mockResolvedValue({
    id_workspace: 'ws-1',
    id_organizacao: 'org-A',
  })
})

// ─── Fixtures ───────────────────────────────────────────────────────────────

const fixtureProduto = (slug: string, nome = slug) => ({
  id_produto_gravity: `prod-${slug}`,
  nome_produto_gravity: nome,
  slug_produto_gravity: slug,
  descricao_produto_gravity: `${nome} descrição`,
  status_produto_gravity: 'ATIVO',
})

const fixtureProdutoGravityWorkspaceRow = (slug: string) => ({
  id_produto_gravity_workspace: `pgw-${slug}`,
  id_organizacao: 'org-A',
  id_workspace: 'ws-1',
  id_produto_gravity: `prod-${slug}`,
  ativo_produto_gravity_workspace: true,
  data_contratacao_produto_gravity_workspace: new Date('2026-05-01T00:00:00Z'),
  data_atualizacao_produto_gravity_workspace: new Date('2026-05-01T00:00:00Z'),
  produto: fixtureProduto(slug),
})

// ─── Testes ─────────────────────────────────────────────────────────────────

describe('GET /api/v1/workspaces/:id_workspace/produtos-gravity', () => {
  describe('Filtro por status de assinatura (Bug 1 — suspensa não aparece)', () => {
    it('T1 — assinatura SUSPENSA: produto NÃO aparece (filtrado pela query Prisma)', async () => {
      // Quando a assinatura está SUSPENSA, a query do endpoint não retorna o registro.
      // O mock simula esse comportamento devolvendo array vazio para esse cenário.
      produtoGravityWorkspaceFindMany.mockResolvedValue([])
      produtoGravityFindMany.mockResolvedValue([])

      const res = await request.get('/api/v1/workspaces/ws-1/produtos-gravity')

      expect(res.status).toBe(200)
      expect(res.body.products).toEqual([])

      // Confirma que o filtro de status foi aplicado
      const whereArg = produtoGravityWorkspaceFindMany.mock.calls[0][0].where
      expect(whereArg.produto.assinaturas_produto_gravity.some.status_assinatura_produto_gravity).toEqual({
        in: ['ATIVA', 'EM_TESTE'],
      })
    })

    it('T4 — assinatura EM_TESTE: produto aparece', async () => {
      const row = fixtureProdutoGravityWorkspaceRow('simula-custo')
      produtoGravityWorkspaceFindMany.mockResolvedValue([row])
      produtoGravityFindMany.mockResolvedValue([fixtureProduto('simula-custo', 'Simula Custo')])

      const res = await request.get('/api/v1/workspaces/ws-1/produtos-gravity')

      expect(res.status).toBe(200)
      expect(res.body.products).toHaveLength(1)
      expect(res.body.products[0].product_key).toBe('simula-custo')
      expect(res.body.products[0].is_active).toBe(true)
    })

    it('T5 — assinatura ATIVA + workspace habilitado: produto aparece', async () => {
      const row = fixtureProdutoGravityWorkspaceRow('pedido')
      produtoGravityWorkspaceFindMany.mockResolvedValue([row])
      produtoGravityFindMany.mockResolvedValue([fixtureProduto('pedido', 'Pedido')])

      const res = await request.get('/api/v1/workspaces/ws-1/produtos-gravity')

      expect(res.status).toBe(200)
      expect(res.body.products).toHaveLength(1)
      expect(res.body.products[0].product_key).toBe('pedido')
    })
  })

  describe('Filtro por habilitação no workspace (Bug 2 — sem fallback)', () => {
    it('T2 — workspace virgem (sem ProdutoGravityWorkspace): retorna lista vazia', async () => {
      // Org tem assinaturas ATIVAS para produtos, mas o workspace é virgem.
      // Antes: fallback injetava as configs da org. Agora: lista vazia.
      produtoGravityWorkspaceFindMany.mockResolvedValue([])
      produtoGravityFindMany.mockResolvedValue([])

      const res = await request.get('/api/v1/workspaces/ws-1/produtos-gravity')

      expect(res.status).toBe(200)
      expect(res.body.products).toEqual([])
    })

    it('T3 — ProdutoGravityWorkspace existe mas ativo=false: produto NÃO aparece', async () => {
      // Query Prisma filtra ativo_produto_gravity_workspace=true. Mock simula isso.
      produtoGravityWorkspaceFindMany.mockResolvedValue([])
      produtoGravityFindMany.mockResolvedValue([])

      const res = await request.get('/api/v1/workspaces/ws-1/produtos-gravity')

      expect(res.status).toBe(200)
      expect(res.body.products).toEqual([])

      // Confirma que o filtro de ativo foi aplicado
      const whereArg = produtoGravityWorkspaceFindMany.mock.calls[0][0].where
      expect(whereArg.ativo_produto_gravity_workspace).toBe(true)
    })
  })

  describe('Isolamento por organização (Mandamento)', () => {
    it('T6 — id_organizacao filtra TANTO o ProdutoGravityWorkspace quanto a assinatura aninhada', async () => {
      produtoGravityWorkspaceFindMany.mockResolvedValue([])
      produtoGravityFindMany.mockResolvedValue([])

      await request.get('/api/v1/workspaces/ws-1/produtos-gravity')

      const whereArg = produtoGravityWorkspaceFindMany.mock.calls[0][0].where
      expect(whereArg.id_organizacao).toBe('org-A')
      expect(whereArg.produto.assinaturas_produto_gravity.some.id_organizacao).toBe('org-A')
    })

    it('workspace de outra organização: 404', async () => {
      workspaceFindFirst.mockResolvedValue(null) // não pertence à org autenticada

      const res = await request.get('/api/v1/workspaces/ws-1/produtos-gravity')

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })
  })

  describe('Contrato externo preservado (REGRA 07/09)', () => {
    it('shape da resposta: { products: [{ id, product_key, is_active, activated_at, catalog }] }', async () => {
      const row = fixtureProdutoGravityWorkspaceRow('nf-import')
      produtoGravityWorkspaceFindMany.mockResolvedValue([row])
      produtoGravityFindMany.mockResolvedValue([fixtureProduto('nf-import', 'NF Import')])

      const res = await request.get('/api/v1/workspaces/ws-1/produtos-gravity')

      expect(res.status).toBe(200)
      expect(res.body.products[0]).toMatchObject({
        id: expect.any(String),
        product_key: 'nf-import',
        is_active: true,
        catalog: expect.objectContaining({
          id: expect.any(String),
          name: 'NF Import',
          slug: 'nf-import',
        }),
      })
      // activated_at vem como string (DateTime serializado em JSON)
      expect(res.body.products[0].activated_at).toBeTruthy()
    })

    it('catalog é null quando o produto não tem entrada no catálogo (defensivo)', async () => {
      const row = fixtureProdutoGravityWorkspaceRow('ghost')
      produtoGravityWorkspaceFindMany.mockResolvedValue([row])
      produtoGravityFindMany.mockResolvedValue([]) // catálogo vazio

      const res = await request.get('/api/v1/workspaces/ws-1/produtos-gravity')

      expect(res.status).toBe(200)
      expect(res.body.products[0].catalog).toBeNull()
    })
  })
})
