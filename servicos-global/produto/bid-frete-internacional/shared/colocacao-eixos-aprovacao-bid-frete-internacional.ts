/**
 * Colocação por eixo — SSOT server-side para e-mail de resultado da aprovação.
 * Paridade com grade-colocacao-eixos-combate (client).
 */

export interface PropostaColocacaoEmailBidFreteInternacional {
  id_proposta_bid_frete_internacional: string
  fornecedor_nome: string
  valor_total_proposta_bid_frete_internacional: number
  valor_frete_proposta_bid_frete_internacional: number
  taxas_origem_proposta_bid_frete_internacional: number
  taxas_destino_proposta_bid_frete_internacional: number
  moeda_proposta_bid_frete_internacional: string
  dias_transito_proposta_bid_frete_internacional: number
  dias_prazo_pagamento_proposta_bid_frete_internacional?: number | null
  quantidade_escala_proposta_bid_frete_internacional: number
  quantidade_transbordo_proposta_bid_frete_internacional: number
  ranking_geral: number
}

export interface EixoColocacaoEmailBidFreteInternacional {
  id: 'frete_total' | 'transit_time' | 'rota' | 'prazo_pagamento'
  rotulo: string
  valorExibicao: string
  rank: number
  melhor: boolean
}

const fmtNumero = (n: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

export function formatarMoedaColocacaoEmailBidFrete(valor: number, moeda: string): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: moeda,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor)
  } catch {
    return `${moeda} ${fmtNumero(valor)}`
  }
}

export function derivarQuantidadeEscalaPropostaColocacaoEmail(row: {
  quantidade_escala_proposta_bid_frete_internacional?: number | null
  escalas_proposta_bid_frete_internacional?: string | null
}): number {
  const explicito = row.quantidade_escala_proposta_bid_frete_internacional
  if (explicito != null && Number.isFinite(Number(explicito))) return Number(explicito)
  const escalasRaw = row.escalas_proposta_bid_frete_internacional
  if (typeof escalasRaw === 'string' && /^\d+$/.test(escalasRaw.trim())) {
    return Number(escalasRaw.trim())
  }
  return 0
}

function rankPropostaPorValor(
  propostas: PropostaColocacaoEmailBidFreteInternacional[],
  idProposta: string,
  valorDe: (p: PropostaColocacaoEmailBidFreteInternacional) => number,
): number {
  const ordenado = [...propostas].sort((a, b) => valorDe(a) - valorDe(b))
  const idx = ordenado.findIndex((p) => p.id_proposta_bid_frete_internacional === idProposta)
  return idx >= 0 ? idx + 1 : ordenado.length
}

function rankPropostaComValorDefinido(
  propostas: PropostaColocacaoEmailBidFreteInternacional[],
  idProposta: string,
  valorDe: (p: PropostaColocacaoEmailBidFreteInternacional) => number | null | undefined,
  melhorMenor: boolean,
): { rank: number; disponivel: boolean } {
  const comValor = propostas.filter((p) => {
    const v = valorDe(p)
    return v != null && Number.isFinite(v)
  })
  if (comValor.length === 0) return { rank: 0, disponivel: false }
  const ordenado = [...comValor].sort((a, b) => {
    const va = valorDe(a) as number
    const vb = valorDe(b) as number
    return melhorMenor ? va - vb : vb - va
  })
  const idx = ordenado.findIndex((p) => p.id_proposta_bid_frete_internacional === idProposta)
  return { rank: idx >= 0 ? idx + 1 : ordenado.length, disponivel: idx >= 0 }
}

function rankPropostaRota(
  propostas: PropostaColocacaoEmailBidFreteInternacional[],
  idProposta: string,
): number {
  const ordenado = [...propostas].sort((a, b) => {
    const escA = a.quantidade_escala_proposta_bid_frete_internacional
    const escB = b.quantidade_escala_proposta_bid_frete_internacional
    const trA = a.quantidade_transbordo_proposta_bid_frete_internacional
    const trB = b.quantidade_transbordo_proposta_bid_frete_internacional
    if (escA !== escB) return escA - escB
    return trA - trB
  })
  const idx = ordenado.findIndex((p) => p.id_proposta_bid_frete_internacional === idProposta)
  return idx >= 0 ? idx + 1 : ordenado.length
}

