/**
 * Monta payload POST /cotacoes a partir de linha importada — paridade validação + wizard.
 */
import {
  resolverCodigoDestinoImportacao,
  resolverCodigoOrigemImportacao,
} from './campos-importacao-bid-frete-internacional'
import { extrairCodigoDeRotuloImportacao } from './rotulo-cadastro-importacao-bid-frete-internacional'
import {
  prepararCamposRotaCotacaoPersistencia,
  type CamposRotaModalCotacao,
  type ContextoCatalogoRota,
  type ModalRotaCotacao,
} from './rota-cotacao-bid-frete-internacional'
import { resolverModalidadeImportacaoBidFreteInternacional, type ModalidadeCargaImportacaoBid } from './resolver-modalidade-importacao-bid-frete-internacional'
import type { LinhaImportacaoBidFreteInternacional } from './tipos-importacao-bid-frete-internacional'

function trim(val: string | undefined | null): string {
  return (val ?? '').trim()
}

export function linhaImportacaoParaCamposRotaModal(
  row: LinhaImportacaoBidFreteInternacional,
): CamposRotaModalCotacao {
  const modal = trim(row.modal_cotacao_bid_frete_internacional).toUpperCase() as ModalRotaCotacao

  return {
    modal_cotacao_bid_frete_internacional: modal,
    porto_origem_cotacao_bid_frete_internacional: extrairCodigoDeRotuloImportacao(
      row.porto_origem_cotacao_bid_frete_internacional,
    ),
    porto_destino_cotacao_bid_frete_internacional: extrairCodigoDeRotuloImportacao(
      row.porto_destino_cotacao_bid_frete_internacional,
    ),
    aeroporto_origem_cotacao_bid_frete_internacional: extrairCodigoDeRotuloImportacao(
      row.aeroporto_origem_cotacao_bid_frete_internacional,
    ),
    aeroporto_destino_cotacao_bid_frete_internacional: extrairCodigoDeRotuloImportacao(
      row.aeroporto_destino_cotacao_bid_frete_internacional,
    ),
    pais_origem_rodoviario_cotacao_bid_frete_internacional: trim(row.origem_pais_cotacao_bid_frete_internacional),
    pais_destino_rodoviario_cotacao_bid_frete_internacional: trim(row.destino_pais_cotacao_bid_frete_internacional),
    cidade_origem_rodoviario_cotacao_bid_frete_internacional:
      trim(row.endereco_origem_cotacao_bid_frete_internacional)
      || trim(row.origem_nome_cotacao_bid_frete_internacional),
    cidade_destino_rodoviario_cotacao_bid_frete_internacional:
      trim(row.endereco_destino_cotacao_bid_frete_internacional)
      || trim(row.destino_nome_cotacao_bid_frete_internacional),
    origem_codigo_cotacao_bid_frete_internacional: resolverCodigoOrigemImportacao(row),
    origem_nome_cotacao_bid_frete_internacional:
      trim(row.origem_nome_cotacao_bid_frete_internacional) || resolverCodigoOrigemImportacao(row),
    origem_pais_cotacao_bid_frete_internacional: trim(row.origem_pais_cotacao_bid_frete_internacional),
    destino_codigo_cotacao_bid_frete_internacional: resolverCodigoDestinoImportacao(row),
    destino_nome_cotacao_bid_frete_internacional:
      trim(row.destino_nome_cotacao_bid_frete_internacional) || resolverCodigoDestinoImportacao(row),
    destino_pais_cotacao_bid_frete_internacional: trim(row.destino_pais_cotacao_bid_frete_internacional),
  }
}

