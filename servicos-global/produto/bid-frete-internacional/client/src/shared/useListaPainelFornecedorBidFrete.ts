/**
 * Painéis da lista — visão fornecedor (catálogo de colunas próprio, paridade lista cliente).
 */
import {
  CHAVES_COLUNAS_LISTA_FORNECEDOR,
} from '../pages/visao-fornecedor-bid-frete-internacional/colunas-lista-visao-fornecedor-bid-frete-internacional'
import {
  COLUNAS_PADRAO_VISIVEIS_FORNECEDOR,
  STORAGE_PAINEL_ORDEM_COLUNAS_FORNECEDOR,
} from './lista-visao-fornecedor-preferencias-tabela'
import { useListaPainelBidFrete, type OpcoesListaPainelBidFrete } from './useListaPainelBidFrete'

const OPCOES_LISTA_PAINEL_FORNECEDOR: OpcoesListaPainelBidFrete = {
  chavesCatalogoColunas: CHAVES_COLUNAS_LISTA_FORNECEDOR,
  colunasPadraoVisiveis: COLUNAS_PADRAO_VISIVEIS_FORNECEDOR,
  storagePainelOrdemColunas: STORAGE_PAINEL_ORDEM_COLUNAS_FORNECEDOR,
}

export function useListaPainelFornecedorBidFrete() {
  return useListaPainelBidFrete(OPCOES_LISTA_PAINEL_FORNECEDOR)
}
