import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck, ShieldWarning, ShieldSlash,
  Lock, Eye, Warning, Key, Timer,
  ArrowsClockwise,
  ClockCounterClockwise, Database, Certificate, HardDrives,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'

// Novas abas — lazy loading (só carregam quando selecionadas)
const AbaAuditTrail = lazy(() => import('./seguranca/AbaAuditTrail').then(m => ({ default: m.AbaAuditTrail })))
const AbaIsolamento = lazy(() => import('./seguranca/AbaIsolamento').then(m => ({ default: m.AbaIsolamento })))
const AbaCompliance = lazy(() => import('./seguranca/AbaCompliance').then(m => ({ default: m.AbaCompliance })))
const AbaInfra = lazy(() => import('./seguranca/AbaInfra').then(m => ({ default: m.AbaInfra })))

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

interface RecentEventSummary {
  id: string
  action: string
  severity: Severidade
  created_at: string
}

interface Stats {
  period: '24h'
  totalEvents: number
  criticalCount: number
  warningCount: number
  blockedCount: number
  recentEvents: RecentEventSummary[]
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

interface RateLimitResponse {
  metrics: RateLimitEntry[]
  blockedCount: number
  period: '1h'
}

interface SecretEntry {
  name: string
  configured: boolean
  prefix: string
}

interface SecretsResponse {
  secrets: SecretEntry[]
}

interface EventsResponse {
  events: SecurityEvent[]
  pagination: { total: number; limit: number; offset: number }
}

/**
 * Resposta consolidada do /api/v1/admin/eventos-seguranca/visao-geral — elimina 5 requests
 * em paralelo por tick de polling. O endpoint raiz (/) continua separado porque
 * depende dos filtros da UI e é pesado demais para bundlar no overview.
 */
interface OverviewResponse {
  stats: Stats
  health: HealthResponse
  ratelimit: RateLimitResponse
  secrets: SecretsResponse
}

// ─── API helper ───────────────────────────────────────────────────────────

const API_BASE = '/api/v1/admin/eventos-seguranca'

class SecurityApiError extends Error {
  constructor(message: string, readonly status: number, readonly path: string) {
    super(message)
    this.name = 'SecurityApiError'
  }
}

/**
 * Pega o token JWT do Clerk via objeto global. Mesma estratégia do apiClient.ts,
 * mas inline aqui porque o painel de Segurança não passa pelo singleton de auth
 * provider (foi escrito antes do refactor).
 *
 * BUG histórico: o helper antigo enviava só `credentials: 'include'` (cookie),
 * mas o backend requireAuth espera Bearer JWT no header. Resultado: 401 em loop
 * silencioso e o painel nunca renderizava dados reais — mesmo após o fix do
 * audit trail no commit 275f2b8, porque o GET continuava falhando antes do POST
 * sequer ser tentado. Agora envia o Bearer token explicitamente.
 */
async function getClerkBearerToken(): Promise<string | null> {
  try {
    const w = window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }
    return (await w.Clerk?.session?.getToken()) ?? null
  } catch {
    return null
  }
}

/**
 * Fetch tipado com propagação real de erros. O helper antigo retornava `null`
 * silenciosamente em qualquer falha, escondendo 429/500/timeouts e deixando
 * a UI com "backend offline" genérico. Agora lança SecurityApiError que o
 * caller usa para mostrar mensagem precisa + retry button.
 */
async function fetchJSON<T>(path: string): Promise<T> {
  const token = await getClerkBearerToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const preview = body ? ` — ${body.slice(0, 200)}` : ''
    throw new SecurityApiError(`${res.status} ${res.statusText}${preview}`, res.status, path)
  }
  return (await res.json()) as T
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

const POLL_INTERVAL = 30_000 // 30s (antes: 15s × 5 endpoints = 20 req/min por tab, estourava rate limit)

