// servicos-global/shell/hooks/useUserPreferences.ts
//
// Hook responsável por sincronizar as preferências de UI do usuário
// com o backend (serviço preferencias-usuario) para persistência cross-device.
//
// ── Fluxo ────────────────────────────────────────────────────────────────────
// 1. Ao montar (userId disponível): GET /api/tenant/preferencias
//    → Aplica as preferências do servidor no store (sobrescreve o localStorage)
// 2. Quando o usuário altera uma preferência (tooltipsDisabled, etc.):
//    → Store é atualizado imediatamente (ótimista)
//    → PUT /api/tenant/preferencias é chamado com debounce de 500ms
//
// ── Autenticação ─────────────────────────────────────────────────────────────
// Usa Bearer JWT do Clerk (via getToken). O backend lê id_usuario e id_organizacao
// a partir de req.auth populado pelo requireAuth — nunca de headers forjáveis.
// Os parâmetros id_usuario e id_organizacao servem apenas como guards de montagem.
//
// ── Como usar ────────────────────────────────────────────────────────────────
// Adicione useUserPreferences({ id_usuario, id_organizacao }) no WorkspaceLayout
// e AdminLayout, logo após o store ser acessado.

import { useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useShellStore } from '../store'
import type { Theme } from '../store/types'

interface UseUserPreferencesOptions {
  /** ID do usuário autenticado (Clerk user.id) */
  id_usuario: string | undefined
  /** ID da organização ativa */
  id_organizacao: string | undefined
}

interface PreferenciasPayload {
  tooltips_disabled?: boolean
  theme?: 'dark' | 'light'
  sidebar_open?: boolean
}

/** URL base do serviço de preferências (proxied pelo Vite ou nginx) */
const BASE_URL = '/api/tenant/preferencias'

/**
 * Faz GET nas preferências do usuário e aplica no store.
 * Autenticação via Bearer JWT — id_usuario/id_organizacao lidos do req.auth no backend.
 * Retorna as preferências remotas ou null em caso de falha.
 */
async function fetchPreferencias(
  getToken: () => Promise<string | null>,
): Promise<PreferenciasPayload | null> {
  try {
    const token = await getToken()
    if (!token) return null
    const res = await fetch(BASE_URL, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!res.ok) return null
    const json = await res.json()
    if (json.status === 'success') return json.data as PreferenciasPayload
    return null
  } catch {
    return null
  }
}

/**
 * Persiste preferências no servidor.
 * Autenticação via Bearer JWT — id_usuario/id_organizacao lidos do req.auth no backend.
 * Falha silenciosa — o estado local (localStorage) já foi atualizado.
 */
async function savePreferencias(
  payload: PreferenciasPayload,
  getToken: () => Promise<string | null>,
): Promise<void> {
  try {
    const token = await getToken()
    if (!token) return
    await fetch(BASE_URL, {
      method:  'PUT',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  } catch {
    // Falha silenciosa — usuário já tem a preferência salva localmente
  }
}

/**
 * Hook que sincroniza preferências de UI do usuário com o backend.
 * Autenticação via Bearer JWT do Clerk — identity vem do req.auth no backend (REGRA 01).
 * Os parâmetros id_usuario e id_organizacao servem apenas como guards de montagem.
 *
 * @example
 * // Em WorkspaceLayout ou AdminLayout
 * useUserPreferences({ id_usuario: currentUser.id, id_organizacao: currentUser.tenantId })
 */
export function useUserPreferences({ id_usuario, id_organizacao }: UseUserPreferencesOptions) {
  const { getToken } = useAuth()
  const store = useShellStore()
  const isInitializedRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── 1. Carrega preferências do backend na montagem ────────────────────────
  useEffect(() => {
    if (!id_usuario || !id_organizacao) return
    if (isInitializedRef.current) return

    isInitializedRef.current = true

    fetchPreferencias(getToken).then((prefs) => {
      if (!prefs) return // Falhou — mantém estado do localStorage

      // Aplica tema se diferente
      const remoteTheme = prefs.theme as Theme | undefined
      if (remoteTheme && remoteTheme !== store.currentTheme) {
        store.setTheme(remoteTheme)
      }

      // Aplica tooltipsDisabled se diferente
      if (
        prefs.tooltips_disabled !== undefined &&
        prefs.tooltips_disabled !== store.tooltipsDisabled
      ) {
        // toggleTooltips alterna — precisamos checar diferença antes de chamar
        store.toggleTooltips()
      }

      // Aplica sidebar se diferente
      if (
        prefs.sidebar_open !== undefined &&
        prefs.sidebar_open !== store.sidebarOpen
      ) {
        store.setSidebarOpen(prefs.sidebar_open)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_usuario, id_organizacao])

  // ── 2. Persiste no servidor quando o estado muda ──────────────────────────
  // Após inicialização, monitora mudanças no store e salva no backend com debounce.
  useEffect(() => {
    if (!id_usuario || !id_organizacao) return
    if (!isInitializedRef.current) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      savePreferencias(
        {
          tooltips_disabled: store.tooltipsDisabled,
          theme:             store.currentTheme,
          sidebar_open:      store.sidebarOpen,
        },
        getToken,
      )
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [id_usuario, id_organizacao, store.tooltipsDisabled, store.currentTheme, store.sidebarOpen])
}
