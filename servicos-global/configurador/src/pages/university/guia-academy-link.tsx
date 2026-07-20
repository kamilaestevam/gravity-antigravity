import React, { useCallback, useContext } from 'react'
import { useLocation, useNavigate, type NavigateFunction } from 'react-router-dom'
import {
  produtoSlugDePathnameAcademy,
  resolverHrefManualParaAcademy,
  type RetornoGuiaAcademy,
} from './academy-link-guia'
import {
  GuiaAcademyNavigationContext,
  type GuiaAcademyNavigationValue,
} from './guia-academy-navigation-context'

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

/** Tira foco do botão Concluída/Próxima — o browser senão faz scrollIntoView no rodapé da aula seguinte. */
export function soltarFocoGuia() {
  const ativo = document.activeElement
  if (ativo instanceof HTMLElement && ativo !== document.body) {
    ativo.blur()
  }
}

/** Topo do reader Academy (`.uni-player-aula__content`) — troca de aula / marcar concluída. */
export function scrollGuiaTopo(behavior: ScrollBehavior = 'auto') {
  soltarFocoGuia()
  const contentEl = document.querySelector<HTMLElement>('.uni-player-aula__content')
  if (contentEl) {
    // scrollTop direto evita scroll anchoring / smooth residual deixarem offset > 0
    contentEl.scrollTop = 0
    if (typeof contentEl.scrollTo === 'function') {
      contentEl.scrollTo({ top: 0, behavior: 'auto' })
    }
  }
  // Zera ancestrais scrolláveis (shell / main) que às vezes herdam o offset
  let ancestral: HTMLElement | null = contentEl?.parentElement ?? null
  while (ancestral) {
    if (ancestral.scrollTop > 0) ancestral.scrollTop = 0
    ancestral = ancestral.parentElement
  }
  if (typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  void behavior
}

const CHAVE_FORCAR_TOPO_GUIA = 'gravity-university-forcar-topo-aula'

/** Marca a próxima montagem de aula para abrir no topo (sobrevive a troca de rota). */
export function marcarProximaAulaNoTopoGuia() {
  try {
    sessionStorage.setItem(CHAVE_FORCAR_TOPO_GUIA, '1')
  } catch {
    /* private mode */
  }
}

export function consumirProximaAulaNoTopoGuia(): boolean {
  try {
    if (sessionStorage.getItem(CHAVE_FORCAR_TOPO_GUIA) !== '1') return false
    sessionStorage.removeItem(CHAVE_FORCAR_TOPO_GUIA)
    return true
  } catch {
    return false
  }
}

/**
 * Mantém o content no topo por alguns ms — cobre foco residual, imagens e layout tardio
 * que empurravam a aula seguinte para o meio da página.
 */
export function travarScrollGuiaTopo(duracaoMs = 2000): () => void {
  soltarFocoGuia()
  scrollGuiaTopo('auto')

  const forcarTopo = () => {
    scrollGuiaTopo('auto')
    const contentEl = document.querySelector<HTMLElement>('.uni-player-aula__content')
    if (contentEl && contentEl.scrollTop !== 0) contentEl.scrollTop = 0
  }
  forcarTopo()

  const contentEl = document.querySelector<HTMLElement>('.uni-player-aula__content')
  const onScroll = () => forcarTopo()
  contentEl?.addEventListener('scroll', onScroll, { passive: true })

  // Imagens da aula seguinte carregam depois e o browser “reancora” o scroll
  const onImg = () => forcarTopo()
  contentEl?.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', onImg, { once: true })
  })
  const mo = contentEl
    ? new MutationObserver(() => {
        contentEl.querySelectorAll('img').forEach((img) => {
          if (!img.complete) img.addEventListener('load', onImg, { once: true })
        })
        forcarTopo()
      })
    : null
  if (contentEl && mo) {
    mo.observe(contentEl, { childList: true, subtree: true })
  }

  const ticks = [0, 16, 32, 80, 160, 280, 500, 900, 1400, duracaoMs]
  const timers = ticks.map((ms) =>
    window.setTimeout(() => {
      soltarFocoGuia()
      forcarTopo()
    }, ms),
  )
  const fim = window.setTimeout(() => {
    contentEl?.removeEventListener('scroll', onScroll)
    mo?.disconnect()
  }, duracaoMs + 40)

  return () => {
    for (const id of timers) window.clearTimeout(id)
    window.clearTimeout(fim)
    contentEl?.removeEventListener('scroll', onScroll)
    mo?.disconnect()
  }
}

