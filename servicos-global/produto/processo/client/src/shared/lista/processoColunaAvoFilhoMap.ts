/**
 * processoColunaAvoFilhoMap.ts — Colunas do cabeçalho (processo) mapeadas para pedido/item.
 *
 * A lista usa um único cabeçalho: colunas avô + pedido. Nas linhas L2/L3 o slot da
 * coluna avô deve mostrar o campo equivalente do pedido ou item, não "—".
 */

/** Coluna avô → campo pedido (L2) */
export const COLUNA_AVO_PARA_CAMPO_PEDIDO: Record<string, string> = {
  numero_processo: 'numero_pedido',
  tipo_operacao_processo: 'tipo_operacao',
  status_processo: 'status',
  referencia_interna_processo: 'referencia_importador',
  valor_total_agregado: 'valor_total_pedido',
  peso_bruto_agregado: 'peso_bruto_total_pedido',
  data_criacao_processo: 'data_emissao_pedido',
}

/** Coluna avô → campo item (L3); ausente = célula vazia no item */
export const COLUNA_AVO_PARA_CAMPO_ITEM: Record<string, string> = {
  numero_processo: 'part_number',
  referencia_interna_processo: 'referencia_importador',
  valor_total_agregado: 'valor_total_item',
  peso_bruto_agregado: 'peso_bruto_unitario',
  data_criacao_processo: 'data_emissao_pedido',
}

/** Colunas avô que permanecem vazias em pedido/item */
export const COLUNAS_AVO_VAZIAS_EM_FILHO = new Set([
  'responsavel_processo',
])

export function campoPedidoParaColunaAvo(campoPedido: string): string | null {
  for (const [avo, pedido] of Object.entries(COLUNA_AVO_PARA_CAMPO_PEDIDO)) {
    if (pedido === campoPedido) return avo
  }
  return null
}

/**
 * Resolve campo de edição quando a TVG envia a chave da coluna avô (cabeçalho unificado).
 */
export function resolverCampoEdicaoFilho(
  colunaOuCampo: string,
  camada: 'pedido' | 'item',
): string {
  if (camada === 'pedido') {
    return COLUNA_AVO_PARA_CAMPO_PEDIDO[colunaOuCampo] ?? colunaOuCampo
  }
  return COLUNA_AVO_PARA_CAMPO_ITEM[colunaOuCampo] ?? colunaOuCampo
}
