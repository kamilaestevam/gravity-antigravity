import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  ShieldCheck, ShieldWarning, ShieldSlash,
  Lock, Eye, Warning, Key, Timer,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { StatCardGlobal } from '@nucleo/card-global'
import { SelectGlobal } from '@nucleo/campo-select-global'

// ─── Tipos (espelhados do backend) ────────────────────────────────────────

type Severidade = 'CRITICAL' | 'WARNING' | 'INFO'
type EventStatus = 'BLOCKED' | 'ALLOWED' | 'DETECTED'
type ServiceStatus = 'OK' | 'DEGRADED' | 'DOWN' | 'UNKNOWN'

interface SecurityEvent {
  id: string
  tenant_id: string
  actor_id: string
  actor_type: string
  action: string
  severity: Severidade
  status: EventStatus
  description: string | null
  ip: string | null
  endpoint: string | null
  correlation_id: string | null
  created_at: string
}

interface Stats {
  totalEvents: number
  criticalCount: number
  warningCount: number
  blockedCount: number
}

interface ServiceHealthEntry {
  service: string
  status: ServiceStatus
  latency_ms: number
  error?: string
}

interface HealthResponse {
  overall: ServiceStatus
  services: ServiceHealthEntry[]
  summary: { ok: number; degraded: number; down: number; total: number }
}

interface RateLimitEntry {
  id: string
  key: string
  tenant_id: string | null
  ip: string | null
  endpoint: string
  count: number
  limit_max: number
  blocked: boolean
  created_at: string
}

interface SecretEntry {
  name: string
  configured: boolean
  prefix: string
}

// ─── API helper ───────────────────────────────────────────────────────────

const API_BASE = '/api/admin/security'

async function fetchJSON<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ─── Helpers visuais ──────────────────────────────────────────────────────

function getSeveridadeStyle(sev: Severidade) {
  switch (sev) {
    case 'CRITICAL': return { background: '#991b1b', color: '#fecaca' }
    case 'WARNING': return { background: '#92400e', color: '#fde68a' }
    case 'INFO': return { background: '#1e3a5f', color: '#93c5fd' }
  }
}

function getStatusStyle(status: EventStatus) {
  switch (status) {
    case 'BLOCKED': return { background: '#7f1d1d', color: '#fca5a5' }
    case 'ALLOWED': return { background: '#14532d', color: '#86efac' }
    case 'DETECTED': return { background: '#78350f', color: '#fcd34d' }
  }
}

function getCamadaIcon(status: ServiceStatus) {
  switch (status) {
    case 'OK': return <ShieldCheck weight="fill" size={20} style={{ color: '#34d399' }} />
    case 'DEGRADED': return <ShieldWarning weight="fill" size={20} style={{ color: '#fbbf24' }} />
    case 'DOWN': return <ShieldSlash weight="fill" size={20} style={{ color: '#f87171' }} />
    default: return <ShieldWarning weight="regular" size={20} style={{ color: '#64748b' }} />
  }
}

function statusColor(status: ServiceStatus) {
  switch (status) {
    case 'OK': return '#34d399'
    case 'DEGRADED': return '#fbbf24'
    case 'DOWN': return '#f87171'
    default: return '#64748b'
  }
}

// ─── Componente Principal ─────────────────────────────────────────────────

const POLL_INTERVAL = 15_000 // 15 segundos

