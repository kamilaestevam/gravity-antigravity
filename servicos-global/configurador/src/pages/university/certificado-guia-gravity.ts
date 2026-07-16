/**
 * Certificados do Guia Gravity — tipos, adaptadores API e utilitários de conclusão.
 */

import type { GuiaGravityJornadaResponse } from '../../../shared/guia-gravity/guia-gravity-jornada-schema.js'
import { tipoCertificadoPrismaParaFront } from '../../../shared/guia-gravity/certificado-guia-gravity.js'
import { SLUGS_MODULO_BASICO_GUIA as SLUGS_MODULO_BASICO_SHARED } from '../../../shared/guia-gravity/slugs-aula-por-produto.js'

export const SLUGS_MODULO_BASICO_GUIA = SLUGS_MODULO_BASICO_SHARED

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

/**
 * Slugs renomeados/unificados na curadoria — progresso legado continua válido.
 */
const SLUGS_LEGADOS_AULA_CONCLUIDA: Partial<Record<string, readonly string[]>> = {
  'acessar-workspaces': [
    'gerenciando-workspaces',
    'configurando-workspaces',
    'criar-workspace',
    'editar-workspace',
    'ativar-workspace',
    'excluir-workspace',
  ],
  'administrando-usuarios': ['convidando-usuarios', 'gerenciando-usuarios', 'organize-usuarios-na-plataforma'],
  'gerenciando-assinaturas': ['assinaturas-e-financeiro', 'gerenciando-assinaturas'],
  'financeiro-da-conta': ['assinaturas-e-financeiro', 'financeiro-da-conta'],
}

/** Promove slugs legados → atuais para desbloqueio linear. */
export function normalizarSlugsConclusaoAcademy(slugs: Iterable<string>): Set<string> {
  const s = new Set(slugs)
  for (const [atual, legados] of Object.entries(SLUGS_LEGADOS_AULA_CONCLUIDA)) {
    if (s.has(atual)) continue
    const legadoOk = legados?.some(slug => s.has(slug)) ?? false
    if (legadoOk) s.add(atual)
  }
  return s
}

export function certificadosApiParaMapaGuia(
  certificados: GuiaGravityJornadaResponse['certificados'],
): MapaCertificadosGuia {
  const mapa: MapaCertificadosGuia = {}
  for (const cert of certificados) {
    const tipo = tipoCertificadoPrismaParaFront(cert.tipo_certificado_guia_gravity)
    mapa[tipo] = {
      tipo_certificado: tipo,
      emitido_em: cert.data_emissao_certificado_guia_gravity,
      numero: cert.numero_certificado_guia_gravity,
      codigo_verificacao: cert.codigo_verificacao_certificado_guia_gravity,
    }
  }
  return mapa
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
