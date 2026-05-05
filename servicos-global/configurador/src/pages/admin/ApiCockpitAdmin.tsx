import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
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
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { useShellStore } from '@gravity/shell'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'

// ─── Schemas Zod (Mandamento 06/09 — contratos bilaterais) ──────────────

const servicoPlataformaSchema = z.object({
  nome_servico_plataforma:              z.string(),
  status_servico_plataforma:            z.enum(['ONLINE', 'DEGRADADO', 'OFFLINE']),
  latencia_ms_servico_plataforma:       z.number(),
  versao_servico_plataforma:            z.string(),
  data_ultimo_check_servico_plataforma: z.string(),
  tipo_servico_plataforma:              z.enum(['NUCLEO', 'PRODUTO_GRAVITY', 'GATEWAY']),
})

const servicosResponseSchema = z.object({
  servicos: z.array(servicoPlataformaSchema),
  error:    z.string().optional(),
})

const logConsumoSchema = z.object({
  id_log_consumo:                   z.string(),
  id_organizacao:                   z.string(),
  id_produto_gravity:               z.string(),
  id_usuario:                       z.string().nullable(),
  id_correlacao:                    z.string().nullable(),
  endpoint_log_consumo:             z.string(),
  metodo_http_log_consumo:          z.string(),
  codigo_resposta_http_log_consumo: z.number(),
  latencia_ms_log_consumo:          z.number(),
  data_criacao_log_consumo:         z.string(),
  data_log_consumo:                 z.string(),
  hora_log_consumo:                 z.string(),
  resultado_log_consumo:            z.enum(['SUCESSO', 'ERRO_CLIENTE', 'ERRO_SERVIDOR']),
})

const logsResponseSchema = z.object({
  logs: z.array(logConsumoSchema),
  paginacao: z.object({
    pagina:  z.number(),
    limite:  z.number(),
    total:   z.number(),
    paginas: z.number(),
  }),
  error: z.string().optional(),
})

const estatisticasLogConsumoSchema = z.object({
  quantidade_requisicoes_log_consumo: z.number(),
  quantidade_erros_log_consumo:       z.number(),
  latencia_media_log_consumo:         z.number(),
  percentual_uptime_log_consumo:      z.number(),
  por_id_produto_gravity:             z.record(z.number()),
  por_faixa_codigo_resposta_http:     z.record(z.number()),
})

type ServicoPlataforma = z.infer<typeof servicoPlataformaSchema>
type LogConsumo = z.infer<typeof logConsumoSchema>
type EstatisticasLogConsumo = z.infer<typeof estatisticasLogConsumoSchema>

/** Resposta do GET /api/v1/api-cockpit/admin/uso-gabi (servico GABI — fora do escopo DDD api-cockpit) */
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

