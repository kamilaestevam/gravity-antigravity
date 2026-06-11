// @vitest-environment node
// TST-UNI-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000085 — resolverUsuarioPorClerkSub (self-heal compartilhado)
// Cobre UNI-01..08 da Matriz DEFINITIVA usuário × organização.
// Valida: lookup direto, self-heal por e-mail (1 candidato), desambiguação via invitations
//         (>1 candidato), e os motivos de falha (Mand. 08 — sem fallback silencioso).
//
// Por que existe: a Fase 2 (commit 1b8b1749a) extraiu o self-heal do requireAuth para este
// service, usado também pela rota interna /usuarios/:id_clerk_usuario. 36/67 usuários em prod
// estavam com id_clerk_usuario='pending_*' e davam 404 no Pedido. Estes testes blindam a cura.

import { vi, describe, it, expect, beforeEach } from 'vitest'

const {
  mockUsuarioFindFirst,
  mockUsuarioFindMany,
  mockUsuarioUpdate,
  mockGetUser,
  mockGetInvitationList,
  mockAposClerkVinculado,
} = vi.hoisted(() => ({
  mockUsuarioFindFirst:   vi.fn(),
  mockUsuarioFindMany:    vi.fn(),
  mockUsuarioUpdate:      vi.fn(),
  mockGetUser:            vi.fn(),
  mockGetInvitationList:  vi.fn(),
  mockAposClerkVinculado: vi.fn(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario: {
      findFirst: mockUsuarioFindFirst,
      findMany:  mockUsuarioFindMany,
      update:    mockUsuarioUpdate,
    },
  },
}))

vi.mock('../../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: {
    users:       { getUser: mockGetUser },
    invitations: { getInvitationList: mockGetInvitationList },
  },
}))

vi.mock('../../../../servicos-global/configurador/server/services/prestador-fornecedor-vinculo-service.js', () => ({
  aposClerkVinculadoPrestadorFornecedor: mockAposClerkVinculado,
}))

import { resolverUsuarioPorClerkSub } from '../../../../servicos-global/configurador/server/services/usuario-clerk-resolver.js'

// ── Fixtures ────────────────────────────────────────────────────────────────
const SUB = 'user_real_abc'

function linhaUsuario(over: Partial<Record<string, unknown>> = {}) {
  return {
    id_usuario:                     'usr_1',
    id_organizacao:                 'org_1',
    tipo_usuario:                   'STANDARD',
    nome_usuario:                   'Fulano',
    status_usuario:                 'ATIVO',
    id_workspace_preferido_usuario: 'ws_1',
    ...over,
  }
}

function clerkUserComEmail(email: string, verified = true) {
  return {
    primaryEmailAddressId: 'eml_1',
    emailAddresses: [
      { id: 'eml_1', emailAddress: email, verification: { status: verified ? 'verified' : 'unverified' } },
    ],
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAposClerkVinculado.mockResolvedValue(undefined)
})

