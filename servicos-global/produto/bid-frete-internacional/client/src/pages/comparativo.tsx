/**
 * Comparativo.tsx — Ranking e Aprovacao de Respostas (T8)
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * Ranking de respostas por cotacao, aprovacao em 2 cliques,
 * rejeicao com motivo, sort por score/preco/transit/rating.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { useSincronizarTituloPaginaTopo } from '../shared/useSincronizarTituloPaginaTopo'
import {
  criarTituloCarregandoTopo,
  ConteudoCarregandoBidFreteInternacional,
} from '../shared/pagina-carregando-bid-frete-internacional'
import {
  Ranking,
  ArrowLeft,
  Trophy,
  CurrencyDollar,
  Timer,
  Star,
  CheckCircle,
  XCircle,
  SortAscending,
  SortDescending,
  Confetti,
  Package,
  SealCheck,
} from '@phosphor-icons/react'

import { rankingCotacoesBidFreteInternacional, reprovarTodas, getCotacao } from '../shared/api'
import { aplicarEstadoPosAprovacaoCotacao } from '../shared/sincronizar-estado-pos-aprovacao-cotacao-bid-frete-internacional'
import type { PropostaRankingBidFreteInternacional, Cotacao } from '../shared/types'
import {
  ModalAprovarPropostaBidFreteInternacional,
} from '../shared/modal-aprovar-proposta-bid-frete-internacional'
import {
  BannerEstadoAceiteComparativoBidFreteInternacional,
  BANNER_ESTADO_ACEITE_COMPARATIVO_STYLES,
} from '../shared/banner-estado-aceite-comparativo-bid-frete-internacional'
import {
  ModalFecharCotacaoBidFreteInternacional,
  resolverNomeFornecedorGanhadorCotacao,
} from '../shared/modal-fechar-cotacao-bid-frete-internacional'
import {
  resolverEstadoAceiteGanhadorComparativoBidFreteInternacional,
  resolverPropostaGanhadoraCotacaoBidFreteInternacional,
} from '../../../shared/estado-aceite-ganhador-comparativo-bid-frete-internacional'
import { ModalOverlay } from '@nucleo/modal-global'

// ─── Formatacao ─────────────────────────────────────────────────────────────

const moeda_ganho_bid_frete_internacional = (val: number, currency = 'USD') =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)

const dataBR = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// ─── Sort Options ───────────────────────────────────────────────────────────

type SortKey = 'ranking_geral' | 'valor_total_proposta_bid_frete_internacional' | 'dias_transito_proposta_bid_frete_internacional' | 'rating'

interface SortOption {
  key: SortKey
  label: string
  icone: React.ReactNode
}


// ─── Badge helpers ──────────────────────────────────────────────────────────

function RankBadge({ posicao }: { posicao: number }) {
  const cores: Record<number, { bg: string; color: string; border: string }> = {
    1: { bg: 'rgba(234,179,8,0.15)',  color: '#eab308', border: 'rgba(234,179,8,0.4)' },
    2: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
    3: { bg: 'rgba(180,83,9,0.12)',   color: '#d97706', border: 'rgba(180,83,9,0.3)' },
  }
  const c = cores[posicao] ?? { bg: 'rgba(100,116,139,0.1)', color: 'var(--text-muted, #64748b)', border: 'transparent' }

  return (
    <span
      className="bf-rank-badge"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {posicao <= 3 && <Trophy weight="duotone" size={12} />}
      {posicao}
    </span>
  )
}

function ScorePill({ score }: { score: number | null }) {
  if (score == null) return <span className="bf-score-na">N/A</span>
  const pct = Math.min(score, 100)
  const color =
    pct >= 80 ? 'var(--success, #22c55e)' :
    pct >= 60 ? 'var(--warning, #f59e0b)' :
    'var(--danger, #ef4444)'
  return (
    <div className="bf-score-pill">
      <div className="bf-score-bar" style={{ width: `${pct}%`, background: color }} />
      <span className="bf-score-value" style={{ color }}>{pct.toFixed(0)}</span>
    </div>
  )
}

function RatingStars({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="bf-text-muted">—</span>
  return (
    <span className="bf-rating">
      <Star weight="duotone" size={14} style={{ color: '#eab308' }} />
      <span>{rating.toFixed(1)}</span>
    </span>
  )
}

// ─── Componente Principal ───────────────────────────────────────────────────

export default function Comparativo() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { id_cotacao: id } = useParams<{ id_cotacao: string }>()

  // Voltar para a tela de origem; fallback detalhe da cotação em deep link/nova aba
  const voltarParaOrigem = useCallback(() => {
    if (location.key !== 'default') navigate(-1)
    else navigate(`/bid-frete/cotacoes/${id}`)
  }, [location.key, navigate, id])

  const [cotacao, setCotacao] = useState<Cotacao | null>(null)
  const [respostas, setRespostas] = useState<PropostaRankingBidFreteInternacional[]>([])
  const [carregando, setCarregando] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('ranking_geral')
  const [sortAsc, setSortAsc] = useState(false)

  // Modal de aprovacao
  const [modalAprovar, setModalAprovar] = useState(false)
  const [respostaSelecionada, setRespostaSelecionada] = useState<PropostaRankingBidFreteInternacional | null>(null)

  // Modal de reprovacao
  const [modalReprovar, setModalReprovar] = useState(false)
  const [motivoReprovar, setMotivoReprovar] = useState('')
  const [reprovando, setReprovando] = useState(false)

  // Resultado pos-aprovacao
  const [resultadoAprovacao, setResultadoAprovacao] = useState<Cotacao | null>(null)

  // Fechamento na plataforma
  const [modalFechar, setModalFechar] = useState(false)

  const SORT_OPTIONS: SortOption[] = [
    { key: 'ranking_geral',       label: t('bidfrete.comparativo.score_total'),  icone: <Trophy weight="duotone" size={14} /> },
    { key: 'valor_total_proposta_bid_frete_internacional',       label: t('bidfrete.comparativo.preco'),         icone: <CurrencyDollar weight="duotone" size={14} /> },
    { key: 'dias_transito_proposta_bid_frete_internacional', label: t('bidfrete.comparativo.transit_time'),  icone: <Timer weight="duotone" size={14} /> },
    { key: 'rating',            label: t('bidfrete.comparativo.rating'),         icone: <Star weight="duotone" size={14} /> },
  ]

  const carregar = useCallback(async () => {
    if (!id) return
    setCarregando(true)
    try {
      const [cotRes, rankRes] = await Promise.all([
        getCotacao(id),
        rankingCotacoesBidFreteInternacional(id),
      ])
      setCotacao(cotRes)
      setRespostas(rankRes)
    } catch {
      setRespostas([])
    } finally {
      setCarregando(false)
    }
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  const tituloTopo = useMemo(() => {
    if (carregando) {
      return criarTituloCarregandoTopo(<Ranking weight="duotone" size={22} />, t)
    }
    if (resultadoAprovacao) {
      return {
        label:     t('bidfrete.comparativo.titulo_aprovada'),
        icone:     <Confetti weight="duotone" size={22} />,
        subtitulo: `${t('bidfrete.cotacoes.titulo')} ${resultadoAprovacao.numero_cotacao_bid_frete_internacional}`,
      }
    }
    return {
      label:     t('bidfrete.comparativo.titulo'),
      icone:     <Ranking weight="duotone" size={22} />,
      subtitulo: cotacao
        ? `${cotacao.numero_cotacao_bid_frete_internacional} — ${cotacao.origem_nome_cotacao_bid_frete_internacional} → ${cotacao.destino_nome_cotacao_bid_frete_internacional}`
        : t('bidfrete.comparativo.subtitulo'),
      aoVoltar:  voltarParaOrigem,
    }
  }, [carregando, resultadoAprovacao, cotacao, t, voltarParaOrigem])

  useSincronizarTituloPaginaTopo(tituloTopo)

  const acoesComparativo = !resultadoAprovacao && cotacao?.status_cotacao_bid_frete_internacional === 'AGUARDANDO_APROVACAO' ? (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem' }}>
      <button className="btn btn-danger-outline" type="button" onClick={() => setModalReprovar(true)} disabled={respostas.length === 0}>
        <XCircle weight="duotone" size={16} />
        {t('bidfrete.comparativo.reprovar')}
      </button>
      <button className="btn btn-secondary" type="button" onClick={() => navigate(`/bid-frete/cotacoes/${id}`)}>
        <ArrowLeft weight="bold" size={14} />
        {t('comum.voltar')}
      </button>
    </div>
  ) : null

  // ─── Sort Logic ───────────────────────────────────────────────────────────

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(key === 'valor_total_proposta_bid_frete_internacional' || key === 'dias_transito_proposta_bid_frete_internacional')
    }
  }

  function getSortValue(r: PropostaRankingBidFreteInternacional): number {
    switch (sortKey) {
      case 'ranking_geral': return r.ranking_geral ?? 0
      case 'valor_total_proposta_bid_frete_internacional': return r.valor_total_proposta_bid_frete_internacional
      case 'dias_transito_proposta_bid_frete_internacional': return r.dias_transito_proposta_bid_frete_internacional
      case 'rating': return r.fornecedor?.nota_global_classificacao_bid_frete_internacional ?? 0
    }
  }

  const respostasOrdenadas = [...respostas].sort((a, b) => {
    const va = getSortValue(a)
    const vb = getSortValue(b)
    return sortAsc ? va - vb : vb - va
  })

  // ─── Acoes ────────────────────────────────────────────────────────────────

  function aoAprovarProposta(cotAtualizada: Cotacao) {
    const { cotacao: cotMesclada, propostasRanking: rankingSincronizado } =
      aplicarEstadoPosAprovacaoCotacao(cotacao, respostas, cotAtualizada)
    setCotacao(cotMesclada)
    setRespostas(rankingSincronizado)
    setResultadoAprovacao(cotMesclada)
    setModalAprovar(false)
    setRespostaSelecionada(null)
  }

  function fecharModalAprovar() {
    setModalAprovar(false)
    setRespostaSelecionada(null)
  }

  async function handleReprovar() {
    if (!id || !motivoReprovar.trim()) return
    setReprovando(true)
    try {
      await reprovarTodas(id, motivoReprovar.trim())
      navigate(`/bid-frete/cotacoes/${id}`)
    } catch {
      // erro tratado pelo loading state
    } finally {
      setReprovando(false)
    }
  }

  function abrirModalAprovar(resposta: PropostaRankingBidFreteInternacional) {
    setRespostaSelecionada(resposta)
    setModalAprovar(true)
  }

  // ─── Colunas TabelaGlobal ────────────────────────────────────────────────

  const colunas: TabelaGlobalColuna<any>[] = [
    {
      key: 'ranking_geral' as keyof PropostaRankingBidFreteInternacional,
      label: t('bidfrete.comparativo.rank'),
      tipo: 'numero',
      largura: 70,
      render: (_val: unknown, _row: PropostaRankingBidFreteInternacional, index?: number) => (
        <RankBadge posicao={(index ?? 0) + 1} />
      ),
    },
    {
      key: 'id_fornecedor_bid_frete_internacional',
      label: t('bidfrete.comparativo.fornecedor'),
      tipo: 'texto',
      largura: 180,
      render: (_val: unknown, row: PropostaRankingBidFreteInternacional) => (
        <div className="bf-fornecedor-cell">
          <span className="bf-fornecedor-nome">{row.fornecedor_nome ?? row.fornecedor?.nome_fornecedor_bid_frete_internacional ?? 'Fornecedor'}</span>
          {row.fornecedor?.nome_fantasia_fornecedor_bid_frete_internacional && (
            <span className="bf-fornecedor-fantasia">{row.fornecedor.nome_fantasia_fornecedor_bid_frete_internacional}</span>
          )}
        </div>
      ),
    },
    {
      key: 'valor_frete_proposta_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.resp_frete'),
      tipo: 'numero',
      largura: 130,
      align: 'right',
      render: (valor: unknown, row: PropostaRankingBidFreteInternacional) => {
        const val = valor as number
        return (
          <span className="bf-mono">{moeda_ganho_bid_frete_internacional(val, row.moeda_proposta_bid_frete_internacional)}</span>
        )
      },
    },
    {
      key: 'taxas_origem_proposta_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.resp_taxas_origem'),
      tipo: 'numero',
      largura: 120,
      align: 'right',
      render: (valor: unknown, row: PropostaRankingBidFreteInternacional) => {
        const val = valor as number
        return (
          <span className="bf-mono">{moeda_ganho_bid_frete_internacional(val, row.moeda_proposta_bid_frete_internacional)}</span>
        )
      },
    },
    {
      key: 'taxas_destino_proposta_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.resp_taxas_destino'),
      tipo: 'numero',
      largura: 120,
      align: 'right',
      render: (valor: unknown, row: PropostaRankingBidFreteInternacional) => {
        const val = valor as number
        return (
          <span className="bf-mono">{moeda_ganho_bid_frete_internacional(val, row.moeda_proposta_bid_frete_internacional)}</span>
        )
      },
    },
    {
      key: 'valor_total_proposta_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.resp_total'),
      tipo: 'numero',
      largura: 130,
      align: 'right',
      render: (valor: unknown, row: PropostaRankingBidFreteInternacional) => {
        const val = valor as number
        return (
          <span className="bf-mono bf-total">{moeda_ganho_bid_frete_internacional(val, row.moeda_proposta_bid_frete_internacional)}</span>
        )
      },
    },
    {
      key: 'dias_transito_proposta_bid_frete_internacional',
      label: t('bidfrete.comparativo.transit_time'),
      tipo: 'numero',
      largura: 110,
      align: 'center',
      render: (valor: unknown) => {
        const val = valor as number
        return (
          <span className="bf-transit">
            <Timer weight="duotone" size={14} />
            {val}d
          </span>
        )
      },
    },
    {
      key: 'dias_free_time_proposta_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.resp_free_time'),
      tipo: 'numero',
      largura: 100,
      align: 'center',
      render: (valor: unknown) => {
        const val = valor as number | null
        return (
          <span className="bf-mono">{val != null ? `${val}d` : '—'}</span>
        )
      },
    },
    {
      key: 'quantidade_transbordo_proposta_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.resp_transbordos'),
      tipo: 'numero',
      largura: 100,
      align: 'center',
      render: (valor: unknown) => {
        const val = valor as number
        return (
          <span className={`bf-transbordo ${val === 0 ? 'bf-transbordo--direto' : ''}`}>
            {val === 0 ? 'Direto' : val}
          </span>
        )
      },
    },
    {
      key: 'ranking_geral' as keyof PropostaRankingBidFreteInternacional,
      label: t('bidfrete.comparativo.rating'),
      tipo: 'numero',
      largura: 90,
      align: 'center',
      render: (_val: unknown, row: PropostaRankingBidFreteInternacional) => (
        <RatingStars rating={row.fornecedor?.nota_global_classificacao_bid_frete_internacional ?? null} />
      ),
    },
    {
      key: 'validade_proposta_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.resp_validade'),
      tipo: 'periodo',
      largura: 110,
      render: (valor: unknown) => dataBR(valor as string),
    },
  ]

  const permiteAprovar = cotacao?.status_cotacao_bid_frete_internacional === 'AGUARDANDO_APROVACAO'

  const propostaGanhadora = useMemo(
    () => resolverPropostaGanhadoraCotacaoBidFreteInternacional(
      cotacao?.propostas_bid_frete_internacional,
      cotacao?.id_fornecedor_vencedor_cotacao_bid_frete_internacional,
    ),
    [cotacao?.propostas_bid_frete_internacional, cotacao?.id_fornecedor_vencedor_cotacao_bid_frete_internacional],
  )

  const estadoAceiteGanhador = useMemo(
    () => resolverEstadoAceiteGanhadorComparativoBidFreteInternacional({
      status_cotacao_bid_frete_internacional: cotacao?.status_cotacao_bid_frete_internacional,
      proposta_ganhadora: propostaGanhadora,
    }),
    [cotacao?.status_cotacao_bid_frete_internacional, propostaGanhadora],
  )

  const nomeFornecedorGanhador = resolverNomeFornecedorGanhadorCotacao(cotacao)

  const acoes: TabelaGlobalAcao<PropostaRankingBidFreteInternacional>[] = permiteAprovar
    ? [
    {
      id: 'aprovar',
      icone: <CheckCircle weight="duotone" size={16} />,
      tooltip: t('bidfrete.comparativo.aprovar'),
      onClick: (item: PropostaRankingBidFreteInternacional) => abrirModalAprovar(item),
      disabled: (item: PropostaRankingBidFreteInternacional) =>
        item.status_proposta_bid_frete_internacional === 'APROVADA'
        || item.status_proposta_bid_frete_internacional === 'APROVACAO_RECEBIDA'
        || item.status_proposta_bid_frete_internacional === 'REPROVADA',
    },
  ]
    : []

  // ─── Render ───────────────────────────────────────────────────────────────

  // Se acabou de aprovar, mostra tela de confirmacao
  if (resultadoAprovacao) {
    return (
      <PaginaGlobal className="bf-comparativo bid-frete-page-shell">
        <div className="bf-aprovacao-result">
          <div className="bf-aprovacao-result-icon">
            <CheckCircle weight="duotone" size={64} />
          </div>
          <h2 className="bf-aprovacao-result-titulo">{t('bidfrete.comparativo.aprovacao_confirmada')}</h2>
          <p className="bf-aprovacao-result-sub">
            {t('bidfrete.comparativo.fornecedor_selecionado')}: <strong>{respostaSelecionada?.fornecedor_nome ?? respostaSelecionada?.fornecedor?.nome_fornecedor_bid_frete_internacional ?? t('bidfrete.comparativo.fornecedor')}</strong>
          </p>

          {resultadoAprovacao.ganho_valor_cotacao_bid_frete_internacional != null && resultadoAprovacao.ganho_valor_cotacao_bid_frete_internacional > 0 && (
            <div className="bf-saving-card">
              <div className="bf-saving-header">
                <CurrencyDollar weight="duotone" size={18} />
                <span>{t('bidfrete.comparativo.saving_obtido')}</span>
              </div>
              <div className="bf-saving-valores">
                <span className="bf-saving-valor">
                  {moeda_ganho_bid_frete_internacional(resultadoAprovacao.ganho_valor_cotacao_bid_frete_internacional, resultadoAprovacao.moeda_aprovada ?? 'USD')}
                </span>
                {resultadoAprovacao.ganho_percentual_cotacao_bid_frete_internacional != null && (
                  <span className="bf-saving-pct">
                    {resultadoAprovacao.ganho_percentual_cotacao_bid_frete_internacional.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="bf-aprovacao-result-acoes">
            <button className="btn btn-secondary" onClick={() => navigate(`/bid-frete/cotacoes/${id}`)}>
              <ArrowLeft weight="bold" size={14} />
              {t('bidfrete.comparativo.ver_cotacao')}
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/bid-frete/lista')}>
              {t('bidfrete.comparativo.voltar_cotacoes')}
            </button>
          </div>
        </div>

        <style>{comparativoStyles}</style>
      </PaginaGlobal>
    )
  }

  return (
    <PaginaGlobal className="bf-comparativo bid-frete-page-shell">
      {acoesComparativo}
      {!carregando && cotacao ? (
        <BannerEstadoAceiteComparativoBidFreteInternacional
          status_cotacao_bid_frete_internacional={cotacao.status_cotacao_bid_frete_internacional}
          proposta_ganhadora={propostaGanhadora}
          data_fechamento_cotacao_bid_frete_internacional={
            cotacao.data_fechamento_cotacao_bid_frete_internacional
          }
          acaoFechamento={
            estadoAceiteGanhador === 'aceite_confirmado' ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setModalFechar(true)}
              >
                <SealCheck weight="bold" size={14} />
                {t('bidfrete.comparativo.fechar_plataforma', 'Fechar na plataforma')}
              </button>
            ) : null
          }
        />
      ) : null}
      {/* ════════ Sort Buttons ════════ */}
      <div className="bf-sort-bar">
        <span className="bf-sort-label">{t('bidfrete.comparativo.ordenar_por')}:</span>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            className={`bf-sort-btn ${sortKey === opt.key ? 'bf-sort-btn--ativo' : ''}`}
            onClick={() => handleSort(opt.key)}
          >
            {opt.icone}
            {opt.label}
            {sortKey === opt.key && (
              sortAsc
                ? <SortAscending weight="bold" size={12} />
                : <SortDescending weight="bold" size={12} />
            )}
          </button>
        ))}
        <span className="bf-sort-count">
          {respostas.length} resposta{respostas.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ════════ Summary Cards ════════ */}
      {!carregando && respostas.length > 0 && cotacao && (
        <div className="bf-summary-row">
          <div className="bf-summary-card">
            <Package weight="duotone" size={18} />
            <div>
              <span className="bf-summary-label">{t('bidfrete.detalhe_cotacao.valor_alvo')}</span>
              <span className="bf-summary-valor bf-mono">
                {cotacao.valor_meta_cotacao_bid_frete_internacional != null ? moeda_ganho_bid_frete_internacional(cotacao.valor_meta_cotacao_bid_frete_internacional, cotacao.moeda_meta_cotacao_bid_frete_internacional ?? 'USD') : '—'}
              </span>
            </div>
          </div>
          <div className="bf-summary-card">
            <Trophy weight="duotone" size={18} />
            <div>
              <span className="bf-summary-label">{t('bidfrete.comparativo.melhor_oferta')}</span>
              <span className="bf-summary-valor bf-mono">
                {moeda_ganho_bid_frete_internacional(respostasOrdenadas[0]?.valor_total_proposta_bid_frete_internacional ?? 0, respostasOrdenadas[0]?.moeda_proposta_bid_frete_internacional ?? 'USD')}
              </span>
            </div>
          </div>
          <div className="bf-summary-card">
            <Timer weight="duotone" size={18} />
            <div>
              <span className="bf-summary-label">{t('bidfrete.comparativo.menor_transit')}</span>
              <span className="bf-summary-valor bf-mono">
                {Math.min(...respostas.map(r => r.dias_transito_proposta_bid_frete_internacional))}d
              </span>
            </div>
          </div>
          <div className="bf-summary-card">
            <Star weight="duotone" size={18} />
            <div>
              <span className="bf-summary-label">{t('bidfrete.comparativo.maior_rating')}</span>
              <span className="bf-summary-valor bf-mono">
                {Math.max(...respostas.map(r => r.fornecedor?.nota_global_classificacao_bid_frete_internacional ?? 0)).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      {carregando ? (
        <ConteudoCarregandoBidFreteInternacional />
      ) : respostas.length === 0 ? (
        <div className="bf-empty-state">
          <Ranking weight="duotone" size={48} />
          <h3>{t('bidfrete.comparativo.sem_respostas')}</h3>
          <p>{t('bidfrete.comparativo.aguardar')}</p>
          <button className="btn btn-secondary" onClick={() => navigate(`/bid-frete/cotacoes/${id}`)}>
            <ArrowLeft weight="bold" size={14} />
            {t('bidfrete.comparativo.voltar_cotacao')}
          </button>
        </div>
      ) : (
        <div className="bf-table-section">
          <TabelaGlobal
            dados={respostasOrdenadas}
            colunas={colunas}
            acoes={acoes}
            idKey="id_proposta_bid_frete_internacional"
            mensagemVazio={t('bidfrete.comparativo.sem_respostas')}
            tooltipBusca={t('bidfrete.detalhe_cotacao.buscar_fornecedor')}
          />
        </div>
      )}

      {/* ════════ Modal Aprovar ════════ */}
      <ModalAprovarPropostaBidFreteInternacional
        aberto={modalAprovar}
        id_cotacao_bid_frete_internacional={id ?? ''}
        proposta={respostaSelecionada}
        empresa_pagadora_taxa_fechamento_plataforma_gravity={
          cotacao?.empresa_pagadora_taxa_fechamento_plataforma_gravity
        }
        onFechar={fecharModalAprovar}
        onAprovado={aoAprovarProposta}
      />

      <ModalFecharCotacaoBidFreteInternacional
        aberto={modalFechar}
        cotacao={cotacao}
        nomeFornecedor={nomeFornecedorGanhador}
        aoFechar={() => setModalFechar(false)}
        aoSucesso={(cotacaoAtualizada) => {
          setCotacao(cotacaoAtualizada)
          setModalFechar(false)
        }}
      />

      {/* ════════ Modal Reprovar ════════ */}
      <ModalOverlay
        aberto={modalReprovar}
        aoFechar={() => !reprovando && setModalReprovar(false)}
        titulo={t('bidfrete.comparativo.modal_reprovar')}
        tamanho="md"
        semFechar={reprovando}
        fecharAoClicarOverlay={!reprovando}
        botoes={[
          {
            rotulo: t('comum.cancelar'),
            variante: 'secondary',
            ao_clicar: () => setModalReprovar(false),
            desabilitado: reprovando,
          },
          {
            rotulo: reprovando
              ? t('bidfrete.comparativo.reprovando')
              : t('bidfrete.comparativo.confirmar_reprovacao'),
            variante: 'danger',
            ao_clicar: () => void handleReprovar(),
            carregando: reprovando,
            desabilitado: reprovando || !motivoReprovar.trim(),
          },
        ]}
      >
        <p className="bf-modal-reprovar-texto">
          {t('bidfrete.comparativo.modal_reprovar_desc', { count: respostas.length })}
        </p>
        <textarea
          className="bf-modal-reprovar-textarea"
          placeholder={t('bidfrete.comparativo.motivo_placeholder')}
          value={motivoReprovar}
          onChange={e => setMotivoReprovar(e.target.value)}
          rows={4}
        />
      </ModalOverlay>

      <style>{comparativoStyles}</style>
    </PaginaGlobal>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const comparativoStyles = `
  /* ═══════════════════════════════════════════════════════ */
  /* BID FRETE INTERNACIONAL — Comparativo Styles          */
  /* Design System: Solid Slate (CSS Vars)                 */
  /* ═══════════════════════════════════════════════════════ */

  .bf-comparativo { }

  /* ── Sort Bar ── */
  .bf-sort-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0;
    flex-wrap: wrap;
  }

  .bf-sort-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted, #64748b);
    margin-right: 0.25rem;
  }

  .bf-sort-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-pill, 9999px);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--text-secondary, #94a3b8);
    background: var(--bg-surface, #334155);
    border: 1px solid var(--bg-elevated, #475569);
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }
  .bf-sort-btn:hover {
    background: var(--bg-elevated, #475569);
    color: var(--text-primary, #f1f5f9);
  }
  .bf-sort-btn--ativo {
    background: rgba(99,102,241,0.15);
    color: var(--accent, #6366f1);
    border-color: rgba(99,102,241,0.3);
  }

  .bf-sort-count {
    margin-left: auto;
    font-size: 0.8125rem;
    color: var(--text-muted, #64748b);
  }

  /* ── Summary Row ── */
  .bf-summary-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  @media (max-width: 900px) {
    .bf-summary-row { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 500px) {
    .bf-summary-row { grid-template-columns: 1fr; }
  }

  .bf-summary-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--bg-surface, #334155);
    border-radius: var(--radius-lg, 12px);
    padding: 0.875rem 1rem;
    color: var(--text-muted, #64748b);
  }
  .bf-summary-card > div {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }
  .bf-summary-label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted, #64748b);
  }
  .bf-summary-valor {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary, #f1f5f9);
  }

  /* ── Table Section ── */
  .bf-table-section {
    background: var(--bg-surface, #334155);
    border-radius: var(--radius-lg, 12px);
    overflow: hidden;
  }

  /* ── Rank Badge ── */
  .bf-rank-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    min-width: 2rem;
    padding: 0.2rem 0.5rem;
    border-radius: var(--radius-pill, 9999px);
    font-size: 0.8125rem;
    font-weight: 700;
    font-family: 'DM Mono', monospace;
  }

  /* ── Fornecedor Cell ── */
  .bf-fornecedor-cell {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }
  .bf-fornecedor-nome {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-primary, #f1f5f9);
  }
  .bf-fornecedor-fantasia {
    font-size: 0.6875rem;
    color: var(--text-muted, #64748b);
  }

  /* ── Mono values ── */
  .bf-mono {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
  }
  .bf-total {
    font-weight: 700;
    color: var(--text-primary, #f1f5f9);
  }

  /* ── Transit ── */
  .bf-transit {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary, #94a3b8);
  }

  /* ── Transbordo ── */
  .bf-transbordo {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    color: var(--text-secondary, #94a3b8);
  }
  .bf-transbordo--direto {
    color: var(--success, #22c55e);
    font-weight: 600;
  }

  /* ── Score pill ── */
  .bf-score-pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 80px;
  }
  .bf-score-bar {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: var(--bg-elevated, #475569);
    position: relative;
    overflow: hidden;
  }
  .bf-score-value {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    min-width: 1.5rem;
    text-align: right;
  }
  .bf-score-na {
    font-size: 0.75rem;
    color: var(--text-muted, #64748b);
  }

  /* ── Rating ── */
  .bf-rating {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-primary, #f1f5f9);
  }

  .bf-text-muted {
    color: var(--text-muted, #64748b);
  }

  /* ── Empty State ── */
  .bf-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 4rem 2rem;
    color: var(--text-muted, #64748b);
    text-align: center;
  }
  .bf-empty-state h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-secondary, #94a3b8);
    margin: 0;
  }
  .bf-empty-state p {
    font-size: 0.875rem;
    max-width: 400px;
    margin: 0;
  }

  /* ── Modal reprovar (ModalOverlay padrão) ── */
  .bf-modal-reprovar-texto {
    font-size: 0.875rem;
    color: var(--text-secondary, #94a3b8);
    margin: 0 0 1rem;
    line-height: 1.5;
  }
  .bf-modal-reprovar-textarea {
    width: 100%;
    min-height: 100px;
    background: var(--bg-base, #1e293b);
    border: 1px solid var(--bg-elevated, #475569);
    border-radius: var(--radius-md, 8px);
    padding: 0.75rem;
    font-size: 0.875rem;
    color: var(--text-primary, #f1f5f9);
    font-family: 'Plus Jakarta Sans', sans-serif;
    resize: vertical;
  }
  .bf-modal-reprovar-textarea:focus {
    outline: none;
    border-color: var(--accent, #6366f1);
    box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
  }

  /* ── Aprovacao Result ── */
  .bf-aprovacao-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem 2rem;
    text-align: center;
  }
  .bf-aprovacao-result-icon {
    color: var(--success, #22c55e);
    animation: bf-pulse 1s ease-out;
  }
  @keyframes bf-pulse {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  .bf-aprovacao-result-titulo {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary, #f1f5f9);
    margin: 0;
  }
  .bf-aprovacao-result-sub {
    font-size: 0.875rem;
    color: var(--text-secondary, #94a3b8);
    margin: 0;
  }
  .bf-aprovacao-result-sub strong {
    color: var(--text-primary, #f1f5f9);
  }
  .bf-aprovacao-result-acoes {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  /* ── Saving Card ── */
  .bf-saving-card {
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.2);
    border-radius: var(--radius-lg, 12px);
    padding: 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 240px;
  }
  .bf-saving-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--success, #22c55e);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .bf-saving-valores {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }
  .bf-saving-valor {
    font-family: 'DM Mono', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--success, #22c55e);
  }
  .bf-saving-pct {
    font-family: 'DM Mono', monospace;
    font-size: 1rem;
    font-weight: 600;
    color: var(--success, #22c55e);
    opacity: 0.8;
  }

  /* ── Botoes ── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
    border-radius: var(--radius-pill, 9999px);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    border: none;
    font-family: inherit;
  }
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .btn-primary {
    background: var(--accent, #6366f1);
    color: #fff;
  }
  .btn-primary:hover:not(:disabled) { background: var(--accent-hover, #4f46e5); }
  .btn-secondary {
    background: var(--bg-surface, #334155);
    color: var(--text-secondary, #94a3b8);
    border: 1px solid var(--bg-elevated, #475569);
  }
  .btn-secondary:hover:not(:disabled) {
    background: var(--bg-elevated, #475569);
    color: var(--text-primary, #f1f5f9);
  }
  .btn-success {
    background: var(--success, #22c55e);
    color: #fff;
  }
  .btn-success:hover:not(:disabled) { background: #16a34a; }
  .btn-danger {
    background: var(--danger, #ef4444);
    color: #fff;
  }
  .btn-danger:hover:not(:disabled) { background: #dc2626; }
  .btn-danger-outline {
    background: transparent;
    color: var(--danger, #ef4444);
    border: 1px solid rgba(239,68,68,0.3);
  }
  .btn-danger-outline:hover:not(:disabled) {
    background: rgba(239,68,68,0.1);
  }

  ${BANNER_ESTADO_ACEITE_COMPARATIVO_STYLES}
`