/** Posição Y do alvo dentro do content scrollável (não usa offsetTop — quebra com wrappers). */
export function offsetScrollGuiaContent(el: HTMLElement, contentEl: HTMLElement, margem = 8): number {
  const top =
    el.getBoundingClientRect().top
    - contentEl.getBoundingClientRect().top
    + contentEl.scrollTop
    - margem
  return Math.max(0, top)
}

/** Scroll só no painel de tópicos — não usa scrollIntoView (ele move ancestrais e “rouba” o topo do content). */
export function scrollSumarioGuiaNaVista(idSecao: string) {
  const btn = document.querySelector<HTMLElement>(`[data-sumario-id="${CSS.escape(idSecao)}"]`)
  const nav = btn?.closest<HTMLElement>('.uni-player-aula__nav')
  if (!btn || !nav) return
  const btnTop = btn.offsetTop
  const btnBottom = btnTop + btn.offsetHeight
  const viewTop = nav.scrollTop
  const viewBottom = viewTop + nav.clientHeight
  if (btnTop >= viewTop && btnBottom <= viewBottom) return
  const alvo = Math.max(0, btnTop - nav.clientHeight / 2 + btn.offsetHeight / 2)
  nav.scrollTo({ top: alvo, behavior: 'smooth' })
}

export function restaurarScrollGuia(scrollY: number) {
  const contentEl = document.querySelector<HTMLElement>('.uni-player-aula__content')
  if (contentEl) {
    contentEl.scrollTo({ top: scrollY, behavior: 'smooth' })
    return
  }
  window.scrollTo({ top: scrollY, behavior: 'smooth' })
}

export function montarRetornoGuiaAcademy(pathname: string, hash: string): RetornoGuiaAcademy {
  return {
    pathname,
    hash,
    scrollY: scrollGuiaAtual(),
  }
}

export function navegarComRetornoGuia(
  navigate: NavigateFunction,
  location: { pathname: string; hash: string },
  href: string,
) {
  const destino = resolverHrefManualParaAcademy(href) ?? href
  const retorno = montarRetornoGuiaAcademy(location.pathname, location.hash)
  navigate(destino, { state: { retornoGuia: retorno } })
}

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
    navegarComRetornoGuia(navigate, location, href)
  }, [location, navigate])

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

  const destinoAcademy = resolverHrefManualParaAcademy(href)

  if (destinoAcademy) {
    return (
      <button
        type="button"
        onClick={() => {
          if (guia) {
            guia.navegarLinkInterno(href)
            return
          }
          navegarComRetornoGuia(navigate, location, href)
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

/** Estado limpo ao abrir aula pela camada do módulo (lista de tarefas / XP). */
export const STATE_NAVEGACAO_CAMADA_GUIA = {} as const

export function rotaModuloGuiaAcademy(produtoSlug: string): string {
  return `/university-gravity/academy/${produtoSlug}`
}

/**
 * Voltar no Guia — duas variações:
 * 1. Link interno: retorna à aula de origem (pathname + hash + scroll).
 * 2. Camada normal: retorna à lista de tarefas do módulo (`/academy/{produto}`).
 */
export function voltarNoGuiaAcademy(
  navigate: NavigateFunction,
  produtoSlug: string,
  retornoGuia: RetornoGuiaAcademy | null,
) {
  if (retornoGuia) {
    navigate(`${retornoGuia.pathname}${retornoGuia.hash}`, {
      state: { restaurarScrollGuia: retornoGuia.scrollY },
    })
    return
  }
  navigate(rotaModuloGuiaAcademy(produtoSlug))
}

export { produtoSlugDePathnameAcademy }
export { GuiaAcademyNavigationContext } from './guia-academy-navigation-context'
