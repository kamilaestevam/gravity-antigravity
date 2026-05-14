// server/__tests__/organizacao-service-workspaces-acessiveis.test.ts
//
// Testes unitários do método `organizacaoService.workspacesAcessiveis()` —
// SSOT da regra de visibilidade de workspaces consumida por /hub/init e pelo
// endpoint S2S /api/v1/internal/usuarios/.../workspaces-habilitados.
//
// Refactor D11 (2026-05-13).
//
// Cobertura:
//   (i)    MASTER         → todos workspaces ATIVO da org (where simples)
//   (ii)   SUPER_ADMIN    → idem MASTER
//   (iii)  ADMIN          → idem MASTER
//   (iv)   PADRAO         → ATIVO AND UsuarioWorkspace.ativo
//   (v)    FORNECEDOR     → idem PADRAO, mas aceita cross-org via flag
//   (vi)   Usuário inexistente → 404 USUARIO_NAO_ENCONTRADO
//   (vii)  PADRAO cross-org   → 403 ORGANIZACAO_MISMATCH
//   (viii) FORNECEDOR cross-org SEM flag → 403 ORGANIZACAO_MISMATCH
//   (ix)   FORNECEDOR cross-org COM flag → permite (1 workspace habilitado)
//   (x)    Ordenação: data_criacao_workspace desc
//   (xi)   Tipo errado vindo do banco (defesa) — preserva valor
//   (xii)  Retorno enriquecido com _count.vinculos_workspace

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ──────────────────────────────────────────────────────────────────

const findUniqueUsuarioMock = vi.fn()
const findManyWorkspaceMock = vi.fn()

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    usuario: {
      findUnique: (...args: unknown[]) => findUniqueUsuarioMock(...args),
    },
    workspace: {
      findMany: (...args: unknown[]) => findManyWorkspaceMock(...args),
    },
  },
}))

// Logger (organizacao-service.ts faz logger.child())
vi.mock('../lib/logger.js', () => ({
  logger: { child: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }) },
}))

// Outras dependências do organizacao-service.ts que NÃO são usadas neste método
vi.mock('./cadastros-client.js', () => ({
  criarEmpresa: vi.fn(),
  compensarEmpresa: vi.fn(),
}))
vi.mock('../../../servicos-plataforma/historico-global/server/lib/securityAuditLogger.js', () => ({
  securityAudit: vi.fn(),
}))
vi.mock('./sincronizar-acesso-usuario-produtos-service.js', () => ({
  aoHabilitarProdutoNoWorkspace: vi.fn(),
  aoVincularUsuarioAoWorkspace: vi.fn(),
}))

// Import depois dos mocks
const { organizacaoService } = await import('../services/organizacao-service.js')

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── Helpers ────────────────────────────────────────────────────────────────

const WS_BASE = {
  subdominio_workspace: 'sub',
  cnpj_workspace: null as string | null,
  status_workspace: 'ATIVO',
  data_criacao_workspace: new Date('2026-01-01'),
  _count: { memberships: 0 },
}

