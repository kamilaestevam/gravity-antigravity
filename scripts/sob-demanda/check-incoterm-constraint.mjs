import pg from 'pg'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const r = await client.query(`
  SELECT
    column_name, data_type, character_maximum_length, is_nullable, column_default,
    udt_name
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'pedido' AND column_name LIKE 'incoterm%'
`)
console.log('Colunas incoterm em public.pedido:')
for (const row of r.rows) console.log(' ', row)

const chk = await client.query(`
  SELECT conname, pg_get_constraintdef(c.oid) AS def
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public' AND t.relname = 'pedido' AND c.contype = 'c'
`)
console.log('\nCHECK constraints em public.pedido:')
for (const row of chk.rows) console.log(' ', row.conname, '→', row.def)

// Tenta um UPDATE manual
const upd = await client.query(`SELECT count(*) FROM public.pedido WHERE id_pedido = $1`, ['cmp35ays0ajcwj2dt00026000'])
console.log('\nPedido com id cmp35ays0ajcwj2dt00026000:', upd.rows[0].count)

await client.end()
