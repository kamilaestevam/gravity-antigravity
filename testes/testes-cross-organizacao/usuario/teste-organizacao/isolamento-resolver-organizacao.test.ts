// @vitest-environment node
// TST-CRO-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000090
// Isolamento cross-organização na resolução de usuário por Clerk sub.
// Valida que o self-heal (Fase 2) NUNCA cruza organizações: mesmo e-mail convidado em
// 2 orgs → resolve para a org CORRETA (via invitation) e jamais devolve a org alheia.
// Cobre CRO-01..03 da Matriz usuário × organização.

import { vi, describe, it, expect, beforeEach } from 'vitest'

const { mockFindFirst, mockFindMany, mockUpdate, mockGetUser, mockGetInvitationList, mockAposClerk } = vi.hoisted(() => ({
  mockFindFirst: vi.fn(), mockFindMany: vi.fn(), mockUpdate: vi.fn(),
  mockGetUser: vi.fn(), mockGetInvitationList: vi.fn(), mockAposClerk: vi.fn(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: { usuario: { findFirst: mockFindFirst, findMany: mockFindMany, update: mockUpdate } },
}))
vi.mock('../../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: { users: { getUser: mockGetUser }, invitations: { getInvitationList: mockGetInvitationList } },
}))
vi.mock('../../../../servicos-global/configurador/server/services/prestador-fornecedor-vinculo-service.js', () => ({
  aposClerkVinculadoPrestadorFornecedor: mockAposClerk,
}))

import { resolverUsuarioPorClerkSub } from '../../../../servicos-global/configurador/server/services/usuario-clerk-resolver.js'

const EMAIL = 'multi@org.com'
const SUB = 'user_real'

// Mesmo e-mail, DUAS organizações (cross-org).
function candidatoOrgA() { return { id_usuario: 'usr_A', id_organizacao: 'org_A', tipo_usuario: 'STANDARD', nome_usuario: 'A', status_usuario: 'ATIVO', id_workspace_preferido_usuario: 'ws_A', id_clerk_usuario: 'pending_INV_A' } }
function candidatoOrgB() { return { id_usuario: 'usr_B', id_organizacao: 'org_B', tipo_usuario: 'STANDARD', nome_usuario: 'B', status_usuario: 'ATIVO', id_workspace_preferido_usuario: 'ws_B', id_clerk_usuario: 'pending_INV_B' } }
function clerkUser() { return { primaryEmailAddressId: 'e1', emailAddresses: [{ id: 'e1', emailAddress: EMAIL, verification: { status: 'verified' } }] } }

beforeEach(() => { vi.clearAllMocks(); mockAposClerk.mockResolvedValue(undefined) })

describe('isolamento cross-organização — resolverUsuarioPorClerkSub', () => {
  // CRO-01 — desambiguação leva à org B (invitation de B), NUNCA à org A
  it('CRO-01 e-mail em 2 orgs → invitation de B resolve org_B e nunca vaza org_A', async () => {
    mockFindFirst.mockResolvedValue(null)
    mockGetUser.mockResolvedValue(clerkUser())
    mockFindMany.mockResolvedValue([candidatoOrgA(), candidatoOrgB()])
    mockGetInvitationList.mockResolvedValue({ data: [{ id: 'INV_B', emailAddress: EMAIL, createdAt: 200 }] })
    mockUpdate.mockResolvedValue({})

    const { usuario, motivo } = await resolverUsuarioPorClerkSub(SUB)

    expect(motivo).toBeNull()
    expect(usuario?.id_organizacao).toBe('org_B')   // org correta
    expect(usuario?.id_organizacao).not.toBe('org_A') // jamais a alheia
    // o vínculo (update) foi feito SOMENTE no usuário da org B
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id_usuario: 'usr_B' }, data: { id_clerk_usuario: SUB } })
    expect(mockUpdate).not.toHaveBeenCalledWith(expect.objectContaining({ where: { id_usuario: 'usr_A' } }))
  })

  // CRO-02 — sem invitation que case → NÃO escolhe nenhuma (não chuta org)
  it('CRO-02 nenhuma invitation casa → não vincula a nenhuma org (sem palpite cross-org)', async () => {
    mockFindFirst.mockResolvedValue(null)
    mockGetUser.mockResolvedValue(clerkUser())
    mockFindMany.mockResolvedValue([candidatoOrgA(), candidatoOrgB()])
    mockGetInvitationList.mockResolvedValue({ data: [{ id: 'INV_OUTRO', emailAddress: EMAIL, createdAt: 1 }] })

    const { usuario, motivo } = await resolverUsuarioPorClerkSub(SUB)

    expect(usuario).toBeNull()
    expect(motivo).toContain('EMAIL_FALLBACK_AMBIGUO')
    expect(mockUpdate).not.toHaveBeenCalled() // nenhuma org tocada
  })

  // CRO-03 — match direto por sub não envolve o caminho de e-mail (sem varrer outras orgs)
  it('CRO-03 usuário já vinculado (sub direto) → resolve sua org sem consultar e-mail/outras orgs', async () => {
    mockFindFirst.mockResolvedValue({ ...candidatoOrgA(), id_clerk_usuario: SUB })
    const { usuario } = await resolverUsuarioPorClerkSub(SUB)
    expect(usuario?.id_organizacao).toBe('org_A')
    expect(mockGetUser).not.toHaveBeenCalled()   // não foi pro fallback
    expect(mockFindMany).not.toHaveBeenCalled()  // não varreu candidatos cross-org
  })
})
