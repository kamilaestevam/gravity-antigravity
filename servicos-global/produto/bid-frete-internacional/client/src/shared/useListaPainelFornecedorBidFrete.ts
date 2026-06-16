/**
 * Painéis da lista — visão fornecedor (catálogo de colunas próprio, paridade lista cliente).
 */
import {
  COLUNAS_PADRAO_VISIVEIS_FORNECEDOR,
  STORAGE_PAINEL_ORDEM_COLUNAS_FORNECEDOR,
} from './lista-visao-fornecedor-preferencias-tabela'
import { ORDEM_COLUNAS_LISTA_FORNECEDOR_BID_FRETE_INTERNACIONAL } from './ordem-colunas-lista-fornecedor-bid-frete-internacional'
import { useListaPainelBidFrete, type OpcoesListaPainelBidFrete } from './useListaPainelBidFrete'

const OPCOES_LISTA_PAINEL_FORNECEDOR: OpcoesListaPainelBidFrete = {
  chavesCatalogoColunas: ORDEM_COLUNAS_LISTA_FORNECEDOR_BID_FRETE_INTERNACIONAL,
  colunasPadraoVisiveis: COLUNAS_PADRAO_VISIVEIS_FORNECEDOR,
  storagePainelOrdemColunas: STORAGE_PAINEL_ORDEM_COLUNAS_FORNECEDOR,
}

export function useListaPainelFornecedorBidFrete() {
  return useListaPainelBidFrete(OPCOES_LISTA_PAINEL_FORNECEDOR)
}
