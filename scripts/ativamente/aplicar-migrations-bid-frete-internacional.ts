/**
 * aplicar-migrations-bid-frete-internacional.ts
 *
 * Aplica migrations do BID Frete Internacional em gravity-bid-frete-internacional-producao.
 * Banco legado (bid_cotacoes, etc.) sem _prisma_migrations → baseline (P3005).
 * Banco já migrado ou vazio → prisma migrate deploy normal.
 */
import { execSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Client } from 'pg'

const REPO_ROOT = resolve(import.meta.dirname, '../..')
const BID_DIR = join(REPO_ROOT, 'servicos-global/produto/bid-frete-internacional')
const BID_SCHEMA = join(BID_DIR, 'prisma/schema.prisma')
const MIGRATIONS_DIR = join(BID_DIR, 'prisma/migrations')

const CREATE_MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  id                   VARCHAR(36)  NOT NULL PRIMARY KEY,
  checksum             VARCHAR(64)  NOT NULL,
  finished_at          TIMESTAMPTZ,
  migration_name       VARCHAR(255) NOT NULL,
  logs                 TEXT,
  rolled_back_at       TIMESTAMPTZ,
  started_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  applied_steps_count  INTEGER      NOT NULL DEFAULT 0
);
`

function mascararUrl(url: string): string {
  try {
    const host = url.split('@')[1]?.split('/')[0]
    return host ? `***@${host}` : '(url invalida)'
  } catch {
    return '(url invalida)'
  }
}

function listarMigrations(): string[] {
  return readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort()
}

async function tabelaExiste(client: Client, nome: string): Promise<boolean> {
  const { rows } = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS exists`,
    [nome],
  )
  return rows[0]?.exists === true
}

async function contarMigrationsAplicadas(client: Client): Promise<number> {
  const existe = await tabelaExiste(client, '_prisma_migrations')
  if (!existe) return 0
  const { rows } = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`,
  )
  return Number(rows[0]?.count ?? 0)
}

async function migrationJaRegistrada(client: Client, nome: string): Promise<boolean> {
  const { rows } = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM "_prisma_migrations"
      WHERE migration_name = $1 AND finished_at IS NOT NULL
    ) AS exists`,
    [nome],
  )
  return rows[0]?.exists === true
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

/** Pula SQL quando o estado alvo da migration já está no banco (produção parcialmente migrada). */
async function migrationJaMaterializada(client: Client, nome: string): Promise<boolean> {
  if (nome.startsWith('20260427000000')) {
    if (!(await tabelaExiste(client, 'bid_cotacoes'))) return true
    return !(await colunaExiste(client, 'bid_cotacoes', 'tenant_id'))
  }
  if (nome.startsWith('20260526120000')) {
    return await tabelaExiste(client, 'cotacao_bid_frete_internacional')
  }
  return false
}

async function registrarMigration(client: Client, nome: string, sql: string): Promise<void> {
  const checksum = createHash('sha256').update(sql).digest('hex')
  await client.query(
    `INSERT INTO "_prisma_migrations"
      (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
     VALUES ($1, $2, NOW(), $3, NOW(), 1)`,
    [randomUUID(), checksum, nome],
  )
}

async function aplicarBaseline(client: Client): Promise<void> {
  console.log('[migrations-bid] Baseline — banco legado sem histórico Prisma')
  await client.query(CREATE_MIGRATIONS_TABLE)

  for (const nome of listarMigrations()) {
    if (await migrationJaRegistrada(client, nome)) {
      console.log(`[migrations-bid]   ${nome} já registrada — skip`)
      continue
    }

    const sqlPath = join(MIGRATIONS_DIR, nome, 'migration.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    if (await migrationJaMaterializada(client, nome)) {
      console.log(`[migrations-bid]   ${nome} já materializada — só registrar`)
      await registrarMigration(client, nome, sql)
      continue
    }

    console.log(`[migrations-bid]   aplicando SQL: ${nome}`)
    await client.query('BEGIN')
    try {
      await client.query(sql)
      await registrarMigration(client, nome, sql)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
  }
}

async function precisaBaseline(client: Client): Promise<boolean> {
  const aplicadas = await contarMigrationsAplicadas(client)
  if (aplicadas > 0) return false

  const legado =
    (await tabelaExiste(client, 'bid_cotacoes')) ||
    (await tabelaExiste(client, 'bid_fornecedores')) ||
    (await tabelaExiste(client, 'cotacao_bid_frete_internacional'))

  return legado
}

async function schemaPrincipalBidAusente(client: Client): Promise<boolean> {
  const temCanonico = await tabelaExiste(client, 'cotacao_bid_frete_internacional')
  const temLegado = await tabelaExiste(client, 'bid_cotacoes')
  return !temCanonico && !temLegado
}

/**
 * Banco vazio ou migrations registradas sem materializar tabelas (ex.: produção nova).
 * Migrations incrementais só renomeiam bid_* — não criam schema do zero.
 */
async function bootstrapSchemaVazio(databaseUrl: string, client: Client): Promise<void> {
  console.log('[migrations-bid] Bootstrap — prisma db push (schema completo a partir do fragment)')
  execSync(`npx prisma db push --schema=${BID_SCHEMA} --skip-generate`, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  })

  await client.query(CREATE_MIGRATIONS_TABLE)
  for (const nome of listarMigrations()) {
    if (await migrationJaRegistrada(client, nome)) {
      console.log(`[migrations-bid]   ${nome} já registrada — skip`)
      continue
    }
    const sqlPath = join(MIGRATIONS_DIR, nome, 'migration.sql')
    const sql = readFileSync(sqlPath, 'utf-8')
    console.log(`[migrations-bid]   registrar baseline: ${nome}`)
    await registrarMigration(client, nome, sql)
  }
}

