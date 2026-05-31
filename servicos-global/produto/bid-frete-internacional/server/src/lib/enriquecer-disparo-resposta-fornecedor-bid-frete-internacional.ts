import {
  obterMapaNomesWorkspacePorIds,
  resolverNomeClienteOperacaoCotacaoResposta,
} from './resolver-nome-cliente-cotacao-resposta-bid-frete-internacional.js'

type DisparoComCotacao = {
  cotacao?: {
    id_workspace?: string | null
    anonima_cotacao_bid_frete_internacional?: boolean | null
    nome_cliente_operacao_cotacao_bid_frete_internacional?: string | null
    [key: string]: unknown
  } | null
  [key: string]: unknown
}

export const COTACAO_SELECT_RESPOSTA_FORNECEDOR = {
  id_cotacao_bid_frete_internacional: true,
  numero_cotacao_bid_frete_internacional: true,
  tipo_operacao_cotacao_bid_frete_internacional: true,
  id_workspace: true,
  modal_cotacao_bid_frete_internacional: true,
  modalidade_cotacao_bid_frete_internacional: true,
  origem_nome_cotacao_bid_frete_internacional: true,
  origem_pais_cotacao_bid_frete_internacional: true,
  destino_nome_cotacao_bid_frete_internacional: true,
  destino_pais_cotacao_bid_frete_internacional: true,
  descricao_mercadoria_cotacao_bid_frete_internacional: true,
  ncm_cotacao_bid_frete_internacional: true,
  incoterm_cotacao_bid_frete_internacional: true,
  quantidade_cotacao_bid_frete_internacional: true,
  tipo_container_cotacao_bid_frete_internacional: true,
  peso_kg_cotacao_bid_frete_internacional: true,
  cubagem_m3_cotacao_bid_frete_internacional: true,
  data_limite_resposta_cotacao_bid_frete_internacional: true,
  anonima_cotacao_bid_frete_internacional: true,
  status_cotacao_bid_frete_internacional: true,
} as const

function enriquecerCotacaoComMapa(
  cotacao: NonNullable<DisparoComCotacao['cotacao']>,
  mapaNomesWorkspace: Map<string, string>,
) {
  const nomeCliente = resolverNomeClienteOperacaoCotacaoResposta({
    id_workspace: cotacao.id_workspace,
    anonima_cotacao_bid_frete_internacional: cotacao.anonima_cotacao_bid_frete_internacional,
    mapaNomesWorkspace,
  })
  return {
    ...cotacao,
    nome_cliente_operacao_cotacao_bid_frete_internacional: nomeCliente,
  }
}

export async function enriquecerDisparoRespostaFornecedor<T extends DisparoComCotacao>(
  disparo: T,
): Promise<T> {
  if (!disparo.cotacao) return disparo
  const mapa = await obterMapaNomesWorkspacePorIds(
    disparo.cotacao.id_workspace ? [disparo.cotacao.id_workspace] : [],
  )
  return {
    ...disparo,
    cotacao: enriquecerCotacaoComMapa(disparo.cotacao, mapa),
  }
}

export async function enriquecerDisparosRespostaFornecedor<T extends DisparoComCotacao>(
  disparos: T[],
): Promise<T[]> {
  const idsWorkspace = disparos
    .map((d) => d.cotacao?.id_workspace)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
  const mapa = await obterMapaNomesWorkspacePorIds(idsWorkspace)

  return disparos.map((disparo) => {
    if (!disparo.cotacao) return disparo
    return {
      ...disparo,
      cotacao: enriquecerCotacaoComMapa(disparo.cotacao, mapa),
    }
  })
}