export function formatarValorRotaColocacaoEmail(
  proposta: Pick<
    PropostaColocacaoEmailBidFreteInternacional,
    'quantidade_escala_proposta_bid_frete_internacional' | 'quantidade_transbordo_proposta_bid_frete_internacional'
  >,
): string {
  const escalas = proposta.quantidade_escala_proposta_bid_frete_internacional
  const transbordos = proposta.quantidade_transbordo_proposta_bid_frete_internacional
  if (escalas === 0 && transbordos === 0) return 'Direto'
  const partes: string[] = []
  if (escalas > 0) partes.push(`${escalas} escala(s)`)
  if (transbordos > 0) partes.push(`${transbordos} transbordo(s)`)
  return partes.join(' · ')
}

function fmtDias(dias: number): string {
  return `${dias} dia${dias === 1 ? '' : 's'}`
}

export function montarEixosColocacaoEmailAprovacaoBidFrete(
  propostas: PropostaColocacaoEmailBidFreteInternacional[],
  idProposta: string,
): EixoColocacaoEmailBidFreteInternacional[] {
  const proposta = propostas.find((p) => p.id_proposta_bid_frete_internacional === idProposta)
  if (!proposta) return []

  const rankFrete = rankPropostaPorValor(
    propostas,
    idProposta,
    (p) => p.valor_total_proposta_bid_frete_internacional,
  )
  const rankTransit = rankPropostaPorValor(
    propostas,
    idProposta,
    (p) => p.dias_transito_proposta_bid_frete_internacional,
  )
  const rankRota = rankPropostaRota(propostas, idProposta)
  const rankPrazo = rankPropostaComValorDefinido(
    propostas,
    idProposta,
    (p) => p.dias_prazo_pagamento_proposta_bid_frete_internacional,
    false,
  )

  const prazoDias = proposta.dias_prazo_pagamento_proposta_bid_frete_internacional
  const moeda = proposta.moeda_proposta_bid_frete_internacional || 'USD'

  return [
    {
      id: 'frete_total',
      rotulo: 'Frete total',
      valorExibicao: formatarMoedaColocacaoEmailBidFrete(
        proposta.valor_total_proposta_bid_frete_internacional,
        moeda,
      ),
      rank: rankFrete,
      melhor: rankFrete === 1,
    },
    {
      id: 'transit_time',
      rotulo: 'Transit time',
      valorExibicao: fmtDias(proposta.dias_transito_proposta_bid_frete_internacional),
      rank: rankTransit,
      melhor: rankTransit === 1,
    },
    {
      id: 'rota',
      rotulo: 'Escala / transbordo',
      valorExibicao: formatarValorRotaColocacaoEmail(proposta),
      rank: rankRota,
      melhor: rankRota === 1,
    },
    {
      id: 'prazo_pagamento',
      rotulo: 'Prazo pagamento',
      valorExibicao: prazoDias != null ? fmtDias(prazoDias) : '—',
      rank: rankPrazo.rank,
      melhor: rankPrazo.disponivel && rankPrazo.rank === 1,
    },
  ]
}

export function montarBlocoValorTotalFreteColocacaoEmail(
  proposta: PropostaColocacaoEmailBidFreteInternacional,
): {
  freteBase: string
  taxasOrigem: string
  taxasDestino: string
  valorTotal: string
} {
  const moeda = proposta.moeda_proposta_bid_frete_internacional || 'USD'
  const fmt = (v: number) => formatarMoedaColocacaoEmailBidFrete(v, moeda)
  const taxasOrigem =
    proposta.taxas_origem_proposta_bid_frete_internacional > 0
      ? fmt(proposta.taxas_origem_proposta_bid_frete_internacional)
      : '—'
  const taxasDestino =
    proposta.taxas_destino_proposta_bid_frete_internacional > 0
      ? fmt(proposta.taxas_destino_proposta_bid_frete_internacional)
      : '—'
  return {
    freteBase: fmt(proposta.valor_frete_proposta_bid_frete_internacional),
    taxasOrigem,
    taxasDestino,
    valorTotal: fmt(proposta.valor_total_proposta_bid_frete_internacional),
  }
}

export function rotuloOrdinalColocacaoEmail(rank: number): string {
  return `${rank}º`
}
