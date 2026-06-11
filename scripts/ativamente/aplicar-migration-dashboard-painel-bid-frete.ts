/**
 * Aplica migration 20260605130000_create_dashboard_painel_usuario_global no banco BID Frete.
 * Uso: npx tsx scripts/ativamente/aplicar-migration-dashboard-painel-bid-frete.ts
 */
import { createHash, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Client } from 'pg'

const REPO = resolve(import.meta.dirname, '../..')
const MIGRATION = '20260605130000_create_dashboard_painel_usuario_global'
const SQL_PATH = join(
  REPO,
  'servicos-global/produto/bid-frete-internacional/prisma/migrations',
  MIGRATION,
  'migration.sql',
)

function lerDatabaseUrl(): string {
  const envLocal = join(REPO, '.env.local')
  const raw = readFileSync(envLocal, 'utf8')
  const line = raw.split('\n').find(l => l.startsWith('BID_FRETE_INTERNATIONAL_DATABASE_URL='))
  if (!line) throw new Error('BID_FRETE_INTERNATIONAL_DATABASE_URL ausente em .env.local')
  return line.replace('BID_FRETE_INTERNATIONAL_DATABASE_URL=', '').trim()
}

async function main(): Promise<void> {
  const url = lerDatabaseUrl()
  const sql = readFileSync(SQL_PATH, 'utf8')
  const client = new Client({ connectionString: url })
  await client.connect()

  try {
    const { rows } = await client.query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'dashboard_painel_usuario_global'
      ) AS exists`,
    )
    if (rows[0]?.exists) {
      console.log('[dashboard-painel] Tabela já existe — nada a fazer.')
      return
    }

    await client.query(sql)

    const migTable = await client.query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = '_prisma_migrations'
      ) AS exists`,
    )
    if (migTable.rows[0]?.exists) {
      const checksum = createHash('sha256').update(sql).digest('hex')
      await client.query(
        `INSERT INTO "_prisma_migrations"
          (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count)
         VALUES ($1, $2, now(), $3, null, now(), 1)
         ON CONFLICT DO NOTHING`,
        [randomUUID(), checksum, MIGRATION],
      )
    }

    console.log('[dashboard-painel] Tabela dashboard_painel_usuario_global criada.')
  } finally {
    await client.end()
  }
}

main().catch(err => {
  console.error('[dashboard-painel] ERRO:', err)
  process.exit(1)
})