export interface PayloadCriacaoCotacaoImportacaoBidFreteInternacional {
  id_bid_bid_frete_internacional?: string
  tipo_operacao_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: ModalRotaCotacao
  modalidade_cotacao_bid_frete_internacional: ModalidadeCargaImportacaoBid | ''
  porto_origem_cotacao_bid_frete_internacional?: string
  porto_destino_cotacao_bid_frete_internacional?: string
  aeroporto_origem_cotacao_bid_frete_internacional?: string
  aeroporto_destino_cotacao_bid_frete_internacional?: string
  pais_origem_rodoviario_cotacao_bid_frete_internacional?: string
  pais_destino_rodoviario_cotacao_bid_frete_internacional?: string
  cidade_origem_rodoviario_cotacao_bid_frete_internacional?: string
  cidade_destino_rodoviario_cotacao_bid_frete_internacional?: string
  origem_codigo_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  origem_pais_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  destino_pais_cotacao_bid_frete_internacional: string
  descricao_mercadoria_cotacao_bid_frete_internacional: string
  incoterm_cotacao_bid_frete_internacional: string
  quantidade_volume_cotacao_bid_frete_internacional: number
  ncm_cotacao_bid_frete_internacional: string | null
}

export function montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional(
  row: LinhaImportacaoBidFreteInternacional,
  idBid?: string,
  ctx: ContextoCatalogoRota = {},
): PayloadCriacaoCotacaoImportacaoBidFreteInternacional {
  const camposRota = linhaImportacaoParaCamposRotaModal(row)
  const rota = prepararCamposRotaCotacaoPersistencia(camposRota, ctx)
  const modalidade = resolverModalidadeImportacaoBidFreteInternacional(row)

  return {
    ...(idBid ? { id_bid_bid_frete_internacional: idBid } : {}),
    tipo_operacao_cotacao_bid_frete_internacional: trim(row.tipo_operacao_cotacao_bid_frete_internacional).toUpperCase(),
    modal_cotacao_bid_frete_internacional: rota.modal_cotacao_bid_frete_internacional,
    modalidade_cotacao_bid_frete_internacional: modalidade ?? '',
    porto_origem_cotacao_bid_frete_internacional: trim(rota.porto_origem_cotacao_bid_frete_internacional) || undefined,
    porto_destino_cotacao_bid_frete_internacional: trim(rota.porto_destino_cotacao_bid_frete_internacional) || undefined,
    aeroporto_origem_cotacao_bid_frete_internacional: trim(rota.aeroporto_origem_cotacao_bid_frete_internacional) || undefined,
    aeroporto_destino_cotacao_bid_frete_internacional: trim(rota.aeroporto_destino_cotacao_bid_frete_internacional) || undefined,
    pais_origem_rodoviario_cotacao_bid_frete_internacional: trim(rota.pais_origem_rodoviario_cotacao_bid_frete_internacional) || undefined,
    pais_destino_rodoviario_cotacao_bid_frete_internacional: trim(rota.pais_destino_rodoviario_cotacao_bid_frete_internacional) || undefined,
    cidade_origem_rodoviario_cotacao_bid_frete_internacional: trim(rota.cidade_origem_rodoviario_cotacao_bid_frete_internacional) || undefined,
    cidade_destino_rodoviario_cotacao_bid_frete_internacional: trim(rota.cidade_destino_rodoviario_cotacao_bid_frete_internacional) || undefined,
    origem_codigo_cotacao_bid_frete_internacional: rota.origem_codigo_cotacao_bid_frete_internacional,
    origem_nome_cotacao_bid_frete_internacional: rota.origem_nome_cotacao_bid_frete_internacional,
    origem_pais_cotacao_bid_frete_internacional: rota.origem_pais_cotacao_bid_frete_internacional,
    destino_codigo_cotacao_bid_frete_internacional: rota.destino_codigo_cotacao_bid_frete_internacional,
    destino_nome_cotacao_bid_frete_internacional: rota.destino_nome_cotacao_bid_frete_internacional,
    destino_pais_cotacao_bid_frete_internacional: rota.destino_pais_cotacao_bid_frete_internacional,
    descricao_mercadoria_cotacao_bid_frete_internacional: trim(row.descricao_mercadoria_cotacao_bid_frete_internacional),
    incoterm_cotacao_bid_frete_internacional: trim(row.incoterm_cotacao_bid_frete_internacional).toUpperCase(),
    quantidade_volume_cotacao_bid_frete_internacional: Number(row.quantidade_volume_cotacao_bid_frete_internacional),
    ncm_cotacao_bid_frete_internacional: trim(row.ncm_cotacao_bid_frete_internacional) || null,
  }
}