describe('resolverUsuarioPorClerkSub', () => {
  // UNI-01
  it('acha por id_clerk_usuario direto e NÃO chama o Clerk', async () => {
    mockUsuarioFindFirst.mockResolvedValue(linhaUsuario())
    const { usuario, motivo } = await resolverUsuarioPorClerkSub(SUB)
    expect(usuario?.id_usuario).toBe('usr_1')
    expect(motivo).toBeNull()
    expect(mockGetUser).not.toHaveBeenCalled()
  })

  // UNI-02 + UNI-08 (stripClerkId)
  it('self-heal: 1 candidato pelo e-mail → vincula, chama prestador, retorna sem id_clerk_usuario', async () => {
    mockUsuarioFindFirst.mockResolvedValue(null)
    mockGetUser.mockResolvedValue(clerkUserComEmail('a@b.com'))
    mockUsuarioFindMany.mockResolvedValue([linhaUsuario({ id_clerk_usuario: 'pending_x' })])
    mockUsuarioUpdate.mockResolvedValue({})

    const { usuario, motivo } = await resolverUsuarioPorClerkSub(SUB)

    expect(motivo).toBeNull()
    expect(usuario?.id_usuario).toBe('usr_1')
    expect(usuario).not.toHaveProperty('id_clerk_usuario') // UNI-08
    expect(mockUsuarioUpdate).toHaveBeenCalledWith({
      where: { id_usuario: 'usr_1' },
      data: { id_clerk_usuario: SUB },
    })
    expect(mockAposClerkVinculado).toHaveBeenCalledOnce()
  })

  // UNI-03 — desambiguação via invitations
  it('self-heal: >1 candidato → desambigua pelo pending_<inv.id> da invitation aceita', async () => {
    mockUsuarioFindFirst.mockResolvedValue(null)
    mockGetUser.mockResolvedValue(clerkUserComEmail('a@b.com'))
    mockUsuarioFindMany.mockResolvedValue([
      linhaUsuario({ id_usuario: 'usr_A', id_organizacao: 'org_A', id_clerk_usuario: 'pending_INV1' }),
      linhaUsuario({ id_usuario: 'usr_B', id_organizacao: 'org_B', id_clerk_usuario: 'pending_INV2' }),
    ])
    mockGetInvitationList.mockResolvedValue({
      data: [{ id: 'INV2', emailAddress: 'a@b.com', createdAt: 200 }],
    })
    mockUsuarioUpdate.mockResolvedValue({})

    const { usuario, motivo } = await resolverUsuarioPorClerkSub(SUB)

    expect(motivo).toBeNull()
    expect(usuario?.id_usuario).toBe('usr_B') // casou pending_INV2
    expect(mockUsuarioUpdate).toHaveBeenCalledWith({
      where: { id_usuario: 'usr_B' },
      data: { id_clerk_usuario: SUB },
    })
  })

  // UNI-04
  it('e-mail primário não verificado → null + EMAIL_FALLBACK_BLOCKED', async () => {
    mockUsuarioFindFirst.mockResolvedValue(null)
    mockGetUser.mockResolvedValue(clerkUserComEmail('a@b.com', /* verified */ false))
    const { usuario, motivo } = await resolverUsuarioPorClerkSub(SUB)
    expect(usuario).toBeNull()
    expect(motivo).toContain('EMAIL_FALLBACK_BLOCKED')
    expect(mockUsuarioFindMany).not.toHaveBeenCalled()
  })

  // UNI-05
  it('0 candidatos pelo e-mail → null + NENHUM_USUARIO_PARA_EMAIL', async () => {
    mockUsuarioFindFirst.mockResolvedValue(null)
    mockGetUser.mockResolvedValue(clerkUserComEmail('a@b.com'))
    mockUsuarioFindMany.mockResolvedValue([])
    const { usuario, motivo } = await resolverUsuarioPorClerkSub(SUB)
    expect(usuario).toBeNull()
    expect(motivo).toContain('NENHUM_USUARIO_PARA_EMAIL')
  })

  // UNI-06
  it('getUser lança → null + CLERK_GETUSER_FALHOU', async () => {
    mockUsuarioFindFirst.mockResolvedValue(null)
    mockGetUser.mockRejectedValue(new Error('clerk down'))
    const { usuario, motivo } = await resolverUsuarioPorClerkSub(SUB)
    expect(usuario).toBeNull()
    expect(motivo).toContain('CLERK_GETUSER_FALHOU')
  })

  // UNI-07
  it('>1 candidato + invitations API falha → null + CLERK_INVITATIONS_API_FALHOU', async () => {
    mockUsuarioFindFirst.mockResolvedValue(null)
    mockGetUser.mockResolvedValue(clerkUserComEmail('a@b.com'))
    mockUsuarioFindMany.mockResolvedValue([
      linhaUsuario({ id_usuario: 'usr_A', id_clerk_usuario: 'pending_INV1' }),
      linhaUsuario({ id_usuario: 'usr_B', id_clerk_usuario: 'pending_INV2' }),
    ])
    mockGetInvitationList.mockRejectedValue(new Error('invitations down'))
    const { usuario, motivo } = await resolverUsuarioPorClerkSub(SUB)
    expect(usuario).toBeNull()
    expect(motivo).toContain('CLERK_INVITATIONS_API_FALHOU')
    expect(mockUsuarioUpdate).not.toHaveBeenCalled()
  })

  // UNI-07b — >1 candidato, nenhum pending casa → EMAIL_FALLBACK_AMBIGUO
  it('>1 candidato, invitation não casa nenhum pending → null + EMAIL_FALLBACK_AMBIGUO', async () => {
    mockUsuarioFindFirst.mockResolvedValue(null)
    mockGetUser.mockResolvedValue(clerkUserComEmail('a@b.com'))
    mockUsuarioFindMany.mockResolvedValue([
      linhaUsuario({ id_usuario: 'usr_A', id_clerk_usuario: 'pending_INV1' }),
      linhaUsuario({ id_usuario: 'usr_B', id_clerk_usuario: 'pending_INV2' }),
    ])
    mockGetInvitationList.mockResolvedValue({ data: [{ id: 'INV_OUTRO', emailAddress: 'a@b.com', createdAt: 1 }] })
    const { usuario, motivo } = await resolverUsuarioPorClerkSub(SUB)
    expect(usuario).toBeNull()
    expect(motivo).toContain('EMAIL_FALLBACK_AMBIGUO')
  })
})
