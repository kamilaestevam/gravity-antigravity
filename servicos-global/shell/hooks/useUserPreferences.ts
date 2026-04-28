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
// ── Como usar ────────────────────────────────────────────────────────────────
// Adicione <SyncUserPreferences userId={user?.id} tenantId={tenantId} />
// no topo do WorkspaceLayout e AdminLayout, logo após o store ser acessado.

import { useEffect, useRef } from 'react'
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
 * Retorna as preferências remotas ou null em caso de falha.
 */
async function fetchPreferencias(id_usuario: string, id_organizacao: string): Promise<PreferenciasPayload | null> {
  try {
    const res = await fetch(BASE_URL, {
      headers: {
        'x-user-id':   id_usuario,
        'x-tenant-id': id_organizacao,
      },
    })
    if (!res.ok) return null
    const json = await res.json()
    if (json.status === 'success') return json.data
    return null
  } catch {
    return null
  }
}

/**
 * Persiste preferências no servidor.
 * Falha silenciosa — o estado local (localStorage) já foi atualizado.
 */
async function savePreferencias(
  id_usuario: string,
  id_organizacao: string,
  payload: PreferenciasPayload,
): Promise<void> {
  try {
    await fetch(BASE_URL, {
      method:  'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id':    id_usuario,
        'x-tenant-id':  id_organizacao,
      },
      body: JSON.stringify(payload),
    })
  } catch {
    // Falha silenciosa — usuário já tem a preferência salva localmente
  }
}

/**
 * Hook que sincroniza preferências de UI do usuário com o backend.
 *
 * @example
 * // Em WorkspaceLayout ou AdminLayout
 * const { user } = useUser()
 * useUserPreferences({ userId: user?.id, tenantId: 'importes-sa' })
 */
export function useUserPreferences({ id_usuario, id_organizacao }: UseUserPreferencesOptions) {
  const store = useShellStore()
  const isInitializedRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── 1. Carrega preferências do backend na montagem ────────────────────────
  useEffect(() => {
    if (!id_usuario || !id_organizacao) return
    if (isInitializedRef.current) return

    isInitializedRef.current = true

    fetchPreferencias(id_usuario, id_organizacao).then((prefs) => {
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
      savePreferencias(id_usuario, id_organizacao, {
        tooltips_disabled: store.tooltipsDisabled,
        theme:             store.currentTheme,
        sidebar_open:      store.sidebarOpen,
      })
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [id_usuario, id_organizacao, store.tooltipsDisabled, store.currentTheme, store.sidebarOpen])
}
