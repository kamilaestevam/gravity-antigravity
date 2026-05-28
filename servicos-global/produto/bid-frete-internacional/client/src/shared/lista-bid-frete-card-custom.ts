import type { CardDefinicao } from './use-card-preferences'
import type { Cotacao, PropostaBidFreteInternacional } from './types'

function lerNumero(valor: unknown): number {
  const n = Number(valor)
  return Number.isFinite(n) ? n : 0
}

function valoresCampoCotacao(cotacao: Cotacao, campoBase: string): number[] {
  const bruto = cotacao[campoBase as keyof Cotacao]
  if (bruto == null) return []
  if (campoBase === 'id') return [1]
  return [lerNumero(bruto)]
}

function valoresCampoProposta(proposta: PropostaBidFreteInternacional, campoBase: string): number[] {
  if (campoBase === 'id') return [1]
  const bruto = proposta[campoBase as keyof PropostaBidFreteInternacional]
  if (bruto == null) return []
  return [lerNumero(bruto)]
}

function agregarValores(valores: number[], tipoAgg: CardDefinicao['tipoAgg']): number {
  if (valores.length === 0) return 0
  const soma = valores.reduce((acc, v) => acc + v, 0)
  if (tipoAgg === 'Contagem') return valores.length
  if (tipoAgg === 'Média') return soma / valores.length
  return soma
}

/** Calcula métrica de card customizado a partir das cotações do período/filtro ativos. */
export function calcularMetricaCardCustom(
  def: CardDefinicao,
  cotacoes: Cotacao[],
): number {
  if (def.origem === 'Proposta') {
    const valores = cotacoes.flatMap(c =>
      (c.propostas_bid_frete_internacional ?? []).flatMap(p =>
        valoresCampoProposta(p, def.campoBase),
      ),
    )
    return agregarValores(valores, def.tipoAgg)
  }

  const valores = cotacoes.flatMap(c => valoresCampoCotacao(c, def.campoBase))
  return agregarValores(valores, def.tipoAgg)
}

export function formatarValorCardCustom(
  def: CardDefinicao,
  valor: number,
  fmtQuantidade: (n: number, casas?: number) => string,
): string {
  if (def.tipoAgg === 'Contagem') return String(Math.round(valor))
  const casas = def.campoBase.includes('valor') || def.campoBase.includes('ganho') ? 2 : 1
  if (
    def.campoBase.includes('valor')
    || def.campoBase.includes('ganho')
    || def.campoBase.includes('frete')
  ) {
    return `USD ${fmtQuantidade(valor, casas)}`
  }
  if (def.campoBase === 'tempo_medio_resposta') {
    return `${fmtQuantidade(valor, 1)} h`
  }
  return fmtQuantidade(valor, casas)
}
