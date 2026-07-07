/**
 * Card KPI do simulador — paridade CardBasicoGlobal sem portal (evita artefatos no 3D da landing).
 * Tooltip fixo: clique no card abre; fecha com X local ou clique fora.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from '@phosphor-icons/react'
import '../../../Layout/card-global/src/card.css'

type Variante = 'padrao' | 'sucesso' | 'aviso' | 'perigo' | 'primario'

type Props = {
  titulo: string
  valor: ReactNode
  icone?: ReactNode
  variante?: Variante
  className?: string
  tooltip?: ReactNode
}

export function CardKpiSimulador({
  titulo,
  valor,
  icone,
  variante = 'padrao',
  className = '',
  tooltip,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tooltipAberto, setTooltipAberto] = useState(false)

  useEffect(() => {
    if (!tooltipAberto) return
    function aoPointerFora(ev: MouseEvent) {
      const card = cardRef.current
      if (!card) return
      const alvo = ev.target
      if (alvo instanceof Node && card.contains(alvo)) return
      setTooltipAberto(false)
    }
    document.addEventListener('mousedown', aoPointerFora)
    return () => document.removeEventListener('mousedown', aoPointerFora)
  }, [tooltipAberto])

  const cls = [
    'cg-card',
    variante !== 'padrao' ? `cg-card--${variante}` : '',
    tooltip ? 'cg-card--has-tooltip' : '',
    tooltip && tooltipAberto ? 'cg-card--tooltip-aberto' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  function alternarTooltip() {
    if (!tooltip) return
    setTooltipAberto((aberto) => !aberto)
  }

  return (
    <div
      ref={cardRef}
      className={cls}
      onClick={alternarTooltip}
      onKeyDown={(e) => {
        if (!tooltip) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          alternarTooltip()
        }
        if (e.key === 'Escape') setTooltipAberto(false)
      }}
      role={tooltip ? 'button' : undefined}
      tabIndex={tooltip ? 0 : undefined}
      aria-expanded={tooltip ? tooltipAberto : undefined}
      aria-haspopup={tooltip ? 'dialog' : undefined}
    >
      <div className="cg-card__header">
        {icone && <div className="cg-card__icon-wrap">{icone}</div>}
        <p className="cg-card__label">{titulo}</p>
      </div>
      <div className="cg-card__body">
        <div className="cg-card__value-row">
          <span className="cg-card__value">{valor}</span>
        </div>
      </div>
      {tooltip && (
        <div className="cg-card__tooltip cg-card__tooltip--fixo" role="tooltip" onClick={(e) => e.stopPropagation()}>
          <div className="cg-tooltip__header">
            {icone && <span className="cg-tooltip__header-icon">{icone}</span>}
            <p className="cg-tooltip__title">{titulo}</p>
            <button
              type="button"
              className="cg-tooltip__fechar"
              onClick={(e) => {
                e.stopPropagation()
                setTooltipAberto(false)
              }}
              aria-label="Fechar detalhe"
            >
              <X size={12} weight="bold" />
            </button>
          </div>
          <div className="cg-tooltip__divider" />
          {tooltip}
        </div>
      )}
    </div>
  )
}
