import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const sqlPath = join(root, 'configurador/prisma/sql-manual/2026-06-15-taxa-moeda-sync-agendamento-producao.sql')
const url = process.env.CONFIGURADOR_DATABASE_URL ?? process.env.DATABASE_URL

if (!url) {
  console.error('CONFIGURADOR_DATABASE_URL ausente')
  process.exit(1)
}

const sql = readFileSync(sqlPath, 'utf-8')
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })

await client.connect()

const host = await client.query('SELECT inet_server_addr() AS ip, current_database() AS db')
console.log('Conectado:', host.rows[0])

const before = await client.query(`
  SELECT tablename FROM pg_tables
  WHERE schemaname = 'public' AND tablename = 'taxa_moeda_sync_agendamento'
`)
console.log('Antes:', before.rows)

await client.query(sql)

const after = await client.query(`
  SELECT * FROM taxa_moeda_sync_agendamento ORDER BY id_taxa_moeda_sync_agendamento
`)
console.log('Depois — linhas:', after.rowCount)
for (const row of after.rows) {
  console.log(row.id_taxa_moeda_sync_agendamento, row.ativo_taxa_moeda_sync_agendamento, row.frequencia_taxa_moeda_sync_agendamento)
}

const cols = await client.query(`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'taxa_moeda_sync_agendamento'
  ORDER BY ordinal_position
`)
console.log('Colunas:')
for (const c of cols.rows) console.log(`  ${c.column_name} (${c.data_type})`)

await client.end()
