/**
 * Verifica existência da tabela taxa_moeda_sync_agendamento e seeds ptax/focus.
 * Usado no CI migrate-configurador-producao (exit 1 se ausente).
 */
import pg from 'pg'

const url = process.env.CONFIGURADOR_DATABASE_URL ?? process.env.DATABASE_URL

if (!url) {
  console.error('CONFIGURADOR_DATABASE_URL ausente')
  process.exit(1)
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()

  const tabela = await client.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'taxa_moeda_sync_agendamento'
  `)

  if (!tabela.rows.length) {
    console.error('FALHA: tabela taxa_moeda_sync_agendamento AUSENTE')
    process.exit(1)
  }

  const rows = await client.query(`
    SELECT id_taxa_moeda_sync_agendamento FROM taxa_moeda_sync_agendamento ORDER BY 1
  `)
  const ids = rows.rows.map(r => String(r.id_taxa_moeda_sync_agendamento))
  console.log('tabela: taxa_moeda_sync_agendamento')
  console.log('registros:', ids.join(', ') || '(vazio)')

  for (const esperado of ['ptax', 'focus'] as const) {
    if (!ids.includes(esperado)) {
      console.error(`FALHA: seed "${esperado}" ausente`)
      process.exit(1)
    }
  }

  console.log('OK — taxa_moeda_sync_agendamento pronta')
} finally {
  await client.end()
}
