// src/hooks/use-carregar-tipo-usuario.ts
// Carrega o tipo_usuario canonico do banco (via /api/v1/me).
// Fonte de verdade para autorizacao no frontend — nao usa Clerk publicMetadata
// (Mandamento 01: Clerk so autenticacao, autorizacao vem do Prisma).
//
// Cache por id de usuario no nivel de modulo: uma unica chamada por sessao,
// compartilhada entre todos os componentes que usam o hook.

import { useState, useEffect, useRef } from 'react'
import { useAuth, useClerk } from '@clerk/clerk-react'
import { z } from 'zod'
import { limparCacheDestinoPosAutenticacao } from '../routing/destino-pos-autenticacao.js'

/** Chave no sessionStorage usada pra carregar mensagem de erro na tela de
 *  login. Lida pelo LoginGlobal no mount e limpa após exibir. */
export const STORAGE_KEY_ERRO_LOGIN = 'gravity_login_error'

export type TipoUsuario = 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR' | null

// Mand. 09 — Zod bilateral: schema mínimo dos campos que este hook lê de
// /api/v1/me. Espelha exatamente o que o backend `me.ts` emite. Outros campos
// (workspaces, dados cadastrais, etc.) podem existir e são ignorados sem erro
// (comportamento default do z.object — não usa .passthrough() para evitar
// falsa permissividade condenada pelo Mandamento 09).
const tipoUsuarioEnum = z.enum(['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR'])

const meContextoMinimoSchema = z.object({
  usuario: z.object({
    id_usuario: z.string(),
    id_organizacao: z.string(),
    tipo_usuario: tipoUsuarioEnum,
  }),
  organizacao: z.object({
    hospeda_colaboradores_gravity: z.boolean(),
  }).nullable(),
})

const cacheTipoUsuario = new Map<string, TipoUsuario>()
// Cache da flag `hospeda_colaboradores_gravity` da organização do usuário.
// Mesma chave (userId Clerk) do cache de tipo_usuario — consistência.
// Usada pelo hook usePodeEditarUsuario para decidir whitelist de tipos
// atribuíveis (regra condicional 2026-05-11).
const cacheHospedaColaboradoresGravity = new Map<string, boolean>()
/**
 * Cache do id_usuario (CUID Prisma) — chave Clerk userId, valor CUID.
 * Necessário para chamadas que precisam do id_usuario Prisma (ex: hook
 * usePermissao -> GET /usuarios/:id_usuario/permissoes). Antes o usePermissao
 * usava `userId` (Clerk) na URL, causando 404 silencioso. Fix 2026-05-13.
 */
const cacheIdUsuarioPrisma = new Map<string, string>()
/**
 * Cache do id_organizacao (CUID Prisma) — chave Clerk userId, valor CUID.
 * Necessário para o widget GABI enviar x-id-organizacao no header S2S.
 */
const cacheIdOrganizacao = new Map<string, string>()

/** Limpa o cache de tipo_usuario — deve ser chamado no logout para evitar vazamento entre sessoes */
export function limparCacheTipoUsuario(): void {
  cacheTipoUsuario.clear()
  cacheHospedaColaboradoresGravity.clear()
  cacheIdOrganizacao.clear()
  cacheIdUsuarioPrisma.clear()
  limparCacheDestinoPosAutenticacao()
}

