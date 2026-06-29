// Aplica migration GABI (gabi_conversa, gabi_mensagem, …) em um schema tenant_* via pg.
// Prisma $executeRawUnsafe não aceita múltiplos statements — este módulo é o caminho correto.

import { createHash, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Client } from 'pg'
import { Client as PgClient } from 'pg'
import { AppError } from './errors.js'

export const MIGRATION_GABI_DDD = '20260628170000_gabi_ddd_tabelas_conversa'

const CREATE_MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  id                   VARCHAR(36)  NOT NULL PRIMARY KEY,
  checksum             VARCHAR(64)  NOT NULL,
  finished_at          TIMESTAMPTZ,
  migration_name       VARCHAR(255) NOT NULL,
  logs                 TEXT,
  rolled_back_at       TIMESTAMPTZ,
  started_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  applied_steps_count  INTEGER      NOT NULL DEFAULT 0
);
`

function carregarSqlMigrationGabi(): { sql: string; checksum: string } {
  const candidates = [
    resolve(
      dirname(fileURLToPath(import.meta.url)),
      `../../../prisma/migrations/${MIGRATION_GABI_DDD}/migration.sql`,
    ),
    resolve(
      process.cwd(),
      `servicos-global/servicos-plataforma/prisma/migrations/${MIGRATION_GABI_DDD}/migration.sql`,
    ),
  ]

  for (const sqlPath of candidates) {
    try {
      const sql = readFileSync(sqlPath, 'utf-8')
      const checksum = createHash('sha256').update(sql).digest('hex')
      return { sql, checksum }
    } catch {
      /* tenta próximo caminho */
    }
  }

  throw new AppError(
    'Arquivo migration GABI ausente no servidor',
    503,
    'GABI_DB_UNAVAILABLE',
  )
}

/** Verifica se gabi_conversa existe no schema tenant (não em public). */
export async function gabiConversaExisteNoSchema(
  client: Client,
  schemaName: string,
): Promise<boolean> {
  const { rows } = await client.query<{ exists: boolean }>(
    `SELECT to_regclass(format('%I.%I', $1::text, 'gabi_conversa')) IS NOT NULL AS exists`,
    [schemaName],
  )
  return rows[0]?.exists ?? false
}

async function aplicarMigrationNoSchema(
  client: Client,
  schemaName: string,
  migrationName: string,
  sql: string,
  checksum: string,
): Promise<'ok' | 'skip' | 'repair'> {
  await client.query('BEGIN')
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)
    await client.query(`SET LOCAL search_path TO "${schemaName}", public`)
    await client.query(CREATE_MIGRATIONS_TABLE)

    const { rows: applied } = await client.query<{ migration_name: string }>(
      `SELECT migration_name FROM "_prisma_migrations"
       WHERE migration_name = $1 AND finished_at IS NOT NULL AND rolled_back_at IS NULL`,
      [migrationName],
    )

    const tabelaOk = await gabiConversaExisteNoSchema(client, schemaName)

    if (applied.length > 0 && tabelaOk) {
      await client.query('ROLLBACK')
      return 'skip'
    }

    const drift = applied.length > 0 && !tabelaOk
    if (drift) {
      console.warn(
        `[GABI/DDL] Drift em ${schemaName}: migration registrada sem gabi_conversa — reaplicando DDL`,
      )
    }

    await client.query(sql)

    if (!drift) {
      await client.query(
        `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count)
         VALUES ($1, $2, NOW(), $3, 1)`,
        [randomUUID(), checksum, migrationName],
      )
    }

    await client.query('COMMIT')
    return drift ? 'repair' : 'ok'
  } catch (err) {
    await client.query('ROLLBACK')
    const msg = err instanceof Error ? err.message : String(err)
    throw new AppError(
      `DDL GABI falhou no schema "${schemaName}": ${msg}`,
      503,
      'GABI_DB_UNAVAILABLE',
    )
  }
}

/** Aplica migration GABI no schema indicado (idempotente + repara drift public/tenant). */
export async function aplicarDdlGabiNoSchemaNome(
  organizacaoUrl: string,
  schemaName: string,
): Promise<'ok' | 'skip' | 'repair'> {
  const { sql, checksum } = carregarSqlMigrationGabi()
  const client = new PgClient({ connectionString: organizacaoUrl })
  await client.connect()
  try {
    return await aplicarMigrationNoSchema(
      client,
      schemaName,
      MIGRATION_GABI_DDD,
      sql,
      checksum,
    )
  } finally {
    await client.end()
  }
}
