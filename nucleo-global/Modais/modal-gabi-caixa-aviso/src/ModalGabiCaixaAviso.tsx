/**
 * @nucleo/modal-gabi-caixa-aviso — ModalGabiCaixaAviso
 *
 * Card GABI AI com gradiente roxo/índigo, badge "ao vivo",
 * subtítulo e slot de insight cards aninhados.
 *
 * Uso básico:
 * ```tsx
 * <ModalGabiCaixaAviso subtitulo="3 oportunidades esta semana">
 *   <ModalGabiCaixaAviso.InsightCard
 *     tag="Redução Tributária · NCM 8471"
 *     texto={<>Economize até <strong>12% em ICMS</strong>.</>}
 *     stat={{ label: 'Economia estimada', valor: 'R$ 23.400/mês' }}
 *     onLink={() => navigate('/gabi')}
 *     textoLink="Ver análise completa"
 *   />
 * </ModalGabiCaixaAviso>
 * ```
 */

import React from 'react'
import { Sparkle, CaretRight, RocketLaunch, Warning } from '@phosphor-icons/react'
import './modal-gabi-caixa-aviso.css'

/* ── Tipos ── */

export interface InsightCardProps {
  tag: string
  /** Ícone da tag — padrão RocketLaunch; use 'warn' para Warning */
  variante?: 'default' | 'warn'
  texto: React.ReactNode
  stat?: { label: string; valor: string }
  textoLink?: string
  onLink?: () => void
}

export interface ModalGabiCaixaAvisoProps {
  /** Texto abaixo do header, ex: "3 oportunidades esta semana" */
  subtitulo?: string
  /** Oculta o badge "ao vivo" */
  semBadge?: boolean
  children: React.ReactNode
  className?: string
}

/* ── Sub-componente InsightCard ── */

function InsightCard({ tag, variante = 'default', texto, stat, textoLink, onLink }: InsightCardProps) {
  const isWarn = variante === 'warn'
  return (
    <div className={`mgca-insight-card${isWarn ? ' mgca-insight-card--warn' : ''}`}>
      <div className={`mgca-insight-tag${isWarn ? ' mgca-insight-tag--warn' : ''}`}>
        {isWarn
          ? <Warning size={11} weight="fill" />
          : <RocketLaunch size={11} weight="fill" />}
        {tag}
      </div>

      <p className="mgca-insight-text">{texto}</p>

      {stat && (
        <div className="mgca-insight-stat">
          <span className="mgca-insight-stat-label">{stat.label}</span>
          <span className="mgca-insight-stat-value">{stat.valor}</span>
        </div>
      )}

      {textoLink && (
        <button className="mgca-insight-link" type="button" onClick={onLink}>
          {textoLink} <CaretRight size={11} />
        </button>
      )}
    </div>
  )
}

/* ── Componente principal ── */

export function ModalGabiCaixaAviso({
  subtitulo,
  semBadge = false,
  children,
  className,
}: ModalGabiCaixaAvisoProps) {
  return (
    <div className={`mgca-card${className ? ` ${className}` : ''}`}>
      {/* watermark decorativo */}
      <div className="mgca-watermark" aria-hidden="true">
        <Sparkle weight="fill" size={200} />
      </div>

      <div className="mgca-body">
        {/* Header */}
        <div className="mgca-top-row">
          <div className="mgca-header">
            <div className="mgca-avatar">
              <Sparkle weight="fill" size={14} color="#fff" />
            </div>
            <span className="mgca-label">GABI AI · Insights</span>
          </div>

          {!semBadge && (
            <span className="mgca-live-badge">
              <span className="mgca-live-dot" />
              ao vivo
            </span>
          )}
        </div>

        {subtitulo && <p className="mgca-sub">{subtitulo}</p>}

        {/* Insight cards */}
        <div className="mgca-insights-row">
          {children}
        </div>
      </div>
    </div>
  )
}

/* Expõe InsightCard como sub-componente estático */
ModalGabiCaixaAviso.InsightCard = InsightCard
