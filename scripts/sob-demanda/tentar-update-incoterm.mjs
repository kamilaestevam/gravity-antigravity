import pg from 'pg'
const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

try {
  console.log('Lendo valor atual...')
  const before = await client.query(
    `SELECT id_pedido, incoterm_pedido FROM public.pedido WHERE id_pedido = $1`,
    ['cmp35ays0ajcwj2dt00026000']
  )
  console.log('Antes:', before.rows[0])

  console.log('Tentando UPDATE para CFR...')
  const upd = await client.query(
    `UPDATE public.pedido SET incoterm_pedido = $1 WHERE id_pedido = $2 RETURNING id_pedido, incoterm_pedido`,
    ['CFR', 'cmp35ays0ajcwj2dt00026000']
  )
  console.log('Resultado:', upd.rows[0])
} catch (e) {
  console.error('ERRO:', e.message)
}

await client.end()
