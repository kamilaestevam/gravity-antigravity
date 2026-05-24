import React, { useState, useRef, useCallback, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { ArrowUp, ArrowDown, ArrowRight } from '@phosphor-icons/react'
import type { CardBasicoProps, PeriodoCodigo, PeriodoTendencia } from './tipos'
import './card.css'

const DEFAULT_PERIODO: PeriodoCodigo = '30d'

/**
 * CardBasicoGlobal — Card de métrica numérica do Gravity Design System
 *
 * Exibe título, ícone, valor em destaque, tendência com seletor de período
 * interativo (7d / 30d / 6m / 1a), subtexto e tooltip ao hover (portal fixed).
 *
 * @example
 * <CardBasicoGlobal
 *   titulo="Total de Filhas"
 *   icone={<TreeStructure weight="duotone" size={16} />}
 *   valor={30}
 *   periodos={[
 *     { periodo: '7d',  rotulo: '7 dias',   valor: '+1', direcao: 'up'      },
 *     { periodo: '30d', rotulo: '30 dias',  valor: '+5%', direcao: 'up'     },
 *     { periodo: '6m',  rotulo: '6 meses',  valor: '+12%', direcao: 'up'    },
 *     { periodo: '1a',  rotulo: '1 ano',    valor: '+30%', direcao: 'up'    },
 *   ]}
 *   tooltip={<><p className="cg-tooltip__title">Detalhe</p>...</>}
 * />
 */
export function CardBasicoGlobal({
  titulo,
  valor,
  tendencia,
  periodos,
  subtexto,
  icone,
  variante = 'padrao',
  alinhamento = 'esquerda',
  className = '',
  tooltip,
  tooltipPosicao = 'bottom',
}: CardBasicoProps) {

  const [periodoAtivo, setPeriodoAtivo] = useState<PeriodoCodigo>(DEFAULT_PERIODO)
  const [showPicker, setShowPicker] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const atualizarPosTooltip = useCallback(() => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setTooltipPos({
      x: r.left + r.width / 2,
      y: tooltipPosicao === 'top' ? r.top - 10 : r.bottom + 10,
    })
  }, [tooltipPosicao])

  const abrirTooltip = useCallback(() => {
    if (!tooltip || document.body.classList.contains('tooltips-disabled')) return
    atualizarPosTooltip()
    setShowTooltip(true)
  }, [tooltip, atualizarPosTooltip])

  const fecharTooltip = useCallback(() => setShowTooltip(false), [])

  useEffect(() => {
    if (!showTooltip) return
    function reposicionar() { atualizarPosTooltip() }
    function fechar() { setShowTooltip(false) }
    window.addEventListener('scroll', fechar, true)
    window.addEventListener('resize', reposicionar)
    return () => {
      window.removeEventListener('scroll', fechar, true)
      window.removeEventListener('resize', reposicionar)
    }
  }, [showTooltip, atualizarPosTooltip])

  // Resolve a tendência ativa: periodos tem prioridade sobre tendencia estática
  const tendenciaAtiva: { valor: string; direcao: string } | undefined = periodos
    ? (periodos.find(p => p.periodo === periodoAtivo) ?? periodos[0])
    : tendencia

  const cls = [
    'cg-card',
    variante !== 'padrao' ? `cg-card--${variante}` : '',
    `cg-card--align-${alinhamento}`,
    tooltip ? 'cg-card--has-tooltip' : '',
    className,
  ].filter(Boolean).join(' ')

  const tooltipPortal = tooltip && showTooltip
    ? ReactDOM.createPortal(
        <div
          className={`cg-card__tooltip cg-card__tooltip--portal${tooltipPosicao === 'top' ? ' cg-card__tooltip--portal-top' : ''}`}
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
          role="tooltip"
        >
          <div className="cg-tooltip__header">
            {icone && <span className="cg-tooltip__header-icon">{icone}</span>}
            <p className="cg-tooltip__title">{titulo}</p>
          </div>
          <div className="cg-tooltip__divider" />
          {tooltip}
        </div>,
        document.body,
      )
    : null

  function TrendArrow({ direcao }: { direcao: string }) {
    if (direcao === 'up')      return <ArrowUp    size={13} weight="bold" />
    if (direcao === 'down')    return <ArrowDown  size={13} weight="bold" />
    return                            <ArrowRight size={13} weight="bold" />
  }

  return (
    <div
      ref={cardRef}
      className={cls}
      onMouseEnter={abrirTooltip}
      onMouseLeave={fecharTooltip}
    >

      {/* Cabeçalho: ícone + rótulo */}
      <div className="cg-card__header">
        {icone && <div className="cg-card__icon-wrap">{icone}</div>}
        <p className="cg-card__label">{titulo}</p>
      </div>

      {/* Corpo: valor + tendência + subtexto */}
      <div className="cg-card__body">
        <div className="cg-card__value-row">
          <span className="cg-card__value">{valor}</span>

          {tendenciaAtiva && (
            <div
              className={`cg-card__trend-wrap${periodos ? ' cg-card__trend-wrap--interactive' : ''}`}
              onMouseEnter={() => { if (!periodos) return; if (closeTimer.current) clearTimeout(closeTimer.current); setShowPicker(true) }}
              onMouseLeave={() => { if (!periodos) return; closeTimer.current = setTimeout(() => setShowPicker(false), 120) }}
            >
              {/* Badge de tendência */}
              <span className={`cg-card__trend cg-card__trend--${tendenciaAtiva.direcao}`}>
                <TrendArrow direcao={tendenciaAtiva.direcao} />
                {tendenciaAtiva.valor}
              </span>

              {/* Seletor de períodos (flutua ao hover) */}
              {periodos && showPicker && (
                <div className="cg-period-picker">
                  <p className="cg-period-picker__label">Comparar com período</p>
                  <div className="cg-period-picker__options">
                    {periodos.map((p: PeriodoTendencia) => (
                      <button
                        key={p.periodo}
                        className={`cg-period-picker__btn${periodoAtivo === p.periodo ? ' cg-period-picker__btn--active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setPeriodoAtivo(p.periodo)
                        }}
                      >
                        {p.rotulo}
                        <span className={`cg-period-picker__val cg-period-picker__val--${p.direcao}`}>
                          <TrendArrow direcao={p.direcao} />
                          {p.valor}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {subtexto && (
          <div className="cg-card__subtext">{subtexto}</div>
        )}
      </div>

      {tooltipPortal}
    </div>
  )
}
