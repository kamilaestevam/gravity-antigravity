// Persistencia de conversas GABI (Prisma tenant) — usado por agente V2 e /chats legado

import { AppError } from '../lib/errors.js'
import { relancarErroPrismaGabi } from '../lib/erro-prisma-gabi.js'
import { withSchemaOrganizacao, type PrismaOrganizacao } from '../lib/with-schema-organizacao.js'

export interface MetadadosMensagemAssistente {
  modelo?: string
  custo_usd?: number
  tokens?: { input: number; output: number; cached?: number }
  tools_chamadas?: Array<{
    tool_id: string
    sucesso: boolean
    duracao_ms: number
  }>
  slug_produto_gravity?: string
}

export interface PersistirTurnoConversaParams {
  conversationId: string
  id_organizacao: string
  id_usuario: string
  mensagem_usuario: string
  resposta_assistente: string
  id_produto?: string | null
  metadados_assistente?: MetadadosMensagemAssistente
}

async function garantirIdConversaNoSchema(
  db: PrismaOrganizacao,
  conversationId: string,
  id_organizacao: string,
  id_usuario: string,
  titulo?: string,
): Promise<string> {
  if (conversationId !== 'new') {
    const existe = await db.gabiConversaCompleta.findFirst({
      where: {
        id_gabi_conversa: conversationId,
        id_organizacao_gabi_conversa: id_organizacao,
        id_usuario_gabi_conversa: id_usuario,
      },
      select: { id_gabi_conversa: true },
    })
    if (!existe) {
      throw new AppError('Conversa nao encontrada', 404, 'NOT_FOUND')
    }
    return conversationId
  }

  const criada = await db.gabiConversaCompleta.create({
    data: {
      id_organizacao_gabi_conversa: id_organizacao,
      id_usuario_gabi_conversa: id_usuario,
      titulo_gabi_conversa: titulo?.slice(0, 80) || 'Nova Conversa',
    },
  })
  return criada.id_gabi_conversa
}

/**
 * Garante id de conversa valido. Se `conversationId === 'new'`, cria registro no banco.
 */
export async function garantirIdConversaGabi(
  conversationId: string,
  id_organizacao: string,
  id_usuario: string,
  titulo?: string,
): Promise<string> {
  try {
    return await withSchemaOrganizacao(id_organizacao, (db) =>
      garantirIdConversaNoSchema(db, conversationId, id_organizacao, id_usuario, titulo),
    )
  } catch (err) {
    relancarErroPrismaGabi(err)
  }
}

/** Grava par user/assistant e atualiza timestamp da conversa. Retorna o id efetivo. */
export async function persistirTurnoConversa(
  params: PersistirTurnoConversaParams,
): Promise<string> {
  try {
    return await withSchemaOrganizacao(params.id_organizacao, async (db) => {
      const id_conversa = await garantirIdConversaNoSchema(
        db,
        params.conversationId,
        params.id_organizacao,
        params.id_usuario,
        params.mensagem_usuario,
      )

      await db.gabiConversaCompleta.update({
        where: { id_gabi_conversa: id_conversa },
        data: {
          data_atualizacao_gabi_conversa: new Date(),
          ...(params.id_produto !== undefined
            ? { id_produto_gabi_conversa: params.id_produto }
            : {}),
        },
      })

      await db.gabiMensagemIndividual.createMany({
        data: [
          {
            id_organizacao_gabi_mensagem: params.id_organizacao,
            id_usuario_gabi_mensagem: params.id_usuario,
            id_conversa_gabi_mensagem: id_conversa,
            papel_gabi_mensagem: 'user',
            conteudo_gabi_mensagem: params.mensagem_usuario,
            id_produto_gabi_mensagem: params.id_produto ?? null,
          },
          {
            id_organizacao_gabi_mensagem: params.id_organizacao,
            id_usuario_gabi_mensagem: params.id_usuario,
            id_conversa_gabi_mensagem: id_conversa,
            papel_gabi_mensagem: 'assistant',
            conteudo_gabi_mensagem: params.resposta_assistente,
            id_produto_gabi_mensagem: params.id_produto ?? null,
            anexos_gabi_mensagem: params.metadados_assistente
              ? JSON.stringify(params.metadados_assistente)
              : null,
          },
        ],
      })

      return id_conversa
    })
  } catch (err) {
    relancarErroPrismaGabi(err)
  }
}

/** Fire-and-forget com log em falha (compativel com rotas legadas). */
export function persistirTurnoConversaAsync(params: PersistirTurnoConversaParams): void {
  void persistirTurnoConversa(params).catch((e) => {
    console.warn('[GABI/Conversa] falha persistindo turno', (e as Error).message)
  })
}
