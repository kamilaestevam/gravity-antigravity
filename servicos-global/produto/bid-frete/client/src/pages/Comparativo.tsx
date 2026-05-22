/**
 * Comparativo.tsx — Ranking e Aprovacao de Respostas (T8)
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * Ranking de respostas por cotacao, aprovacao em 2 cliques,
 * rejeicao com motivo, sort por score/preco/transit/rating.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
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
  Warning,
  Package,
} from '@phosphor-icons/react'

import { getRanking, aprovarResposta, reprovarTodas, getCotacao } from '../shared/api'
import type { BidResponse, Cotacao } from '../shared/types'

// ─── Formatacao ─────────────────────────────────────────────────────────────

const moeda = (val: number, currency = 'USD') =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)

const dataBR = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// ─── Sort Options ───────────────────────────────────────────────────────────

type SortKey = 'score_total' | 'valor_total' | 'transit_time_dias' | 'rating'

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

// ─── Modal Overlay ──────────────────────────────────────────────────────────

interface ModalProps {
  aberto: boolean
  titulo: string
  icone: React.ReactNode
  children: React.ReactNode
  onFechar: () => void
}

function ModalOverlay({ aberto, titulo, icone, children, onFechar }: ModalProps) {
  if (!aberto) return null
  return (
    <div className="bf-modal-overlay" onClick={onFechar}>
      <div className="bf-modal" onClick={e => e.stopPropagation()}>
        <div className="bf-modal-header">
          {icone}
          <h3 className="bf-modal-titulo">{titulo}</h3>
          <button className="bf-modal-fechar" onClick={onFechar}>
            <XCircle weight="duotone" size={20} />
          </button>
        </div>
        <div className="bf-modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Componente Principal ───────────────────────────────────────────────────

export default function Comparativo() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id_cotacao: id } = useParams<{ id_cotacao: string }>()

  const [cotacao, setCotacao] = useState<Cotacao | null>(null)
  const [respostas, setRespostas] = useState<BidResponse[]>([])
  const [carregando, setCarregando] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('score_total')
  const [sortAsc, setSortAsc] = useState(false)

  // Modal de aprovacao
  const [modalAprovar, setModalAprovar] = useState(false)
  const [respostaSelecionada, setRespostaSelecionada] = useState<BidResponse | null>(null)
  const [aprovando, setAprovando] = useState(false)

  // Modal de reprovacao
  const [modalReprovar, setModalReprovar] = useState(false)
  const [motivoReprovar, setMotivoReprovar] = useState('')
  const [reprovando, setReprovando] = useState(false)

  // Resultado pos-aprovacao
  const [resultadoAprovacao, setResultadoAprovacao] = useState<Cotacao | null>(null)

  const SORT_OPTIONS: SortOption[] = [
    { key: 'score_total',       label: t('bidfrete.comparativo.score_total'),  icone: <Trophy weight="duotone" size={14} /> },
    { key: 'valor_total',       label: t('bidfrete.comparativo.preco'),         icone: <CurrencyDollar weight="duotone" size={14} /> },
    { key: 'transit_time_dias', label: t('bidfrete.comparativo.transit_time'),  icone: <Timer weight="duotone" size={14} /> },
    { key: 'rating',            label: t('bidfrete.comparativo.rating'),         icone: <Star weight="duotone" size={14} /> },
  ]

  const carregar = useCallback(async () => {
    if (!id) return
    setCarregando(true)
    try {
      const [cotRes, rankRes] = await Promise.all([
        getCotacao(id),
        getRanking(id),
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

  // ─── Sort Logic ───────────────────────────────────────────────────────────

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(key === 'valor_total' || key === 'transit_time_dias')
    }
  }

  function getSortValue(r: BidResponse): number {
    switch (sortKey) {
      case 'score_total': return r.score_total ?? 0
      case 'valor_total': return r.valor_total
      case 'transit_time_dias': return r.transit_time_dias
      case 'rating': return r.fornecedor?.rating_global ?? 0
    }
  }

  const respostasOrdenadas = [...respostas].sort((a, b) => {
    const va = getSortValue(a)
    const vb = getSortValue(b)
    return sortAsc ? va - vb : vb - va
  })

  // ─── Acoes ────────────────────────────────────────────────────────────────

  async function handleAprovar() {
    if (!id || !respostaSelecionada) return
    setAprovando(true)
    try {
      const result = await aprovarResposta(id, respostaSelecionada.id)
      setResultadoAprovacao(result)
      setModalAprovar(false)
    } catch {
      // erro tratado pelo loading state
    } finally {
      setAprovando(false)
    }
  }

  async function handleReprovar() {
    if (!id || !motivoReprovar.trim()) return
    setReprovando(true)
    try {
      await reprovarTodas(id, motivoReprovar.trim())
      navigate(`/cotacoes/${id}`)
    } catch {
      // erro tratado pelo loading state
    } finally {
      setReprovando(false)
    }
  }

  function abrirModalAprovar(resposta: BidResponse) {
    setRespostaSelecionada(resposta)
    setModalAprovar(true)
  }

  // ─── Colunas TabelaGlobal ────────────────────────────────────────────────

  const colunas: TabelaGlobalColuna<BidResponse>[] = [
    {
      key: 'score_total' as keyof BidResponse,
      label: t('bidfrete.comparativo.rank'),
      tipo: 'numero',
      largura: 70,
      render: (_val: number | null, _row: BidResponse, index?: number) => (
        <RankBadge posicao={(index ?? 0) + 1} />
      ),
    },
    {
      key: 'fornecedor_id',
      label: t('bidfrete.comparativo.fornecedor'),
      tipo: 'texto',
      largura: 180,
      render: (_val: string, row: BidResponse) => (
        <div className="bf-fornecedor-cell">
          <span className="bf-fornecedor-nome">{row.fornecedor?.nome ?? 'Fornecedor'}</span>
          {row.fornecedor?.nome_fantasia && (
            <span className="bf-fornecedor-fantasia">{row.fornecedor.nome_fantasia}</span>
          )}
        </div>
      ),
    },
    {
      key: 'valor_frete',
      label: t('bidfrete.detalhe_cotacao.resp_frete'),
      tipo: 'numero',
      largura: 130,
      align: 'right',
      render: (val: number, row: BidResponse) => (
        <span className="bf-mono">{moeda(val, row.moeda)}</span>
      ),
    },
    {
      key: 'taxas_origem',
      label: t('bidfrete.detalhe_cotacao.resp_taxas_origem'),
      tipo: 'numero',
      largura: 120,
      align: 'right',
      render: (val: number, row: BidResponse) => (
        <span className="bf-mono">{moeda(val, row.moeda)}</span>
      ),
    },
    {
      key: 'taxas_destino',
      label: t('bidfrete.detalhe_cotacao.resp_taxas_destino'),
      tipo: 'numero',
      largura: 120,
      align: 'right',
      render: (val: number, row: BidResponse) => (
        <span className="bf-mono">{moeda(val, row.moeda)}</span>
      ),
    },
    {
      key: 'valor_total',
      label: t('bidfrete.detalhe_cotacao.resp_total'),
      tipo: 'numero',
      largura: 130,
      align: 'right',
      render: (val: number, row: BidResponse) => (
        <span className="bf-mono bf-total">{moeda(val, row.moeda)}</span>
      ),
    },
    {
      key: 'transit_time_dias',
      label: t('bidfrete.comparativo.transit_time'),
      tipo: 'numero',
      largura: 110,
      align: 'center',
      render: (val: number) => (
        <span className="bf-transit">
          <Timer weight="duotone" size={14} />
          {val}d
        </span>
      ),
    },
    {
      key: 'free_time_dias',
      label: t('bidfrete.detalhe_cotacao.resp_free_time'),
      tipo: 'numero',
      largura: 100,
      align: 'center',
      render: (val: number | null) => (
        <span className="bf-mono">{val != null ? `${val}d` : '—'}</span>
      ),
    },
    {
      key: 'transbordos',
      label: t('bidfrete.detalhe_cotacao.resp_transbordos'),
      tipo: 'numero',
      largura: 100,
      align: 'center',
      render: (val: number) => (
        <span className={`bf-transbordo ${val === 0 ? 'bf-transbordo--direto' : ''}`}>
          {val === 0 ? t('bidfrete.comparativo.direto') : val}
        </span>
      ),
    },
    {
      key: 'score_total' as keyof BidResponse,
      label: t('bidfrete.comparativo.rating'),
      tipo: 'numero',
      largura: 90,
      align: 'center',
      render: (_val: number | null, row: BidResponse) => (
        <RatingStars rating={row.fornecedor?.rating_global ?? null} />
      ),
    },
    {
      key: 'validade',
      label: t('bidfrete.detalhe_cotacao.resp_validade'),
      tipo: 'periodo',
      largura: 110,
      render: (val: string) => dataBR(val),
    },
  ]

  const acoes: TabelaGlobalAcao<BidResponse>[] = [
    {
      id: 'aprovar',
      icone: <CheckCircle weight="duotone" size={16} />,
      tooltip: t('bidfrete.comparativo.aprovar'),
      onClick: (item: BidResponse) => abrirModalAprovar(item),
    },
  ]

  // ─── Render ───────────────────────────────────────────────────────────────

  // Se acabou de aprovar, mostra tela de confirmacao
  if (resultadoAprovacao) {
    return (
      <PaginaGlobal
        className="bf-comparativo"
        cabecalho={
          <CabecalhoGlobal
            icone={<Confetti weight="duotone" size={22} />}
            titulo={t('bidfrete.comparativo.titulo_aprovada')}
            subtitulo={`${t('bidfrete.cotacoes.titulo')} ${resultadoAprovacao.numero}`}
          />
        }
      >
        <div className="bf-aprovacao-result">
          <div className="bf-aprovacao-result-icon">
            <CheckCircle weight="duotone" size={64} />
          </div>
          <h2 className="bf-aprovacao-result-titulo">{t('bidfrete.comparativo.aprovacao_confirmada')}</h2>
          <p className="bf-aprovacao-result-sub">
            {t('bidfrete.comparativo.fornecedor_selecionado')}: <strong>{respostaSelecionada?.fornecedor?.nome ?? t('bidfrete.comparativo.fornecedor')}</strong>
          </p>

          {resultadoAprovacao.saving_valor != null && resultadoAprovacao.saving_valor > 0 && (
            <div className="bf-saving-card">
              <div className="bf-saving-header">
                <CurrencyDollar weight="duotone" size={18} />
                <span>{t('bidfrete.comparativo.saving_obtido')}</span>
              </div>
              <div className="bf-saving-valores">
                <span className="bf-saving-valor">
                  {moeda(resultadoAprovacao.saving_valor, resultadoAprovacao.moeda_aprovada ?? 'USD')}
                </span>
                {resultadoAprovacao.saving_percentual != null && (
                  <span className="bf-saving-pct">
                    {resultadoAprovacao.saving_percentual.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="bf-aprovacao-result-acoes">
            <button className="btn btn-secondary" onClick={() => navigate(`/cotacoes/${id}`)}>
              <ArrowLeft weight="bold" size={14} />
              {t('bidfrete.comparativo.ver_cotacao')}
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/cotacoes')}>
              {t('bidfrete.comparativo.voltar_cotacoes')}
            </button>
          </div>
        </div>

        <style>{comparativoStyles}</style>
      </PaginaGlobal>
    )
  }

  return (
    <PaginaGlobal
      className="bf-comparativo"
      cabecalho={
        <CabecalhoGlobal
          icone={<Ranking weight="duotone" size={22} />}
          titulo={t('bidfrete.comparativo.titulo')}
          subtitulo={cotacao ? `${cotacao.numero} — ${cotacao.origem_nome} → ${cotacao.destino_nome}` : t('bidfrete.comparativo.subtitulo')}
          acoes={
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button className="btn btn-danger-outline" onClick={() => setModalReprovar(true)} disabled={respostas.length === 0}>
                <XCircle weight="duotone" size={16} />
                {t('bidfrete.comparativo.reprovar')}
              </button>
              <button className="btn btn-secondary" onClick={() => navigate(`/cotacoes/${id}`)}>
                <ArrowLeft weight="bold" size={14} />
                {t('comum.voltar')}
              </button>
            </div>
          }
        />
      }
    >
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
                {cotacao.valor_alvo != null ? moeda(cotacao.valor_alvo, cotacao.moeda_alvo) : '—'}
              </span>
            </div>
          </div>
          <div className="bf-summary-card">
            <Trophy weight="duotone" size={18} />
            <div>
              <span className="bf-summary-label">{t('bidfrete.comparativo.melhor_oferta')}</span>
              <span className="bf-summary-valor bf-mono">
                {moeda(respostasOrdenadas[0]?.valor_total ?? 0, respostasOrdenadas[0]?.moeda ?? 'USD')}
              </span>
            </div>
          </div>
          <div className="bf-summary-card">
            <Timer weight="duotone" size={18} />
            <div>
              <span className="bf-summary-label">{t('bidfrete.comparativo.menor_transit')}</span>
              <span className="bf-summary-valor bf-mono">
                {Math.min(...respostas.map(r => r.transit_time_dias))}d
              </span>
            </div>
          </div>
          <div className="bf-summary-card">
            <Star weight="duotone" size={18} />
            <div>
              <span className="bf-summary-label">{t('bidfrete.comparativo.maior_rating')}</span>
              <span className="bf-summary-valor bf-mono">
                {Math.max(...respostas.map(r => r.fornecedor?.rating_global ?? 0)).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ════════ Ranking Table ════════ */}
      {!carregando && respostas.length === 0 ? (
        <div className="bf-empty-state">
          <Ranking weight="duotone" size={48} />
          <h3>{t('bidfrete.comparativo.sem_respostas')}</h3>
          <p>{t('bidfrete.comparativo.aguardar')}</p>
          <button className="btn btn-secondary" onClick={() => navigate(`/cotacoes/${id}`)}>
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
            idKey="id"
            carregando={carregando}
            mensagemVazio={t('bidfrete.comparativo.sem_respostas')}
            tooltipBusca={t('bidfrete.detalhe_cotacao.buscar_fornecedor')}
          />
        </div>
      )}

      {/* ════════ Modal Aprovar ════════ */}
      <ModalOverlay
        aberto={modalAprovar}
        titulo={t('bidfrete.comparativo.modal_aprovar')}
        icone={<CheckCircle weight="duotone" size={20} style={{ color: 'var(--success, #22c55e)' }} />}
        onFechar={() => setModalAprovar(false)}
      >
        {respostaSelecionada && (
          <>
            <p className="bf-modal-text">
              {t('bidfrete.comparativo.modal_aprovar_pergunta', { fornecedor: respostaSelecionada.fornecedor?.nome ?? t('bidfrete.comparativo.fornecedor') })}
            </p>
            <div className="bf-modal-detail-grid">
              <div className="bf-modal-detail">
                <span className="bf-modal-detail-label">{t('bidfrete.detalhe_cotacao.resp_total')}</span>
                <span className="bf-modal-detail-valor bf-mono">
                  {moeda(respostaSelecionada.valor_total, respostaSelecionada.moeda)}
                </span>
              </div>
              <div className="bf-modal-detail">
                <span className="bf-modal-detail-label">{t('bidfrete.comparativo.transit_time')}</span>
                <span className="bf-modal-detail-valor bf-mono">{respostaSelecionada.transit_time_dias}d</span>
              </div>
              <div className="bf-modal-detail">
                <span className="bf-modal-detail-label">{t('bidfrete.detalhe_cotacao.resp_transbordos')}</span>
                <span className="bf-modal-detail-valor bf-mono">
                  {respostaSelecionada.transbordos === 0 ? t('bidfrete.comparativo.direto') : respostaSelecionada.transbordos}
                </span>
              </div>
              <div className="bf-modal-detail">
                <span className="bf-modal-detail-label">{t('bidfrete.detalhe_cotacao.resp_validade')}</span>
                <span className="bf-modal-detail-valor">{dataBR(respostaSelecionada.validade)}</span>
              </div>
            </div>
            {respostaSelecionada.observacoes && (
              <div className="bf-modal-obs">
                <span className="bf-modal-detail-label">{t('bidfrete.comparativo.observacoes')}</span>
                <p>{respostaSelecionada.observacoes}</p>
              </div>
            )}
            <div className="bf-modal-acoes">
              <button className="btn btn-secondary" onClick={() => setModalAprovar(false)} disabled={aprovando}>
                {t('comum.cancelar')}
              </button>
              <button className="btn btn-success" onClick={handleAprovar} disabled={aprovando}>
                <CheckCircle weight="bold" size={16} />
                {aprovando ? t('bidfrete.comparativo.aprovando') : t('bidfrete.comparativo.confirmar_aprovacao')}
              </button>
            </div>
          </>
        )}
      </ModalOverlay>

      {/* ════════ Modal Reprovar ════════ */}
      <ModalOverlay
        aberto={modalReprovar}
        titulo={t('bidfrete.comparativo.modal_reprovar')}
        icone={<Warning weight="duotone" size={20} style={{ color: 'var(--danger, #ef4444)' }} />}
        onFechar={() => setModalReprovar(false)}
      >
        <p className="bf-modal-text">
          {t('bidfrete.comparativo.modal_reprovar_desc', { count: respostas.length })}
        </p>
        <textarea
          className="bf-modal-textarea"
          placeholder={t('bidfrete.comparativo.motivo_placeholder')}
          value={motivoReprovar}
          onChange={e => setMotivoReprovar(e.target.value)}
          rows={4}
        />
        <div className="bf-modal-acoes">
          <button className="btn btn-secondary" onClick={() => setModalReprovar(false)} disabled={reprovando}>
            {t('comum.cancelar')}
          </button>
          <button
            className="btn btn-danger"
            onClick={handleReprovar}
            disabled={reprovando || !motivoReprovar.trim()}
          >
            <XCircle weight="bold" size={16} />
            {reprovando ? t('bidfrete.comparativo.reprovando') : t('bidfrete.comparativo.confirmar_reprovacao')}
          </button>
        </div>
      </ModalOverlay>

      <style>{comparativoStyles}</style>
    </PaginaGlobal>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const comparativoStyles = `
  /* ═══════════════════════════════════════════════════════ */
  /* BID FRETE — Comparativo Styles                        */
  /* Design System: Solid Slate (CSS Vars)                 */
  /* ═══════════════════════════════════════════════════════ */

  .bf-comparativo { padding: 0; }

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

  /* ── Modal ── */
  .bf-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }
  .bf-modal {
    background: var(--bg-surface, #334155);
    border-radius: var(--radius-lg, 12px);
    width: 100%;
    max-width: 480px;
    box-shadow: var(--shadow-xl, 0 20px 60px rgba(0,0,0,0.5));
    border: 1px solid var(--bg-elevated, #475569);
  }
  .bf-modal-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--bg-elevated, #475569);
  }
  .bf-modal-titulo {
    flex: 1;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary, #f1f5f9);
    margin: 0;
  }
  .bf-modal-fechar {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted, #64748b);
    display: flex;
    padding: 0;
  }
  .bf-modal-fechar:hover { color: var(--text-primary, #f1f5f9); }

  .bf-modal-body {
    padding: 1.25rem;
  }
  .bf-modal-text {
    font-size: 0.875rem;
    color: var(--text-secondary, #94a3b8);
    margin: 0 0 1rem;
    line-height: 1.5;
  }
  .bf-modal-text strong {
    color: var(--text-primary, #f1f5f9);
  }

  .bf-modal-detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .bf-modal-detail {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    background: var(--bg-base, #1e293b);
    border-radius: var(--radius-md, 8px);
    padding: 0.75rem;
  }
  .bf-modal-detail-label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted, #64748b);
  }
  .bf-modal-detail-valor {
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--text-primary, #f1f5f9);
  }

  .bf-modal-obs {
    background: var(--bg-base, #1e293b);
    border-radius: var(--radius-md, 8px);
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  .bf-modal-obs p {
    font-size: 0.8125rem;
    color: var(--text-secondary, #94a3b8);
    margin: 0.25rem 0 0;
    line-height: 1.5;
  }

  .bf-modal-textarea {
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
    margin-bottom: 1rem;
  }
  .bf-modal-textarea:focus {
    outline: none;
    border-color: var(--accent, #6366f1);
    box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
  }
  .bf-modal-textarea::placeholder {
    color: var(--text-muted, #64748b);
  }

  .bf-modal-acoes {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding-top: 0.5rem;
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
`
