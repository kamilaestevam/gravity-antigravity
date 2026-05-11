/**
 * Seed de pedidos para teste de carga.
 *
 * Uso:
 *   tsx seed.ts --count=10
 *   tsx seed.ts --count=100
 *   tsx seed.ts --count=500
 *   tsx seed.ts --count=1000
 *   tsx seed.ts --count=5000
 *   tsx seed.ts --count=10000
 *
 * Comportamento:
 *   - Conecta no banco do Pedido (Railway), schema "public"
 *   - DELETE FROM pedido WHERE numero_pedido LIKE 'CARGA-%' (zera execucao anterior)
 *   - Gera N pedidos com distribuicao 30/40/30 entre tiers 100/70/50
 *   - Cada pedido tem 1-15 itens (distribuicao triangular, media 5)
 *   - Tudo numa transacao atomica
 *   - INSERT em chunks de 50 linhas para evitar query gigante
 */

import { Client } from 'pg'
import {
  gerarPedido,
  gerarItensDoPedido,
  rndQtdItens,
  type PedidoGerado,
  type ItemGerado,
  type ContextoGeracao,
} from './shared/gerador.js'
import { distribuirTiers } from './shared/tiers.js'

// ────────────────────────────────────────────────────────────────────────────
// CONFIG
// ────────────────────────────────────────────────────────────────────────────

const ID_ORGANIZACAO = 'cmoarq22a000l1358c1p2qfqt' // CDE
const ID_WORKSPACE   = 'cmosr1zc70001v2hfp3bxax4s' // CDE EXPORTADOR
// NOTA ARQUITETURAL — descoberto em 2026-05-08:
// Apesar do design "schema-per-tenant" (`tenant_<id_organizacao>`), o Prisma 5.22
// SEMPRE qualifica queries com `"public"."pedido"`, ignorando `SET LOCAL search_path`.
// Por isso TODOS os dados reais residem em `public.*`. Os schemas tenant_* são
// fantasmas (nunca são lidos pelo Prisma client). Isolamento por organização é
// garantido pelo filtro `WHERE id_organizacao = ...` em cada query.
const SCHEMA_PG      = 'public'

const DATABASE_URL = process.env.DATABASE_URL
  ?? 'postgresql://postgres:JDyhCkVTaLUBsyKCHzzOdFFcjAUnYdKX@roundhouse.proxy.rlwy.net:39426/railway'

// ────────────────────────────────────────────────────────────────────────────
// CLI
// ────────────────────────────────────────────────────────────────────────────

