/**
 * Barra de progresso com marcador de ritmo ideal e legenda +/− dias.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import type { MetricasRitmoJornada } from './ritmo-jornada-guia-gravity'

interface BarraProgressoComRitmoProps {
  pctReal: number
  ritmo: MetricasRitmoJornada | null
  altura?: number
  cor?: string
  /** Oculta legenda textual (útil quando o pai já exibe o delta). */
  ocultarLegenda?: boolean
}

const COR_PADRAO = '#818cf8'

export function BarraProgressoComRitmo({
  pctReal,
  ritmo,
  altura = 8,
  cor = COR_PADRAO,
  ocultarLegenda = false,
}: BarraProgressoComRitmoProps) {
  const { t } = useTranslation()
  const pct = Math.min(100, Math.max(0, pctReal))
  const pctIdeal = ritmo ? Math.min(100, Math.max(0, ritmo.pctIdeal)) : null

  const legendaRitmo = (() => {
    if (!ritmo || ocultarLegenda) return null
    if (ritmo.deltaDias > 0) {
      return {
        texto: t('university.dashboard.ritmo.advanced', { dias: ritmo.deltaDias }),
        classe: 'is-adiantado',
      }
    }
    if (ritmo.deltaDias < 0) {
      return {
        texto: t('university.dashboard.ritmo.behind', { dias: Math.abs(ritmo.deltaDias) }),
        classe: 'is-atrasado',
      }
    }
    return {
      texto: t('university.dashboard.ritmo.on_track'),
      classe: 'is-no-ritmo',
    }
  })()

  return (
    <div className="uni-barra-ritmo">
      <div
        className="uni-barra-ritmo__track"
        style={{ height: altura }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={legendaRitmo?.texto ?? t('university.dashboard.ritmo.progresso')}
      >
        <span
          className="uni-barra-ritmo__fill"
          style={{
            width: `${pct}%`,
            background: pct >= 100
              ? 'linear-gradient(90deg,#818cf8,#a78bfa)'
              : `linear-gradient(90deg,${cor},#a78bfa)`,
          }}
        />
        {pctIdeal !== null && (
          <span
            className="uni-barra-ritmo__marcador"
            style={{ left: `${pctIdeal}%` }}
            title={t('university.dashboard.ritmo.marcador_titulo', { pct: pctIdeal })}
            aria-hidden
          />
        )}
      </div>
      {legendaRitmo && (
        <div className={`uni-barra-ritmo__legenda ${legendaRitmo.classe}`}>
          <span className="uni-barra-ritmo__legenda-ideal">
            {t('university.dashboard.ritmo.ideal', { pct: pctIdeal ?? 0 })}
          </span>
          <span className="uni-barra-ritmo__legenda-delta">{legendaRitmo.texto}</span>
        </div>
      )}
    </div>
  )
}
