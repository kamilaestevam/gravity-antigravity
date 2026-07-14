import React, { createContext, useCallback, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { resolverHrefManualParaAcademy, type RetornoGuiaAcademy } from './academy-link-guia'

const LINK_STYLE: React.CSSProperties = {
  color: '#818cf8',
  textDecoration: 'underline',
  textUnderlineOffset: 2,
  fontWeight: 600,
}

function scrollGuiaAtual(): number {
  const contentEl = document.querySelector<HTMLElement>('.uni-player-aula__content')
  return contentEl?.scrollTop ?? window.scrollY
}

export function restaurarScrollGuia(scrollY: number) {
  const contentEl = document.querySelector<HTMLElement>('.uni-player-aula__content')
  if (contentEl) {
    contentEl.scrollTo({ top: scrollY, behavior: 'smooth' })
    return
  }
  window.scrollTo({ top: scrollY, behavior: 'smooth' })
}

interface GuiaAcademyNavigationValue {
  produtoSlug: string
  navegarLinkInterno: (href: string) => void
}

export const GuiaAcademyNavigationContext = createContext<GuiaAcademyNavigationValue | null>(null)

export function useGuiaAcademyNavigation(): GuiaAcademyNavigationValue | null {
  return useContext(GuiaAcademyNavigationContext)
}

export function GuiaAcademyNavigationProvider({
  produtoSlug,
  children,
}: {
  produtoSlug: string
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const navegarLinkInterno = useCallback((href: string) => {
    const destino = resolverHrefManualParaAcademy(href, produtoSlug) ?? href
    const retorno: RetornoGuiaAcademy = {
      pathname: location.pathname,
      hash: location.hash,
      scrollY: scrollGuiaAtual(),
    }
    navigate(destino, { state: { retornoGuia: retorno } })
  }, [location.hash, location.pathname, navigate, produtoSlug])

  return (
    <GuiaAcademyNavigationContext.Provider value={{ produtoSlug, navegarLinkInterno }}>
      {children}
    </GuiaAcademyNavigationContext.Provider>
  )
}

export function AcademyLinkGuia({ href, rotulo }: { href: string; rotulo: string }) {
  const guia = useGuiaAcademyNavigation()
  const navigate = useNavigate()
  const location = useLocation()

  const destinoAcademy = resolverHrefManualParaAcademy(href, guia?.produtoSlug ?? 'configurador')

  if (guia && destinoAcademy) {
    return (
      <button
        type="button"
        onClick={() => guia.navegarLinkInterno(href)}
        style={{
          ...LINK_STYLE,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          font: 'inherit',
        }}
      >
        {rotulo}
      </button>
    )
  }

  if (destinoAcademy) {
    return (
      <button
        type="button"
        onClick={() => {
          const retorno: RetornoGuiaAcademy = {
            pathname: location.pathname,
            hash: location.hash,
            scrollY: scrollGuiaAtual(),
          }
          navigate(destinoAcademy, { state: { retornoGuia: retorno } })
        }}
        style={{
          ...LINK_STYLE,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          font: 'inherit',
        }}
      >
        {rotulo}
      </button>
    )
  }

  if (href.startsWith('http://') || href.startsWith('https://')) {
    return (
      <a href={href} target="_blank" rel="noreferrer" style={LINK_STYLE}>
        {rotulo}
      </a>
    )
  }

  return (
    <a href={href} style={LINK_STYLE}>
      {rotulo}
    </a>
  )
}

export function lerRetornoGuiaAcademy(state: unknown): RetornoGuiaAcademy | null {
  if (!state || typeof state !== 'object') return null
  const retorno = (state as { retornoGuia?: RetornoGuiaAcademy }).retornoGuia
  if (!retorno?.pathname) return null
  return {
    pathname: retorno.pathname,
    hash: retorno.hash ?? '',
    scrollY: typeof retorno.scrollY === 'number' ? retorno.scrollY : 0,
  }
}
