// DDL idempotente da migration GABI no schema tenant_* (fallback se boot não rodou migrate-all-tenants).

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import prisma from './prisma.js'
import { resolverNomeSchemaOrganizacao } from './nome-schema-organizacao.js'

const MIGRATION_GABI_DDD = '20260628170000_gabi_ddd_tabelas_conversa'
const schemasComDdlAplicado = new Set<string>()

function carregarSqlMigrationGabi(): string {
  const base = dirname(fileURLToPath(import.meta.url))
  const sqlPath = resolve(
    base,
    `../../../prisma/migrations/${MIGRATION_GABI_DDD}/migration.sql`,
  )
  return readFileSync(sqlPath, 'utf-8')
}

/** Aplica migration GABI no schema da org (no máximo 1× por processo/schema). */
export async function garantirDdlGabiNoSchema(idOrganizacao: string): Promise<void> {
  const schemaName = resolverNomeSchemaOrganizacao(idOrganizacao)
  if (schemasComDdlAplicado.has(schemaName)) return

  const sql = carregarSqlMigrationGabi()
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)
    await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
    await tx.$executeRawUnsafe(sql)
  })

  schemasComDdlAplicado.add(schemaName)
  console.log(`[GABI/DDL] Tabelas garantidas no schema ${schemaName}`)
}
