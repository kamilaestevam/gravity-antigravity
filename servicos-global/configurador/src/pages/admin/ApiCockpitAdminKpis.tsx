import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { useShellStore } from '@gravity/shell'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'

/**
 * ApiCockpitAdminKpis — bloco de KPIs globais (admin Gravity HQ)
 * compartilhado pelas 5 abas do API Cockpit admin.
 *
 * Cards (todos cross-organizacao, dados globais do Railway):
 *   1. Status Geral         — derivado da saude dos servicos
 *   2. Uptime (24h)         — % uptime calculado pelo backend
 *   3. Latencia Media       — em ms
 *   4. APIs Online          — N de M servicos
 *   5. Requisicoes (24h)    — total
 *   6. GABI IA · Chamadas   — count
 *   7. GABI IA · Custo Mes  — USD
 *
 * Polling: 30s.
 */

// ─── Schemas Zod (Mandamento 06/09 — contratos bilaterais) ──────────────

const servicoPlataformaSchema = z.object({
  nome_servico_plataforma:              z.string(),
  status_servico_plataforma:            z.enum(['ONLINE', 'DEGRADADO', 'OFFLINE']),
  latencia_ms_servico_plataforma:       z.number(),
  versao_servico_plataforma:            z.string(),
  data_ultimo_check_servico_plataforma: z.string(),
  // Transicao 2026-05-06: backend pode servir 'NUCLEO' legacy ate restart
  tipo_servico_plataforma:              z.enum(['PLATAFORMA', 'NUCLEO', 'PRODUTO_GRAVITY', 'CONECTOR']),
})

const servicosResponseSchema = z.object({
  servicos: z.array(servicoPlataformaSchema),
  error:    z.string().optional(),
})

const estatisticasLogRequisicaoApiSchema = z.object({
  quantidade_requisicoes_log_requisicao_api:        z.number(),
  quantidade_erros_log_requisicao_api:              z.number(),
  latencia_media_log_requisicao_api:                z.number(),
  percentual_uptime_log_requisicao_api:             z.number(),
  quantidade_produtos_distintos_log_requisicao_api: z.number().optional().default(0),
  por_id_produto_gravity:                    z.record(z.number()),
  por_faixa_codigo_resposta_http:            z.record(z.number()),
})

type ServicoPlataforma = z.infer<typeof servicoPlataformaSchema>
type EstatisticasLogRequisicaoApi = z.infer<typeof estatisticasLogRequisicaoApiSchema>

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

// Formato monetario USD (pt-BR): "USD 1.000,00"
const fmtUSD = (n: number) =>
  'USD ' + new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)

