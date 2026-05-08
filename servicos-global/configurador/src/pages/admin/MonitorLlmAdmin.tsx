import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowClockwise,
  Brain,
  Warning,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
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

/**
 * Linha da tabela "uso por modelo".
 * Construida no client a partir do by_model do backend para alimentar TabelaGlobal.
 */
interface ModeloLinhaUso {
  modelo:       string
  chamadas:     number
  tokens:       number      // input + output (agregado pra UI)
  tokens_input: number
  tokens_output: number
  custo_total:  number
  custo_medio:  number      // custo_total / chamadas
}

interface GabiUsagePayload {
  month?: string
  total_calls?: number
  total_tokens_input?: number
  total_tokens_output?: number
  total_cost_usd?: number
  by_model?: Record<string, { calls: number; tokensIn: number; tokensOut: number; cost: number }>
  by_day?: Record<string, number>
  orgs_consultadas?: number
  orgs_com_falha?: number
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

  // Constroi as linhas da tabela "uso por modelo" a partir do by_model agregado.
  // Ordem: maior custo primeiro (mais relevante pra observabilidade financeira).
  const linhasModelo: ModeloLinhaUso[] = useMemo(() => {
    if (!gabiUsage?.by_model) return []
    return Object.entries(gabiUsage.by_model)
      .map(([modelo, stats]) => ({
        modelo,
        chamadas:      stats.calls,
        tokens:        stats.tokensIn + stats.tokensOut,
        tokens_input:  stats.tokensIn,
        tokens_output: stats.tokensOut,
        custo_total:   stats.cost,
        custo_medio:   stats.calls > 0 ? stats.cost / stats.calls : 0,
      }))
      .sort((a, b) => b.custo_total - a.custo_total)
  }, [gabiUsage])

  // Area de avisos — em F1 fica vazia quando nao ha falha de carregamento.
  // F2 popula com avisos de limite (proximo/excedido) por modelo/org.
  const avisos: { tipo: 'aviso' | 'erro'; mensagem: string }[] = useMemo(() => {
    const lista: { tipo: 'aviso' | 'erro'; mensagem: string }[] = []
    if (!gabiUsage && !loading) {
      lista.push({
        tipo:      'erro',
        mensagem:  'Falha ao carregar dados do serviço GABI. Verifique se o serviço está online.',
      })
    }
    if (gabiUsage && gabiUsage.orgs_com_falha && gabiUsage.orgs_com_falha > 0) {
      lista.push({
        tipo:      'aviso',
        mensagem:  `${gabiUsage.orgs_com_falha} de ${gabiUsage.orgs_consultadas ?? '?'} organizações falharam ao reportar uso. Os totais abaixo estão parciais.`,
      })
    }
    return lista
  }, [gabiUsage, loading])

  const colunasModelo: TabelaGlobalColuna<ModeloLinhaUso>[] = [
    {
      key:              'modelo',
      label:            'Modelo',
      tipo:             'texto',
      tooltipTitulo:    'Modelo de LLM',
      tooltipDescricao: 'Identificador do modelo utilizado nas chamadas (ex: gpt-4o-mini, claude-3-5-sonnet).',
      render: (val) => (
        <code style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{val as string}</code>
      ),
    },
    {
      key:              'chamadas',
      label:            'Chamadas',
      tipo:             'texto',
      align:            'center',
      tooltipTitulo:    'Chamadas',
      tooltipDescricao: 'Total de invocações do modelo no mês corrente, agregado de todas as organizações.',
      render: (val) => <span>{(val as number).toLocaleString('pt-BR')}</span>,
    },
    {
      key:              'tokens',
      label:            'Tokens (in + out)',
      tipo:             'texto',
      align:            'center',
      tooltipTitulo:    'Tokens',
      tooltipDescricao: 'Soma de tokens de entrada e saída. Indica volume de processamento.',
      render: (_val, row) => (
        <span title={`in: ${row.tokens_input.toLocaleString('pt-BR')} · out: ${row.tokens_output.toLocaleString('pt-BR')}`}>
          {fmtTokens(row.tokens)}
        </span>
      ),
    },
    {
      key:              'custo_total',
      label:            'Custo Total',
      tipo:             'texto',
      align:            'center',
      tooltipTitulo:    'Custo Total',
      tooltipDescricao: 'Custo acumulado em USD para este modelo no mês corrente.',
      render: (val) => <span style={{ fontWeight: 600 }}>{fmtUSD(val as number)}</span>,
    },
    {
      key:              'custo_medio',
      label:            'Custo Médio / Chamada',
      tipo:             'texto',
      align:            'center',
      tooltipTitulo:    'Custo Médio',
      tooltipDescricao: 'Custo total dividido pelo número de chamadas. Útil pra comparar modelos.',
      render: (val) => <span>{fmtUSD(val as number)}</span>,
    },
  ]

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
        {/*
         * Area de avisos — banners empilhados antes da tabela.
         * F1: cobre falha de carregamento e falha parcial em orgs.
         * F2: aqui entram avisos de limite (proximo/excedido) por modelo/org.
         */}
        {avisos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {avisos.map((aviso, idx) => {
              const isErro = aviso.tipo === 'erro'
              return (
                <div
                  key={idx}
                  role="alert"
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '0.625rem',
                    padding:      '0.75rem 1rem',
                    borderRadius: '8px',
                    background:   isErro ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
                    border:       isErro ? '1px solid rgba(248,113,113,0.3)' : '1px solid rgba(251,191,36,0.3)',
                    color:        isErro ? '#f87171' : '#fbbf24',
                    fontSize:     '0.875rem',
                  }}
                >
                  <Warning size={16} weight="fill" />
                  <span>{aviso.mensagem}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Tabela de uso por modelo (mes corrente). */}
        <TabelaGlobal<ModeloLinhaUso>
          id="admin-monitor-llm-modelos"
          colunas={colunasModelo}
          dados={linhasModelo}
          acoesExportacao={getAcoesExportacaoPadrao(
            colunasModelo,
            'monitor-llm-por-modelo',
            'Monitor LLM — Uso por modelo (Admin)',
          )}
          mensagemVazio={
            loading
              ? 'Carregando uso de LLM...'
              : gabiUsage
                ? `Sem chamadas registradas em ${gabiUsage.month ?? 'período atual'}.`
                : 'Sem dados disponíveis.'
          }
        />
      </div>
    </PaginaGlobal>
  )
}
export default MonitorLlmAdmin
