/**
 * Visuais compactos — painéis informativos do dashboard Minha jornada.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  CalendarBlank,
  ChartBar,
  Fire,
  Hourglass,
  Lightning,
  MapPin,
  Pulse,
  Target,
} from '@phosphor-icons/react'
import {
  CHAVES_TITULO_NIVEL_GUIA_GRAVITY,
  QTD_NOMES_NIVEL_GUIA_GRAVITY,
  xpMinimoNivelGuiaGravity,
} from './niveis-guia-gravity'

interface EscalaNiveisVisualProps {
  nivelAtual: number
}

export function EscalaNiveisVisual({ nivelAtual }: EscalaNiveisVisualProps) {
  const { t, i18n } = useTranslation()
  const fmt = (v: number) => v.toLocaleString(i18n.language)

  return (
    <div className="uni-info-visual-escala" aria-label={t('university.dashboard.nivel_info.escala_titulo')}>
      <div className="uni-info-visual-escala__trilho">
        {Array.from({ length: QTD_NOMES_NIVEL_GUIA_GRAVITY }, (_, i) => {
          const num = i + 1
          const atual = num === nivelAtual
            || (nivelAtual > QTD_NOMES_NIVEL_GUIA_GRAVITY && num === QTD_NOMES_NIVEL_GUIA_GRAVITY)
          const concluido = num < nivelAtual
          return (
            <React.Fragment key={CHAVES_TITULO_NIVEL_GUIA_GRAVITY[i]}>
              {i > 0 && (
                <span
                  className={`uni-info-visual-escala__linha${concluido || atual ? ' is-preenchida' : ''}`}
                  aria-hidden
                />
              )}
              <div
                className={[
                  'uni-info-visual-escala__no',
                  concluido ? 'is-concluido' : '',
                  atual ? 'is-atual' : '',
                ].filter(Boolean).join(' ')}
                title={t(CHAVES_TITULO_NIVEL_GUIA_GRAVITY[i])}
              >
                <span className="uni-info-visual-escala__num">{num}</span>
                <span className="uni-info-visual-escala__nome">
                  {t(CHAVES_TITULO_NIVEL_GUIA_GRAVITY[i]).slice(0, 3)}
                </span>
                <span className="uni-info-visual-escala__xp">
                  {fmt(xpMinimoNivelGuiaGravity(num))}
                </span>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

interface LegendaIconeProps {
  icone: React.ReactNode
  rotulo: string
  valor: string
  valorClassName?: string
  tomIcone?: 'indigo' | 'ambar' | 'ciano' | 'roxo'
}

export function LegendaIconeCompacta({ icone, rotulo, valor, valorClassName, tomIcone }: LegendaIconeProps) {
  return (
    <div className="uni-info-visual-legenda">
      <div
        className={[
          'uni-info-visual-legenda__icone',
          tomIcone ? `uni-info-visual-legenda__icone--${tomIcone}` : '',
        ].filter(Boolean).join(' ')}
        aria-hidden
      >
        {icone}
      </div>
      <div className="uni-info-visual-legenda__texto">
        <span className="uni-info-visual-legenda__rotulo">{rotulo}</span>
        <span className={`uni-info-visual-legenda__valor${valorClassName ? ` ${valorClassName}` : ''}`}>{valor}</span>
      </div>
    </div>
  )
}

export function DiagramaRitmoVisual({
  pctIdeal = 62,
  pctReal = 41,
  exibirPercentuais = false,
  metaAguardando = false,
}: {
  pctIdeal?: number
  pctReal?: number
  exibirPercentuais?: boolean
  metaAguardando?: boolean
}) {
  const { t } = useTranslation()
  const ideal = Math.min(100, Math.max(0, pctIdeal))
  const real = Math.min(100, Math.max(0, pctReal))
  return (
    <div className="uni-info-visual-ritmo-diagrama" aria-hidden={!exibirPercentuais}>
      <div className="uni-info-visual-ritmo-diagrama__track">
        <span className="uni-info-visual-ritmo-diagrama__fill" style={{ width: `${real}%` }} />
        <span className="uni-info-visual-ritmo-diagrama__marcador" style={{ left: `${ideal}%` }} />
      </div>
      {exibirPercentuais ? (
        <p className="uni-info-visual-ritmo-diagrama__pct-resumo">
          {metaAguardando ? (
            <>
              {t('university.dashboard.ritmo.timeline_pin_pct_resumo_aguardando')}
              {' '}
              <span className="is-roxo">{real}%</span>
            </>
          ) : (
            <>
              {t('university.dashboard.ritmo.timeline_pin_pct_deveria')}
              {' '}
              <span className="is-amarelo">{ideal}%</span>
              {' '}
              {t('university.dashboard.ritmo.timeline_pin_pct_e_fez')}
              {' '}
              <span className="is-roxo">{real}%</span>
            </>
          )}
        </p>
      ) : (
        <div className="uni-info-visual-ritmo-diagrama__legendas">
          <span><i className="uni-info-visual-ritmo-diagrama__swatch is-roxo" />{t('university.dashboard.ritmo.info.compact_real_rotulo')}</span>
          <span><i className="uni-info-visual-ritmo-diagrama__swatch is-amarelo" />{t('university.dashboard.ritmo.info.compact_ideal_rotulo')}</span>
        </div>
      )}
    </div>
  )
}

export const ICONES_INFO_NIVEL = {
  xp: <Lightning size={14} weight="fill" />,
  barra: <ChartBar size={14} weight="fill" />,
  ofensiva: <Fire size={14} weight="fill" />,
  ritmo: <CalendarBlank size={14} weight="fill" />,
} as const

export const ICONES_INFO_RITMO = {
  plano: <CalendarBlank size={14} weight="fill" />,
  real: <ChartBar size={14} weight="fill" />,
  ideal: <Lightning size={14} weight="fill" />,
  delta: <ChartBar size={14} weight="bold" />,
  voce: <MapPin size={14} weight="fill" />,
  meta: <Target size={14} weight="fill" />,
  status: <Pulse size={14} weight="fill" />,
  faltam: <Hourglass size={14} weight="fill" />,
} as const
