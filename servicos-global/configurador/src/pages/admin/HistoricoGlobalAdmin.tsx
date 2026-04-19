import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@clerk/clerk-react'
import { apiFetch, setAuthTokenProvider } from '../../services/apiClient'
import {
  Desktop, User, Robot, FileCsv, FileCode,
  Info, Funnel, Warning, CheckCircle, ArrowsClockwise,
  Globe, Cpu, Gear, Hash
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaExportAcao } from '@nucleo/tabela-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CalendarioCampoGlobal } from '@nucleo/campo-calendario-global'
import { useShellStore } from '@gravity/shell'

// ── Tipos ─────────────────────────────────────────────────────────

type ActorType = 'USER' | 'API' | 'AI' | 'JOB' | 'INTEGRATION'
type EventStatus = 'SUCCESS' | 'FAILURE' | 'PARTIAL'
type AlertStatus = 'PENDING' | 'REVIEWED' | 'ESCALATED'

type AuditLog = {
  id: string
  created_at: string
  tenant_id: string
  actor_type: ActorType
  actor_id: string
  actor_name: string
  actor_ip?: string
  actor_metadata?: Record<string, unknown>
  module: string
  resource_type: string
  resource_id?: string
  action: string
  action_detail: string
  before?: unknown
  after?: unknown
  status: EventStatus
  error_message?: string
  integrity_hash: string
  product_id?: string
  user_id?: string
}

type AlertEvent = {
  id: string
  tenant_id: string
  actor_type: ActorType
  actor_id: string
  actor_name: string
  module: string
  action: string
  event_count: number
  window_seconds: number
  status: AlertStatus
  created_at: string
  notes?: string
  rule: { name: string }
}

// ── Helpers ───────────────────────────────────────────────────────

