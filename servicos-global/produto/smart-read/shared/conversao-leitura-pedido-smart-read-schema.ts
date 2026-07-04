/**
 * Contrato bilateral Smart Read → Pedido (REGRA 09).
 * Consumido pelo BFF Smart Read e pelo server Pedido.
 */
import { z } from 'zod'

export const StatusMapeamentoCampoSmartReadPedidoEnum = z.enum([
  'mapeado',
  'pendente',
  'rejeitado',
  'ignorado',
])
export type StatusMapeamentoCampoSmartReadPedido = z.infer<
  typeof StatusMapeamentoCampoSmartReadPedidoEnum
>

export const DetalheMapeamentoCampoSmartReadPedidoSchema = z.object({
  caminho_origem: z.string(),
  campo_destino: z.string().nullable(),
  valor_origem: z.unknown(),
  valor_destino: z.unknown(),
  status_mapeamento: StatusMapeamentoCampoSmartReadPedidoEnum,
  motivo: z.string().nullable().optional(),
})
export type DetalheMapeamentoCampoSmartReadPedido = z.infer<
  typeof DetalheMapeamentoCampoSmartReadPedidoSchema
>

export const DetalheMapeamentoSmartReadPedidoSchema = z.object({
  campos: z.array(DetalheMapeamentoCampoSmartReadPedidoSchema),
  versao_contrato: z.literal(1),
})
export type DetalheMapeamentoSmartReadPedido = z.infer<
  typeof DetalheMapeamentoSmartReadPedidoSchema
>

export const CriarPedidoDeLeituraSmartReadRequestSchema = z.object({
  id_leitura: z.string().min(1),
  id_snapshot_leitura_smart_read: z.string().min(1).optional(),
})
export type CriarPedidoDeLeituraSmartReadRequest = z.infer<
  typeof CriarPedidoDeLeituraSmartReadRequestSchema
>

export const PedidoCriadoSmartReadResumoSchema = z.object({
  id_pedido: z.string(),
  numero_pedido: z.string(),
  ids_itens: z.array(z.string()),
})
export type PedidoCriadoSmartReadResumo = z.infer<typeof PedidoCriadoSmartReadResumoSchema>

export const CriarPedidoDeLeituraSmartReadRespostaSchema = z.object({
  id_pedido: z.string(),
  numero_pedido: z.string(),
  ids_itens: z.array(z.string()),
  id_leitura: z.string(),
  id_snapshot_leitura_smart_read: z.string().nullable(),
  detalhe_mapeamento: DetalheMapeamentoSmartReadPedidoSchema,
  pedidos_criados: z.array(PedidoCriadoSmartReadResumoSchema).optional(),
})
export type CriarPedidoDeLeituraSmartReadResposta = z.infer<
  typeof CriarPedidoDeLeituraSmartReadRespostaSchema
>

export const PersistirConversaoLeituraPedidoSmartReadSchema = z.object({
  id_leitura_legado: z.string().min(1),
  id_snapshot_leitura_smart_read: z.string().min(1).nullable(),
  id_pedido: z.string().min(1),
  ids_pedido_item: z.array(z.string()),
  status_conversao: z.enum(['sucesso', 'parcial', 'falha']),
  detalhe_mapeamento: DetalheMapeamentoSmartReadPedidoSchema,
})
export type PersistirConversaoLeituraPedidoSmartRead = z.infer<
  typeof PersistirConversaoLeituraPedidoSmartReadSchema
>
