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
  const registro = await prisma.apiRegistroIdempotencia.findUnique({
    where: {
      id_organizacao_chave_api_registro_idempotencia: {
        id_organizacao: idOrganizacao,
        chave_api_registro_idempotencia: chave,
      },
    },
  })

  if (!registro) return null
  if (registro.data_expiracao_api_registro_idempotencia < new Date()) {
    await prisma.apiRegistroIdempotencia.delete({
      where: { id_api_registro_idempotencia: registro.id_api_registro_idempotencia },
    })
    return null
  }
  if (registro.hash_corpo_api_registro_idempotencia !== hashCorpo) {
    return { conflito: true }
  }
  return {
    status: registro.codigo_resposta_http_api_registro_idempotencia,
    body: registro.corpo_resposta_api_registro_idempotencia,
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
  await prisma.apiRegistroIdempotencia.upsert({
    where: {
      id_organizacao_chave_api_registro_idempotencia: {
        id_organizacao: params.id_organizacao,
        chave_api_registro_idempotencia: params.chave,
      },
    },
    create: {
      id_organizacao: params.id_organizacao,
      chave_api_registro_idempotencia: params.chave,
      hash_corpo_api_registro_idempotencia: params.hashCorpo,
      codigo_resposta_http_api_registro_idempotencia: params.status,
      corpo_resposta_api_registro_idempotencia: params.body as object,
      data_expiracao_api_registro_idempotencia: expira,
    },
    update: {
      hash_corpo_api_registro_idempotencia: params.hashCorpo,
      codigo_resposta_http_api_registro_idempotencia: params.status,
      corpo_resposta_api_registro_idempotencia: params.body as object,
      data_expiracao_api_registro_idempotencia: expira,
    },
  })
}
