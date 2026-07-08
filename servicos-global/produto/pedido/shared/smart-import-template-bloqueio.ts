/**
 * smart-import-template-bloqueio.ts — SSOT bloqueio de células por tipo_linha (P15).
 *
 * Template .xlsx: formatação condicional + data validation.
 * Parser (confirmar import): descarta campos do nível errado antes de gravar.
 */

/** Bloqueados em linhas ITEM — preencher só na linha PEDIDO pai. */
export const CAMPOS_BLOQ_PARA_ITEM: ReadonlySet<string> = new Set([
  'numero_pedido',
  'valor_total_pedido',
  'quantidade_total_pedido',
  'quantidade_volumes_pedido',
  'valor_total_cambio_pedido',
])

/**
 * Bloqueados em linhas PEDIDO — preencher só na linha ITEM (ou par *_pedido).
 * P15.1: colunas *_item da zona ESSENCIAL usam o par propagável *_pedido no master.
 */
export const CAMPOS_BLOQ_PARA_PEDIDO: ReadonlySet<string> = new Set([
  'sequencia_item_pedido',
  'part_number_item',
  'ncm_item',
  'descricao_item',
  'quantidade_inicial_item',
  'quantidade_atual_item',
  'quantidade_transferida_item',
  'quantidade_pronta_item',
  'quantidade_cancelada_item',
  'valor_por_unidade_item',
  'nome_exportador_item',
  'nome_importador_item',
  'nome_fabricante_item',
  'peso_liquido_unitario_item',
  'peso_bruto_unitario_item',
  'cubagem_unitaria_item',
  'data_embarque_item',
  'unidade_comercializada_item',
  'moeda_item',
  'valor_total_item',
  'incoterm_item',
])

/**
 * Parser na confirmação: agregados de pedido ignorados em linha ITEM.
 * numero_pedido fica de fora — vínculo vem da herança posicional (P15).
 */
export const CAMPOS_BLOQ_PARSER_PARA_ITEM: ReadonlySet<string> = new Set([
  'valor_total_pedido',
  'quantidade_total_pedido',
  'quantidade_volumes_pedido',
  'valor_total_cambio_pedido',
])
