/**
 * Persiste linhagem DE/PARA leitura → pedido no banco Smart Read.
 */
import type { PrismaClient } from '../generated/client/index.js'
import {
  PersistirConversaoLeituraPedidoSmartReadSchema,
  type PersistirConversaoLeituraPedidoSmartRead,
} from '../../../shared/conversao-leitura-pedido-smart-read-schema.js'

export async function persistirConversaoLeituraPedidoSmartRead(params: {
  prisma: PrismaClient
  idOrganizacao: string
  idUsuario: string
  idWorkspace: string
  dados: PersistirConversaoLeituraPedidoSmartRead
}): Promise<{ id_conversao_leitura_pedido_smart_read: string }> {
  const parseado = PersistirConversaoLeituraPedidoSmartReadSchema.parse(params.dados)

  const registro = await params.prisma.conversaoLeituraPedidoSmartRead.upsert({
    where: {
      id_organizacao_id_leitura_legado_conversao_leitura_pedido: {
        id_organizacao: params.idOrganizacao,
        id_leitura_legado_conversao_leitura_pedido: parseado.id_leitura_legado,
      },
    },
    create: {
      id_organizacao: params.idOrganizacao,
      id_usuario: params.idUsuario,
      id_workspace: params.idWorkspace,
      id_leitura_legado_conversao_leitura_pedido: parseado.id_leitura_legado,
      id_snapshot_leitura_smart_read: parseado.id_snapshot_leitura_smart_read,
      id_pedido: parseado.id_pedido,
      ids_pedido_item_conversao_leitura_pedido: parseado.ids_pedido_item,
      status_conversao_leitura_pedido_smart_read: parseado.status_conversao,
      detalhe_mapeamento_conversao_leitura_pedido: parseado.detalhe_mapeamento,
    },
    update: {
      id_snapshot_leitura_smart_read: parseado.id_snapshot_leitura_smart_read,
      id_pedido: parseado.id_pedido,
      ids_pedido_item_conversao_leitura_pedido: parseado.ids_pedido_item,
      status_conversao_leitura_pedido_smart_read: parseado.status_conversao,
      detalhe_mapeamento_conversao_leitura_pedido: parseado.detalhe_mapeamento,
      data_conversao_leitura_pedido_smart_read: new Date(),
    },
    select: { id_conversao_leitura_pedido_smart_read: true },
  })

  return { id_conversao_leitura_pedido_smart_read: registro.id_conversao_leitura_pedido_smart_read }
}

export async function conversaoExistentePorLeitura(params: {
  prisma: PrismaClient
  idOrganizacao: string
  idLeitura: string
}): Promise<{ id_pedido: string; numero_pedido: string | null } | null> {
  const row = await params.prisma.conversaoLeituraPedidoSmartRead.findFirst({
    where: {
      id_organizacao: params.idOrganizacao,
      id_leitura_legado_conversao_leitura_pedido: params.idLeitura,
    },
    select: { id_pedido: true },
  })
  if (!row) return null
  return { id_pedido: row.id_pedido, numero_pedido: null }
}
