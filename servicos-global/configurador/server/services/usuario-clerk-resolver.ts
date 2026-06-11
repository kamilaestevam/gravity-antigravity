// server/services/usuario-clerk-resolver.ts
// Fonte ÚNICA de resolução de usuário a partir do Clerk sub (id_clerk_usuario).
//
// Por que existe (2026-06-11):
//   Usuários convidados ficam com `id_clerk_usuario = 'pending_<inv>'` até o
//   primeiro login religar a linha ao sub real do Clerk (`user_*`). O
//   `requireAuth` (rota /me) já fazia esse self-heal pelo e-mail, mas a rota
//   interna do resolver (`/api/v1/internal/usuarios/:id_clerk_usuario`, usada
//   pelo SDK @gravity/resolver-organizacao em TODO produto) fazia um findUnique
//   seco → 404 "Usuário ou organização não encontrada". Resultado: o /me
//   carregava o shell, mas o Pedido/Processo/Cadastros morriam para 36 de 67
//   usuários em produção. Esta função unifica os dois caminhos: lookup +
//   self-heal num só lugar (Mand. 07 — sincronia; Mand. 08 — sem fallback
//   silencioso, devolve `motivo`).

import { clerkClient } from '../lib/clerk.js'
import { prisma } from '../lib/prisma.js'
import { aposClerkVinculadoPrestadorFornecedor } from './prestador-fornecedor-vinculo-service.js'

/** Linha de usuário resolvida — campos comuns a requireAuth e ao resolver SDK. */
export interface UsuarioClerkResolvido {
  id_usuario: string
  id_organizacao: string
  tipo_usuario: string
  nome_usuario: string | null
  status_usuario: 'ATIVO' | 'INATIVO'
  id_workspace_preferido_usuario: string | null
}

const SELECT_USUARIO = {
  id_usuario: true,
  id_organizacao: true,
  tipo_usuario: true,
  nome_usuario: true,
  status_usuario: true,
  id_workspace_preferido_usuario: true,
} as const

/**
 * Resolve a linha de `usuario` a partir do Clerk sub.
 *
 * 1. Busca direta por `id_clerk_usuario === sub` (caminho rápido, 99% dos hits).
 * 2. Cache miss → self-heal pelo e-mail primário VERIFICADO do Clerk:
 *    - 0 candidatos → não vincula (devolve `motivo`).
 *    - 1 candidato  → vincula direto (atualiza `id_clerk_usuario = sub`).
 *    - >1 candidato → desambigua via invitations ACEITAS no Clerk
 *      (match `pending_<inv.id>`), vincula a mais recente que casar.
 *
 * Mand. 08: nunca mascara — quando não resolve, devolve `{ usuario: null, motivo }`
 * para o caller decidir o tratamento (401 no requireAuth, 404 no resolver SDK).
 */
export async function resolverUsuarioPorClerkSub(
  sub: string,
): Promise<{ usuario: UsuarioClerkResolvido | null; motivo: string | null }> {
  // 1. Caminho rápido — já vinculado.
  const direto = await prisma.usuario.findFirst({
    where: { id_clerk_usuario: sub },
    select: SELECT_USUARIO,
  })
  if (direto) return { usuario: direto, motivo: null }

  // 2. Self-heal pelo e-mail (clerk_user_id ainda `pending_*` ou trocado).
  try {
    const clerkUser = await clerkClient.users.getUser(sub)
    const primaryEmail = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId && e.verification?.status === 'verified',
    )?.emailAddress

    if (!primaryEmail) {
      // eslint-disable-next-line no-console
      console.warn('[usuario-clerk-resolver] EMAIL_FALLBACK_BLOCKED', { sub })
      return { usuario: null, motivo: 'EMAIL_FALLBACK_BLOCKED: e-mail primário não verificado' }
    }

    const candidatos = await prisma.usuario.findMany({
      where: { email_usuario: primaryEmail },
      select: { ...SELECT_USUARIO, id_clerk_usuario: true },
    })

    if (candidatos.length === 1) {
      // Caminho rápido — 99% dos convites.
      const only = candidatos[0]
      await prisma.usuario.update({
        where: { id_usuario: only.id_usuario },
        data: { id_clerk_usuario: sub },
      })
      aposClerkVinculadoPrestadorFornecedor({
        id_usuario: only.id_usuario,
        id_clerk_usuario: sub,
        email_usuario: primaryEmail,
        id_organizacao: only.id_organizacao,
      }).catch(() => { /* best-effort */ })
      return { usuario: stripClerkId(only), motivo: null }
    }

    if (candidatos.length > 1) {
      // Ambiguidade cross-org (mesmo e-mail convidado em múltiplas orgs).
      // eslint-disable-next-line no-console
      console.warn('[usuario-clerk-resolver] EMAIL_FALLBACK_AMBIGUO', { candidatos: candidatos.length })
      try {
        const acceptedList = await clerkClient.invitations.getInvitationList({
          status: 'accepted',
          limit: 100,
        } as Parameters<typeof clerkClient.invitations.getInvitationList>[0])
        const dataArr = Array.isArray(acceptedList)
          ? acceptedList
          : (acceptedList as { data?: unknown[] })?.data ?? []
        const acceptedByEmail = (dataArr as { id: string; emailAddress: string; createdAt: number }[])
          .filter((inv) => inv.emailAddress === primaryEmail)
          .sort((a, b) => b.createdAt - a.createdAt)

        for (const inv of acceptedByEmail) {
          const matched = candidatos.find((c) => c.id_clerk_usuario === `pending_${inv.id}`)
          if (matched) {
            await prisma.usuario.update({
              where: { id_usuario: matched.id_usuario },
              data: { id_clerk_usuario: sub },
            })
            aposClerkVinculadoPrestadorFornecedor({
              id_usuario: matched.id_usuario,
              id_clerk_usuario: sub,
              email_usuario: primaryEmail,
              id_organizacao: matched.id_organizacao,
            }).catch(() => { /* best-effort */ })
            // eslint-disable-next-line no-console
            console.log('[usuario-clerk-resolver] EMAIL_FALLBACK_DESAMBIGUADO_VIA_CLERK', {
              invitation_id: inv.id,
              id_usuario: matched.id_usuario,
              id_organizacao: matched.id_organizacao,
            })
            return { usuario: stripClerkId(matched), motivo: null }
          }
        }
        // eslint-disable-next-line no-console
        console.error('[usuario-clerk-resolver] FALHA_DESAMBIGUAR_VIA_CLERK', {
          candidatos: candidatos.length,
          invitations_aceitas: acceptedByEmail.length,
        })
        return { usuario: null, motivo: 'EMAIL_FALLBACK_AMBIGUO: não desambiguou via invitations' }
      } catch (errClerk) {
        // eslint-disable-next-line no-console
        console.error('[usuario-clerk-resolver] CLERK_INVITATIONS_API_FALHOU', errClerk)
        return { usuario: null, motivo: 'CLERK_INVITATIONS_API_FALHOU' }
      }
    }

    // 0 candidatos pelo e-mail.
    return { usuario: null, motivo: 'NENHUM_USUARIO_PARA_EMAIL' }
  } catch {
    // Falha ao consultar Clerk users.getUser — segue sem o self-heal.
    return { usuario: null, motivo: 'CLERK_GETUSER_FALHOU' }
  }
}

/** Remove `id_clerk_usuario` do shape de candidato antes de devolver. */
function stripClerkId(
  c: UsuarioClerkResolvido & { id_clerk_usuario: string },
): UsuarioClerkResolvido {
  const { id_clerk_usuario: _omit, ...resto } = c
  return resto
}
