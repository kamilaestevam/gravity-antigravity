/**
 * Formatação de taxas de origem/destino no detalhe, ranking e modal de aprovação.
 */
import type {
  PropostaBidFreteInternacional,
  PropostaRankingBidFreteInternacional,
  TaxaDestinoPropostaBidFreteInternacional,
  TaxaOrigemPropostaBidFreteInternacional,
} from './types'

export interface ItemTaxaExibicaoProposta {
  nome: string
  moeda: string
  valor: number
}

const fmtNumero = (n: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

export function formatarMoedaBidFrete(val: number, moeda: string): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: moeda,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val)
  } catch {
    return `${moeda} ${fmtNumero(val)}`
  }
}

export function resumoTotaisPorMoeda(itens: ItemTaxaExibicaoProposta[]): string[] {
  const porMoeda = new Map<string, number>()
  for (const item of itens) {
    const moeda = item.moeda.trim() || 'USD'
    porMoeda.set(moeda, (porMoeda.get(moeda) ?? 0) + item.valor)
  }
  return [...porMoeda.entries()]
    .filter(([, total]) => total > 0)
    .map(([moeda, total]) => `${moeda} ${fmtNumero(total)}`)
}

export function itensTaxasOrigemProposta(
  proposta: PropostaBidFreteInternacional,
): ItemTaxaExibicaoProposta[] {
  if (!proposta.taxas_origem?.length) return []
  return proposta.taxas_origem
    .filter((t) => t.nome_taxa_origem_bid_frete_internacional.trim().length > 0)
    .map((t) => ({
      nome: t.nome_taxa_origem_bid_frete_internacional,
      moeda: t.moeda_taxa_origem_bid_frete_internacional || 'USD',
      valor: Number(t.valor_taxa_origem_bid_frete_internacional) || 0,
    }))
}

export function itensTaxasDestinoProposta(
  proposta: PropostaBidFreteInternacional,
): ItemTaxaExibicaoProposta[] {
  if (!proposta.taxas_destino?.length) return []
  return proposta.taxas_destino
    .filter((t) => t.nome_taxa_destino_bid_frete_internacional.trim().length > 0)
    .map((t) => ({
      nome: t.nome_taxa_destino_bid_frete_internacional,
      moeda: t.moeda_taxa_destino_bid_frete_internacional || 'USD',
      valor: Number(t.valor_taxa_destino_bid_frete_internacional) || 0,
    }))
}

export function subtotalTaxasOrigemTexto(
  proposta: PropostaBidFreteInternacional,
  moedaProposta: string,
): string {
  const itens = itensTaxasOrigemProposta(proposta)
  const partes = resumoTotaisPorMoeda(itens)
  if (partes.length > 0) return partes.join(' · ')
  return formatarMoedaBidFrete(
    proposta.taxas_origem_proposta_bid_frete_internacional,
    moedaProposta,
  )
}

export function subtotalTaxasDestinoTexto(
  proposta: PropostaBidFreteInternacional,
  moedaProposta: string,
): string {
  const itens = itensTaxasDestinoProposta(proposta)
  const partes = resumoTotaisPorMoeda(itens)
  if (partes.length > 0) return partes.join(' · ')
  return formatarMoedaBidFrete(
    proposta.taxas_destino_proposta_bid_frete_internacional,
    moedaProposta,
  )
}

export function rankPropostaPorValor(
  propostas: PropostaRankingBidFreteInternacional[],
  idProposta: string,
  valorDe: (p: PropostaRankingBidFreteInternacional) => number,
): number {
  const ordenado = [...propostas].sort((a, b) => valorDe(a) - valorDe(b))
  const idx = ordenado.findIndex((p) => p.id_proposta_bid_frete_internacional === idProposta)
  return idx >= 0 ? idx + 1 : ordenado.length
}

export function percentualBarraPorRank(rank: number): number {
  if (rank <= 1) return 100
  return Math.max(18, 100 - (rank - 1) * 18)
}
