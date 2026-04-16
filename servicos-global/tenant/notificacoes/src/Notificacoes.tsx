import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AvisoInternoGlobal, type AvisoInterno } from '@nucleo/mensageria-global'
import { useShellStore } from '@gravity/shell'

export interface NotificationItem {
  id: string
  type: string
  title?: string
  message: string
  read: boolean
  activity_id?: string
  created_at: string
}

interface NotificationApiResponse {
  status: 'success' | 'error'
  data?: NotificationItem[]
  unread_count?: number
  message?: string
}

/**
 * Obtém o JWT do Clerk via window global. Mesma estratégia usada pelo
 * apiClient.ts do configurador (fallback path). Sem isso, o requireAuth
 * do proxy retorna 401 e o componente cai silenciosamente para mocks.
 */
async function getClerkToken(): Promise<string | null> {
  try {
    const clerk = (window as unknown as {
      Clerk?: { session?: { getToken: () => Promise<string | null> } }
    }).Clerk
    if (clerk?.session?.getToken) {
      return await clerk.session.getToken()
    }
  } catch {
    // sem clerk disponível
  }
  return null
}

async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getClerkToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) ?? {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(input, { ...init, headers })
}

const BASE_URL = '/api/tenant/notificacoes'

/**
 * Componente do sininho de notificações.
 *
 * Onda 1 do Detetive de Tela:
 *   - Removida prop `tenantId` (vinha hardcoded de 4 layouts) — backend agora
 *     resolve tenant_id/user_id a partir do JWT Clerk validado pelo proxy.
 *   - Removidos 30 mocks de "Maria Carla / Suporte Gravity / Sistema".
 *   - Removido SSE inseguro com credenciais em query string (item #3) — fica
 *     desligado até a Onda 3 substituir EventSource por fetch streaming.
 *   - Não engole mais erros silenciosamente (item #4).
 */
export function Notificacoes() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const navigate = useNavigate()

  // Avisos vindos do shell store (ex: motor de testes empurrando via addAviso).
  // Mantidos em lista separada — fundidos no render abaixo.
  const storeAvisos = useShellStore((s) => s.avisos)
  const marcarAvisoLidoStore = useShellStore((s) => s.marcarAvisoLido)
  const marcarTodosAvisosLidosStore = useShellStore((s) => s.marcarTodosAvisosLidos)

  const syncState = useCallback(async () => {
    try {
      const res = await authedFetch(BASE_URL)
      if (!res.ok) {
        throw new Error(`Falha ao carregar notificações (HTTP ${res.status})`)
      }
      const data = (await res.json()) as NotificationApiResponse
      if (data.status !== 'success') {
        throw new Error(data.message ?? 'Resposta inválida do servidor')
      }
      setNotifications(data.data ?? [])
      setErro(null)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    syncState()
    // Polling 60s — substitui SSE até Onda 3 implementar streaming autenticado.
    const interval = setInterval(() => syncState(), 60_000)
    return () => clearInterval(interval)
  }, [syncState])

  // IDs vindos do shell store começam com "aviso-" (gerados por generateAvisoId()).
  const isStoreAvisoId = (id: string) => id.startsWith('aviso-')

  const handleMarkAsRead = async (id: string) => {
    if (isStoreAvisoId(id)) {
      marcarAvisoLidoStore(id)
      return
    }
    // Otimista
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try {
      const res = await authedFetch(`${BASE_URL}/${encodeURIComponent(id)}/read`, {
        method: 'PUT',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      // Reverte
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)))
      setErro(err instanceof Error ? err.message : 'Falha ao marcar como lida')
    }
  }

  const handleReadAll = async () => {
    marcarTodosAvisosLidosStore()
    const previous = notifications
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      const res = await authedFetch(`${BASE_URL}/read-all`, { method: 'PUT' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      setNotifications(previous)
      setErro(err instanceof Error ? err.message : 'Falha ao marcar todas como lidas')
    }
  }

  const handleCriarAviso = async (texto: string) => {
    // Otimista: insere no estado local com id temporário
    const tempId = `temp-${Date.now()}`
    const optimistic: NotificationItem = {
      id: tempId,
      type: 'aviso',
      title: 'Você',
      message: texto,
      read: false,
      created_at: new Date().toISOString(),
    }
    setNotifications((prev) => [optimistic, ...prev])

    try {
      const res = await authedFetch(BASE_URL, {
        method: 'POST',
        body: JSON.stringify({ type: 'aviso', title: 'Você', message: texto }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const payload = (await res.json()) as { status: string; data?: NotificationItem }
      if (payload.status !== 'success' || !payload.data) {
        throw new Error('Resposta inválida do servidor')
      }
      // Substitui o id temporário pelo real
      const realData = payload.data
      setNotifications((prev) =>
        prev.map((n) => (n.id === tempId ? { ...realData, read: false } : n))
      )
    } catch (err) {
      // Reverte
      setNotifications((prev) => prev.filter((n) => n.id !== tempId))
      setErro(err instanceof Error ? err.message : 'Falha ao criar aviso')
    }
  }

  // Mapeia notificações da API para o formato do AvisoInternoGlobal
  const avisosDaApi: AvisoInterno[] = notifications.map((n) => ({
    id: n.id,
    conteudo: n.message,
    autor: { nome: n.title ?? 'Sistema' },
    dataHora: new Date(n.created_at).toLocaleString([], {
      dateStyle: 'short',
      timeStyle: 'short',
    }),
    lido: n.read,
    tipo: (['aviso', 'mencao', 'sistema', 'tarefa'].includes(n.type)
      ? n.type
      : 'sistema') as AvisoInterno['tipo'],
  }))

  // Avisos do shell store (mais recentes primeiro, para que push síncronos apareçam no topo)
  const avisosDoStore: AvisoInterno[] = storeAvisos.map((a) => ({
    id: a.id,
    conteudo: a.conteudo,
    autor: a.autor,
    dataHora: a.dataHora,
    lido: a.lido,
    tipo: a.tipo,
    href: a.href,
  }))

  const avisosFinal = [...avisosDoStore, ...avisosDaApi]

  return (
    <AvisoInternoGlobal
      avisos={avisosFinal}
      carregando={carregando && avisosFinal.length === 0}
      erro={erro}
      onMarcarLido={handleMarkAsRead}
      onMarcarTodosLidos={handleReadAll}
      onCriarAviso={handleCriarAviso}
      onNavegarHref={(href) => navigate(href)}
    />
  )
}
