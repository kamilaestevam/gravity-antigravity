import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
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
import { TooltipGlobal } from '@nucleo/tooltip-global'

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
  const { t } = useTranslation()
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
      key: 'created_at', label: t('admin.security.tabela.horario'), width: '140px',
      tooltipTitulo: 'Horário', tooltipDescricao: 'Data e hora em que o evento de segurança foi registrado',
      render: (row) => new Date(row.created_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' }),
    },
    {
      key: 'severity', label: t('admin.security.tabela.severidade'), width: '100px',
      tooltipTitulo: 'Severidade', tooltipDescricao: 'Nível de criticidade do evento: info, warning ou critical',
      render: (row) => (
        <span style={{ ...getSeveridadeStyle(row.severity), padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
          {row.severity}
        </span>
      ),
    },
    {
      key: 'status', label: t('admin.security.tabela.status'), width: '90px',
      tooltipTitulo: 'Status', tooltipDescricao: 'Indica se o evento foi resolvido ou ainda está aberto',
      render: (row) => (
        <span style={{ ...getStatusStyle(row.status), padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
          {row.status}
        </span>
      ),
    },
    { key: 'action', label: t('admin.security.tabela.tipo'), width: '200px',
      tooltipTitulo: 'Tipo', tooltipDescricao: 'Classificação do evento: login, acesso negado, rate limit, etc' },
    { key: 'tenant_id', label: t('admin.security.tabela.tenant'), width: '120px',
      tooltipTitulo: 'Tenant', tooltipDescricao: 'Empresa associada a este evento de segurança' },
    { key: 'actor_id', label: t('admin.security.tabela.ator'), width: '110px',
      tooltipTitulo: 'Ator', tooltipDescricao: 'Usuário ou serviço que originou o evento' },
    { key: 'description', label: t('admin.security.tabela.descricao'),
      tooltipTitulo: 'Descrição', tooltipDescricao: 'Detalhes do evento registrado pelo sistema',
      render: (row) => <span title={row.description || ''}>{(row.description || '').slice(0, 80)}</span> },
    { key: 'ip', label: t('admin.security.tabela.ip'), width: '120px',
      tooltipTitulo: 'IP', tooltipDescricao: 'Endereço de rede de onde partiu a requisição' },
  ]

  const colunasHealth: TabelaGlobalColuna<ServiceHealthEntry>[] = [
    {
      key: 'service', label: t('admin.security.tabela.servico'), width: '180px',
      tooltipTitulo: 'Serviço', tooltipDescricao: 'Nome do serviço interno monitorado pela plataforma',
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {getCamadaIcon(row.status)} {row.service}
        </span>
      ),
    },
    {
      key: 'status', label: t('admin.security.tabela.status'), width: '100px',
      tooltipTitulo: 'Status', tooltipDescricao: 'Condição atual do serviço: online, degradado ou offline',
      render: (row) => <span style={{ color: statusColor(row.status), fontWeight: 700 }}>{row.status}</span>,
    },
    {
      key: 'latency_ms', label: t('admin.security.tabela.latencia'), width: '100px',
      tooltipTitulo: 'Latência', tooltipDescricao: 'Tempo de resposta do serviço em milissegundos',
      render: (row) => <span style={{ color: row.latency_ms > 2000 ? '#fbbf24' : '#34d399' }}>{row.latency_ms}ms</span>,
    },
    { key: 'error', label: t('admin.security.tabela.erro'),
      tooltipTitulo: 'Erro', tooltipDescricao: 'Mensagem de erro registrada na última verificação',
      render: (row) => row.error || '-' },
  ]

  const colunasRateLimit: TabelaGlobalColuna<RateLimitEntry>[] = [
    { key: 'tenant_id', label: t('admin.security.tabela.tenant'), width: '140px',
      tooltipTitulo: 'Tenant', tooltipDescricao: 'Empresa que atingiu o limite de requisições',
      render: (row) => row.tenant_id || 'anonymous' },
    { key: 'ip', label: t('admin.security.tabela.ip'), width: '130px',
      tooltipTitulo: 'IP', tooltipDescricao: 'Endereço de rede de onde as requisições partiram',
      render: (row) => row.ip || '-' },
    { key: 'endpoint', label: 'Endpoint',
      tooltipTitulo: 'Endpoint', tooltipDescricao: 'Rota que recebeu o volume excessivo de chamadas' },
    {
      key: 'count', label: t('admin.security.tabela.requests'), width: '100px',
      tooltipTitulo: 'Requests', tooltipDescricao: 'Total de requisições feitas versus o limite permitido',
      render: (row) => (
        <span style={{ color: row.blocked ? '#f87171' : '#34d399', fontWeight: 600 }}>
          {row.count}/{row.limit_max}
        </span>
      ),
    },
    {
      key: 'blocked', label: t('admin.security.tabela.bloqueado'), width: '100px',
      tooltipTitulo: 'Bloqueado', tooltipDescricao: 'Indica se o acesso foi bloqueado por excesso de requisições',
      render: (row) => row.blocked
        ? <span style={{ color: '#f87171', fontWeight: 600 }}>{t('comum.sim')}</span>
        : <span style={{ color: '#64748b' }}>{t('comum.nao')}</span>,
    },
  ]

  const overallOk = health?.overall === 'OK'

  return (
    <PaginaGlobal>
      <CabecalhoGlobal
        titulo={t('admin.security.titulo')}
        subtitulo={
          loading ? t('admin.security.carregando') :
          t('admin.security.subtitulo_template', { time: lastUpdate, interval: POLL_INTERVAL / 1000 })
        }
        icone={<ShieldCheck weight="duotone" size={24} />}
      />

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCardGlobal
          titulo={t('admin.security.status_geral')}
          valor={loading ? '...' : (overallOk ? t('admin.security.protegido') : health?.overall || t('admin.security.verificando'))}
          icone={overallOk ? <ShieldCheck weight="fill" size={22} /> : <ShieldWarning weight="fill" size={22} />}
          cor={overallOk ? '#10b981' : '#f59e0b'}
        />
        <StatCardGlobal
          titulo={t('admin.security.criticos_24h')}
          valor={String(stats.criticalCount)}
          icone={<Warning weight="fill" size={22} />}
          cor={stats.criticalCount > 0 ? '#ef4444' : '#10b981'}
        />
        <StatCardGlobal
          titulo={t('admin.security.alertas_24h')}
          valor={String(stats.warningCount)}
          icone={<ShieldWarning weight="fill" size={22} />}
          cor={stats.warningCount > 0 ? '#f59e0b' : '#10b981'}
        />
        <StatCardGlobal
          titulo={t('admin.security.bloqueados_24h')}
          valor={String(stats.blockedCount)}
          icone={<Lock weight="fill" size={22} />}
          cor="#6366f1"
        />
      </div>

      {/* ── Abas ── */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--ws-border, #334155)' }}>
        {[
          { key: 'health' as const, label: t('admin.security.aba_health'), icon: <ShieldCheck size={16} /> },
          { key: 'events' as const, label: t('admin.security.aba_eventos'), icon: <Eye size={16} /> },
          { key: 'ratelimit' as const, label: t('admin.security.aba_rate_limit'), icon: <Timer size={16} /> },
          { key: 'secrets' as const, label: t('admin.security.aba_secrets'), icon: <Key size={16} /> },
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
          {t('admin.security.btn_atualizar')}
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
              <strong style={{ color: 'var(--ws-text, #f1f5f9)' }}>{t('admin.security.health.resumo')}</strong>{' '}
              {health.summary.ok} {t('admin.security.health.ok')} {health.summary.degraded} {t('admin.security.health.degradados')} {health.summary.down} {t('admin.security.health.offline')} {health.summary.total} {t('admin.security.health.servicos')}
            </div>
            <TabelaGlobal dados={health.services} colunas={colunasHealth} keyField="service" mensagemVazio={t('admin.security.vazio.sem_servicos')} />
          </>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)' }}>
            {loading ? t('admin.security.vazio.verificando') : `${t('admin.security.vazio.erro_health')} ${t('admin.security.vazio.backend_offline')}`}
          </div>
        )
      )}

      {/* ── Aba: Eventos ── */}
      {abaAtiva === 'events' && (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <SelectGlobal
              label={t('admin.security.filtro.severidade')}
              value={filtroSeveridade}
              onChange={(e) => setFiltroSeveridade(e.target.value)}
              options={[
                { value: 'TODOS', label: t('admin.security.filtro.todas') },
                { value: 'CRITICAL', label: t('admin.security.filtro.critica') },
                { value: 'WARNING', label: t('admin.security.filtro.alerta') },
                { value: 'INFO', label: t('admin.security.filtro.info') },
              ]}
            />
            <SelectGlobal
              label={t('admin.security.filtro.tipo')}
              value={filtroAction}
              onChange={(e) => setFiltroAction(e.target.value)}
              options={actionsUnicos.map(t => ({ value: t, label: t.replace(/_/g, ' ') }))}
            />
          </div>
          <TabelaGlobal
            dados={events}
            colunas={colunasEventos}
            keyField="id"
            mensagemVazio={loading ? t('admin.security.vazio.carregando_eventos') : t('admin.security.vazio.sem_eventos')}
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
            <strong style={{ color: 'var(--ws-text, #f1f5f9)' }}>{t('admin.security.rate_limit.presets')}</strong>{' '}
            {t('admin.security.rate_limit.publico')} | {t('admin.security.rate_limit.auth')} | {t('admin.security.rate_limit.webhook')} | {t('admin.security.rate_limit.interno')}
            <br />
            <span style={{ fontSize: '0.75rem' }}>
              {t('admin.security.rate_limit.bloqueados_hora')} <strong style={{ color: rateMetrics.filter(m => m.blocked).length > 0 ? '#f87171' : '#34d399' }}>
                {rateMetrics.filter(m => m.blocked).length}
              </strong>
            </span>
          </div>
          <TabelaGlobal
            dados={rateMetrics}
            colunas={colunasRateLimit}
            keyField="id"
            mensagemVazio={loading ? t('comum.carregando') : t('admin.security.vazio.sem_rate_limit')}
          />
        </>
      )}

      {/* ── Aba: Secrets & Rotacao ── */}
      {abaAtiva === 'secrets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {secrets.length === 0 && !loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)' }}>
              {t('admin.security.secrets.erro_carregar')}
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
                <TooltipGlobal titulo={secret.name} descricao="Nome da variável de ambiente configurada no servidor">
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ws-text, #f1f5f9)', display: 'inline-block' }}>
                    {secret.name}
                  </div>
                </TooltipGlobal>
                <TooltipGlobal titulo="Prefixo" descricao="Primeiros caracteres do valor configurado, para confirmação">
                  <div style={{ fontSize: '0.75rem', color: 'var(--ws-muted, #94a3b8)', marginTop: '2px', display: 'inline-block' }}>
                    {t('admin.security.secrets.prefixo')} <code>{secret.prefix}</code>
                  </div>
                </TooltipGlobal>
              </div>
              <TooltipGlobal
                titulo={secret.configured ? 'Configurada' : 'Ausente'}
                descricao="Indica se esta variável de ambiente está presente no servidor"
              >
                <div style={{
                  padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                  background: secret.configured ? '#14532d' : '#7f1d1d',
                  color: secret.configured ? '#86efac' : '#fca5a5',
                  cursor: 'default',
                }}>
                  {secret.configured ? t('admin.security.secrets.configurada') : t('admin.security.secrets.ausente')}
                </div>
              </TooltipGlobal>
            </div>
          ))}

          <div style={{
            padding: '1rem', marginTop: '0.5rem',
            background: 'var(--ws-surface-alt, #0f172a)', borderRadius: '8px',
            border: '1px solid var(--ws-border, #334155)',
            fontSize: '0.8rem', color: 'var(--ws-muted, #94a3b8)',
          }}>
            {t('admin.security.secrets.rotacao_instrucao')} <code style={{ color: '#10b981' }}>npx tsx scripts/rotate-internal-key.ts</code>
          </div>
        </div>
      )}

      {/* CSS para animacao do spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </PaginaGlobal>
  )
}
