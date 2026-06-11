// @vitest-environment node
// TST-FUN-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000088
// GET /api/v1/internal/usuarios/:id_clerk_usuario — rota interna do resolver SDK
// Valida (Fase 2, commit 1b8b1749a): a rota usa resolverUsuarioPorClerkSub (self-heal),
// devolve o MESMO JSON de antes, e 404 quando usuário OU organização não resolvem.
// Cobre FUN-01..03 da Matriz usuário × organização.
/// <reference types="vitest/globals" />

import { vi, describe, it, expect, beforeEach } from 'vitest'

const { mockResolver, mockOrgFindUnique } = vi.hoisted(() => ({
  mockResolver:      vi.fn(),
  mockOrgFindUnique: vi.fn(),
}))

vi.mock('../../../../servicos-global/configurador/server/services/usuario-clerk-resolver.js', () => ({
  resolverUsuarioPorClerkSub: mockResolver,
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: { organizacao: { findUnique: mockOrgFindUnique } },
}))

// requireInternalKey é aplicado por accessRouter.use(...) — pass-through no teste.
vi.mock('../../../../servicos-global/configurador/server/middleware/requireInternalKey.js', () => ({
  requireInternalKey: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

// Imports pesados da acesso.ts que não interessam a esta rota — stub para o import não quebrar.
vi.mock('../../../../servicos-global/configurador/server/services/produto-gravity-configuracao-service.js', () => ({
  productConfigService: { getConfig: vi.fn() },
}))
vi.mock('../../../../servicos-global/configurador/server/services/permissao-usuario-servico.js', () => ({
  servicoPermissaoUsuario: { verificarPermissao: vi.fn(), verificarAcessoUsuarioProdutoGravity: vi.fn() },
  SECOES_PRODUTO: [], ACOES_PRODUTO: [],
}))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { accessRouter } from '../../../../servicos-global/configurador/server/routes/acesso.js'
import { AppError } from '../../../../servicos-global/configurador/server/lib/appError.js'

const app = express()
app.use(express.json())
app.use('/api/v1/internal', accessRouter)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) { res.status(err.statusCode).json({ error: { code: err.code, message: err.message } }); return }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(err) } })
})

function usuarioResolvido(over: Partial<Record<string, unknown>> = {}) {
  return {
    id_usuario: 'usr_1', id_organizacao: 'org_1', tipo_usuario: 'STANDARD',
    nome_usuario: 'Fulano', status_usuario: 'ATIVO', id_workspace_preferido_usuario: 'ws_1', ...over,
  }
}

beforeEach(() => { vi.clearAllMocks() })

describe('GET /api/v1/internal/usuarios/:id_clerk_usuario', () => {
  // FUN-01 — usuário pending_ curado pelo resolver → 200 com JSON do SDK
  it('FUN-01 usuário pending_ resolvido (self-heal) + org ATIVO → 200 com contrato do SDK', async () => {
    mockResolver.mockResolvedValue({ usuario: usuarioResolvido(), motivo: null })
    mockOrgFindUnique.mockResolvedValue({ status_organizacao: 'ATIVO' })

    const res = await request(app).get('/api/v1/internal/usuarios/pending_INV1')

    expect(mockResolver).toHaveBeenCalledWith('pending_INV1')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      idOrganizacao: 'org_1',
      status: 'active',
      idUsuario: 'usr_1',
      tiposUsuario: ['STANDARD'],
      idWorkspace: 'ws_1',
    })
  })

  // FUN-02 — usuário já vinculado (regressão)
  it('FUN-02 usuário user_* já vinculado + org ATIVO → 200 (regressão)', async () => {
    mockResolver.mockResolvedValue({ usuario: usuarioResolvido({ tipo_usuario: 'MASTER' }), motivo: null })
    mockOrgFindUnique.mockResolvedValue({ status_organizacao: 'ATIVO' })

    const res = await request(app).get('/api/v1/internal/usuarios/user_abc')
    expect(res.status).toBe(200)
    expect(res.body.tiposUsuario).toEqual(['MASTER'])
    expect(res.body.status).toBe('active')
  })

  // FUN-03a — resolver não resolve usuário → 404
  it('FUN-03a resolver devolve null → 404 NOT_FOUND', async () => {
    mockResolver.mockResolvedValue({ usuario: null, motivo: 'NENHUM_USUARIO_PARA_EMAIL' })
    const res = await request(app).get('/api/v1/internal/usuarios/pending_zzz')
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(mockOrgFindUnique).not.toHaveBeenCalled()
  })

  // FUN-03b — usuário resolve mas organização sumiu (FK órfã) → 404
  it('FUN-03b usuário ok mas organização inexistente → 404 NOT_FOUND', async () => {
    mockResolver.mockResolvedValue({ usuario: usuarioResolvido(), motivo: null })
    mockOrgFindUnique.mockResolvedValue(null)
    const res = await request(app).get('/api/v1/internal/usuarios/user_sem_org')
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  // FUN-03c — org suspensa → status mapeado para 'suspended'
  it('FUN-03c org SUSPENSO → 200 com status "suspended" (StatusSdkMap)', async () => {
    mockResolver.mockResolvedValue({ usuario: usuarioResolvido(), motivo: null })
    mockOrgFindUnique.mockResolvedValue({ status_organizacao: 'SUSPENSO' })
    const res = await request(app).get('/api/v1/internal/usuarios/user_susp')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('suspended')
  })
})
