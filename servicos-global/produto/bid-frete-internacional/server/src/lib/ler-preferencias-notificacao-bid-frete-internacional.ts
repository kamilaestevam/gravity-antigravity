/**
 * Lê preferências de notificação persistidas (lista_painel meta).
 */
import type { PrismaClient } from '@prisma/client'
import {
  NOME_PAINEL_META_NOTIFICACOES_BID_FRETE,
  PREFERENCIAS_NOTIFICACAO_BID_FRETE_PADRAO,
  parsearPreferenciasNotificacaoBidFrete,
  type PreferenciasNotificacaoBidFrete,
} from '../../../shared/preferencias-notificacao-bid-frete-internacional.js'
import { ID_PRODUTO_GRAVITY_BID_FRETE_INTERNACIONAL } from '../../../shared/listaPainelConfigSchema.js'

export async function lerPreferenciasNotificacaoBidFreteInternacional(
  prisma: PrismaClient,
  id_organizacao: string,
  id_usuario: string,
): Promise<PreferenciasNotificacaoBidFrete> {
  const meta = await (prisma as any).listaPainelUsuarioGlobal.findFirst({
    where: {
      id_organizacao,
      id_usuario,
      id_produto_gravity: ID_PRODUTO_GRAVITY_BID_FRETE_INTERNACIONAL,
      nome_lista_painel_usuario_global: NOME_PAINEL_META_NOTIFICACOES_BID_FRETE,
    },
  })

  if (!meta?.config_json_lista_painel_usuario_global) {
    return PREFERENCIAS_NOTIFICACAO_BID_FRETE_PADRAO
  }

  return parsearPreferenciasNotificacaoBidFrete(meta.config_json_lista_painel_usuario_global)
}