export function SegurancaAdmin() {
  const [abaAtiva, setAbaAtiva] = useState<'health' | 'events' | 'ratelimit' | 'secrets'>('health')
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>('TODOS')
  const [filtroAction, setFiltroAction] = useState<string>('TODOS')
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Dados do backend
  const [stats, setStats] = useState<Stats>({ totalEvents: 0, criticalCount: 0, warningCount: 0, blockedCount: 0 })
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [rateMetrics, setRateMetrics] = useState<RateLimitEntry[]>([])
  const [secrets, setSecrets] = useState<SecretEntry[]>([])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadData = useCallback(async () => {
    const [statsRes, eventsRes, healthRes, rateRes, secretsRes] = await Promise.all([
      fetchJSON<any>('/stats'),
      fetchJSON<any>(`/events?limit=50&${filtroSeveridade !== 'TODOS' ? `severity=${filtroSeveridade}` : ''}${filtroAction !== 'TODOS' ? `&action=${filtroAction}` : ''}`),
      fetchJSON<HealthResponse>('/health'),
      fetchJSON<any>('/ratelimit'),
      fetchJSON<any>('/secrets'),
    ])

    if (statsRes) setStats(statsRes)
    if (eventsRes) setEvents(eventsRes.events || [])
    if (healthRes) setHealth(healthRes)
    if (rateRes) setRateMetrics(rateRes.metrics || [])
    if (secretsRes) setSecrets(secretsRes.secrets || [])

    setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
    setLoading(false)
  }, [filtroSeveridade, filtroAction])

  // Polling
  useEffect(() => {
    loadData()
    intervalRef.current = setInterval(loadData, POLL_INTERVAL)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [loadData])

  // Tipos unicos para filtro
  const actionsUnicos = ['TODOS', ...new Set(events.map(e => e.action))]

  // ─── Colunas ──────────────────────────────────────────────────────────

  const colunasEventos: TabelaGlobalColuna<SecurityEvent>[] = [
    {
      key: 'created_at', label: 'Horario', width: '140px',
      render: (row) => new Date(row.created_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' }),
    },
    {
      key: 'severity', label: 'Severidade', width: '100px',
      render: (row) => (
        <span style={{ ...getSeveridadeStyle(row.severity), padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
          {row.severity}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status', width: '90px',
      render: (row) => (
        <span style={{ ...getStatusStyle(row.status), padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
          {row.status}
        </span>
      ),
    },
    { key: 'action', label: 'Tipo', width: '200px' },
    { key: 'tenant_id', label: 'Tenant', width: '120px' },
    { key: 'actor_id', label: 'Ator', width: '110px' },
    { key: 'description', label: 'Descricao', render: (row) => <span title={row.description || ''}>{(row.description || '').slice(0, 80)}</span> },
    { key: 'ip', label: 'IP', width: '120px' },
  ]

  const colunasHealth: TabelaGlobalColuna<ServiceHealthEntry>[] = [
    {
      key: 'service', label: 'Servico', width: '180px',
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {getCamadaIcon(row.status)} {row.service}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status', width: '100px',
      render: (row) => <span style={{ color: statusColor(row.status), fontWeight: 700 }}>{row.status}</span>,
    },
    {
      key: 'latency_ms', label: 'Latencia', width: '100px',
      render: (row) => <span style={{ color: row.latency_ms > 2000 ? '#fbbf24' : '#34d399' }}>{row.latency_ms}ms</span>,
    },
    { key: 'error', label: 'Erro', render: (row) => row.error || '-' },
  ]

  const colunasRateLimit: TabelaGlobalColuna<RateLimitEntry>[] = [
    { key: 'tenant_id', label: 'Tenant', width: '140px', render: (row) => row.tenant_id || 'anonymous' },
    { key: 'ip', label: 'IP', width: '130px', render: (row) => row.ip || '-' },
    { key: 'endpoint', label: 'Endpoint' },
    {
      key: 'count', label: 'Requests', width: '100px',
      render: (row) => (
        <span style={{ color: row.blocked ? '#f87171' : '#34d399', fontWeight: 600 }}>
          {row.count}/{row.limit_max}
        </span>
      ),
    },
    {
      key: 'blocked', label: 'Bloqueado', width: '100px',
      render: (row) => row.blocked
        ? <span style={{ color: '#f87171', fontWeight: 600 }}>SIM</span>
        : <span style={{ color: '#64748b' }}>Nao</span>,
    },
  ]

  const overallOk = health?.overall === 'OK'

  return (
    <PaginaGlobal>
      <CabecalhoGlobal
        titulo="Seguranca"
        subtitulo={
          loading ? 'Carregando...' :
          `Monitoramento em tempo real — atualizado ${lastUpdate} (a cada ${POLL_INTERVAL / 1000}s)`
        }
        icone={<ShieldCheck weight="duotone" size={24} />}
      />

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCardGlobal
          titulo="Status Geral"
          valor={loading ? '...' : (overallOk ? 'PROTEGIDO' : health?.overall || 'VERIFICANDO')}
          icone={overallOk ? <ShieldCheck weight="fill" size={22} /> : <ShieldWarning weight="fill" size={22} />}
          cor={overallOk ? '#10b981' : '#f59e0b'}
        />
        <StatCardGlobal
          titulo="Criticos (24h)"
          valor={String(stats.criticalCount)}
          icone={<Warning weight="fill" size={22} />}
          cor={stats.criticalCount > 0 ? '#ef4444' : '#10b981'}
        />
        <StatCardGlobal
          titulo="Alertas (24h)"
          valor={String(stats.warningCount)}
          icone={<ShieldWarning weight="fill" size={22} />}
          cor={stats.warningCount > 0 ? '#f59e0b' : '#10b981'}
        />
        <StatCardGlobal
          titulo="Bloqueados (24h)"
          valor={String(stats.blockedCount)}
          icone={<Lock weight="fill" size={22} />}
          cor="#6366f1"
        />
      </div>

      {/* ── Abas ── */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--ws-border, #334155)' }}>
        {[
          { key: 'health' as const, label: 'Servicos & Health', icon: <ShieldCheck size={16} /> },
          { key: 'events' as const, label: 'Eventos de Seguranca', icon: <Eye size={16} /> },
          { key: 'ratelimit' as const, label: 'Rate Limiting', icon: <Timer size={16} /> },
          { key: 'secrets' as const, label: 'Secrets & Rotacao', icon: <Key size={16} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setAbaAtiva(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1rem', border: 'none', cursor: 'pointer',
              background: abaAtiva === tab.key ? 'var(--ws-surface, #1e293b)' : 'transparent',
              color: abaAtiva === tab.key ? '#10b981' : 'var(--ws-muted, #94a3b8)',
              borderBottom: abaAtiva === tab.key ? '2px solid #10b981' : '2px solid transparent',
              fontSize: '0.85rem', fontWeight: abaAtiva === tab.key ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}

        {/* Botao refresh manual */}
        <button
          onClick={() => { setLoading(true); loadData() }}
          style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.4rem 0.8rem', border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--ws-muted, #94a3b8)',
            fontSize: '0.78rem',
          }}
        >
          <ArrowsClockwise size={14} weight={loading ? 'bold' : 'regular'} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          Atualizar
        </button>
      </div>

      {/* ── Aba: Servicos & Health ── */}
      {abaAtiva === 'health' && (
        health ? (
          <>
            <div style={{
              padding: '0.75rem 1rem', marginBottom: '1rem',
              background: 'var(--ws-surface, #1e293b)', borderRadius: '8px',
              border: '1px solid var(--ws-border, #334155)',
              fontSize: '0.82rem', color: 'var(--ws-muted, #94a3b8)',
            }}>
              <strong style={{ color: 'var(--ws-text, #f1f5f9)' }}>Resumo:</strong>{' '}
              {health.summary.ok} OK, {health.summary.degraded} degradados, {health.summary.down} offline de {health.summary.total} servicos
            </div>
            <TabelaGlobal dados={health.services} colunas={colunasHealth} keyField="service" mensagemVazio="Nenhum servico encontrado" />
          </>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)' }}>
            {loading ? 'Verificando servicos...' : 'Nao foi possivel carregar o health check. Verifique se o backend esta rodando.'}
          </div>
        )
      )}

      {/* ── Aba: Eventos ── */}
      {abaAtiva === 'events' && (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <SelectGlobal
              label="Severidade"
              value={filtroSeveridade}
              onChange={(e) => setFiltroSeveridade(e.target.value)}
              options={[
                { value: 'TODOS', label: 'Todas' },
                { value: 'CRITICAL', label: 'Critica' },
                { value: 'WARNING', label: 'Alerta' },
                { value: 'INFO', label: 'Info' },
              ]}
            />
            <SelectGlobal
              label="Tipo"
              value={filtroAction}
              onChange={(e) => setFiltroAction(e.target.value)}
              options={actionsUnicos.map(t => ({ value: t, label: t.replace(/_/g, ' ') }))}
            />
          </div>
          <TabelaGlobal
            dados={events}
            colunas={colunasEventos}
            keyField="id"
            mensagemVazio={loading ? 'Carregando eventos...' : 'Nenhum evento de seguranca registrado nas ultimas 24h'}
          />
        </>
      )}

      {/* ── Aba: Rate Limiting ── */}
      {abaAtiva === 'ratelimit' && (
        <>
          <div style={{
            padding: '1rem', marginBottom: '1rem',
            background: 'var(--ws-surface, #1e293b)', borderRadius: '8px',
            border: '1px solid var(--ws-border, #334155)',
            fontSize: '0.82rem', color: 'var(--ws-muted, #94a3b8)',
          }}>
            <strong style={{ color: 'var(--ws-text, #f1f5f9)' }}>Presets ativos:</strong>{' '}
            Publico (30/min) | Auth (10/min) | Webhook (100/min) | Interno (200/min)
            <br />
            <span style={{ fontSize: '0.75rem' }}>
              Bloqueados na ultima hora: <strong style={{ color: rateMetrics.filter(m => m.blocked).length > 0 ? '#f87171' : '#34d399' }}>
                {rateMetrics.filter(m => m.blocked).length}
              </strong>
            </span>
          </div>
          <TabelaGlobal
            dados={rateMetrics}
            colunas={colunasRateLimit}
            keyField="id"
            mensagemVazio={loading ? 'Carregando...' : 'Nenhum rate limit ativo na ultima hora'}
          />
        </>
      )}

      {/* ── Aba: Secrets & Rotacao ── */}
      {abaAtiva === 'secrets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {secrets.length === 0 && !loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)' }}>
              Nao foi possivel carregar status dos secrets.
            </div>
          )}
          {secrets.map((secret, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem',
                background: 'var(--ws-surface, #1e293b)',
                borderRadius: '8px',
                border: `1px solid ${!secret.configured ? '#7f1d1d' : 'var(--ws-border, #334155)'}`,
              }}
            >
              <Key weight="duotone" size={20} style={{ color: secret.configured ? '#10b981' : '#f87171' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ws-text, #f1f5f9)' }}>
                  {secret.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ws-muted, #94a3b8)', marginTop: '2px' }}>
                  Prefixo: <code>{secret.prefix}</code>
                </div>
              </div>
              <div style={{
                padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                background: secret.configured ? '#14532d' : '#7f1d1d',
                color: secret.configured ? '#86efac' : '#fca5a5',
              }}>
                {secret.configured ? 'CONFIGURADA' : 'AUSENTE'}
              </div>
            </div>
          ))}

          <div style={{
            padding: '1rem', marginTop: '0.5rem',
            background: 'var(--ws-surface-alt, #0f172a)', borderRadius: '8px',
            border: '1px solid var(--ws-border, #334155)',
            fontSize: '0.8rem', color: 'var(--ws-muted, #94a3b8)',
          }}>
            Para rotacionar chaves, execute: <code style={{ color: '#10b981' }}>npx tsx scripts/rotate-internal-key.ts</code>
          </div>
        </div>
      )}

      {/* CSS para animacao do spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </PaginaGlobal>
  )
}
