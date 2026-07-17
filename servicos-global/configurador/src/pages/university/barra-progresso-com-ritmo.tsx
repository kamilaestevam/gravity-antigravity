/**
 * Barra de ritmo — linha do tempo dia 0 → dia N (plano = soma dos produtos contratados).
 * Roxa = progresso concluído; pin = sua posição na linha do tempo (meta do dia quando ativa).
 */

import React from 'react'
import { MapPin } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { MINUTOS_RITMO_IDEAL_DIA } from './duracao-academy-guia-gravity'
import {
  aplicarDemoRitmoGuiaGravity,
  calcularPosicoesTimelineRitmo,
  type MetricasRitmoJornada,
} from './ritmo-jornada-guia-gravity'
import { PopoverInfoDashboardGuiaGravity } from './popover-info-dashboard-guia-gravity'

interface BarraProgressoComRitmoProps {
  pctReal: number
  ritmo: MetricasRitmoJornada | null
  altura?: number
  cor?: string
  ocultarLegenda?: boolean
}

const COR_PADRAO = '#818cf8'

function fmtDia(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1)
}

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
  const ritmoVisivel = ritmo
    ? aplicarDemoRitmoGuiaGravity(
      ritmo,
      demoModo === 'atrasado' || demoModo === 'adiantado' ? demoModo : null,
    )
    : null

  const aguardandoModulo = Boolean(
    ritmoVisivel
    && ritmoVisivel.minutosEsperadosHoje === 0
    && ritmoVisivel.pctIdeal === 0
    && ritmoVisivel.minutosTotais > 0
    && demoModo !== 'atrasado'
    && demoModo !== 'adiantado',
  )

  const timeline = ritmoVisivel ? calcularPosicoesTimelineRitmo(ritmoVisivel) : null
  const pct = timeline
    ? timeline.pctProgresso
    : Math.min(100, Math.max(0, pctReal))
  const pctMeta = timeline?.pctMeta ?? null
  const posicaoMarcadorPct = !aguardandoModulo && pctMeta !== null
    ? pctMeta
    : pct

  const pinTooltip = timeline ? (
    <TooltipGlobal
      titulo={t('university.dashboard.ritmo.timeline_pin_titulo')}
      descricao={(
        <div className="uni-barra-ritmo__pin-tooltip">
          <p>{t('university.dashboard.ritmo.timeline_dia_inicio')}</p>
          <p>{t('university.dashboard.ritmo.timeline_dia_fim', { total: timeline.diaPlanoTotal })}</p>
          <p>{t('university.dashboard.ritmo.timeline_pin_voce', { dia: fmtDia(timeline.diaProgresso) })}</p>
          {!aguardandoModulo && (
            <p>{t('university.dashboard.ritmo.timeline_pin_meta', { dia: fmtDia(timeline.diaMetaHoje) })}</p>
          )}
        </div>
      )}
      interativo
      posicaoPreferida="abaixo"
      alinhamentoHorizontal="centro"
    >
      <button
        type="button"
        className="uni-barra-ritmo__pin"
        aria-label={t('university.dashboard.ritmo.timeline_pin_aria', {
          dia: fmtDia(timeline.diaProgresso),
          total: timeline.diaPlanoTotal,
        })}
      >
        <MapPin weight="fill" size={18} aria-hidden />
      </button>
    </TooltipGlobal>
  ) : null

  const legendaRitmo = (() => {
    if (!ritmoVisivel || ocultarLegenda) return null
    if (aguardandoModulo) {
      return {
        texto: t('university.dashboard.ritmo.delta_aguardando_anteriores'),
        classe: 'is-aguardando',
      }
    }
    if (ritmoVisivel.deltaDias > 0) {
      return {
        texto: t('university.dashboard.ritmo.advanced', { dias: ritmoVisivel.deltaDias }),
        classe: 'is-adiantado',
      }
    }
    if (ritmoVisivel.deltaDias < 0) {
      return {
        texto: t('university.dashboard.ritmo.behind', { dias: Math.abs(ritmoVisivel.deltaDias) }),
        classe: 'is-atrasado',
      }
    }
    return {
      texto: t('university.dashboard.ritmo.on_track'),
      classe: 'is-no-ritmo',
    }
  })()

  const legendaTimeline = timeline && !aguardandoModulo
    ? t('university.dashboard.ritmo.timeline_resumo', {
      diaVoce: fmtDia(timeline.diaProgresso),
      diaMeta: fmtDia(timeline.diaMetaHoje),
      total: timeline.diaPlanoTotal,
    })
    : timeline && aguardandoModulo
      ? t('university.dashboard.ritmo.timeline_aguardando', {
        diaVoce: fmtDia(timeline.diaProgresso),
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
      {legendaRitmo && !ocultarLegenda && (
        <div className={`uni-barra-ritmo__legenda ${legendaRitmo.classe}`}>
          {timeline ? (
            <PopoverInfoDashboardGuiaGravity
              titulo={t('university.dashboard.ritmo.timeline_info_titulo')}
              ariaLabel={t('university.dashboard.ritmo.timeline_info_aria')}
              alinhamentoHorizontal="inicio"
            >
              <dl className="uni-barra-ritmo__info-lista">
                <div>
                  <dt>{t('university.dashboard.ritmo.timeline_info_voce_rotulo')}</dt>
                  <dd>{t('university.dashboard.ritmo.timeline_info_dia', { dia: fmtDia(timeline.diaProgresso) })}</dd>
                </div>
                {!aguardandoModulo && (
                  <div>
                    <dt>{t('university.dashboard.ritmo.timeline_info_meta_rotulo')}</dt>
                    <dd>{t('university.dashboard.ritmo.timeline_info_dia', { dia: fmtDia(timeline.diaMetaHoje) })}</dd>
                  </div>
                )}
                <div>
                  <dt>{t('university.dashboard.ritmo.timeline_info_plano_rotulo')}</dt>
                  <dd>{t('university.dashboard.ritmo.timeline_info_plano_valor', {
                    total: timeline.diaPlanoTotal,
                    minutos: MINUTOS_RITMO_IDEAL_DIA,
                  })}</dd>
                </div>
                <div>
                  <dt>{t('university.dashboard.ritmo.timeline_info_status_rotulo')}</dt>
                  <dd className={`uni-barra-ritmo__info-status ${legendaRitmo.classe}`}>{legendaRitmo.texto}</dd>
                </div>
              </dl>
            </PopoverInfoDashboardGuiaGravity>
          ) : (
            <span className="uni-barra-ritmo__legenda-ideal">{legendaTimeline}</span>
          )}
          <span className="uni-barra-ritmo__legenda-delta">{legendaRitmo.texto}</span>
        </div>
      )}
    </div>
  )
}
