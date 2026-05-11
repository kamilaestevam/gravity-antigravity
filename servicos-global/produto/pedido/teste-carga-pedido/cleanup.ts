/**
 * Remove todos os pedidos com prefixo CARGA-* da CDE.
 *
 * Uso: tsx cleanup.ts
 */

import { Client } from 'pg'

const ID_ORGANIZACAO = 'cmoarq22a000l1358c1p2qfqt' // CDE
// NOTA: Prisma usa public.* (não tenant_<id>). Ver seed.ts para detalhes.
const SCHEMA_PG      = 'public'

const DATABASE_URL = process.env.DATABASE_URL
  ?? 'postgresql://postgres:JDyhCkVTaLUBsyKCHzzOdFFcjAUnYdKX@roundhouse.proxy.rlwy.net:39426/railway'

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  await client.query(`SET search_path TO "${SCHEMA_PG}", public`)

  const cntAntes = await client.query(`SELECT COUNT(*)::int AS n FROM "${SCHEMA_PG}".pedido WHERE numero_pedido LIKE 'CARGA-%'`)
  const cntItensAntes = await client.query(`SELECT COUNT(*)::int AS n FROM "${SCHEMA_PG}".pedido_item WHERE id_pedido IN (SELECT id_pedido FROM "${SCHEMA_PG}".pedido WHERE numero_pedido LIKE 'CARGA-%')`)
  console.log(`[cleanup] pedidos CARGA-* antes: ${cntAntes.rows[0].n}`)
  console.log(`[cleanup] itens CARGA-* antes: ${cntItensAntes.rows[0].n}`)

  await client.query('BEGIN')
  try {
    // pedido_transferencia.id_pedido_origem é ON DELETE RESTRICT — limpar antes
    const delTransf = await client.query(`
      DELETE FROM "${SCHEMA_PG}".pedido_transferencia
      WHERE id_pedido_origem IN (
        SELECT id_pedido FROM "${SCHEMA_PG}".pedido WHERE numero_pedido LIKE 'CARGA-%'
      )
    `)
    if ((delTransf.rowCount ?? 0) > 0) {
      console.log(`[cleanup] DELETE pedido_transferencia — ${delTransf.rowCount} linhas (FK RESTRICT)`)
    }
    const del = await client.query(`DELETE FROM "${SCHEMA_PG}".pedido WHERE numero_pedido LIKE 'CARGA-%'`)
    console.log(`[cleanup] DELETE pedido — ${del.rowCount ?? 0} linhas (itens vao por cascade)`)
    await client.query('COMMIT')
    console.log('[cleanup] OK')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[cleanup] ROLLBACK — erro:', err)
    process.exit(2)
  } finally {
    await client.end()
  }
}

main().catch((e) => {
  console.error('[cleanup] ERRO FATAL:', e)
  process.exit(1)
})
