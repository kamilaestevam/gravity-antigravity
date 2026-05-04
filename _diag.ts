import pg from 'pg'

const { Client } = pg
const client = new Client({ connectionString: process.env.ORGANIZACAO_DATABASE_URL })

async function main() {
  await client.connect()

  const tabelas = await client.query<{ table_name: string }>(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public'
      AND (table_name ILIKE '%histor%' OR table_name='_prisma_migrations')
    ORDER BY table_name
  `)
  console.log('=== Tabelas de histórico ===')
  console.table(tabelas.rows)

  const migr = await client.query<{ migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }>(`
    SELECT migration_name, finished_at, rolled_back_at
    FROM "_prisma_migrations"
    ORDER BY started_at DESC
    LIMIT 20
  `).catch((err) => {
    console.log('Erro lendo _prisma_migrations:', err.message)
    return null
  })
  if (migr) {
    console.log('=== Últimas 20 migrations rastreadas ===')
    console.table(migr.rows)
  }

  // Colunas reais de historico_log e HistoryLog
  for (const t of ['historico_log', 'HistoryLog']) {
    const cols = await client.query<{ column_name: string; data_type: string }>(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`,
      [t],
    )
    console.log(`=== Colunas de "${t}" (${cols.rowCount}) ===`)
    if (cols.rowCount) console.table(cols.rows)
  }

  // Contagem de linhas
  for (const t of ['historico_log', 'HistoryLog']) {
    try {
      const c = await client.query<{ n: string }>(`SELECT COUNT(*)::text AS n FROM "${t}"`)
      console.log(`=== Linhas em "${t}": ${c.rows[0].n} ===`)
    } catch (err) {
      console.log(`=== "${t}" indisponível: ${(err as Error).message} ===`)
    }
  }

  await client.end()
}

main().catch((e) => {
  console.error('FATAL', e)
  process.exit(1)
})
