/**
 * Card KPI do simulador — paridade CardBasicoGlobal sem portal (evita artefatos no 3D da landing).
 */
import type { ReactNode } from 'react'
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
  const cls = [
    'cg-card',
    variante !== 'padrao' ? `cg-card--${variante}` : '',
    tooltip ? 'cg-card--has-tooltip' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cls}>
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
        <div className="cg-card__tooltip" role="tooltip">
          <div className="cg-tooltip__header">
            {icone && <span className="cg-tooltip__header-icon">{icone}</span>}
            <p className="cg-tooltip__title">{titulo}</p>
          </div>
          <div className="cg-tooltip__divider" />
          {tooltip}
        </div>
      )}
    </div>
  )
}
