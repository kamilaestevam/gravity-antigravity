/**
 * aplicar-kit-integracao-sap.ts — Aplica DDL do kit Gravity ↔ SAP (org DB + pedido DB).
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/ativamente/aplicar-kit-integracao-sap.ts
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
const MIGRATION_PEDIDO_NAME = '20260714180000_pedido_referencia_externa_erp'

async function aplicarSql(url: string, label: string, sqlPath: string): Promise<boolean> {
  const sql = readFileSync(sqlPath, 'utf-8')
  const client = new Client({ connectionString: url })
  try {
    await client.connect()
    await client.query(sql)
    console.log(`[kit-integracao] OK ${label}`)
    return true
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[kit-integracao] FALHA ${label}:`, msg)
    return false
  } finally {
    await client.end().catch(() => undefined)
  }
}

async function main(): Promise<void> {
  const orgUrl = process.env.ORGANIZACAO_DATABASE_URL?.trim()
  const pedidoUrl = process.env.DATABASE_URL?.trim()

  if (!orgUrl) {
    console.error('[kit-integracao] ORGANIZACAO_DATABASE_URL ausente')
    process.exit(1)
  }
  if (!pedidoUrl) {
    console.error('[kit-integracao] DATABASE_URL ausente')
    process.exit(1)
  }

  const orgOk = await aplicarSql(orgUrl, 'api-cockpit (org DB)', MIGRATION_ORG)

  let pedidoOk = true
  try {
    await aplicarMigrationEmSchemasComPedido(
      pedidoUrl,
      MIGRATION_PEDIDO_NAME,
      'kit-integracao-pedido',
      process.env.CONFIGURADOR_DATABASE_URL ?? process.env.DATABASE_URL,
    )
    console.log('[kit-integracao] OK pedido (referencia_externa_erp em tenant_*)')
  } catch (err) {
    pedidoOk = false
    console.error('[kit-integracao] FALHA pedido:', err instanceof Error ? err.message : err)
  }

  if (!orgOk || !pedidoOk) {
    process.exit(1)
  }

  console.log('[kit-integracao] Migrations aplicadas. Rode: npm run db:compose && prisma generate (servicos-plataforma + pedido compose).')
}

void main()