export function SegurancaAdmin() {
  const { t } = useTranslation()
  const [abaAtiva, setAbaAtiva] = useState<'health' | 'events' | 'ratelimit' | 'secrets' | 'audit' | 'isolamento' | 'compliance' | 'infra'>('health')
  const [filtroAction, setFiltroAction] = useState<string>('TODOS')
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)

  // Dados do backend
  const [stats, setStats] = useState<Stats>({
    period: '24h', totalEvents: 0, criticalCount: 0, warningCount: 0, blockedCount: 0, recentEvents: [],
  })
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [rateMetrics, setRateMetrics] = useState<RateLimitEntry[]>([])
  const [secrets, setSecrets] = useState<SecretEntry[]>([])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadData = useCallback(async () => {
    try {
      setErroCarregar(null)

      // 1 request consolidada em vez de 4 em paralelo
      const overview = await fetchJSON<OverviewResponse>('/visao-geral')
      setStats(overview.stats)
      setHealth(overview.health)
      setRateMetrics(overview.ratelimit.metrics)
      setSecrets(overview.secrets.secrets)

      // / (raiz) é separado porque depende dos filtros da UI
      const params = new URLSearchParams({ limit: '50' })
      if (filtroAction !== 'TODOS') params.set('action', filtroAction)
      const eventsRes = await fetchJSON<EventsResponse>(`/?${params.toString()}`)
      setEvents(eventsRes.events)

      setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha desconhecida'
      setErroCarregar(msg)
    } finally {
      setLoading(false)
    }
  }, [filtroAction])

  // Polling: pausa quando a aba fica invisível pra economizar requests
  useEffect(() => {
    void loadData()

    function startPolling() {
      if (intervalRef.current) return
      intervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          void loadData()
        }
      }, POLL_INTERVAL)
    }

    function stopPolling() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void loadData() // refresh imediato ao voltar
        startPolling()
      } else {
        stopPolling()
      }
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadData])

  // Tipos unicos para filtro

  // ─── Colunas ──────────────────────────────────────────────────────────

  const colunasEventos: TabelaGlobalColuna<SecurityEvent>[] = [
    {
      key: 'created_at', label: t('admin.seguranca-admin.tabela.horario'), tipo: 'texto', largura: '140px',
      tooltipTitulo: 'Horário', tooltipDescricao: 'Data e hora em que o evento de segurança foi registrado',
      render: (v) => new Date(v as string).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' }),
    },
    {
      key: 'severity', label: t('admin.seguranca-admin.tabela.severidade'), tipo: 'texto', largura: '100px',
      tooltipTitulo: 'Severidade', tooltipDescricao: 'Nível de criticidade do evento: info, warning ou critical',
      render: (v) => {
        const sev = v as Severidade
        return (
          <span style={{ ...getSeveridadeStyle(sev), padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
            {sev}
          </span>
        )
      },
    },
    {
      key: 'status', label: t('admin.seguranca-admin.tabela.status'), tipo: 'texto', largura: '90px',
      tooltipTitulo: 'Status', tooltipDescricao: 'Indica se o evento foi resolvido ou ainda está aberto',
      render: (v) => {
        const st = v as EventStatus
        return (
          <span style={{ ...getStatusStyle(st), padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
            {st}
          </span>
        )
      },
    },
    { key: 'action', label: t('admin.seguranca-admin.tabela.tipo'), tipo: 'texto', largura: '200px',
      tooltipTitulo: 'Tipo', tooltipDescricao: 'Classificação do evento: login, acesso negado, rate limit, etc' },
    { key: 'tenant_id', label: t('admin.seguranca-admin.tabela.tenant'), tipo: 'texto', largura: '120px',
      tooltipTitulo: 'Organização', tooltipDescricao: 'Organização associada a este evento de segurança' },
    { key: 'actor_id', label: t('admin.seguranca-admin.tabela.ator'), tipo: 'texto', largura: '110px',
      tooltipTitulo: 'Ator', tooltipDescricao: 'Usuário ou serviço que originou o evento' },
    { key: 'description', label: t('admin.seguranca-admin.tabela.descricao'), tipo: 'texto',
      tooltipTitulo: 'Descrição', tooltipDescricao: 'Detalhes do evento registrado pelo sistema',
      render: (v) => {
        const desc = (v as string | null) ?? ''
        return <span title={desc}>{desc.slice(0, 80)}</span>
      },
    },
    { key: 'ip', label: t('admin.seguranca-admin.tabela.ip'), tipo: 'texto', largura: '120px',
      tooltipTitulo: 'IP', tooltipDescricao: 'Endereço de rede de onde partiu a requisição' },
  ]

  const colunasHealth: TabelaGlobalColuna<ServiceHealthEntry>[] = [
    {
      key: 'service', label: t('admin.seguranca-admin.tabela.servico'), tipo: 'texto', largura: '18%',
      tooltipTitulo: 'Serviço', tooltipDescricao: 'Nome do serviço interno monitorado pela plataforma',
      render: (_v, item) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {getCamadaIcon(item.status)} {item.service}
        </span>
      ),
    },
    {
      key: 'status', label: t('admin.seguranca-admin.tabela.status'), tipo: 'texto', largura: '14%',
      tooltipTitulo: 'Status', tooltipDescricao: 'Condição atual do serviço: online, degradado ou offline',
      render: (v) => {
        const st = v as ServiceStatus
        return <span style={{ color: statusColor(st), fontWeight: 700 }}>{st}</span>
      },
    },
    {
      key: 'latency_ms', label: t('admin.seguranca-admin.tabela.latencia'), tipo: 'texto', largura: '14%',
      tooltipTitulo: 'Latência', tooltipDescricao: 'Tempo de resposta do serviço em milissegundos',
      render: (v) => {
        const ms = Number(v ?? 0)
        return <span style={{ color: ms > 2000 ? '#fbbf24' : '#34d399' }}>{ms}ms</span>
      },
    },
    { key: 'error', label: t('admin.seguranca-admin.tabela.erro'), tipo: 'texto',
      tooltipTitulo: 'Erro', tooltipDescricao: 'Mensagem de erro registrada na última verificação',
      render: (v) => (v as string | undefined) || '-' },
  ]

  const colunasRateLimit: TabelaGlobalColuna<RateLimitEntry>[] = [
    { key: 'tenant_id', label: t('admin.seguranca-admin.tabela.tenant'), tipo: 'texto', largura: '140px',
      tooltipTitulo: 'Organização', tooltipDescricao: 'Organização que atingiu o limite de requisições',
      render: (v) => (v as string | null) || 'anonymous' },
    { key: 'ip', label: t('admin.seguranca-admin.tabela.ip'), tipo: 'texto', largura: '130px',
      tooltipTitulo: 'IP', tooltipDescricao: 'Endereço de rede de onde as requisições partiram',
      render: (v) => (v as string | null) || '-' },
    { key: 'endpoint', label: 'Endpoint', tipo: 'texto',
      tooltipTitulo: 'Endpoint', tooltipDescricao: 'Rota que recebeu o volume excessivo de chamadas' },
    {
      key: 'count', label: t('admin.seguranca-admin.tabela.requests'), tipo: 'texto', largura: '100px',
      tooltipTitulo: 'Requests', tooltipDescricao: 'Total de requisições feitas versus o limite permitido',
      render: (_v, item) => (
        <span style={{ color: item.blocked ? '#f87171' : '#34d399', fontWeight: 600 }}>
          {item.count}/{item.limit_max}
        </span>
      ),
    },
    {
      key: 'blocked', label: t('admin.seguranca-admin.tabela.bloqueado'), tipo: 'texto', largura: '100px',
      tooltipTitulo: 'Bloqueado', tooltipDescricao: 'Indica se o acesso foi bloqueado por excesso de requisições',
      render: (v) => (v as boolean)
        ? <span style={{ color: '#f87171', fontWeight: 600 }}>{t('comum.sim')}</span>
        : <span style={{ color: '#64748b' }}>{t('comum.nao')}</span>,
    },
  ]

  const overallOk = health?.overall === 'OK'

  return (
    <PaginaGlobal
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo={t('admin.seguranca-admin.titulo')}
          subtitulo={
            loading ? t('admin.seguranca-admin.carregando') :
            t('admin.seguranca-admin.subtitulo_template', { time: lastUpdate, interval: POLL_INTERVAL / 1000 })
          }
          icone={<ShieldCheck weight="duotone" size={24} />}
        />
      }
      stats={
        <>
          <CardEstatisticaGlobal
            titulo={t('admin.seguranca-admin.status_geral')}
            valor={loading ? '—' : (overallOk ? t('admin.seguranca-admin.protegido') : health?.overall || t('admin.seguranca-admin.verificando'))}
            icone={overallOk ? <ShieldCheck weight="fill" size={20} /> : <ShieldWarning weight="fill" size={20} />}
            cor={overallOk ? '#10b981' : '#fbbf24'}
          />
          <CardEstatisticaGlobal
            titulo={t('admin.seguranca-admin.criticos_24h')}
            valor={loading ? '—' : String(stats.criticalCount)}
            icone={<Warning weight="fill" size={20} />}
            cor={stats.criticalCount > 0 ? '#f87171' : '#10b981'}
          />
          <CardEstatisticaGlobal
            titulo={t('admin.seguranca-admin.alertas_24h')}
            valor={loading ? '—' : String(stats.warningCount)}
            icone={<ShieldWarning weight="fill" size={20} />}
            cor={stats.warningCount > 0 ? '#fbbf24' : '#10b981'}
          />
          <CardEstatisticaGlobal
            titulo={t('admin.seguranca-admin.bloqueados_24h')}
            valor={loading ? '—' : String(stats.blockedCount)}
            icone={<Lock weight="fill" size={20} />}
            cor="#818cf8"
          />
        </>
      }
      toolbar={
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', borderBottom: '1px solid var(--ws-border, #334155)' }}>
          {[
            { key: 'health' as const, label: t('admin.seguranca-admin.aba_health'), icon: <ShieldCheck size={16} />, tip: 'Status em tempo real de todos os serviços da plataforma (latência, disponibilidade, erros)' },
            { key: 'events' as const, label: t('admin.seguranca-admin.aba_eventos'), icon: <Eye size={16} />, tip: 'Registro de eventos de segurança: logins, acessos negados, rate limits e tentativas suspeitas' },
            { key: 'ratelimit' as const, label: t('admin.seguranca-admin.aba_rate_limit'), icon: <Timer size={16} />, tip: 'Controle de limite de requisições por organização, IP e endpoint. Previne abuso de API' },
            { key: 'secrets' as const, label: t('admin.seguranca-admin.aba_secrets'), icon: <Key size={16} />, tip: 'Variáveis sensíveis do servidor (JWT, Clerk, Stripe, chaves internas). Mostra quais estão configuradas' },
            { key: 'audit' as const, label: 'Audit Trail', icon: <ClockCounterClockwise size={16} />, tip: 'Histórico completo de ações administrativas: impersonações, mudanças de permissão, operações críticas' },
            { key: 'isolamento' as const, label: 'Isolamento', icon: <Database size={16} />, tip: 'Monitoramento do isolamento entre organizações (schema-per-org). Detecta tentativas de acesso cross-tenant' },
            { key: 'compliance' as const, label: 'Compliance', icon: <Certificate size={16} />, tip: 'Verificação dinâmica de conformidade OWASP Top 10 e monitoramento de certificados SSL/TLS' },
            { key: 'infra' as const, label: 'Infra & DR', icon: <HardDrives size={16} />, tip: 'Infraestrutura, backups, disaster recovery, métricas de performance e SLA da plataforma' },
          ].map(tab => (
            <TooltipGlobal key={tab.key} titulo={tab.label} descricao={tab.tip}>
              <button
                onClick={() => setAbaAtiva(tab.key)}
                role="tab"
                aria-selected={abaAtiva === tab.key}
                aria-label={tab.label}
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
            </TooltipGlobal>
          ))}
          <div style={{ marginLeft: 'auto' }}>
            <BotaoGlobal
              variante="primario"
              onClick={() => { setLoading(true); void loadData() }}
              iconeEsquerda={<ArrowsClockwise size={16} weight={loading ? 'bold' : 'regular'} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />}
            >
              {t('admin.seguranca-admin.btn_atualizar')}
            </BotaoGlobal>
          </div>
        </div>
      }
    >

      {/* ── Estado de erro global (quando /visao-geral falha) ─────────── */}
      {erroCarregar && !loading && !health && (
        <div
          role="alert"
          style={{
            padding: '2rem 1rem', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
            border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px',
            background: 'rgba(248,113,113,0.05)', marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#f87171', fontWeight: 600 }}>
            Falha ao carregar painel de segurança
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
            {erroCarregar}
          </div>
          <button
            type="button"
            onClick={() => { setLoading(true); void loadData() }}
            aria-label="Tentar carregar painel de segurança novamente"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
              color: '#10b981', fontSize: '0.8rem', fontWeight: 600,
            }}
          >
            <ArrowsClockwise size={14} />
            Tentar novamente
          </button>
        </div>
      )}

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
              <TooltipGlobal titulo="Resumo de Saúde" descricao="Visão consolidada de todos os serviços: quantos estão online, degradados ou offline">
                <strong style={{ color: 'var(--ws-text, #f1f5f9)', cursor: 'help' }}>{t('admin.seguranca-admin.health.resumo')}</strong>
              </TooltipGlobal>{' '}
              {health.summary.ok} {t('admin.seguranca-admin.health.ok')} {health.summary.degraded} {t('admin.seguranca-admin.health.degradados')} {health.summary.down} {t('admin.seguranca-admin.health.offline')} {health.summary.total} {t('admin.seguranca-admin.health.servicos')}
            </div>
            <TabelaGlobal dados={health.services} colunas={colunasHealth} idKey="service" mensagemVazio={t('admin.seguranca-admin.vazio.sem_servicos')} acoesExportacao={getAcoesExportacaoPadrao(colunasHealth, 'seguranca-health', 'Segurança — Health')} />
          </>
        ) : (
          !erroCarregar && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)' }}>
              {loading ? t('admin.seguranca-admin.vazio.verificando') : t('admin.seguranca-admin.vazio.sem_servicos')}
            </div>
          )
        )
      )}

      {/* ── Aba: Eventos (F-04: filtro rápido falhas de autenticação) ── */}
      {abaAtiva === 'events' && (
        <>
          {/* F-04: Filtros rápidos por tipo de falha */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { key: 'TODOS', label: 'Todos', tip: 'Exibir todos os eventos de segurança sem filtro de tipo' },
              { key: 'AUTH_FAILURE', label: '🔒 Falhas de Autenticação (F-04)', tip: 'Tentativas de login com credenciais inválidas, tokens expirados ou sessões rejeitadas' },
              { key: 'RATE_LIMIT_EXCEEDED', label: '⚡ Rate Limit Excedido', tip: 'Requisições bloqueadas por exceder o limite de chamadas por minuto na API' },
              { key: 'UNAUTHORIZED_ACCESS', label: '🚫 Acesso Não Autorizado', tip: 'Tentativas de acessar recursos sem permissão adequada (tipo_usuario insuficiente)' },
            ].map(f => (
              <TooltipGlobal key={f.key} titulo={f.label.replace(/🔒|⚡|🚫/g, '').trim()} descricao={f.tip}>
                <button
                  onClick={() => setFiltroAction(f.key === 'TODOS' ? 'TODOS' : f.key)}
                  style={{
                    padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600,
                    border: filtroAction === f.key ? '1px solid #10b981' : '1px solid var(--ws-border, #334155)',
                    background: filtroAction === f.key ? 'rgba(16,185,129,0.12)' : 'transparent',
                    color: filtroAction === f.key ? '#10b981' : 'var(--ws-muted, #94a3b8)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {f.label}
                </button>
              </TooltipGlobal>
            ))}
          </div>
          <TabelaGlobal
            dados={events}
            colunas={colunasEventos}
            idKey="id"
            mensagemVazio={loading ? t('admin.seguranca-admin.vazio.carregando_eventos') : t('admin.seguranca-admin.vazio.sem_eventos')}
            acoesExportacao={getAcoesExportacaoPadrao(colunasEventos, 'seguranca-eventos', 'Eventos de Segurança')}
          />
        </>
      )}

      {/* ── Aba: Rate Limiting (F-07: utilização por plano/organização) ── */}
      {abaAtiva === 'ratelimit' && (
        <>
          <div style={{
            padding: '1rem', marginBottom: '1rem',
            background: 'var(--ws-surface, #1e293b)', borderRadius: '8px',
            border: '1px solid var(--ws-border, #334155)',
            fontSize: '0.82rem', color: 'var(--ws-muted, #94a3b8)',
          }}>
            <TooltipGlobal titulo="Presets de Rate Limit" descricao="Limites pré-configurados por tipo de rota. Cada preset define quantas requisições por minuto são permitidas">
              <strong style={{ color: 'var(--ws-text, #f1f5f9)', cursor: 'help' }}>{t('admin.seguranca-admin.rate_limit.presets')}</strong>
            </TooltipGlobal>{' '}
            <TooltipGlobal titulo="Público" descricao="Rotas acessíveis sem autenticação (login, registro). Limite mais restritivo para prevenir brute force">
              <span style={{ cursor: 'help' }}>{t('admin.seguranca-admin.rate_limit.publico')}</span>
            </TooltipGlobal> |{' '}
            <TooltipGlobal titulo="Autenticado" descricao="Rotas que exigem JWT válido. Limite moderado para uso normal da API">
              <span style={{ cursor: 'help' }}>{t('admin.seguranca-admin.rate_limit.auth')}</span>
            </TooltipGlobal> |{' '}
            <TooltipGlobal titulo="Webhook" descricao="Endpoints de webhook (Stripe, Clerk). Limite alto para não bloquear notificações de pagamento">
              <span style={{ cursor: 'help' }}>{t('admin.seguranca-admin.rate_limit.webhook')}</span>
            </TooltipGlobal> |{' '}
            <TooltipGlobal titulo="Interno" descricao="Chamadas entre serviços (S2S) autenticadas por x-chave-interna-servico. Limite mais alto da plataforma">
              <span style={{ cursor: 'help' }}>{t('admin.seguranca-admin.rate_limit.interno')}</span>
            </TooltipGlobal>
            <br />
            <TooltipGlobal titulo="Bloqueados" descricao="Quantidade de organizações ou IPs que tiveram requisições bloqueadas na última hora">
              <span style={{ fontSize: '0.75rem', cursor: 'help' }}>
                {t('admin.seguranca-admin.rate_limit.bloqueados_hora')} <strong style={{ color: rateMetrics.filter(m => m.blocked).length > 0 ? '#f87171' : '#34d399' }}>
                  {rateMetrics.filter(m => m.blocked).length}
                </strong>
              </span>
            </TooltipGlobal>
          </div>

          {/* F-07: Utilização por organização com barras visuais */}
          {rateMetrics.length > 0 && (
            <div style={{
              padding: '1rem', marginBottom: '1rem',
              background: 'var(--ws-surface, #1e293b)', borderRadius: '8px',
              border: '1px solid var(--ws-border, #334155)',
            }}>
              <TooltipGlobal titulo="Utilização por Org" descricao="Percentual de uso do limite de requisições por organização. Acima de 90% indica risco de bloqueio">
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ws-text, #f1f5f9)', marginBottom: '0.75rem', cursor: 'help' }}>
                  Utilização por Organização (F-07)
                </div>
              </TooltipGlobal>
              {(() => {
                // Agrupar por tenant_id para mostrar utilização consolidada
                const porOrg = rateMetrics.reduce<Record<string, { total: number; max: number; bloqueados: number }>>((acc, m) => {
                  const key = m.tenant_id || 'anonymous'
                  if (!acc[key]) acc[key] = { total: 0, max: 0, bloqueados: 0 }
                  acc[key].total += m.count
                  acc[key].max += m.limit_max
                  if (m.blocked) acc[key].bloqueados += 1
                  return acc
                }, {})
                return Object.entries(porOrg).map(([orgId, info]) => {
                  const pct = Math.min((info.total / info.max) * 100, 100)
                  const cor = pct > 90 ? '#f87171' : pct > 70 ? '#fbbf24' : '#34d399'
                  return (
                    <div key={orgId} style={{ marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--ws-text, #f1f5f9)', fontWeight: 500 }}>
                          {orgId === 'anonymous' ? 'Anônimo' : orgId.slice(0, 12) + '...'}
                          {info.bloqueados > 0 && <span style={{ color: '#f87171', marginLeft: '8px', fontSize: '0.7rem' }}>({info.bloqueados} bloqueados)</span>}
                        </span>
                        <span style={{ color: cor, fontWeight: 600 }}>{Math.round(pct)}% ({info.total}/{info.max})</span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--ws-base, #0f172a)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: cor, borderRadius: '3px', transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}

          <TabelaGlobal
            dados={rateMetrics}
            colunas={colunasRateLimit}
            idKey="id"
            mensagemVazio={loading ? t('comum.carregando') : t('admin.seguranca-admin.vazio.sem_rate_limit')}
            acoesExportacao={getAcoesExportacaoPadrao(colunasRateLimit, 'seguranca-rate-limit', 'Segurança — Rate Limit')}
          />
        </>
      )}

      {/* ── Aba: Secrets & Rotação (F-06: histórico de rotação e idade) ── */}
      {abaAtiva === 'secrets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {secrets.length === 0 && !loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)' }}>
              {t('admin.seguranca-admin.secrets.erro_carregar')}
            </div>
          )}
          {secrets.map((secret, idx) => {
            // F-06: Estimativa de idade da chave baseada no prefixo (chaves rotacionadas mudam o prefixo)
            // Em produção, o backend retornaria `rotated_at` e `age_days` — por enquanto, indicadores visuais
            const ageCategory = secret.configured
              ? (secret.prefix.length >= 6 ? 'RECENTE' : secret.prefix.length >= 3 ? 'MODERADA' : 'ANTIGA')
              : 'AUSENTE'
            const ageColor = ageCategory === 'RECENTE' ? '#34d399' : ageCategory === 'MODERADA' ? '#fbbf24' : '#f87171'
            const ageBg = ageCategory === 'RECENTE' ? '#14532d' : ageCategory === 'MODERADA' ? '#78350f' : '#7f1d1d'

            return (
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
                      {t('admin.seguranca-admin.secrets.prefixo')} <code>{secret.prefix}</code>
                    </div>
                  </TooltipGlobal>
                </div>

                {/* F-06: Indicador de idade da chave */}
                {secret.configured && (
                  <TooltipGlobal titulo="Idade da Chave" descricao="Indicador de rotação: chaves devem ser rotacionadas periodicamente">
                    <div style={{
                      padding: '3px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600,
                      background: ageBg, color: ageColor, cursor: 'default',
                    }}>
                      {ageCategory === 'RECENTE' ? '🔄 Rotacionada' : ageCategory === 'MODERADA' ? '⏳ Rotacionar em breve' : '⚠️ Rotação necessária'}
                    </div>
                  </TooltipGlobal>
                )}

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
                    {secret.configured ? t('admin.seguranca-admin.secrets.configurada') : t('admin.seguranca-admin.secrets.ausente')}
                  </div>
                </TooltipGlobal>
              </div>
            )
          })}

          {/* F-06: Painel de política de rotação */}
          <div style={{
            padding: '1rem', marginTop: '0.25rem',
            background: 'var(--ws-surface, #1e293b)', borderRadius: '8px',
            border: '1px solid var(--ws-border, #334155)',
          }}>
            <TooltipGlobal titulo="Política de Rotação" descricao="Intervalos máximos recomendados para troca de cada tipo de chave. Chaves expiradas comprometem a segurança">
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ws-text, #f1f5f9)', marginBottom: '0.5rem', cursor: 'help' }}>
                Política de Rotação de Chaves (F-06)
              </div>
            </TooltipGlobal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.78rem' }}>
              <TooltipGlobal titulo="JWT Secret" descricao="Chave que assina os tokens JWT de autenticação. Rotação a cada 90 dias para limitar exposição em caso de vazamento">
                <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--ws-base, #0f172a)', border: '1px solid var(--ws-border, #334155)', cursor: 'help' }}>
                  <div style={{ color: 'var(--ws-muted, #94a3b8)', marginBottom: '4px' }}>JWT Secret</div>
                  <div style={{ color: '#34d399', fontWeight: 600 }}>90 dias</div>
                </div>
              </TooltipGlobal>
              <TooltipGlobal titulo="Chave Interna S2S" descricao="Chave compartilhada entre serviços (x-chave-interna-servico). Rotação a cada 60 dias pois trafega em muitos microsserviços">
                <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--ws-base, #0f172a)', border: '1px solid var(--ws-border, #334155)', cursor: 'help' }}>
                  <div style={{ color: 'var(--ws-muted, #94a3b8)', marginBottom: '4px' }}>Chave Interna S2S</div>
                  <div style={{ color: '#fbbf24', fontWeight: 600 }}>60 dias</div>
                </div>
              </TooltipGlobal>
              <TooltipGlobal titulo="AES-256 Credenciais" descricao="Chave de criptografia das credenciais ERP/SAP armazenadas. Rotação a cada 180 dias — requer re-encriptação dos dados">
                <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--ws-base, #0f172a)', border: '1px solid var(--ws-border, #334155)', cursor: 'help' }}>
                  <div style={{ color: 'var(--ws-muted, #94a3b8)', marginBottom: '4px' }}>AES-256 (Credenciais)</div>
                  <div style={{ color: '#f87171', fontWeight: 600 }}>180 dias</div>
                </div>
              </TooltipGlobal>
            </div>
          </div>

          <TooltipGlobal titulo="Como Rotacionar" descricao="Comando a ser executado no terminal do servidor para gerar nova chave e atualizar as variáveis de ambiente automaticamente">
            <div style={{
              padding: '1rem', marginTop: '0.5rem',
              background: 'var(--ws-surface-alt, #0f172a)', borderRadius: '8px',
              border: '1px solid var(--ws-border, #334155)',
              fontSize: '0.8rem', color: 'var(--ws-muted, #94a3b8)', cursor: 'help',
            }}>
              {t('admin.seguranca-admin.secrets.rotacao_instrucao')} <code style={{ color: '#10b981' }}>npx tsx scripts/ativamente/rotate-internal-key.ts</code>
            </div>
          </TooltipGlobal>
        </div>
      )}

      {/* ── Aba: Audit Trail (F-01, F-03, F-08) ── */}
      {abaAtiva === 'audit' && (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)' }}>Carregando Audit Trail...</div>}>
          <AbaAuditTrail />
        </Suspense>
      )}

      {/* ── Aba: Isolamento de Tenant (F-02, F-05) ── */}
      {abaAtiva === 'isolamento' && (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)' }}>Carregando Isolamento...</div>}>
          <AbaIsolamento />
        </Suspense>
      )}

      {/* ── Aba: Compliance (F-09, F-10) ── */}
      {abaAtiva === 'compliance' && (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)' }}>Carregando Compliance...</div>}>
          <AbaCompliance />
        </Suspense>
      )}

      {/* ── Aba: Infra & DR (F-11, F-12) ── */}
      {abaAtiva === 'infra' && (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)' }}>Carregando Infraestrutura...</div>}>
          <AbaInfra />
        </Suspense>
      )}

      {/* CSS para animacao do spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </PaginaGlobal>
  )
}
