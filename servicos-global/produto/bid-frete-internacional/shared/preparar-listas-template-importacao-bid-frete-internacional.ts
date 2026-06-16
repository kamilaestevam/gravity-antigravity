/**
 * Normaliza listas do template e garante que a linha exemplo bate com os dropdowns.
 */
import { extrairCodigoDeRotuloImportacao } from './rotulo-cadastro-importacao-bid-frete-internacional'
import {
  MOEDAS_PADRAO_TEMPLATE_BID,
  SELECT_TEMPLATE_BID,
  type ListasCadastrosTemplateBid,
} from './template-importacao-config-bid-frete-internacional'
import type {
  CampoImportacaoBidFreteInternacional,
  LinhaImportacaoBidFreteInternacional,
} from './tipos-importacao-bid-frete-internacional'

export function rotuloCanonicoNaListaCadastro(
  valor: string,
  lista: readonly string[],
): string | null {
  const bruto = valor.trim()
  if (!bruto) return null
  if (lista.includes(bruto)) return bruto

  const codigo = extrairCodigoDeRotuloImportacao(bruto).toUpperCase()
  if (!codigo) return null

  return lista.find(
    item => extrairCodigoDeRotuloImportacao(item).toUpperCase() === codigo,
  ) ?? null
}

/** Garante que valores da linha exemplo existem nas listas (evita erro de validação Excel/Sheets). */
export function garantirValoresExemploNasListasTemplateBid(
  listas: ListasCadastrosTemplateBid,
  linhaExemplo: LinhaImportacaoBidFreteInternacional,
): ListasCadastrosTemplateBid {
  const out: ListasCadastrosTemplateBid = {
    portos: [...listas.portos],
    aeroportos: [...listas.aeroportos],
    paises: [...listas.paises],
    containers: [...listas.containers],
    moedas: [...listas.moedas],
  }

  for (const [campoRaw, config] of Object.entries(SELECT_TEMPLATE_BID)) {
    if (!config || config.tipo !== 'lista') continue
    const campo = campoRaw as CampoImportacaoBidFreteInternacional
    const valorExemplo = linhaExemplo[campo]?.trim()
    if (!valorExemplo) continue

    const chave = config.chave
    const lista = out[chave]
    if (rotuloCanonicoNaListaCadastro(valorExemplo, lista)) continue

    out[chave] = [valorExemplo, ...lista]
  }

  return out
}

/** Substitui códigos curtos da linha exemplo pelo rótulo completo presente na lista. */
export function ajustarLinhaExemploParaListasTemplateBid(
  linhaExemplo: LinhaImportacaoBidFreteInternacional,
  listas: ListasCadastrosTemplateBid,
): LinhaImportacaoBidFreteInternacional {
  const out = { ...linhaExemplo }

  for (const [campoRaw, config] of Object.entries(SELECT_TEMPLATE_BID)) {
    if (!config || config.tipo !== 'lista') continue
    const campo = campoRaw as CampoImportacaoBidFreteInternacional
    const valor = out[campo]?.trim()
    if (!valor) continue

    const canonico = rotuloCanonicoNaListaCadastro(valor, listas[config.chave])
    if (canonico) out[campo] = canonico
  }

  return out
}

export function moedasFallbackTemplateBid(): readonly string[] {
  return MOEDAS_PADRAO_TEMPLATE_BID.map(codigo => codigo)
}
