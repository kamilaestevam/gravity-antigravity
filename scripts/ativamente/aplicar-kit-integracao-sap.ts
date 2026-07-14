/**
 * aplicar-kit-integracao-sap.ts — DDL kit integração ERP (org + pedido) com verificação.
 *
 * Uso:
 *   npx tsx scripts/ativamente/aplicar-kit-integracao-sap.ts
 *   ORGANIZACAO_DATABASE_URL=... DATABASE_URL=... npx tsx scripts/ativamente/aplicar-kit-integracao-sap.ts
 */
import dotenv from 'dotenv'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'
import { aplicarMigrationEmSchemasComPedido } from './aplicar-migration-ddl-schemas-pedido.js'

const REPO = resolve(fileURLToPath(import.meta.url), '../../..')
dotenv.config({ path: join(REPO, '.env.local') })
dotenv.config()

const MIGRATION_ORG = join(
  REPO,
  'servicos-global/servicos-plataforma/prisma/migrations/20260714180100_kit_integracao_sap_api_cockpit/migration.sql',
)
const MIGRATION_RENAME_DDD = join(
  REPO,
  'servicos-global/servicos-plataforma/prisma/migrations/20260714180200_rename_kit_integracao_ddd/migration.sql',
)
const MIGRATION_PEDIDO_NAME = '20260714180000_pedido_referencia_externa_erp'

const TABELAS_ORG = ['api_credencial_oauth', 'api_registro_idempotencia', 'webhook_evento_enfileirado']

async function aplicarSql(url: string, label: string, sqlPath: string): Promise<void> {
  const sql = readFileSync(sqlPath, 'utf-8')
  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    await client.query(sql)
    console.log(`[kit-integracao] OK ${label}`)
  } finally {
    await client.end().catch(() => undefined)
  }
}

async function aplicarSqlIdempotenteOrg(url: string): Promise<void> {
  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    const renameSql = readFileSync(MIGRATION_RENAME_DDD, 'utf-8')
    await client.query(renameSql).catch(() => undefined)

    const kitSql = readFileSync(MIGRATION_ORG, 'utf-8')
    try {
      await client.query(kitSql)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (!msg.includes('already exists')) throw err
      console.warn('[kit-integracao] kit org parcialmente aplicado (already exists) — seguindo')
    }
    console.log('[kit-integracao] OK org DB (api_credencial_oauth + api_registro_idempotencia + webhook_evento_enfileirado)')
  } finally {
    await client.end().catch(() => undefined)
  }
}

async function verificarOrg(url: string): Promise<boolean> {
  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    const { rows } = await client.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
      [TABELAS_ORG],
    )
    const encontradas = rows.map((r) => r.table_name)
    const faltando = TABELAS_ORG.filter((t) => !encontradas.includes(t))
    if (faltando.length > 0) {
      console.error('[kit-integracao] FALHA verificacao org — faltando:', faltando.join(', '))
      return false
    }
    console.log('[kit-integracao] VERIFICADO org:', encontradas.join(', '))
    return true
  } finally {
    await client.end().catch(() => undefined)
  }
}

async function verificarPedido(url: string, configuradorUrl?: string): Promise<boolean> {
  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    const { rows } = await client.query<{ schema_name: string }>(`
      SELECT DISTINCT n.nspname AS schema_name
      FROM pg_namespace n
      JOIN pg_class c ON c.relnamespace = n.oid
      WHERE c.relname = 'pedido' AND c.relkind IN ('r', 'p')
        AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    `)
    if (rows.length === 0) {
      console.error('[kit-integracao] FALHA verificacao pedido — nenhum schema com tabela pedido')
      return false
    }

    let ok = true
    for (const { schema_name } of rows) {
      const { rows: cols } = await client.query<{ column_name: string }>(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = 'pedido'
           AND column_name = 'referencia_externa_erp_pedido'`,
        [schema_name],
      )
      if (cols.length === 0) {
        console.error(`[kit-integracao] FALHA — ${schema_name}.pedido sem referencia_externa_erp_pedido`)
        ok = false
      } else {
        console.log(`[kit-integracao] VERIFICADO ${schema_name}.pedido.referencia_externa_erp_pedido`)
      }
    }
    return ok
  } finally {
    await client.end().catch(() => undefined)
  }
}

async function main(): Promise<void> {
  const orgUrl = process.env.ORGANIZACAO_DATABASE_URL?.trim()
  const pedidoUrl = (process.env.PEDIDO_DATABASE_URL ?? process.env.DATABASE_URL)?.trim()
  const cfgUrl = process.env.CONFIGURADOR_DATABASE_URL?.trim()

  if (!orgUrl) {
    console.error('[kit-integracao] ORGANIZACAO_DATABASE_URL ausente')
    process.exit(1)
  }
  if (!pedidoUrl) {
    console.error('[kit-integracao] DATABASE_URL / PEDIDO_DATABASE_URL ausente')
    process.exit(1)
  }

  await aplicarSqlIdempotenteOrg(orgUrl)

  await aplicarMigrationEmSchemasComPedido(
    pedidoUrl,
    MIGRATION_PEDIDO_NAME,
    'kit-integracao-pedido',
    cfgUrl,
  )

  const orgOk = await verificarOrg(orgUrl)
  const pedidoOk = await verificarPedido(pedidoUrl, cfgUrl)

  if (!orgOk || !pedidoOk) {
    process.exit(1)
  }

  console.log('[kit-integracao] Concluido — pronto para validar no Railway Data.')
}

void main().catch((err) => {
  console.error('[kit-integracao] ERRO', err instanceof Error ? err.message : err)
  process.exit(1)
})
