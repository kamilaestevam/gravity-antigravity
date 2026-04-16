import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  PlugsConnected,
  ArrowClockwise,
  Sparkle,
  CurrencyDollar,
  Lightning,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { StatCardGlobal } from '@nucleo/card-global'
import { useShellStore } from '@gravity/shell'

// ─── Tipos do backend api-cockpit ────────────────────────────────────────

/** Resposta do GET /api/admin/cockpit/services */
interface CockpitServiceResponse {
  name: string
  status: 'online' | 'degraded' | 'offline'
  latency: number
  version: string
  lastCheck: string
  type: 'core' | 'product' | 'gateway'
}

interface ServicesPayload {
  services?: CockpitServiceResponse[]
  error?: string
}

/** Resposta do GET /api/admin/cockpit/logs */
interface CockpitLogResponse {
  id: string
  timestamp: string
  data: string
  hora: string
  method: string
  path: string
  endpoint: string
  statusCode: number
  status: string
  duracao: string
  organizacao: string
  produto: string
  metodo: string
}

interface LogsPayload {
  logs?: CockpitLogResponse[]
  pagination?: { page: number; limit: number; total: number; pages: number }
  error?: string
}

/** Resposta do GET /api/admin/api-cockpit/gabi-usage */
interface GabiUsagePayload {
  month?: string
  total_calls?: number
  total_tokens_input?: number
  total_tokens_output?: number
  total_cost_usd?: number
  by_model?: Record<string, { calls: number; tokensIn: number; tokensOut: number; cost: number }>
  by_day?: Record<string, number>
  error?: string
}

// ─── Tipos de display (frontend) ─────────────────────────────────────────

interface ApiService {
  id: string
  produto: string
  organizacao: string
  status: 'Online' | 'Offline' | 'Degradado'
  tipoCobranca: string
  consumoAtual: number
}

interface ApiLog {
  id: string
  data: string
  hora: string
  organizacao: string
  produto: string
  metodo: string
  endpoint: string
  statusCode: number
  duracao: string
}

const POLLING_INTERVAL_MS = 30_000

function mapServiceResponse(s: CockpitServiceResponse): ApiService {
  return {
    id: s.name,
    produto: s.name,
    organizacao: 'Gravity',
    status: s.status === 'online' ? 'Online' : s.status === 'degraded' ? 'Degradado' : 'Offline',
    tipoCobranca: s.type,
    consumoAtual: 0,
  }
}

function mapLogResponse(l: CockpitLogResponse): ApiLog {
  return {
    id: l.id,
    data: l.data,
    hora: l.hora,
    organizacao: l.organizacao,
    produto: l.produto,
    metodo: l.metodo || l.method,
    endpoint: l.endpoint || l.path,
    statusCode: l.statusCode,
    duracao: l.duracao,
  }
}

const fmtUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(n)

