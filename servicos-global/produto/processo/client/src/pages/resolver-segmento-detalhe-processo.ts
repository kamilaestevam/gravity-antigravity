export const DETALHE_LISTA_PATH_RE =
  /^\/(?:processo|acesso-processos)\/lista\/([^/]+)\/?(.*)$/

export const DETALHE_LEGADO_PATH_RE =
  /^\/(?:processo|acesso-processos)\/detalhe\/?(.*)$/

export type ModoDetalheProcesso = 'lista' | 'legado'

export interface SegmentoDetalheProcesso {
  slug: string
  segmento: string
  modo: ModoDetalheProcesso
}

function normalizarSegmento(resto: string): string {
  const limpo = resto.replace(/^\/+|\/+$/g, '')
  return limpo || 'workflow'
}

/** Resolve subpágina do detalhe pelo pathname (fonte primária — splat do configurador quebra Outlet/Routes). */
export function resolverSegmentoDetalhe(pathname: string): SegmentoDetalheProcesso | null {
  const lista = pathname.match(DETALHE_LISTA_PATH_RE)
  if (lista) {
    return {
      slug: lista[1],
      segmento: normalizarSegmento(lista[2] ?? ''),
      modo: 'lista',
    }
  }

  const legado = pathname.match(DETALHE_LEGADO_PATH_RE)
  if (legado) {
    return {
      slug: '',
      segmento: normalizarSegmento(legado[1] ?? ''),
      modo: 'legado',
    }
  }

  return null
}

export function baseDetalheLegado(pathname: string): string {
  return pathname.includes('/acesso-processos/')
    ? '/acesso-processos/detalhe'
    : '/processo/detalhe'
}

export function baseListaProcesso(pathname: string, slugProcesso: string): string {
  return pathname.includes('/acesso-processos/')
    ? `/acesso-processos/lista/${slugProcesso}`
    : `/processo/lista/${slugProcesso}`
}
