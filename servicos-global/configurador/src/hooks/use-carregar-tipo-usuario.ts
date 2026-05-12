// src/hooks/use-carregar-tipo-usuario.ts
// Carrega o tipo_usuario canonico do banco (via /api/v1/me).
// Fonte de verdade para autorizacao no frontend — nao usa Clerk publicMetadata
// (Mandamento 01: Clerk so autenticacao, autorizacao vem do Prisma).
//
// Cache por id de usuario no nivel de modulo: uma unica chamada por sessao,
// compartilhada entre todos os componentes que usam o hook.

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'

export type TipoUsuario = 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR' | null

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
            const tipoUsuarioBanco = (data?.usuario?.tipo_usuario ?? null) as TipoUsuario
            const flagOrg = Boolean(data?.organizacao?.hospeda_colaboradores_gravity)
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
