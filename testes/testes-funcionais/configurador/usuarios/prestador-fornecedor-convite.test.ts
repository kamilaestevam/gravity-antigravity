// @vitest-environment node
// TST-FUNC-CONF-PREST-001 — Convite FORNECEDOR + rotas prestadores-fornecedor

import { vi, describe, it, expect, beforeEach } from 'vitest'

const {
  mockOrganizacaoFindUnique,
  mockUsuarioFindFirst,
  mockUsuarioCreate,
  mockWorkspaceFindMany,
  mockUsuarioWorkspaceCreateMany,
  mockTransaction,
  mockInvitationCreate,
  mockProvisionarPrestadorFornecedor,
  mockListarVinculosFornecedorPorUsuario,
} = vi.hoisted(() => ({
  mockOrganizacaoFindUnique: vi.fn(),
  mockUsuarioFindFirst: vi.fn(),
  mockUsuarioCreate: vi.fn(),
  mockWorkspaceFindMany: vi.fn(),
  mockUsuarioWorkspaceCreateMany: vi.fn(),
  mockTransaction: vi.fn(),
  mockInvitationCreate: vi.fn(),
  mockProvisionarPrestadorFornecedor: vi.fn(),
  mockListarVinculosFornecedorPorUsuario: vi.fn(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    organizacao: { findUnique: mockOrganizacaoFindUnique, findFirst: vi.fn() },
    usuario: { findFirst: mockUsuarioFindFirst },
    workspace: { findMany: mockWorkspaceFindMany },
    usuarioWorkspace: { createMany: mockUsuarioWorkspaceCreateMany },
    $transaction: mockTransaction,
  },
}))

vi.mock('../../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: {
    invitations: { createInvitation: mockInvitationCreate },
  },
}))

vi.mock('../../../../servicos-global/configurador/server/services/prestador-fornecedor-vinculo-service.js', () => ({
  provisionarPrestadorFornecedor: mockProvisionarPrestadorFornecedor,
}))

vi.mock('../../../../servicos-global/configurador/server/services/sincronizar-acesso-usuario-produtos-service.js', () => ({
  aoVincularUsuarioAoWorkspace: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../../servicos-global/configurador/server/services/cadastros-client.js', () => ({
  listarVinculosFornecedorPorUsuario: mockListarVinculosFornecedorPorUsuario,
}))

vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/server/services/audit.service.js', () => ({
  AuditService: { log: vi.fn().mockResolvedValue(undefined) },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = {
      id_usuario: 'usr_forn_01',
      id_organizacao: 'org_forn_01',
      id_clerk_usuario: 'clerk_forn_01',
      tipo_usuario: 'MASTER',
      nome_usuario: 'Master Tester',
    }
    next()
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireMasterRole.js', () => ({
  requireMasterRole: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { usersRouter } from '../../../../servicos-global/configurador/server/routes/usuario.js'
import { prestadoresFornecedorRouter } from '../../../../servicos-global/configurador/server/routes/prestadores-fornecedor.js'
import { AppError } from '../../../../servicos-global/configurador/server/lib/appError.js'

const appConvite = express()
appConvite.use(express.json())
appConvite.use('/api/v1/usuarios', usersRouter)
appConvite.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
    return
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } })
})

const appPrestador = express()
appPrestador.use(express.json())
appPrestador.use('/api/v1/prestadores-fornecedor', prestadoresFornecedorRouter)
appPrestador.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
    return
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } })
})

const CUID_WS_A = 'cld8n2b0j0000mhog1234ws01'

const USUARIO_FORNECEDOR_CRIADO = {
  id_usuario: 'usr_forn_new',
  id_organizacao: 'org_forn_01',
  id_clerk_usuario: 'pending_inv_forn',
  email_usuario: 'agente@frete.com',
  nome_usuario: 'Agente Frete',
  tipo_usuario: 'FORNECEDOR',
  acesso_workspaces_futuros: false,
}

function setupTransaction() {
  mockTransaction.mockImplementation(
    async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        usuario: { create: mockUsuarioCreate },
        usuarioWorkspace: { createMany: mockUsuarioWorkspaceCreateMany },
      }),
  )
}

