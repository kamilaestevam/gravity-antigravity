// Persistência gabi_conversa / gabi_mensagem com SQL schema-qualificado.
// O Prisma ORM (create/findMany) ignora SET LOCAL search_path em alguns ambientes
// (PgBouncer transaction mode + Railway); $queryRaw com search_path pode passar enquanto
// o model method falha com P2021 — por isso usamos "tenant_xxx"."gabi_conversa" explícito.

import { createId } from '@paralleldrive/cuid2'
import type { PrismaOrganizacao } from './with-schema-organizacao.js'

export interface MensagemGabiLinha {
  papel_gabi_mensagem: string
  conteudo_gabi_mensagem: string
}

export async function conversaGabiExiste(
  tx: PrismaOrganizacao,
  schemaName: string,
  id_conversa: string,
  id_organizacao: string,
  id_usuario: string,
): Promise<boolean> {
  const rows = await tx.$queryRawUnsafe<{ ok: number }[]>(
    `SELECT 1 AS ok FROM "${schemaName}"."gabi_conversa"
     WHERE id_gabi_conversa = $1
       AND id_organizacao_gabi_conversa = $2
       AND id_usuario_gabi_conversa = $3
     LIMIT 1`,
    id_conversa,
    id_organizacao,
    id_usuario,
  )
  return rows.length > 0
}

export async function criarConversaGabi(
  tx: PrismaOrganizacao,
  schemaName: string,
  id_organizacao: string,
  id_usuario: string,
  titulo: string,
): Promise<string> {
  const id_gabi_conversa = createId()
  await tx.$executeRawUnsafe(
    `INSERT INTO "${schemaName}"."gabi_conversa" (
       id_gabi_conversa,
       id_organizacao_gabi_conversa,
       id_usuario_gabi_conversa,
       titulo_gabi_conversa,
       data_criacao_gabi_conversa,
       data_atualizacao_gabi_conversa
     ) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
    id_gabi_conversa,
    id_organizacao,
    id_usuario,
    titulo.slice(0, 80) || 'Nova Conversa',
  )
  return id_gabi_conversa
}

export async function atualizarTimestampConversaGabi(
  tx: PrismaOrganizacao,
  schemaName: string,
  id_conversa: string,
  id_produto?: string | null,
): Promise<void> {
  if (id_produto !== undefined) {
    await tx.$executeRawUnsafe(
      `UPDATE "${schemaName}"."gabi_conversa"
       SET data_atualizacao_gabi_conversa = NOW(),
           id_produto_gabi_conversa = $2
       WHERE id_gabi_conversa = $1`,
      id_conversa,
      id_produto,
    )
  } else {
    await tx.$executeRawUnsafe(
      `UPDATE "${schemaName}"."gabi_conversa"
       SET data_atualizacao_gabi_conversa = NOW()
       WHERE id_gabi_conversa = $1`,
      id_conversa,
    )
  }
}

export async function inserirMensagensGabi(
  tx: PrismaOrganizacao,
  schemaName: string,
  params: {
    id_organizacao: string
    id_usuario: string
    id_conversa: string
    id_produto?: string | null
    mensagem_usuario: string
    resposta_assistente: string
    metadados_assistente_json?: string | null
  },
): Promise<void> {
  const idUser = createId()
  const idAssistant = createId()
  await tx.$executeRawUnsafe(
    `INSERT INTO "${schemaName}"."gabi_mensagem" (
       id_gabi_mensagem,
       id_organizacao_gabi_mensagem,
       id_usuario_gabi_mensagem,
       id_conversa_gabi_mensagem,
       papel_gabi_mensagem,
       conteudo_gabi_mensagem,
       id_produto_gabi_mensagem,
       data_criacao_gabi_mensagem,
       data_atualizacao_gabi_mensagem
     ) VALUES
       ($1, $2, $3, $4, 'user', $5, $6, NOW(), NOW()),
       ($7, $2, $3, $4, 'assistant', $8, $6, NOW(), NOW())`,
    idUser,
    params.id_organizacao,
    params.id_usuario,
    params.id_conversa,
    params.mensagem_usuario,
    params.id_produto ?? null,
    idAssistant,
    params.resposta_assistente,
  )
  if (params.metadados_assistente_json) {
    await tx.$executeRawUnsafe(
      `UPDATE "${schemaName}"."gabi_mensagem"
       SET anexos_gabi_mensagem = $2
       WHERE id_gabi_mensagem = $1`,
      idAssistant,
      params.metadados_assistente_json,
    )
  }
}

export async function listarMensagensConversaGabi(
  tx: PrismaOrganizacao,
  schemaName: string,
  id_conversa: string,
  limit: number,
): Promise<{ messages: MensagemGabiLinha[]; totalCount: number }> {
  const messages = await tx.$queryRawUnsafe<MensagemGabiLinha[]>(
    `SELECT papel_gabi_mensagem, conteudo_gabi_mensagem
     FROM "${schemaName}"."gabi_mensagem"
     WHERE id_conversa_gabi_mensagem = $1
     ORDER BY data_criacao_gabi_mensagem DESC
     LIMIT $2`,
    id_conversa,
    limit,
  )
  const countRows = await tx.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*)::bigint AS count
     FROM "${schemaName}"."gabi_mensagem"
     WHERE id_conversa_gabi_mensagem = $1`,
    id_conversa,
  )
  const totalCount = Number(countRows[0]?.count ?? 0)
  return { messages, totalCount }
}
