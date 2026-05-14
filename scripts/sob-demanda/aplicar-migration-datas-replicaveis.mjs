// Aplica migration 20260513120000_pedido_item_datas_replicaveis
// em public.pedido_item (modelo mono-schema atual, drift schema-per-tenant
// pre-existente). Idempotente: usa _prisma_migrations.
//
// Uso: DATABASE_URL=<url_pedido> node scripts/sob-demanda/aplicar-migration-datas-replicaveis.mjs
import pg from 'pg'
import { readFileSync } from 'fs'
import { createHash } from 'crypto'
const { Client } = pg

const url = process.env.DATABASE_URL
if (!url) { console.error('DATABASE_URL missing'); process.exit(1) }

const MIGRATION_NAME = '20260513120000_pedido_item_datas_replicaveis'
const sql = readFileSync(
  'servicos-global/produto/pedido/prisma/migrations/' + MIGRATION_NAME + '/migration.sql',
  'utf-8'
)
const checksum = createHash('sha256').update(sql).digest('hex')

const client = new Client({ connectionString: url })
await client.connect()

// Verifica se ja aplicou
const check = await client.query(
  `SELECT 1 FROM "public"."_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL`,
  [MIGRATION_NAME]
).catch(() => ({ rows: [] }))

if (check.rows.length > 0) {
  console.log('Migration ja aplicada, pulando')
  await client.end()
  process.exit(0)
}

try {
  await client.query('BEGIN')
  await client.query(`SET search_path TO "public"`)

  // Aplica DDL
  await client.query(sql)

  // Registra em _prisma_migrations
  await client.query(
    `INSERT INTO "public"."_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
     VALUES (gen_random_uuid()::text, $1, NOW(), $2, NULL, NULL, NOW(), 1)
     ON CONFLICT (id) DO NOTHING`,
    [checksum, MIGRATION_NAME]
  )

  await client.query('COMMIT')
  console.log('Migration aplicada com sucesso')
} catch (e) {
  await client.query('ROLLBACK').catch(() => {})
  console.error('ERRO:', e.message)
  process.exitCode = 1
}

await client.end()