describe('TST-FUNC-CONF-PREST-001 — Convite FORNECEDOR', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupTransaction()
    mockOrganizacaoFindUnique.mockResolvedValue({
      status_organizacao: 'ATIVO',
      hospeda_colaboradores_gravity: false,
    })
    mockInvitationCreate.mockResolvedValue({ id: 'inv_forn_01' })
    mockUsuarioFindFirst.mockResolvedValue(null)
    mockUsuarioCreate.mockResolvedValue(USUARIO_FORNECEDOR_CRIADO)
    mockWorkspaceFindMany.mockResolvedValue([{ id_workspace: CUID_WS_A }])
    mockUsuarioWorkspaceCreateMany.mockResolvedValue({ count: 1 })
    mockProvisionarPrestadorFornecedor.mockResolvedValue({
      id_fornecedor: 'forn_01',
      id_organizacao_gravity: 'org_gravity',
      vinculos_criados: ['org_gravity', 'org_forn_01'],
      vinculos_existentes: [],
    })
  })

  it('retorna 400 quando FORNECEDOR enviado sem tipo_fornecedor_organizacao', async () => {
    const res = await request(appConvite)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'agente@frete.com',
        nome_usuario: 'Agente Frete',
        tipo_usuario: 'FORNECEDOR',
        workspaces_alvo: [CUID_WS_A],
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockProvisionarPrestadorFornecedor).not.toHaveBeenCalled()
  })

  it('retorna 201 e chama provisionarPrestadorFornecedor após convite FORNECEDOR', async () => {
    const res = await request(appConvite)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'agente@frete.com',
        nome_usuario: 'Agente Frete',
        tipo_usuario: 'FORNECEDOR',
        workspaces_alvo: [CUID_WS_A],
        tipo_fornecedor_organizacao: 'AGENTE_CARGA',
      })

    expect(res.status).toBe(201)
    expect(mockProvisionarPrestadorFornecedor).toHaveBeenCalledWith(
      expect.objectContaining({
        id_usuario: 'usr_forn_new',
        email_usuario: 'agente@frete.com',
        nome_usuario: 'Agente Frete',
        tipo_fornecedor_organizacao: 'AGENTE_CARGA',
        id_organizacao_cliente: 'org_forn_01',
      }),
    )
  })

  it('retorna 201 mesmo se provisionar falhar (convite já commitado)', async () => {
    mockProvisionarPrestadorFornecedor.mockRejectedValue(new Error('Cadastros indisponível'))

    const res = await request(appConvite)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'agente@frete.com',
        nome_usuario: 'Agente Frete',
        tipo_usuario: 'FORNECEDOR',
        workspaces_alvo: [CUID_WS_A],
        tipo_fornecedor_organizacao: 'ARMADOR',
      })

    expect(res.status).toBe(201)
    expect(mockProvisionarPrestadorFornecedor).toHaveBeenCalled()
  })
})

describe('TST-FUNC-CONF-PREST-002 — GET /prestadores-fornecedor/vinculos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListarVinculosFornecedorPorUsuario.mockResolvedValue([
      {
        id_fornecedor_organizacao: 'vinc_01',
        id_fornecedor: 'forn_01',
        id_organizacao: 'org_gravity',
        tipo_fornecedor_organizacao: 'AGENTE_CARGA',
        status_fornecedor_organizacao: 'ATIVO',
        id_usuario: 'usr_forn_01',
        data_criacao_fornecedor_organizacao: '2026-05-26T00:00:00.000Z',
        data_atualizacao_fornecedor_organizacao: '2026-05-26T00:00:00.000Z',
      },
    ])
  })

  it('retorna 403 para usuário que não é FORNECEDOR', async () => {
    const app = express()
    app.use(express.json())
    app.use('/api/v1/prestadores-fornecedor', (req, _res, next) => {
      req.auth = {
        id_usuario: 'usr_padrao',
        id_organizacao: 'org_01',
        tipo_usuario: 'PADRAO',
      } as never
      next()
    }, prestadoresFornecedorRouter)
    app.use((err: unknown, _req: Request, res: Response) => {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: { code: err.code } })
        return
      }
      res.status(500).json({ error: { code: 'INTERNAL_ERROR' } })
    })

    const res = await request(app).get('/api/v1/prestadores-fornecedor/vinculos')
    expect(res.status).toBe(403)
  })
})
