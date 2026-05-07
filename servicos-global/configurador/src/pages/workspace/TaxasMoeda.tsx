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
      setHistorico(json.historico ?? [])
    } catch {
      setHistorico([])
    }
  }, [])

  useEffect(() => { buscarTaxas() }, [buscarTaxas])
  useEffect(() => {
    if (abaAtiva === 'historico') buscarHistorico(moedaHistorico)
  }, [abaAtiva, moedaHistorico, buscarHistorico])

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
          <>
            <CardEstatisticaGlobal
              titulo="USD / BRL"
              icone={<CurrencyCircleDollar weight="duotone" size={16} />}
              valor={<span style={{ fontSize: '1.5rem' }}>{taxaUSD?.venda != null ? `R$ ${fmtTaxa(taxaUSD.venda)}` : '—'}</span>}
              subtexto={taxaUSD?.compra != null ? `Compra: R$ ${fmtTaxa(taxaUSD.compra)}` : 'Sincronize para atualizar'}
            />
            <CardEstatisticaGlobal
              titulo="EUR / BRL"
              icone={<CurrencyCircleDollar weight="duotone" size={16} />}
              valor={<span style={{ fontSize: '1.5rem' }}>{taxaEUR?.venda != null ? `R$ ${fmtTaxa(taxaEUR.venda)}` : '—'}</span>}
              subtexto={taxaEUR?.compra != null ? `Compra: R$ ${fmtTaxa(taxaEUR.compra)}` : 'Sincronize para atualizar'}
            />
            <CardEstatisticaGlobal
              titulo="Moedas ativas"
              icone={<ChartLine weight="duotone" size={16} />}
              valor={<span style={{ fontSize: '1.75rem' }}>{moedasComDados}</span>}
              subtexto={`de ${MOEDAS_ORDEM.length} moedas suportadas`}
            />
          </>
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
