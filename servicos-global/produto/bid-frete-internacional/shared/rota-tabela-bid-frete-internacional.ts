/**
 * SSOT — campos de rota da tabela de valor (paridade cotacao_bid_frete_internacional).
 * Reutiliza derivação de snapshot de rota-cotacao-bid-frete-internacional.ts.
 */
import {
  prepararCamposRotaCotacaoPersistencia,
  type CamposRotaModalCotacao,
  type ContextoCatalogoRota,
  type ModalRotaCotacao,
  type SnapshotRotaDerivado,
} from './rota-cotacao-bid-frete-internacional.js'

export type ModalRotaTabela = ModalRotaCotacao

export interface CamposRotaModalTabela {
  modal_tabela_bid_frete_internacional: ModalRotaTabela
  porto_origem_tabela_bid_frete_internacional?: string | null
  porto_destino_tabela_bid_frete_internacional?: string | null
  aeroporto_origem_tabela_bid_frete_internacional?: string | null
  aeroporto_destino_tabela_bid_frete_internacional?: string | null
  endereco_origem_tabela_bid_frete_internacional?: string | null
  endereco_destino_tabela_bid_frete_internacional?: string | null
  pais_origem_rodoviario_tabela_bid_frete_internacional?: string | null
  pais_destino_rodoviario_tabela_bid_frete_internacional?: string | null
  estado_provincia_origem_rodoviario_tabela_bid_frete_internacional?: string | null
  estado_provincia_destino_rodoviario_tabela_bid_frete_internacional?: string | null
  cidade_origem_rodoviario_tabela_bid_frete_internacional?: string | null
  cidade_destino_rodoviario_tabela_bid_frete_internacional?: string | null
  origem_codigo_tabela_bid_frete_internacional?: string | null
  origem_nome_tabela_bid_frete_internacional?: string | null
  origem_pais_tabela_bid_frete_internacional?: string | null
  destino_codigo_tabela_bid_frete_internacional?: string | null
  destino_nome_tabela_bid_frete_internacional?: string | null
  destino_pais_tabela_bid_frete_internacional?: string | null
}

export interface SnapshotRotaTabelaDerivado {
  origem_codigo_tabela_bid_frete_internacional: string
  origem_nome_tabela_bid_frete_internacional: string
  origem_pais_tabela_bid_frete_internacional: string
  destino_codigo_tabela_bid_frete_internacional: string
  destino_nome_tabela_bid_frete_internacional: string
  destino_pais_tabela_bid_frete_internacional: string
}

function tabelaParaCotacao(input: CamposRotaModalTabela): CamposRotaModalCotacao {
  return {
    modal_cotacao_bid_frete_internacional: input.modal_tabela_bid_frete_internacional,
    porto_origem_cotacao_bid_frete_internacional: input.porto_origem_tabela_bid_frete_internacional,
    porto_destino_cotacao_bid_frete_internacional: input.porto_destino_tabela_bid_frete_internacional,
    aeroporto_origem_cotacao_bid_frete_internacional: input.aeroporto_origem_tabela_bid_frete_internacional,
    aeroporto_destino_cotacao_bid_frete_internacional: input.aeroporto_destino_tabela_bid_frete_internacional,
    endereco_origem_cotacao_bid_frete_internacional: input.endereco_origem_tabela_bid_frete_internacional,
    endereco_destino_cotacao_bid_frete_internacional: input.endereco_destino_tabela_bid_frete_internacional,
    pais_origem_rodoviario_cotacao_bid_frete_internacional: input.pais_origem_rodoviario_tabela_bid_frete_internacional,
    pais_destino_rodoviario_cotacao_bid_frete_internacional: input.pais_destino_rodoviario_tabela_bid_frete_internacional,
    estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional:
      input.estado_provincia_origem_rodoviario_tabela_bid_frete_internacional,
    estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional:
      input.estado_provincia_destino_rodoviario_tabela_bid_frete_internacional,
    cidade_origem_rodoviario_cotacao_bid_frete_internacional: input.cidade_origem_rodoviario_tabela_bid_frete_internacional,
    cidade_destino_rodoviario_cotacao_bid_frete_internacional: input.cidade_destino_rodoviario_tabela_bid_frete_internacional,
    origem_codigo_cotacao_bid_frete_internacional: input.origem_codigo_tabela_bid_frete_internacional,
    origem_nome_cotacao_bid_frete_internacional: input.origem_nome_tabela_bid_frete_internacional,
    origem_pais_cotacao_bid_frete_internacional: input.origem_pais_tabela_bid_frete_internacional,
    destino_codigo_cotacao_bid_frete_internacional: input.destino_codigo_tabela_bid_frete_internacional,
    destino_nome_cotacao_bid_frete_internacional: input.destino_nome_tabela_bid_frete_internacional,
    destino_pais_cotacao_bid_frete_internacional: input.destino_pais_tabela_bid_frete_internacional,
  }
}

