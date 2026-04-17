import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AvisoInternoGlobal, type AvisoInterno, type UsuarioMencao } from '@nucleo/mensageria-global'
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

// ─── Mocks de desenvolvimento — visíveis apenas quando DEV=true ──────────────
const DEV_MOCKS: AvisoInterno[] = import.meta.env.DEV ? [
  {
    id: 'mock-1',
    conteudo: 'Pedido #PED-2024-089 está com prazo vencido há 3 dias. Verificar junto ao cliente antes do fechamento do mês.',
    autor: { nome: 'Carlos Mendes' },
    dataHora: '16/04/2026, 09:14',
    lido: false,
    tipo: 'mencao',
    href: '/produto/pedido/pedidos/PED-2024-089',
  },
  {
    id: 'mock-2',
    conteudo: 'Para: Ana Lima, Bruno Souza — Reunião de alinhamento amanhã às 10h sobre o fechamento do trimestre. Link da pauta no Drive.',
    autor: { nome: 'Você' },
    dataHora: '16/04/2026, 08:52',
    lido: false,
    tipo: 'enviado',
  },
  {
    id: 'mock-3',
    conteudo: 'Nova importação de NF concluída: 47 itens importados com sucesso, 2 com divergência de NCM. Revisar antes de confirmar.',
    autor: { nome: 'Sistema' },
    dataHora: '15/04/2026, 17:30',
    lido: false,
    tipo: 'sistema',
  },
  {
    id: 'mock-4',
    conteudo: '@você Preciso que você revise os valores do SimulaCusto para o cliente Importadora Delta — tem uma diferença de R$ 1.240 no cálculo do II.',
    autor: { nome: 'Ana Lima' },
    dataHora: '15/04/2026, 14:10',
    lido: false,
    tipo: 'mencao',
    href: '/produto/simulacusto',
  },
  {
    id: 'mock-5',
    conteudo: 'Lembrete pessoal: confirmar com o financeiro o câmbio de fechamento do USD para os pedidos de abril.',
    autor: { nome: 'Você' },
    dataHora: '15/04/2026, 11:00',
    lido: false,
    tipo: 'aviso',
  },
  {
    id: 'mock-6',
    conteudo: 'Para: Pedro Costa — Segue o link da simulação de custo que discutimos. Qualquer dúvida é só chamar.',
    autor: { nome: 'Você' },
    dataHora: '14/04/2026, 16:45',
    lido: false,
    tipo: 'enviado',
    href: '/produto/simulacusto/resultado/123',
  },
] : []

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
  const [usuariosTenant, setUsuariosTenant] = useState<UsuarioMencao[]>([])
  const navigate = useNavigate()
  const location = useLocation()

  // Avisos vindos do shell store (ex: motor de testes empurrando via addAviso).
  // Mantidos em lista separada — fundidos no render abaixo.
  const storeAvisos = useShellStore((s) => s.avisos)
  const marcarAvisoLidoStore = useShellStore((s) => s.marcarAvisoLido)
  const marcarTodosAvisosLidosStore = useShellStore((s) => s.marcarTodosAvisosLidos)
  const currentUserName = useShellStore((s) => s.currentUser.name)
  const addNotification = useShellStore((s) => s.addNotification)
  const linkContextual = useShellStore((s) => s.linkContextual)

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

  // Busca lista de usuários do tenant para @mention e Enviar Para.
  // Chamado 1x no mount — a lista de membros muda raramente.
  useEffect(() => {
    let cancelled = false
    async function fetchUsers() {
      try {
        const res = await authedFetch('/api/v1/usuarios')
        if (!res.ok) return
        const payload = await res.json() as {
          users?: Array<{ id: string; name: string; email?: string }>
        }
        if (cancelled || !payload.users) return
        setUsuariosTenant(
          payload.users.map((u) => ({ id: u.id, nome: u.name, email: u.email }))
        )
      } catch {
        // Silencioso — @mention e Enviar Para ficam desabilitados se falhar
      }
    }
    fetchUsers()
    return () => { cancelled = true }
  }, [])

  // Callback do painel "Enviar Para" — cria notificações para os destinatários
  // usando a rota autenticada POST /send (browser-facing, JWT).
  const handleEnviarPara = useCallback(
    async (destinatarios: string[], mensagem: string, link?: string, viaEmail?: boolean) => {
      try {
        // Resolve nomes e e-mails dos destinatários
        const recipientNames = destinatarios
          .map((uid) => usuariosTenant.find((u) => u.id === uid)?.nome)
          .filter(Boolean) as string[]

        const recipientEmails = destinatarios
          .map((uid) => usuariosTenant.find((u) => u.id === uid)?.email)
          .filter(Boolean) as string[]

        const res = await authedFetch(`${BASE_URL}/send`, {
          method: 'POST',
          body: JSON.stringify({
            user_ids: destinatarios,
            message: mensagem,
            sender_name: currentUserName || undefined,
            recipient_names: recipientNames,
            activity_id: link || undefined,
            via_email: viaEmail === true && recipientEmails.length > 0,
            recipient_emails: viaEmail ? recipientEmails : undefined,
          }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => null) as { error?: { message?: string } } | null
          throw new Error(body?.error?.message ?? `HTTP ${res.status}`)
        }

        const data = await res.json() as {
          status: string
          email?: { success: boolean; error?: string; errorMessage?: string } | null
        }

        // Toast de resultado do e-mail
        if (viaEmail && data.email !== null && data.email !== undefined) {
          if (data.email.success) {
            addNotification({ type: 'success', message: 'E-mail enviado com sucesso!' })
          } else if (data.email.error === 'service_offline') {
            addNotification({ type: 'error', message: 'Serviço de e-mail indisponível. Tente novamente mais tarde.' })
          } else {
            addNotification({ type: 'error', message: `Falha ao enviar e-mail: ${data.email.errorMessage ?? 'erro desconhecido'}` })
          }
        }

        // Recarrega para mostrar o registro "enviado" no histórico
        await syncState()
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Falha ao enviar notificação')
      }
    },
    [currentUserName, usuariosTenant, syncState]
  )

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
    tipo: (['aviso', 'mencao', 'sistema', 'tarefa', 'compartilhamento', 'enviado'].includes(n.type)
      ? (n.type === 'compartilhamento' ? 'aviso' : n.type)
      : 'sistema') as AvisoInterno['tipo'],
    // activity_id serve como deep link — pode ser rota relativa (/produto/pedido/123)
    // ou ID de entidade. Quando presente, o item fica clicável no sininho.
    href: n.activity_id || undefined,
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

  const avisosFinal = [...avisosDoStore, ...avisosDaApi, ...DEV_MOCKS]

  return (
    <AvisoInternoGlobal
      avisos={avisosFinal}
      carregando={carregando && avisosFinal.length === 0}
      erro={erro}
      onMarcarLido={handleMarkAsRead}
      onMarcarTodosLidos={handleReadAll}
      onCriarAviso={handleCriarAviso}
      onNavegarHref={(href) => navigate(href)}
      onEnviarPara={handleEnviarPara}
      usuariosTenant={usuariosTenant}
      linkAtual={linkContextual ?? location.pathname}
    />
  )
}
