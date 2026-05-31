/**
 * Repara migration falha 20260529160000 (bfi_reorder ausente) e aplica deploy pendente.
 * Uso: DATABASE_URL=... npx tsx scripts/ativamente/reparar-e-aplicar-migrations-bid-frete-internacional.ts
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Client } from 'pg'

const REPO_ROOT = resolve(import.meta.dirname, '../..')
const BID_DIR = join(REPO_ROOT, 'servicos-global/produto/bid-frete-internacional')
const MIGRATIONS_DIR = join(BID_DIR, 'prisma/migrations')
const BFI_HELPER = join(MIGRATIONS_DIR, '20260531120000_add_dias_prazo_pagamento_proposta_bid_frete_internacional/migration.sql')

function extractBfiFunction(sql: string): string {
  const start = sql.indexOf('CREATE OR REPLACE FUNCTION public.bfi_reorder_table_columns')
  const end = sql.indexOf('$$;', start)
  if (start === -1 || end === -1) {
    throw new Error('Não foi possível extrair bfi_reorder_table_columns do SQL helper')
  }
  return `${sql.slice(start, end + 4).trim()}\n`
}

async function colunaExiste(client: Client, tabela: string, coluna: string): Promise<boolean> {
  const { rows } = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
    ) AS exists`,
    [tabela, coluna],
  )
  return rows[0]?.exists === true
}

async function migrationRegistrada(client: Client, nome: string): Promise<boolean> {
  const { rows } = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM "_prisma_migrations"
      WHERE migration_name = $1 AND finished_at IS NOT NULL
    ) AS exists`,
    [nome],
  )
  return rows[0]?.exists === true
}

async function main(): Promise<void> {
  const databaseUrl = process.env.BID_FRETE_INTERNATIONAL_DATABASE_URL ?? process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('[repair-bid] DATABASE_URL ausente')
    process.exit(1)
  }

  execSync('node prisma/compose-schema.js', { cwd: BID_DIR, stdio: 'inherit' })

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  const failedName = '20260529160000_add_endereco_destino_reorder_rota_cotacao'
  const helperSql = readFileSync(BFI_HELPER, 'utf-8')
  const bfiFn = extractBfiFunction(helperSql)

  try {
    const jaAplicada = await migrationRegistrada(client, failedName)
    const enderecoDestinoExiste = await colunaExiste(
      client,
      'cotacao_bid_frete_internacional',
      'endereco_destino_cotacao_bid_frete_internacional',
    )

    if (!jaAplicada && !enderecoDestinoExiste) {
      console.log('[repair-bid] Aplicando migration falha com helper bfi_reorder...')
      const failedSql = readFileSync(join(MIGRATIONS_DIR, failedName, 'migration.sql'), 'utf-8')
      await client.query('BEGIN')
      try {
        await client.query(bfiFn)
        await client.query(failedSql)
        await client.query('DROP FUNCTION IF EXISTS public.bfi_reorder_table_columns(text, text[]);')
        await client.query('COMMIT')
        console.log('[repair-bid] SQL da migration falha aplicado.')
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      }
    } else {
      console.log('[repair-bid] Migration falha já materializada ou registrada — skip SQL')
    }
  } finally {
    await client.end()
  }

  console.log('[repair-bid] prisma migrate resolve --applied', failedName)
  execSync(
    `npx prisma migrate resolve --applied "${failedName}" --schema=${join(BID_DIR, 'prisma/schema.prisma')}`,
    {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl },
    },
  )

  console.log('[repair-bid] prisma migrate deploy...')
  execSync(`npx prisma migrate deploy --schema=${join(BID_DIR, 'prisma/schema.prisma')}`, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  })

  const verify = new Client({ connectionString: databaseUrl })
  await verify.connect()
  const ok = await colunaExiste(
    verify,
    'proposta_bid_frete_internacional',
    'dias_prazo_pagamento_proposta_bid_frete_internacional',
  )
  const pos = await verify.query<{ column_name: string; ordinal_position: number }>(
    `SELECT column_name, ordinal_position
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'proposta_bid_frete_internacional'
       AND column_name IN (
         'dias_free_time_proposta_bid_frete_internacional',
         'dias_prazo_pagamento_proposta_bid_frete_internacional',
         'validade_proposta_bid_frete_internacional'
       )
     ORDER BY ordinal_position`,
  )
  await verify.end()

  console.log('[repair-bid] Coluna dias_prazo_pagamento existe:', ok)
  for (const row of pos.rows) {
    console.log(`  #${row.ordinal_position} ${row.column_name}`)
  }

  if (!ok) {
    process.exit(1)
  }

  console.log('[repair-bid] Concluído.')
}

main().catch(err => {
  console.error('[repair-bid] ERRO:', err)
  process.exit(1)
})
