import type { Cotacao, DisparoCotacaoBidFreteInternacional } from './types'
import {
  colunaKanbanFornecedorBidFrete,
  type StatusKanbanFornecedorBidFreteInternacional,
} from './kanban-fornecedor-bid-frete-internacional'

export type FunilPorCotacaoMap = Map<string, StatusKanbanFornecedorBidFreteInternacional>

export function cotacaoListaFromDisparoFornecedor(
  disparo: DisparoCotacaoBidFreteInternacional,
): Cotacao | null {
  const base = disparo.cotacao
  if (!base) return null

  const dataCriacao =
    (base as Cotacao).data_criacao_cotacao_bid_frete_internacional
    ?? disparo.data_criacao_disparo_cotacao_bid_frete_internacional
  const dataAtualizacao =
    (base as Cotacao).data_atualizacao_cotacao_bid_frete_internacional
    ?? disparo.data_atualizacao_disparo_cotacao_bid_frete_internacional

  const statusFunil = colunaKanbanFornecedorBidFrete(disparo)

  return {
    ...(base as Cotacao),
    id_organizacao: (base as Cotacao).id_organizacao ?? disparo.id_organizacao,
    id_usuario: (base as Cotacao).id_usuario ?? '',
    data_criacao_cotacao_bid_frete_internacional: dataCriacao,
    data_atualizacao_cotacao_bid_frete_internacional: dataAtualizacao,
    status_cotacao_bid_frete_internacional:
      statusFunil as unknown as Cotacao['status_cotacao_bid_frete_internacional'],
    propostas_bid_frete_internacional: disparo.proposta ? [disparo.proposta] : [],
    disparo_cotacao_bid_frete_internacional: [disparo],
  }
}

export function disparosParaListaFornecedor(disparos: DisparoCotacaoBidFreteInternacional[]): {
  cotacoes: Cotacao[]
  funilPorCotacaoId: FunilPorCotacaoMap
  disparoPorCotacaoId: Map<string, DisparoCotacaoBidFreteInternacional>
} {
  const cotacoes: Cotacao[] = []
  const funilPorCotacaoId: FunilPorCotacaoMap = new Map()
  const disparoPorCotacaoId = new Map<string, DisparoCotacaoBidFreteInternacional>()

  for (const disparo of disparos) {
    const cotacao = cotacaoListaFromDisparoFornecedor(disparo)
    if (!cotacao) continue
    cotacoes.push(cotacao)
    funilPorCotacaoId.set(
      cotacao.id_cotacao_bid_frete_internacional,
      colunaKanbanFornecedorBidFrete(disparo),
    )
    disparoPorCotacaoId.set(cotacao.id_cotacao_bid_frete_internacional, disparo)
  }

  return { cotacoes, funilPorCotacaoId, disparoPorCotacaoId }
}

export function navegarOportunidadeFornecedor(
  navigate: (path: string) => void,
  rotas: { responder: (id: string) => string; propostas: string },
  disparo: DisparoCotacaoBidFreteInternacional,
): void {
  const status = colunaKanbanFornecedorBidFrete(disparo)
  if (!disparo.proposta && status === 'AGUARDANDO_RESPOSTA') {
    navigate(rotas.responder(disparo.id_disparo_cotacao_bid_frete_internacional))
    return
  }
  navigate(rotas.propostas)
}