export function ApiCockpitAdminKpis() {
  const { t } = useTranslation()
  const addNotification = useShellStore((s) => s.addNotification)

  const [servicos, setServicos]         = useState<ServicoPlataforma[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasLogRequisicaoApi | null>(null)
  const [gabiUsage, setGabiUsage]       = useState<GabiUsagePayload | null>(null)
  const [gabiLoading, setGabiLoading]   = useState(true)

  const carregar = useCallback(async (signal?: AbortSignal) => {
    try {
      const [svcRes, statsRes] = await Promise.all([
        requisicaoAutenticada('/api/v1/api-cockpit/admin/saude-servicos',           { signal }),
        requisicaoAutenticada('/api/v1/api-cockpit/admin/log-requisicao-api/estatisticas', { signal }),
      ])

      if (svcRes.ok) {
        const svcRaw = await svcRes.json()
        const parsed = servicosResponseSchema.safeParse(svcRaw)
        if (parsed.success) setServicos(parsed.data.servicos)
      }
      if (statsRes.ok) {
        const statsRaw = await statsRes.json()
        const parsed = estatisticasLogRequisicaoApiSchema.safeParse(statsRaw)
        if (parsed.success) setEstatisticas(parsed.data)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      // Mandamento 08 — falha em KPI nao trava a tela, mas notifica
      addNotification({
        type: 'error',
        message: `Falha ao carregar KPIs do API Cockpit: ${err instanceof Error ? err.message : 'erro desconhecido'}`,
      })
    }
  }, [addNotification])

  const carregarGabi = useCallback(async (signal?: AbortSignal) => {
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

  useEffect(() => {
    const ctrl = new AbortController()
    void carregar(ctrl.signal)
    void carregarGabi(ctrl.signal)
    const interval = setInterval(() => {
      void carregar()
      void carregarGabi()
    }, POLLING_INTERVAL_MS)
    return () => {
      ctrl.abort()
      clearInterval(interval)
    }
  }, [carregar, carregarGabi])

  // ── Derivacoes (memoizadas implicitamente em re-render) ──
  const apisOnline = servicos.filter((s) => s.status_servico_plataforma === 'ONLINE').length
  const apisTotal = servicos.length
  const apisOffline = servicos.filter((s) => s.status_servico_plataforma === 'OFFLINE').length

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

  const uptimePercent   = estatisticas ? `${estatisticas.percentual_uptime_log_requisicao_api.toFixed(1)}%` : '—'
  const latenciaMediaMs = estatisticas ? `${estatisticas.latencia_media_log_requisicao_api}ms` : '—'
  const requisicoes24h  = estatisticas ? estatisticas.quantidade_requisicoes_log_requisicao_api : 0

  const gabiCalls = gabiUsage?.total_calls ?? 0
  const gabiCost  = gabiUsage?.total_cost_usd ?? 0

  // ── Tooltips ────────────────────────────────────────────────────────────

  const ttDesc = (texto: string) => (
    <p style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', lineHeight: 1.45 }}>{texto}</p>
  )

  const ttEstados = (itens: readonly { label: string; desc: string; cor: string }[]) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {itens.map(({ label, desc, cor }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: cor, flexShrink: 0 }}>{label}</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', lineHeight: 1.3 }}>{desc}</span>
        </div>
      ))}
    </div>
  )

  const tooltipStatusGeral = (
    <>
      {ttDesc('Derivado do health check de todos os serviços registrados. Atualizado a cada 30s.')}
      <div style={{ marginTop: '0.625rem' }}>
        {ttEstados([
          { label: 'Indisponível', desc: 'Serviço de monitoramento offline',  cor: 'var(--text-secondary, #94a3b8)' },
          { label: 'Operacional',  desc: 'Todos os serviços respondendo',      cor: '#4ade80' },
          { label: 'Degradado',    desc: 'Um ou mais serviços com falha',      cor: '#fbbf24' },
          { label: 'Crítico',      desc: 'Nenhum serviço respondendo',         cor: '#f87171' },
        ] as const)}
      </div>
    </>
  )

  const tooltipUptime = ttDesc(
    'Percentual de requisições globais sem erro 5xx nas últimas 24h. Calculado sobre todas as organizações.'
  )

  const tooltipLatencia = ttDesc(
    'Tempo médio de processamento de todas as chamadas à API nas últimas 24h, em milissegundos.'
  )

  const tooltipApisOnline = (
    <>
      {ttDesc(`${apisOnline} de ${apisTotal} serviços respondendo ao health check neste momento.`)}
      <div style={{ marginTop: '0.625rem' }}>
        {ttEstados([
          { label: 'ONLINE',   desc: 'Respondeu em menos de 1 000ms', cor: '#4ade80' },
          { label: 'DEGRADADO',desc: 'Respondeu acima de 1 000ms',    cor: '#fbbf24' },
          { label: 'OFFLINE',  desc: 'Sem resposta ou timeout de 3s', cor: '#f87171' },
        ] as const)}
      </div>
    </>
  )

  const tooltipRequisicoes = ttDesc(
    'Total de chamadas à API registradas globalmente nas últimas 24h, de todas as organizações.'
  )

  const tooltipGabiChamadas = ttDesc(
    'Total de chamadas ao modelo de linguagem realizadas pela GABI no mês atual (dados do serviço Gabi).'
  )

  const tooltipGabiCusto = ttDesc(
    'Custo acumulado em USD das chamadas ao LLM no mês atual. Inclui tokens de entrada e saída de todos os modelos.'
  )

  return (
    <>
      <CardEstatisticaGlobal
        titulo={t('admin.api-cockpit.status_geral')}
        valor={statusGeral}
        variante={statusVariante}
        tooltip={tooltipStatusGeral}
      />
      <CardEstatisticaGlobal
        titulo={t('admin.api-cockpit.uptime_24h')}
        valor={uptimePercent}
        variante="primario"
        tooltip={tooltipUptime}
      />
      <CardEstatisticaGlobal
        titulo={t('admin.api-cockpit.latencia_media')}
        valor={latenciaMediaMs}
        variante="padrao"
        tooltip={tooltipLatencia}
      />
      <CardEstatisticaGlobal
        titulo={t('admin.api-cockpit.apis_online')}
        valor={`${apisOnline}/${apisTotal}`}
        variante="sucesso"
        tooltip={tooltipApisOnline}
      />
      <CardEstatisticaGlobal
        titulo={t('admin.api-cockpit.requisicoes_24h')}
        valor={String(requisicoes24h)}
        variante="primario"
        tooltip={tooltipRequisicoes}
      />
      <CardEstatisticaGlobal
        titulo="GABI IA · Chamadas"
        valor={gabiLoading ? '…' : String(gabiCalls)}
        variante="primario"
        tooltip={tooltipGabiChamadas}
      />
      <CardEstatisticaGlobal
        titulo="GABI IA · Custo Mês"
        valor={gabiLoading ? '…' : fmtUSD(gabiCost)}
        variante="aviso"
        tooltip={tooltipGabiCusto}
      />
    </>
  )
}

export default ApiCockpitAdminKpis
