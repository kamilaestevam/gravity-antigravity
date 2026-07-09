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
 * Propagáveis *_pedido que permanecem editáveis na linha ITEM — o par *_item
 * recebe valor próprio (ex.: referencia_importador_item / referencia_exportador_item).
 */
const PROPAGAVEIS_BLOQ_ITEM_EXCLUIDOS = [
  'referencia_importador_pedido',
  'referencia_exportador_pedido',
] as const

const PROPAGAVEIS_BLOQ_ITEM = [...CAMPOS_PEDIDO_PROPAGAVEIS].filter(
  (campo) => !(PROPAGAVEIS_BLOQ_ITEM_EXCLUIDOS as readonly string[]).includes(campo),
)

/**
 * Bloqueados em linhas ITEM — preencher só na linha PEDIDO pai.
 * P15.2: pares propagáveis *_pedido (exceto refs com coluna *_item dedicada).
 */
export const CAMPOS_BLOQ_PARA_ITEM: ReadonlySet<string> = new Set([
  'numero_pedido',
  ...AGREGADOS_PEDIDO_BLOQ_ITEM,
  ...PROPAGAVEIS_BLOQ_ITEM,
])

/**
 * Bloqueados em linhas PEDIDO — preencher só na linha ITEM (ou par *_pedido).
 * P15.1: colunas *_item da zona ESSENCIAL usam o par propagável *_pedido no master.
 * P15.3: ncm_item liberado na linha PEDIDO (NCM do pedido / master).
 */
export const CAMPOS_BLOQ_PARA_PEDIDO: ReadonlySet<string> = new Set([
  'sequencia_item_pedido',
  'part_number_item',
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

/** Mantém dropdown list ao bloquear — só formatação condicional preta. */
export function templateCampoPreservaSelectOuDropdown(campo: {
  dropdownDinamico?: string
  tipo?: string
  opcoesSelect?: readonly string[]
}): boolean {
  if (campo.dropdownDinamico) return true
  return campo.tipo === 'select' && !!campo.opcoesSelect?.length
}

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
