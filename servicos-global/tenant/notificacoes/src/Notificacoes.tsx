import React, { useEffect, useState, useCallback, useRef } from 'react'
import { AvisoInternoGlobal, AvisoInterno } from '@nucleo/aviso-interno-global'
import { Bell } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'

export interface NotificationItem {
  id: string
  type: string
  title?: string
  message: string
  read: boolean
  activity_id?: string
  created_at: string
  _isAtrasado?: boolean // Mock field temporarily for testing filters
}

const MOCK_NOTIFICATIONS: NotificationItem[] = Array.from({ length: 30 }).map((_, i) => {
  const diasAtras = Math.floor(i / 4);
  const data = new Date();
  data.setDate(data.getDate() - diasAtras);
  data.setHours(10 - (i % 8)); // varied times
  
  const isAtrasado = i === 2 || i === 7 || i === 14;
  const isUnread = i < 8; // Deixando mais algumas nao lidas para teste visual
  
  return {
    id: `mock-${i + 1}`,
    type: i % 4 === 0 ? 'sistema' : 'aviso',
    title: i % 3 === 0 ? 'Maria Carla' : i % 5 === 0 ? 'Suporte Gravity' : 'Sistema',
    message: isAtrasado 
      ? `🚨 Atenção requerida: O prazo do contrato #${990 + i} esgotou. Por favor, regularize imediatamente. Caso o sistema não identifique compensação em nosso parceiro de pagamentos nas próximas 48 horas úteis, medidas automáticas de suspensão parcial do tenant podem entrar em vigor sem aviso prévio. Fale com a GABI-IA em caso de erro.`
      : i % 4 === 0
        ? `Este é um teste intensivo de estresse de leitura. O objetivo aqui é ter uma massa de dados absolutamente surreal para validar a trava de quatro linhas implementada no CSS do AvisoInternoGlobal. O desenvolvedor deve observar e bater o martelo se as reticências cortam o parágrafo de forma elegante (truncamento via CSS line-clamp). Se você estiver conseguindo ler esta parte final do meu texto nas notificações do dropdown nativo, quer dizer que eu fracassei e o painel "estourou" a tela. Parabéns por chegar até aqui (Notificação ${i + 1}).`
      : i % 3 === 0
        ? `Lembrete direto e curto. Reunião às 14h na Sala A.`
      : i % 2 === 0 
        ? `Relatório exportado com sucesso. Verifique seus downloads para analisar o consolidado de vendas de março. (Notificação ${i + 1}).`
        : `Uma nova versão do módulo de Vendas foi publicada. O funil foi revisado e a pipeline está 43% mais veloz na tela inicial.`,
    read: !isUnread,
    created_at: data.toISOString(),
    _isAtrasado: isAtrasado
  };
});

