// Persistencia de conversas GABI — SQL schema-qualificado (tenant_*.gabi_conversa)

import { AppError } from '../lib/errors.js'
import { relancarErroPrismaGabi } from '../lib/erro-prisma-gabi.js'
import { resolverNomeSchemaOrganizacao } from '../lib/nome-schema-organizacao.js'
import {
  atualizarTimestampConversaGabi,
  conversaGabiExiste,
  criarConversaGabi,
  inserirMensagensGabi,
} from '../lib/repositorio-conversa-gabi-sql.js'
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
  schemaName: string,
  conversationId: string,
  id_organizacao: string,
  id_usuario: string,
  titulo?: string,
): Promise<string> {
  if (conversationId !== 'new') {
    const existe = await conversaGabiExiste(
      db,
      schemaName,
      conversationId,
      id_organizacao,
      id_usuario,
    )
    if (!existe) {
      throw new AppError('Conversa nao encontrada', 404, 'NOT_FOUND')
    }
    return conversationId
  }

  return criarConversaGabi(db, schemaName, id_organizacao, id_usuario, titulo ?? 'Nova Conversa')
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
  const schemaName = resolverNomeSchemaOrganizacao(id_organizacao)
  try {
    return await withSchemaOrganizacao(id_organizacao, (db) =>
      garantirIdConversaNoSchema(db, schemaName, conversationId, id_organizacao, id_usuario, titulo),
    )
  } catch (err) {
    relancarErroPrismaGabi(err)
  }
}

/** Grava par user/assistant e atualiza timestamp da conversa. Retorna o id efetivo. */
export async function persistirTurnoConversa(
  params: PersistirTurnoConversaParams,
): Promise<string> {
  const schemaName = resolverNomeSchemaOrganizacao(params.id_organizacao)
  try {
    return await withSchemaOrganizacao(params.id_organizacao, async (db) => {
      const id_conversa = await garantirIdConversaNoSchema(
        db,
        schemaName,
        params.conversationId,
        params.id_organizacao,
        params.id_usuario,
        params.mensagem_usuario,
      )

      await atualizarTimestampConversaGabi(db, schemaName, id_conversa, params.id_produto)

      await inserirMensagensGabi(db, schemaName, {
        id_organizacao: params.id_organizacao,
        id_usuario: params.id_usuario,
        id_conversa,
        id_produto: params.id_produto,
        mensagem_usuario: params.mensagem_usuario,
        resposta_assistente: params.resposta_assistente,
        metadados_assistente_json: params.metadados_assistente
          ? JSON.stringify(params.metadados_assistente)
          : null,
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
