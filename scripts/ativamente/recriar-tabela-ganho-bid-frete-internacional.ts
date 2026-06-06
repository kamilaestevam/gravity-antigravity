/**
 * Drop + CREATE TABLE ganho_bid_frete_internacional (schema DDD completo).
 * Uso: BID_FRETE_INTERNATIONAL_DATABASE_URL=... npx tsx scripts/ativamente/recriar-tabela-ganho-bid-frete-internacional.ts
 */
import { Client } from 'pg'
import {
  COLUNAS_GANHO_DDD_MINIMAS,
  CREATE_GANHO_DDD,
} from './lib/reparo-ganho-bid-frete-internacional.js'

function mascararUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.username ? '***' : ''}@${u.hostname}:${u.port}${u.pathname}`
  } catch {
    return '(url inválida)'
  }
}

async function colunaExiste(client: Client, coluna: string): Promise<boolean> {
  const { rows } = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'ganho_bid_frete_internacional'
        AND column_name = $1
    ) AS exists`,
    [coluna],
  )
  return rows[0]?.exists === true
}

async function recriarGanho(databaseUrl: string, rotulo: string): Promise<void> {
  console.log(`\n[recriar-ganho] === ${rotulo} ===`)
  console.log(`[recriar-ganho] Banco: ${mascararUrl(databaseUrl)}`)

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    const tabela = await client.query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'ganho_bid_frete_internacional'
      ) AS exists`,
    )
    if (tabela.rows[0]?.exists) {
      const { rows } = await client.query<{ n: string }>(
        'SELECT COUNT(*)::text AS n FROM ganho_bid_frete_internacional',
      )
      const total = Number(rows[0]?.n ?? 0)
      console.log(`[recriar-ganho] Registros atuais: ${total}`)
      if (total > 0) {
        throw new Error(`Tabela não vazia (${total} registros) — abortado por segurança`)
      }
      await client.query('DROP TABLE IF EXISTS "ganho_bid_frete_internacional" CASCADE')
    }
    await client.query(CREATE_GANHO_DDD)
    for (const coluna of COLUNAS_GANHO_DDD_MINIMAS) {
      if (!(await colunaExiste(client, coluna))) {
        throw new Error(`Coluna ausente após CREATE: ganho_bid_frete_internacional.${coluna}`)
      }
    }
    console.log(`[recriar-ganho] OK — colunas DDD presentes em ${rotulo}`)
  } finally {
    await client.end()
  }
}

async function main(): Promise<void> {
  const urls: Array<{ rotulo: string; url: string }> = []
  const prod = process.env.BID_FRETE_PROD_DATABASE_URL
  const teste = process.env.BID_FRETE_TEST_DATABASE_URL
  const unico = process.env.BID_FRETE_INTERNATIONAL_DATABASE_URL ?? process.env.DATABASE_URL

  if (prod) urls.push({ rotulo: 'producao', url: prod })
  if (teste) urls.push({ rotulo: 'teste', url: teste })
  if (urls.length === 0 && unico) urls.push({ rotulo: 'unico', url: unico })

  if (urls.length === 0) {
    console.error('[recriar-ganho] Defina BID_FRETE_INTERNATIONAL_DATABASE_URL')
    process.exit(1)
  }

  for (const { rotulo, url } of urls) {
    await recriarGanho(url, rotulo)
  }
  console.log('\n[recriar-ganho] Concluído.')
}

main().catch((err: unknown) => {
  console.error('[recriar-ganho] Falha:', err instanceof Error ? err.message : err)
  process.exit(1)
})