export function Notificacoes({ tenantId, userId }: { tenantId: string, userId: string }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS)
  const [unreadCount, setUnreadCount] = useState(MOCK_NOTIFICATIONS.filter(n => !n.read).length)
  const [isOpen, setIsOpen] = useState(false)
  const [isPolling, setIsPolling] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const syncState = useCallback(async () => {
    try {
      const res = await fetch(`/api/tenant/notificacoes`, {
        headers: { 'x-tenant-id': tenantId, 'x-user-id': userId }
      })
      const data = await res.json()
      if (data.status === 'success' && data.data && data.data.length > 0) {
        // TEMPORARIAMENTE COMENTADO PARA PODERMOS TESTAR OS 30 MOCKS LOCAIS
        // setNotifications(data.data)
        // setUnreadCount(data.unread_count)
      }
    } catch (err) {
      console.error('Failed to sync notifications state via polling', err)
    }
  }, [tenantId, userId])

  useEffect(() => {
    if (!userId) return

    let eventSource: EventSource | null = null
    let pollInterval: any = null

    try {
      eventSource = new EventSource(`/api/tenant/notificacoes/stream?userId=${userId}`)
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'new_notification') {
            syncState()
          }
        } catch(e) {}
      }

      eventSource.onerror = () => {
        console.warn('SSE connection lost. Falling back to polling...')
        eventSource?.close()
        setIsPolling(true)
      }
    } catch(err) {
      setIsPolling(true)
    }

    pollInterval = setInterval(syncState, isPolling ? 30000 : 60000)
    syncState()

    return () => {
      eventSource?.close()
      clearInterval(pollInterval)
    }
  }, [userId, syncState, isPolling])

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    
    try {
      await fetch(`/api/tenant/notificacoes/${id}/read`, {
        method: 'PUT',
        headers: { 'x-tenant-id': tenantId, 'x-user-id': userId }
      })
    } catch (err) {
      syncState()
    }
  }

  const handleReadAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)

    try {
      await fetch(`/api/tenant/notificacoes/read-all`, {
        method: 'PUT',
        headers: { 'x-tenant-id': tenantId, 'x-user-id': userId }
      })
    } catch (err) {
      syncState()
    }
  }

  const handleCriarAviso = async (texto: string) => {
    // Atualização Otimista local
    const tempId = `temp-${Date.now()}`
    const novoAviso: NotificationItem = {
      id: tempId,
      type: 'aviso',
      title: 'Auto-lembrete',
      message: texto,
      read: false, // Avisos recém-criados muitas vezes aparecem como nova "tarefa" pra você mesmo
      created_at: new Date().toISOString(),
    }

    setNotifications(prev => [novoAviso, ...prev])
    setUnreadCount(prev => prev + 1)

    try {
      // Bate no backend instruindo a criar um novo aviso/lembrete/chamado interno
      const res = await fetch(`/api/tenant/notificacoes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId, 
          'x-user-id': userId 
        },
        body: JSON.stringify({
          type: 'aviso',
          title: 'Auto-lembrete',
          message: texto
        })
      })
      if (!res.ok) throw new Error('Falha ao criar aviso')
      
      const data = await res.json()
      // Atualiza o id temporário com o real oficial se o sistema retornar
      if (data && data.id) {
        setNotifications(prev => prev.map(n => n.id === tempId ? { ...n, id: data.id } : n))
      }
    } catch (err) {
      console.error(err)
      syncState() // Reverte estado se der erro
    }
  }

  const badgeText = unreadCount > 9 ? '9+' : unreadCount > 0 ? unreadCount : null

  // Mapear os dados vindos da API para o formato padronizado visual do AvisoInternoGlobal
  const avisosMapeados: AvisoInterno[] = notifications.map(n => ({
    id: n.id,
    conteudo: n.message,
    autor: { nome: n.title || 'Sistema' },
    dataHora: new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    lido: n.read,
    tipo: (['aviso', 'mencao', 'sistema', 'tarefa'].includes(n.type) ? n.type : 'sistema') as any,
    statusReal: n._isAtrasado ? 'atrasado' : 'em_dia'
  }))

  return (
    <div style={{ position: 'relative', display: 'flex' }} ref={dropdownRef}>
      {/* Gatilho (Botão do Sininho) */}
      <TooltipGlobal titulo="Quadro de Avisos" descricao="Acompanhe lembretes e pendências que exigem sua ação">
        <button 
          className="ws-global-btn"
          onClick={() => setIsOpen(!isOpen)}
          type="button" 
          style={{ position: 'relative' }}
        >
          <Bell weight="bold" size={18} />
          {badgeText && (
            <span className="ws-global-badge" style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 'bold', color: 'white', background: 'red'
            }}>
              {unreadCount > 9 ? '' : unreadCount}
            </span>
          )}
        </button>
      </TooltipGlobal>

      {/* Popover/Dropdown com a nova Central de Chamados/Avisos */}
      {isOpen && (
        <div style={{
          position: 'absolute', right: 0, top: '44px', zIndex: 1000
        }}>
          <AvisoInternoGlobal 
            avisos={avisosMapeados}
            onMarcarLido={handleMarkAsRead}
            onMarcarTodosLidos={handleReadAll}
            onCriarAviso={handleCriarAviso}
            onFechar={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
