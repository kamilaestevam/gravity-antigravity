import React from 'react'
import { ManualPedidoAccordionColunasLista } from './manual-pedido-accordion-colunas-lista'
import {
  GRUPOS_CATALOGO_COLUNAS_BID_FRETE_LISTA,
  TOTAL_COLUNAS_CATALOGO_BID_FRETE_LISTA,
  TOTAL_COLUNAS_PADRAO_LISTA_BID_FRETE,
} from './manual-bid-frete-catalogo-colunas-dados'

/** Manual BID Frete § Lista — catálogo nativo com regras de edição inline. */
export function ManualBidFreteTabelaCatalogoColunasLista() {
  return (
    <ManualPedidoAccordionColunasLista
      titulo="Colunas da Lista"
      badge={`${TOTAL_COLUNAS_CATALOGO_BID_FRETE_LISTA} colunas · ${TOTAL_COLUNAS_PADRAO_LISTA_BID_FRETE} no Padrão`}
      grupos={GRUPOS_CATALOGO_COLUNAS_BID_FRETE_LISTA}
      totalColunas={TOTAL_COLUNAS_CATALOGO_BID_FRETE_LISTA}
      abertoPorPadrao={false}
      accent="indigo"
      marginTop={12}
      mostrarEdicaoSimples
      prefixoNivelGrupo="Cotação"
      rodape={`${TOTAL_COLUNAS_PADRAO_LISTA_BID_FRETE} colunas abrem no painel Padrão. Em BIDs agrupados, edite na linha filha — a linha pai do pacote e as linhas de proposta do fornecedor não aceitam edição inline. Colunas personalizadas criadas em Configurações são editáveis exceto quando o tipo é fórmula.`}
    />
  )
}
