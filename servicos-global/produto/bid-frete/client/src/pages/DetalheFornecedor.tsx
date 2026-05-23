/**
 * DetalheFornecedor.tsx — Detalhe do Fornecedor (T5)
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * Tabs: Info, Tabela de Precos, Avaliacoes
 * Rating summary cards + star displays
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import {
  Buildings,
  ArrowLeft,
  Star,
  ChartBar,
  Percent,
  Timer,
  FileText,
  Globe,
  Phone,
  EnvelopeSimple,
  WhatsappLogo,
  CheckCircle,
  XCircle,
  Flag,
  MapPin,
  IdentificationCard,
} from '@phosphor-icons/react'

import { getFornecedor, getTabelaPrecos, getAvaliacoes } from '../shared/api'
import type {
  Fornecedor,
  TabelaPreco,
  Avaliacao,
  TipoFornecedor,
  StatusFornecedor,
  ModalFrete,
  ModalidadeCarga,
} from '../shared/types'
import {
  TIPO_FORNECEDOR_LABELS,
  STATUS_FORNECEDOR_LABELS,
  MODAL_LABELS,
  MODALIDADE_LABELS,
} from '../shared/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

const dataBR = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const moeda = (val: number, currency: string) =>
  `${currency} ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}`

// ─── Status/Tipo badge colors ───────────────────────────────────────────────

const STATUS_FORNECEDOR_COLORS: Record<StatusFornecedor, { bg: string; color: string }> = {
  ATIVO:              { bg: 'rgba(34,197,94,0.15)',   color: 'var(--success, #22c55e)' },
  INATIVO:            { bg: 'rgba(100,116,139,0.15)', color: 'var(--text-muted, #64748b)' },
  PENDENTE_APROVACAO: { bg: 'rgba(245,158,11,0.15)',  color: 'var(--warning, #f59e0b)' },
  BLOQUEADO:          { bg: 'rgba(239,68,68,0.15)',   color: 'var(--danger, #ef4444)' },
}

const TIPO_FORNECEDOR_COLORS: Record<TipoFornecedor, { bg: string; color: string }> = {
  AGENTE_CARGA:   { bg: 'rgba(34,197,94,0.15)',  color: 'var(--success, #22c55e)' },
  ARMADOR:        { bg: 'rgba(99,102,241,0.15)',  color: 'var(--accent, #6366f1)' },
  CIA_AEREA:      { bg: 'rgba(245,158,11,0.15)',  color: 'var(--warning, #f59e0b)' },
  TRANSPORTADORA: { bg: 'rgba(239,68,68,0.15)',   color: 'var(--danger, #ef4444)' },
}

// ─── Stars renderer ─────────────────────────────────────────────────────────

function Stars({ rating, size = 14 }: { rating: number | null; size?: number }) {
  if (rating == null) return <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>—</span>
  const full = Math.round(rating)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          weight={i <= full ? 'fill' : 'regular'}
          size={size}
          style={{ color: i <= full ? 'var(--warning, #f59e0b)' : 'var(--text-muted, #64748b)' }}
        />
      ))}
    </span>
  )
}

// ─── Badge inline ───────────────────────────────────────────────────────────

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      borderRadius: 'var(--radius-pill, 9999px)',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: bg,
      color,
    }}>
      {label}
    </span>
  )
}

// ─── Tab type ───────────────────────────────────────────────────────────────

type TabKey = 'info' | 'precos' | 'avaliacoes'

// ─── Componente Principal ────────────────────────────────────────────────────

export default function DetalheFornecedor() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id_fornecedor: id } = useParams<{ id_fornecedor: string }>()
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null)
  const [tabela, setTabela] = useState<TabelaPreco[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [tab, setTab] = useState<TabKey>('info')

  const carregar = useCallback(async () => {
    if (!id) return
    setCarregando(true)
    try {
      const [forn, precos, avs] = await Promise.all([
        getFornecedor(id),
        getTabelaPrecos(id),
        getAvaliacoes(id),
      ])
      setFornecedor(forn)
      setTabela(precos)
      setAvaliacoes(avs)
    } catch {
      // loading state
    } finally {
      setCarregando(false)
    }
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  // ─── Tabela de Precos columns ─────────────────────────────────────────

  const colunasPrecos: TabelaGlobalColuna<TabelaPreco>[] = [
    {
      key: 'origem_nome',
      label: t('bidfrete.detalhe_fornecedor.col_rota'),
      tipo: 'texto',
      largura: 240,
      render: (_val: string, item: TabelaPreco) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary, #f1f5f9)' }}>
          {item.origem_nome} <span style={{ color: 'var(--text-muted)' }}>→</span> {item.destino_nome}
        </span>
      ),
    },
    {
      key: 'modal',
      label: t('bidfrete.detalhe_fornecedor.col_modal'),
      tipo: 'texto',
      largura: 100,
      render: (val: ModalFrete) => MODAL_LABELS[val] ?? val,
    },
    {
      key: 'modalidade',
      label: t('bidfrete.detalhe_fornecedor.col_modalidade'),
      tipo: 'texto',
      largura: 100,
      render: (val: ModalidadeCarga) => MODALIDADE_LABELS[val] ?? val,
    },
    {
      key: 'moeda',
      label: t('bidfrete.detalhe_fornecedor.col_moeda'),
      tipo: 'texto',
      largura: 70,
    },
    {
      key: 'valor_frete',
      label: t('bidfrete.detalhe_fornecedor.col_frete'),
      tipo: 'numero',
      largura: 110,
      align: 'right',
      render: (val: number, item: TabelaPreco) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem' }}>
          {moeda(val, item.moeda)}
        </span>
      ),
    },
    {
      key: 'taxas_origem',
      label: t('bidfrete.detalhe_fornecedor.col_taxas'),
      tipo: 'numero',
      largura: 110,
      align: 'right',
      render: (_val: number, item: TabelaPreco) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>
          {moeda(item.taxas_origem + item.taxas_destino, item.moeda)}
        </span>
      ),
    },
    {
      key: 'transit_time_dias',
      label: t('bidfrete.detalhe_fornecedor.col_transit'),
      tipo: 'numero',
      largura: 100,
      align: 'right',
      render: (val: number) => (
        <span style={{ fontSize: '0.8125rem' }}>{val} {t('bidfrete.detalhe_cotacao.dias')}</span>
      ),
    },
    {
      key: 'validade_fim',
      label: t('bidfrete.detalhe_fornecedor.col_validade'),
      tipo: 'periodo',
      largura: 110,
      render: (val: string) => dataBR(val),
    },
  ]

  // ─── Info fields ──────────────────────────────────────────────────────

  function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
      <div className="bf-det-field">
        <div className="bf-det-field-icon">{icon}</div>
        <div className="bf-det-field-content">
          <span className="bf-det-field-label">{label}</span>
          <span className="bf-det-field-value">{value ?? '—'}</span>
        </div>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────

  const TABS: { key: TabKey; label: string; count?: number }[] = [
    { key: 'info', label: t('bidfrete.detalhe_fornecedor.tab_info') },
    { key: 'precos', label: t('bidfrete.detalhe_fornecedor.tab_precos'), count: tabela.length },
    { key: 'avaliacoes', label: t('bidfrete.detalhe_fornecedor.tab_avaliacoes'), count: avaliacoes.length },
  ]

  return (
    <PaginaGlobal
      className="bf-detalhe-forn"
      cabecalho={
        <CabecalhoGlobal
          icone={<Buildings weight="duotone" size={22} />}
          titulo={fornecedor?.nome ?? t('bidfrete.detalhe_fornecedor.carregando')}
          subtitulo={fornecedor?.nome_fantasia ?? undefined}
          acoes={
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/produto/bid-frete/fornecedores')}
            >
              <ArrowLeft weight="bold" size={14} /> {t('comum.voltar')}
            </button>
          }
        />
      }
    >
      {carregando && !fornecedor ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '40vh', color: 'var(--text-muted, #64748b)', fontSize: '0.875rem',
        }}>
          {t('bidfrete.detalhe_fornecedor.carregando')}
        </div>
      ) : fornecedor ? (
        <>
          {/* ════════ Rating Summary Cards ════════ */}
          <div className="bf-det-metrics">
            <div className="bf-det-metric">
              <div className="bf-det-metric-icon"><Star weight="duotone" size={18} style={{ color: 'var(--warning, #f59e0b)' }} /></div>
              <div className="bf-det-metric-label">{t('bidfrete.detalhe_fornecedor.rating_global')}</div>
              <div className="bf-det-metric-value">
                {fornecedor.rating_global != null ? fornecedor.rating_global.toFixed(1) : '—'}
              </div>
              <Stars rating={fornecedor.rating_global} size={16} />
            </div>
            <div className="bf-det-metric">
              <div className="bf-det-metric-icon"><Percent weight="duotone" size={18} style={{ color: 'var(--accent, #6366f1)' }} /></div>
              <div className="bf-det-metric-label">{t('bidfrete.detalhe_fornecedor.taxa_resposta')}</div>
              <div className="bf-det-metric-value">
                {fornecedor.taxa_resposta != null ? `${fornecedor.taxa_resposta.toFixed(0)}%` : '—'}
              </div>
            </div>
            <div className="bf-det-metric">
              <div className="bf-det-metric-icon"><ChartBar weight="duotone" size={18} style={{ color: 'var(--success, #22c55e)' }} /></div>
              <div className="bf-det-metric-label">{t('bidfrete.detalhe_fornecedor.taxa_aprovacao')}</div>
              <div className="bf-det-metric-value">
                {fornecedor.taxa_aprovacao != null ? `${fornecedor.taxa_aprovacao.toFixed(0)}%` : '—'}
              </div>
            </div>
            <div className="bf-det-metric">
              <div className="bf-det-metric-icon"><Timer weight="duotone" size={18} style={{ color: 'var(--warning, #f59e0b)' }} /></div>
              <div className="bf-det-metric-label">{t('bidfrete.detalhe_fornecedor.tempo_medio')}</div>
              <div className="bf-det-metric-value">
                {fornecedor.tempo_medio_resposta != null ? `${fornecedor.tempo_medio_resposta}h` : '—'}
              </div>
            </div>
            <div className="bf-det-metric">
              <div className="bf-det-metric-icon"><FileText weight="duotone" size={18} style={{ color: 'var(--text-secondary, #94a3b8)' }} /></div>
              <div className="bf-det-metric-label">{t('bidfrete.detalhe_fornecedor.total_cotacoes')}</div>
              <div className="bf-det-metric-value">{fornecedor.total_cotacoes}</div>
            </div>
          </div>

          {/* ════════ Tabs ════════ */}
          <div className="bf-det-tabs-section">
            <div className="bf-det-tabs">
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`bf-det-tab ${tab === t.key ? 'bf-det-tab--ativo' : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                  {t.count != null && (
                    <span className="bf-det-tab-count">{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Tab: Info ── */}
            {tab === 'info' && (
              <div className="bf-det-info-grid">
                <InfoField
                  icon={<Buildings weight="duotone" size={16} />}
                  label={t('bidfrete.detalhe_fornecedor.field_tipo')}
                  value={
                    <Badge
                      label={TIPO_FORNECEDOR_LABELS[fornecedor.tipo]}
                      bg={TIPO_FORNECEDOR_COLORS[fornecedor.tipo].bg}
                      color={TIPO_FORNECEDOR_COLORS[fornecedor.tipo].color}
                    />
                  }
                />
                <InfoField
                  icon={<IdentificationCard weight="duotone" size={16} />}
                  label={t('bidfrete.detalhe_fornecedor.field_cnpj')}
                  value={fornecedor.cnpj ?? '—'}
                />
                <InfoField
                  icon={<EnvelopeSimple weight="duotone" size={16} />}
                  label={t('bidfrete.detalhe_fornecedor.field_email')}
                  value={fornecedor.email}
                />
                <InfoField
                  icon={<Phone weight="duotone" size={16} />}
                  label={t('bidfrete.detalhe_fornecedor.field_telefone')}
                  value={fornecedor.telefone ?? '—'}
                />
                <InfoField
                  icon={<WhatsappLogo weight="duotone" size={16} />}
                  label={t('bidfrete.detalhe_fornecedor.field_whatsapp')}
                  value={fornecedor.whatsapp ?? '—'}
                />
                <InfoField
                  icon={<Globe weight="duotone" size={16} />}
                  label={t('bidfrete.detalhe_fornecedor.field_website')}
                  value={fornecedor.website ? (
                    <a
                      href={fornecedor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--accent, #6366f1)', textDecoration: 'none' }}
                    >
                      {fornecedor.website}
                    </a>
                  ) : '—'}
                />
                <InfoField
                  icon={<Flag weight="duotone" size={16} />}
                  label={t('bidfrete.detalhe_fornecedor.field_pais')}
                  value={fornecedor.pais ?? '—'}
                />
                <InfoField
                  icon={<MapPin weight="duotone" size={16} />}
                  label={t('bidfrete.detalhe_fornecedor.field_cidade')}
                  value={fornecedor.cidade ?? '—'}
                />
                <InfoField
                  icon={fornecedor.status === 'ATIVO'
                    ? <CheckCircle weight="duotone" size={16} />
                    : <XCircle weight="duotone" size={16} />
                  }
                  label={t('bidfrete.detalhe_fornecedor.field_status')}
                  value={
                    <Badge
                      label={STATUS_FORNECEDOR_LABELS[fornecedor.status]}
                      bg={STATUS_FORNECEDOR_COLORS[fornecedor.status].bg}
                      color={STATUS_FORNECEDOR_COLORS[fornecedor.status].color}
                    />
                  }
                />
                <InfoField
                  icon={<CheckCircle weight="duotone" size={16} />}
                  label={t('bidfrete.detalhe_fornecedor.field_aceita_aberta')}
                  value={fornecedor.aceita_cotacao_aberta ? t('bidfrete.detalhe_fornecedor.sim') : t('bidfrete.detalhe_fornecedor.nao')}
                />
                <InfoField
                  icon={<Timer weight="duotone" size={16} />}
                  label={t('bidfrete.detalhe_fornecedor.field_resposta_automatica')}
                  value={fornecedor.resposta_automatica ? t('bidfrete.detalhe_fornecedor.sim') : t('bidfrete.detalhe_fornecedor.nao')}
                />
                <InfoField
                  icon={<FileText weight="duotone" size={16} />}
                  label={t('bidfrete.detalhe_fornecedor.field_cadastrado_em')}
                  value={dataBR(fornecedor.created_at)}
                />
              </div>
            )}

            {/* ── Tab: Tabela de Precos ── */}
            {tab === 'precos' && (
              <div className="bf-det-precos">
                <TabelaGlobal
                  dados={tabela}
                  colunas={colunasPrecos}
                  idKey="id"
                  carregando={false}
                  mensagemVazio={t('bidfrete.detalhe_fornecedor.vazio_precos')}
                  tooltipBusca={t('bidfrete.detalhe_fornecedor.buscar_precos')}
                />
              </div>
            )}

            {/* ── Tab: Avaliacoes ── */}
            {tab === 'avaliacoes' && (
              <div className="bf-det-avaliacoes">
                {avaliacoes.length === 0 ? (
                  <div className="bf-det-avaliacao-empty">
                    <Star weight="duotone" size={32} style={{ opacity: 0.3, color: 'var(--text-muted)' }} />
                    <span>{t('bidfrete.detalhe_fornecedor.vazio_avaliacoes')}</span>
                  </div>
                ) : (
                  avaliacoes.map(av => (
                    <div key={av.id} className="bf-det-avaliacao-card">
                      <div className="bf-det-avaliacao-header">
                        <Stars rating={av.nota_global} size={16} />
                        <span className="bf-det-avaliacao-nota">{av.nota_global.toFixed(1)}</span>
                        <span className="bf-det-avaliacao-data">{dataBR(av.created_at)}</span>
                      </div>
                      <div className="bf-det-avaliacao-cats">
                        <div className="bf-det-avaliacao-cat">
                          <span className="bf-det-avaliacao-cat-label">{t('bidfrete.detalhe_fornecedor.cat_frete')}</span>
                          <Stars rating={av.nota_frete} size={12} />
                        </div>
                        <div className="bf-det-avaliacao-cat">
                          <span className="bf-det-avaliacao-cat-label">{t('bidfrete.detalhe_fornecedor.cat_atendimento')}</span>
                          <Stars rating={av.nota_atendimento} size={12} />
                        </div>
                        <div className="bf-det-avaliacao-cat">
                          <span className="bf-det-avaliacao-cat-label">{t('bidfrete.detalhe_fornecedor.cat_prazo')}</span>
                          <Stars rating={av.nota_prazo} size={12} />
                        </div>
                        <div className="bf-det-avaliacao-cat">
                          <span className="bf-det-avaliacao-cat-label">{t('bidfrete.detalhe_fornecedor.cat_confiabilidade')}</span>
                          <Stars rating={av.nota_confiabilidade} size={12} />
                        </div>
                      </div>
                      {av.comentario && (
                        <div className="bf-det-avaliacao-comentario">
                          {av.comentario}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '40vh', color: 'var(--text-muted, #64748b)', fontSize: '0.875rem',
        }}>
          {t('bidfrete.detalhe_fornecedor.nao_encontrado')}
        </div>
      )}

      <style>{`
        .bf-detalhe-forn { padding: 0; }

        /* ── Metrics row ── */
        .bf-det-metrics {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 900px) {
          .bf-det-metrics { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 600px) {
          .bf-det-metrics { grid-template-columns: repeat(2, 1fr); }
        }

        .bf-det-metric {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          align-items: center;
          text-align: center;
        }

        .bf-det-metric-icon {
          margin-bottom: 0.15rem;
        }

        .bf-det-metric-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted, #64748b);
        }

        .bf-det-metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary, #f1f5f9);
          font-family: 'DM Mono', monospace;
        }

        /* ── Tabs section ── */
        .bf-det-tabs-section {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          overflow: hidden;
        }

        .bf-det-tabs {
          display: flex;
          gap: 0.25rem;
          padding: 0.75rem 1.25rem 0;
          border-bottom: 1px solid var(--bg-elevated, #475569);
        }

        .bf-det-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-secondary, #94a3b8);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
          white-space: nowrap;
        }
        .bf-det-tab:hover { color: var(--text-primary, #f1f5f9); }
        .bf-det-tab--ativo {
          color: var(--accent, #6366f1);
          border-bottom-color: var(--accent, #6366f1);
        }

        .bf-det-tab-count {
          font-size: 0.6875rem;
          font-weight: 700;
          background: var(--bg-elevated, #475569);
          color: var(--text-secondary, #94a3b8);
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-pill, 9999px);
          min-width: 1.25rem;
          text-align: center;
        }
        .bf-det-tab--ativo .bf-det-tab-count {
          background: rgba(99,102,241,0.2);
          color: var(--accent, #6366f1);
        }

        /* ── Info grid ── */
        .bf-det-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          padding: 0;
        }
        @media (max-width: 700px) {
          .bf-det-info-grid { grid-template-columns: 1fr; }
        }

        .bf-det-field {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--bg-elevated, #475569);
        }

        .bf-det-field-icon {
          color: var(--text-muted, #64748b);
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .bf-det-field-content {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }

        .bf-det-field-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted, #64748b);
        }

        .bf-det-field-value {
          font-size: 0.875rem;
          color: var(--text-primary, #f1f5f9);
          word-break: break-word;
        }

        /* ── Precos tab ── */
        .bf-det-precos {
          overflow: hidden;
        }

        /* ── Avaliacoes tab ── */
        .bf-det-avaliacoes {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
        }

        .bf-det-avaliacao-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 3rem 0;
          color: var(--text-muted, #64748b);
          font-size: 0.875rem;
        }

        .bf-det-avaliacao-card {
          background: var(--bg-base, #1e293b);
          border-radius: var(--radius-md, 8px);
          padding: 1rem;
          border: 1px solid var(--bg-elevated, #475569);
        }

        .bf-det-avaliacao-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .bf-det-avaliacao-nota {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary, #f1f5f9);
          font-family: 'DM Mono', monospace;
        }

        .bf-det-avaliacao-data {
          margin-left: auto;
          font-size: 0.75rem;
          color: var(--text-muted, #64748b);
        }

        .bf-det-avaliacao-cats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        @media (max-width: 700px) {
          .bf-det-avaliacao-cats { grid-template-columns: repeat(2, 1fr); }
        }

        .bf-det-avaliacao-cat {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .bf-det-avaliacao-cat-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted, #64748b);
        }

        .bf-det-avaliacao-comentario {
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
          line-height: 1.5;
          padding-top: 0.75rem;
          border-top: 1px solid var(--bg-elevated, #475569);
          font-style: italic;
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
        .btn-secondary {
          background: var(--bg-surface, #334155);
          color: var(--text-secondary, #94a3b8);
          border: 1px solid var(--bg-elevated, #475569);
        }
        .btn-secondary:hover {
          background: var(--bg-elevated, #475569);
          color: var(--text-primary, #f1f5f9);
        }
      `}</style>
    </PaginaGlobal>
  )
}
