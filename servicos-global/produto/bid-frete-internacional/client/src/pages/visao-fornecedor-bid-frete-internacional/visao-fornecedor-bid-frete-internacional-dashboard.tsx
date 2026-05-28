/**
 * PortalDashboard.tsx — Portal do Fornecedor: Dashboard
 * 5 KPI cards, valor aprovado highlight, 3 action cards
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import {
  ChartPieSlice,
  ClockCountdown,
  PaperPlaneTilt,
  CheckCircle,
  Percent,
  Star,
  CurrencyDollar,
  Envelope,
  ChartBar,
  ArrowRight,
} from '@phosphor-icons/react'

import { getVisaoFornecedorBidFreteInternacionalDashboard, type DashboardVisaoFornecedorBidFreteInternacional } from '../../shared/api'

// ─── Formatacao ─────────────────────────────────────────────────────────────

const fmtNum = (val: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)

// ─── Component ──────────────────────────────────────────────────────────────

export default function VisaoFornecedorBidFreteInternacionalDashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [dashboard, setDashboard] = useState<DashboardVisaoFornecedorBidFreteInternacional | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const data = await getVisaoFornecedorBidFreteInternacionalDashboard()
      setDashboard(data)
    } catch {
      // loading state mantido
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const kpis = dashboard?.kpis

  const actionCards = [
    {
      titulo: t('bidfrete.visao_fornecedor_bid_frete_internacional.dashboard.card_pendentes_titulo'),
      descricao: t('bidfrete.visao_fornecedor_bid_frete_internacional.dashboard.card_pendentes_desc'),
      icone: <Envelope weight="duotone" size={24} />,
      rota: '/visao-fornecedor-bid-frete-internacional/cotacoes-pendentes',
      cor: 'var(--accent, #6366f1)',
    },
    {
      titulo: t('bidfrete.visao_fornecedor_bid_frete_internacional.dashboard.card_propostas_titulo', 'Minhas propostas'),
      descricao: t('bidfrete.visao_fornecedor_bid_frete_internacional.dashboard.card_propostas_desc', 'Histórico de propostas enviadas'),
      icone: <PaperPlaneTilt weight="duotone" size={24} />,
      rota: '/visao-fornecedor-bid-frete-internacional/propostas',
      cor: 'var(--warning, #f59e0b)',
    },
    {
      titulo: t('bidfrete.visao_fornecedor_bid_frete_internacional.dashboard.card_desempenho_titulo'),
      descricao: t('bidfrete.visao_fornecedor_bid_frete_internacional.dashboard.card_desempenho_desc'),
      icone: <ChartBar weight="duotone" size={24} />,
      rota: '/visao-fornecedor-bid-frete-internacional/desempenho',
      cor: 'var(--success, #22c55e)',
    },
  ]

  return (
    <PaginaGlobal className="vfbfi-dashboard bid-frete-page-shell">
      {/* KPI Cards */}
      <div className="pd-kpis">
        <CardBasicoGlobal
          titulo={t('bidfrete.visao_fornecedor_bid_frete_internacional.dashboard.pendentes')}
          icone={<ClockCountdown weight="duotone" size={16} />}
          valor={kpis?.pendentes ?? 0}
          className="pd-kpi-card"
        />
        <CardBasicoGlobal
          titulo={t('bidfrete.visao_fornecedor_bid_frete_internacional.dashboard.propostas_enviadas', 'Propostas enviadas')}
          icone={<PaperPlaneTilt weight="duotone" size={16} />}
          valor={kpis?.propostas_enviadas ?? 0}
          className="pd-kpi-card"
        />
        <CardBasicoGlobal
          titulo={t('bidfrete.visao_fornecedor_bid_frete_internacional.dashboard.aprovadas')}
          icone={<CheckCircle weight="duotone" size={16} />}
          valor={kpis?.propostas_aprovadas ?? 0}
          className="pd-kpi-card"
        />
        <div className="pd-kpi-card pd-kpi-custom">
          <div className="pd-kpi-icon">
            <Percent weight="duotone" size={16} />
          </div>
          <span className="pd-kpi-label">{t('bidfrete.visao_fornecedor_bid_frete_internacional.dashboard.taxa_resposta')}</span>
          <span className="pd-kpi-valor">{(kpis?.taxa_resposta ?? 0).toFixed(1)}%</span>
        </div>
        <div className="pd-kpi-card pd-kpi-custom">
          <div className="pd-kpi-icon">
            <Star weight="duotone" size={16} />
          </div>
          <span className="pd-kpi-label">{t('bidfrete.visao_fornecedor_bid_frete_internacional.dashboard.classificacao', 'Classificação')}</span>
          <span className="pd-kpi-valor">{(kpis?.nota_global_classificacao_bid_frete_internacional ?? 0).toFixed(1)}</span>
          <div className="pd-stars">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                weight={i <= Math.round(kpis?.nota_global_classificacao_bid_frete_internacional ?? 0) ? 'fill' : 'duotone'}
                size={14}
                style={{ color: i <= Math.round(kpis?.nota_global_classificacao_bid_frete_internacional ?? 0) ? 'var(--warning, #f59e0b)' : 'var(--text-muted, #64748b)' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Valor Aprovado Highlight — reservado para monetização futura */}
      <div className="pd-actions">
        {actionCards.map(card => (
          <button
            key={card.rota}
            className="pd-action-card"
            onClick={() => navigate(card.rota)}
          >
            <div className="pd-action-icon" style={{ color: card.cor }}>
              {card.icone}
            </div>
            <div className="pd-action-text">
              <span className="pd-action-titulo">{card.titulo}</span>
              <span className="pd-action-desc">{card.descricao}</span>
            </div>
            <ArrowRight weight="bold" size={18} className="pd-action-arrow" />
          </button>
        ))}
      </div>

      <style>{`
        .vfbfi-dashboard { }

        .pd-kpis {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 1100px) {
          .pd-kpis { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .pd-kpis { grid-template-columns: 1fr 1fr; }
        }

        .pd-kpi-card {
          min-height: 100px;
        }

        .pd-kpi-custom {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .pd-kpi-icon {
          color: var(--accent, #6366f1);
          margin-bottom: 0.25rem;
        }

        .pd-kpi-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted, #64748b);
        }

        .pd-kpi-valor {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary, #f1f5f9);
          font-family: 'DM Mono', monospace;
        }

        .pd-stars {
          display: flex;
          gap: 0.15rem;
          margin-top: 0.25rem;
        }

        /* Highlight card */
        .pd-highlight {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04));
          border: 1px solid rgba(34,197,94,0.25);
          border-radius: var(--radius-lg, 12px);
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
        }

        .pd-highlight-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(34,197,94,0.15);
          border-radius: var(--radius-md, 8px);
          color: var(--success, #22c55e);
        }

        .pd-highlight-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .pd-highlight-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--success, #22c55e);
        }

        .pd-highlight-valor {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary, #f1f5f9);
          font-family: 'DM Mono', monospace;
        }

        /* Action cards */
        .pd-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        @media (max-width: 900px) {
          .pd-actions { grid-template-columns: 1fr; }
        }

        .pd-action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--bg-surface, #334155);
          border: 1px solid var(--bg-elevated, #475569);
          border-radius: var(--radius-lg, 12px);
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
          text-align: left;
          width: 100%;
        }
        .pd-action-card:hover {
          border-color: var(--accent, #6366f1);
          background: var(--bg-elevated, #475569);
        }

        .pd-action-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-elevated, #475569);
          border-radius: var(--radius-md, 8px);
          flex-shrink: 0;
        }

        .pd-action-text {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          flex: 1;
        }

        .pd-action-titulo {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
        }

        .pd-action-desc {
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
        }

        .pd-action-arrow {
          color: var(--text-muted, #64748b);
          flex-shrink: 0;
          transition: transform 0.15s;
        }
        .pd-action-card:hover .pd-action-arrow {
          color: var(--accent, #6366f1);
          transform: translateX(3px);
        }
      `}</style>
    </PaginaGlobal>
  )
}
