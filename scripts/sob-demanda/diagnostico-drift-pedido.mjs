import pg from 'pg'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

// Lista pedido_item em public e nos tenants
const r = await client.query(`
  SELECT table_schema, table_name FROM information_schema.tables
  WHERE table_name IN ('pedido_item','pedido_itens')
  ORDER BY table_schema, table_name
`)
console.log('TABELAS pedido_item / pedido_itens NO BANCO:')
for (const row of r.rows) console.log(' ', row.table_schema + '.' + row.table_name)

console.log('\nCOLUNAS de public.pedido_item (se existir):')
const c = await client.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema='public' AND table_name='pedido_item' ORDER BY column_name
`)
for (const row of c.rows) console.log(' ', row.column_name)
console.log('  total:', c.rows.length)

// Verifica _prisma_migrations em cada tenant
console.log('\n_prisma_migrations em cada tenant:')
for (const sch of ['tenant_cmo4vtp3i0000m86ft8vt5vnu', 'tenant_cmo6henln0000ly9mwvx3zbia', 'tenant_cmoarq22a000l1358c1p2qfqt']) {
  const m = await client.query(
    `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=$1 AND table_name='_prisma_migrations'`,
    [sch]
  )
  console.log(' ', sch, '_prisma_migrations existe:', m.rows[0].count > 0)
}

await client.end()
