import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useShellStore } from '@gravity/shell'
import {
  CurrencyCircleDollar,
  ArrowsClockwise,
  CircleNotch,
  Clock,
  ChartLine,
  Sigma,
} from '@phosphor-icons/react'
import { z } from 'zod'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'

// ---------------------------------------------------------------------------
// Tipos — Cotação Atual (PTAX)
// ---------------------------------------------------------------------------

interface TaxaItem {
  id: string
  moeda: string
  compra: number
  venda: number
  data_cotacao: string
  hora_cotacao: string | null
  boletim?: string
  fonte: string
  criado_em: string
}

// Achatado (sem aninhar em `taxa`) — TabelaGlobal lê filtros via e[key],
// então periodo/numero precisam de campos no top-level pra funcionar.
interface TaxaAtual {
  moeda: string
  nome_moeda: string
  simbolo_moeda: string
  compra: number | null
  venda: number | null
  data_cotacao: string | null
  hora_cotacao: string | null
  fonte: string | null
  criado_em: string | null
}

// ---------------------------------------------------------------------------
// Tipos + schema Zod — Previsão da Taxa Futura da Moeda (BACEN Focus)
//
// IMPORTANTE (Mandamento 09 — Zod bilateral):
// Este schema é o ESPELHO de `previsaoTaxaFuturaMoedaResponseSchema` definido
// em `servicos-global/configurador/server/routes/previsao-taxa-futura-moeda.ts`.
// Qualquer mudança no payload do backend exige atualização AQUI no mesmo commit.
// ---------------------------------------------------------------------------

const previsaoItemSchema = z.object({
  id_previsao_taxa_futura_moeda: z.string(),
  moeda_previsao_taxa_futura_moeda: z.string(),
  mes_previsao_taxa_futura_moeda: z.string(),
  valor_mediano_previsao_taxa_futura_moeda: z.number(),
  valor_medio_previsao_taxa_futura_moeda: z.number(),
  valor_minimo_previsao_taxa_futura_moeda: z.number(),
  valor_maximo_previsao_taxa_futura_moeda: z.number(),
  fonte_previsao_taxa_futura_moeda: z.string(),
  data_previsao_taxa_futura_moeda: z.string(),
  data_criacao_previsao_taxa_futura_moeda: z.string(),
  data_atualizacao_previsao_taxa_futura_moeda: z.string(),
})

const previsaoResponseSchema = z.object({
  data: z.array(previsaoItemSchema),
  moeda: z.string(),
  meses: z.number(),
  total: z.number(),
})

type PrevisaoItem = z.infer<typeof previsaoItemSchema>

// Linha achatada para a TabelaGlobal
interface PrevisaoLinha {
  id: string
  moeda: string
  nome_moeda: string
  mes_previsto: string          // ISO date — primeiro dia do mês-alvo
  valor_mediano: number
  data_previsao: string         // ISO date — quando o Focus publicou
  fonte: string
}

// ---------------------------------------------------------------------------
// Constantes / helpers
// ---------------------------------------------------------------------------

const MOEDAS_INFO: Record<string, { simbolo: string; nome: string }> = {
  USD: { simbolo: 'US$', nome: 'Dólar Americano' },
  EUR: { simbolo: '€',   nome: 'Euro' },
  GBP: { simbolo: '£',   nome: 'Libra Esterlina' },
  CHF: { simbolo: 'CHF', nome: 'Franco Suíço' },
  CNY: { simbolo: '¥',   nome: 'Yuan Chinês' },
  JPY: { simbolo: '¥',   nome: 'Iene Japonês' },
  CAD: { simbolo: 'C$',  nome: 'Dólar Canadense' },
}

const MOEDAS_ORDEM = ['USD', 'EUR', 'GBP', 'CHF', 'CNY', 'JPY', 'CAD'] as const

function fmtTaxa(v: number | null | undefined): string {
  if (v == null) return '—'
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
}

