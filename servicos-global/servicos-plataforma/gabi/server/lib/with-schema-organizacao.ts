// SET LOCAL search_path para schema tenant_<cuid> — padrão ADR-001 (servicos-plataforma).
// O sidecar GABI recebe x-id-organizacao via proxy; Prisma sem search_path grava em public.

import type { PrismaClient } from '../../../generated/index.js'
import prisma from './prisma.js'
import { AppError } from './errors.js'

const SCHEMA_NAME_REGEX = /^tenant_[a-z][a-z0-9]{22,24}$/

export type PrismaOrganizacao = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

function nomeSchemaOrganizacao(idOrganizacao: string): string {
  const schemaName = `tenant_${idOrganizacao}`
  if (!SCHEMA_NAME_REGEX.test(schemaName)) {
    throw new AppError('id_organizacao inválido para schema GABI', 400, 'INVALID_ORGANIZACAO_ID')
  }
  return schemaName
}

/** Executa fn com search_path no schema da organização (transação isolada). */
export async function withSchemaOrganizacao<T>(
  idOrganizacao: string,
  fn: (db: PrismaOrganizacao) => Promise<T>,
  timeoutMs = 15_000,
): Promise<T> {
  const schemaName = nomeSchemaOrganizacao(idOrganizacao)
  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
      return fn(tx as PrismaOrganizacao)
    },
    { timeout: timeoutMs, isolationLevel: 'ReadCommitted' },
  )
}
