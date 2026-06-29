/**
 * Aplica migration GABI (gabi_conversa, gabi_mensagem, …) em cada schema tenant_*
 * do banco ORGANIZACAO_DATABASE_URL.
 *
 * migrate deploy só grava em public; o sidecar GABI usa SET search_path no schema da org.
 * Sem este passo, produção retorna 503 GABI_DB_UNAVAILABLE após o hotfix #524.
 */
import { createHash, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Client } from 'pg'
import {
  idOrganizacaoDeNomeSchema,
  nomeSchemaOrganizacao,
  schemaOrganizacaoValido,
} from './lib/nome-schema-organizacao.js'

const REPO_ROOT = resolve(import.meta.dirname, '../..')

export const MIGRATION_GABI_DDD_CONVERSA = '20260628170000_gabi_ddd_tabelas_conversa'

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

async function listarSchemasTenantNoBanco(client: Client): Promise<string[]> {
  const { rows } = await client.query<{ schema_name: string }>(`
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name LIKE 'tenant_%'
    ORDER BY schema_name
  `)
  return rows.map((r) => r.schema_name).filter(schemaOrganizacaoValido)
}

async function listarSchemasOrgsAtivasConfigurador(
  configuradorUrl: string,
): Promise<string[]> {
  const cfg = new Client({ connectionString: configuradorUrl })
  await cfg.connect()
  const schemas: string[] = []
  try {
    const { rows } = await cfg.query<{ id: string }>(
      `SELECT id_organizacao AS id
       FROM organizacao
       WHERE status_organizacao = 'ATIVO'`,
    )
    for (const { id } of rows) {
      const schemaName = nomeSchemaOrganizacao(id)
      if (schemaName) schemas.push(schemaName)
    }
  } finally {
    await cfg.end()
  }
  return schemas
}

async function aplicarMigrationNoSchema(
  client: Client,
  schemaName: string,
  migrationName: string,
  sql: string,
  checksum: string,
  logPrefix: string,
): Promise<'ok' | 'skip'> {
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
    if (applied.length > 0) {
      await client.query('ROLLBACK')
      return 'skip'
    }

    await client.query(sql)
    await client.query(
      `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count)
       VALUES ($1, $2, NOW(), $3, 1)`,
      [randomUUID(), checksum, migrationName],
    )
    await client.query('COMMIT')
    console.log(`[${logPrefix}] ${schemaName} — OK`)
    return 'ok'
  } catch (err) {
    await client.query('ROLLBACK')
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`[${logPrefix}] Falha em schema "${schemaName}": ${msg}`)
  }
}

export async function aplicarMigrationGabiEmSchemasOrganizacao(
  organizacaoUrl: string,
  configuradorUrl?: string,
): Promise<void> {
  const sqlPath = join(
    REPO_ROOT,
    'servicos-global/servicos-plataforma/prisma/migrations',
    MIGRATION_GABI_DDD_CONVERSA,
    'migration.sql',
  )
  const sql = readFileSync(sqlPath, 'utf-8')
  const checksum = createHash('sha256').update(sql).digest('hex')
  const logPrefix = 'ddl-gabi-organizacao'

  console.log(`[${logPrefix}] Banco: ${mascararUrl(organizacaoUrl)}`)

  const client = new Client({ connectionString: organizacaoUrl })
  await client.connect()

  try {
    const fromDb = await listarSchemasTenantNoBanco(client)
    const fromCfg =
      configuradorUrl && configuradorUrl.length > 0
        ? await listarSchemasOrgsAtivasConfigurador(configuradorUrl)
        : []

    const schemas = [...new Set([...fromDb, ...fromCfg])].sort()
    console.log(`[${logPrefix}] Schemas a processar (${MIGRATION_GABI_DDD_CONVERSA}): ${schemas.length}`)

    if (schemas.length === 0) {
      console.warn(`[${logPrefix}] Nenhum schema tenant_* — tentando orgs ATIVO apenas.`)
    }

    let ok = 0
    let skip = 0
    for (const schemaName of schemas) {
      const result = await aplicarMigrationNoSchema(
        client,
        schemaName,
        MIGRATION_GABI_DDD_CONVERSA,
        sql,
        checksum,
        logPrefix,
      )
      if (result === 'ok') ok++
      else skip++
    }

    console.log(`[${logPrefix}] Concluído: ${ok} aplicada(s), ${skip} já existente(s).`)
  } finally {
    await client.end()
  }
}

async function main(): Promise<void> {
  const organizacaoUrl = process.env.ORGANIZACAO_DATABASE_URL ?? process.env.DATABASE_URL
  const configuradorUrl = process.env.CONFIGURADOR_DATABASE_URL

  if (!organizacaoUrl) {
    console.error('[ddl-gabi-organizacao] ORGANIZACAO_DATABASE_URL ausente.')
    process.exit(1)
  }

  await aplicarMigrationGabiEmSchemasOrganizacao(organizacaoUrl, configuradorUrl)
}

const isMain =
  process.argv[1]?.replace(/\\/g, '/').endsWith('aplicar-migration-gabi-organizacao.ts') ?? false

if (isMain) {
  main().catch((err) => {
    console.error('[ddl-gabi-organizacao] Erro fatal:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
