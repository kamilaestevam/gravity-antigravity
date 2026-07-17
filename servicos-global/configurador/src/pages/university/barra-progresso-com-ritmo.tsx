/**
 * Barra de ritmo — linha do tempo dia 0 → dia N (plano = soma dos produtos contratados).
 * Roxa = progresso concluído; pin = sua posição na linha do tempo (meta do dia quando ativa).
 */

import React from 'react'
import { MapPin } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  aplicarDemoRitmoGuiaGravity,
  calcularLegendaStatusRitmo,
  calcularPosicoesTimelineRitmo,
  calcularResumoPinTimelineRitmo,
  fmtDiaTimelineRitmo,
  ritmoAguardandoModulosAnteriores,
  type MetricasRitmoJornada,
} from './ritmo-jornada-guia-gravity'
import { PinTooltipRitmoGuiaGravity } from './pin-tooltip-ritmo-guia-gravity'

interface BarraProgressoComRitmoProps {
  pctReal: number
  ritmo: MetricasRitmoJornada | null
  altura?: number
  cor?: string
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
  const [searchParams] = useSearchParams()
  const demoModo = searchParams.get('demoRitmo')
  const demoRitmo = demoModo === 'atrasado' || demoModo === 'adiantado' ? demoModo : null
  const ritmoVisivel = ritmo
    ? aplicarDemoRitmoGuiaGravity(ritmo, demoRitmo)
    : null

  const aguardandoModulo = ritmoVisivel
    ? ritmoAguardandoModulosAnteriores(ritmoVisivel, demoRitmo)
    : false

  const timeline = ritmoVisivel ? calcularPosicoesTimelineRitmo(ritmoVisivel) : null
  const resumoPin = timeline && ritmoVisivel
    ? calcularResumoPinTimelineRitmo(ritmoVisivel, timeline)
    : null

  const pct = timeline
    ? timeline.pctProgresso
    : Math.min(100, Math.max(0, pctReal))
  const pctMeta = timeline?.pctMeta ?? null
  const posicaoMarcadorPct = !aguardandoModulo && pctMeta !== null
    ? pctMeta
    : pct

  const pinTooltip = timeline && resumoPin && ritmoVisivel ? (
    <TooltipGlobal
      titulo={t('university.dashboard.ritmo.timeline_pin_titulo')}
      descricao={(
        <PinTooltipRitmoGuiaGravity resumoPin={resumoPin} />
      )}
      interativo
      silenciarIconeAuxiliar
      posicaoPreferida="abaixo"
      alinhamentoHorizontal="centro"
    >
      <button
        type="button"
        className="uni-barra-ritmo__pin"
        aria-label={t('university.dashboard.ritmo.timeline_pin_aria', {
          total: fmtDiaTimelineRitmo(resumoPin.prazoEstimadoDias),
          jornada: fmtDiaTimelineRitmo(resumoPin.diasJornada),
          faltam: fmtDiaTimelineRitmo(resumoPin.faltamDias),
        })}
      >
        <MapPin weight="fill" size={18} aria-hidden />
      </button>
    </TooltipGlobal>
  ) : null

  const legendaRitmo = ritmoVisivel && !ocultarLegenda
    ? calcularLegendaStatusRitmo(ritmoVisivel, aguardandoModulo, t)
    : null

  const legendaTimeline = timeline && !aguardandoModulo
    ? t('university.dashboard.ritmo.timeline_resumo', {
      diaVoce: fmtDiaTimelineRitmo(timeline.diaProgresso),
      diaMeta: fmtDiaTimelineRitmo(timeline.diaMetaHoje),
      total: timeline.diaPlanoTotal,
    })
    : timeline && aguardandoModulo
      ? t('university.dashboard.ritmo.timeline_aguardando', {
        diaVoce: fmtDiaTimelineRitmo(timeline.diaProgresso),
        total: timeline.diaPlanoTotal,
      })
      : null

  return (
    <div className="uni-barra-ritmo">
      <div className="uni-barra-ritmo__track-wrap">
        <div
          className="uni-barra-ritmo__track"
          style={{ height: altura }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={legendaRitmo?.texto ?? legendaTimeline ?? t('university.dashboard.ritmo.progresso')}
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
          {timeline && pinTooltip && (
            <span
              className="uni-barra-ritmo__pin-wrap"
              style={{ left: `${Math.min(100, Math.max(0, posicaoMarcadorPct))}%` }}
            >
              {pinTooltip}
            </span>
          )}
        </div>
      </div>
      {legendaRitmo && (
        <div className={`uni-barra-ritmo__legenda ${legendaRitmo.classe}`}>
          <span className="uni-barra-ritmo__legenda-delta">{legendaRitmo.texto}</span>
        </div>
      )}
    </div>
  )
}