describe('organizacaoService.workspacesAcessiveis()', () => {

  it('(i) MASTER → todos workspaces ATIVO da org', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-master',
      id_organizacao: 'org-1',
      tipo_usuario: 'MASTER',
    })
    findManyWorkspaceMock.mockResolvedValueOnce([
      { id_workspace: 'ws-1', nome_workspace: 'A', ...WS_BASE },
      { id_workspace: 'ws-2', nome_workspace: 'B', ...WS_BASE },
    ])

    const result = await organizacaoService.workspacesAcessiveis({
      idUsuario: 'u-master',
      idOrganizacaoSolicitada: 'org-1',
    })

    expect(result.tipoUsuario).toBe('MASTER')
    expect(result.workspaces.map((w) => w.id_workspace)).toEqual(['ws-1', 'ws-2'])
    // Confirma where: id_organizacao + status_workspace ATIVO, SEM filtro memberships
    expect(findManyWorkspaceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_organizacao: 'org-1', status_workspace: 'ATIVO' },
      }),
    )
  })

  it('(ii) SUPER_ADMIN → idêntico ao MASTER (where sem memberships)', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-sa',
      id_organizacao: 'org-1',
      tipo_usuario: 'SUPER_ADMIN',
    })
    findManyWorkspaceMock.mockResolvedValueOnce([])

    await organizacaoService.workspacesAcessiveis({
      idUsuario: 'u-sa',
      idOrganizacaoSolicitada: 'org-1',
    })

    expect(findManyWorkspaceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_organizacao: 'org-1', status_workspace: 'ATIVO' },
      }),
    )
  })

  it('(iii) ADMIN → idêntico ao MASTER (where sem memberships)', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-adm',
      id_organizacao: 'org-1',
      tipo_usuario: 'ADMIN',
    })
    findManyWorkspaceMock.mockResolvedValueOnce([])

    await organizacaoService.workspacesAcessiveis({
      idUsuario: 'u-adm',
      idOrganizacaoSolicitada: 'org-1',
    })

    expect(findManyWorkspaceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_organizacao: 'org-1', status_workspace: 'ATIVO' },
      }),
    )
  })

  it('(iv) PADRAO → ATIVO + UsuarioWorkspace.ativo', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-padrao',
      id_organizacao: 'org-1',
      tipo_usuario: 'PADRAO',
    })
    findManyWorkspaceMock.mockResolvedValueOnce([
      { id_workspace: 'ws-1', nome_workspace: 'A', ...WS_BASE },
    ])

    await organizacaoService.workspacesAcessiveis({
      idUsuario: 'u-padrao',
      idOrganizacaoSolicitada: 'org-1',
    })

    expect(findManyWorkspaceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id_organizacao: 'org-1',
          status_workspace: 'ATIVO',
          memberships: {
            some: { id_usuario: 'u-padrao', ativo_usuario_workspace: true },
          },
        },
      }),
    )
  })

  it('(v) FORNECEDOR (org match) → ATIVO + UsuarioWorkspace.ativo (igual PADRAO)', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-forn',
      id_organizacao: 'org-1',
      tipo_usuario: 'FORNECEDOR',
    })
    findManyWorkspaceMock.mockResolvedValueOnce([])

    await organizacaoService.workspacesAcessiveis({
      idUsuario: 'u-forn',
      idOrganizacaoSolicitada: 'org-1',
    })

    expect(findManyWorkspaceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          memberships: { some: { id_usuario: 'u-forn', ativo_usuario_workspace: true } },
        }),
      }),
    )
  })

  it('(vi) usuário inexistente → 404 USUARIO_NAO_ENCONTRADO', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce(null)

    await expect(
      organizacaoService.workspacesAcessiveis({
        idUsuario: 'u-fantasma',
        idOrganizacaoSolicitada: 'org-1',
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'USUARIO_NAO_ENCONTRADO',
    })
    expect(findManyWorkspaceMock).not.toHaveBeenCalled()
  })

  it('(vii) PADRAO cross-org → 403 ORGANIZACAO_MISMATCH', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-padrao-A',
      id_organizacao: 'org-A',
      tipo_usuario: 'PADRAO',
    })

    await expect(
      organizacaoService.workspacesAcessiveis({
        idUsuario: 'u-padrao-A',
        idOrganizacaoSolicitada: 'org-B',
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'ORGANIZACAO_MISMATCH',
    })
    expect(findManyWorkspaceMock).not.toHaveBeenCalled()
  })

  it('(viii) FORNECEDOR cross-org SEM flag → 403 ORGANIZACAO_MISMATCH', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-forn',
      id_organizacao: 'org-fornecedor',
      tipo_usuario: 'FORNECEDOR',
    })

    await expect(
      organizacaoService.workspacesAcessiveis({
        idUsuario: 'u-forn',
        idOrganizacaoSolicitada: 'org-cliente',
        // sem permitirCrossTenantFornecedor → bloqueia
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'ORGANIZACAO_MISMATCH',
    })
  })

  it('(ix) FORNECEDOR cross-org COM flag → permite (query rodou)', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-forn',
      id_organizacao: 'org-fornecedor',
      tipo_usuario: 'FORNECEDOR',
    })
    findManyWorkspaceMock.mockResolvedValueOnce([
      { id_workspace: 'ws-cliente', nome_workspace: 'Cliente', ...WS_BASE },
    ])

    const result = await organizacaoService.workspacesAcessiveis({
      idUsuario: 'u-forn',
      idOrganizacaoSolicitada: 'org-cliente',
      permitirCrossTenantFornecedor: true,
    })

    expect(result.tipoUsuario).toBe('FORNECEDOR')
    expect(result.workspaces).toHaveLength(1)
    // Query foi feita com a org SOLICITADA (não a do usuário)
    expect(findManyWorkspaceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id_organizacao: 'org-cliente' }),
      }),
    )
  })

  it('(x) ordena por data_criacao_workspace desc', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-master',
      id_organizacao: 'org-1',
      tipo_usuario: 'MASTER',
    })
    findManyWorkspaceMock.mockResolvedValueOnce([])

    await organizacaoService.workspacesAcessiveis({
      idUsuario: 'u-master',
      idOrganizacaoSolicitada: 'org-1',
    })

    expect(findManyWorkspaceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { data_criacao_workspace: 'desc' },
      }),
    )
  })

  it('(xi) MASTER NÃO bloqueia cross-org se org bater (defense check, exceto FORNECEDOR via flag)', async () => {
    // Master sempre opera dentro da própria org (não é cross-org legítimo).
    // Se vier idOrganizacaoSolicitada diferente, bloqueia mesmo MASTER.
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-master',
      id_organizacao: 'org-A',
      tipo_usuario: 'MASTER',
    })

    await expect(
      organizacaoService.workspacesAcessiveis({
        idUsuario: 'u-master',
        idOrganizacaoSolicitada: 'org-B',
        permitirCrossTenantFornecedor: true, // flag não ajuda MASTER
      }),
    ).rejects.toMatchObject({ statusCode: 403, code: 'ORGANIZACAO_MISMATCH' })
  })

  it('(xii) retorno enriquecido com quantidade_usuarios_workspace + _count.vinculos_workspace', async () => {
    findUniqueUsuarioMock.mockResolvedValueOnce({
      id_usuario: 'u-master',
      id_organizacao: 'org-1',
      tipo_usuario: 'MASTER',
    })
    findManyWorkspaceMock.mockResolvedValueOnce([
      {
        id_workspace: 'ws-1',
        nome_workspace: 'A',
        subdominio_workspace: 'a',
        cnpj_workspace: null,
        status_workspace: 'ATIVO',
        data_criacao_workspace: new Date('2026-01-01'),
        _count: { memberships: 7 },
      },
    ])

    const result = await organizacaoService.workspacesAcessiveis({
      idUsuario: 'u-master',
      idOrganizacaoSolicitada: 'org-1',
    })

    expect(result.workspaces[0]).toMatchObject({
      id_workspace: 'ws-1',
      nome_workspace: 'A',
      quantidade_usuarios_workspace: 7,
      _count: { vinculos_workspace: 7 },
    })
  })
})