const COUNTS_VALIDOS = [10, 100, 500, 1000, 5000, 10000] as const
const arg = process.argv.find((a) => a.startsWith('--count='))
const count = arg ? parseInt(arg.split('=')[1] ?? '0', 10) : 0
if (!COUNTS_VALIDOS.includes(count as typeof COUNTS_VALIDOS[number])) {
  console.error(`Uso: tsx seed.ts --count=${COUNTS_VALIDOS.join('|')}`)
  process.exit(1)
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers de INSERT dinamico
// ────────────────────────────────────────────────────────────────────────────

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`
}

function buildInsertSql(table: string, rows: Record<string, unknown>[]): { sql: string; values: unknown[] } {
  if (rows.length === 0) return { sql: '', values: [] }
  // Usa as chaves do primeiro registro — todos os registros devem ter as MESMAS chaves
  const cols = Object.keys(rows[0]!).filter((c) => !c.startsWith('_'))
  const values: unknown[] = []
  const placeholders: string[] = []
  for (const row of rows) {
    const ph: string[] = []
    for (const col of cols) {
      values.push(row[col])
      ph.push(`$${values.length}`)
    }
    placeholders.push(`(${ph.join(', ')})`)
  }
  const sql = `INSERT INTO ${table} (${cols.map(quoteIdent).join(', ')}) VALUES ${placeholders.join(', ')}`
  return { sql, values }
}

// Normaliza valores: objetos → JSON string, Date → ISO, null/undefined → null
function normalizar(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((r) => {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(r)) {
      if (k.startsWith('_')) continue
      if (v === undefined) out[k] = null
      else if (v === null) out[k] = null
      else if (v instanceof Date) out[k] = v
      else if (typeof v === 'object') out[k] = JSON.stringify(v)
      else out[k] = v
    }
    return out
  })
}

// Mantem todas as colunas em todas as linhas (NULL onde nao tem) — necessario para INSERT batch
function normalizarColunasComuns(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  const todasColunas = new Set<string>()
  for (const r of rows) for (const k of Object.keys(r)) if (!k.startsWith('_')) todasColunas.add(k)
  return rows.map((r) => {
    const out: Record<string, unknown> = {}
    for (const col of todasColunas) {
      const v = r[col]
      if (v === undefined || v === null) out[col] = null
      else if (v instanceof Date) out[col] = v
      else if (typeof v === 'object') out[col] = JSON.stringify(v)
      else out[col] = v
    }
    return out
  })
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  const t0 = Date.now()

  console.log(`\n[seed] count=${count} | schema=${SCHEMA_PG}`)
  console.log(`[seed] conectando em ${DATABASE_URL.replace(/:[^@]+@/, ':****@')}`)

  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  await client.query(`SET search_path TO "${SCHEMA_PG}", public`)

  // Distribui tiers 30/40/30
  const tiers = distribuirTiers(count)
  const ctx: ContextoGeracao = { id_organizacao: ID_ORGANIZACAO, id_workspace: ID_WORKSPACE }

  const pedidos: PedidoGerado[] = []
  const itens: ItemGerado[] = []
  const distrTier = { 100: 0, 70: 0, 50: 0 }
  let totalItens = 0

  for (let i = 1; i <= count; i++) {
    const tier = tiers[i - 1]!
    distrTier[tier]++
    const { pedido } = gerarPedido(i, tier, ctx)
    pedidos.push(pedido)
    const qtd = rndQtdItens()
    const itensPed = gerarItensDoPedido(pedido, qtd, tier, i)
    itens.push(...itensPed)
    totalItens += qtd
  }

  console.log(`[seed] gerados em mem: ${pedidos.length} pedidos, ${itens.length} itens`)
  console.log(`[seed] distribuicao tiers: 100%=${distrTier[100]} | 70%=${distrTier[70]} | 50%=${distrTier[50]}`)

  // Transacao atomica: limpa CARGA-* + insere
  await client.query('BEGIN')
  try {
    // pedido_transferencia.id_pedido_origem é ON DELETE RESTRICT — limpar antes
    // do DELETE em pedido. Demais FKs (pedido_item, snapshots) são CASCADE.
    const delTransf = await client.query(`
      DELETE FROM ${quoteIdent(SCHEMA_PG)}.pedido_transferencia
      WHERE id_pedido_origem IN (
        SELECT id_pedido FROM ${quoteIdent(SCHEMA_PG)}.pedido WHERE numero_pedido LIKE 'CARGA-%'
      )
    `)
    if ((delTransf.rowCount ?? 0) > 0) {
      console.log(`[seed] removidas ${delTransf.rowCount} transferências CARGA-* (RESTRICT na FK)`)
    }
    const del = await client.query(`DELETE FROM ${quoteIdent(SCHEMA_PG)}.pedido WHERE numero_pedido LIKE 'CARGA-%'`)
    console.log(`[seed] removidos ${del.rowCount ?? 0} pedidos CARGA-* anteriores (cascade nos itens)`)

    // Pedidos: normaliza colunas comuns para INSERT em batch
    const pedidosNorm = normalizarColunasComuns(pedidos as unknown as Record<string, unknown>[])
    // Chunk size escalado por volume — reduz round-trips ao banco em volumes grandes
    // 10000 pedidos = ~57k itens; com chunk 500 são 114 round-trips em vez de 1140 (10x menos).
    // Limite Postgres: 65535 parametros por query. 500 × 85 colunas = 42500 params (OK).
    const chunkSize = count >= 5000 ? 500 : count >= 1000 ? 200 : 50
    console.log(`[seed] chunk size: ${chunkSize}`)
    let pedidosInseridos = 0
    const totalChunksPed = Math.ceil(pedidosNorm.length / chunkSize)
    for (let i = 0; i < pedidosNorm.length; i += chunkSize) {
      const chunk = pedidosNorm.slice(i, i + chunkSize)
      const { sql, values } = buildInsertSql(`${quoteIdent(SCHEMA_PG)}.pedido`, chunk)
      const r = await client.query(sql, values)
      pedidosInseridos += r.rowCount ?? chunk.length
      const chunkN = Math.floor(i / chunkSize) + 1
      if (count >= 1000 && chunkN % 5 === 0) {
        console.log(`[seed] ... pedidos ${pedidosInseridos}/${pedidosNorm.length} (chunk ${chunkN}/${totalChunksPed})`)
      }
    }
    console.log(`[seed] inseridos ${pedidosInseridos} pedidos`)

    // Itens
    const itensNorm = normalizarColunasComuns(itens as unknown as Record<string, unknown>[])
    let itensInseridos = 0
    const totalChunksItens = Math.ceil(itensNorm.length / chunkSize)
    for (let i = 0; i < itensNorm.length; i += chunkSize) {
      const chunk = itensNorm.slice(i, i + chunkSize)
      const { sql, values } = buildInsertSql(`${quoteIdent(SCHEMA_PG)}.pedido_item`, chunk)
      const r = await client.query(sql, values)
      itensInseridos += r.rowCount ?? chunk.length
      const chunkN = Math.floor(i / chunkSize) + 1
      if (count >= 1000 && chunkN % 10 === 0) {
        console.log(`[seed] ... itens ${itensInseridos}/${itensNorm.length} (chunk ${chunkN}/${totalChunksItens})`)
      }
    }
    console.log(`[seed] inseridos ${itensInseridos} itens`)

    await client.query('COMMIT')
    console.log(`[seed] COMMIT OK`)

    // Sample
    const sample = await client.query(`SELECT id_pedido, numero_pedido, status_pedido, tipo_operacao_pedido FROM ${quoteIdent(SCHEMA_PG)}.pedido WHERE numero_pedido LIKE 'CARGA-%' ORDER BY numero_pedido LIMIT 5`)
    console.log(`\n[seed] sample dos primeiros 5:`)
    sample.rows.forEach((r: Record<string, unknown>) => console.log(`  - ${r.numero_pedido} | ${r.status_pedido} | ${r.tipo_operacao_pedido}`))

    const t1 = Date.now()
    console.log(`\n[seed] DONE em ${(t1 - t0) / 1000}s`)
    console.log(`[seed] media: ${((pedidosInseridos + itensInseridos) / ((t1 - t0) / 1000)).toFixed(0)} rows/s`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[seed] ROLLBACK — erro:', err)
    process.exit(2)
  } finally {
    await client.end()
  }
}

main().catch((e) => {
  console.error('[seed] ERRO FATAL:', e)
  process.exit(1)
})
