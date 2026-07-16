/**
 * Certificados do Guia Gravity — tipos, adaptadores API e utilitários de conclusão.
 */

import type { GuiaGravityJornadaResponse } from '../../../shared/guia-gravity/guia-gravity-jornada-schema.js'
import { tipoCertificadoPrismaParaFront } from '../../../shared/guia-gravity/certificado-guia-gravity.js'
import { SLUGS_MODULO_BASICO_GUIA as SLUGS_MODULO_BASICO_SHARED } from '../../../shared/guia-gravity/slugs-aula-por-produto.js'
import {
  aulaGuiaEstaConcluida as aulaGuiaEstaConcluidaShared,
  normalizarSlugsConclusaoAcademyGuia,
} from '../../../shared/guia-gravity/conclusao-academy-guia-gravity.js'
import { produtoGuiaConcluido100 } from '../../../shared/guia-gravity/slugs-aula-por-produto.js'

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

/** Promove slugs legados → atuais para desbloqueio linear. */
export function normalizarSlugsConclusaoAcademy(slugs: Iterable<string>): Set<string> {
  return normalizarSlugsConclusaoAcademyGuia(slugs)
}

/** Slug de aula concluída (inclui equivalências legadas após normalização). */
export function aulaGuiaEstaConcluida(slugAula: string, concluidas: ReadonlySet<string>): boolean {
  return aulaGuiaEstaConcluidaShared(slugAula, concluidas)
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
    pedido: 'university.produto.pedido',
    'bid-frete': 'university.produto.bid_frete',
    'smart-read': 'university.produto.smart_read',
  }
  return mapa[tipo]
}

/** Nome completo no certificado — prioriza Clerk fullName, depois nome do /me. */
export function resolverNomeCertificadoGuiaGravity(opts: {
  nomeUsuario?: string | null
  nomeCompletoClerk?: string | null
  nomeCurtoClerk?: string | null
}): string {
  const candidatos = [
    opts.nomeCompletoClerk?.trim(),
    opts.nomeUsuario?.trim(),
    opts.nomeCurtoClerk?.trim(),
  ].filter((n): n is string => Boolean(n))

  const comMaisPalavras = candidatos.find(n => n.split(/\s+/).filter(Boolean).length >= 2)
  return comMaisPalavras ?? candidatos[0] ?? 'Usuário'
}

export function avaliarTiposCertificadoElegiveis(
  aulasConcluidas: ReadonlySet<string>,
): TipoCertificadoGuia[] {
  const concluidas = normalizarSlugsConclusaoAcademyGuia(aulasConcluidas)
  const elegiveis: TipoCertificadoGuia[] = []

  const moduloBasicoOk = SLUGS_MODULO_BASICO_GUIA.every(slug => produtoGuiaConcluido100(slug, concluidas))
  if (moduloBasicoOk) elegiveis.push('modulo-basico')

  for (const tipo of ['pedido', 'bid-frete', 'smart-read'] as const) {
    if (produtoGuiaConcluido100(tipo, concluidas)) elegiveis.push(tipo)
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
