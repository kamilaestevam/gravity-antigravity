/**
 * Snapshot e diff de proposta — rastreabilidade de alterações (fornecedor).
 */

export type CampoAlteracaoPropostaBidFreteInternacional =
  | 'valor_frete_proposta_bid_frete_internacional'
  | 'taxas_origem_proposta_bid_frete_internacional'
  | 'taxas_destino_proposta_bid_frete_internacional'
  | 'valor_total_proposta_bid_frete_internacional'
  | 'dias_transito_proposta_bid_frete_internacional'
  | 'moeda_proposta_bid_frete_internacional'

export interface SnapshotPropostaAlteracaoBidFreteInternacional {
  moeda_proposta_bid_frete_internacional: string
  valor_frete_proposta_bid_frete_internacional: number
  taxas_origem_proposta_bid_frete_internacional: number
  taxas_destino_proposta_bid_frete_internacional: number
  valor_total_proposta_bid_frete_internacional: number
  dias_transito_proposta_bid_frete_internacional: number
}

export interface ItemAlteracaoPropostaBidFreteInternacional {
  campo: CampoAlteracaoPropostaBidFreteInternacional
  rotulo: string
  valor_antes: number | string
  valor_depois: number | string
}

export const ROTULOS_CAMPO_ALTERACAO_PROPOSTA: Record<
  CampoAlteracaoPropostaBidFreteInternacional,
  string
> = {
  moeda_proposta_bid_frete_internacional: 'Moeda',
  valor_frete_proposta_bid_frete_internacional: 'Frete base',
  taxas_origem_proposta_bid_frete_internacional: 'Taxas origem',
  taxas_destino_proposta_bid_frete_internacional: 'Taxas destino',
  valor_total_proposta_bid_frete_internacional: 'Valor total',
  dias_transito_proposta_bid_frete_internacional: 'Transit time (dias)',
}

const CAMPOS_NUMERICOS: CampoAlteracaoPropostaBidFreteInternacional[] = [
  'valor_frete_proposta_bid_frete_internacional',
  'taxas_origem_proposta_bid_frete_internacional',
  'taxas_destino_proposta_bid_frete_internacional',
  'valor_total_proposta_bid_frete_internacional',
  'dias_transito_proposta_bid_frete_internacional',
]

function num(val: unknown): number {
  const n = Number(val)
  return Number.isFinite(n) ? n : 0
}

export function extrairSnapshotPropostaAlteracao(
  proposta: Record<string, unknown>,
): SnapshotPropostaAlteracaoBidFreteInternacional {
  return {
    moeda_proposta_bid_frete_internacional: String(
      proposta.moeda_proposta_bid_frete_internacional ?? 'USD',
    ).trim() || 'USD',
    valor_frete_proposta_bid_frete_internacional: num(
      proposta.valor_frete_proposta_bid_frete_internacional,
    ),
    taxas_origem_proposta_bid_frete_internacional: num(
      proposta.taxas_origem_proposta_bid_frete_internacional,
    ),
    taxas_destino_proposta_bid_frete_internacional: num(
      proposta.taxas_destino_proposta_bid_frete_internacional,
    ),
    valor_total_proposta_bid_frete_internacional: num(
      proposta.valor_total_proposta_bid_frete_internacional,
    ),
    dias_transito_proposta_bid_frete_internacional: num(
      proposta.dias_transito_proposta_bid_frete_internacional,
    ),
  }
}

function valoresIguais(a: number | string, b: number | string): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 0.0001
  }
  return String(a) === String(b)
}

export function calcularAlteracoesSnapshotProposta(
  antes: SnapshotPropostaAlteracaoBidFreteInternacional,
  depois: SnapshotPropostaAlteracaoBidFreteInternacional,
): ItemAlteracaoPropostaBidFreteInternacional[] {
  const alteracoes: ItemAlteracaoPropostaBidFreteInternacional[] = []

  const moedaAntes = antes.moeda_proposta_bid_frete_internacional
  const moedaDepois = depois.moeda_proposta_bid_frete_internacional
  if (moedaAntes !== moedaDepois) {
    alteracoes.push({
      campo: 'moeda_proposta_bid_frete_internacional',
      rotulo: ROTULOS_CAMPO_ALTERACAO_PROPOSTA.moeda_proposta_bid_frete_internacional,
      valor_antes: moedaAntes,
      valor_depois: moedaDepois,
    })
  }

  for (const campo of CAMPOS_NUMERICOS) {
    const valorAntes = antes[campo]
    const valorDepois = depois[campo]
    if (!valoresIguais(valorAntes, valorDepois)) {
      alteracoes.push({
        campo,
        rotulo: ROTULOS_CAMPO_ALTERACAO_PROPOSTA[campo],
        valor_antes: valorAntes,
        valor_depois: valorDepois,
      })
    }
  }

  return alteracoes
}

export function formatarValorAlteracaoProposta(
  campo: CampoAlteracaoPropostaBidFreteInternacional,
  valor: number | string,
  moeda: string,
): string {
  if (campo === 'moeda_proposta_bid_frete_internacional') {
    return String(valor)
  }
  if (campo === 'dias_transito_proposta_bid_frete_internacional') {
    return `${valor} dias`
  }
  const n = num(valor)
  return `${moeda} ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function montarLinhasTextoAlteracaoProposta(
  alteracoes: ItemAlteracaoPropostaBidFreteInternacional[],
  moedaDepois: string,
): string[] {
  return alteracoes.map(item => {
    const antes = formatarValorAlteracaoProposta(item.campo, item.valor_antes, moedaDepois)
    const depois = formatarValorAlteracaoProposta(item.campo, item.valor_depois, moedaDepois)
    return `${item.rotulo}: ${antes} → ${depois}`
  })
}
