// src/hooks/use-carregar-tipo-usuario.ts
// Carrega o tipo_usuario canonico do banco (via /api/v1/me).
// Fonte de verdade para autorizacao no frontend — nao usa Clerk publicMetadata
// (Mandamento 01: Clerk so autenticacao, autorizacao vem do Prisma).
//
// Cache por id de usuario no nivel de modulo: uma unica chamada por sessao,
// compartilhada entre todos os componentes que usam o hook.

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { z } from 'zod'

export type TipoUsuario = 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR' | null

// Mand. 09 — Zod bilateral: schema mínimo dos campos que este hook lê de
// /api/v1/me. Espelha exatamente o que o backend `me.ts` emite. Outros campos
// (workspaces, dados cadastrais, etc.) podem existir e são ignorados sem erro
// (comportamento default do z.object — não usa .passthrough() para evitar
// falsa permissividade condenada pelo Mandamento 09).
const tipoUsuarioEnum = z.enum(['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR'])

const meContextoMinimoSchema = z.object({
  usuario: z.object({
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

/** Limpa o cache de tipo_usuario — deve ser chamado no logout para evitar vazamento entre sessoes */
export function limparCacheTipoUsuario(): void {
  cacheTipoUsuario.clear()
  cacheHospedaColaboradoresGravity.clear()
}

export function useCarregarTipoUsuario() {
  const { isLoaded, isSignedIn, getToken, userId } = useAuth()

  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(() =>
    userId ? (cacheTipoUsuario.get(userId) ?? null) : null
  )
  const [hospedaColaboradoresGravity, setHospedaColaboradoresGravity] = useState<boolean>(() =>
    userId ? (cacheHospedaColaboradoresGravity.get(userId) ?? false) : false
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
          .then(r => (r.ok ? r.json() : null))
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
            cacheTipoUsuario.set(userId, tipoUsuarioBanco)
            cacheHospedaColaboradoresGravity.set(userId, flagOrg)
            setTipoUsuario(tipoUsuarioBanco)
            setHospedaColaboradoresGravity(flagOrg)
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
  }
}
