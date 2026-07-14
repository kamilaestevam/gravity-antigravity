/**
 * idempotencia-api.ts — Idempotency-Key / x-chave-idempotencia por organizacao.
 */

import { createHash } from 'node:crypto'
import type { PrismaClient } from '../../../../generated/index.js'

const TTL_HORAS = 24

export function extrairChaveIdempotencia(
  headers: Record<string, string | string[] | undefined>,
): string | null {
  const raw =
    headers['idempotency-key']
    ?? headers['x-chave-idempotencia']
    ?? headers['Idempotency-Key']
  if (typeof raw !== 'string' || raw.trim() === '') return null
  return raw.trim()
}

export function hashCorpoRequisicao(corpo: unknown): string {
  const serializado = typeof corpo === 'string' ? corpo : JSON.stringify(corpo ?? {})
  return createHash('sha256').update(serializado).digest('hex')
}

export async function consultarIdempotencia(
  prisma: PrismaClient,
  idOrganizacao: string,
  chave: string,
  hashCorpo: string,
): Promise<{ status: number; body: unknown } | { conflito: true } | null> {
  const registro = await prisma.registroIdempotenciaApi.findUnique({
    where: {
      id_organizacao_chave_idempotencia_api: {
        id_organizacao: idOrganizacao,
        chave_idempotencia_api: chave,
      },
    },
  })

  if (!registro) return null
  if (registro.data_expiracao_idempotencia_api < new Date()) {
    await prisma.registroIdempotenciaApi.delete({
      where: { id_registro_idempotencia_api: registro.id_registro_idempotencia_api },
    })
    return null
  }
  if (registro.hash_corpo_requisicao_api !== hashCorpo) {
    return { conflito: true }
  }
  return {
    status: registro.codigo_resposta_http_idempotencia_api,
    body: registro.corpo_resposta_idempotencia_api,
  }
}

export async function gravarIdempotencia(
  prisma: PrismaClient,
  params: {
    id_organizacao: string
    chave: string
    hashCorpo: string
    status: number
    body: unknown
  },
): Promise<void> {
  const expira = new Date(Date.now() + TTL_HORAS * 60 * 60 * 1000)
  await prisma.registroIdempotenciaApi.upsert({
    where: {
      id_organizacao_chave_idempotencia_api: {
        id_organizacao: params.id_organizacao,
        chave_idempotencia_api: params.chave,
      },
    },
    create: {
      id_organizacao: params.id_organizacao,
      chave_idempotencia_api: params.chave,
      hash_corpo_requisicao_api: params.hashCorpo,
      codigo_resposta_http_idempotencia_api: params.status,
      corpo_resposta_idempotencia_api: params.body as object,
      data_expiracao_idempotencia_api: expira,
    },
    update: {
      hash_corpo_requisicao_api: params.hashCorpo,
      codigo_resposta_http_idempotencia_api: params.status,
      corpo_resposta_idempotencia_api: params.body as object,
      data_expiracao_idempotencia_api: expira,
    },
  })
}