/** Colunas canônicas mínimas — detecta drift pós-bootstrap (migrations registradas sem SQL). */
const COLUNAS_CANONICAS_MINIMAS: Array<{ tabela: string; coluna: string }> = [
  { tabela: 'cotacao_bid_frete_internacional', coluna: 'id_cotacao_bid_frete_internacional' },
  { tabela: 'ganho_bid_frete_internacional', coluna: 'id_ganho_bid_frete_internacional' },
  { tabela: 'proposta_bid_frete_internacional', coluna: 'id_proposta_bid_frete_internacional' },
]

async function schemaDriftDetectado(client: Client): Promise<boolean> {
  for (const { tabela, coluna } of COLUNAS_CANONICAS_MINIMAS) {
    if (!(await tabelaExiste(client, tabela))) continue
    if (!(await colunaExiste(client, tabela, coluna))) {
      console.warn(`[migrations-bid] Drift: ${tabela}.${coluna} ausente`)
      return true
    }
  }
  return false
}

/**
 * Reaplica SQL idempotente das migrations quando _prisma_migrations diz "ok"
 * mas o schema físico ficou legado (caso comum após db push + baseline em produção).
 */
async function repararSchemaDrift(client: Client): Promise<void> {
  console.log('[migrations-bid] Reparo schema drift — reaplicando SQL idempotente das migrations')
  await client.query(CREATE_MIGRATIONS_TABLE)

  for (const nome of listarMigrations()) {
    const sqlPath = join(MIGRATIONS_DIR, nome, 'migration.sql')
    const sql = readFileSync(sqlPath, 'utf-8')
    console.log(`[migrations-bid]   reparo SQL: ${nome}`)
    try {
      await client.query('BEGIN')
      await client.query(sql)
      if (!(await migrationJaRegistrada(client, nome))) {
        await registrarMigration(client, nome, sql)
      }
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`[migrations-bid]   reparo ${nome} ignorado (idempotente): ${msg}`)
    }
  }
}

async function verificarSchemaAposDeploy(client: Client): Promise<void> {
  if (!(await tabelaExiste(client, 'cotacao_bid_frete_internacional'))) {
    throw new Error(
      'Tabela public.cotacao_bid_frete_internacional ausente após migrations. ' +
        'Verifique BID_FRETE_INTERNATIONAL_DATABASE_URL (gravity-bid-frete-internacional-producao) e logs acima.',
    )
  }

  if (await schemaDriftDetectado(client)) {
    throw new Error(
      'Schema BID Frete Internacional com drift após migrations (colunas DDD ausentes). ' +
        'Rode novamente este script ou verifique logs de reparo acima.',
    )
  }
}

async function main(): Promise<void> {
  const databaseUrl = process.env.BID_FRETE_INTERNATIONAL_DATABASE_URL ?? process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('[migrations-bid] BID_FRETE_INTERNATIONAL_DATABASE_URL ausente')
    process.exit(1)
  }

  console.log(`[migrations-bid] Banco: ${mascararUrl(databaseUrl)}`)

  execSync('node prisma/compose-schema.js', { cwd: BID_DIR, stdio: 'inherit' })

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    if (await schemaPrincipalBidAusente(client)) {
      const aplicadas = await contarMigrationsAplicadas(client)
      if (aplicadas > 0) {
        console.warn(
          `[migrations-bid] AVISO: ${aplicadas} migration(s) registrada(s) mas cotacao_bid_frete_internacional ausente — rebootstrap`,
        )
      }
      await bootstrapSchemaVazio(databaseUrl, client)
    } else if (await precisaBaseline(client)) {
      await aplicarBaseline(client)
    } else if (await schemaDriftDetectado(client)) {
      await repararSchemaDrift(client)
    }

    console.log('[migrations-bid] prisma migrate deploy...')
    execSync(`npx prisma migrate deploy --schema=${BID_SCHEMA}`, {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl },
    })

    await verificarSchemaAposDeploy(client)
  } finally {
    await client.end()
  }

  console.log('[migrations-bid] Concluído.')
}

main().catch(err => {
  console.error('[migrations-bid] ERRO FATAL:', err)
  process.exit(1)
})
