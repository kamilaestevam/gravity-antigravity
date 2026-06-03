/**
 * Aplica um migration.sql do Pedido em cada schema tenant_*/organizacao_* que tem tabela pedido.
 * Usado no boot quando prisma migrate deploy falha (P3009) ou migrate-all-tenants não rodou.
 */
import { createHash, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Client } from 'pg'

const REPO_ROOT = resolve(import.meta.dirname, '../..')

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

export const MIGRATION_ID_PROCESSO_PEDIDO = '20260601130000_pedido_id_processo_vinculo'
export const MIGRATION_LISTA_PAINEL_PEDIDO = '20260602140000_create_lista_painel_usuario_global'

function mascararUrl(url: string): string {
  const host = url.split('@')[1]?.split('/')[0]
  return host ? `***@${host}` : '(invalida)'
}

/** Schemas de organização com tabela pedido (tenant_* canônico + organizacao_* legado). */
export async function listarSchemasComTabelaPedido(client: Client): Promise<string[]> {
  const { rows } = await client.query<{ schema_name: string }>(`
    SELECT DISTINCT n.nspname AS schema_name
    FROM pg_namespace n
    WHERE (
      n.nspname LIKE 'tenant_%'
      OR n.nspname LIKE 'organizacao_%'
    )
    AND EXISTS (
      SELECT 1
      FROM information_schema.tables t
      WHERE t.table_schema = n.nspname
        AND t.table_name = 'pedido'
        AND t.table_type = 'BASE TABLE'
    )
    ORDER BY n.nspname
  `)
  return rows.map(r => r.schema_name)
}

export async function aplicarMigrationEmSchemasComPedido(
  pedidoUrl: string,
  migrationName: string,
  logPrefix: string,
): Promise<void> {
  const sqlPath = join(
    REPO_ROOT,
    'servicos-global/produto/pedido/prisma/migrations',
    migrationName,
    'migration.sql',
  )
  const sql = readFileSync(sqlPath, 'utf-8')
  const checksum = createHash('sha256').update(sql).digest('hex')

  console.log(`[${logPrefix}] Banco: ${mascararUrl(pedidoUrl)}`)

  const client = new Client({ connectionString: pedidoUrl })
  await client.connect()

  try {
    const schemas = await listarSchemasComTabelaPedido(client)
    console.log(`[${logPrefix}] Schemas com pedido (${migrationName}): ${schemas.length}`)
    if (schemas.length === 0) {
      console.warn(`[${logPrefix}] Nenhum schema tenant/organizacao com tabela pedido.`)
      return
    }

    for (const schemaName of schemas) {
      await client.query('BEGIN')
      try {
        await client.query(`SET LOCAL search_path TO "${schemaName}", public`)
        await client.query(CREATE_MIGRATIONS_TABLE)

        const { rows: applied } = await client.query<{ migration_name: string }>(
          `SELECT migration_name FROM "_prisma_migrations"
           WHERE migration_name = $1 AND finished_at IS NOT NULL AND rolled_back_at IS NULL`,
          [migrationName],
        )
        if (applied.length > 0) {
          console.log(`[${logPrefix}] ${schemaName} — ja aplicada`)
          await client.query('ROLLBACK')
          continue
        }

        await client.query(sql)
        await client.query(
          `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count)
           VALUES ($1, $2, NOW(), $3, 1)`,
          [randomUUID(), checksum, migrationName],
        )
        await client.query('COMMIT')
        console.log(`[${logPrefix}] ${schemaName} — OK`)
      } catch (err) {
        await client.query('ROLLBACK')
        const msg = err instanceof Error ? err.message : String(err)
        throw new Error(`[${logPrefix}] Falha em schema "${schemaName}": ${msg}`)
      }
    }

    console.log(`[${logPrefix}] Concluido (${migrationName}).`)
  } finally {
    await client.end()
  }
}

export async function aplicarIdProcessoEmSchemasComPedido(pedidoUrl: string): Promise<void> {
  await aplicarMigrationEmSchemasComPedido(
    pedidoUrl,
    MIGRATION_ID_PROCESSO_PEDIDO,
    'ddl-pedido-id_processo',
  )
}

export async function aplicarListaPainelEmSchemasComPedido(pedidoUrl: string): Promise<void> {
  await aplicarMigrationEmSchemasComPedido(
    pedidoUrl,
    MIGRATION_LISTA_PAINEL_PEDIDO,
    'ddl-pedido-lista_painel',
  )
}
