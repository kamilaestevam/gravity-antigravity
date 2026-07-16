/**
 * Painel informativo do ritmo da jornada — dashboard Minha jornada.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { MINUTOS_RITMO_IDEAL_DIA } from './duracao-academy-guia-gravity'
import type { MetricasRitmoJornada } from './ritmo-jornada-guia-gravity'
import { PopoverInfoDashboardGuiaGravity } from './popover-info-dashboard-guia-gravity'
import {
  DiagramaRitmoVisual,
  ICONES_INFO_RITMO,
  LegendaIconeCompacta,
} from './dashboard-info-visual-guia-gravity'

interface DashboardInfoRitmoGuiaGravityProps {
  ritmo?: MetricasRitmoJornada | null
}

export function DashboardInfoRitmoGuiaGravity({ ritmo }: DashboardInfoRitmoGuiaGravityProps) {
  const { t, i18n } = useTranslation()
  const fmt = (valor: number) => valor.toLocaleString(i18n.language)
  const pctIdeal = ritmo?.pctIdeal ?? 62
  const pctReal = ritmo?.pctRealMinutos ?? 41

  return (
    <PopoverInfoDashboardGuiaGravity
      titulo={t('university.dashboard.ritmo.info.titulo')}
      ariaLabel={t('university.dashboard.ritmo.info.trigger_aria')}
      alinhamentoHorizontal="fim"
      posicaoPreferida="abaixo"
    >
      <div className="uni-dashboard-info-panel">
        <DiagramaRitmoVisual pctIdeal={pctIdeal} pctReal={pctReal} />
        <div className="uni-info-visual-grade uni-info-visual-grade--ritmo">
          <LegendaIconeCompacta
            icone={ICONES_INFO_RITMO.plano}
            rotulo={t('university.dashboard.ritmo.info.compact_plano_rotulo')}
            valor={t('university.dashboard.ritmo.info.compact_plano_valor', {
              minutos: MINUTOS_RITMO_IDEAL_DIA,
            })}
          />
          <LegendaIconeCompacta
            icone={ICONES_INFO_RITMO.real}
            rotulo={t('university.dashboard.ritmo.info.compact_real_rotulo')}
            valor={t('university.dashboard.ritmo.info.compact_real_valor')}
          />
          <LegendaIconeCompacta
            icone={ICONES_INFO_RITMO.ideal}
            rotulo={t('university.dashboard.ritmo.info.compact_ideal_rotulo')}
            valor={t('university.dashboard.ritmo.info.compact_ideal_valor', {
              minutos: MINUTOS_RITMO_IDEAL_DIA,
            })}
          />
          <LegendaIconeCompacta
            icone={ICONES_INFO_RITMO.delta}
            rotulo={t('university.dashboard.ritmo.info.compact_delta_rotulo')}
            valor={t('university.dashboard.ritmo.info.compact_delta_valor', {
              minutos: MINUTOS_RITMO_IDEAL_DIA,
            })}
          />
        </div>
        {ritmo && ritmo.minutosTotais > 0 && (
          <p className="uni-dashboard-info-panel__nota">
            {t('university.dashboard.ritmo.info.compact_resumo', {
              minutos: fmt(ritmo.minutosTotais),
              dias: ritmo.diasPlanoTotal,
              ideal: ritmo.pctIdeal,
            })}
          </p>
        )}
      </div>
    </PopoverInfoDashboardGuiaGravity>
  )
}
