// server/__tests__/workspaces-habilitados-internal.test.ts
//
// Testes do endpoint S2S:
//   GET /api/v1/internal/usuarios/:id_usuario/workspaces-habilitados?id_organizacao=X
//
// Cobertura (E2 da entrega Lista multi-workspace):
//   (i)   MASTER → retorna lista completa de workspaces ATIVOS da org
//   (ii)  PADRAO → retorna apenas habilitados (UsuarioWorkspace.ativo)
//   (iii) FORNECEDOR → idem PADRAO, ignora id_organizacao mismatch (cross-tenant)
//   (iv)  usuário inexistente → 404 USUARIO_NAO_ENCONTRADO
//   (v)   sem x-chave-interna-servico → 401
//   (vi)  PADRAO com id_organizacao diferente do seu → 403 ORGANIZACAO_MISMATCH

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import supertest from 'supertest'

// ─── Mocks ──────────────────────────────────────────────────────────────────

const findUniqueUsuarioMock = vi.fn()
const findManyWorkspaceMock = vi.fn()
const findManyUsuarioWorkspaceMock = vi.fn()

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    usuario: {
      findUnique: (...args: unknown[]) => findUniqueUsuarioMock(...args),
    },
    workspace: {
      findMany: (...args: unknown[]) => findManyWorkspaceMock(...args),
    },
    usuarioWorkspace: {
      findMany: (...args: unknown[]) => findManyUsuarioWorkspaceMock(...args),
    },
  },
}))

// Mock middleware: aceita header válido, rejeita ausente
vi.mock('../middleware/requireInternalKey.js', () => ({
  requireInternalKey: (req: Request, _res: Response, next: NextFunction) => {
    const chave = req.headers['x-chave-interna-servico'] ?? req.headers['x-internal-key']
    if (!chave) {
      return next(Object.assign(new Error('Chave interna ausente'), { statusCode: 401, code: 'NO_INTERNAL_KEY' }))
    }
    next()
  },
}))

// Error handler simples para os testes (Express padrão retorna 500)
function setupApp() {
  const app = express()
  app.use(express.json())
  // Import dinâmico após mocks
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return import('../routes/workspaces-habilitados-internal.js').then(({ workspacesHabilitadosInternalRouter }) => {
    app.use('/api/v1/internal/usuarios', workspacesHabilitadosInternalRouter)
    app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.statusCode ?? 500).json({ error: { message: err.message, code: err.code } })
    })
    return app
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/v1/internal/usuarios/:id/workspaces-habilitados', () => {

  it('(i) MASTER retorna todos workspaces ATIVOS da org', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-master',
      id_organizacao: 'org-1',
      tipo_usuario: 'MASTER',
    })
    findManyWorkspaceMock.mockResolvedValueOnce([
      { id_workspace: 'ws-1' },
      { id_workspace: 'ws-2' },
      { id_workspace: 'ws-3' },
    ])

    const app = await setupApp()
    const res = await supertest(app)
      .get('/api/v1/internal/usuarios/u-master/workspaces-habilitados?id_organizacao=org-1')
      .set('x-chave-interna-servico', 'dev-key')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      tipo_usuario: 'MASTER',
      workspaces_habilitados: ['ws-1', 'ws-2', 'ws-3'],
    })
    // Confirma que filtra apenas ATIVO
    expect(findManyWorkspaceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status_workspace: 'ATIVO' }),
      }),
    )
    // Não chama a query de membership (bypass)
    expect(findManyUsuarioWorkspaceMock).not.toHaveBeenCalled()
  })

  it('(ii) PADRAO retorna só os habilitados via UsuarioWorkspace.ativo', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-padrao',
      id_organizacao: 'org-1',
      tipo_usuario: 'PADRAO',
    })
    findManyUsuarioWorkspaceMock.mockResolvedValueOnce([
      { id_workspace: 'ws-1' },
      { id_workspace: 'ws-2' },
    ])

    const app = await setupApp()
    const res = await supertest(app)
      .get('/api/v1/internal/usuarios/u-padrao/workspaces-habilitados?id_organizacao=org-1')
      .set('x-chave-interna-servico', 'dev-key')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      tipo_usuario: 'PADRAO',
      workspaces_habilitados: ['ws-1', 'ws-2'],
    })
    // Confirma que filtra UsuarioWorkspace.ativo + Workspace.status_workspace ATIVO
    expect(findManyUsuarioWorkspaceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          ativo_usuario_workspace: true,
          company: expect.objectContaining({ status_workspace: 'ATIVO' }),
        }),
      }),
    )
    expect(findManyWorkspaceMock).not.toHaveBeenCalled()
  })

  it('(iii) FORNECEDOR ignora cross-tenant check (id_organizacao diferente OK)', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-fornecedor',
      id_organizacao: 'org-fornecedor', // diferente da query
      tipo_usuario: 'FORNECEDOR',
    })
    findManyUsuarioWorkspaceMock.mockResolvedValueOnce([
      { id_workspace: 'ws-cliente-1' },
    ])

    const app = await setupApp()
    const res = await supertest(app)
      .get('/api/v1/internal/usuarios/u-fornecedor/workspaces-habilitados?id_organizacao=org-cliente')
      .set('x-chave-interna-servico', 'dev-key')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      tipo_usuario: 'FORNECEDOR',
      workspaces_habilitados: ['ws-cliente-1'],
    })
  })

  it('(iv) usuário inexistente → 404 USUARIO_NAO_ENCONTRADO', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce(null)

    const app = await setupApp()
    const res = await supertest(app)
      .get('/api/v1/internal/usuarios/u-inexistente/workspaces-habilitados?id_organizacao=org-1')
      .set('x-chave-interna-servico', 'dev-key')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('USUARIO_NAO_ENCONTRADO')
  })

  it('(v) sem x-chave-interna-servico → 401', async () => {
    const app = await setupApp()
    const res = await supertest(app)
      .get('/api/v1/internal/usuarios/u-master/workspaces-habilitados?id_organizacao=org-1')

    expect(res.status).toBe(401)
    // findUnique não deve nem ter sido chamado
    expect(findUniqueUsuarioMock).not.toHaveBeenCalled()
  })

  it('(vi) PADRAO com id_organizacao diferente → 403 ORGANIZACAO_MISMATCH', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-padrao-org-A',
      id_organizacao: 'org-A',
      tipo_usuario: 'PADRAO',
    })

    const app = await setupApp()
    const res = await supertest(app)
      .get('/api/v1/internal/usuarios/u-padrao-org-A/workspaces-habilitados?id_organizacao=org-B')
      .set('x-chave-interna-servico', 'dev-key')

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('ORGANIZACAO_MISMATCH')
    // Não consulta workspaces de outra org
    expect(findManyUsuarioWorkspaceMock).not.toHaveBeenCalled()
    expect(findManyWorkspaceMock).not.toHaveBeenCalled()
  })
})
