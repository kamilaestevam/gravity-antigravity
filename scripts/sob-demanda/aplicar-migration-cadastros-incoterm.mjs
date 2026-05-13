// Aplica migration 20260513000000_add_incoterm_table no banco de Cadastros.
// Idempotente: usa CREATE TABLE IF NOT EXISTS + ON CONFLICT DO NOTHING no seed.
//
// Uso: DATABASE_URL=<url_cadastros> node scripts/sob-demanda/aplicar-migration-cadastros-incoterm.mjs
//
// Aplicar em cada banco de Cadastros (prod, teste, dev) trocando a URL.

import pg from 'pg'
import { readFileSync } from 'fs'
import { createHash } from 'crypto'
const { Client } = pg

const url = process.env.DATABASE_URL ?? process.env.CADASTROS_DATABASE_URL
if (!url) {
  console.error('DATABASE_URL ou CADASTROS_DATABASE_URL ausente'); process.exit(1)
}

const MIGRATION_NAME = '20260513000000_add_incoterm_table'
const sql = readFileSync(
  'servicos-global/cadastros/prisma/migrations/' + MIGRATION_NAME + '/migration.sql',
  'utf-8'
)
const checksum = createHash('sha256').update(sql).digest('hex')

const client = new Client({ connectionString: url })
await client.connect()

// Verifica se ja aplicou (idempotencia)
const check = await client.query(
  `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL`,
  [MIGRATION_NAME]
).catch(() => ({ rows: [] }))

if (check.rows.length > 0) {
  console.log('ja aplicado, nada a fazer')
  await client.end()
  process.exit(0)
}

try {
  await client.query('BEGIN')

  // Registra started
  await client.query(
    `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
     VALUES (gen_random_uuid()::text, $1, NULL, $2, NULL, NULL, NOW(), 0)
     ON CONFLICT (id) DO NOTHING`,
    [checksum, MIGRATION_NAME]
  )

  // Aplica DDL + seed
  await client.query(sql)

  // Marca como concluido
  await client.query(
    `UPDATE "_prisma_migrations"
     SET finished_at = NOW(), applied_steps_count = 1
     WHERE migration_name = $1`,
    [MIGRATION_NAME]
  )

  await client.query('COMMIT')

  const count = await client.query('SELECT COUNT(*) FROM "incoterm"')
  console.log(`OK — ${count.rows[0].count} incoterms na tabela`)
} catch (e) {
  await client.query('ROLLBACK').catch(() => {})
  console.error('ERRO:', e.message)
  process.exitCode = 1
}

await client.end()
