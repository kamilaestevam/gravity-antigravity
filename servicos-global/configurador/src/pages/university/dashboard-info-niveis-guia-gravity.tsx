/**
 * Painel informativo de níveis, XP e ofensiva — dashboard Minha jornada.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  calcularNivelGuiaGravity,
  XP_POR_NIVEL_GUIA_GRAVITY,
} from './niveis-guia-gravity'
import { PESO_GUAI_XP_MULTIPLICADOR, formatarXpGuiaGravity } from './pesos-academy-guia-gravity'
import { MINUTOS_RITMO_IDEAL_DIA } from './duracao-academy-guia-gravity'
import { PopoverInfoDashboardGuiaGravity } from './popover-info-dashboard-guia-gravity'
import {
  EscalaNiveisVisual,
  ICONES_INFO_NIVEL,
  LegendaIconeCompacta,
} from './dashboard-info-visual-guia-gravity'

interface DashboardInfoNiveisGuiaGravityProps {
  xpTotal: number
  xpParaSubir: number
}

export function DashboardInfoNiveisGuiaGravity({ xpTotal, xpParaSubir }: DashboardInfoNiveisGuiaGravityProps) {
  const { t } = useTranslation()
  const { nivel, xpMetaNivel } = calcularNivelGuiaGravity(xpTotal)
  const fmt = (valor: number) => formatarXpGuiaGravity(valor)

  return (
    <PopoverInfoDashboardGuiaGravity
      titulo={t('university.dashboard.nivel_info.titulo')}
      ariaLabel={t('university.dashboard.nivel_info.trigger_aria')}
      alinhamentoHorizontal="fim"
      posicaoPreferida="abaixo"
    >
      <div className="uni-dashboard-info-panel">
        <EscalaNiveisVisual nivelAtual={nivel} />
        <div className="uni-info-visual-grade">
          <LegendaIconeCompacta
            icone={ICONES_INFO_NIVEL.barra}
            rotulo={t('university.dashboard.nivel_info.compact_barra_rotulo')}
            valor={t('university.dashboard.nivel_info.compact_barra_valor', {
              atual: fmt(xpTotal),
              meta: fmt(xpMetaNivel),
              faltam: fmt(xpParaSubir),
            })}
          />
          <LegendaIconeCompacta
            icone={ICONES_INFO_NIVEL.xp}
            rotulo={t('university.dashboard.nivel_info.compact_pontos_rotulo')}
            valor={t('university.dashboard.nivel_info.compact_pontos_valor', {
              fator: PESO_GUAI_XP_MULTIPLICADOR,
            })}
          />
          <LegendaIconeCompacta
            icone={ICONES_INFO_NIVEL.ofensiva}
            rotulo={t('university.dashboard.nivel_info.compact_ofensiva_rotulo')}
            valor={t('university.dashboard.nivel_info.compact_ofensiva_valor')}
          />
          <LegendaIconeCompacta
            icone={ICONES_INFO_NIVEL.ritmo}
            rotulo={t('university.dashboard.nivel_info.compact_ritmo_rotulo')}
            valor={t('university.dashboard.nivel_info.compact_ritmo_valor', {
              minutos: MINUTOS_RITMO_IDEAL_DIA,
            })}
          />
        </div>
      </div>
    </PopoverInfoDashboardGuiaGravity>
  )
}

export { XP_POR_NIVEL_GUIA_GRAVITY }
