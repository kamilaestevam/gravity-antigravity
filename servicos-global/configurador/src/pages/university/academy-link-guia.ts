/**
 * Links internos do Guia Academy — resolve rotas do Manual (/docs) para aulas (/academy).
 */

import type { DocSecao } from './manual-configurador-conteudo'
import {
  type ConfiguradorManualSlug,
  encontrarPassoPorNum,
  resolverConfiguradorManualSlug,
  secaoConfiguradorPorSlug,
} from './manual-configurador-conteudo'
import { CONFIGURADOR_AULAS_CURADORIA } from './manual-configurador-academy'
import { DOC_HUB_SECAO } from './manual-hub-conteudo'
import { HUB_AULA_SLUGS } from './manual-hub-academy'
import { DOC_STORE_SECAO } from './manual-store-conteudo'
import { STORE_AULA_SLUGS } from './manual-store-academy'
import { DOC_PEDIDO_SECAO } from './manual-pedido-conteudo'
import { PEDIDO_AULA_SLUGS } from './manual-pedido-academy'
import { DOC_SMART_READ_SECAO } from './manual-smart-read-conteudo'
import { SMART_READ_AULA_SLUGS } from './manual-smart-read-academy'
import { DOC_BID_FRETE_SECAO } from './manual-bid-frete-conteudo'
import { BID_FRETE_AULA_SLUGS } from './manual-bid-frete-academy'
import { DOC_NAVEGACAO_SECAO } from './manual-navegacao-conteudo'
import { NAVEGACAO_AULA_SLUGS } from './manual-navegacao-academy'
import { DOC_ADMIN_SECAO } from './manual-admin-conteudo'
import { ADMIN_AULA_SLUGS } from './manual-admin-academy'
import { DOC_API_COCKPIT_SECAO } from './manual-api-cockpit-conteudo'
import { DOC_LOGIN_SECOES } from './manual-login-conteudo'
import { LOGIN_AULA_SLUGS } from './manual-login-academy'
import { DOC_GABI_SECOES } from './manual-gabi-conteudo'
import { GABI_AULA_SLUGS } from './manual-gabi-academy'

export interface RetornoGuiaAcademy {
  pathname: string
  hash: string
  scrollY: number
}

interface CuradoriaAulaDef {
  slug: string
  incluirIntroSecao?: boolean
  fluxoIndices: number[]
}

interface ProdutoManualDef {
  produtoSlug: string
  docsPath: string
  secao: DocSecao
  aulas: CuradoriaAulaDef[]
}

