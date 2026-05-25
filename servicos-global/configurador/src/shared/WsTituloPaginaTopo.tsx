import React from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  useTituloPaginaTopoOverride,
  mesclarTituloPaginaTopo,
} from '@nucleo/menu-topo-global'
import { resolverPageMetaTopo } from './page-meta-topo'

export interface WsTituloPaginaTopoProps {
  accentColor: string
  area: 'admin' | 'configurador'
}

/** Título + ícone + subtítulo no topo da área principal (padrão MenuTopoGlobal). */
export function WsTituloPaginaTopo({ accentColor, area }: WsTituloPaginaTopoProps) {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const override = useTituloPaginaTopoOverride()
  const base = resolverPageMetaTopo(pathname, t, area)
  const meta = mesclarTituloPaginaTopo(base, override)

  return (
    <div
      className="ws-titulo-pagina"
      style={{ '--mtg-accent': accentColor } as React.CSSProperties}
    >
      <div className="mtg-left__page-header">
        {meta.icone && (
          <span className="mtg-left__page-icon" aria-hidden="true">
            {meta.icone}
          </span>
        )}
        <div className="mtg-left__page-titles">
          <span className="mtg-left__page-title">{meta.label}</span>
          {meta.subtitulo && (
            <span className="mtg-left__page-subtitle">{meta.subtitulo}</span>
          )}
        </div>
      </div>
    </div>
  )
}
