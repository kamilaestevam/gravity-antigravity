/**
 * Persiste preferências de notificação (lista_painel meta).
 */
import type { PrismaClient } from '@prisma/client'
import {
  NOME_PAINEL_META_NOTIFICACOES_BID_FRETE,
  preferenciasNotificacaoBidFreteSchema,
  serializarPreferenciasNotificacaoBidFrete,
  type PreferenciasNotificacaoBidFrete,
} from '../../../shared/preferencias-notificacao-bid-frete-internacional.js'
import { ID_PRODUTO_GRAVITY_BID_FRETE_INTERNACIONAL } from '../../../shared/listaPainelConfigSchema.js'

function whereUsuarioProduto(id_organizacao: string, id_usuario: string) {
  return {
    id_organizacao,
    id_usuario,
    id_produto_gravity: ID_PRODUTO_GRAVITY_BID_FRETE_INTERNACIONAL,
  }
}

export async function salvarPreferenciasNotificacaoBidFreteInternacional(
  prisma: PrismaClient,
  id_organizacao: string,
  id_usuario: string,
  preferencias: PreferenciasNotificacaoBidFrete,
): Promise<PreferenciasNotificacaoBidFrete> {
  const parsed = preferenciasNotificacaoBidFreteSchema.parse(preferencias)
  const configJson = serializarPreferenciasNotificacaoBidFrete(parsed)

  const existente = await (prisma as any).listaPainelUsuarioGlobal.findFirst({
    where: {
      ...whereUsuarioProduto(id_organizacao, id_usuario),
      nome_lista_painel_usuario_global: NOME_PAINEL_META_NOTIFICACOES_BID_FRETE,
    },
  })

  if (existente) {
    await (prisma as any).listaPainelUsuarioGlobal.update({
      where: { id_lista_painel_usuario_global: existente.id_lista_painel_usuario_global },
      data: { config_json_lista_painel_usuario_global: configJson },
    })
  } else {
    await (prisma as any).listaPainelUsuarioGlobal.create({
      data: {
        ...whereUsuarioProduto(id_organizacao, id_usuario),
        nome_lista_painel_usuario_global: NOME_PAINEL_META_NOTIFICACOES_BID_FRETE,
        ordem_lista_painel_usuario_global: -1,
        visivel_lista_painel_usuario_global: false,
        config_json_lista_painel_usuario_global: configJson,
      },
    })
  }

  return parsed
}
