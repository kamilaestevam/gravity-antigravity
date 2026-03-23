import React, { useEffect, useState, useCallback } from 'react'

export interface NotificationItem {
  id: string
  type: string
  title?: string
  message: string
  read: boolean
  activity_id?: string
  created_at: string
}

export function Notificacoes({ tenantId, userId }: { tenantId: string, userId: string }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isPolling, setIsPolling] = useState(false)

  const syncState = useCallback(async () => {
    try {
      const res = await fetch(`/api/tenant/notificacoes`, {
        headers: { 'x-tenant-id': tenantId, 'x-user-id': userId }
      })
      const data = await res.json()
      if (data.status === 'success') {
        setNotifications(data.data)
        setUnreadCount(data.unread_count)
      }
    } catch (err) {
      console.error('Failed to sync notifications state via polling', err)
    }
  }, [tenantId, userId])

  useEffect(() => {
    if (!userId) return

    let eventSource: EventSource | null = null
    let pollInterval: any = null

    // Attempt SSE connection
    try {
      eventSource = new EventSource(`/api/tenant/notificacoes/stream?userId=${userId}`)
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'new_notification') {
            // Re-sync to get the latest list and count properly ordered
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

    // Always keep a slow polling running as a safety net (e.g. 1 min)
    // or as primary if SSE failed (e.g. 30s)
    pollInterval = setInterval(syncState, isPolling ? 30000 : 60000)

    // Initial load
    syncState()

    return () => {
      eventSource?.close()
      clearInterval(pollInterval)
    }
  }, [userId, syncState, isPolling])

  const handleMarkAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    
    try {
      await fetch(`/api/tenant/notificacoes/${id}/read`, {
        method: 'PUT',
        headers: { 'x-tenant-id': tenantId, 'x-user-id': userId }
      })
    } catch (err) {
      console.error(err)
      syncState() // Revert on failure
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
      console.error(err)
      syncState()
    }
  }

  const handleDismiss = async (id: string) => {
    // Optimistic UI update
    const note = notifications.find(n => n.id === id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (note && !note.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    try {
      await fetch(`/api/tenant/notificacoes/${id}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': tenantId, 'x-user-id': userId }
      })
    } catch (err) {
      console.error(err)
      syncState()
    }
  }

  const badgeText = unreadCount > 9 ? '9+' : unreadCount > 0 ? unreadCount : null

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }}
      >
        <span style={{ fontSize: '24px' }}>🔔</span>
        {badgeText && (
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px',
            background: 'red', color: 'white', borderRadius: '50%',
            padding: '2px 6px', fontSize: '12px', fontWeight: 'bold'
          }}>
            {badgeText}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', right: 0, top: '40px', width: '300px',
          background: 'white', border: '1px solid #ccc', borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000
        }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: '#333' }}>Notificações</strong>
            <button onClick={handleReadAll} style={{ fontSize: '12px', color: '#0066cc', background: 'none', border: 'none', cursor: 'pointer' }}>
              Marcar todas como lidas
            </button>
          </div>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                Nenhuma notificação
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{
                  padding: '10px', borderBottom: '1px solid #f5f5f5', 
                  background: n.read ? '#fff' : '#f0f8ff', display: 'flex', gap: '10px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: n.read ? 'normal' : 'bold', color: '#333' }}>
                      {n.title || 'System'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{n.message}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {!n.read && (
                      <button onClick={() => handleMarkAsRead(n.id)} style={{ fontSize: '10px', padding: '2px 5px', cursor: 'pointer' }}>
                        Lida
                      </button>
                    )}
                    <button onClick={() => handleDismiss(n.id)} style={{ fontSize: '10px', padding: '2px 5px', color: 'red', cursor: 'pointer' }}>
                      X
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
