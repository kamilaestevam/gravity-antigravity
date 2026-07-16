/**
 * Certificados Guia Gravity — tipos, mapeamento Prisma ↔ front e geradores.
 */

import { produtoGuiaConcluido100, SLUGS_MODULO_BASICO_GUIA } from './slugs-aula-por-produto.js'
import { normalizarSlugsConclusaoAcademyGuia } from './conclusao-academy-guia-gravity.js'

export const TIPOS_CERTIFICADO_GUIA_GRAVITY = [
  'MODULO_BASICO',
  'PEDIDO',
  'BID_FRETE',
  'SMART_READ',
] as const

export type TipoCertificadoGuiaGravity = (typeof TIPOS_CERTIFICADO_GUIA_GRAVITY)[number]

export const TIPOS_CERTIFICADO_GUIA_FRONT = [
  'modulo-basico',
  'pedido',
  'bid-frete',
  'smart-read',
] as const

export type TipoCertificadoGuiaFront = (typeof TIPOS_CERTIFICADO_GUIA_FRONT)[number]

const MAPA_FRONT_PARA_PRISMA: Record<TipoCertificadoGuiaFront, TipoCertificadoGuiaGravity> = {
  'modulo-basico': 'MODULO_BASICO',
  pedido: 'PEDIDO',
  'bid-frete': 'BID_FRETE',
  'smart-read': 'SMART_READ',
}

const MAPA_PRISMA_PARA_FRONT: Record<TipoCertificadoGuiaGravity, TipoCertificadoGuiaFront> = {
  MODULO_BASICO: 'modulo-basico',
  PEDIDO: 'pedido',
  BID_FRETE: 'bid-frete',
  SMART_READ: 'smart-read',
}

export function tipoCertificadoFrontParaPrisma(tipo: TipoCertificadoGuiaFront): TipoCertificadoGuiaGravity {
  return MAPA_FRONT_PARA_PRISMA[tipo]
}

export function tipoCertificadoPrismaParaFront(tipo: TipoCertificadoGuiaGravity): TipoCertificadoGuiaFront {
  return MAPA_PRISMA_PARA_FRONT[tipo]
}

function hashSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  return h
}

export function gerarNumeroCertificadoGuia(tipo: TipoCertificadoGuiaGravity): string {
  const base = 800000 + (hashSlug(tipo) % 100000)
  return `GU-${base}`
}

export function gerarCodigoVerificacaoGuia(tipo: TipoCertificadoGuiaGravity, emitidoEm: Date): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seed = hashSlug(`${tipo}:${emitidoEm.toISOString()}`)
  const blocos = [0, 1, 2].map(b => {
    let s = ''
    for (let i = 0; i < 3; i++) {
      const idx = (seed + b * 17 + i * 13) % chars.length
      s += chars[idx]
    }
    return s
  })
  return `GRV ${blocos[0]} ${blocos[1]} ${blocos[2]}`
}

export function avaliarTiposCertificadoElegiveis(
  aulasConcluidas: ReadonlySet<string>,
): TipoCertificadoGuiaGravity[] {
  const concluidas = normalizarSlugsConclusaoAcademyGuia(aulasConcluidas)
  const elegiveis: TipoCertificadoGuiaGravity[] = []

  const moduloBasicoOk = SLUGS_MODULO_BASICO_GUIA.every(slug =>
    produtoGuiaConcluido100(slug, concluidas),
  )
  if (moduloBasicoOk) elegiveis.push('MODULO_BASICO')

  for (const slug of ['pedido', 'bid-frete', 'smart-read'] as const) {
    if (produtoGuiaConcluido100(slug, concluidas)) {
      elegiveis.push(
        slug === 'pedido' ? 'PEDIDO' : slug === 'bid-frete' ? 'BID_FRETE' : 'SMART_READ',
      )
    }
  }

  return elegiveis
}

export function xpModuloCertificado(
  tipo: TipoCertificadoGuiaGravity,
  xpPorProduto: Record<string, number>,
): number {
  if (tipo === 'MODULO_BASICO') {
    return SLUGS_MODULO_BASICO_GUIA.reduce((s, slug) => s + (xpPorProduto[slug] ?? 0), 0)
  }
  const slugFront = tipoCertificadoPrismaParaFront(tipo)
  return xpPorProduto[slugFront] ?? 0
}