const AULA_SLUG_PADRAO_CONFIGURADOR: Partial<Record<ConfiguradorManualSlug, string>> = {
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

function curadoriaSequencial(slugs: readonly string[]): CuradoriaAulaDef[] {
  return slugs.map((slug, i) => ({
    slug,
    incluirIntroSecao: i === 0,
    fluxoIndices: i === 0 ? [] : [i - 1],
  }))
}

const PRODUTOS_MANUAL: ProdutoManualDef[] = [
  {
    produtoSlug: 'hub',
    docsPath: '/university-gravity/docs/hub',
    secao: DOC_HUB_SECAO,
    aulas: [
      { slug: HUB_AULA_SLUGS[0], incluirIntroSecao: true, fluxoIndices: [0, 1, 2, 4, 6] },
      { slug: HUB_AULA_SLUGS[1], fluxoIndices: [3, 5] },
    ],
  },
  {
    produtoSlug: 'store',
    docsPath: '/university-gravity/docs/store',
    secao: DOC_STORE_SECAO,
    aulas: [
      { slug: STORE_AULA_SLUGS[0], incluirIntroSecao: true, fluxoIndices: [0, 1, 2, 3, 4, 5] },
    ],
  },
  {
    produtoSlug: 'pedido',
    docsPath: '/university-gravity/docs/pedido',
    secao: DOC_PEDIDO_SECAO,
    aulas: [
      { slug: PEDIDO_AULA_SLUGS[0], incluirIntroSecao: true, fluxoIndices: [0, 1] },
      { slug: PEDIDO_AULA_SLUGS[1], fluxoIndices: [2] },
      { slug: PEDIDO_AULA_SLUGS[2], fluxoIndices: [3] },
      { slug: PEDIDO_AULA_SLUGS[3], fluxoIndices: [4] },
      { slug: PEDIDO_AULA_SLUGS[4], fluxoIndices: [5] },
      { slug: PEDIDO_AULA_SLUGS[5], fluxoIndices: [6] },
      { slug: PEDIDO_AULA_SLUGS[6], fluxoIndices: [7] },
    ],
  },
  {
    produtoSlug: 'smart-read',
    docsPath: '/university-gravity/docs/smart-read',
    secao: DOC_SMART_READ_SECAO,
    aulas: [
      { slug: SMART_READ_AULA_SLUGS[0], incluirIntroSecao: true, fluxoIndices: [0, 1] },
      { slug: SMART_READ_AULA_SLUGS[1], fluxoIndices: [2] },
      { slug: SMART_READ_AULA_SLUGS[2], fluxoIndices: [3] },
      { slug: SMART_READ_AULA_SLUGS[3], fluxoIndices: [4] },
      { slug: SMART_READ_AULA_SLUGS[4], fluxoIndices: [5] },
      { slug: SMART_READ_AULA_SLUGS[5], fluxoIndices: [6] },
      { slug: SMART_READ_AULA_SLUGS[6], fluxoIndices: [7] },
    ],
  },
  {
    produtoSlug: 'bid-frete',
    docsPath: '/university-gravity/docs/bid-frete',
    secao: DOC_BID_FRETE_SECAO,
    aulas: [
      { slug: BID_FRETE_AULA_SLUGS[0], incluirIntroSecao: true, fluxoIndices: [0, 1] },
      { slug: BID_FRETE_AULA_SLUGS[1], fluxoIndices: [2] },
      { slug: BID_FRETE_AULA_SLUGS[2], fluxoIndices: [3] },
      { slug: BID_FRETE_AULA_SLUGS[3], fluxoIndices: [4, 5, 6] },
      { slug: BID_FRETE_AULA_SLUGS[4], fluxoIndices: [9] },
    ],
  },
  {
    produtoSlug: 'navegacao',
    docsPath: '/university-gravity/docs/navegacao',
    secao: DOC_NAVEGACAO_SECAO,
    aulas: curadoriaSequencial(NAVEGACAO_AULA_SLUGS),
  },
  {
    produtoSlug: 'admin',
    docsPath: '/university-gravity/docs/admin',
    secao: DOC_ADMIN_SECAO,
    aulas: curadoriaSequencial(ADMIN_AULA_SLUGS),
  },
]

const LOGIN_AULA_POR_DOC_SEC: Record<number, string> = {
  1: LOGIN_AULA_SLUGS[0],
  2: LOGIN_AULA_SLUGS[0],
  3: LOGIN_AULA_SLUGS[1],
  4: LOGIN_AULA_SLUGS[2],
  5: LOGIN_AULA_SLUGS[1],
  6: LOGIN_AULA_SLUGS[1],
}

const GABI_AULA_POR_DOC_SEC: Record<number, string> = {
  1: GABI_AULA_SLUGS[0],
  4: GABI_AULA_SLUGS[1],
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

function hashIntroSecao(secao: DocSecao): string {
  const titulo = secao.tituloTopico?.trim() || secao.titulo
  return `#${idAncoraTituloGuia(titulo)}`
}

function hashDeDocSecSecao(secao: DocSecao, docSecNum: number): string {
  if (!Number.isFinite(docSecNum) || docSecNum < 1) return hashIntroSecao(secao)
  if (docSecNum === 1) return hashIntroSecao(secao)
  const fluxo = secao.fluxos?.[docSecNum - 2]
  if (!fluxo) return hashIntroSecao(secao)
  return `#${idAncoraTituloGuia(fluxo.tituloSumario ?? fluxo.titulo)}`
}

function hashDeManualPasso(secao: DocSecao, hashPart: string): string | null {
  const match = /^#manual-passo-([^-]+(?:-[^-]+)*)-(\d+)$/.exec(hashPart)
  if (!match) return null
  const prefix = match[1]
  const passoNum = Number(match[2])
  const fluxo = secao.fluxos?.find(f => f.ancoraPassosPrefix === prefix)
  if (!fluxo) return null
  const passo = encontrarPassoPorNum(fluxo.passosVisuais ?? [], passoNum)
  if (passo) {
    const tituloPasso = passo.tituloCurto?.trim() || passo.titulo
    return `#${idAncoraTituloGuia(tituloPasso)}`
  }
  return `#${idAncoraTituloGuia(fluxo.tituloSumario ?? fluxo.titulo)}`
}

function hashDeLoginSecao(docSecNum: number): string {
  const secao = DOC_LOGIN_SECOES.find(s => s.num === docSecNum)
  if (!secao) return ''
  return `#${idAncoraTituloGuia(secao.titulo)}`
}

function hashDeGabiSecao(docSecNum: number): string {
  const secao = DOC_GABI_SECOES.find(s => s.num === docSecNum)
  if (!secao) return ''
  return `#${idAncoraTituloGuia(secao.titulo)}`
}

function resolverHash(secao: DocSecao, hashPart: string): string {
  if (!hashPart) return ''
  const manualPasso = hashDeManualPasso(secao, hashPart)
  if (manualPasso) return manualPasso
  const docSecMatch = /^#doc-sec-(\d+)$/.exec(hashPart)
  if (docSecMatch) return hashDeDocSecSecao(secao, Number(docSecMatch[1]))
  return hashPart
}

function aulaSlugParaIntro(aulas: CuradoriaAulaDef[]): string | null {
  return aulas.find(a => a.incluirIntroSecao)?.slug ?? aulas[0]?.slug ?? null
}

function aulaSlugParaFluxo(aulas: CuradoriaAulaDef[], fluxoIndex: number): string | null {
  for (const aula of aulas) {
    if (aula.fluxoIndices.includes(fluxoIndex)) return aula.slug
  }
  return null
}

function resolverDestinoProdutoManual(
  def: ProdutoManualDef,
  hashPart: string,
): string | null {
  const docSecMatch = /^#doc-sec-(\d+)$/.exec(hashPart)
  let aulaSlug: string | null = null

  if (docSecMatch) {
    const docSecNum = Number(docSecMatch[1])
    if (docSecNum <= 1) {
      aulaSlug = aulaSlugParaIntro(def.aulas)
    } else {
      const fluxoIndex = docSecNum - 2
      aulaSlug = aulaSlugParaFluxo(def.aulas, fluxoIndex) ?? aulaSlugParaIntro(def.aulas)
    }
  } else if (hashPart.startsWith('#manual-passo-')) {
    const prefixMatch = /^#manual-passo-([^-]+(?:-[^-]+)*)-(\d+)$/.exec(hashPart)
    if (prefixMatch) {
      const prefix = prefixMatch[1]
      const fluxoIndex = def.secao.fluxos?.findIndex(f => f.ancoraPassosPrefix === prefix) ?? -1
      if (fluxoIndex >= 0) aulaSlug = aulaSlugParaFluxo(def.aulas, fluxoIndex)
    }
  }

  aulaSlug ??= aulaSlugParaIntro(def.aulas)
  if (!aulaSlug) return null

  const hash = resolverHash(def.secao, hashPart)
  return `/university-gravity/academy/${def.produtoSlug}/${aulaSlug}${hash}`
}

function resolverDestinoConfigurador(pathPart: string, hashPart: string): string | null {
  const raizMatch = pathPart === '/university-gravity/docs/configurador'
  if (raizMatch) return '/university-gravity/academy/configurador'

  const capituloMatch = /^\/university-gravity\/docs\/configurador\/([^/?#]+)$/.exec(pathPart)
  if (capituloMatch) {
    const manualSlug = resolverConfiguradorManualSlug(capituloMatch[1])
    const secao = secaoConfiguradorPorSlug(manualSlug)
    if (!secao) return null

    const docSecMatch = /^#doc-sec-(\d+)$/.exec(hashPart)
    let aulaSlug: string | null = null

    if (docSecMatch) {
      const docSecNum = Number(docSecMatch[1])
      if (docSecNum <= 1) {
        aulaSlug = CONFIGURADOR_AULAS_CURADORIA.find(
          a => a.manualCapitulos.includes(manualSlug) && a.incluirIntroSecao,
        )?.slug ?? AULA_SLUG_PADRAO_CONFIGURADOR[manualSlug] ?? null
      } else {
        const fluxoIndex = docSecNum - 2
        aulaSlug = CONFIGURADOR_AULAS_CURADORIA.find(
          a => a.manualCapitulos.includes(manualSlug) && a.fluxoIndices.includes(fluxoIndex),
        )?.slug ?? AULA_SLUG_PADRAO_CONFIGURADOR[manualSlug] ?? null
      }
    } else if (hashPart.startsWith('#manual-passo-')) {
      const prefixMatch = /^#manual-passo-([^-]+(?:-[^-]+)*)-(\d+)$/.exec(hashPart)
      if (prefixMatch) {
        const prefix = prefixMatch[1]
        const fluxoIndex = secao.fluxos?.findIndex(f => f.ancoraPassosPrefix === prefix) ?? -1
        if (fluxoIndex >= 0) {
          aulaSlug = CONFIGURADOR_AULAS_CURADORIA.find(
            a => a.manualCapitulos.includes(manualSlug) && a.fluxoIndices.includes(fluxoIndex),
          )?.slug ?? null
        }
      }
    }

    aulaSlug ??= AULA_SLUG_PADRAO_CONFIGURADOR[manualSlug] ?? null
    if (!aulaSlug) return null

    const hash = resolverHash(secao, hashPart)
    return `/university-gravity/academy/configurador/${aulaSlug}${hash}`
  }

  return null
}

function resolverDestinoLogin(hashPart: string): string | null {
  const docSecMatch = /^#doc-sec-(\d+)$/.exec(hashPart)
  const docSecNum = docSecMatch ? Number(docSecMatch[1]) : 1
  const aulaSlug = LOGIN_AULA_POR_DOC_SEC[docSecNum] ?? LOGIN_AULA_SLUGS[0]
  const hash = docSecMatch ? hashDeLoginSecao(docSecNum) : ''
  return `/university-gravity/academy/login/${aulaSlug}${hash}`
}

function resolverDestinoGabi(hashPart: string): string | null {
  const docSecMatch = /^#doc-sec-(\d+)$/.exec(hashPart)
  const docSecNum = docSecMatch ? Number(docSecMatch[1]) : 1
  const aulaSlug = GABI_AULA_POR_DOC_SEC[docSecNum] ?? GABI_AULA_SLUGS[0]
  const hash = docSecMatch ? hashDeGabiSecao(docSecNum) : ''
  return `/university-gravity/academy/gabi/${aulaSlug}${hash}`
}

function resolverDestinoApiCockpit(hashPart: string): string | null {
  const aulaSlug = AULA_SLUG_PADRAO_CONFIGURADOR['api-cockpit']
  if (!aulaSlug) return null
  const hash = resolverHash(DOC_API_COCKPIT_SECAO, hashPart)
  return `/university-gravity/academy/configurador/${aulaSlug}${hash}`
}

/**
 * Converte href do Manual (ex.: `/university-gravity/docs/hub#doc-sec-3`)
 * para rota do Guia Academy com âncora de seção quando aplicável.
 */
export function resolverHrefManualParaAcademy(href: string): string | null {
  const trimmed = href.trim()
  if (trimmed.startsWith('/university-gravity/academy/')) return trimmed

  const hashIdx = trimmed.indexOf('#')
  const pathPart = (hashIdx >= 0 ? trimmed.slice(0, hashIdx) : trimmed).replace(/\/$/, '')
  const hashPart = hashIdx >= 0 ? trimmed.slice(hashIdx) : ''

  for (const def of PRODUTOS_MANUAL) {
    if (pathPart === def.docsPath) return resolverDestinoProdutoManual(def, hashPart)
  }

  if (pathPart === '/university-gravity/docs/login') return resolverDestinoLogin(hashPart)
  if (pathPart === '/university-gravity/docs/gabi') return resolverDestinoGabi(hashPart)
  if (pathPart === '/university-gravity/docs/api-cockpit') return resolverDestinoApiCockpit(hashPart)

  return resolverDestinoConfigurador(pathPart, hashPart)
}

export function produtoSlugDePathnameAcademy(pathname: string): string | null {
  const match = /^\/university-gravity\/academy\/([^/]+)/.exec(pathname)
  return match?.[1] ?? null
}
