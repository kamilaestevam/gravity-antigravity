/**
 * Certificados do Guia Gravity — emissão demo (sessionStorage; futuro: API).
 *
 * Tipos oficiais:
 * 1. Módulo básico — todos os guias fundacionais (sidebar «Todos os produtos»)
 * 2. Pedido, Bid Frete, Smart Docs — um certificado por produto
 */

export const CHAVE_CERTIFICADOS_GUIA = 'university_certificados_guia_v2'

/** Guia fundacional — imagem 2 (sidebar Todos os produtos Gravity). */
export const SLUGS_MODULO_BASICO_GUIA = [
  'bem-vindo',
  'login',
  'navegacao',
  'admin',
  'configurador',
  'gabi',
  'hub',
  'store',
] as const

export const TIPOS_CERTIFICADO_GUIA = [
  'modulo-basico',
  'pedido',
  'bid-frete',
  'smart-read',
] as const

export type TipoCertificadoGuia = (typeof TIPOS_CERTIFICADO_GUIA)[number]

export interface CertificadoEmitidoGuia {
  tipo_certificado: TipoCertificadoGuia
  emitido_em: string
  numero: string
  codigo_verificacao: string
}

export type MapaCertificadosGuia = Partial<Record<TipoCertificadoGuia, CertificadoEmitidoGuia>>

function hashSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  return h
}

export function gerarNumeroCertificadoGuia(tipo: TipoCertificadoGuia): string {
  const base = 800000 + (hashSlug(tipo) % 100000)
  return `GU-${base}`
}

export function gerarCodigoVerificacaoGuia(tipo: TipoCertificadoGuia, emitidoEm: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seed = hashSlug(`${tipo}:${emitidoEm}`)
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

export function carregarCertificadosGuia(): MapaCertificadosGuia {
  if (typeof sessionStorage === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(CHAVE_CERTIFICADOS_GUIA)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as MapaCertificadosGuia
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function salvarCertificadosGuia(mapa: MapaCertificadosGuia): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(CHAVE_CERTIFICADOS_GUIA, JSON.stringify(mapa))
}

export function formatarDataCertificadoGuia(iso: string, locale: string): string {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return iso
  return data.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
}

export function chaveI18nCertificadoGuia(tipo: TipoCertificadoGuia): string {
  const mapa: Record<TipoCertificadoGuia, string> = {
    'modulo-basico': 'university.certificado.tipo_modulo_basico',
    pedido: 'university.certificado.tipo_pedido',
    'bid-frete': 'university.certificado.tipo_bid_frete',
    'smart-read': 'university.certificado.tipo_smart_read',
  }
  return mapa[tipo]
}

export function avaliarTiposCertificadoElegiveis(opts: {
  produtoConcluido100: (slug: string) => boolean
}): TipoCertificadoGuia[] {
  const { produtoConcluido100 } = opts
  const elegiveis: TipoCertificadoGuia[] = []

  const moduloBasicoOk = SLUGS_MODULO_BASICO_GUIA.every(slug => produtoConcluido100(slug))
  if (moduloBasicoOk) elegiveis.push('modulo-basico')

  for (const tipo of ['pedido', 'bid-frete', 'smart-read'] as const) {
    if (produtoConcluido100(tipo)) elegiveis.push(tipo)
  }

  return elegiveis
}

export function sincronizarCertificadosGuia(
  tiposElegiveis: TipoCertificadoGuia[],
): MapaCertificadosGuia {
  const mapa = carregarCertificadosGuia()
  let alterou = false
  for (const tipo of tiposElegiveis) {
    if (mapa[tipo]) continue
    const emitidoEm = new Date().toISOString()
    mapa[tipo] = {
      tipo_certificado: tipo,
      emitido_em: emitidoEm,
      numero: gerarNumeroCertificadoGuia(tipo),
      codigo_verificacao: gerarCodigoVerificacaoGuia(tipo, emitidoEm),
    }
    alterou = true
  }
  if (alterou) salvarCertificadosGuia(mapa)
  return mapa
}

export function listarCertificadosOrdenados(mapa: MapaCertificadosGuia): CertificadoEmitidoGuia[] {
  const ordem = new Map(TIPOS_CERTIFICADO_GUIA.map((t, i) => [t, i]))
  return Object.values(mapa)
    .filter((c): c is CertificadoEmitidoGuia => Boolean(c))
    .sort((a, b) => {
      const oa = ordem.get(a.tipo_certificado) ?? 99
      const ob = ordem.get(b.tipo_certificado) ?? 99
      if (oa !== ob) return oa - ob
      return new Date(b.emitido_em).getTime() - new Date(a.emitido_em).getTime()
    })
}

export function contarCertificadosObtidos(mapa: MapaCertificadosGuia): number {
  return TIPOS_CERTIFICADO_GUIA.filter(t => Boolean(mapa[t])).length
}
