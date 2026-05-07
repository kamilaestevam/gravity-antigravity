import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowClockwise,
  Sparkle,
  CurrencyDollar,
  Lightning,
  Brain,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'
import { ApiCockpitAdminTabs } from './ApiCockpitAdminTabs'

/**
 * MonitorLlmAdmin — aba "Monitor LLM" do API Cockpit (admin only).
 *
 * Centraliza tudo relacionado a uso de LLM/IA (GABI):
 *   - 4 cards com KPIs do mes corrente (Chamadas, Tokens, Custo Total, Custo Medio)
 *   - Painel detalhado de uso por modelo
 *   - Mes de referencia + breakdown por modelo (calls, tokens in/out, cost)
 *
 * Endpoint: GET /api/v1/api-cockpit/admin/uso-gabi
 *   Retorna: { month, total_calls, total_tokens_input, total_tokens_output,
 *              total_cost_usd, by_model: { [model]: { calls, tokensIn, tokensOut, cost } },
 *              by_day: { [YYYY-MM-DD]: count } }
 *
 * Migrado em 2026-05-07 da aba Servidores (commit 0528c30a) para reduzir
 * ruido visual na aba principal e dar visibilidade dedicada ao consumo de IA.
 */

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
  new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(n)

const fmtTokens = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function MonitorLlmAdmin() {
  const { t } = useTranslation()

  const [gabiUsage, setGabiUsage] = useState<GabiUsagePayload | null>(null)
  const [loading, setLoading]     = useState(true)

  // Banner inline ja sinaliza falha — nao usamos addNotification aqui
  // pra nao spammar a cada poll de 30s quando GABI esta offline em dev.
  const carregar = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      const res = await requisicaoAutenticada('/api/v1/api-cockpit/admin/uso-gabi', { signal })
      if (!res.ok) throw new Error(`uso-gabi ${res.status}`)
      const data: GabiUsagePayload = await res.json()
      if (data.error) throw new Error(data.error)
      setGabiUsage(data)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setGabiUsage(null)
      console.warn('[MonitorLlmAdmin] falha ao carregar /uso-gabi', err instanceof Error ? err.message : err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    void carregar(ctrl.signal)
    const interval = setInterval(() => { void carregar() }, POLLING_INTERVAL_MS)
    return () => {
      ctrl.abort()
      clearInterval(interval)
    }
  }, [carregar])

  // ── Derivacoes ────────────────────────────────────────────────────────

  const gabiCalls  = gabiUsage?.total_calls ?? 0
  const gabiCost   = gabiUsage?.total_cost_usd ?? 0
  const gabiTokens = (gabiUsage?.total_tokens_input ?? 0) + (gabiUsage?.total_tokens_output ?? 0)
  const gabiCustoMedio = gabiCalls > 0 ? gabiCost / gabiCalls : 0

  // ── Tooltips ──────────────────────────────────────────────────────────

  const ttDesc = (texto: string) => (
    <p style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', lineHeight: 1.45 }}>{texto}</p>
  )

  const tooltipChamadas = ttDesc(
    'Total de chamadas ao modelo de linguagem realizadas pela GABI no mês atual, agregado de todas as organizações.'
  )

  const tooltipTokens = ttDesc(
    'Tokens consumidos no mês (entrada + saída). Indica volume de processamento. K = mil, M = milhão.'
  )

  const tooltipCusto = ttDesc(
    'Custo acumulado em USD no mês atual. Inclui tokens de entrada e saída de todos os modelos utilizados.'
  )

  const tooltipCustoMedio = ttDesc(
    'Custo médio por chamada — total de USD dividido pelo número de chamadas. Útil pra comparar modelos.'
  )

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          icone={<Brain weight="duotone" size={24} />}
          titulo={t('admin.api-cockpit.titulo')}
          subtitulo={t('admin.monitor-llm.subtitulo')}
        />
      }
      stats={
        <>
          <CardEstatisticaGlobal
            titulo={t('admin.monitor-llm.chamadas')}
            valor={loading ? '…' : gabiUsage ? String(gabiCalls) : '—'}
            variante="primario"
            tooltip={tooltipChamadas}
          />
          <CardEstatisticaGlobal
            titulo={t('admin.monitor-llm.tokens')}
            valor={loading ? '…' : gabiUsage ? fmtTokens(gabiTokens) : '—'}
            variante="padrao"
            tooltip={tooltipTokens}
          />
          <CardEstatisticaGlobal
            titulo={t('admin.monitor-llm.custo_total')}
            valor={loading ? '…' : gabiUsage ? fmtUSD(gabiCost) : '—'}
            variante="aviso"
            tooltip={tooltipCusto}
          />
          <CardEstatisticaGlobal
            titulo={t('admin.monitor-llm.custo_medio_chamada')}
            valor={loading ? '…' : gabiUsage ? fmtUSD(gabiCustoMedio) : '—'}
            variante="padrao"
            tooltip={tooltipCustoMedio}
          />
        </>
      }
      toolbar={
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          gap:            '1rem',
          padding:        '1.25rem 0 0.5rem',
        }}>
          <ApiCockpitAdminTabs />
          <BotaoGlobal
            variante="secundario"
            onClick={() => { void carregar() }}
            icone={<ArrowClockwise size={16} />}
            aria-label="Atualizar monitor de LLM"
            disabled={loading}
          >
            Atualizar
          </BotaoGlobal>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {!gabiUsage && !loading && (
          <div role="alert" style={{
            padding:    '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(248,113,113,0.1)',
            border:     '1px solid rgba(248,113,113,0.3)',
            color:      '#f87171',
            fontSize:   '0.875rem',
          }}>
            Falha ao carregar dados do serviço GABI. Verifique se o serviço está online.
          </div>
        )}

        {gabiUsage && (
          <div
            style={{
              display:        'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap:            '1rem',
              padding:        '1.25rem',
              borderRadius:   '12px',
              background:     'linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(124,58,237,0.04) 100%)',
              border:         '1px solid rgba(129,140,248,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: '1 / -1', marginBottom: '0.25rem' }}>
              <Sparkle weight="fill" size={16} style={{ color: '#818cf8' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#818cf8', letterSpacing: '-0.01em' }}>
                {t('admin.monitor-llm.consumo_mes')} ({gabiUsage.month})
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t('admin.monitor-llm.chamadas')}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ws-text)' }}>
                <Lightning size={14} weight="fill" style={{ color: '#818cf8', marginRight: '0.25rem' }} />
                {gabiCalls}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t('admin.monitor-llm.tokens')}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ws-text)' }}>
                {fmtTokens(gabiTokens)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t('admin.monitor-llm.custo_total')}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ws-text)' }}>
                <CurrencyDollar size={14} weight="fill" style={{ color: '#f59e0b', marginRight: '0.25rem' }} />
                {fmtUSD(gabiCost)}
              </span>
            </div>

            {gabiUsage.by_model && Object.keys(gabiUsage.by_model).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t('admin.monitor-llm.por_modelo')}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  {Object.entries(gabiUsage.by_model).map(([model, stats]) => (
                    <span key={model} style={{ fontSize: '0.75rem', color: 'var(--ws-text-2)' }}>
                      {model}: {stats.calls} calls · {fmtTokens(stats.tokensIn + stats.tokensOut)} tokens · {fmtUSD(stats.cost)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PaginaGlobal>
  )
}

export default MonitorLlmAdmin
