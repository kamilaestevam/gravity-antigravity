// Verifica se a coluna 'incoterm_pedido' existe em todos os schemas de pedido.
// Uso: DATABASE_URL=<url> node scripts/sob-demanda/diagnostico-incoterm-pedido.mjs
import pg from 'pg'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

// Lista TODOS os schemas (public + tenants) e verifica colunas críticas no `pedido`
const r = await client.query(`
  SELECT schema_name FROM information_schema.schemata
  WHERE schema_name = 'public' OR schema_name LIKE 'tenant_%'
  ORDER BY schema_name
`)

const camposCheck = [
  'incoterm', 'incoterm_pedido',
  'condicao_pagamento', 'condicao_pagamento_pedido',
  'moeda', 'moeda_pedido',
  'data_emissao_pedido',
  'referencia_importador', 'referencia_importador_pedido',
]

for (const row of r.rows) {
  const sch = row.schema_name
  console.log('\n===', sch)
  // Verifica se tabela pedido existe
  const t = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema=$1 AND table_name IN ('pedido','pedidos_comerciais')`,
    [sch]
  )
  if (t.rows.length === 0) {
    console.log('  (sem tabela pedido/pedidos_comerciais)')
    continue
  }
  for (const tab of t.rows) {
    const tName = tab.table_name
    console.log(`  Tabela ${tName}:`)
    for (const campo of camposCheck) {
      const c = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 AND column_name=$3`,
        [sch, tName, campo]
      )
      console.log(`    ${campo}: ${c.rows.length > 0 ? 'EXISTE' : 'AUSENTE'}`)
    }
  }
}
await client.end()
