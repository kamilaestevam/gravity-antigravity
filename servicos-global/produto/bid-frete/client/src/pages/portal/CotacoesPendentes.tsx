/**
 * CotacoesPendentes.tsx — Portal do Fornecedor: Cotacoes Aguardando Resposta
 * Cards com dados da cotacao, countdown, botao responder
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { useSincronizarTituloPaginaTopo } from '../../shared/useSincronizarTituloPaginaTopo'
import {
  Envelope,
  Anchor,
  AirplaneTilt,
  Van,
  ArrowRight,
  ClockCountdown,
  Package,
  MapPin,
} from '@phosphor-icons/react'

import { getPortalPendentes } from '../../shared/api'
import type { BidRequest, ModalFrete, StatusBidRequest } from '../../shared/types'
import { MODAL_LABELS, STATUS_BID_LABELS } from '../../shared/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

const MODAL_ICONS: Record<ModalFrete, React.ReactNode> = {
  MARITIMO: <Anchor weight="duotone" size={20} />,
  AEREO: <AirplaneTilt weight="duotone" size={20} />,
  RODOVIARIO: <Van weight="duotone" size={20} />,
}

const BID_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDENTE:    { bg: 'rgba(245,158,11,0.15)',  color: 'var(--warning, #f59e0b)' },
  ENVIADO:     { bg: 'rgba(59,130,246,0.15)',   color: 'var(--accent, #6366f1)' },
  VISUALIZADO: { bg: 'rgba(59,130,246,0.15)',   color: 'var(--accent, #6366f1)' },
  RESPONDIDO:  { bg: 'rgba(34,197,94,0.15)',    color: 'var(--success, #22c55e)' },
  EXPIRADO:    { bg: 'rgba(239,68,68,0.15)',    color: 'var(--danger, #ef4444)' },
  ERRO_ENVIO:  { bg: 'rgba(239,68,68,0.15)',    color: 'var(--danger, #ef4444)' },
}

interface CotacaoInfo {
  numero_cotacao_bid_frete: string
  porto_origem_cotacao_bid_frete: string
  porto_destino_cotacao_bid_frete: string
  modal: ModalFrete
  incoterm_cotacao_bid_frete: string
  quantidade_volumes_cotacao_bid_frete: number
  peso_kg_cotacao_bid_frete: number | null
  prazo_resposta: string | null
}

function calcCountdown(prazo: string | null, t: (key: string, opts?: Record<string, unknown>) => string): { label: string; urgente: boolean } {
  if (!prazo) return { label: t('bidfrete.portal.cotacoes_pendentes.sem_prazo'), urgente: false }
  const diff = new Date(prazo).getTime() - Date.now()
  if (diff <= 0) return { label: t('bidfrete.portal.cotacoes_pendentes.expirado'), urgente: true }
  const horas = Math.floor(diff / (1000 * 60 * 60))
  const dias = Math.floor(horas / 24)
  if (dias > 1) return { label: t('bidfrete.portal.cotacoes_pendentes.dias_restantes', { count: dias }), urgente: dias <= 2 }
  if (horas > 0) return { label: t('bidfrete.portal.cotacoes_pendentes.horas_restantes', { count: horas }), urgente: true }
  const minutos = Math.floor(diff / (1000 * 60))
  return { label: t('bidfrete.portal.cotacoes_pendentes.min_restantes', { count: minutos }), urgente: true }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CotacoesPendentes() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [bids, setBids] = useState<BidRequest[]>([])
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const data = await getPortalPendentes()
      setBids(data)
    } catch {
      // silencioso
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  useSincronizarTituloPaginaTopo(useMemo(() => ({
    label:     t('bidfrete.portal.cotacoes_pendentes.titulo'),
    icone:     <Envelope weight="duotone" size={22} />,
    subtitulo: t('bidfrete.portal.cotacoes_pendentes.subtitulo', { count: bids.length }),
  }), [t, bids.length]))

  return (
    <PaginaGlobal className="cp-page">
      {carregando ? (
        <div className="cp-loading">
          <ClockCountdown weight="duotone" size={48} style={{ opacity: 0.3 }} />
          <p>{t('bidfrete.portal.cotacoes_pendentes.carregando')}</p>
        </div>
      ) : bids.length === 0 ? (
        <div className="cp-empty">
          <Envelope weight="duotone" size={48} style={{ opacity: 0.3 }} />
          <p>{t('bidfrete.portal.cotacoes_pendentes.vazio')}</p>
        </div>
      ) : (
        <div className="cp-grid">
          {bids.map(bid => {
            const cotacao = (bid as unknown as { cotacao: CotacaoInfo }).cotacao
            const numero = cotacao?.numero_cotacao_bid_frete ?? bid.cotacao_id.slice(0, 8).toUpperCase()
            const modal = cotacao?.modal ?? 'MARITIMO'
            const countdown = calcCountdown(cotacao?.prazo_resposta ?? bid.expirado_em, t)
            const statusCores = BID_STATUS_COLORS[bid.status] ?? BID_STATUS_COLORS.PENDENTE

            return (
              <div key={bid.id} className="cp-card">
                <div className="cp-card-header">
                  <div className="cp-modal-icon" style={{ color: 'var(--accent, #6366f1)' }}>
                    {MODAL_ICONS[modal] ?? MODAL_ICONS.MARITIMO}
                  </div>
                  <div className="cp-card-meta">
                    <span className="cp-numero">{numero}</span>
                    <span
                      className="cp-status-badge"
                      style={{ background: statusCores.bg, color: statusCores.color }}
                    >
                      {STATUS_BID_LABELS[bid.status]}
                    </span>
                  </div>
                </div>

                <div className="cp-card-body">
                  <div className="cp-info-row">
                    <MapPin weight="duotone" size={14} />
                    <span>{cotacao?.porto_origem_cotacao_bid_frete ?? '—'} &rarr; {cotacao?.porto_destino_cotacao_bid_frete ?? '—'}</span>
                  </div>
                  <div className="cp-info-row">
                    <span className="cp-info-label">Modal</span>
                    <span>{MODAL_LABELS[modal]}</span>
                  </div>
                  <div className="cp-info-row">
                    <span className="cp-info-label">Incoterm</span>
                    <span>{cotacao?.incoterm_cotacao_bid_frete ?? '—'}</span>
                  </div>
                  <div className="cp-info-row">
                    <Package weight="duotone" size={14} />
                    <span>
                      {cotacao?.quantidade_volumes_cotacao_bid_frete ?? 0} un
                      {cotacao?.peso_kg_cotacao_bid_frete != null ? ` / ${cotacao.peso_kg_cotacao_bid_frete.toLocaleString('pt-BR')} kg` : ''}
                    </span>
                  </div>
                </div>

                <div className={`cp-countdown ${countdown.urgente ? 'cp-countdown--urgente' : ''}`}>
                  <ClockCountdown weight="duotone" size={14} />
                  <span>{countdown.label}</span>
                </div>

                <button
                  className="cp-btn-responder"
                  onClick={() => navigate(`/bid-frete/portal/responder/${bid.id}`)}
                >
                  {t('bidfrete.portal.responder.titulo')}
                  <ArrowRight weight="bold" size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        .cp-page { padding: 0; }

        .cp-loading, .cp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          gap: 1rem;
          color: var(--text-muted, #64748b);
          font-size: 0.875rem;
        }

        .cp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1rem;
        }

        .cp-card {
          background: var(--bg-surface, #334155);
          border: 1px solid var(--bg-elevated, #475569);
          border-radius: var(--radius-lg, 12px);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: border-color 0.15s;
        }
        .cp-card:hover {
          border-color: var(--accent, #6366f1);
        }

        .cp-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .cp-modal-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-elevated, #475569);
          border-radius: var(--radius-md, 8px);
          flex-shrink: 0;
        }

        .cp-card-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .cp-numero {
          font-family: 'DM Mono', monospace;
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary, #f1f5f9);
        }

        .cp-status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.6875rem;
          font-weight: 600;
        }

        .cp-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .cp-info-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
        }

        .cp-info-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted, #64748b);
          min-width: 60px;
        }

        .cp-countdown {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-secondary, #94a3b8);
          padding: 0.5rem 0.75rem;
          background: var(--bg-elevated, #475569);
          border-radius: var(--radius-md, 8px);
        }

        .cp-countdown--urgente {
          background: rgba(239,68,68,0.1);
          color: var(--danger, #ef4444);
          border: 1px solid rgba(239,68,68,0.2);
        }

        .cp-btn-responder {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          font-family: inherit;
          background: var(--accent, #6366f1);
          color: #fff;
          width: 100%;
        }
        .cp-btn-responder:hover {
          background: var(--accent-hover, #4f46e5);
        }
      `}</style>
    </PaginaGlobal>
  )
}
