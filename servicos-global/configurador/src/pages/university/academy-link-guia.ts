/**
 * Links internos do Guia Academy — resolve rotas do Manual (/docs) para aulas (/academy).
 */

import {
  type ConfiguradorManualSlug,
  resolverConfiguradorManualSlug,
  secaoConfiguradorPorSlug,
} from './manual-configurador-conteudo'

export interface RetornoGuiaAcademy {
  pathname: string
  hash: string
  scrollY: number
}

const AULA_SLUG_POR_MANUAL: Partial<Record<ConfiguradorManualSlug, string>> = {
  organizacao: 'criando-a-organizacao',
  workspaces: 'acessar-workspaces',
  usuarios: 'administrando-usuarios',
  fornecedores: 'cadastrando-fornecedores',
  assinaturas: 'gerenciando-assinaturas',
  financeiro: 'financeiro-da-conta',
  'api-cockpit': 'api-cockpit-integracoes',
  'taxas-moeda': 'taxas-e-moeda',
  historico: 'historico-e-auditoria',
}

export function slugifyTituloGuia(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function idAncoraTituloGuia(titulo: string): string {
  return `guia-titulo-${slugifyTituloGuia(titulo) || 'secao'}`
}

function hashPadraoSecao(manualSlug: ConfiguradorManualSlug): string {
  const secao = secaoConfiguradorPorSlug(manualSlug)
  if (!secao) return ''
  const titulo = secao.tituloTopico?.trim() || secao.titulo
  return `#${idAncoraTituloGuia(titulo)}`
}

function hashDeDocSec(manualSlug: ConfiguradorManualSlug, docSecNum: number): string {
  const secao = secaoConfiguradorPorSlug(manualSlug)
  if (!secao || !Number.isFinite(docSecNum) || docSecNum < 1) return hashPadraoSecao(manualSlug)
  if (docSecNum === 1) return hashPadraoSecao(manualSlug)
  const fluxo = secao.fluxos?.[docSecNum - 2]
  if (!fluxo) return hashPadraoSecao(manualSlug)
  return `#${idAncoraTituloGuia(fluxo.tituloSumario ?? fluxo.titulo)}`
}

/**
 * Converte href do Manual (ex.: `/university-gravity/docs/configurador/workspaces`)
 * para rota do Guia Academy com âncora de seção quando aplicável.
 */
export function resolverHrefManualParaAcademy(
  href: string,
  produtoSlug = 'configurador',
): string | null {
  const trimmed = href.trim()
  if (trimmed.startsWith('/university-gravity/academy/')) return trimmed

  const hashIdx = trimmed.indexOf('#')
  const pathPart = (hashIdx >= 0 ? trimmed.slice(0, hashIdx) : trimmed).replace(/\/$/, '')
  const hashPart = hashIdx >= 0 ? trimmed.slice(hashIdx) : ''

  const cfgMatch = /^\/university-gravity\/docs\/configurador\/([^/?#]+)$/.exec(pathPart)
  if (cfgMatch) {
    const manualSlug = resolverConfiguradorManualSlug(cfgMatch[1])
    const aulaSlug = AULA_SLUG_POR_MANUAL[manualSlug]
    if (!aulaSlug) return null

    let hash = hashPadraoSecao(manualSlug)
    const docSecMatch = /^#doc-sec-(\d+)$/.exec(hashPart)
    if (docSecMatch) {
      hash = hashDeDocSec(manualSlug, Number(docSecMatch[1]))
    }

    return `/university-gravity/academy/${produtoSlug}/${aulaSlug}${hash}`
  }

  return null
}
