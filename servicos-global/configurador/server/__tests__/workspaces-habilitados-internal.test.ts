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

// Refactor D11 (2026-05-13): endpoint agora consome organizacaoService.workspacesAcessiveis().
// Como o service usa prisma internamente (já mockado acima), basta mockar as
// dependências TRANSITIVAS do service para evitar erro de import (criarEmpresa,
// securityAudit, sincronizar-acesso-usuario-produtos-service). Logger também.
vi.mock('../lib/logger.js', () => ({
  logger: { child: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }) },
}))
vi.mock('../services/cadastros-client.js', () => ({
  criarEmpresa: vi.fn(),
  compensarEmpresa: vi.fn(),
}))
vi.mock('../../../servicos-plataforma/historico-global/server/lib/securityAuditLogger.js', () => ({
  securityAudit: vi.fn(),
}))
vi.mock('../services/sincronizar-acesso-usuario-produtos-service.js', () => ({
  aoHabilitarProdutoNoWorkspace: vi.fn(),
  aoVincularUsuarioAoWorkspace: vi.fn(),
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

// Helper para o shape que o service espera (após D11)
const wsRow = (id: string) => ({
  id_workspace: id,
  nome_workspace: `Workspace ${id}`,
  subdominio_workspace: id,
  cnpj_workspace: null,
  status_workspace: 'ATIVO',
  data_criacao_workspace: new Date('2026-01-01'),
  _count: { memberships: 0 },
})

describe('GET /api/v1/internal/usuarios/:id/workspaces-habilitados', () => {

  it('(i) MASTER retorna todos workspaces ATIVOS da org', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-master',
      id_organizacao: 'org-1',
      tipo_usuario: 'MASTER',
    })
    // D11: service usa prisma.workspace.findMany com select rico
    findManyWorkspaceMock.mockResolvedValueOnce([wsRow('ws-1'), wsRow('ws-2'), wsRow('ws-3')])

    const app = await setupApp()
    const res = await supertest(app)
      .get('/api/v1/internal/usuarios/u-master/workspaces-habilitados?id_organizacao=org-1')
      .set('x-chave-interna-servico', 'dev-key')

    expect(res.status).toBe(200)
    // Endpoint projeta para apenas IDs (contrato S2S preservado)
    expect(res.body).toEqual({
      tipo_usuario: 'MASTER',
      workspaces_habilitados: ['ws-1', 'ws-2', 'ws-3'],
    })
    // MASTER → where simples (sem memberships filter)
    expect(findManyWorkspaceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_organizacao: 'org-1', status_workspace: 'ATIVO' },
      }),
    )
  })

  it('(ii) PADRAO retorna só os habilitados via memberships.some', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-padrao',
      id_organizacao: 'org-1',
      tipo_usuario: 'PADRAO',
    })
    // D11: service usa prisma.workspace.findMany com filtro memberships.some
    findManyWorkspaceMock.mockResolvedValueOnce([wsRow('ws-1'), wsRow('ws-2')])

    const app = await setupApp()
    const res = await supertest(app)
      .get('/api/v1/internal/usuarios/u-padrao/workspaces-habilitados?id_organizacao=org-1')
      .set('x-chave-interna-servico', 'dev-key')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      tipo_usuario: 'PADRAO',
      workspaces_habilitados: ['ws-1', 'ws-2'],
    })
    // PADRAO → where com memberships.some E status ATIVO
    expect(findManyWorkspaceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status_workspace: 'ATIVO',
          memberships: {
            some: { id_usuario: 'u-padrao', ativo_usuario_workspace: true },
          },
        }),
      }),
    )
  })

  it('(iii) FORNECEDOR cross-tenant (id_organizacao diferente OK via flag)', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-fornecedor',
      id_organizacao: 'org-fornecedor', // diferente da query
      tipo_usuario: 'FORNECEDOR',
    })
    findManyWorkspaceMock.mockResolvedValueOnce([wsRow('ws-cliente-1')])

    const app = await setupApp()
    const res = await supertest(app)
      .get('/api/v1/internal/usuarios/u-fornecedor/workspaces-habilitados?id_organizacao=org-cliente')
      .set('x-chave-interna-servico', 'dev-key')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      tipo_usuario: 'FORNECEDOR',
      workspaces_habilitados: ['ws-cliente-1'],
    })
    // Confirma que a query rodou com a org SOLICITADA (não a do usuário)
    expect(findManyWorkspaceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id_organizacao: 'org-cliente' }),
      }),
    )
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
