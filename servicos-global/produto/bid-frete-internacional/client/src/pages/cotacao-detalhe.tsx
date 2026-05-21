/**
 * DetalheCotacao.tsx — Detalhe de Cotação (T4)
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * Baseado nos prints: modelo 8, 9
 * Layout: Header + Timeline + Dados + BidRequests + BidResponses
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import {
  FileText,
  ArrowLeft,
  Trash,
  PaperPlaneTilt,
  Ranking,
  CheckCircle,
  Clock,
  Eye,
  Envelope,
  ChatCircle,
  Anchor,
  AirplaneTilt,
  Van,
  MapPin,
  Package,
  Scales,
  Warning,
  XCircle,
} from '@phosphor-icons/react'

import { getCotacao, getBidsPorCotacao, mudarStatusCotacao, excluirCotacao } from '../shared/api'
import type { Cotacao, BidRequest, StatusCotacao, StatusBidRequest } from '../shared/types'
import {
  STATUS_LABELS,
  STATUS_BADGE,
  MODAL_LABELS,
  MODALIDADE_LABELS,
  OPERACAO_LABELS,
  CANAL_LABELS,
  STATUS_BID_LABELS,
} from '../shared/types'

// ─── Formatação ──────────────────────────────────────────────────────────────

const dataBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const dataHoraBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const usd = (val: number | null) =>
  val != null ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(val) : '—'

// ─── Badge de Status ─────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  info:    { bg: 'rgba(59,130,246,0.15)',  color: '#6366f1' },
  warning: { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  success: { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
  danger:  { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
  default: { bg: 'rgba(100,116,139,0.15)', color: '#64748b' },
}

function Badge({ label, variante }: { label: string; variante: string }) {
  const cores = BADGE_COLORS[variante] ?? BADGE_COLORS.default
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.6rem',
      borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
      background: cores.bg, color: cores.color,
    }}>
      {label}
    </span>
  )
}

// ─── BidRequest Status Badge ─────────────────────────────────────────────────

const BID_STATUS_VARIANTE: Record<StatusBidRequest, string> = {
  PENDENTE: 'default',
  ENVIADO: 'info',
  VISUALIZADO: 'info',
  RESPONDIDO: 'success',
  EXPIRADO: 'danger',
  ERRO_ENVIO: 'danger',
}

// ─── Timeline ────────────────────────────────────────────────────────────────

const TIMELINE_STEPS: { status: StatusCotacao; label: string }[] = [
  { status: 'RASCUNHO', label: 'Rascunho' },
  { status: 'ENVIADA_FORNECEDORES', label: 'Enviada' },
  { status: 'EM_COTACAO', label: 'Em Cotação' },
  { status: 'AGUARDANDO_APROVACAO', label: 'Aguardando' },
  { status: 'APROVADA', label: 'Aprovada' },
]

function Timeline({ statusAtual }: { statusAtual: StatusCotacao }) {
  const currentIdx = TIMELINE_STEPS.findIndex(s => s.status === statusAtual)
  const isFinal = ['APROVADA', 'REPROVADA', 'CANCELADA', 'EXPIRADA'].includes(statusAtual)

  return (
    <div className="dc-timeline">
      {TIMELINE_STEPS.map((step, i) => {
        const done = i <= currentIdx
        const active = i === currentIdx
        return (
          <React.Fragment key={step.status}>
            <div className={`dc-tl-step ${done ? 'dc-tl-step--done' : ''} ${active ? 'dc-tl-step--active' : ''}`}>
              <div className="dc-tl-dot">
                {done ? <CheckCircle weight="fill" size={16} /> : <Clock weight="duotone" size={16} />}
              </div>
              <span className="dc-tl-label">{step.label}</span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`dc-tl-line ${i < currentIdx ? 'dc-tl-line--done' : ''}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Info Row ────────────────────────────────────────────────────────────────

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="dc-info-row">
      <span className="dc-info-label">{label}</span>
      <span className={`dc-info-value ${mono ? 'dc-info-mono' : ''}`}>{value}</span>
    </div>
  )
}

// ─── Componente Principal ────────────────────────────────────────────────────

export default function DetalheCotacao() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id_cotacao: id } = useParams<{ id_cotacao: string }>()
  const [cotacao, setCotacao] = useState<Cotacao | null>(null)
  const [bids, setBids] = useState<BidRequest[]>([])
  const [carregando, setCarregando] = useState(true)
  const [tab, setTab] = useState<'dados' | 'bids' | 'respostas'>('dados')

  const carregar = useCallback(async () => {
    if (!id) return
    setCarregando(true)
    try {
      const [cot, bidList] = await Promise.all([
        getCotacao(id),
        getBidsPorCotacao(id),
      ])
      setCotacao(cot)
      setBids(bidList)
    } catch {
      // erro
    } finally {
      setCarregando(false)
    }
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  // ─── Tabela de Bids ───────────────────────────────────────────────────

  const bidColunas: TabelaGlobalColuna<BidRequest>[] = [
    {
      key: 'id_fornecedor_bid_frete_internacional',
      label: t('bidfrete.comparativo.fornecedor'),
      tipo: 'texto',
      largura: 200,
      render: (valor: unknown, row: BidRequest) => {
        const _val = valor as string
        return row.fornecedor?.nome ?? _val.slice(0, 8)
      },
    },
    {
      key: 'canal_pedido_cotacao_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.canal_pedido'),
      tipo: 'texto',
      largura: 100,
      render: (valor: unknown) => {
        const val = valor as string
        const icon = val === 'EMAIL' ? <Envelope weight="duotone" size={14} /> :
                     val === 'WHATSAPP' ? <ChatCircle weight="duotone" size={14} /> :
                     <Eye weight="duotone" size={14} />
        return <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>{icon} {CANAL_LABELS[val as keyof typeof CANAL_LABELS] ?? val}</span>
      },
    },
    {
      key: 'status',
      label: t('comum.status'),
      tipo: 'texto',
      largura: 130,
      render: (valor: unknown) => {
        const val = valor as StatusBidRequest
        return (
          <Badge label={STATUS_BID_LABELS[val]} variante={BID_STATUS_VARIANTE[val]} />
        )
      },
    },
    {
      key: 'data_envio_pedido_cotacao_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.data_envio'),
      tipo: 'periodo',
      largura: 140,
      render: (valor: unknown) => dataHoraBR(valor as string | null),
    },
    {
      key: 'data_resposta_pedido_cotacao_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.data_resposta'),
      tipo: 'periodo',
      largura: 140,
      render: (valor: unknown) => dataHoraBR(valor as string | null),
    },
  ]

  // ─── Loading ──────────────────────────────────────────────────────────

  if (carregando || !cotacao) {
    return (
      <PaginaGlobal
        cabecalho={<CabecalhoGlobal icone={<FileText weight="duotone" size={22} />} titulo={t('comum.carregando')} />}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-muted)' }}>
          <Clock weight="duotone" size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      </PaginaGlobal>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <PaginaGlobal
      className="dc-page"
      cabecalho={
        <CabecalhoGlobal
          icone={<FileText weight="duotone" size={22} />}
          titulo={`Cotação ${cotacao.numero_cotacao_bid_frete_internacional}`}
          subtitulo={cotacao.referencia_interna_cotacao_bid_frete_internacional ? `Ref: ${cotacao.referencia_interna_cotacao_bid_frete_internacional}` : undefined}
          acoes={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="dc-btn dc-btn--secondary" onClick={() => navigate('/cotacoes')}>
                <ArrowLeft weight="bold" size={14} /> {t('comum.voltar')}
              </button>
              {cotacao.status === 'AGUARDANDO_APROVACAO' && (
                <button className="dc-btn dc-btn--primary" onClick={() => navigate(`/cotacoes/${id}/comparativo`)}>
                  <Ranking weight="bold" size={14} /> {t('bidfrete.detalhe_cotacao.comparativo')}
                </button>
              )}
              {cotacao.status === 'RASCUNHO' && (
                <button className="dc-btn dc-btn--danger" onClick={async () => { await excluirCotacao(cotacao.id); navigate('/cotacoes') }}>
                  <Trash weight="bold" size={14} /> {t('comum.excluir')}
                </button>
              )}
            </div>
          }
        />
      }
    >
      {/* Status Badge */}
      <div className="dc-status-bar">
        <Badge label={STATUS_LABELS[cotacao.status]} variante={STATUS_BADGE[cotacao.status]} />
        <span className="dc-status-date">{t('bidfrete.detalhe_cotacao.criada_em')} {dataBR(cotacao.created_at)}</span>
        {cotacao.ganho_percentual_ganho_bid_frete_internacional != null && cotacao.ganho_percentual_ganho_bid_frete_internacional > 0 && (
          <span className="dc-saving-badge">
            Saving: {cotacao.ganho_percentual_ganho_bid_frete_internacional.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Timeline */}
      <Timeline statusAtual={cotacao.status} />

      {/* Tabs */}
      <div className="dc-tabs">
        <button className={`dc-tab ${tab === 'dados' ? 'dc-tab--ativo' : ''}`} onClick={() => setTab('dados')}>
          {t('bidfrete.detalhe_cotacao.tab_dados')}
        </button>
        <button className={`dc-tab ${tab === 'bids' ? 'dc-tab--ativo' : ''}`} onClick={() => setTab('bids')}>
          {t('bidfrete.detalhe_cotacao.tab_disparos')} ({bids.length})
        </button>
        <button className={`dc-tab ${tab === 'respostas' ? 'dc-tab--ativo' : ''}`} onClick={() => setTab('respostas')}>
          {t('bidfrete.detalhe_cotacao.tab_respostas')} ({cotacao.bid_responses?.length ?? 0})
        </button>
      </div>

      {/* Tab: Dados */}
      {tab === 'dados' && (
        <div className="dc-card">
          <div className="dc-info-grid">
            <div className="dc-info-col">
              <InfoRow label={t('bidfrete.detalhe_cotacao.tipo_operacao')} value={OPERACAO_LABELS[cotacao.tipo_operacao_cotacao_bid_frete_internacional]} />
              <InfoRow label={t('bidfrete.detalhe_cotacao.modal')} value={MODAL_LABELS[cotacao.modal_cotacao_bid_frete_internacional]} />
              <InfoRow label={t('bidfrete.detalhe_cotacao.modalidade')} value={MODALIDADE_LABELS[cotacao.modalidade_cotacao_bid_frete_internacional]} />
              <InfoRow label={t('bidfrete.detalhe_cotacao.incoterm')} value={cotacao.incoterm_cotacao_bid_frete_internacional} mono />
              <InfoRow label={t('bidfrete.detalhe_cotacao.visibilidade')} value={cotacao.visibilidade_cotacao_bid_frete_internacional === 'ABERTA' ? t('bidfrete.nova_cotacao.tipo_aberta') : t('bidfrete.nova_cotacao.tipo_direcionada')} />
            </div>
            <div className="dc-info-col">
              <InfoRow label={t('bidfrete.detalhe_cotacao.origem')} value={`${cotacao.origem_nome_cotacao_bid_frete_internacional} (${cotacao.origem_codigo_cotacao_bid_frete_internacional})`} />
              <InfoRow label={t('bidfrete.detalhe_cotacao.pais_origem')} value={cotacao.origem_pais_cotacao_bid_frete_internacional} />
              <InfoRow label={t('bidfrete.detalhe_cotacao.destino')} value={`${cotacao.destino_nome_cotacao_bid_frete_internacional} (${cotacao.destino_codigo_cotacao_bid_frete_internacional})`} />
              <InfoRow label={t('bidfrete.detalhe_cotacao.pais_destino')} value={cotacao.destino_pais_cotacao_bid_frete_internacional} />
            </div>
            <div className="dc-info-col">
              <InfoRow label={t('bidfrete.detalhe_cotacao.mercadoria')} value={cotacao.descricao_mercadoria_cotacao_bid_frete_internacional} />
              <InfoRow label={t('bidfrete.detalhe_cotacao.ncm')} value={cotacao.ncm_cotacao_bid_frete_internacional ?? '—'} mono />
              <InfoRow label={t('bidfrete.detalhe_cotacao.quantidade')} value={String(cotacao.quantidade_cotacao_bid_frete_internacional)} />
              <InfoRow label={t('bidfrete.detalhe_cotacao.peso')} value={cotacao.peso_kg_cotacao_bid_frete_internacional ? `${cotacao.peso_kg_cotacao_bid_frete_internacional.toLocaleString('pt-BR')} Kg` : '—'} />
              <InfoRow label={t('bidfrete.detalhe_cotacao.cubagem')} value={cotacao.cubagem_m3_cotacao_bid_frete_internacional ? `${cotacao.cubagem_m3_cotacao_bid_frete_internacional} m³` : '—'} />
              {cotacao.tipo_container_cotacao_bid_frete_internacional && <InfoRow label={t('bidfrete.detalhe_cotacao.container')} value={cotacao.tipo_container_cotacao_bid_frete_internacional} />}
            </div>
          </div>

          {/* Valor alvo */}
          {cotacao.valor_alvo != null && (
            <div className="dc-target">
              <span className="dc-target-label">{t('bidfrete.detalhe_cotacao.valor_alvo')}:</span>
              <span className="dc-target-value">{cotacao.moeda_alvo} {cotacao.valor_alvo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          {/* Valor aprovado */}
          {cotacao.valor_aprovado_ganho_bid_frete_internacional != null && (
            <div className="dc-aprovado">
              <CheckCircle weight="fill" size={20} style={{ color: 'var(--success)' }} />
              <span>{t('bidfrete.detalhe_cotacao.aprovado')}: <strong>{cotacao.moeda_aprovada ?? 'USD'} {cotacao.valor_aprovado_ganho_bid_frete_internacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              {cotacao.ganho_valor_cotacao_bid_frete_internacional != null && (
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>
                  Saving: {usd(cotacao.ganho_valor_cotacao_bid_frete_internacional)} ({cotacao.ganho_percentual_ganho_bid_frete_internacional?.toFixed(1)}%)
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Bids */}
      {tab === 'bids' && (
        <div className="dc-card">
          <TabelaGlobal
            dados={bids}
            colunas={bidColunas}
            idKey="id"
            mensagemVazio={t('bidfrete.detalhe_cotacao.vazio_disparos')}
            tooltipBusca={t('bidfrete.detalhe_cotacao.buscar_fornecedor')}
          />
        </div>
      )}

      {/* Tab: Respostas */}
      {tab === 'respostas' && (
        <div className="dc-card">
          {(!cotacao.bid_responses || cotacao.bid_responses.length === 0) ? (
            <div className="dc-empty">
              <PaperPlaneTilt weight="duotone" size={40} style={{ opacity: 0.3 }} />
              <p>{t('bidfrete.detalhe_cotacao.vazio_respostas')}</p>
            </div>
          ) : (
            <div className="dc-responses-list">
              {cotacao.bid_responses.map(resp => (
                <div key={resp.id} className={`dc-response-card ${resp.aprovada ? 'dc-response-card--aprovada' : ''}`}>
                  <div className="dc-resp-header">
                    <span className="dc-resp-fornecedor">{resp.fornecedor?.nome ?? 'Fornecedor'}</span>
                    {resp.aprovada && <Badge label={t('bidfrete.comparativo.aprovar')} variante="success" />}
                  </div>
                  <div className="dc-resp-grid">
                    <div className="dc-resp-item">
                      <span className="dc-resp-label">{t('bidfrete.detalhe_cotacao.resp_frete')}</span>
                      <span className="dc-resp-value">{resp.moeda_ganho_bid_frete_internacional} {resp.valor_frete_proposta_bid_frete_internacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="dc-resp-item">
                      <span className="dc-resp-label">{t('bidfrete.detalhe_cotacao.resp_taxas_origem')}</span>
                      <span className="dc-resp-value">{resp.moeda_ganho_bid_frete_internacional} {resp.taxas_origem_proposta_bid_frete_internacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="dc-resp-item">
                      <span className="dc-resp-label">{t('bidfrete.detalhe_cotacao.resp_taxas_destino')}</span>
                      <span className="dc-resp-value">{resp.moeda_ganho_bid_frete_internacional} {resp.taxas_destino_proposta_bid_frete_internacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="dc-resp-item dc-resp-item--destaque">
                      <span className="dc-resp-label">{t('bidfrete.detalhe_cotacao.resp_total')}</span>
                      <span className="dc-resp-value">{resp.moeda_ganho_bid_frete_internacional} {resp.valor_total_proposta_bid_frete_internacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="dc-resp-item">
                      <span className="dc-resp-label">{t('bidfrete.comparativo.transit_time')}</span>
                      <span className="dc-resp-value">{resp.dias_transito_proposta_bid_frete_internacional} {t('bidfrete.detalhe_cotacao.dias')}</span>
                    </div>
                    <div className="dc-resp-item">
                      <span className="dc-resp-label">{t('bidfrete.detalhe_cotacao.resp_free_time')}</span>
                      <span className="dc-resp-value">{resp.dias_free_time_proposta_bid_frete_internacional ?? '—'} {t('bidfrete.detalhe_cotacao.dias')}</span>
                    </div>
                    <div className="dc-resp-item">
                      <span className="dc-resp-label">{t('bidfrete.detalhe_cotacao.resp_transbordos')}</span>
                      <span className="dc-resp-value">{resp.transbordos_proposta_bid_frete_internacional}</span>
                    </div>
                    <div className="dc-resp-item">
                      <span className="dc-resp-label">{t('bidfrete.detalhe_cotacao.resp_validade')}</span>
                      <span className="dc-resp-value">{dataBR(resp.validade)}</span>
                    </div>
                  </div>
                  {resp.observacoes_proposta_bid_frete_internacional && (
                    <p className="dc-resp-obs">{resp.observacoes_proposta_bid_frete_internacional}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .dc-page { padding: 0; }

        /* ── Status Bar ── */
        .dc-status-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .dc-status-date {
          font-size: 0.8125rem;
          color: var(--text-muted, #64748b);
        }
        .dc-saving-badge {
          padding: 0.2rem 0.75rem;
          border-radius: var(--radius-pill, 9999px);
          background: rgba(34,197,94,0.15);
          color: var(--success, #22c55e);
          font-size: 0.75rem;
          font-weight: 700;
        }

        /* ── Timeline ── */
        .dc-timeline {
          display: flex;
          align-items: center;
          padding: 1rem 0;
          margin-bottom: 1rem;
        }

        .dc-tl-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          min-width: 80px;
        }

        .dc-tl-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface, #334155);
          color: var(--text-muted, #64748b);
        }
        .dc-tl-step--done .dc-tl-dot {
          background: var(--success, #22c55e);
          color: #fff;
        }
        .dc-tl-step--active .dc-tl-dot {
          background: var(--accent, #6366f1);
          color: #fff;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.2);
        }

        .dc-tl-label {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-muted, #64748b);
        }
        .dc-tl-step--done .dc-tl-label { color: var(--success, #22c55e); }
        .dc-tl-step--active .dc-tl-label { color: var(--accent, #6366f1); }

        .dc-tl-line {
          flex: 1;
          height: 2px;
          background: var(--bg-elevated, #475569);
          margin-top: -1rem;
          min-width: 20px;
        }
        .dc-tl-line--done { background: var(--success, #22c55e); }

        /* ── Tabs ── */
        .dc-tabs {
          display: flex;
          gap: 0.25rem;
          border-bottom: 1px solid var(--bg-elevated, #475569);
          margin-bottom: 1rem;
        }
        .dc-tab {
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-secondary, #94a3b8);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .dc-tab:hover { color: var(--text-primary, #f1f5f9); }
        .dc-tab--ativo {
          color: var(--accent, #6366f1);
          border-bottom-color: var(--accent, #6366f1);
        }

        /* ── Card ── */
        .dc-card {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 1.5rem;
        }

        /* ── Info Grid ── */
        .dc-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .dc-info-grid { grid-template-columns: 1fr; }
        }

        .dc-info-row {
          display: flex;
          justify-content: space-between;
          padding: 0.4rem 0;
          border-bottom: 1px solid var(--bg-elevated, #475569);
        }
        .dc-info-label {
          font-size: 0.75rem;
          color: var(--text-muted, #64748b);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .dc-info-value {
          font-size: 0.8125rem;
          color: var(--text-primary, #f1f5f9);
          font-weight: 500;
          text-align: right;
        }
        .dc-info-mono { font-family: 'DM Mono', monospace; }

        /* ── Target / Aprovado ── */
        .dc-target, .dc-aprovado {
          margin-top: 1.25rem;
          padding: 0.75rem 1rem;
          background: var(--bg-base, #1e293b);
          border-radius: var(--radius-md, 8px);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-secondary, #94a3b8);
        }
        .dc-target-label { font-weight: 600; }
        .dc-target-value {
          font-family: 'DM Mono', monospace;
          font-weight: 700;
          color: var(--text-primary, #f1f5f9);
        }
        .dc-aprovado {
          border: 1px solid rgba(34,197,94,0.3);
          background: rgba(34,197,94,0.05);
        }

        /* ── Response Cards ── */
        .dc-responses-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .dc-response-card {
          background: var(--bg-base, #1e293b);
          border-radius: var(--radius-md, 8px);
          padding: 1rem;
          border: 1px solid var(--bg-elevated, #475569);
        }
        .dc-response-card--aprovada {
          border-color: rgba(34,197,94,0.4);
          background: rgba(34,197,94,0.03);
        }
        .dc-resp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .dc-resp-fornecedor {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary, #f1f5f9);
        }
        .dc-resp-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }
        @media (max-width: 800px) {
          .dc-resp-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .dc-resp-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .dc-resp-item--destaque {
          background: rgba(99,102,241,0.1);
          padding: 0.5rem;
          border-radius: var(--radius-sm, 4px);
        }
        .dc-resp-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted, #64748b);
          letter-spacing: 0.04em;
        }
        .dc-resp-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
          font-family: 'DM Mono', monospace;
        }
        .dc-resp-obs {
          margin-top: 0.75rem;
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
          font-style: italic;
          padding-top: 0.5rem;
          border-top: 1px solid var(--bg-elevated, #475569);
        }

        /* ── Empty ── */
        .dc-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          gap: 0.75rem;
          color: var(--text-muted, #64748b);
          font-size: 0.875rem;
        }

        /* ── Botões ── */
        .dc-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
          font-family: inherit;
        }
        .dc-btn--primary {
          background: var(--accent, #6366f1);
          color: #fff;
        }
        .dc-btn--primary:hover { background: var(--accent-hover, #4f46e5); }
        .dc-btn--secondary {
          background: var(--bg-surface, #334155);
          color: var(--text-secondary, #94a3b8);
          border: 1px solid var(--bg-elevated, #475569);
        }
        .dc-btn--secondary:hover {
          background: var(--bg-elevated, #475569);
          color: var(--text-primary, #f1f5f9);
        }
        .dc-btn--danger {
          background: rgba(239,68,68,0.15);
          color: var(--danger, #ef4444);
        }
        .dc-btn--danger:hover {
          background: var(--danger, #ef4444);
          color: #fff;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PaginaGlobal>
  )
}
