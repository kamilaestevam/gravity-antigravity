import type { CSSProperties } from 'react'

/**
 * Altura do bloco da tabela na Lista (cliente + fornecedor) — paridade Pedido:
 * o wrapper estica até o fim da viewport (flex: 1) e a grade rola internamente.
 * O pino legado de 620px (TASK-000419) deixava faixa vazia abaixo da tabela.
 */
export const estiloWrapperTabelaListaBidFreteInternacional: CSSProperties = {
  flex: 1,
  minHeight: 0,
}

export const estiloChromeTabelaListaBidFreteInternacional: CSSProperties = {
  flex: 1,
  minHeight: 0,
}
