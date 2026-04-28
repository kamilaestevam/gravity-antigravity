import pg from 'pg'
const { Client } = pg

const client = new Client({ connectionString: 'postgresql://postgres:OvRQCUyrcAQTEHAYeeeEUqvKjdtiMPiI@gondola.proxy.rlwy.net:24197/railway?schema=pedido' })
await client.connect()
const res = await client.query('SELECT DISTINCT tenant_id FROM pedidos LIMIT 3')
console.log(JSON.stringify(res.rows))
await client.end()
