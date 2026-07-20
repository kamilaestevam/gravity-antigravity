/**
 * Conteúdo refinado do tooltip do pin na barra de ritmo.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  fmtDiaTimelineRitmo,
  type calcularResumoPinTimelineRitmo,
} from './ritmo-jornada-guia-gravity'
import {
  ICONES_INFO_RITMO,
  LegendaIconeCompacta,
} from './dashboard-info-visual-guia-gravity'

interface PinTooltipRitmoGuiaGravityProps {
  resumoPin: ReturnType<typeof calcularResumoPinTimelineRitmo>
}

export function PinTooltipRitmoGuiaGravity({
  resumoPin,
}: PinTooltipRitmoGuiaGravityProps) {
  const { t } = useTranslation()

  return (
    <div className="uni-pin-tooltip-ritmo">
      <div className="uni-pin-tooltip-ritmo__itens">
        <LegendaIconeCompacta
          icone={ICONES_INFO_RITMO.plano}
          tomIcone="ambar"
          rotulo={t('university.dashboard.ritmo.timeline_pin_prazo_rotulo')}
          valor={t('university.dashboard.ritmo.timeline_pin_prazo_valor', {
            dias: fmtDiaTimelineRitmo(resumoPin.prazoEstimadoDias),
          })}
        />
        <LegendaIconeCompacta
          icone={ICONES_INFO_RITMO.voce}
          tomIcone="indigo"
          rotulo={t('university.dashboard.ritmo.timeline_pin_jornada_rotulo')}
          valor={t('university.dashboard.ritmo.timeline_pin_jornada_valor', {
            dias: fmtDiaTimelineRitmo(resumoPin.diasJornada),
          })}
        />
        <LegendaIconeCompacta
          icone={ICONES_INFO_RITMO.faltam}
          tomIcone="ciano"
          rotulo={t('university.dashboard.ritmo.timeline_pin_faltam_rotulo')}
          valor={t('university.dashboard.ritmo.timeline_pin_faltam_valor', {
            dias: fmtDiaTimelineRitmo(resumoPin.faltamDias),
          })}
        />
      </div>
    </div>
  )
}
