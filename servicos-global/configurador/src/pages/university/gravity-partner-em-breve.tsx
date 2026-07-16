/**
 * Gravity Partner — teaser «Em breve» (University › /builders).
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Handshake,
  PlugsConnected,
  RocketLaunch,
  type Icon,
} from '@phosphor-icons/react'

type PerfilParceiro = {
  id: 'comercial' | 'integrador' | 'onboarding'
  icone: Icon
  cor: string
  borda: string
  fundo: string
  gradiente: string
}

const PERFIS: PerfilParceiro[] = [
  {
    id: 'comercial',
    icone: Handshake,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.42)',
    fundo: 'rgba(167,139,250,.12)',
    gradiente: 'linear-gradient(145deg, rgba(167,139,250,.18) 0%, rgba(8,12,24,.4) 72%)',
  },
  {
    id: 'integrador',
    icone: PlugsConnected,
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.42)',
    fundo: 'rgba(56,189,248,.12)',
    gradiente: 'linear-gradient(145deg, rgba(56,189,248,.18) 0%, rgba(8,12,24,.4) 72%)',
  },
  {
    id: 'onboarding',
    icone: RocketLaunch,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.42)',
    fundo: 'rgba(52,211,153,.12)',
    gradiente: 'linear-gradient(145deg, rgba(52,211,153,.18) 0%, rgba(8,12,24,.4) 72%)',
  },
]

export function GravityPartnerEmBreve() {
  const { t } = useTranslation()

  return (
    <section className="uni-gravity-partner" aria-labelledby="uni-gravity-partner-titulo">
      <div className="uni-gravity-partner__hero">
        <div className="uni-gravity-partner__hero-orbe uni-gravity-partner__hero-orbe--1" aria-hidden />
        <div className="uni-gravity-partner__hero-orbe uni-gravity-partner__hero-orbe--2" aria-hidden />

        <span className="ws-badge ws-badge-warning uni-gravity-partner__badge">
          {t('university.badge.em_breve')}
        </span>

        <h1 id="uni-gravity-partner-titulo" className="uni-gravity-partner__titulo">
          {t('university.builders.titulo_hero')}
        </h1>
        <p className="uni-gravity-partner__subtitulo">{t('university.builders.subtitulo_hero')}</p>
        <p className="uni-gravity-partner__intro">{t('university.builders.intro')}</p>
      </div>

      <div className="uni-gravity-partner__grade">
        {PERFIS.map(perfil => {
          const Icone = perfil.icone
          return (
            <article
              key={perfil.id}
              className="uni-gravity-partner__card"
              style={{
                ['--gp-cor' as string]: perfil.cor,
                ['--gp-borda' as string]: perfil.borda,
                ['--gp-fundo' as string]: perfil.fundo,
                ['--gp-gradiente' as string]: perfil.gradiente,
              }}
            >
              <div className="uni-gravity-partner__card-icone" aria-hidden>
                <Icone size={26} weight="duotone" />
              </div>
              <h2 className="uni-gravity-partner__card-titulo">
                {t(`university.builders.perfil_${perfil.id}_titulo`)}
              </h2>
              <p className="uni-gravity-partner__card-descricao">
                {t(`university.builders.perfil_${perfil.id}_descricao`)}
              </p>
              <span className="ws-badge ws-badge-warning uni-gravity-partner__card-tag">
                {t('university.badge.em_breve')}
              </span>
            </article>
          )
        })}
      </div>

      <footer className="uni-gravity-partner__rodape">
        <p className="uni-gravity-partner__rodape-texto">{t('university.builders.rodape')}</p>
      </footer>
    </section>
  )
}
