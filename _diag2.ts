import pg from 'pg'

const { Client } = pg
const client = new Client({ connectionString: process.env.ORGANIZACAO_DATABASE_URL })

async function main() {
  await client.connect()
  const all = await client.query<{ table_name: string }>(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' ORDER BY table_name
  `)
  console.log(`=== ${all.rowCount} tabelas em public ===`)
  console.log(all.rows.map(r => r.table_name).join('\n'))
  await client.end()
}
main().catch((e) => { console.error(e); process.exit(1) })
