// src/hooks/use-permissao.ts
//
// Hook de gating UI para permissões granulares de produto.
//
// Convenção canônica (decisão arquitetural 2026-05-04):
//   <slug_produto>:<secao>:<acao>   ex: 'pedido:dashboard:ver'
//
// Bypass total (Mandamento 04):
//   SUPER_ADMIN, ADMIN, MASTER → permitido sem consultar backend
//   PADRAO/FORNECEDOR → fetch /api/v1/usuarios/:id/permissoes e checa
//
// **Defesa em profundidade**: o backend é a fonte da verdade — esse hook serve
// para UX (esconder botões, desabilitar campos). Toda rota protegida deve usar
// `requirePermissao` server-side independente do que esse hook devolve.
//
// Mandamento 08 — sem fallback silencioso: se a busca falhar, `permitido = false`
// e `erro != null` (mostre algo na UI, nunca finja que tem acesso).

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useLoadSystemRole } from './use-load-system-role'
import { temBypassPermissao } from '../../shared/index.js'

/** Cache por usuário (limpa em logout via invalidatePermissoesCache). */
const permissoesCache = new Map<string, Set<string>>()

export function invalidatePermissoesCache(): void {
  permissoesCache.clear()
}

interface UsePermissaoResult {
  /** true se o usuário tem a permissão; false se ainda buscando ou negado. */
  permitido: boolean
  /** indica se a verificação terminou (bypass: true imediato; granular: após fetch). */
  isReady: boolean
  /** mensagem de erro se a busca falhou — Mandamento 08 (não silenciar). */
  erro: string | null
}

/**
 * Verifica se o usuário logado tem a permissão `<slug>:<secao>:<acao>`.
 * Use em conjunto com o middleware `requirePermissao` no backend (defesa em profundidade).
 */
export function usePermissao(
  slug_produto: string,
  secao: string,
  acao: 'ver' | 'editar',
): UsePermissaoResult {
  const { isLoaded, isSignedIn, getToken, userId } = useAuth()
  const { role, isReady: roleReady } = useLoadSystemRole()

  const [permitido, setPermitido] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const fetchingRef = useRef(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || !roleReady) {
      setIsReady(false)
      return
    }

    // 1. Bypass — Mandamento 04 (mesma fonte do backend via shared/)
    if (temBypassPermissao({ tipo_usuario: role })) {
      setPermitido(true)
      setIsReady(true)
      setErro(null)
      return
    }

    // 2. Granular — busca permissões do usuário (cacheado por sessão)
    const chaveAlvo = `${slug_produto}:${secao}:${acao}`

    if (permissoesCache.has(userId)) {
      const set = permissoesCache.get(userId)!
      setPermitido(set.has(chaveAlvo))
      setIsReady(true)
      setErro(null)
      return
    }

    if (fetchingRef.current) return
    fetchingRef.current = true

    getToken()
      .then(async token => {
        if (!token) {
          setIsReady(true)
          setErro('Sem token de autenticação')
          return
        }
        const resp = await fetch(`/api/v1/usuarios/${userId}/permissoes`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!resp.ok) {
          // Mandamento 08 — registra o erro, não silencia
          const msg = `Falha ao buscar permissões (HTTP ${resp.status})`
          console.warn('[usePermissao]', msg)
          setIsReady(true)
          setErro(msg)
          setPermitido(false)
          return
        }
        const data = await resp.json()
        const lista: string[] = Array.isArray(data?.permissoes)
          ? data.permissoes.map((p: { permissao_usuario: string }) => p.permissao_usuario)
          : []
        const set = new Set(lista)
        permissoesCache.set(userId, set)
        setPermitido(set.has(chaveAlvo))
        setIsReady(true)
        setErro(null)
      })
      .catch(err => {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido'
        console.warn('[usePermissao] erro de rede:', msg)
        setIsReady(true)
        setErro(msg)
        setPermitido(false)
      })
      .finally(() => {
        fetchingRef.current = false
      })
  }, [isLoaded, isSignedIn, userId, roleReady, role, slug_produto, secao, acao])

  return { permitido, isReady, erro }
}
