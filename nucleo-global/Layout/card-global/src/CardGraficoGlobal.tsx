import React from 'react'
import type { CardGraficoProps, GaugeLegendaItem } from './tipos'
import './card.css'

// Mapa de cores para classes CSS e cores de stroke do SVG
const COR_STROKE: Record<string, string> = {
  green:  '#34d399',
  yellow: '#fbbf24',
  red:    '#f87171',
}

function dotClass(cor: GaugeLegendaItem['cor']): string {
  if (cor === 'green' || cor === 'yellow' || cor === 'red') {
    return `cg-dot cg-dot--${cor}`
  }
  return 'cg-dot'
}

/**
 * CardGraficoGlobal — Card com gauge circular + legenda do Gravity Design System
 *
 * Exibe um anel SVG proporcional ao valor principal / total,
 * uma legenda com pontos coloridos e um tooltip CSS-only ao hover.
 *
 * @example
 * <CardGraficoGlobal
 *   titulo="Status das Filhas"
 *   icone={<ChartPieSlice weight="duotone" size={16} />}
 *   total={30}
 *   valorPrincipal={23}
 *   corGauge="#34d399"
 *   legenda={[
 *     { label: 'Ativas',    valor: 23, cor: 'green'  },
 *     { label: 'Suspensas', valor:  7, cor: 'yellow' },
 *   ]}
 *   tooltip={...}
 * />
 */
export function CardGraficoGlobal({
  titulo,
  icone,
  variante = 'padrao',
  className = '',
  total,
  valorPrincipal,
  corGauge = '#34d399',
  legenda,
  tooltip,
}: CardGraficoProps) {

  const pct = total > 0 ? Math.round((valorPrincipal / total) * 100) : 0
  const dashArray = `${pct}, 100`

  const cls = [
    'cg-card',
    variante !== 'padrao' ? `cg-card--${variante}` : '',
    tooltip ? 'cg-card--has-tooltip' : '',
    className,
  ].filter(Boolean).join(' ')

  const strokeColor = COR_STROKE[corGauge] ?? corGauge

  return (
    <div className={cls}>

      {/* Cabeçalho: ícone + rótulo */}
      <div className="cg-card__header">
        {icone && <div className="cg-card__icon-wrap">{icone}</div>}
        <p className="cg-card__label">{titulo}</p>
      </div>

      {/* Corpo: gauge + legenda */}
      <div className="cg-card__chart-body">

        {/* Anel SVG */}
        <div className="cg-gauge" style={{ width: 48, height: 48 }}>
          <svg viewBox="0 0 36 36" width={48} height={48}>
            {/* Trilho */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(129, 140, 248, 0.12)"
              strokeWidth="3.5"
            />
            {/* Preenchimento */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeDasharray={dashArray}
              strokeLinecap="round"
            />
          </svg>

          {/* Valor central */}
          <div className="cg-gauge__val">
            <span className="cg-gauge__num">{pct}</span>
            <span className="cg-gauge__pct">%</span>
          </div>
        </div>

        {/* Legenda */}
        <ul className="cg-legend" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {legenda.map((item, i) => (
            <li key={i} className="cg-legend__item">
              <span
                className={dotClass(item.cor)}
                style={item.cor !== 'green' && item.cor !== 'yellow' && item.cor !== 'red'
                  ? { background: item.cor }
                  : undefined}
              />
              {item.label}{item.valor !== undefined ? ` (${item.valor})` : ''}
            </li>
          ))}
        </ul>

      </div>

      {/* Tooltip (cabeçalho automático com ícone + título) */}
      {tooltip && (
        <div className="cg-card__tooltip">
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
