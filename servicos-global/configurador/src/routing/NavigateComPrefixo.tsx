/**
 * `NavigateComPrefixo` — redirect 301 client-side preservando sufixo do path,
 * query string e hash. Usado para depreciar URLs legadas (`/workspace/*`,
 * `/produto/{X}/*`) por 90 dias mantendo bookmarks funcionais.
 *
 * Lei: `documentos-tecnicos/arquitetura/rotas-convencao.md` §"Redirects de transição"
 * Skill: `skills/governanca/convencao-tecnica/rotas/SKILL.md`
 *
 * Segurança (anti open-redirect): `de` e `para` devem ser strings literais no
 * código — NUNCA derivar de input do usuário. O helper valida que ambos
 * começam com `/` para defesa em profundidade.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { REDIRECTS_LEGACY } from '../rotas'

interface Props {
  /** Prefixo legado (ex: `/workspace` ou `/produto/pedido`). */
  de: string
  /** Prefixo canônico (ex: `/configurador` ou `/pedido`). */
  para: string
}

/**
 * Whitelist: só prefixos registrados em `REDIRECTS_LEGACY` são aceitos.
 * Qualquer outro par lança erro em runtime + bloqueia o redirect.
 */
function ehParLegitimo(de: string, para: string): boolean {
  return REDIRECTS_LEGACY.some(r => r.de === de && r.para === para)
}

export function NavigateComPrefixo({ de, para }: Props) {
  const location = useLocation()

  // Defense-in-depth: par precisa estar na whitelist
  if (!ehParLegitimo(de, para)) {
    // eslint-disable-next-line no-console
    console.error('[NavigateComPrefixo] Par não está na whitelist REDIRECTS_LEGACY:', { de, para })
    return <Navigate to="/hub" replace />
  }

  // Garantia formal: ambos começam com `/`
  if (!de.startsWith('/') || !para.startsWith('/')) {
    // eslint-disable-next-line no-console
    console.error('[NavigateComPrefixo] `de` e `para` devem começar com /:', { de, para })
    return <Navigate to="/hub" replace />
  }

  // Calcula sufixo: trim do prefixo legado mantendo query e hash
  const pathname = location.pathname
  let sufixo = ''
  if (pathname === de || pathname === de + '/') {
    sufixo = ''
  } else if (pathname.startsWith(de + '/')) {
    sufixo = pathname.slice(de.length) // mantém o `/` inicial do sufixo
  } else {
    // Caso anômalo: path não bate com `de` — vai pro destino raiz
    sufixo = ''
  }

  const destino = `${para}${sufixo}${location.search}${location.hash}`
  return <Navigate to={destino} replace />
}
