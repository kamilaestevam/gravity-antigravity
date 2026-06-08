/**
 * Verifica tipo_volume em todo schema que tenha pedido OU pedido_item.
 */
import pg from 'pg'

const url = process.env.PEDIDO_DATABASE_URL
if (!url) {
  console.error('PEDIDO_DATABASE_URL ausente')
  process.exit(1)
}

const client = new pg.Client({ connectionString: url })
await client.connect()

const { rows: schemas } = await client.query<{ schema_name: string }>(`
  SELECT DISTINCT n.nspname AS schema_name
  FROM pg_namespace n
  INNER JOIN pg_class c ON c.relnamespace = n.oid
  WHERE c.relname IN ('pedido', 'pedido_item')
    AND c.relkind IN ('r', 'p')
    AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  ORDER BY n.nspname
`)

let faltando = 0
for (const { schema_name } of schemas) {
  const { rows: temPedido } = await client.query(
    `SELECT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = $1 AND c.relname = 'pedido'
    ) AS ok`,
    [schema_name],
  )
  const { rows: temItem } = await client.query(
    `SELECT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = $1 AND c.relname = 'pedido_item'
    ) AS ok`,
    [schema_name],
  )

  let pedidoCol = true
  let itemCol = true
  if (temPedido[0]?.ok) {
    const { rows } = await client.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = 'pedido' AND column_name = 'tipo_volume_pedido'
      ) AS ok`,
      [schema_name],
    )
    pedidoCol = rows[0]?.ok ?? false
  }
  if (temItem[0]?.ok) {
    const { rows } = await client.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = 'pedido_item' AND column_name = 'tipo_volume_item'
      ) AS ok`,
      [schema_name],
    )
    itemCol = rows[0]?.ok ?? false
  } else {
    itemCol = true
  }

  const ok = pedidoCol && itemCol
  console.log(
    `${schema_name}: ${ok ? 'OK' : 'FALTA'} (pedido=${temPedido[0]?.ok ? (pedidoCol ? 'col-ok' : 'col-falta') : '-'} item=${temItem[0]?.ok ? (itemCol ? 'col-ok' : 'col-falta') : '-'})`,
  )
  if (!ok) faltando++
}

console.log(`\nTotal schemas com pedido/pedido_item: ${schemas.length}, faltando: ${faltando}`)
await client.end()
process.exit(faltando > 0 ? 1 : 0)