export function useCarregarTipoUsuario() {
  const { isLoaded, isSignedIn, getToken, userId } = useAuth()
  const { signOut } = useClerk()

  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(() =>
    userId ? (cacheTipoUsuario.get(userId) ?? null) : null
  )
  const [hospedaColaboradoresGravity, setHospedaColaboradoresGravity] = useState<boolean>(() =>
    userId ? (cacheHospedaColaboradoresGravity.get(userId) ?? false) : false
  )
  const [idUsuarioPrisma, setIdUsuarioPrisma] = useState<string | null>(() =>
    userId ? (cacheIdUsuarioPrisma.get(userId) ?? null) : null
  )
  const [idOrganizacao, setIdOrganizacao] = useState<string | null>(() =>
    userId ? (cacheIdOrganizacao.get(userId) ?? null) : null
  )
  const [pronto, setPronto] = useState(() =>
    !!(userId && cacheTipoUsuario.has(userId))
  )
  const buscandoRef = useRef(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return

    // Cache hit — ja buscamos para este usuario
    if (cacheTipoUsuario.has(userId)) {
      const armazenado = cacheTipoUsuario.get(userId)!
      setTipoUsuario(armazenado)
      setHospedaColaboradoresGravity(cacheHospedaColaboradoresGravity.get(userId) ?? false)
      setIdUsuarioPrisma(cacheIdUsuarioPrisma.get(userId) ?? null)
      setIdOrganizacao(cacheIdOrganizacao.get(userId) ?? null)
      setPronto(true)
      return
    }

    // Evita disparo duplo dentro do mesmo render
    if (buscandoRef.current) return
    buscandoRef.current = true

    getToken()
      .then(token => {
        if (!token) {
          setPronto(true)
          return
        }
        return fetch('/api/v1/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(async (r) => {
            // Intercepta 401 USUARIO_INATIVO (Mand. 08 — fail loud).
            // Não é "falha silenciosa" — usuário foi desativado pelo admin
            // e precisa ver mensagem clara na tela de login.
            if (r.status === 401) {
              try {
                const body = await r.clone().json()
                if (body?.error?.code === 'USUARIO_INATIVO') {
                  sessionStorage.setItem(
                    STORAGE_KEY_ERRO_LOGIN,
                    body?.error?.message ?? 'Seu acesso foi desativado. Contate um administrador.',
                  )
                  limparCacheTipoUsuario()
                  // signOut limpa session Clerk + redireciona pra /login
                  await signOut({ redirectUrl: '/login' })
                  return null
                }
              } catch { /* corpo não-JSON, segue fluxo padrão */ }
            }
            return r.ok ? r.json() : null
          })
          .then(data => {
            if (!data) {
              setPronto(true)
              return
            }
            // Mand. 09 — parse Zod bilateral. safeParse usa: se contrato
            // quebrar (campo ausente/tipo errado), loga warn (Mand. 08 — sem
            // fallback silencioso) e mantém tipo nulo. Isso impede que o front
            // funcione com permissões erradas por causa de payload divergente.
            const parsed = meContextoMinimoSchema.safeParse(data)
            if (!parsed.success) {
              console.warn(
                '[useCarregarTipoUsuario] payload /me não bate com contrato Zod — autorização indefinida',
                parsed.error.issues,
              )
              setPronto(true)
              return
            }
            const tipoUsuarioBanco: TipoUsuario = parsed.data.usuario.tipo_usuario
            const flagOrg = parsed.data.organizacao?.hospeda_colaboradores_gravity ?? false
            const idUserPrisma = parsed.data.usuario.id_usuario
            const idOrgPrisma = parsed.data.usuario.id_organizacao
            cacheTipoUsuario.set(userId, tipoUsuarioBanco)
            cacheHospedaColaboradoresGravity.set(userId, flagOrg)
            cacheIdUsuarioPrisma.set(userId, idUserPrisma)
            cacheIdOrganizacao.set(userId, idOrgPrisma)
            setTipoUsuario(tipoUsuarioBanco)
            setHospedaColaboradoresGravity(flagOrg)
            setIdUsuarioPrisma(idUserPrisma)
            setIdOrganizacao(idOrgPrisma)
            setPronto(true)
          })
      })
      .catch(() => {
        // Falha silenciosa — `pronto` sinaliza que a verificacao terminou
        setPronto(true)
      })
  }, [isLoaded, isSignedIn, userId, getToken])

  const gravityAdmin = tipoUsuario === 'SUPER_ADMIN' || tipoUsuario === 'ADMIN'

  return {
    pronto,
    gravityAdmin,
    tipoUsuario,
    /** Flag da organização do usuário (regra condicional 2026-05-11) — true se
     *  hospeda colaboradores Gravity. Usado para decidir whitelist de tipos
     *  no usePodeEditarUsuario. */
    hospedaColaboradoresGravity,
    /**
     * id_usuario (CUID Prisma) do usuário logado. Diferente do `userId` do
     * `useAuth` do Clerk (que é o clerk_user_id). Necessário para chamadas
     * GET /api/v1/usuarios/:id_usuario/permissoes (self-read). Fix 2026-05-13.
     */
    idUsuarioPrisma,
    /**
     * id_organizacao (CUID Prisma) da organização do usuário logado.
     * Necessário para o widget GABI enviar x-id-organizacao no header S2S.
     */
    idOrganizacao,
  }
}