const fmtTokens = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function ApiCockpitAdmin() {
  const { t } = useTranslation()
  const addNotification = useShellStore((s) => s.addNotification)
  const [servicos, setServicos] = useState<ApiService[]>([])
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [loading, setLoading] = useState(true)
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)

  // ── GABI usage state ──
  const [gabiUsage, setGabiUsage] = useState<GabiUsagePayload | null>(null)
  const [gabiLoading, setGabiLoading] = useState(true)

  const carregarMonitor = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setErroCarregar(null)
      const [svcRes, logsRes] = await Promise.all([
        fetch('/api/admin/cockpit/services', { credentials: 'include', signal }),
        fetch('/api/admin/cockpit/logs?limit=50', { credentials: 'include', signal }),
      ])

      if (!svcRes.ok) throw new Error(`services ${svcRes.status} ${svcRes.statusText}`)
      if (!logsRes.ok) throw new Error(`logs ${logsRes.status} ${logsRes.statusText}`)

      const svcData: ServicesPayload = await svcRes.json()
      const logsData: LogsPayload = await logsRes.json()

      // Backend retorna `error` no payload mesmo com 200 quando o api-cockpit está down
      if (svcData.error) throw new Error(svcData.error)
      if (logsData.error) throw new Error(logsData.error)

      setServicos((svcData.services ?? []).map(mapServiceResponse))
      setLogs((logsData.logs ?? []).map(mapLogResponse))
    } catch (err) {
      // Ignora AbortError (cleanup do useEffect no StrictMode)
      if (err instanceof DOMException && err.name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Falha desconhecida'
      setErroCarregar(msg)
      addNotification({
        type: 'error',
        message: `Falha ao carregar monitor de infraestrutura: ${msg}`,
      })
    } finally {
      setLoading(false)
    }
  }, [addNotification])

  // ── GABI usage fetcher ──
  const carregarGabiUsage = useCallback(async (signal?: AbortSignal) => {
    try {
      setGabiLoading(true)
      const res = await fetch('/api/admin/api-cockpit/gabi-usage', {
        credentials: 'include',
        signal,
      })
      if (!res.ok) throw new Error(`gabi-usage ${res.status}`)
      const data: GabiUsagePayload = await res.json()
      if (data.error) throw new Error(data.error)
      setGabiUsage(data)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setGabiUsage(null)
    } finally {
      setGabiLoading(false)
    }
  }, [])

  // Carregamento inicial + polling 30s
  useEffect(() => {
    const ctrl = new AbortController()
    void carregarMonitor(ctrl.signal)
    void carregarGabiUsage(ctrl.signal)
    const interval = setInterval(() => {
      void carregarMonitor()
      void carregarGabiUsage()
    }, POLLING_INTERVAL_MS)
    return () => {
      ctrl.abort()
      clearInterval(interval)
    }
  }, [carregarMonitor, carregarGabiUsage])

  // KPIs memoizados — recalcular só quando servicos/logs mudam
  const apisOnline = useMemo(
    () => servicos.filter((s) => s.status === 'Online').length,
    [servicos],
  )
  const totalRequisicoes = useMemo(() => logs.length, [logs])

  // GABI KPIs memoizados
  const gabiCalls = gabiUsage?.total_calls ?? 0
  const gabiCost = gabiUsage?.total_cost_usd ?? 0
  const gabiTokens = (gabiUsage?.total_tokens_input ?? 0) + (gabiUsage?.total_tokens_output ?? 0)

  const colunasInventario: TabelaGlobalColuna<ApiService>[] = [
    {
      key: 'produto', label: t('admin.monitor.tabela.servico'), tipo: 'texto',
      tooltipTitulo: 'Serviço', tooltipDescricao: 'Produto ou integração monitorada pela plataforma',
    },
    {
      key: 'organizacao', label: t('admin.monitor.tabela.organizacao'), tipo: 'texto',
      tooltipTitulo: 'Organização', tooltipDescricao: 'Empresa associada a este serviço',
    },
    {
      key: 'status', label: t('admin.monitor.tabela.status'), tipo: 'texto',
      tooltipTitulo: 'Status', tooltipDescricao: 'Indica se o serviço está operando normalmente',
    },
    {
      key: 'consumoAtual', label: t('admin.monitor.tabela.consumo'), tipo: 'texto',
      tooltipTitulo: 'Consumo', tooltipDescricao: 'Volume de requisições processadas no período atual',
    },
  ]

  const colunasLogs: TabelaGlobalColuna<ApiLog>[] = [
    {
      key: 'data', label: t('admin.monitor.tabela.data'), tipo: 'texto',
      tooltipTitulo: 'Data', tooltipDescricao: 'Data em que a requisição foi registrada',
    },
    {
      key: 'hora', label: t('admin.monitor.tabela.hora'), tipo: 'texto',
      tooltipTitulo: 'Hora', tooltipDescricao: 'Hora exata em que a requisição ocorreu',
    },
    {
      key: 'organizacao', label: t('admin.monitor.tabela.org'), tipo: 'texto',
      tooltipTitulo: 'Organização', tooltipDescricao: 'Empresa que originou esta chamada à API',
    },
    {
      key: 'metodo', label: t('admin.monitor.tabela.metodo'), tipo: 'texto',
      tooltipTitulo: 'Método', tooltipDescricao: 'Verbo HTTP da requisição: GET, POST, PUT ou DELETE',
    },
    {
      key: 'endpoint', label: t('admin.monitor.tabela.endpoint'), tipo: 'texto',
      tooltipTitulo: 'Endpoint', tooltipDescricao: 'Rota da API que recebeu a chamada',
    },
    {
      key: 'statusCode', label: t('admin.monitor.tabela.status'), tipo: 'texto',
      tooltipTitulo: 'Status', tooltipDescricao: 'Código de resposta HTTP — abaixo de 400 indica sucesso',
    },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          icone={<PlugsConnected weight="duotone" size={24} />}
          titulo={t('admin.monitor.titulo')}
          subtitulo={t('admin.monitor.subtitulo')}
        />
      }
      stats={
        <>
          <StatCardGlobal
            titulo={t('admin.monitor.apis_online')}
            valor={String(apisOnline)}
            variante="sucesso"
          />
          <StatCardGlobal
            titulo={t('admin.monitor.requisicoes_24h')}
            valor={String(totalRequisicoes)}
            variante="primario"
          />
          <StatCardGlobal
            titulo="GABI IA · Chamadas"
            valor={gabiLoading ? '…' : String(gabiCalls)}
            variante="primario"
          />
          <StatCardGlobal
            titulo="GABI IA · Custo Mês"
            valor={gabiLoading ? '…' : fmtUSD(gabiCost)}
            variante="aviso"
          />
        </>
      }
      toolbar={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <BotaoGlobal
            variante="secundario"
            onClick={() => { void carregarMonitor(); void carregarGabiUsage() }}
            icone={<ArrowClockwise size={16} />}
            aria-label="Atualizar monitor de infraestrutura"
          >
            Atualizar
          </BotaoGlobal>
        </div>
      }
    >
      {erroCarregar && !loading ? (
        <div
          role="alert"
          style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: '8px',
            background: 'rgba(248,113,113,0.05)',
            marginTop: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#f87171', fontWeight: 600 }}>
            Falha ao carregar monitor de infraestrutura
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
            {erroCarregar}
          </div>
          <BotaoGlobal
            variante="secundario"
            onClick={() => void carregarMonitor()}
            icone={<ArrowClockwise size={16} />}
            aria-label="Tentar carregar monitor novamente"
          >
            Tentar novamente
          </BotaoGlobal>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
          {/* ── GABI IA Usage Panel ── */}
          {gabiUsage && !gabiLoading && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                padding: '1.25rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(124,58,237,0.04) 100%)',
                border: '1px solid rgba(129,140,248,0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: '1 / -1', marginBottom: '0.25rem' }}>
                <Sparkle weight="fill" size={16} style={{ color: '#818cf8' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#818cf8', letterSpacing: '-0.01em' }}>
                  GABI IA · Consumo do Mês ({gabiUsage.month})
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Chamadas à LLM
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ws-text)' }}>
                  <Lightning size={14} weight="fill" style={{ color: '#818cf8', marginRight: '0.25rem' }} />
                  {gabiCalls}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Tokens (in + out)
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ws-text)' }}>
                  {fmtTokens(gabiTokens)}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Custo Total (USD)
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ws-text)' }}>
                  <CurrencyDollar size={14} weight="fill" style={{ color: '#f59e0b', marginRight: '0.25rem' }} />
                  {fmtUSD(gabiCost)}
                </span>
              </div>

              {gabiUsage.by_model && Object.keys(gabiUsage.by_model).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Por Modelo
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                    {Object.entries(gabiUsage.by_model).map(([model, stats]) => (
                      <span key={model} style={{ fontSize: '0.75rem', color: 'var(--ws-text-2)' }}>
                        {model}: {stats.calls} calls · {fmtUSD(stats.cost)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <TabelaGlobal
            id="admin-inventory"
            colunas={colunasInventario}
            dados={servicos}
            mensagemVazio={loading ? 'Carregando serviços...' : t('admin.monitor.vazio.sem_servicos')}
          />
          <TabelaGlobal
            id="admin-telemetry"
            colunas={colunasLogs}
            dados={logs}
            mensagemVazio={loading ? 'Carregando logs...' : t('admin.monitor.vazio.sem_trafego')}
          />
        </div>
      )}
    </PaginaGlobal>
  )
}
