/**
 * MeuDesempenho.tsx — Portal do Fornecedor: Rating e Metricas
 * Rating global, 4 metric cards, rating por categoria, avaliacoes recentes
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import {
  Star,
  ChartBar,
  ClockCountdown,
  PaperPlaneTilt,
  CheckCircle,
  Timer,
} from '@phosphor-icons/react'

import { getPortalDesempenho } from '../../shared/api'

// ─── Types ──────────────────────────────────────────────────────────────────

interface DesempenhoData {
  nota_global_classificacao_bid_frete_internacional: number
  cotacoes_recebidas: number
  cotacoes_respondidas: number
  cotacoes_aprovadas: number
  tempo_medio_horas: number
  categorias: {
    frete: number
    atendimento: number
    prazo: number
    confiabilidade: number
  }
  avaliacoes_recentes: Array<{
    id: string
    nota_global: number
    comentario_avaliacao_bid_frete_internacional: string | null
    created_at: string
    cotacao_numero: string | null
  }>
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function StarRating({ nota, tamanho = 16 }: { nota: number; tamanho?: number }) {
  return (
    <div style={{ display: 'flex', gap: '0.15rem' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          weight={i <= Math.round(nota) ? 'fill' : 'duotone'}
          size={tamanho}
          style={{ color: i <= Math.round(nota) ? 'var(--warning, #f59e0b)' : 'var(--text-muted, #64748b)' }}
        />
      ))}
    </div>
  )
}

function ProgressBar({ valor, max = 5, label, nota }: { valor: number; max?: number; label: string; nota: number }) {
  const pct = Math.min((valor / max) * 100, 100)
  return (
    <div className="md-progress-row">
      <span className="md-progress-label">{label}</span>
      <div className="md-progress-bar">
        <div
          className="md-progress-fill"
          style={{
            width: `${pct}%`,
            background: pct >= 80 ? 'var(--success, #22c55e)' : pct >= 60 ? 'var(--warning, #f59e0b)' : 'var(--danger, #ef4444)',
          }}
        />
      </div>
      <span className="md-progress-nota">{nota.toFixed(1)}</span>
    </div>
  )
}

const fmtData = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// ─── Component ──────────────────────────────────────────────────────────────

export default function MeuDesempenho() {
  const { t } = useTranslation()
  const [dados, setDados] = useState<DesempenhoData | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const data = await getPortalDesempenho()
      setDados(data as unknown as DesempenhoData)
    } catch {
      // silencioso
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (carregando) {
    return (
      <PaginaGlobal
        cabecalho={<CabecalhoGlobal icone={<Star weight="duotone" size={22} />} titulo={t('bidfrete.portal.meu_desempenho.titulo')} />}
      >
        <div className="md-loading">
          <ChartBar weight="duotone" size={48} style={{ opacity: 0.3 }} />
          <p>{t('comum.carregando')}</p>
        </div>
        <style>{mdStyles}</style>
      </PaginaGlobal>
    )
  }

  const rating = dados?.nota_global_classificacao_bid_frete_internacional ?? 0
  const cats = dados?.categorias ?? { frete: 0, atendimento: 0, prazo: 0, confiabilidade: 0 }

  return (
    <PaginaGlobal
      className="md-page"
      cabecalho={
        <CabecalhoGlobal
          icone={<Star weight="duotone" size={22} />}
          titulo={t('bidfrete.portal.meu_desempenho.titulo')}
          subtitulo={t('bidfrete.portal.meu_desempenho.subtitulo')}
        />
      }
    >
      {/* Rating Global */}
      <div className="md-rating-hero">
        <div className="md-rating-number">{rating.toFixed(1)}</div>
        <StarRating nota={rating} tamanho={28} />
        <span className="md-rating-sub">{t('bidfrete.portal.dashboard.rating')}</span>
      </div>

      {/* 4 Metric Cards */}
      <div className="md-metrics">
        <div className="md-metric-card">
          <div className="md-metric-icon" style={{ color: 'var(--accent, #6366f1)' }}>
            <PaperPlaneTilt weight="duotone" size={20} />
          </div>
          <span className="md-metric-valor">{dados?.cotacoes_recebidas ?? 0}</span>
          <span className="md-metric-label">{t('bidfrete.portal.dashboard.card_pendentes_titulo')}</span>
        </div>
        <div className="md-metric-card">
          <div className="md-metric-icon" style={{ color: 'var(--warning, #f59e0b)' }}>
            <ClockCountdown weight="duotone" size={20} />
          </div>
          <span className="md-metric-valor">{dados?.cotacoes_respondidas ?? 0}</span>
          <span className="md-metric-label">{t('bidfrete.portal.dashboard.respondidas')}</span>
        </div>
        <div className="md-metric-card">
          <div className="md-metric-icon" style={{ color: 'var(--success, #22c55e)' }}>
            <CheckCircle weight="duotone" size={20} />
          </div>
          <span className="md-metric-valor">{dados?.cotacoes_aprovadas ?? 0}</span>
          <span className="md-metric-label">{t('bidfrete.portal.dashboard.aprovadas')}</span>
        </div>
        <div className="md-metric-card">
          <div className="md-metric-icon" style={{ color: 'var(--danger, #ef4444)' }}>
            <Timer weight="duotone" size={20} />
          </div>
          <span className="md-metric-valor md-mono">{dados?.tempo_medio_horas ?? 0}h</span>
          <span className="md-metric-label">{t('bidfrete.portal.meu_desempenho.cat_prazo')}</span>
        </div>
      </div>

      <div className="md-bottom-grid">
        {/* Rating por Categoria */}
        <div className="md-cat-section">
          <h3 className="md-section-title">{t('bidfrete.portal.dashboard.rating')}</h3>
          <div className="md-cat-list">
            <ProgressBar label={t('bidfrete.portal.meu_desempenho.cat_frete')} valor={cats.frete} nota={cats.frete} />
            <ProgressBar label={t('bidfrete.portal.meu_desempenho.cat_atendimento')} valor={cats.atendimento} nota={cats.atendimento} />
            <ProgressBar label={t('bidfrete.portal.meu_desempenho.cat_prazo')} valor={cats.prazo} nota={cats.prazo} />
            <ProgressBar label={t('bidfrete.portal.meu_desempenho.cat_confiabilidade')} valor={cats.confiabilidade} nota={cats.confiabilidade} />
          </div>
        </div>

        {/* Avaliacoes Recentes */}
        <div className="md-aval-section">
          <h3 className="md-section-title">{t('bidfrete.portal.meu_desempenho.subtitulo')}</h3>
          {(!dados?.avaliacoes_recentes || dados.avaliacoes_recentes.length === 0) ? (
            <p className="md-aval-vazio">{t('comum.nenhum_resultado')}</p>
          ) : (
            <div className="md-aval-list">
              {dados.avaliacoes_recentes.map(aval => (
                <div key={aval.id} className="md-aval-item">
                  <div className="md-aval-header">
                    <StarRating nota={aval.nota_global} tamanho={14} />
                    <span className="md-aval-nota md-mono">{aval.nota_global.toFixed(1)}</span>
                    <span className="md-aval-data">{fmtData(aval.created_at)}</span>
                  </div>
                  {aval.cotacao_numero && (
                    <span className="md-aval-cotacao md-mono">#{aval.cotacao_numero}</span>
                  )}
                  {aval.comentario_avaliacao_bid_frete_internacional && (
                    <p className="md-aval-comment">{aval.comentario_avaliacao_bid_frete_internacional}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{mdStyles}</style>
    </PaginaGlobal>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const mdStyles = `
  .md-page { padding: 0; }

  .md-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    gap: 1rem;
    color: var(--text-muted, #64748b);
    font-size: 0.875rem;
  }

  /* Rating Hero */
  .md-rating-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem;
    background: var(--bg-surface, #334155);
    border-radius: var(--radius-lg, 12px);
    margin-bottom: 1.5rem;
  }

  .md-rating-number {
    font-size: 3.5rem;
    font-weight: 700;
    color: var(--text-primary, #f1f5f9);
    font-family: 'DM Mono', monospace;
    line-height: 1;
  }

  .md-rating-sub {
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted, #64748b);
  }

  /* Metric Cards */
  .md-metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  @media (max-width: 800px) {
    .md-metrics { grid-template-columns: 1fr 1fr; }
  }

  .md-metric-card {
    background: var(--bg-surface, #334155);
    border-radius: var(--radius-lg, 12px);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    align-items: center;
    text-align: center;
  }

  .md-metric-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-elevated, #475569);
    border-radius: var(--radius-md, 8px);
    margin-bottom: 0.25rem;
  }

  .md-metric-valor {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary, #f1f5f9);
  }

  .md-metric-label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted, #64748b);
  }

  .md-mono {
    font-family: 'DM Mono', monospace;
  }

  /* Bottom Grid */
  .md-bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }
  @media (max-width: 900px) {
    .md-bottom-grid { grid-template-columns: 1fr; }
  }

  .md-section-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary, #f1f5f9);
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--bg-elevated, #475569);
  }

  /* Category Progress */
  .md-cat-section {
    background: var(--bg-surface, #334155);
    border-radius: var(--radius-lg, 12px);
    padding: 1.25rem;
  }

  .md-cat-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .md-progress-row {
    display: grid;
    grid-template-columns: 100px 1fr 40px;
    gap: 0.75rem;
    align-items: center;
  }

  .md-progress-label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--text-secondary, #94a3b8);
  }

  .md-progress-bar {
    height: 8px;
    background: var(--bg-elevated, #475569);
    border-radius: 9999px;
    overflow: hidden;
  }

  .md-progress-fill {
    height: 100%;
    border-radius: 9999px;
    transition: width 0.5s ease;
  }

  .md-progress-nota {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-primary, #f1f5f9);
    font-family: 'DM Mono', monospace;
    text-align: right;
  }

  /* Avaliacoes */
  .md-aval-section {
    background: var(--bg-surface, #334155);
    border-radius: var(--radius-lg, 12px);
    padding: 1.25rem;
  }

  .md-aval-vazio {
    font-size: 0.875rem;
    color: var(--text-muted, #64748b);
    text-align: center;
    padding: 2rem 0;
  }

  .md-aval-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .md-aval-item {
    background: var(--bg-elevated, #475569);
    border-radius: var(--radius-md, 8px);
    padding: 0.875rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .md-aval-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .md-aval-nota {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--warning, #f59e0b);
  }

  .md-aval-data {
    font-size: 0.75rem;
    color: var(--text-muted, #64748b);
    margin-left: auto;
  }

  .md-aval-cotacao {
    font-size: 0.75rem;
    color: var(--accent, #6366f1);
  }

  .md-aval-comment {
    font-size: 0.8125rem;
    color: var(--text-secondary, #94a3b8);
    line-height: 1.4;
    margin: 0;
  }
`
