export const DETALHE_LISTA_PATH_RE =
  /^\/(?:processo|acesso-processos)\/lista\/([^/]+)\/?(.*)$/

export const DETALHE_LEGADO_PATH_RE =
  /^\/(?:processo|acesso-processos)\/detalhe\/?(.*)$/

export const DETALHE_ID_WORKSPACE_PATH_RE =
  /^\/(?:processo|acesso-processos)\/(p\d+)\/?(.*)$/

const WORKSPACE_RAIZ = new Set(['lista', 'insights', 'dashboard', 'kanban', 'todos'])

const SEGMENTOS_DETALHE_PLANO = new Set([
  'workflow',
  'documentos',
  'dados-tecnicos',
  'email',
  'workspace',
  'duimp',
  'li',
  'taxas',
  'todo',
  'pedidos',
  'financeiro',
  'configuracoes',
])

export type ModoDetalheProcesso = 'lista' | 'legado' | 'id-workspace' | 'plano-legado'

export interface SegmentoDetalheProcesso {
  slug: string
  segmento: string
  modo: ModoDetalheProcesso
}

function normalizarSegmento(resto: string): string {
  const limpo = resto.replace(/^\/+|\/+$/g, '')
  return limpo || 'workflow'
}

/** Resolve subpágina do detalhe pelo pathname (splat do configurador quebra Outlet/Routes). */
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

  const idWorkspace = pathname.match(DETALHE_ID_WORKSPACE_PATH_RE)
  if (idWorkspace) {
    return {
      slug: idWorkspace[1],
      segmento: normalizarSegmento(idWorkspace[2] ?? ''),
      modo: 'id-workspace',
    }
  }

  const plano = pathname.match(/^\/(?:processo|acesso-processos)\/([^/]+(?:\/[^/]+)*)\/?$/)
  if (plano) {
    const resto = plano[1]
    const primeiro = resto.split('/')[0]
    if (!WORKSPACE_RAIZ.has(primeiro) && SEGMENTOS_DETALHE_PLANO.has(primeiro)) {
      return {
        slug: '',
        segmento: normalizarSegmento(resto),
        modo: 'plano-legado',
      }
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

export function rotaListaWorkspace(pathname: string): string {
  return pathname.includes('/acesso-processos/')
    ? '/acesso-processos/lista'
    : '/processo/lista'
}
