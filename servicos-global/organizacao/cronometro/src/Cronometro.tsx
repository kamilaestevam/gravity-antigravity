// src/Cronometro.tsx
// Componente principal do serviço de Cronômetro.
// Renderizado na aba Tempo do modal de qualquer atividade.
//
// Regras:
// - Não importa código de nenhum outro serviço de tenant
// - Não chama API diretamente (usa hook useTenantService)
// - Comunica eventos via event bus (@nucleo/shell)

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// ---------------------------------------------------------------------------
// Tipos locais
// ---------------------------------------------------------------------------

type TimerSession = {
  id: string
  started_at: string
  ended_at?: string
  duration_minutes: number
  is_manual: boolean
  subject?: string
  linked_type?: 'nf' | 'meeting' | 'process' | 'custom'
  linked_id?: string
  linked_label?: string
}

type ActiveTimer = {
  active: boolean
  id?: string
  activity_id?: string
  elapsed_seconds?: number
  is_paused?: boolean
}

type CronometroProps = {
  activityId: string
  tenantId: string
  userId: string
  productId?: string
  /** URL base do servidor de cronômetro */
  apiBase?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
  ].join(' : ')
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m}min` : `${h}h`
}

async function apiFetch(
  url: string,
  method: string,
  tenantId: string,
  userId: string,
  body?: unknown
): Promise<Response> {
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
      'x-user-id': userId,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function Cronometro({
  activityId,
  tenantId,
  userId,
  productId,
  apiBase = '/api/v1',
}: CronometroProps) {
  const { t } = useTranslation()

  // --- Estado do timer ativo ---
  const [activeTimer, setActiveTimer] = useState<ActiveTimer>({ active: false })
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // --- Sessões registradas ---
  const [sessions, setSessions] = useState<TimerSession[]>([])
  const [totalMinutes, setTotalMinutes] = useState(0)

  // --- Lançamento manual ---
  const [manualMinutes, setManualMinutes] = useState('')
  const [manualSubject, setManualSubject] = useState('')
  const [manualError, setManualError] = useState('')

  // --- SSE ---
  const sseRef = useRef<EventSource | null>(null)

  // ---------------------------------------------------------------------------
  // Carrega sessões da atividade
  // ---------------------------------------------------------------------------

  const loadSessions = useCallback(async () => {
    const res = await apiFetch(`${apiBase}/atividades/${activityId}/cronometro`, 'GET', tenantId, userId)
    if (!res.ok) return
    const data = await res.json() as { sessions: TimerSession[]; total_minutes: number }
    setSessions(data.sessions)
    setTotalMinutes(data.total_minutes)
  }, [activityId, apiBase, tenantId, userId])

  // Carrega timer ativo
  const loadActive = useCallback(async () => {
    const res = await apiFetch(`${apiBase}/cronometros/ativo`, 'GET', tenantId, userId)
    if (!res.ok) return
    const data = await res.json() as ActiveTimer
    if (data.active && data.activity_id === activityId) {
      setActiveTimer(data)
      setElapsedSeconds(data.elapsed_seconds ?? 0)
    } else {
      setActiveTimer({ active: false })
    }
  }, [activityId, apiBase, tenantId, userId])

  // ---------------------------------------------------------------------------
  // SSE — atualizações em tempo real
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const sse = new EventSource(`${apiBase}/cronometros/stream`, {
      // Adicionar headers via URL params (SSE não suporta custom headers diretamente)
      // Em produção, o gateway inject via cookie ou query param assinado
    })

    sse.addEventListener('timer:started', () => {
      loadActive()
    })

    sse.addEventListener('timer:paused', (e: MessageEvent) => {
      const data = JSON.parse(e.data as string) as { elapsed_seconds: number; activity_id: string }
      if (data.activity_id === activityId) {
        setActiveTimer((prev) => ({ ...prev, is_paused: true }))
        setElapsedSeconds(data.elapsed_seconds)
      }
    })

    sse.addEventListener('timer:resumed', (e: MessageEvent) => {
      const data = JSON.parse(e.data as string) as { activity_id: string }
      if (data.activity_id === activityId) {
        setActiveTimer((prev) => ({ ...prev, is_paused: false }))
      }
    })

    sse.addEventListener('timer:stopped', () => {
      setActiveTimer({ active: false })
      setElapsedSeconds(0)
      loadSessions()
    })

    sseRef.current = sse

    return () => {
      sse.close()
    }
  }, [activityId, apiBase, loadActive, loadSessions])

  // ---------------------------------------------------------------------------
  // Tick do cronômetro em tempo real
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current)

    if (activeTimer.active && !activeTimer.is_paused) {
      tickRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1)
      }, 1000)
    }

    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [activeTimer.active, activeTimer.is_paused])

  // ---------------------------------------------------------------------------
  // Carregamento inicial
  // ---------------------------------------------------------------------------

  useEffect(() => {
    loadSessions()
    loadActive()
  }, [loadSessions, loadActive])

  // ---------------------------------------------------------------------------
  // Ações do timer
  // ---------------------------------------------------------------------------

  const handleStart = async () => {
    const res = await apiFetch(`${apiBase}/atividades/${activityId}/cronometro/iniciar`, 'POST', tenantId, userId)
    if (!res.ok) return
    const data = await res.json() as { timer: ActiveTimer }
    setActiveTimer({ active: true, activity_id: activityId, elapsed_seconds: 0, is_paused: false })
    setElapsedSeconds(0)
    // Emite evento para o sistema
    window.dispatchEvent(new CustomEvent('timer:started', { detail: { activity_id: activityId, user_id: userId, tenantId } }))
  }

  const handlePause = async () => {
    await apiFetch(`${apiBase}/atividades/${activityId}/cronometro/pausar`, 'POST', tenantId, userId)
    setActiveTimer((prev) => ({ ...prev, is_paused: true }))
    window.dispatchEvent(new CustomEvent('timer:paused', { detail: { activity_id: activityId, user_id: userId, duration: elapsedSeconds } }))
  }

  const handleResume = async () => {
    await apiFetch(`${apiBase}/atividades/${activityId}/cronometro/iniciar`, 'POST', tenantId, userId)
    setActiveTimer((prev) => ({ ...prev, is_paused: false }))
  }

  const handleStop = async () => {
    const res = await apiFetch(`${apiBase}/atividades/${activityId}/cronometro/parar`, 'POST', tenantId, userId)
    if (!res.ok) return
    const data = await res.json() as { duration_minutes: number; discarded?: boolean }
    setActiveTimer({ active: false })
    setElapsedSeconds(0)
    window.dispatchEvent(new CustomEvent('timer:stopped', { detail: { activity_id: activityId, duration: data.duration_minutes } }))
    await loadSessions()
  }

  // ---------------------------------------------------------------------------
  // Lançamento manual
  // ---------------------------------------------------------------------------

  const handleManual = async () => {
    setManualError('')
    const minutes = parseInt(manualMinutes, 10)

    if (!Number.isInteger(minutes) || minutes <= 0) {
      setManualError(t('cronometro.erro_minutos'))
      return
    }
    if (!manualSubject.trim()) {
      setManualError(t('cronometro.erro_assunto'))
      return
    }

    const res = await apiFetch(`${apiBase}/atividades/${activityId}/cronometro/lancar-manual`, 'POST', tenantId, userId, {
      duration_minutes: minutes,
      subject: manualSubject.trim(),
      product_id: productId,
    })

    if (!res.ok) {
      const err = await res.json() as { error: { message: string } }
      setManualError(err.error.message)
      return
    }

    setManualMinutes('')
    setManualSubject('')
    await loadSessions()
  }

  // ---------------------------------------------------------------------------
  // Editar assunto inline
  // ---------------------------------------------------------------------------

  const handlePatchSubject = async (sessionId: string, subject: string) => {
    await apiFetch(`${apiBase}/cronometros/sessoes/${sessionId}`, 'PATCH', tenantId, userId, { subject })
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, subject } : s))
    )
  }

  // ---------------------------------------------------------------------------
  // Deletar sessão
  // ---------------------------------------------------------------------------

  const handleDelete = async (sessionId: string) => {
    if (!window.confirm(t('cronometro.confirmar_remover'))) return
    await apiFetch(`${apiBase}/cronometros/sessoes/${sessionId}`, 'DELETE', tenantId, userId)
    await loadSessions()
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isRunning = activeTimer.active && !activeTimer.is_paused
  const isPaused = activeTimer.active && activeTimer.is_paused

  return (
    <div className="cronometro">
      {/* ─── Seção CRONÔMETRO ─────────────────────────────── */}
      <section className="cronometro__section">
        <h3 className="cronometro__section-title">{t('cronometro.titulo')}</h3>
        <p className="cronometro__label">{t('cronometro.tempo_trabalhado')}</p>

        <div className="cronometro__display">
          <span className="cronometro__time">{formatDuration(elapsedSeconds)}</span>
        </div>

        <div className="cronometro__controls">
          {!activeTimer.active && (
            <button className="cronometro__btn cronometro__btn--primary" onClick={handleStart}>
              {t('cronometro.iniciar')}
            </button>
          )}
          {isRunning && (
            <>
              <button className="cronometro__btn cronometro__btn--secondary" onClick={handlePause}>
                {t('cronometro.pausar')}
              </button>
              <button className="cronometro__btn cronometro__btn--danger" onClick={handleStop}>
                {t('cronometro.parar_salvar')}
              </button>
            </>
          )}
          {isPaused && (
            <>
              <button className="cronometro__btn cronometro__btn--primary" onClick={handleResume}>
                {t('cronometro.retomar')}
              </button>
              <button className="cronometro__btn cronometro__btn--danger" onClick={handleStop}>
                {t('cronometro.parar_salvar')}
              </button>
            </>
          )}
        </div>
      </section>

      {/* ─── Seção LANÇAMENTO MANUAL ──────────────────────── */}
      <section className="cronometro__section">
        <h3 className="cronometro__section-title">{t('cronometro.lancar_manual')}</h3>
        <p className="cronometro__label">{t('cronometro.manual_desc')}</p>

        <input
          type="number"
          min={1}
          className="cronometro__input"
          placeholder={t('cronometro.minutos_placeholder')}
          value={manualMinutes}
          onChange={(e) => setManualMinutes(e.target.value)}
        />
        <input
          type="text"
          className="cronometro__input"
          placeholder={t('cronometro.assunto_placeholder')}
          value={manualSubject}
          onChange={(e) => setManualSubject(e.target.value)}
        />

        {manualError && <p className="cronometro__error">{manualError}</p>}

        {manualMinutes && Number(manualMinutes) > 0 && (
          <p className="cronometro__preview">
            = {formatMinutes(Number(manualMinutes))}
          </p>
        )}

        <button className="cronometro__btn cronometro__btn--ghost" onClick={handleManual}>
          {t('cronometro.adicionar_sessao')}
        </button>
      </section>

      {/* ─── Seção SESSÕES REGISTRADAS ────────────────────── */}
      <section className="cronometro__section">
        <h3 className="cronometro__section-title">
          {t('cronometro.sessoes_registradas')}
          <span className="cronometro__total">{t('cronometro.total')} {formatMinutes(totalMinutes)}</span>
        </h3>

        {sessions.length === 0 ? (
          <p className="cronometro__empty">{t('cronometro.nenhuma_sessao')}</p>
        ) : (
          <table className="cronometro__table">
            <thead>
              <tr>
                <th>{t('cronometro.tabela.data')}</th>
                <th>{t('cronometro.tabela.hora')}</th>
                <th>{t('cronometro.tabela.duracao')}</th>
                <th>{t('cronometro.tabela.assunto')}</th>
                <th>{t('cronometro.tabela.acoes')}</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  onPatchSubject={handlePatchSubject}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SessionRow — linha editável da tabela de sessões
// ---------------------------------------------------------------------------

type SessionRowProps = {
  session: TimerSession
  onPatchSubject: (id: string, subject: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function SessionRow({ session, onPatchSubject, onDelete }: SessionRowProps) {
  const { t } = useTranslation()
  const [editingSubject, setEditingSubject] = useState(session.subject ?? '')
  const [isEditing, setIsEditing] = useState(false)

  const date = new Date(session.started_at)
  const dateStr = date.toLocaleDateString('pt-BR')
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const handleBlur = async () => {
    setIsEditing(false)
    if (editingSubject !== session.subject) {
      await onPatchSubject(session.id, editingSubject)
    }
  }

  return (
    <tr>
      <td>{dateStr}</td>
      <td>{timeStr}</td>
      <td>
        <span className="cronometro__badge">⏱ {formatMinutes(session.duration_minutes)}</span>
      </td>
      <td>
        {isEditing ? (
          <input
            autoFocus
            className="cronometro__input cronometro__input--inline"
            value={editingSubject}
            onChange={(e) => setEditingSubject(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleBlur() }}
          />
        ) : (
          <span
            className="cronometro__subject"
            onClick={() => setIsEditing(true)}
            title={t('cronometro.editar_assunto')}
          >
            {editingSubject || t('cronometro.adicionar_assunto')}
          </span>
        )}
      </td>
      <td>
        <button
          className="cronometro__btn-icon"
          title={t('cronometro.remover_sessao')}
          onClick={() => onDelete(session.id)}
        >
          🗑️
        </button>
      </td>
    </tr>
  )
}

export default Cronometro
