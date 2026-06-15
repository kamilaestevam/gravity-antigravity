import type { CSSProperties } from 'react'

/** Altura calibrada do bloco da tabela na Lista (cliente + fornecedor). */
export const ALTURA_TABELA_LISTA_BID_FRETE_PX = 620

export const estiloWrapperTabelaListaBidFreteInternacional: CSSProperties = {
  flex: `0 0 ${ALTURA_TABELA_LISTA_BID_FRETE_PX}px`,
  height: ALTURA_TABELA_LISTA_BID_FRETE_PX,
  minHeight: ALTURA_TABELA_LISTA_BID_FRETE_PX,
}

export const estiloChromeTabelaListaBidFreteInternacional: CSSProperties = {
  flex: 1,
  minHeight: 0,
}