const POLLING_INTERVAL_MS = 30_000

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
  const [servicos, setServicos] = useState<ServicoPlataforma[]>([])
  const [logs, setLogs] = useState<LogConsumo[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasLogConsumo | null>(null)
  const [loading, setLoading] = useState(true)
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)

  // ── GABI usage state ──
  const [gabiUsage, setGabiUsage] = useState<GabiUsagePayload | null>(null)
  const [gabiLoading, setGabiLoading] = useState(true)

  const carregarMonitor = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setErroCarregar(null)
      const [svcRes, logsRes, statsRes] = await Promise.all([
        requisicaoAutenticada('/api/v1/api-cockpit/admin/saude-servicos',         { signal }),
        requisicaoAutenticada('/api/v1/api-cockpit/admin/log-consumo?limite=50',  { signal }),
        requisicaoAutenticada('/api/v1/api-cockpit/admin/log-consumo/estatisticas', { signal }),
      ])

      if (!svcRes.ok)   throw new Error(`saude-servicos ${svcRes.status} ${svcRes.statusText}`)
      if (!logsRes.ok)  throw new Error(`log-consumo ${logsRes.status} ${logsRes.statusText}`)
      if (!statsRes.ok) throw new Error(`estatisticas ${statsRes.status} ${statsRes.statusText}`)

      const svcRaw = await svcRes.json()
      const logsRaw = await logsRes.json()
      const statsRaw = await statsRes.json()

      // Backend retorna `error` no payload mesmo com 200 quando o api-cockpit esta down
      if (svcRaw.error) throw new Error(svcRaw.error)
      if (logsRaw.error) throw new Error(logsRaw.error)

      const svcParsed = servicosResponseSchema.safeParse(svcRaw)
      const logsParsed = logsResponseSchema.safeParse(logsRaw)
      const statsParsed = estatisticasLogConsumoSchema.safeParse(statsRaw)

      if (!svcParsed.success)   throw new Error('Payload de saude-servicos invalido')
      if (!logsParsed.success)  throw new Error('Payload de log-consumo invalido')
      if (!statsParsed.success) throw new Error('Payload de estatisticas invalido')

      setServicos(svcParsed.data.servicos)
      setLogs(logsParsed.data.logs)
      setEstatisticas(statsParsed.data)
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
      const res = await requisicaoAutenticada('/api/v1/api-cockpit/admin/uso-gabi', { signal })
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

  // KPIs memoizados — recalcular so quando servicos/logs mudam
  const apisOnline = useMemo(
    () => servicos.filter((s) => s.status_servico_plataforma === 'ONLINE').length,
    [servicos],
  )
  const apisTotal = servicos.length
  const apisOffline = useMemo(
    () => servicos.filter((s) => s.status_servico_plataforma === 'OFFLINE').length,
    [servicos],
  )

  // Status geral derivado da saude dos servicos
  const statusGeral = apisTotal === 0
    ? 'Indisponível'
    : apisOffline === 0
      ? 'Operacional'
      : apisOffline === apisTotal
        ? 'Crítico'
        : 'Degradado'
  const statusVariante: 'sucesso' | 'aviso' | 'perigo' | 'padrao' =
    statusGeral === 'Operacional' ? 'sucesso'
    : statusGeral === 'Degradado' ? 'aviso'
    : statusGeral === 'Crítico'   ? 'perigo'
    : 'padrao'

  const uptimePercent   = estatisticas ? `${estatisticas.percentual_uptime_log_consumo.toFixed(1)}%` : '—'
  const latenciaMediaMs = estatisticas ? `${estatisticas.latencia_media_log_consumo}ms` : '—'
  const requisicoes24h  = estatisticas ? estatisticas.quantidade_requisicoes_log_consumo : 0

  // GABI KPIs memoizados
  const gabiCalls = gabiUsage?.total_calls ?? 0
  const gabiCost = gabiUsage?.total_cost_usd ?? 0
  const gabiTokens = (gabiUsage?.total_tokens_input ?? 0) + (gabiUsage?.total_tokens_output ?? 0)

  const colunasInventario: TabelaGlobalColuna<ServicoPlataforma>[] = [
    {
      key: 'nome_servico_plataforma',
      label: t('admin.api-cockpit.tabela.servico'),
      tipo: 'texto',
      tooltipTitulo: 'Serviço',
      tooltipDescricao: 'Produto ou integração monitorada pela plataforma',
    },
    {
      key: 'tipo_servico_plataforma',
      label: t('admin.api-cockpit.tabela.tipo'),
      tipo: 'texto',
      tooltipTitulo: 'Tipo',
      tooltipDescricao: 'Categoria do serviço: núcleo, produto Gravity ou gateway',
      render: (val) => <span style={{ textTransform: 'capitalize' }}>{(val as string).toLowerCase().replace('_', ' ')}</span>,
    },
    {
      key: 'status_servico_plataforma',
      label: t('admin.api-cockpit.tabela.status'),
      tipo: 'texto',
      align: 'center',
      render: (val) => {
        const v = String(val)
        const isOnline = v === 'ONLINE'
        const isOffline = v === 'OFFLINE'
        const cor = isOnline ? '#34d399' : isOffline ? '#f87171' : '#fbbf24'
        const bg  = isOnline ? 'rgba(52,211,153,0.12)' : isOffline ? 'rgba(248,113,113,0.12)' : 'rgba(251,191,36,0.12)'
        return (
          <span style={{
            display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px',
            fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
            background: bg, color: cor, border: `1px solid ${bg}`,
          }}>{v}</span>
        )
      },
      tooltipTitulo: 'Status', tooltipDescricao: 'Indica se o serviço está operando normalmente',
    },
    {
      key: 'latencia_ms_servico_plataforma',
      label: t('admin.api-cockpit.tabela.consumo'),
      tipo: 'texto',
      tooltipTitulo: 'Latência',
      tooltipDescricao: 'Tempo de resposta do último health-check em milissegundos',
      render: (val) => `${val as number}ms`,
    },
  ]

  const colunasLogs: TabelaGlobalColuna<LogConsumo>[] = [
    {
      key: 'data_log_consumo',
      label: t('admin.api-cockpit.tabela.data'),
      tipo: 'texto',
      tooltipTitulo: 'Data',
      tooltipDescricao: 'Data em que a requisição foi registrada',
    },
    {
      key: 'hora_log_consumo',
      label: t('admin.api-cockpit.tabela.hora'),
      tipo: 'texto',
      tooltipTitulo: 'Hora',
      tooltipDescricao: 'Hora exata em que a requisição ocorreu',
    },
    {
      key: 'id_organizacao',
      label: t('admin.api-cockpit.tabela.org'),
      tipo: 'texto',
      tooltipTitulo: 'Organização',
      tooltipDescricao: 'Empresa que originou esta chamada à API',
    },
    {
      key: 'metodo_http_log_consumo',
      label: t('admin.api-cockpit.tabela.metodo'),
      tipo: 'texto',
      tooltipTitulo: 'Método',
      tooltipDescricao: 'Verbo HTTP da requisição: GET, POST, PUT ou DELETE',
    },
    {
      key: 'endpoint_log_consumo',
      label: t('admin.api-cockpit.tabela.endpoint'),
      tipo: 'texto',
      tooltipTitulo: 'Endpoint',
      tooltipDescricao: 'Rota da API que recebeu a chamada',
    },
    {
      key: 'codigo_resposta_http_log_consumo',
      label: t('admin.api-cockpit.tabela.status'),
      tipo: 'texto',
      tooltipTitulo: 'Status',
      tooltipDescricao: 'Código de resposta HTTP — abaixo de 400 indica sucesso',
    },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          icone={<PlugsConnected weight="duotone" size={24} />}
          titulo={t('admin.api-cockpit.titulo')}
          subtitulo={t('admin.api-cockpit.subtitulo')}
        />
      }
      stats={
        <>
          <CardEstatisticaGlobal
            titulo={t('admin.api-cockpit.status_geral')}
            valor={statusGeral}
            variante={statusVariante}
          />
          <CardEstatisticaGlobal
            titulo={t('admin.api-cockpit.uptime_24h')}
            valor={uptimePercent}
            variante="primario"
          />
          <CardEstatisticaGlobal
            titulo={t('admin.api-cockpit.latencia_media')}
            valor={latenciaMediaMs}
            variante="padrao"
          />
          <CardEstatisticaGlobal
            titulo={t('admin.api-cockpit.apis_online')}
            valor={`${apisOnline}/${apisTotal}`}
            variante="sucesso"
          />
          <CardEstatisticaGlobal
            titulo={t('admin.api-cockpit.requisicoes_24h')}
            valor={String(requisicoes24h)}
            variante="primario"
          />
          <CardEstatisticaGlobal
            titulo="GABI IA · Chamadas"
            valor={gabiLoading ? '…' : String(gabiCalls)}
            variante="primario"
          />
          <CardEstatisticaGlobal
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
            mensagemVazio={loading ? 'Carregando serviços...' : t('admin.api-cockpit.vazio.sem_servicos')}
          />
          <TabelaGlobal
            id="admin-telemetry"
            colunas={colunasLogs}
            dados={logs}
            mensagemVazio={loading ? 'Carregando logs...' : t('admin.api-cockpit.vazio.sem_trafego')}
          />
        </div>
      )}
    </PaginaGlobal>
  )
}