const COR_ATOR: Record<ActorType, { cor: string; bg: string }> = {
  USER:        { cor: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
  API:         { cor: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  AI:          { cor: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  JOB:         { cor: '#2dd4bf', bg: 'rgba(45,212,191,0.1)' },
  INTEGRATION: { cor: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
}

const COR_STATUS: Record<EventStatus, { cor: string; bg: string }> = {
  SUCCESS: { cor: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  FAILURE: { cor: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  PARTIAL: { cor: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
}

function IconeAtor({ tipo }: { tipo: ActorType }) {
  const props = { size: 14, weight: 'bold' as const }
  if (tipo === 'AI') return <Robot {...props} />
  if (tipo === 'JOB') return <Gear {...props} />
  if (tipo === 'API') return <Globe {...props} />
  if (tipo === 'INTEGRATION') return <Cpu {...props} />
  return <User {...props} />
}

function BadgeAtorType({ tipo }: { tipo: ActorType }) {
  const { cor, bg } = COR_ATOR[tipo] ?? COR_ATOR.USER
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '9999px', fontSize: '0.65rem',
      fontWeight: 700, background: bg, color: cor, border: `1px solid ${cor}33`,
    }}>
      <IconeAtor tipo={tipo} />
      {tipo}
    </span>
  )
}

function BadgeStatus({ status }: { status: EventStatus }) {
  const { cor, bg } = COR_STATUS[status]
  return (
    <span style={{
      display: 'inline-flex', padding: '2px 8px', borderRadius: '9999px',
      fontSize: '0.65rem', fontWeight: 700, background: bg, color: cor,
    }}>
      {status}
    </span>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ── Diff visual antes/depois ──────────────────────────────────────

function DiffVisual({ before, after }: { before?: unknown; after?: unknown }) {
  if (!before && !after) {
    return <p style={{ color: '#64748b', fontSize: '0.8125rem', padding: '0.5rem 0' }}>Sem dados de antes/depois registrados.</p>
  }

  const computedDiff = (() => {
    if (!before || !after) return null
    if (typeof before !== 'object' || typeof after !== 'object') return null
    const b = before as Record<string, unknown>
    const a = after as Record<string, unknown>
    const campos = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]))
    return campos
      .filter((k) => JSON.stringify(b[k]) !== JSON.stringify(a[k]))
      .map((k) => ({ campo: k, antes: b[k], depois: a[k] }))
  })()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {/* Antes */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171', display: 'inline-block' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Antes</span>
        </div>
        <pre style={{
          background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)',
          borderRadius: '6px', padding: '12px', fontSize: '0.75rem', color: '#e2e8f0',
          overflow: 'auto', maxHeight: '200px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {before ? JSON.stringify(before, null, 2) : '(novo registro)'}
        </pre>
      </div>

      {/* Depois */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Depois</span>
        </div>
        <pre style={{
          background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)',
          borderRadius: '6px', padding: '12px', fontSize: '0.75rem', color: '#e2e8f0',
          overflow: 'auto', maxHeight: '200px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {after ? JSON.stringify(after, null, 2) : '(registro excluído)'}
        </pre>
      </div>

      {/* Campos alterados */}
      {computedDiff && computedDiff.length > 0 && (
        <div style={{ gridColumn: '1 / -1' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Campos alterados ({computedDiff.length})
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                {['Campo', 'Antes', 'Depois'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {computedDiff.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '6px 8px', color: '#cbd5e1', fontWeight: 500 }}>{d.campo}</td>
                  <td style={{ padding: '6px 8px', color: '#f87171' }}>{String(d.antes ?? '—')}</td>
                  <td style={{ padding: '6px 8px', color: '#34d399' }}>{String(d.depois ?? '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Linha expandida ───────────────────────────────────────────────

function DetalheLog({ log }: { log: AuditLog }) {
  const [aba, setAba] = useState<'diff' | 'meta'>('diff')

  return (
    <div style={{ padding: '16px', background: 'rgba(15,23,42,0.6)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Abas */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {(['diff', 'meta'] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)} style={{
            padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: aba === a ? 'rgba(99,102,241,0.2)' : 'transparent',
            color: aba === a ? '#818cf8' : '#64748b',
          }}>
            {a === 'diff' ? 'Antes / Depois' : 'Detalhes'}
          </button>
        ))}
      </div>

      {aba === 'diff' && <DiffVisual before={log.before} after={log.after} />}

      {aba === 'meta' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.8rem' }}>
          {[
            { label: 'ID do Log', valor: log.id },
            { label: 'Módulo', valor: log.module },
            { label: 'Tipo de recurso', valor: log.resource_type },
            { label: 'ID do recurso', valor: log.resource_id ?? '—' },
            { label: 'IP do ator', valor: log.actor_ip ?? '—' },
            { label: 'Status', valor: log.status },
          ].map(({ label, valor }) => (
            <div key={label}>
              <p style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
              <p style={{ color: '#e2e8f0', fontWeight: 500, wordBreak: 'break-all' }}>{valor}</p>
            </div>
          ))}

          {log.error_message && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '4px', textTransform: 'uppercase' }}>Erro</p>
              <p style={{ color: '#f87171', fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.error_message}</p>
            </div>
          )}

          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Hash size={12} color="#64748b" />
            <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Integridade:</span>
            <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all' }}>{log.integrity_hash}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Painel de alertas ─────────────────────────────────────────────

function PainelAlertas({ onClose }: { onClose: () => void }) {
  const addNotification = useShellStore((s) => s.addNotification)
  const [alertas, setAlertas] = useState<AlertEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/admin/historico-global/alerts?status=PENDING')
      .then((r) => r.json())
      .then((d) => setAlertas(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function marcarRevisado(id: string) {
    try {
      await apiFetch(`/api/admin/historico-global/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REVIEWED' }),
      })
      setAlertas((prev) => prev.filter((a) => a.id !== id))
      addNotification({ type: 'success', message: 'Alerta marcado como revisado.' })
    } catch {
      addNotification({ type: 'error', message: 'Erro ao atualizar alerta.' })
    }
  }

  const COR_ALERT: Record<AlertStatus, string> = {
    PENDING: '#fbbf24',
    REVIEWED: '#34d399',
    ESCALATED: '#f87171',
  }

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px', zIndex: 50,
      background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Warning size={18} color="#fbbf24" weight="duotone" />
          <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>Alertas Pendentes</span>
          {alertas.length > 0 && (
            <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
              {alertas.length}
            </span>
          )}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {loading && <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Carregando...</p>}
        {!loading && alertas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <CheckCircle size={36} color="#34d399" weight="duotone" style={{ marginBottom: '12px' }} />
            <p style={{ color: '#34d399', fontWeight: 600, marginBottom: '4px' }}>Nenhum alerta pendente</p>
            <p style={{ color: '#64748b', fontSize: '0.8rem' }}>O sistema não detectou atividades suspeitas.</p>
          </div>
        )}

        {alertas.map((alerta) => (
          <div key={alerta.id} style={{
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${COR_ALERT[alerta.status]}33`,
            borderRadius: '8px', padding: '12px', marginBottom: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.85rem', marginBottom: '2px' }}>{alerta.rule.name}</p>
                <p style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDate(alerta.created_at)}</p>
              </div>
              <BadgeAtorType tipo={alerta.actor_type} />
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '10px' }}>
              <strong style={{ color: '#e2e8f0' }}>{alerta.actor_name}</strong> executou{' '}
              <strong style={{ color: COR_ALERT[alerta.status] }}>{alerta.event_count}x</strong>{' '}
              "{alerta.action}" em <strong>{alerta.module}</strong>{' '}
              {alerta.window_seconds > 0 && `em ${alerta.window_seconds}s`}
            </p>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => marcarRevisado(alerta.id)}
                style={{
                  flex: 1, padding: '6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                  background: 'rgba(52,211,153,0.1)', color: '#34d399',
                  border: '1px solid rgba(52,211,153,0.2)', cursor: 'pointer',
                }}
              >
                Revisado
              </button>
              <button
                onClick={async () => {
                  await apiFetch(`/api/admin/historico-global/alerts/${alerta.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'ESCALATED' }),
                  })
                  setAlertas((prev) => prev.filter((a) => a.id !== alerta.id))
                }}
                style={{
                  flex: 1, padding: '6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                  background: 'rgba(248,113,113,0.1)', color: '#f87171',
                  border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer',
                }}
              >
                Escalar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────

export function HistoricoGlobalAdmin() {
  const { t } = useTranslation()
  const { getToken } = useAuth()
  const addNotification = useShellStore((s) => s.addNotification)

  useEffect(() => { setAuthTokenProvider(() => getToken()) }, [getToken])

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [alertasAbertos, setAlertasAbertos] = useState(false)
  const [alertasPendentes, setAlertasPendentes] = useState(0)

  const [filtroAtorType, setFiltroAtorType] = useState<string | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null)
  const [filtroDataRange, setFiltroDataRange] = useState<{ inicio: Date | null; fim: Date | null }>({ inicio: null, fim: null })

  function buildQuery(cursor?: string) {
    const params = new URLSearchParams()
    if (filtroAtorType && filtroAtorType !== 'todos') params.set('actor_type', filtroAtorType)
    if (filtroStatus && filtroStatus !== 'todos') params.set('status', filtroStatus)
    if (filtroDataRange.inicio) params.set('startDate', filtroDataRange.inicio.toISOString())
    if (filtroDataRange.fim) params.set('endDate', filtroDataRange.fim.toISOString())
    if (cursor) params.set('cursor', cursor)
    params.set('limit', '50')
    return params.toString()
  }

  const loadLogs = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setErroCarregar(null)
      const res = await apiFetch(`/api/admin/historico-global/logs?${buildQuery()}`, { signal })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 200)}` : ''}`)
      }
      const result = await res.json()
      setLogs(result.data ?? [])
      setNextCursor(result.meta?.nextCursor ?? null)
    } catch (err) {
      // Ignora AbortError (cleanup do useEffect no StrictMode em dev — evita toast duplicado)
      if (err instanceof DOMException && err.name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Falha desconhecida'
      setErroCarregar(msg)
      addNotification({ type: 'error', message: `Falha ao carregar histórico: ${msg}` })
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroAtorType, filtroStatus, filtroDataRange])

  useEffect(() => {
    const ctrl = new AbortController()
    void loadLogs(ctrl.signal)
    return () => ctrl.abort()
  }, [loadLogs])

  // Polling de alertas pendentes a cada 30s (além do carregamento inicial)
  useEffect(() => {
    const fetchAlertas = () => {
      apiFetch('/api/admin/historico-global/alerts?status=PENDING&limit=1')
        .then((r) => r.json())
        .then((d) => setAlertasPendentes(d.data?.length ?? 0))
        .catch(() => { /* silencioso — indicador não-crítico */ })
    }
    fetchAlertas()
    const interval = setInterval(fetchAlertas, 30_000)
    return () => clearInterval(interval)
  }, [])

  async function carregarMais() {
    if (!nextCursor) return
    setLoadingMore(true)
    try {
      const res = await apiFetch(`/api/admin/historico-global/logs?${buildQuery(nextCursor)}`)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const result = await res.json()
      setLogs((prev) => [...prev, ...(result.data ?? [])])
      setNextCursor(result.meta?.nextCursor ?? null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha desconhecida'
      addNotification({ type: 'error', message: `Falha ao carregar mais logs: ${msg}` })
    } finally {
      setLoadingMore(false)
    }
  }

  async function exportar(format: 'csv' | 'json') {
    try {
      const params = new URLSearchParams()
      if (filtroAtorType && filtroAtorType !== 'todos') params.set('actor_type', filtroAtorType)
      if (filtroStatus && filtroStatus !== 'todos') params.set('status', filtroStatus)
      params.set('format', format)

      const res = await apiFetch(`/api/admin/historico-global/logs/export?${params}`)

      if (res.status === 202) {
        addNotification({ type: 'info', message: 'Exportação em background iniciada. O download estará disponível em breve.' })
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      addNotification({ type: 'error', message: 'Erro ao exportar logs.' })
    }
  }

  // ── Colunas da tabela ──────────────────────────────────────────

  const COLUNAS: TabelaGlobalColuna<AuditLog>[] = [
    {
      key: 'created_at', label: 'Quando', tipo: 'periodo',
      render: (v) => <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{formatDate(v)}</span>
    },
    {
      key: 'actor_name', label: 'Ator', tipo: 'texto',
      render: (v, item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BadgeAtorType tipo={item.actor_type} />
          </div>
          <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.8rem' }}>{v}</span>
        </div>
      )
    },
    {
      key: 'action', label: 'Ação', tipo: 'texto',
      render: (v) => (
        <span style={{
          display: 'inline-flex', padding: '2px 8px', borderRadius: '9999px',
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
          background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)',
        }}>
          {v}
        </span>
      )
    },
    {
      key: 'action_detail', label: 'O que foi feito', tipo: 'texto',
      render: (v, item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.65rem', color: '#94a3b8',
            }}>
              {item.module}/{item.resource_type}
            </span>
          </div>
          <span style={{ color: '#e2e8f0', fontSize: '0.8125rem' }}>{v}</span>
        </div>
      )
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      render: (v) => <BadgeStatus status={v as EventStatus} />
    },
  ]

  // ── Opções de filtro ───────────────────────────────────────────

  const opcoesAtorType = [
    { valor: 'todos', rotulo: 'Todos os atores' },
    { valor: 'USER', rotulo: 'Usuário' },
    { valor: 'AI', rotulo: 'IA / GABI' },
    { valor: 'API', rotulo: 'API Externa' },
    { valor: 'JOB', rotulo: 'Job Interno' },
    { valor: 'INTEGRATION', rotulo: 'Integração' },
  ]

  const opcoesStatus = [
    { valor: 'todos', rotulo: 'Todos os status' },
    { valor: 'SUCCESS', rotulo: 'Sucesso' },
    { valor: 'FAILURE', rotulo: 'Falha' },
    { valor: 'PARTIAL', rotulo: 'Parcial' },
  ]

  return (
    <>
      <PaginaGlobal
        className="ws-fade-up"
        layout="lista"
        cabecalho={
          <CabecalhoGlobal
            icone={<Desktop weight="duotone" size={22} />}
            titulo={t('admin.historico-global.titulo')}
            subtitulo={t('admin.historico-global.subtitulo')}
            acoes={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Botão alertas */}
                <button
                  onClick={() => setAlertasAbertos(true)}
                  aria-label={`Ver alertas pendentes${alertasPendentes > 0 ? ` (${alertasPendentes})` : ''}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                    background: alertasPendentes > 0 ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${alertasPendentes > 0 ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    color: alertasPendentes > 0 ? '#fbbf24' : '#64748b',
                    fontSize: '0.8rem', fontWeight: 600,
                  }}
                >
                  <Warning size={16} weight="duotone" />
                  Alertas
                  {alertasPendentes > 0 && (
                    <span style={{ background: '#fbbf24', color: '#0f172a', borderRadius: '9999px', padding: '1px 6px', fontSize: '0.65rem', fontWeight: 800 }}>
                      {alertasPendentes}
                    </span>
                  )}
                </button>

                <TooltipGlobal titulo="Processamento assíncrono" descricao="Os logs são gravados em fila — pode haver latência de até 1s na exibição.">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px', cursor: 'help' }}>
                    <Info size={18} weight="duotone" color="#3b82f6" />
                  </div>
                </TooltipGlobal>
              </div>
            }
          />
        }
      >
        <div className="ws-fade-up" style={{ display: 'flex', flexDirection: 'column', marginTop: '16px', position: 'relative', zIndex: 10 }}>
          {/* Filtros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginRight: '4px' }}>
              <Funnel size={14} weight="bold" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filtrar</span>
            </div>

            <div style={{ width: '180px' }}>
              <SelectGlobal opcoes={opcoesAtorType} valor={filtroAtorType} aoMudarValor={(v) => setFiltroAtorType(v as string)} placeholder="Tipo de ator" />
            </div>

            <div style={{ width: '180px' }}>
              <SelectGlobal opcoes={opcoesStatus} valor={filtroStatus} aoMudarValor={(v) => setFiltroStatus(v as string)} placeholder="Status" />
            </div>

            <div style={{ width: '240px' }}>
              <CalendarioCampoGlobal
                placeholder="Período"
                valor={filtroDataRange}
                aoMudarValor={(range) => setFiltroDataRange(range)}
              />
            </div>

            <button
              onClick={() => void loadLogs()}
              aria-label="Atualizar lista de logs"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                color: '#818cf8', fontSize: '0.8rem', fontWeight: 600,
              }}
            >
              <ArrowsClockwise size={14} />
              Atualizar
            </button>
          </div>

          {/* Estado de erro — retry inline */}
          {erroCarregar && !loading ? (
            <div
              role="alert"
              style={{
                padding: '2rem 1rem', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px',
                background: 'rgba(248,113,113,0.05)',
              }}
            >
              <div style={{ fontSize: '0.875rem', color: '#f87171', fontWeight: 600 }}>
                Falha ao carregar histórico
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
                {erroCarregar}
              </div>
              <button
                type="button"
                onClick={() => void loadLogs()}
                aria-label="Tentar carregar histórico novamente"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                  color: '#818cf8', fontSize: '0.8rem', fontWeight: 600,
                }}
              >
                <ArrowsClockwise size={14} />
                Tentar novamente
              </button>
            </div>
          ) : (
            <TabelaGlobal<AuditLog>
              id="admin-historico-global"
              dados={logs}
              colunas={COLUNAS}
              mensagemVazio={loading ? 'Carregando...' : 'Nenhum log encontrado com os filtros aplicados.'}
              mensagemSemFiltro="Nenhum log encontrado."
              tooltipBusca="Buscar por ação, ator ou recurso"
              tooltipExpandir="Ver antes/depois e detalhes"
              tooltipRecolher="Recolher detalhes"
              renderExpandido={(item) => <DetalheLog log={item} />}
              acoesExportacao={[
                { label: 'CSV',  icone: <FileCsv size={14} weight="bold" />,  onClick: () => void exportar('csv') },
                { label: 'JSON', icone: <FileCode size={14} weight="bold" />, onClick: () => void exportar('json') },
              ] as TabelaExportAcao<AuditLog>[]}
            />
          )}

          {/* Carregar mais */}
          {nextCursor && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <button
                onClick={carregarMais}
                disabled={loadingMore}
                aria-label={loadingMore ? 'Carregando mais logs' : 'Carregar mais logs'}
                style={{
                  padding: '8px 24px', borderRadius: '8px', cursor: loadingMore ? 'not-allowed' : 'pointer',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600,
                  opacity: loadingMore ? 0.6 : 1,
                }}
              >
                {loadingMore ? 'Carregando...' : 'Carregar mais'}
              </button>
            </div>
          )}
        </div>
      </PaginaGlobal>

      {/* Painel lateral de alertas */}
      {alertasAbertos && <PainelAlertas onClose={() => setAlertasAbertos(false)} />}
    </>
  )
}
