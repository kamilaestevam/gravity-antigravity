/**
 * Aplica migration id_processo em todos os schemas organizacao_* do banco Pedido.
 * Usado quando migrate-all-tenants falha por timeout/conexão.
 */
import { createHash, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'

const REPO_ROOT = resolve(import.meta.dirname, '../..')
const MIGRATION_NAME = '20260601130000_pedido_id_processo_vinculo'

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

function mascararUrl(url: string): string {
  const host = url.split('@')[1]?.split('/')[0]
  return host ? `***@${host}` : '(invalida)'
}

async function main(): Promise<void> {
  const pedidoUrl = process.env.PEDIDO_DATABASE_URL ?? process.env.DATABASE_URL
  if (!pedidoUrl) {
    console.error('[id_processo-tenants] PEDIDO_DATABASE_URL ausente')
    process.exit(1)
  }

  const sqlPath = join(
    REPO_ROOT,
    'servicos-global/produto/pedido/prisma/migrations',
    MIGRATION_NAME,
    'migration.sql',
  )
  const sql = readFileSync(sqlPath, 'utf-8')
  const checksum = createHash('sha256').update(sql).digest('hex')

  console.log(`[id_processo-tenants] Banco: ${mascararUrl(pedidoUrl)}`)

  const client = new Client({ connectionString: pedidoUrl })
  await client.connect()

  try {
    const { rows } = await client.query<{ table_schema: string }>(`
      SELECT DISTINCT table_schema
      FROM information_schema.tables
      WHERE table_name = 'pedido'
        AND table_type = 'BASE TABLE'
        AND table_schema LIKE 'organizacao_%'
      ORDER BY table_schema
    `)

    console.log(`[id_processo-tenants] Schemas: ${rows.length}`)

    for (const { table_schema: schemaName } of rows) {
      await client.query('BEGIN')
      try {
        await client.query(`SET LOCAL search_path TO "${schemaName}", public`)
        await client.query(CREATE_MIGRATIONS_TABLE)

        const { rows: applied } = await client.query<{ migration_name: string }>(
          `SELECT migration_name FROM "_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL`,
          [MIGRATION_NAME],
        )
        if (applied.length > 0) {
          console.log(`[id_processo-tenants] ${schemaName} — ja aplicada`)
          await client.query('ROLLBACK')
          continue
        }

        await client.query(sql)
        await client.query(
          `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count)
           VALUES ($1, $2, NOW(), $3, 1)`,
          [randomUUID(), checksum, MIGRATION_NAME],
        )
        await client.query('COMMIT')
        console.log(`[id_processo-tenants] ${schemaName} — OK`)
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      }
    }

    console.log('[id_processo-tenants] Concluido.')
  } finally {
    await client.end()
  }
}

main().catch(err => {
  console.error('[id_processo-tenants] ERRO:', err instanceof Error ? err.message : err)
  process.exit(1)
})
