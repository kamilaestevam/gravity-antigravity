/**
 * aplicar-migrations-pedido.ts — Aplica migrations pendentes do Pedido (public + tenant_*).
 *
 * 1. Logística + DDL críticos (id_processo, lista_painel) em tenant_* — não depende de migrate deploy.
 * 2. prisma migrate deploy (public) — falha P3009 não aborta o restante.
 * 3. migrate-all-tenants — demais migrations por schema.
 */
import { execSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'
import {
  aplicarIdProcessoEmSchemasComPedido,
  aplicarListaPainelEmSchemasComPedido,
  listarSchemasComTabelaPedido,
} from './aplicar-migration-ddl-schemas-pedido.js'

const REPO_ROOT = resolve(import.meta.dirname, '../..')
const PEDIDO_SCHEMA = 'servicos-global/produto/pedido/prisma/schema.prisma'
const MIGRATION_LOGISTICA = '20260525150000_pedido_logistica_cadastros_ssot'

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
  try {
    const host = url.split('@')[1]?.split('/')[0]
    return host ? `***@${host}` : '(url invalida)'
  } catch {
    return '(url invalida)'
  }
}

/** Aplica DDL logístico em cada schema que já tem tabela pedido (inclui tenant_*). */
async function aplicarLogisticaEmTodosSchemas(pedidoUrl: string): Promise<void> {
  const sqlPath = join(
    REPO_ROOT,
    'servicos-global/produto/pedido/prisma/migrations',
    MIGRATION_LOGISTICA,
    'migration.sql',
  )
  const sql = readFileSync(sqlPath, 'utf-8')
  const checksum = createHash('sha256').update(sql).digest('hex')

  const client = new Client({ connectionString: pedidoUrl })
  await client.connect()

  try {
    const schemaNames = await listarSchemasComTabelaPedido(client)
    const rows = schemaNames.map(table_schema => ({ table_schema }))

    if (rows.length === 0) {
      console.warn(
        '[migrations-pedido] Nenhum schema com tabela pedido — skip Passo 1 (prisma migrate deploy cuidará do public).',
      )
      return
    }

    console.log(`[migrations-pedido] Schemas com tabela pedido: ${rows.map(r => r.table_schema).join(', ')}`)

    for (const { table_schema: schemaName } of rows) {
      console.log(`[migrations-pedido] → ${schemaName}`)

      await client.query('BEGIN')
      try {
        await client.query(`SET LOCAL search_path TO "${schemaName}", public`)
        await client.query(CREATE_MIGRATIONS_TABLE)

        const jaAplicada = await client.query<{ n: string }>(
          `SELECT COUNT(*)::text AS n FROM "_prisma_migrations"
           WHERE migration_name = $1 AND finished_at IS NOT NULL AND rolled_back_at IS NULL`,
          [MIGRATION_LOGISTICA],
        )
        if (parseInt(jaAplicada.rows[0]?.n ?? '0', 10) > 0) {
          console.log(`[migrations-pedido]   migration ${MIGRATION_LOGISTICA} ja aplicada — skip DDL`)
          await client.query('ROLLBACK')
          continue
        }

        const migrationId = randomUUID()
        await client.query(
          `INSERT INTO "_prisma_migrations"
             (id, checksum, migration_name, started_at, applied_steps_count)
           VALUES ($1, $2, $3, now(), 0)`,
          [migrationId, checksum, MIGRATION_LOGISTICA],
        )

        await client.query(sql)

        await client.query(
          `UPDATE "_prisma_migrations"
           SET finished_at = now(), applied_steps_count = 1
           WHERE id = $1`,
          [migrationId],
        )

        await client.query('COMMIT')
        console.log(`[migrations-pedido]   OK — colunas local_de_* e aeroporto_* garantidas`)
      } catch (err) {
        await client.query('ROLLBACK')
        const msg = err instanceof Error ? err.message : String(err)
        throw new Error(`[migrations-pedido] Falha em schema "${schemaName}": ${msg}`)
      }
    }
  } finally {
    await client.end()
  }
}

export async function aplicarMigrationsPedido(): Promise<void> {
  const pedidoUrl = process.env.PEDIDO_DATABASE_URL
  if (!pedidoUrl) {
    console.error('[migrations-pedido] ERRO: PEDIDO_DATABASE_URL ausente.')
    process.exit(1)
  }

  const configuradorUrl =
    process.env.CONFIGURADOR_DATABASE_URL ?? process.env.DATABASE_URL

  console.log(`[migrations-pedido] Banco Pedido: ${mascararUrl(pedidoUrl)}`)
  console.log(
    `[migrations-pedido] Configurador: ${configuradorUrl ? mascararUrl(configuradorUrl) : 'AUSENTE'}`,
  )

  console.log('[migrations-pedido] Passo 1/5 — logística em todos os schemas com pedido...')
  await aplicarLogisticaEmTodosSchemas(pedidoUrl)

  console.log('[migrations-pedido] Passo 2/5 — id_processo (nullable, sem backfill)...')
  await aplicarIdProcessoEmSchemasComPedido(pedidoUrl)

  console.log('[migrations-pedido] Passo 3/5 — lista_painel_usuario_global...')
  await aplicarListaPainelEmSchemasComPedido(pedidoUrl)

  execSync('npx tsx scripts/ativamente/compose-pedido-schema.ts', {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  })

  console.log('[migrations-pedido] Passo 4/5 — prisma migrate deploy (public, best-effort)...')
  try {
    execSync(`npx prisma migrate deploy --schema=${PEDIDO_SCHEMA}`, {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: pedidoUrl },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[migrations-pedido] migrate deploy falhou (continua):', msg.split('\n')[0] ?? msg)
    if (msg.includes('P3009')) {
      console.warn(
        '[migrations-pedido] P3009 em public — DDL em tenant_* já aplicado nos passos 2–3; migrate-all-tenants segue.',
      )
    }
  }

  if (!configuradorUrl) {
    console.warn('[migrations-pedido] Passo 5/5 skip — sem URL do Configurador para migrate-all-tenants.')
    console.log('[migrations-pedido] Concluido (logística + id_processo + lista_painel).')
    return
  }

  console.log('[migrations-pedido] Passo 5/5 — migrate-all-tenants...')
  try {
    execSync('npx tsx scripts/ativamente/migrate-all-tenants.ts --product=pedido', {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: pedidoUrl,
        CONFIGURADOR_DATABASE_URL: configuradorUrl,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[migrations-pedido] migrate-all-tenants falhou:', msg.split('\n')[0] ?? msg)
  }

  console.log('[migrations-pedido] Concluido.')
}

const isMain =
  process.argv[1] !== undefined &&
  resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1])

if (isMain) {
  aplicarMigrationsPedido().catch(err => {
    console.error('[migrations-pedido] ERRO FATAL:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
