/**
 * Painel informativo do ritmo da jornada — status atual + como funciona (popover único).
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { MINUTOS_RITMO_IDEAL_DIA } from './duracao-academy-guia-gravity'
import type { MetricasRitmoJornada } from './ritmo-jornada-guia-gravity'
import {
  aplicarDemoRitmoGuiaGravity,
  calcularLegendaStatusRitmo,
  calcularPosicoesTimelineRitmo,
  fmtDiaTimelineRitmo,
  ritmoAguardandoModulosAnteriores,
} from './ritmo-jornada-guia-gravity'
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
  const [searchParams] = useSearchParams()
  const fmt = (valor: number) => valor.toLocaleString(i18n.language)

  const demoModo = searchParams.get('demoRitmo')
  const demoRitmo = demoModo === 'atrasado' || demoModo === 'adiantado' ? demoModo : null
  const ritmoVisivel = ritmo ? aplicarDemoRitmoGuiaGravity(ritmo, demoRitmo) : null
  const aguardandoModulo = ritmoVisivel
    ? ritmoAguardandoModulosAnteriores(ritmoVisivel, demoRitmo)
    : false
  const timeline = ritmoVisivel ? calcularPosicoesTimelineRitmo(ritmoVisivel) : null
  const legendaStatus = ritmoVisivel
    ? calcularLegendaStatusRitmo(ritmoVisivel, aguardandoModulo, t)
    : null

  const pctIdeal = ritmoVisivel?.pctIdeal ?? ritmo?.pctIdeal ?? 62
  const pctReal = ritmoVisivel?.pctRealMinutos ?? ritmo?.pctRealMinutos ?? 41

  return (
    <PopoverInfoDashboardGuiaGravity
      titulo={t('university.dashboard.ritmo.jornada_rotulo')}
      ariaLabel={t('university.dashboard.ritmo.info.trigger_aria')}
      alinhamentoHorizontal="fim"
      posicaoPreferida="abaixo"
    >
      <div className="uni-dashboard-info-panel uni-dashboard-info-panel--ritmo">
        {timeline && legendaStatus && (
          <>
            <p className="uni-dashboard-info-panel__secao-titulo">
              {t('university.dashboard.ritmo.timeline_info_titulo')}
            </p>
            <DiagramaRitmoVisual pctIdeal={pctIdeal} pctReal={pctReal} />
            <div className="uni-info-visual-grade uni-info-visual-grade--ritmo">
              <LegendaIconeCompacta
                icone={ICONES_INFO_RITMO.voce}
                rotulo={t('university.dashboard.ritmo.timeline_info_voce_rotulo')}
                valor={t('university.dashboard.ritmo.timeline_info_dia', {
                  dia: fmtDiaTimelineRitmo(timeline.diaProgresso),
                })}
              />
              {!aguardandoModulo && (
                <LegendaIconeCompacta
                  icone={ICONES_INFO_RITMO.meta}
                  rotulo={t('university.dashboard.ritmo.timeline_info_meta_rotulo')}
                  valor={t('university.dashboard.ritmo.timeline_info_dia', {
                    dia: fmtDiaTimelineRitmo(timeline.diaMetaHoje),
                  })}
                />
              )}
              <LegendaIconeCompacta
                icone={ICONES_INFO_RITMO.plano}
                rotulo={t('university.dashboard.ritmo.timeline_info_plano_rotulo')}
                valor={t('university.dashboard.ritmo.timeline_info_plano_valor', {
                  total: timeline.diaPlanoTotal,
                  minutos: MINUTOS_RITMO_IDEAL_DIA,
                })}
              />
              <LegendaIconeCompacta
                icone={ICONES_INFO_RITMO.status}
                rotulo={t('university.dashboard.ritmo.timeline_info_status_rotulo')}
                valor={legendaStatus.texto}
                valorClassName={`uni-barra-ritmo__info-status ${legendaStatus.classe}`}
              />
            </div>
            <div className="uni-dashboard-info-panel__divisor" aria-hidden />
          </>
        )}

        <p className="uni-dashboard-info-panel__secao-titulo">
          {t('university.dashboard.ritmo.info.titulo')}
        </p>
        {!(timeline && legendaStatus) && (
          <DiagramaRitmoVisual pctIdeal={pctIdeal} pctReal={pctReal} />
        )}
        <div className={`uni-info-visual-grade uni-info-visual-grade--ritmo${timeline && legendaStatus ? ' uni-info-visual-grade--sem-borda-superior' : ''}`}>
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
        {ritmoVisivel && ritmoVisivel.minutosTotais > 0 && (
          <p className="uni-dashboard-info-panel__nota">
            {t('university.dashboard.ritmo.info.compact_resumo', {
              minutos: fmt(ritmoVisivel.minutosTotais),
              dias: ritmoVisivel.diasPlanoTotal,
              ideal: ritmoVisivel.pctIdeal,
            })}
          </p>
        )}
      </div>
    </PopoverInfoDashboardGuiaGravity>
  )
}