function fmtData(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

function fmtDataHora(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

/** Formata ISO date como "Jun/2026" — usado em colunas/KPIs da aba Previsão */
function fmtMes(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const mes = d.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '')
  const ano = d.getUTCFullYear()
  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)}/${ano}`
}

/**
 * Pill de período — destaca "atual" / "Previsão" no título do card.
 * Usa accent indigo (#818cf8) do design system Solid Slate.
 * `icone` opcional aparece antes do texto.
 */
function PillPeriodo({ children, icone }: { children: React.ReactNode; icone?: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      padding: '2px 8px',
      borderRadius: '10px',
      fontSize: '0.65rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: '#818cf8',
      background: 'rgba(129,140,248,0.10)',
      border: '1px solid rgba(129,140,248,0.25)',
      lineHeight: 1,
    }}>
      {icone}
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

type AbaTaxaMoeda = 'atual' | 'futura'

export function TaxasMoeda() {
  const { getToken } = useAuth()
  const { addNotification } = useShellStore()

  const [abaAtiva, setAbaAtiva] = useState<AbaTaxaMoeda>('atual')
  const [taxasAtuais, setTaxasAtuais] = useState<TaxaAtual[]>([])
  const [previsoes, setPrevisoes] = useState<PrevisaoItem[]>([])
  const [sincronizando, setSincronizando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [carregandoPrevisao, setCarregandoPrevisao] = useState(false)
  const [ultimaSync, setUltimaSync] = useState<string | null>(null)

  // ── Buscar cotações atuais (PTAX) ────────────────────────────────────────

  const buscarTaxas = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch('/api/v1/taxas-moeda')
      if (!res.ok) throw new Error('Falha ao buscar taxas')
      const json = await res.json()
      const porMoeda: Record<string, TaxaItem[]> = json.por_moeda ?? {}
      const linhas: TaxaAtual[] = MOEDAS_ORDEM.map(moeda => {
        const info = MOEDAS_INFO[moeda] ?? { simbolo: moeda, nome: moeda }
        const boletins = porMoeda[moeda] ?? []
        const ultimo = boletins.length > 0 ? boletins[boletins.length - 1] : null
        return {
          moeda,
          nome_moeda: info.nome,
          simbolo_moeda: info.simbolo,
          compra: ultimo ? Number(ultimo.compra) : null,
          venda: ultimo ? Number(ultimo.venda) : null,
          data_cotacao: ultimo ? ultimo.data_cotacao : null,
          hora_cotacao: ultimo?.hora_cotacao ?? null,
          fonte: ultimo?.fonte ?? null,
          criado_em: ultimo?.criado_em ?? null,
        }
      })
      setTaxasAtuais(linhas)
    } catch {
      setTaxasAtuais(MOEDAS_ORDEM.map(moeda => {
        const info = MOEDAS_INFO[moeda] ?? { simbolo: moeda, nome: moeda }
        return {
          moeda, nome_moeda: info.nome, simbolo_moeda: info.simbolo,
          compra: null, venda: null, data_cotacao: null,
          hora_cotacao: null, fonte: null, criado_em: null,
        }
      }))
    } finally {
      setCarregando(false)
    }
  }, [])

  // ── Buscar previsões Focus (Mandamento 06+09 — Zod parse na response) ────

  const buscarPrevisoes = useCallback(async () => {
    setCarregandoPrevisao(true)
    try {
      const res = await fetch('/api/v1/previsoes-taxa-futura-moeda?moeda=USD&meses=4')
      if (!res.ok) throw new Error('Falha ao buscar previsões')
      const json = await res.json()
      const parsed = previsaoResponseSchema.parse(json)
      setPrevisoes(parsed.data)
    } catch (err) {
      // Mandamento 08 — sem fallback silencioso: registra o erro no console
      // pra investigação, mas mantém a UI funcional com lista vazia.
      console.warn('[TaxasMoeda] Falha ao buscar previsões do BACEN Focus', err)
      setPrevisoes([])
    } finally {
      setCarregandoPrevisao(false)
    }
  }, [])

  useEffect(() => { buscarTaxas() }, [buscarTaxas])
  useEffect(() => {
    if (abaAtiva === 'futura') buscarPrevisoes()
  }, [abaAtiva, buscarPrevisoes])

  // Pre-fetch das previsões no mount — alimenta os KPIs da aba 'futura'
  // antes do usuário clicar nela.
  useEffect(() => {
    void buscarPrevisoes()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Sincronizar (branch por aba ativa) ───────────────────────────────────

  const sincronizar = async () => {
    setSincronizando(true)
    try {
      const token = await getToken()
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

      if (abaAtiva === 'atual') {
        // ─── Sync PTAX ───────────────────────────────────────────────────
        const res = await fetch('/api/v1/taxas-moeda/sync', { method: 'POST', headers })

        if (res.status === 401) {
          addNotification({ type: 'error', message: 'Sessão expirada. Faça login novamente.' })
          return
        }

        const json = await res.json().catch(() => ({}))
        const totalOk = json.total_ok ?? 0
        const totalErro = json.total_erro ?? 0

        if (totalOk === 0) {
          const detalhe = json.resultados?.[0]?.detalhe ?? 'serviço taxas-moeda offline'
          addNotification({
            type: 'error',
            message: `Não foi possível sincronizar (${detalhe})`,
            duration: 6000,
          })
        } else {
          setUltimaSync(new Date().toLocaleString('pt-BR'))
          await buscarTaxas()
          addNotification({
            type: totalErro > 0 ? 'warning' : 'success',
            message: totalErro > 0
              ? `Sincronizado parcialmente: ${totalOk} ok, ${totalErro} com erro`
              : `Sincronização PTAX concluída: ${totalOk} moeda(s) atualizada(s)`,
          })
        }
      } else {
        // ─── Sync Focus (aba 'futura') ───────────────────────────────────
        const res = await fetch('/api/v1/previsoes-taxa-futura-moeda/sync', { method: 'POST', headers })

        if (res.status === 401) {
          addNotification({ type: 'error', message: 'Sessão expirada. Faça login novamente.' })
          return
        }

        const json = await res.json().catch(() => ({}))
        const totalOk = json.total_ok ?? 0
        const totalErro = json.total_erro ?? 0
        const usdResultado = json.resultados?.find((r: { moeda: string }) => r.moeda === 'USD')

        if (totalOk === 0) {
          const detalhe = usdResultado?.detalhe ?? 'BACEN Focus indisponível'
          addNotification({
            type: 'error',
            message: `Não foi possível sincronizar Focus (${detalhe})`,
            duration: 6000,
          })
        } else {
          setUltimaSync(new Date().toLocaleString('pt-BR'))
          await buscarPrevisoes()
          const totalMeses = usdResultado?.total ?? 0
          addNotification({
            type: totalErro > 0 ? 'warning' : 'success',
            message: totalErro > 0
              ? `Sincronização Focus parcial: ${totalOk} ok, ${totalErro} com erro`
              : `Sincronização Focus concluída: USD atualizado (${totalMeses} mês${totalMeses === 1 ? '' : 'es'})`,
          })
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro de comunicação'
      addNotification({ type: 'error', message: `Falha na sincronização: ${msg}` })
    } finally {
      setSincronizando(false)
    }
  }

  // ── KPIs aba 'atual' ─────────────────────────────────────────────────────

  const taxaUSD = taxasAtuais.find(t => t.moeda === 'USD')
  const taxaEUR = taxasAtuais.find(t => t.moeda === 'EUR')
  const moedasComDados = taxasAtuais.filter(t => t.venda != null).length

  // ── KPIs aba 'futura' ────────────────────────────────────────────────────

  const previsaoProximoMes = previsoes[0] ?? null
  const previsaoMaisDistante = previsoes.length > 0 ? previsoes[previsoes.length - 1] : null
  const dataUltimaProjecao = previsoes.length > 0
    ? previsoes.reduce((max, p) =>
        new Date(p.data_previsao_taxa_futura_moeda) > new Date(max.data_previsao_taxa_futura_moeda) ? p : max,
      ).data_previsao_taxa_futura_moeda
    : null

  // ── Tabela: previsões achatadas pra TabelaGlobal ─────────────────────────

  const previsoesLinhas: PrevisaoLinha[] = previsoes.map(p => ({
    id: p.id_previsao_taxa_futura_moeda,
    moeda: p.moeda_previsao_taxa_futura_moeda,
    nome_moeda: MOEDAS_INFO[p.moeda_previsao_taxa_futura_moeda]?.nome ?? p.moeda_previsao_taxa_futura_moeda,
    mes_previsto: p.mes_previsao_taxa_futura_moeda,
    valor_mediano: p.valor_mediano_previsao_taxa_futura_moeda,
    data_previsao: p.data_previsao_taxa_futura_moeda,
    fonte: p.fonte_previsao_taxa_futura_moeda,
  }))

  // ── Colunas — Cotação Atual ──────────────────────────────────────────────

  const colunasAtual: TabelaGlobalColuna<TaxaAtual>[] = [
    {
      key: 'moeda',
      label: 'Moeda',
      tipo: 'texto',
      renderFiltroLabel: (val) => {
        const info = MOEDAS_INFO[val]
        return info ? `${val} — ${info.nome}` : val
      },
      render: (_, row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>{row.moeda}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            {row.simbolo_moeda} · {row.nome_moeda}
          </span>
        </span>
      ),
    },
    {
      key: 'compra',
      label: 'Compra (R$)',
      tipo: 'numero',
      render: (_, row) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtTaxa(row.compra)}</span>,
    },
    {
      key: 'venda',
      label: 'Venda (R$)',
      tipo: 'numero',
      render: (_, row) => <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{fmtTaxa(row.venda)}</span>,
    },
    {
      key: 'data_cotacao',
      label: 'Data Cotação',
      tipo: 'periodo',
      render: (_, row) => fmtData(row.data_cotacao),
    },
    {
      key: 'hora_cotacao',
      label: 'Hora',
      tipo: 'texto',
      render: (_, row) => row.hora_cotacao ?? '—',
    },
    {
      key: 'fonte',
      label: 'Fonte',
      tipo: 'texto',
      render: (_, row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          {row.fonte ?? '—'}
        </span>
      ),
    },
    {
      key: 'criado_em',
      label: 'Armazenado em',
      tipo: 'periodo',
      render: (_, row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          {fmtDataHora(row.criado_em)}
        </span>
      ),
    },
  ]

  // ── Colunas — Previsão da Taxa Futura da Moeda (BACEN Focus) ─────────────

  const colunasPrevisao: TabelaGlobalColuna<PrevisaoLinha>[] = [
    {
      key: 'moeda',
      label: 'Moeda',
      tipo: 'texto',
      render: (_, row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>{row.moeda}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            {row.nome_moeda}
          </span>
        </span>
      ),
    },
    {
      key: 'mes_previsto',
      label: 'Mês previsto',
      tipo: 'periodo',
      getValorBruto: (row) => row.mes_previsto.split('T')[0],
      render: (_, row) => <span style={{ fontWeight: 600 }}>{fmtMes(row.mes_previsto)}</span>,
    },
    {
      key: 'valor_mediano',
      label: 'Valor previsto (R$)',
      tipo: 'numero',
      getValorBruto: (row) => String(row.valor_mediano),
      render: (_, row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
          {fmtTaxa(row.valor_mediano)}
        </span>
      ),
    },
    {
      key: 'data_previsao',
      label: 'Atualizado em',
      tipo: 'periodo',
      getValorBruto: (row) => row.data_previsao.split('T')[0],
      render: (_, row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          {fmtData(row.data_previsao)}
        </span>
      ),
    },
    {
      key: 'fonte',
      label: 'Fonte',
      tipo: 'texto',
      render: (_, row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{row.fonte}</span>
      ),
    },
  ]

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes taxa-spin { to { transform: rotate(360deg); } }
        .taxa-spin { animation: taxa-spin 0.9s linear infinite; }
      `}</style>
      <PaginaGlobal
        layout="lista"
        cabecalho={
          <CabecalhoGlobal
            titulo="Taxas de Moeda"
            subtitulo="Cotações PTAX oficiais e projeções de câmbio do BACEN Focus"
            icone={<CurrencyCircleDollar weight="duotone" size={22} color="#818cf8" />}
          />
        }
        stats={
          abaAtiva === 'atual' ? (
            <>
              {/* ═══════ KPIs ABA 1: Cotação Atual (PTAX) ═══════ */}
              <CardBasicoGlobal
                titulo="USD / BRL"
                icone={<CurrencyCircleDollar weight="duotone" size={16} />}
                valor={taxaUSD?.venda != null ? `R$ ${fmtTaxa(taxaUSD.venda)}` : '—'}
                subtexto={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '2px' }}>
                    <PillPeriodo>Atual</PillPeriodo>
                    <span>{taxaUSD?.compra != null ? `Compra: R$ ${fmtTaxa(taxaUSD.compra)}` : 'Sincronize para atualizar'}</span>
                  </span>
                }
                tooltip={
                  <>
                    <p className="cg-tooltip__title">DÓLAR AMERICANO · COTAÇÃO ATUAL</p>
                    <div className="cg-tooltip__row">
                      <span>Compra</span>
                      <strong>{taxaUSD?.compra != null ? `R$ ${fmtTaxa(taxaUSD.compra)}` : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Venda</span>
                      <strong style={{ color: '#34d399' }}>{taxaUSD?.venda != null ? `R$ ${fmtTaxa(taxaUSD.venda)}` : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__divider" />
                    <div className="cg-tooltip__row">
                      <span>Data cotação</span>
                      <strong>{fmtData(taxaUSD?.data_cotacao)}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Hora</span>
                      <strong>{taxaUSD?.hora_cotacao ?? '—'}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Fonte</span>
                      <strong>{taxaUSD?.fonte ?? '—'}</strong>
                    </div>
                  </>
                }
              />
              <CardBasicoGlobal
                titulo="EUR / BRL"
                icone={<CurrencyCircleDollar weight="duotone" size={16} />}
                valor={taxaEUR?.venda != null ? `R$ ${fmtTaxa(taxaEUR.venda)}` : '—'}
                subtexto={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '2px' }}>
                    <PillPeriodo>Atual</PillPeriodo>
                    <span>{taxaEUR?.compra != null ? `Compra: R$ ${fmtTaxa(taxaEUR.compra)}` : 'Sincronize para atualizar'}</span>
                  </span>
                }
                tooltip={
                  <>
                    <p className="cg-tooltip__title">EURO · COTAÇÃO ATUAL</p>
                    <div className="cg-tooltip__row">
                      <span>Compra</span>
                      <strong>{taxaEUR?.compra != null ? `R$ ${fmtTaxa(taxaEUR.compra)}` : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Venda</span>
                      <strong style={{ color: '#34d399' }}>{taxaEUR?.venda != null ? `R$ ${fmtTaxa(taxaEUR.venda)}` : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__divider" />
                    <div className="cg-tooltip__row">
                      <span>Data cotação</span>
                      <strong>{fmtData(taxaEUR?.data_cotacao)}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Hora</span>
                      <strong>{taxaEUR?.hora_cotacao ?? '—'}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Fonte</span>
                      <strong>{taxaEUR?.fonte ?? '—'}</strong>
                    </div>
                  </>
                }
              />
              <CardBasicoGlobal
                titulo="Moedas ativas"
                icone={<ChartLine weight="duotone" size={16} />}
                valor={moedasComDados}
                subtexto={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '2px' }}>
                    <PillPeriodo>Atual</PillPeriodo>
                    <span>{`de ${MOEDAS_ORDEM.length} moedas suportadas`}</span>
                  </span>
                }
                tooltip={
                  <>
                    <p className="cg-tooltip__title">SITUAÇÃO POR MOEDA</p>
                    {MOEDAS_ORDEM.map(m => {
                      const t = taxasAtuais.find(x => x.moeda === m)
                      const ativa = t?.venda != null
                      return (
                        <div key={m} className="cg-tooltip__row">
                          <span>{m} · {MOEDAS_INFO[m]?.nome ?? m}</span>
                          <strong style={{ color: ativa ? '#34d399' : '#94a3b8' }}>
                            {ativa ? `R$ ${fmtTaxa(t!.venda)}` : 'sem dado'}
                          </strong>
                        </div>
                      )
                    })}
                    <div className="cg-tooltip__divider" />
                    <div className="cg-tooltip__row">
                      <span>Total ativas</span>
                      <strong style={{ color: '#34d399' }}>{moedasComDados} de {MOEDAS_ORDEM.length}</strong>
                    </div>
                  </>
                }
              />
            </>
          ) : (
            <>
              {/* ═══════ KPIs ABA 2: Cotação Futura (BACEN Focus) ═══════ */}
              <CardBasicoGlobal
                titulo="USD próximo mês"
                icone={<CurrencyCircleDollar weight="duotone" size={16} />}
                valor={previsaoProximoMes?.valor_mediano_previsao_taxa_futura_moeda != null
                  ? `R$ ${fmtTaxa(previsaoProximoMes.valor_mediano_previsao_taxa_futura_moeda)}`
                  : '—'}
                subtexto={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '2px' }}>
                    <PillPeriodo>Previsão</PillPeriodo>
                    <span>{previsaoProximoMes
                      ? fmtMes(previsaoProximoMes.mes_previsao_taxa_futura_moeda)
                      : 'Sincronize Focus para carregar'}</span>
                  </span>
                }
                tooltip={
                  <>
                    <p className="cg-tooltip__title">DÓLAR AMERICANO · PRÓXIMO MÊS (FOCUS)</p>
                    <div className="cg-tooltip__row">
                      <span>Mediana</span>
                      <strong style={{ color: '#818cf8' }}>{previsaoProximoMes
                        ? `R$ ${fmtTaxa(previsaoProximoMes.valor_mediano_previsao_taxa_futura_moeda)}`
                        : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Média</span>
                      <strong>{previsaoProximoMes
                        ? `R$ ${fmtTaxa(previsaoProximoMes.valor_medio_previsao_taxa_futura_moeda)}`
                        : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__divider" />
                    <div className="cg-tooltip__row">
                      <span>Mínimo</span>
                      <strong>{previsaoProximoMes
                        ? `R$ ${fmtTaxa(previsaoProximoMes.valor_minimo_previsao_taxa_futura_moeda)}`
                        : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Máximo</span>
                      <strong>{previsaoProximoMes
                        ? `R$ ${fmtTaxa(previsaoProximoMes.valor_maximo_previsao_taxa_futura_moeda)}`
                        : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__divider" />
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>
                      Projeção de mercado (BACEN Focus). Não é cotação negociada.
                    </p>
                  </>
                }
              />
              <CardBasicoGlobal
                titulo="USD horizonte"
                icone={<Sigma weight="duotone" size={16} />}
                valor={previsaoMaisDistante?.valor_mediano_previsao_taxa_futura_moeda != null
                  ? `R$ ${fmtTaxa(previsaoMaisDistante.valor_mediano_previsao_taxa_futura_moeda)}`
                  : '—'}
                subtexto={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '2px' }}>
                    <PillPeriodo>Previsão</PillPeriodo>
                    <span>{previsaoMaisDistante
                      ? fmtMes(previsaoMaisDistante.mes_previsao_taxa_futura_moeda)
                      : `${previsoes.length} mês(es) carregado(s)`}</span>
                  </span>
                }
                tooltip={
                  <>
                    <p className="cg-tooltip__title">USD · HORIZONTE DA PREVISÃO</p>
                    <div className="cg-tooltip__row">
                      <span>Meses carregados</span>
                      <strong>{previsoes.length}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Mês mais próximo</span>
                      <strong>{previsaoProximoMes
                        ? fmtMes(previsaoProximoMes.mes_previsao_taxa_futura_moeda)
                        : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Mês mais distante</span>
                      <strong>{previsaoMaisDistante
                        ? fmtMes(previsaoMaisDistante.mes_previsao_taxa_futura_moeda)
                        : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__divider" />
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>
                      Erro de previsão de câmbio cresce rápido com horizonte.
                    </p>
                  </>
                }
              />
              <CardBasicoGlobal
                titulo="Atualização Focus"
                icone={<Clock weight="duotone" size={16} />}
                valor={dataUltimaProjecao ? fmtData(dataUltimaProjecao) : '—'}
                subtexto={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '2px' }}>
                    <PillPeriodo>Fonte</PillPeriodo>
                    <span>BACEN/Focus</span>
                  </span>
                }
                tooltip={
                  <>
                    <p className="cg-tooltip__title">BACEN FOCUS · ATUALIZAÇÃO</p>
                    <div className="cg-tooltip__row">
                      <span>Última publicação</span>
                      <strong>{dataUltimaProjecao ? fmtData(dataUltimaProjecao) : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Cron</span>
                      <strong>Semanal (terça 22h BRT)</strong>
                    </div>
                    <div className="cg-tooltip__divider" />
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>
                      Focus publica oficialmente apenas a série USD/BRL.
                    </p>
                  </>
                }
              />
            </>
          )
        }
        toolbar={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '1rem' }}>
            <div className="ws-tabs" style={{ margin: 0 }} role="tablist">
              <button
                role="tab"
                aria-selected={abaAtiva === 'atual'}
                className={`ws-tab${abaAtiva === 'atual' ? ' active' : ''}`}
                onClick={() => setAbaAtiva('atual')}
              >
                Cotação Atual
              </button>
              <button
                role="tab"
                aria-selected={abaAtiva === 'futura'}
                className={`ws-tab${abaAtiva === 'futura' ? ' active' : ''}`}
                onClick={() => setAbaAtiva('futura')}
              >
                Cotação Futura
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {ultimaSync && (
                <TooltipGlobal conteudo={`Última sincronização: ${ultimaSync}`}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--ws-muted)', fontSize: '0.8rem' }}>
                    <Clock size={14} />
                    {ultimaSync}
                  </span>
                </TooltipGlobal>
              )}
              <BotaoGlobal
                variante="primario"
                tamanho="pequeno"
                icone={
                  sincronizando
                    ? <CircleNotch size={16} weight="bold" className="taxa-spin" />
                    : <ArrowsClockwise size={16} weight="duotone" />
                }
                onClick={sincronizar}
                disabled={sincronizando}
                aria-busy={sincronizando}
              >
                {sincronizando
                  ? 'Sincronizando…'
                  : abaAtiva === 'atual' ? 'Sincronizar PTAX' : 'Sincronizar Focus'}
              </BotaoGlobal>
            </div>
          </div>
        }
      >
        {/* ═══════ ABA 1: Cotação Atual ═══════ */}
        {abaAtiva === 'atual' && (
          <div className="ws-fade-up">
            <div style={{ position: 'relative', zIndex: 10 }}>
              <TabelaGlobal<TaxaAtual>
                id="taxas-moeda-atual"
                idKey="moeda"
                dados={taxasAtuais}
                colunas={colunasAtual}
                acoesExportacao={getAcoesExportacaoPadrao(colunasAtual, 'taxas-moeda-atuais', 'Taxas de Moeda — Atuais')}
                mensagemVazio={carregando ? 'Carregando cotações…' : 'Nenhuma cotação armazenada. Clique em Sincronizar PTAX.'}
                mensagemSemFiltro="Nenhuma moeda encontrada."
                tooltipBusca="Localizar por moeda, fonte ou data"
              />
            </div>

            <div style={{
              background: 'rgba(129,140,248,0.06)',
              border: '1px solid rgba(129,140,248,0.15)',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              fontSize: '0.8125rem',
              color: 'var(--ws-muted)',
              lineHeight: 1.6,
              marginTop: '1.5rem',
            }}>
              💡 <strong style={{ color: 'var(--ws-text)' }}>Sincronização</strong> — A cotação PTAX é atualizada automaticamente <strong style={{ color: '#818cf8' }}>4 vezes por dia</strong> em dias úteis (10h03 / 11h03 / 12h03 / 13h03 BRT), gravando os boletins do <strong style={{ color: '#818cf8' }}>BCB/PTAX</strong>. O botão <strong style={{ color: 'var(--ws-text)' }}>Sincronizar PTAX</strong> dispara uma sincronização sob demanda — útil fora dos horários do cron ou para recuperar boletim que tenha falhado.
            </div>
          </div>
        )}

        {/* ═══════ ABA 2: Cotação Futura (BACEN Focus) ═══════ */}
        {abaAtiva === 'futura' && (
          <div className="ws-fade-up">
            <div style={{ position: 'relative', zIndex: 10 }}>
              <TabelaGlobal<PrevisaoLinha>
                id="previsao-taxa-futura-moeda"
                idKey="id"
                dados={previsoesLinhas}
                colunas={colunasPrevisao}
                acoesExportacao={getAcoesExportacaoPadrao(colunasPrevisao, 'previsao-taxa-futura-moeda', 'Previsão da Taxa Futura da Moeda — BACEN Focus')}
                mensagemVazio={carregandoPrevisao
                  ? 'Carregando previsões…'
                  : 'Nenhuma previsão armazenada. Clique em Sincronizar Focus.'}
                mensagemSemFiltro="Nenhuma previsão encontrada."
                tooltipBusca="Localizar por moeda, mês ou data"
              />
            </div>

            <div style={{
              background: 'rgba(129,140,248,0.06)',
              border: '1px solid rgba(129,140,248,0.15)',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              fontSize: '0.8125rem',
              color: 'var(--ws-muted)',
              lineHeight: 1.6,
              marginTop: '1.5rem',
            }}>
              💡 <strong style={{ color: 'var(--ws-text)' }}>Previsão da Taxa Futura da Moeda</strong> — Os valores acima são <strong style={{ color: '#818cf8' }}>projeções de mercado</strong> publicadas pelo <strong style={{ color: '#818cf8' }}>BACEN Focus</strong> (Expectativas de Mercado), <strong>não cotações negociadas</strong>. Sincronização automática <strong style={{ color: '#818cf8' }}>semanal (terça-feira 22h BRT)</strong>. O erro de previsão cresce rápido com o horizonte — projeções para 4+ meses têm margem alta. O Focus publica oficialmente apenas a série <strong>USD/BRL</strong>; demais moedas ficam sem dados de previsão.
            </div>
          </div>
        )}
      </PaginaGlobal>
    </>
  )
}