function snapshotCotacaoParaTabela(snapshot: SnapshotRotaDerivado): SnapshotRotaTabelaDerivado {
  return {
    origem_codigo_tabela_bid_frete_internacional: snapshot.origem_codigo_cotacao_bid_frete_internacional,
    origem_nome_tabela_bid_frete_internacional: snapshot.origem_nome_cotacao_bid_frete_internacional,
    origem_pais_tabela_bid_frete_internacional: snapshot.origem_pais_cotacao_bid_frete_internacional,
    destino_codigo_tabela_bid_frete_internacional: snapshot.destino_codigo_cotacao_bid_frete_internacional,
    destino_nome_tabela_bid_frete_internacional: snapshot.destino_nome_cotacao_bid_frete_internacional,
    destino_pais_tabela_bid_frete_internacional: snapshot.destino_pais_cotacao_bid_frete_internacional,
  }
}

function patchCanonicosCotacaoParaTabela(
  preparado: CamposRotaModalCotacao,
): Partial<CamposRotaModalTabela> {
  return {
    porto_origem_tabela_bid_frete_internacional: preparado.porto_origem_cotacao_bid_frete_internacional,
    porto_destino_tabela_bid_frete_internacional: preparado.porto_destino_cotacao_bid_frete_internacional,
    aeroporto_origem_tabela_bid_frete_internacional: preparado.aeroporto_origem_cotacao_bid_frete_internacional,
    aeroporto_destino_tabela_bid_frete_internacional: preparado.aeroporto_destino_cotacao_bid_frete_internacional,
    endereco_origem_tabela_bid_frete_internacional: preparado.endereco_origem_cotacao_bid_frete_internacional,
    endereco_destino_tabela_bid_frete_internacional: preparado.endereco_destino_cotacao_bid_frete_internacional,
    pais_origem_rodoviario_tabela_bid_frete_internacional:
      preparado.pais_origem_rodoviario_cotacao_bid_frete_internacional,
    pais_destino_rodoviario_tabela_bid_frete_internacional:
      preparado.pais_destino_rodoviario_cotacao_bid_frete_internacional,
    estado_provincia_origem_rodoviario_tabela_bid_frete_internacional:
      preparado.estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional,
    estado_provincia_destino_rodoviario_tabela_bid_frete_internacional:
      preparado.estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional,
    cidade_origem_rodoviario_tabela_bid_frete_internacional:
      preparado.cidade_origem_rodoviario_cotacao_bid_frete_internacional,
    cidade_destino_rodoviario_tabela_bid_frete_internacional:
      preparado.cidade_destino_rodoviario_cotacao_bid_frete_internacional,
  }
}

/** Deriva snapshot + normaliza campos canônicos antes de gravar tabela_bid_frete_internacional. */
export function prepararCamposRotaTabelaPersistencia<T extends CamposRotaModalTabela>(
  input: T,
  ctx: ContextoCatalogoRota = {},
): T & SnapshotRotaTabelaDerivado {
  const asCotacao = tabelaParaCotacao(input)
  const preparado = prepararCamposRotaCotacaoPersistencia(asCotacao, ctx)
  const snapshot = snapshotCotacaoParaTabela(preparado)
  return {
    ...input,
    ...patchCanonicosCotacaoParaTabela(preparado),
    ...snapshot,
  }
}
