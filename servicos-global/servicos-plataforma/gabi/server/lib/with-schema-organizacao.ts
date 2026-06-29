// SET LOCAL search_path para schema tenant_<cuid|uuid> — padrão ADR-001 (servicos-plataforma).

import type { PrismaClient } from '../../../generated/index.js'
import prisma from './prisma.js'
import { AppError } from './errors.js'
import { garantirDdlGabiNoSchema } from './garantir-ddl-gabi.js'
import { resolverNomeSchemaOrganizacao } from './nome-schema-organizacao.js'
import { relancarErroPrismaGabi } from './erro-prisma-gabi.js'
import { Prisma } from '../../../generated/index.js'

export type PrismaOrganizacao = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

function isErroTabelaGabiAusente(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
    return true
  }
  const msg = err instanceof Error ? err.message : String(err)
  return msg.includes('does not exist') && msg.includes('gabi_')
}

async function executarComSearchPath<T>(
  idOrganizacao: string,
  fn: (db: PrismaOrganizacao) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const schemaName = resolverNomeSchemaOrganizacao(idOrganizacao)
  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)
      await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
      return fn(tx as PrismaOrganizacao)
    },
    { timeout: timeoutMs, isolationLevel: 'ReadCommitted' },
  )
}

/** Executa fn com search_path no schema da organização (transação isolada). */
export async function withSchemaOrganizacao<T>(
  idOrganizacao: string,
  fn: (db: PrismaOrganizacao) => Promise<T>,
  timeoutMs = 15_000,
): Promise<T> {
  try {
    return await executarComSearchPath(idOrganizacao, fn, timeoutMs)
  } catch (err) {
    if (isErroTabelaGabiAusente(err)) {
      try {
        await garantirDdlGabiNoSchema(idOrganizacao)
      } catch (ddlErr) {
        console.error('[GABI/DDL] Falha ao garantir tabelas:', ddlErr)
        if (ddlErr instanceof AppError) throw ddlErr
        throw new AppError(
          'Banco GABI desatualizado (DDL falhou). Aguarde migrations ou contate suporte.',
          503,
          'GABI_DB_UNAVAILABLE',
        )
      }
      try {
        return await executarComSearchPath(idOrganizacao, fn, timeoutMs)
      } catch (retryErr) {
        relancarErroPrismaGabi(retryErr)
      }
    }
    relancarErroPrismaGabi(err)
  }
}
