import pg from 'pg'
const { Client } = pg
const client = new Client({ connectionString: process.env.ORGANIZACAO_DATABASE_URL })
async function main() {
  await client.connect()
  const m = await client.query(`SELECT migration_name, finished_at, rolled_back_at, logs FROM "_prisma_migrations" ORDER BY started_at`)
  console.log('=== Migrations rastreadas ===')
  console.table(m.rows.map(r => ({ migration: r.migration_name, finished: !!r.finished_at, failed: !r.finished_at && !!r.logs })))
  const tabs = await client.query<{ table_name: string }>(`
    SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`)
  console.log(`=== ${tabs.rowCount} tabelas em public ===`)
  console.log(tabs.rows.map(r => r.table_name).join(', '))
  await client.end()
}
main().catch(e => { console.error(e); process.exit(1) })
