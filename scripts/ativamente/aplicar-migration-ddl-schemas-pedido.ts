/**
 * Aplica um migration.sql do Pedido em cada schema tenant_* ou organizacao_* com tabela pedido.
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

const CUID_ORG_REGEX = /^[a-z][a-z0-9]{22,24}$/
const UUID_ORG_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

function nomeSchemaOrganizacao(idOrganizacao: string): string | null {
  if (!CUID_ORG_REGEX.test(idOrganizacao) && !UUID_ORG_REGEX.test(idOrganizacao)) {
    return null
  }
  return `tenant_${idOrganizacao}`
}

/** pg_class: acha tabela pedido mesmo quando information_schema não lista (legado / particionado). */
async function listarSchemasComPedidoPgClass(client: Client): Promise<string[]> {
  const { rows } = await client.query<{ schema_name: string }>(`
    SELECT DISTINCT n.nspname AS schema_name
    FROM pg_namespace n
    INNER JOIN pg_class c ON c.relnamespace = n.oid
    WHERE c.relname = 'pedido'
      AND c.relkind IN ('r', 'p')
      AND (
        n.nspname LIKE 'tenant_%'
        OR n.nspname LIKE 'organizacao_%'
        OR n.nspname = 'public'
      )
    ORDER BY n.nspname
  `)
  return rows.map(r => r.schema_name)
}

/** Orgs ATIVO no Configurador cujo schema físico já tem tabela pedido. */
async function listarSchemasConfiguradorComPedido(
  pedidoClient: Client,
  configuradorUrl: string,
): Promise<string[]> {
  const cfg = new Client({ connectionString: configuradorUrl })
  await cfg.connect()
  const found: string[] = []
  try {
    const { rows } = await cfg.query<{ id: string }>(
      `SELECT id_organizacao AS id
       FROM organizacao
       WHERE status_organizacao = 'ATIVO'`,
    )
    for (const { id } of rows) {
      const schemaName = nomeSchemaOrganizacao(id)
      if (!schemaName) continue
      const { rows: ex } = await pedidoClient.query<{ ok: boolean }>(
        `SELECT EXISTS (
          SELECT 1
          FROM pg_namespace n
          INNER JOIN pg_class c ON c.relnamespace = n.oid
          WHERE n.nspname = $1
            AND c.relname = 'pedido'
            AND c.relkind IN ('r', 'p')
        ) AS ok`,
        [schemaName],
      )
      if (ex[0]?.ok) found.push(schemaName)
    }
  } finally {
    await cfg.end()
  }
  return found
}

/**
 * Schemas onde aplicar DDL do Pedido:
 * tenant_* / organizacao_* / public (legado) com tabela pedido + orgs ATIVO no Configurador.
 */
export async function listarSchemasComTabelaPedido(
  client: Client,
  configuradorUrl?: string,
): Promise<string[]> {
  const fromPg = await listarSchemasComPedidoPgClass(client)
  const fromCfg =
    configuradorUrl !== undefined && configuradorUrl.length > 0
      ? await listarSchemasConfiguradorComPedido(client, configuradorUrl)
      : []

  const merged = [...new Set([...fromPg, ...fromCfg])].sort()
  if (merged.length > 0) {
    console.log(`[ddl-pedido-schemas] ${merged.join(', ')}`)
  }
  return merged
}

export async function aplicarMigrationEmSchemasComPedido(
  pedidoUrl: string,
  migrationName: string,
  logPrefix: string,
  configuradorUrl?: string,
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
    const schemas = await listarSchemasComTabelaPedido(client, configuradorUrl)
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

export async function aplicarIdProcessoEmSchemasComPedido(
  pedidoUrl: string,
  configuradorUrl?: string,
): Promise<void> {
  await aplicarMigrationEmSchemasComPedido(
    pedidoUrl,
    MIGRATION_ID_PROCESSO_PEDIDO,
    'ddl-pedido-id_processo',
    configuradorUrl,
  )
}

export async function aplicarListaPainelEmSchemasComPedido(
  pedidoUrl: string,
  configuradorUrl?: string,
): Promise<void> {
  await aplicarMigrationEmSchemasComPedido(
    pedidoUrl,
    MIGRATION_LISTA_PAINEL_PEDIDO,
    'ddl-pedido-lista_painel',
    configuradorUrl,
  )
}
