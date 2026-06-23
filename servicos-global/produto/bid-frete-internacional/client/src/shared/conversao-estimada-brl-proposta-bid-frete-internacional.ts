/**
 * Conversão estimada para BRL na tabela-resumo da proposta (taxa produto ou PTAX).
 */
import {
  parseValorLinhaTaxa,
  type ComposicaoPorMoedaPropostaBidFreteInternacional,
  type LinhaTaxaPropostaBidFreteInternacional,
} from './taxas-linha-proposta-bid-frete-internacional'

const fmtBrl = (n: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

export function normalizarCodigoMoedaProposta(moeda: string): string {
  const codigo = moeda.trim().toUpperCase()
  return codigo || 'USD'
}

export function converterValorMoedaParaBrlEstimado(
  valor: number,
  moeda: string,
  taxasPorMoeda: Record<string, number>,
): number | null {
  if (!Number.isFinite(valor) || valor <= 0) return null
  const codigo = normalizarCodigoMoedaProposta(moeda)
  if (codigo === 'BRL') return Math.round(valor * 100) / 100
  const taxa = taxasPorMoeda[codigo]
  if (!Number.isFinite(taxa) || taxa <= 0) return null
  return Math.round(valor * taxa * 100) / 100
}

export function formatarEstimadoBrlProposta(valorBrl: number | null | undefined): string | null {
  if (valorBrl == null || valorBrl <= 0) return null
  return `≈ R$ ${fmtBrl(valorBrl)}`
}

export function somarEstimadoBrlLinhasTaxasProposta(
  linhas: LinhaTaxaPropostaBidFreteInternacional[],
  taxasPorMoeda: Record<string, number>,
): number | null {
  let soma = 0
  let converteu = false

  for (const linha of linhas) {
    const valor = parseValorLinhaTaxa(linha.valor_taxa_bid_frete_internacional)
    const brl = converterValorMoedaParaBrlEstimado(
      valor,
      linha.moeda_taxa_bid_frete_internacional,
      taxasPorMoeda,
    )
    if (brl != null) {
      soma += brl
      converteu = true
    }
  }

  return converteu ? Math.round(soma * 100) / 100 : null
}

export function somarEstimadoBrlComposicaoProposta(
  composicao: ComposicaoPorMoedaPropostaBidFreteInternacional[],
  taxasPorMoeda: Record<string, number>,
): number | null {
  let soma = 0
  let converteu = false

  for (const parte of composicao) {
    const brl = converterValorMoedaParaBrlEstimado(parte.total, parte.moeda, taxasPorMoeda)
    if (brl != null) {
      soma += brl
      converteu = true
    }
  }

  return converteu ? Math.round(soma * 100) / 100 : null
}
