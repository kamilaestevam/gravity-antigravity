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
import { useShellStore } from '@gravity/shell'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { ApiCockpitAdminTabs } from './ApiCockpitAdminTabs'
import { CardsServidoresAdmin, type SerieDiariaPontoAdmin } from './CardsServidoresAdmin'

// ─── Schemas Zod (Mandamento 06/09 — contratos bilaterais) ──────────────

const servicoPlataformaSchema = z.object({
  nome_servico_plataforma:              z.string(),
  status_servico_plataforma:            z.enum(['ONLINE', 'DEGRADADO', 'OFFLINE']),
  latencia_ms_servico_plataforma:       z.number(),
  versao_servico_plataforma:            z.string(),
  data_ultimo_check_servico_plataforma: z.string(),
  // Transicao 2026-05-06: backend pode estar servindo 'NUCLEO' (legacy) ate restart.
  // Aceita ambos enquanto a renomeacao se propaga; ROTULO mapeia NUCLEO -> 'Plataforma'.
  tipo_servico_plataforma:              z.enum(['PLATAFORMA', 'NUCLEO', 'PRODUTO_GRAVITY', 'CONECTOR']),
})

const servicosResponseSchema = z.object({
  servicos: z.array(servicoPlataformaSchema),
  error:    z.string().optional(),
})

const serieDiariaPontoSchema = z.object({
  data:       z.string(),
  total:      z.number(),
  sucesso:    z.number(),
  percentual: z.number(),
})

const estatisticasLogConsumoSchema = z.object({
  quantidade_requisicoes_log_consumo:        z.number(),
  quantidade_erros_log_consumo:              z.number(),
  latencia_media_log_consumo:                z.number(),
  percentual_uptime_log_consumo:             z.number(),
  quantidade_produtos_distintos_log_consumo: z.number().optional().default(0),
  por_id_produto_gravity:                    z.record(z.number()),
  por_faixa_codigo_resposta_http:            z.record(z.number()),
  serie_diaria_log_consumo:                  z.array(serieDiariaPontoSchema).optional(),
})

type ServicoPlataforma = z.infer<typeof servicoPlataformaSchema>
type EstatisticasLogConsumo = z.infer<typeof estatisticasLogConsumoSchema>
type TipoServicoPlataforma = ServicoPlataforma['tipo_servico_plataforma']

// Rotulos com ortografia PT-BR — type-safe via Record<TipoServicoPlataforma>
// NUCLEO mantido apenas para compat de transicao — mapeia para 'Plataforma'.
const ROTULO_TIPO_SERVICO: Record<TipoServicoPlataforma, string> = {
  PLATAFORMA:      'Plataforma',
  NUCLEO:          'Plataforma',
  PRODUTO_GRAVITY: 'Produto Gravity',
  CONECTOR:        'Conector',
}

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

// Ordem padrão de exibição da aba Servidores.
// Serviços listados aqui aparecem primeiro, na sequência definida.
// Demais serviços ficam ao final na ordem retornada pelo backend.
const ORDEM_PADRAO_SERVICOS: string[] = [
  'configurador-organizacoes',
  'configurador-me',
  'configurador-usuarios',
  'simula-custo',
  'cadastros',
  'bid-frete',
  'bid-cambio',
  'pedido',
  'lpco',
  'financeiro-comex',
  'nf-importacao',
  'taxas-cambio',
  'api-cockpit',
  'historico',
  'relatorios',
]

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
      const [svcRes, statsRes] = await Promise.all([
        requisicaoAutenticada('/api/v1/api-cockpit/admin/saude-servicos',                                  { signal }),
        requisicaoAutenticada('/api/v1/api-cockpit/admin/log-consumo/estatisticas?serie=diaria&dias=30',   { signal }),
      ])

      if (!svcRes.ok)   throw new Error(`saude-servicos ${svcRes.status} ${svcRes.statusText}`)
      if (!statsRes.ok) throw new Error(`estatisticas ${statsRes.status} ${statsRes.statusText}`)

      const svcRaw = await svcRes.json()
      const statsRaw = await statsRes.json()

      // Backend retorna `error` no payload mesmo com 200 quando o api-cockpit esta down
      if (svcRaw.error) throw new Error(svcRaw.error)

      const svcParsed = servicosResponseSchema.safeParse(svcRaw)
      const statsParsed = estatisticasLogConsumoSchema.safeParse(statsRaw)

      if (!svcParsed.success)   throw new Error('Payload de saude-servicos invalido')
      if (!statsParsed.success) throw new Error('Payload de estatisticas invalido')

      setServicos(svcParsed.data.servicos)
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

  // Ordenação padrão: prioridade definida em ORDEM_PADRAO_SERVICOS; demais ao final
  const servicosOrdenados = useMemo(() => {
    const total = ORDEM_PADRAO_SERVICOS.length
    return [...servicos].sort((a, b) => {
      const ia = ORDEM_PADRAO_SERVICOS.indexOf(a.nome_servico_plataforma)
      const ib = ORDEM_PADRAO_SERVICOS.indexOf(b.nome_servico_plataforma)
      return (ia === -1 ? total : ia) - (ib === -1 ? total : ib)
    })
  }, [servicos])

  // GABI KPIs (ainda usados na seção de breakdown abaixo)
  const gabiCalls  = gabiUsage?.total_calls ?? 0
  const gabiCost   = gabiUsage?.total_cost_usd ?? 0
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
      tooltipDescricao: 'Categoria do serviço: núcleo, produto Gravity ou conector',
      render: (val) => ROTULO_TIPO_SERVICO[val as TipoServicoPlataforma] ?? String(val),
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
      label: t('admin.api-cockpit.tabela.latencia'),
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Latência',
      tooltipDescricao: 'Tempo de resposta do último health-check em milissegundos',
      render: (val) => `${val as number}ms`,
    },
    {
      key: 'versao_servico_plataforma',
      label: t('admin.api-cockpit.tabela.versao'),
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Versão',
      tooltipDescricao: 'Versão da API ou serviço atualmente em execução',
      render: (val) => (val ? String(val) : '—'),
    },
    {
      key: 'data_ultimo_check_servico_plataforma',
      label: t('admin.api-cockpit.tabela.ultimo_check'),
      tipo: 'texto',
      tooltipTitulo: 'Último Check',
      tooltipDescricao: 'Data e hora da última verificação de disponibilidade',
      render: (val) => (val ? new Date(val as string).toLocaleString('pt-BR') : '—'),
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
        <CardsServidoresAdmin
          servicos={servicos}
          serieDiaria={estatisticas?.serie_diaria_log_consumo as SerieDiariaPontoAdmin[] | undefined}
          estatisticas={estatisticas}
          gabiUsage={gabiUsage}
          gabiLoading={gabiLoading}
        />
      }
      toolbar={
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.25rem 0 0.5rem',  // respiro vs stats acima e conteudo abaixo (padrao cga-tabs)
        }}>
          <ApiCockpitAdminTabs />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
            id="admin-servidores"
            colunas={colunasInventario}
            dados={servicosOrdenados}
            acoesExportacao={getAcoesExportacaoPadrao(colunasInventario, 'servidores-infraestrutura', 'Servidores de Infraestrutura')}
            mensagemVazio={loading ? 'Carregando servidores...' : t('admin.api-cockpit.vazio.sem_servicos')}
          />
        </div>
      )}
    </PaginaGlobal>
  )
}
