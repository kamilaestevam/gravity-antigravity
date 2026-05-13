// Aplica migration 20260512000000_pedido_item_unidades_peso_cubagem
// em todos os schemas tenant_* do banco do produto Pedido.
// Idempotente: usa _prisma_migrations para nao reaplicar.
//
// Uso: DATABASE_URL=<url_pedido> node scripts/sob-demanda/aplicar-migration-pedido-unidades.mjs
import pg from 'pg'
import { readFileSync } from 'fs'
import { createHash } from 'crypto'
const { Client } = pg

const url = process.env.DATABASE_URL
if (!url) { console.error('DATABASE_URL missing'); process.exit(1) }

const MIGRATION_NAME = '20260512000000_pedido_item_unidades_peso_cubagem'
const sql = readFileSync(
  'servicos-global/produto/pedido/prisma/migrations/' + MIGRATION_NAME + '/migration.sql',
  'utf-8'
)
const checksum = createHash('sha256').update(sql).digest('hex')

const client = new Client({ connectionString: url })
await client.connect()

const r = await client.query(`
  SELECT schema_name FROM information_schema.schemata
  WHERE schema_name LIKE 'tenant_%'
  ORDER BY schema_name
`)
const schemas = r.rows.map(x => x.schema_name)
console.log('Encontrados', schemas.length, 'tenants:', schemas)

for (const schema of schemas) {
  console.log('\n→', schema)
  // Verifica se ja aplicou
  const check = await client.query(
    `SELECT 1 FROM "${schema}"."_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL`,
    [MIGRATION_NAME]
  ).catch(() => ({ rows: [] }))
  if (check.rows.length > 0) {
    console.log('  ja aplicado, pulando')
    continue
  }

  try {
    await client.query('BEGIN')
    await client.query(`SET search_path TO "${schema}", public`)

    // Registra started
    await client.query(
      `INSERT INTO "${schema}"."_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
       VALUES (gen_random_uuid()::text, $1, NULL, $2, NULL, NULL, NOW(), 0)
       ON CONFLICT (id) DO NOTHING`,
      [checksum, MIGRATION_NAME]
    )

    // Aplica DDL — schema search_path ja apontando pro tenant
    await client.query(sql)

    // Marca como concluido
    await client.query(
      `UPDATE "${schema}"."_prisma_migrations"
       SET finished_at = NOW(), applied_steps_count = 1
       WHERE migration_name = $1`,
      [MIGRATION_NAME]
    )

    await client.query('COMMIT')
    console.log('  OK')
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('  ERRO:', e.message)
    process.exitCode = 1
  }
}

await client.end()
