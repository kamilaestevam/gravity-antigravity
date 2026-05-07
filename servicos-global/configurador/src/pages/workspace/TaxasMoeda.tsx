import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useShellStore } from '@gravity/shell'
import {
  CurrencyCircleDollar,
  ArrowsClockwise,
  CircleNotch,
  Clock,
  ChartLine,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'

// ---------------------------------------------------------------------------
// Tipos
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
type MoedaSuportada = typeof MOEDAS_ORDEM[number]

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

/**
 * Pill de período — destaca "atual" / "média 30d" no título do card.
 * Usa accent indigo (#818cf8) do design system Solid Slate.
 */
function PillPeriodo({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block',
      marginLeft: '0.4rem',
      padding: '2px 8px',
      borderRadius: '10px',
      fontSize: '0.65rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: '#818cf8',
      background: 'rgba(129,140,248,0.10)',
      border: '1px solid rgba(129,140,248,0.25)',
      verticalAlign: 'middle',
    }}>
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

type AbaTaxaMoeda = 'atual' | 'historico'

export function TaxasMoeda() {
  const { getToken } = useAuth()
  const { addNotification } = useShellStore()

  const [abaAtiva, setAbaAtiva] = useState<AbaTaxaMoeda>('atual')
  const [taxasAtuais, setTaxasAtuais] = useState<TaxaAtual[]>([])
  const [historico, setHistorico] = useState<TaxaItem[]>([])
  const [historico30dPorMoeda, setHistorico30dPorMoeda] = useState<Record<string, TaxaItem[]>>({})
  const [moedaHistorico, setMoedaHistorico] = useState<MoedaSuportada>('USD')
  const [sincronizando, setSincronizando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [ultimaSync, setUltimaSync] = useState<string | null>(null)

  // ── Buscar taxas atuais ──────────────────────────────────────────────────

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

  // ── Buscar histórico ─────────────────────────────────────────────────────

  const buscarHistorico = useCallback(async (moeda: string) => {
    try {
      const res = await fetch(`/api/v1/taxas-moeda/historico?moeda=${moeda}&dias=30`)
      if (!res.ok) throw new Error('Falha ao buscar histórico')
      const json = await res.json()
      const lista: TaxaItem[] = json.historico ?? []
      setHistorico(lista)
      setHistorico30dPorMoeda(prev => ({ ...prev, [moeda]: lista }))
    } catch {
      setHistorico([])
    }
  }, [])

  useEffect(() => { buscarTaxas() }, [buscarTaxas])
  useEffect(() => {
    if (abaAtiva === 'historico') buscarHistorico(moedaHistorico)
  }, [abaAtiva, moedaHistorico, buscarHistorico])

  // Pre-fetch dos históricos de USD e EUR — alimenta os KPIs quando a aba
  // 'historico' estiver ativa, mesmo sem o usuário ter selecionado essas
  // moedas no pill. Roda 1x no mount.
  useEffect(() => {
    void buscarHistorico('USD')
    void buscarHistorico('EUR')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Médias 30 dias ───────────────────────────────────────────────────────

  const calcularMediaMoeda = useCallback((moeda: string) => {
    const lista = historico30dPorMoeda[moeda] ?? []
    if (lista.length === 0) return { compra: null, venda: null, total: 0, min: null, max: null }
    const compras = lista.map(r => Number(r.compra)).filter(n => !isNaN(n))
    const vendas = lista.map(r => Number(r.venda)).filter(n => !isNaN(n))
    return {
      compra: compras.length ? compras.reduce((a, b) => a + b, 0) / compras.length : null,
      venda: vendas.length ? vendas.reduce((a, b) => a + b, 0) / vendas.length : null,
      total: lista.length,
      min: vendas.length ? Math.min(...vendas) : null,
      max: vendas.length ? Math.max(...vendas) : null,
    }
  }, [historico30dPorMoeda])

  const media30dUSD = calcularMediaMoeda('USD')
  const media30dEUR = calcularMediaMoeda('EUR')

  // ── Sincronizar ──────────────────────────────────────────────────────────

  const sincronizar = async () => {
    setSincronizando(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/v1/taxas-moeda/sync', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

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
        if (abaAtiva === 'historico') await buscarHistorico(moedaHistorico)
        addNotification({
          type: totalErro > 0 ? 'warning' : 'success',
          message: totalErro > 0
            ? `Sincronizado parcialmente: ${totalOk} ok, ${totalErro} com erro`
            : `Sincronização concluída: ${totalOk} moeda(s) atualizada(s)`,
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro de comunicação'
      addNotification({ type: 'error', message: `Falha na sincronização: ${msg}` })
    } finally {
      setSincronizando(false)
    }
  }

  // ── KPIs ─────────────────────────────────────────────────────────────────

  const taxaUSD = taxasAtuais.find(t => t.moeda === 'USD')
  const taxaEUR = taxasAtuais.find(t => t.moeda === 'EUR')
  const moedasComDados = taxasAtuais.filter(t => t.venda != null).length

  // ── Colunas — Cotações Atuais ────────────────────────────────────────────

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

  // ── Colunas — Histórico ──────────────────────────────────────────────────

  const colunasHistorico: TabelaGlobalColuna<TaxaItem>[] = [
    {
      key: 'data_cotacao',
      label: 'Data',
      tipo: 'periodo',
      getValorBruto: (row) => row.data_cotacao
        ? new Date(row.data_cotacao).toISOString().split('T')[0]
        : '',
      render: (_, row) => fmtData(row.data_cotacao),
    },
    {
      key: 'compra',
      label: 'Compra (R$)',
      tipo: 'numero',
      getValorBruto: (row) => String(row.compra),
      render: (_, row) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtTaxa(row.compra)}</span>,
    },
    {
      key: 'venda',
      label: 'Venda (R$)',
      tipo: 'numero',
      getValorBruto: (row) => String(row.venda),
      render: (_, row) => <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{fmtTaxa(row.venda)}</span>,
    },
    {
      key: 'hora_cotacao',
      label: 'Hora',
      tipo: 'texto',
      getValorBruto: (row) => row.hora_cotacao ?? '',
      render: (_, row) => row.hora_cotacao ?? '—',
    },
    {
      key: 'fonte',
      label: 'Fonte',
      tipo: 'texto',
      getValorBruto: (row) => row.fonte ?? '',
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
            subtitulo="Cotações PTAX oficiais do Banco Central do Brasil"
            icone={<CurrencyCircleDollar weight="duotone" size={22} color="#818cf8" />}
          />
        }
        stats={
          abaAtiva === 'atual' ? (
            <>
              {/* ═══════ KPIs ABA 1: Cotação atual ═══════ */}
              <CardEstatisticaGlobal
                titulo={<>USD / BRL <PillPeriodo>Atual</PillPeriodo></>}
                icone={<CurrencyCircleDollar weight="duotone" size={16} />}
                valor={<span style={{ fontSize: '1.5rem' }}>{taxaUSD?.venda != null ? `R$ ${fmtTaxa(taxaUSD.venda)}` : '—'}</span>}
                subtexto={taxaUSD?.compra != null ? `Compra: R$ ${fmtTaxa(taxaUSD.compra)}` : 'Sincronize para atualizar'}
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
              <CardEstatisticaGlobal
                titulo={<>EUR / BRL <PillPeriodo>Atual</PillPeriodo></>}
                icone={<CurrencyCircleDollar weight="duotone" size={16} />}
                valor={<span style={{ fontSize: '1.5rem' }}>{taxaEUR?.venda != null ? `R$ ${fmtTaxa(taxaEUR.venda)}` : '—'}</span>}
                subtexto={taxaEUR?.compra != null ? `Compra: R$ ${fmtTaxa(taxaEUR.compra)}` : 'Sincronize para atualizar'}
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
              <CardEstatisticaGlobal
                titulo="Moedas ativas"
                icone={<ChartLine weight="duotone" size={16} />}
                valor={<span style={{ fontSize: '1.75rem' }}>{moedasComDados}</span>}
                subtexto={`de ${MOEDAS_ORDEM.length} moedas suportadas`}
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
              {/* ═══════ KPIs ABA 2: Média 30 dias ═══════ */}
              <CardEstatisticaGlobal
                titulo={<>USD / BRL <PillPeriodo>Média 30d</PillPeriodo></>}
                icone={<CurrencyCircleDollar weight="duotone" size={16} />}
                valor={<span style={{ fontSize: '1.5rem' }}>{media30dUSD.venda != null ? `R$ ${fmtTaxa(media30dUSD.venda)}` : '—'}</span>}
                subtexto={media30dUSD.compra != null
                  ? `Compra média: R$ ${fmtTaxa(media30dUSD.compra)} · ${media30dUSD.total} boletins`
                  : 'Sem histórico nos últimos 30 dias'}
                tooltip={
                  <>
                    <p className="cg-tooltip__title">DÓLAR AMERICANO · MÉDIA 30 DIAS</p>
                    <div className="cg-tooltip__row">
                      <span>Compra (média)</span>
                      <strong>{media30dUSD.compra != null ? `R$ ${fmtTaxa(media30dUSD.compra)}` : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Venda (média)</span>
                      <strong style={{ color: '#34d399' }}>{media30dUSD.venda != null ? `R$ ${fmtTaxa(media30dUSD.venda)}` : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__divider" />
                    <div className="cg-tooltip__row">
                      <span>Mínima (venda)</span>
                      <strong>{media30dUSD.min != null ? `R$ ${fmtTaxa(media30dUSD.min)}` : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Máxima (venda)</span>
                      <strong>{media30dUSD.max != null ? `R$ ${fmtTaxa(media30dUSD.max)}` : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__divider" />
                    <div className="cg-tooltip__row">
                      <span>Boletins no período</span>
                      <strong>{media30dUSD.total}</strong>
                    </div>
                  </>
                }
              />
              <CardEstatisticaGlobal
                titulo={<>EUR / BRL <PillPeriodo>Média 30d</PillPeriodo></>}
                icone={<CurrencyCircleDollar weight="duotone" size={16} />}
                valor={<span style={{ fontSize: '1.5rem' }}>{media30dEUR.venda != null ? `R$ ${fmtTaxa(media30dEUR.venda)}` : '—'}</span>}
                subtexto={media30dEUR.compra != null
                  ? `Compra média: R$ ${fmtTaxa(media30dEUR.compra)} · ${media30dEUR.total} boletins`
                  : 'Sem histórico nos últimos 30 dias'}
                tooltip={
                  <>
                    <p className="cg-tooltip__title">EURO · MÉDIA 30 DIAS</p>
                    <div className="cg-tooltip__row">
                      <span>Compra (média)</span>
                      <strong>{media30dEUR.compra != null ? `R$ ${fmtTaxa(media30dEUR.compra)}` : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Venda (média)</span>
                      <strong style={{ color: '#34d399' }}>{media30dEUR.venda != null ? `R$ ${fmtTaxa(media30dEUR.venda)}` : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__divider" />
                    <div className="cg-tooltip__row">
                      <span>Mínima (venda)</span>
                      <strong>{media30dEUR.min != null ? `R$ ${fmtTaxa(media30dEUR.min)}` : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Máxima (venda)</span>
                      <strong>{media30dEUR.max != null ? `R$ ${fmtTaxa(media30dEUR.max)}` : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__divider" />
                    <div className="cg-tooltip__row">
                      <span>Boletins no período</span>
                      <strong>{media30dEUR.total}</strong>
                    </div>
                  </>
                }
              />
              <CardEstatisticaGlobal
                titulo={<>Boletins <PillPeriodo>30d</PillPeriodo></>}
                icone={<ChartLine weight="duotone" size={16} />}
                valor={<span style={{ fontSize: '1.75rem' }}>{historico.length}</span>}
                subtexto={`${moedaHistorico} nos últimos 30 dias`}
                tooltip={
                  <>
                    <p className="cg-tooltip__title">VOLUME DE HISTÓRICO · {moedaHistorico}</p>
                    <div className="cg-tooltip__row">
                      <span>Boletins de {moedaHistorico}</span>
                      <strong style={{ color: '#34d399' }}>{historico.length}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Média compra</span>
                      <strong>{calcularMediaMoeda(moedaHistorico).compra != null ? `R$ ${fmtTaxa(calcularMediaMoeda(moedaHistorico).compra!)}` : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__row">
                      <span>Média venda</span>
                      <strong>{calcularMediaMoeda(moedaHistorico).venda != null ? `R$ ${fmtTaxa(calcularMediaMoeda(moedaHistorico).venda!)}` : '—'}</strong>
                    </div>
                    <div className="cg-tooltip__divider" />
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>
                      Trocar moeda: pills abaixo da tabela
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
                Cotações Atuais
              </button>
              <button
                role="tab"
                aria-selected={abaAtiva === 'historico'}
                className={`ws-tab${abaAtiva === 'historico' ? ' active' : ''}`}
                onClick={() => setAbaAtiva('historico')}
              >
                Histórico — 30 dias
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
                {sincronizando ? 'Sincronizando…' : 'Sincronizar PTAX'}
              </BotaoGlobal>
            </div>
          </div>
        }
      >
        {/* ═══════ ABA 1: Cotações Atuais ═══════ */}
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
          </div>
        )}

        {/* ═══════ ABA 2: Histórico ═══════ */}
        {abaAtiva === 'historico' && (
          <div className="ws-fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>Moeda:</span>
              {MOEDAS_ORDEM.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMoedaHistorico(m)}
                  className={`ws-tab${moedaHistorico === m ? ' active' : ''}`}
                  style={{ padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}
                >
                  {m}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', zIndex: 10 }}>
              <TabelaGlobal<TaxaItem>
                id={`taxas-moeda-historico-${moedaHistorico}`}
                idKey="id"
                dados={historico}
                colunas={colunasHistorico}
                acoesExportacao={getAcoesExportacaoPadrao(colunasHistorico, `taxas-moeda-historico-${moedaHistorico}`, `Taxas de Moeda — Histórico ${moedaHistorico}`)}
                mensagemVazio={`Nenhum histórico de ${moedaHistorico} armazenado.`}
                mensagemSemFiltro={`Nenhum histórico de ${moedaHistorico} encontrado.`}
                tooltipBusca="Localizar por data, hora ou fonte"
              />
            </div>
          </div>
        )}
      </PaginaGlobal>
    </>
  )
}
