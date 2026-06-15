/**
 * Resolve porto/aeroporto/país da importação contra catálogo Cadastros — paridade wizard manual.
 */
import { normalizarNomeCampoImportacaoBidFreteInternacional } from './campos-importacao-bid-frete-internacional'
import { extrairCodigoDeRotuloImportacao } from './rotulo-cadastro-importacao-bid-frete-internacional'
import type { CatalogoAeroportoRota, CatalogoPortoRota } from './rota-cotacao-bid-frete-internacional'

const REGEX_UNLOCODE = /^[A-Za-z]{2}[A-Za-z0-9]{3}$/
const REGEX_IATA = /^[A-Za-z]{3}$/

export function ehCodigoUnlocode(valor: string | null | undefined): boolean {
  const t = (valor ?? '').trim()
  return t.length > 0 && REGEX_UNLOCODE.test(t)
}

export function ehCodigoIata(valor: string | null | undefined): boolean {
  const t = (valor ?? '').trim()
  return t.length > 0 && REGEX_IATA.test(t)
}

function normalizarBuscaCadastro(valor: string): string {
  return normalizarNomeCampoImportacaoBidFreteInternacional(valor)
}

function nomePortoCorresponde(nomePorto: string, busca: string): boolean {
  const normNome = normalizarBuscaCadastro(nomePorto)
  const normBusca = normalizarBuscaCadastro(busca)
  if (!normBusca) return false
  return normNome === normBusca || normNome.includes(normBusca) || normBusca.includes(normNome)
}

export interface ResultadoResolverPortoImportacao {
  porto: CatalogoPortoRota | null
  ambiguo: boolean
}

export function resolverPortoNoCatalogoImportacao(
  valorBruto: string,
  portos: readonly CatalogoPortoRota[],
): ResultadoResolverPortoImportacao {
  const bruto = (valorBruto ?? '').trim()
  if (!bruto || portos.length === 0) {
    return { porto: null, ambiguo: false }
  }

  const codigoExtraido = extrairCodigoDeRotuloImportacao(bruto).toUpperCase()
  if (ehCodigoUnlocode(codigoExtraido)) {
    const exato = portos.find(p => p.codigo_unlocode_porto.toUpperCase() === codigoExtraido)
    if (exato) return { porto: exato, ambiguo: false }
  }

  const candidatos = portos.filter(p => nomePortoCorresponde(p.nome_porto, bruto))
  if (candidatos.length === 1) return { porto: candidatos[0], ambiguo: false }
  if (candidatos.length > 1) return { porto: null, ambiguo: true }

  return { porto: null, ambiguo: false }
}

export interface ResultadoResolverAeroportoImportacao {
  aeroporto: CatalogoAeroportoRota | null
  ambiguo: boolean
}

export function resolverAeroportoNoCatalogoImportacao(
  valorBruto: string,
  aeroportos: readonly CatalogoAeroportoRota[],
): ResultadoResolverAeroportoImportacao {
  const bruto = (valorBruto ?? '').trim()
  if (!bruto || aeroportos.length === 0) {
    return { aeroporto: null, ambiguo: false }
  }

  const codigoExtraido = extrairCodigoDeRotuloImportacao(bruto).toUpperCase()
  if (ehCodigoIata(codigoExtraido) || ehCodigoUnlocode(codigoExtraido)) {
    const exato = aeroportos.find(a =>
      (a.codigo_iata_aeroporto ?? '').toUpperCase() === codigoExtraido
      || a.codigo_unlocode_aeroporto.toUpperCase() === codigoExtraido,
    )
    if (exato) return { aeroporto: exato, ambiguo: false }
  }

  const candidatos = aeroportos.filter(a => nomePortoCorresponde(a.nome_aeroporto, bruto))
  if (candidatos.length === 1) return { aeroporto: candidatos[0], ambiguo: false }
  if (candidatos.length > 1) return { aeroporto: null, ambiguo: true }

  return { aeroporto: null, ambiguo: false }
}

export function paisDeCodigoUnlocode(codigo: string): string {
  return ehCodigoUnlocode(codigo) ? codigo.slice(0, 2).toUpperCase() : ''
}
