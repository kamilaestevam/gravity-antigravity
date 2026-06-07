/**
 * Detecta rotas do detalhe de um processo (ProcessoLayout + p2-sidebar).
 * Espelha resolver-segmento-detalhe-processo.ts — manter em sincronia nos testes.
 */
const DETALHE_LISTA_PATH_RE =
  /^\/(?:processo|acesso-processos)\/lista\/([^/]+)\/?(.*)$/

const DETALHE_LEGADO_PATH_RE =
  /^\/(?:processo|acesso-processos)\/detalhe\/?(.*)$/

const DETALHE_ID_WORKSPACE_PATH_RE =
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

/** True quando a URL é detalhe de processo (não lista/kanban workspace). */
export function isRotaDetalheProcesso(pathname: string): boolean {
  if (DETALHE_LEGADO_PATH_RE.test(pathname)) return true
  if (DETALHE_LISTA_PATH_RE.test(pathname)) return true
  if (DETALHE_ID_WORKSPACE_PATH_RE.test(pathname)) return true

  const plano = pathname.match(/^\/(?:processo|acesso-processos)\/([^/]+(?:\/[^/]+)*)\/?$/)
  if (!plano) return false

  const resto = plano[1]
  const primeiro = resto.split('/')[0]
  if (WORKSPACE_RAIZ.has(primeiro)) return false

  return SEGMENTOS_DETALHE_PLANO.has(primeiro)
}
