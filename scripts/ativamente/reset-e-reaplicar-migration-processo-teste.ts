/**
 * reset-e-reaplicar-migration-processo-teste.ts
 * Uso único: banco teste vazio ou UI Railway desincronizada.
 * NÃO usar em producao.
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Client } from 'pg'

const REPO = resolve(import.meta.dirname, '../..')
const SCHEMA = join(REPO, 'servicos-global/produto/processo/prisma/schema.prisma')
const MIGRATION_SQL = join(
  REPO,
  'servicos-global/produto/processo/prisma/migrations/20260601120000_schema_ddd_processo_hibrido/migration.sql',
)

const url = process.env.DATABASE_URL
if (!url) {
  console.error('[processo-teste] DATABASE_URL ausente')
  process.exit(1)
}

const client = new Client({ connectionString: url })
await client.connect()

const before = await client.query<{ tablename: string }>(
  `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
)
console.log('[processo-teste] Antes:', before.rows.map(r => r.tablename).join(', ') || '(vazio)')

await client.query('DROP SCHEMA public CASCADE')
await client.query('CREATE SCHEMA public')
await client.query('GRANT ALL ON SCHEMA public TO public')

const sql = readFileSync(MIGRATION_SQL, 'utf-8')
await client.query(sql)

await client.end()

execSync('node server/scripts/compose-schema.js', {
  cwd: join(REPO, 'servicos-global/produto/processo'),
  stdio: 'inherit',
})
execSync(`npx prisma migrate resolve --applied 20260601120000_schema_ddd_processo_hibrido --schema=${SCHEMA}`, {
  stdio: 'inherit',
})

const verify = new Client({ connectionString: url })
await verify.connect()
const after = await verify.query<{ tablename: string }>(
  `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
)
console.log('[processo-teste] Depois:', after.rows.map(r => r.tablename).join(', '))
await verify.end()

console.log('[processo-teste] OK — schema DDD reaplicado.')
