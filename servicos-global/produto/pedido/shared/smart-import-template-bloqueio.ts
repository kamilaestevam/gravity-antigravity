/**
 * smart-import-template-bloqueio.ts — SSOT bloqueio de células por tipo_linha (P15).
 *
 * Escopo: somente planilha modelo .xlsx (formatação condicional + data validation).
 * Não altera lista de pedidos, Prisma nem parser de importação.
 */

import { CAMPOS_PEDIDO_PROPAGAVEIS } from './mapaPropagacaoPedidoItem.js'

const AGREGADOS_PEDIDO_BLOQ_ITEM = [
  'valor_total_pedido',
  'quantidade_total_pedido',
  'quantidade_volumes_pedido',
  'valor_total_cambio_pedido',
] as const

/**
 * Bloqueados em linhas ITEM — preencher só na linha PEDIDO pai.
 * P15.2: pares propagáveis *_pedido (ex.: unidade_comercializada_pedido, tipo_volume_pedido).
 */
export const CAMPOS_BLOQ_PARA_ITEM: ReadonlySet<string> = new Set([
  'numero_pedido',
  ...AGREGADOS_PEDIDO_BLOQ_ITEM,
  ...CAMPOS_PEDIDO_PROPAGAVEIS,
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
 * Intocado no P15.2 — bloqueio visual da planilha apenas.
 */
export const CAMPOS_BLOQ_PARSER_PARA_ITEM: ReadonlySet<string> = new Set([
  'valor_total_pedido',
  'quantidade_total_pedido',
  'quantidade_volumes_pedido',
  'valor_total_cambio_pedido',
])
