import pg from 'pg'

const { Client } = pg
const client = new Client({ connectionString: process.env.ORGANIZACAO_DATABASE_URL })

async function main() {
  await client.connect()
  const tabelas = await client.query<{ table_name: string }>(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_name NOT LIKE 'pg_%'
    ORDER BY table_name
  `)
  const linhas: { tabela: string; n: string }[] = []
  for (const { table_name } of tabelas.rows) {
    try {
      const c = await client.query<{ n: string }>(`SELECT COUNT(*)::text AS n FROM "${table_name}"`)
      linhas.push({ tabela: table_name, n: c.rows[0].n })
    } catch (e) {
      linhas.push({ tabela: table_name, n: `ERR ${(e as Error).message}` })
    }
  }
  // Só mostra as não-vazias
  const naoVazias = linhas.filter(l => l.n !== '0')
  console.log('=== Tabelas com dados ===')
  console.table(naoVazias)
  console.log(`Total tabelas: ${linhas.length} | Não-vazias: ${naoVazias.length}`)
  await client.end()
}
main().catch((e) => { console.error(e); process.exit(1) })
