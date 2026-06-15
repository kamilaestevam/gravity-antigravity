import { normalizarNomeCampoImportacaoBidFreteInternacional } from './campos-importacao-bid-frete-internacional'
import { extrairCodigoDeRotuloImportacao } from './rotulo-cadastro-importacao-bid-frete-internacional'
import {
  MAPAS_ROTULO_ENUM_IMPORTACAO_BID,
  CAMPOS_CADASTRO_IMPORTACAO_BID,
} from './template-importacao-config-bid-frete-internacional'
import type {
  CampoImportacaoBidFreteInternacional,
  LinhaImportacaoBidFreteInternacional,
} from './tipos-importacao-bid-frete-internacional'

function resolverEnumPorRotulo(
  valor: string,
  mapa: Readonly<Record<string, string>>,
): string {
  const bruto = valor.trim()
  if (!bruto) return ''

  const chaves = Object.keys(mapa)
  if (chaves.includes(bruto.toUpperCase())) return bruto.toUpperCase()
  if (chaves.includes(bruto)) return bruto

  const normEntrada = normalizarNomeCampoImportacaoBidFreteInternacional(bruto)
  for (const [chave, rotulo] of Object.entries(mapa)) {
    if (normalizarNomeCampoImportacaoBidFreteInternacional(rotulo) === normEntrada) {
      return chave
    }
  }

  return bruto
}

export function normalizarValorCampoImportacaoBid(
  campo: CampoImportacaoBidFreteInternacional,
  valor: string | undefined,
): string {
  const bruto = (valor ?? '').trim()
  if (!bruto) return ''

  if (CAMPOS_CADASTRO_IMPORTACAO_BID.has(campo)) {
    return extrairCodigoDeRotuloImportacao(bruto)
  }

  const mapaEnum = MAPAS_ROTULO_ENUM_IMPORTACAO_BID[campo]
  if (mapaEnum) {
    return resolverEnumPorRotulo(bruto, mapaEnum)
  }

  if (campo === 'anonima_cotacao_bid_frete_internacional') {
    const lower = bruto.toLowerCase()
    if (lower === 'sim' || lower === 'true' || lower === '1') return 'Sim'
    if (lower === 'nao' || lower === 'não' || lower === 'false' || lower === '0') return 'Nao'
  }

  return bruto
}

export function normalizarLinhaImportacaoBid(
  linha: LinhaImportacaoBidFreteInternacional,
): LinhaImportacaoBidFreteInternacional {
  const out = { ...linha }
  for (const campo of Object.keys(out) as CampoImportacaoBidFreteInternacional[]) {
    out[campo] = normalizarValorCampoImportacaoBid(campo, linha[campo])
  }
  return out
}
