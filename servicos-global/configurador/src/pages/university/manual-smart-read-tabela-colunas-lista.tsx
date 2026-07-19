import React from 'react'
import { ManualPedidoAccordionColunasLista } from './manual-pedido-accordion-colunas-lista'
import {
  GRUPOS_CATALOGO_COLUNAS_SMART_READ,
  TOTAL_COLUNAS_CATALOGO_SMART_READ,
  TOTAL_COLUNAS_DOCUMENTO_SMART_READ,
  TOTAL_COLUNAS_LEITURA_SMART_READ,
} from './manual-smart-read-catalogo-colunas-dados'

export function ManualSmartReadTabelaCatalogoColunasLista() {
  return (
    <ManualPedidoAccordionColunasLista
      titulo="Colunas nativas da Lista"
      badge={`${TOTAL_COLUNAS_CATALOGO_SMART_READ} colunas`}
      grupos={GRUPOS_CATALOGO_COLUNAS_SMART_READ}
      totalColunas={TOTAL_COLUNAS_CATALOGO_SMART_READ}
      abertoPorPadrao={false}
      accent="indigo"
      marginTop={20}
      mostrarEdicaoSimples
      rodape={`${TOTAL_COLUNAS_LEITURA_SMART_READ} colunas na linha mãe (leitura) · ${TOTAL_COLUNAS_DOCUMENTO_SMART_READ} na linha filha (documento). A Lista não permite edição inline: o nome da leitura abre o fluxo (Link). Colunas customizadas seguem regras próprias em Configurações.`}
    />
  )
}
