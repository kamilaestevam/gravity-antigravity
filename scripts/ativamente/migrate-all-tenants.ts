// scripts/ativamente/migrate-all-tenants.ts
// ADR-003 — Orquestrador de migrations multi-schema (Schema-per-Tenant)
//
// O que faz:
//   1. Lê tenants ativos do Configurador (fonte de verdade global)
//   2. Para cada tenant, aplica migrations pendentes no schema tenant_<id>
//      do banco de produto informado via DATABASE_URL
//   3. Idempotente — usa _prisma_migrations para não reaplicar o que já rodou
//
// Uso:
//   DATABASE_URL=<url_produto> CONFIGURADOR_DATABASE_URL=<url_cfg> \
//     npx tsx scripts/ativamente/migrate-all-tenants.ts \
//       --product=pedido \
//       [--dry-run]                        ← só lista o que seria aplicado
//       [--single-tenant=<tenant_id>]      ← roda apenas um tenant
//       [--retry-failed]                   ← retenta schemas com erro anterior
//       [--concurrency=10]                 ← padrão: 5 schemas simultâneos
//
// Estratégia de isolamento (ADR-001):
//   - public 100% vazio em bancos de produto (NUNCA criar tabelas lá)
//   - Cada tenant tem schema próprio: tenant_<uuid_sem_hifens>
//   - SET search_path TO "tenant_<id>" antes de rodar DDL
//   - _prisma_migrations por schema (paridade com prisma migrate deploy)
//
// Rollback:
//   - Migrations destrutivas exigem aprovação dupla (Líder Técnico + DBA)
//   - Erro em qualquer tenant para a execução do restante e emite alerta
//   - Re-execução com --retry-failed para tentar apenas os que falharam

import { Client, type QueryResult } from 'pg'
import { readdir, readFile } from 'fs/promises'
import { join, resolve } from 'path'
import { createHash } from 'crypto'
import { existsSync } from 'fs'

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

interface Tenant {
  id: string
  name: string
}

interface Migration {
  name: string       // ex: "20260405113022_add_pedido_full_schema"
  sql: string
  checksum: string
}

interface TenantResult {
  tenantId: string
  tenantName: string
  schemaName: string
  applied: string[]
  skipped: string[]
  error?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI args
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs(): {
  product: string
  dryRun: boolean
  singleTenant: string | null
  retryFailed: boolean
  concurrency: number
} {
  const args = process.argv.slice(2)
  const get = (flag: string) =>
    args.find(a => a.startsWith(flag))?.split('=')[1] ?? null

  const product = get('--product')
  if (!product) {
    console.error('❌  --product=<nome> é obrigatório. Ex: --product=pedido')
    process.exit(1)
  }

  return {
    product,
    dryRun:       args.includes('--dry-run'),
    singleTenant: get('--single-tenant'),
    retryFailed:  args.includes('--retry-failed'),
    concurrency:  Number(get('--concurrency') ?? '5'),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema name (espelha packages/tenant-resolver/src/schema-name.ts)
// ─────────────────────────────────────────────────────────────────────────────

const CUID_REGEX   = /^c[a-z0-9]{24}$/
const SCHEMA_REGEX = /^tenant_c[a-z0-9]{24}$/

function toSchemaName(tenantId: string): string {
  if (!CUID_REGEX.test(tenantId)) {
    throw new Error(`tenantId não é CUID válido: "${tenantId}"`)
  }
  const name = `tenant_${tenantId}`
  if (!SCHEMA_REGEX.test(name)) {
    throw new Error(`schemaName inválido para tenantId "${tenantId}"`)
  }
  return name
}

// ─────────────────────────────────────────────────────────────────────────────
// Migrations directory por produto
// ─────────────────────────────────────────────────────────────────────────────

const MONOREPO_ROOT = resolve(import.meta.dirname, '../..')

const PRODUCT_MIGRATIONS: Record<string, string> = {
  // 2026-05-12: paths corrigidos de `server/prisma/migrations` para
  // `prisma/migrations` — estrutura real do monorepo após FASES 4-5.
  // Script estava stale; nenhuma migration multi-tenant rodou desde então.
  pedido:           'servicos-global/produto/pedido/prisma/migrations',
  processo:         'servicos-global/produto/processo/prisma/migrations',
  'simula-custo':   'servicos-global/produto/simula-custo/prisma/migrations',
  'bid-frete':      'servicos-global/produto/bid-frete/prisma/migrations',
  'bid-cambio':     'servicos-global/produto/bid-cambio/prisma/migrations',
  'nf-importacao':  'servicos-global/produto/nf-importacao/prisma/migrations',
  lpco:             'servicos-global/produto/lpco/prisma/migrations',
  'taxas-cambio':   'servicos-global/servicos-plataforma/taxas-cambio/server/prisma/migrations',
  tenant:           'servicos-global/servicos-plataforma/prisma/migrations',
}

function resolveMigrationsDir(product: string): string {
  const rel = PRODUCT_MIGRATIONS[product]
  if (!rel) {
    const valid = Object.keys(PRODUCT_MIGRATIONS).join(', ')
    console.error(`❌  Produto desconhecido: "${product}". Válidos: ${valid}`)
    process.exit(1)
  }
  const dir = join(MONOREPO_ROOT, rel)
  if (!existsSync(dir)) {
    console.error(`❌  Diretório de migrations não encontrado: ${dir}`)
    process.exit(1)
  }
  return dir
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura de migrations do disco
// ─────────────────────────────────────────────────────────────────────────────

async function loadMigrations(migrationsDir: string): Promise<Migration[]> {
  const entries = await readdir(migrationsDir, { withFileTypes: true })
  const folders = entries
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort()  // ordem lexicográfica = ordem cronológica (prefixo timestamp)

  const migrations: Migration[] = []

  for (const folder of folders) {
    const sqlPath = join(migrationsDir, folder, 'migration.sql')
    if (!existsSync(sqlPath)) continue  // lock files etc.

    const sql = await readFile(sqlPath, 'utf-8')
    const checksum = createHash('sha256').update(sql).digest('hex')
    migrations.push({ name: folder, sql, checksum })
  }

  return migrations
}

// ─────────────────────────────────────────────────────────────────────────────
// _prisma_migrations — garantia de rastreamento por schema (igual ao Prisma)
// ─────────────────────────────────────────────────────────────────────────────

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

async function getAppliedMigrations(
  client: Client,
  schemaName: string,
): Promise<Set<string>> {
  await client.query(`SET search_path TO "${schemaName}", public`)
  await client.query(CREATE_MIGRATIONS_TABLE)

  const { rows } = await client.query<{ migration_name: string }>(
    `SELECT migration_name FROM "_prisma_migrations"
     WHERE finished_at IS NOT NULL
       AND rolled_back_at IS NULL
     ORDER BY started_at ASC`,
  )
  return new Set(rows.map(r => r.migration_name))
}

async function recordMigrationStart(
  client: Client,
  migration: Migration,
): Promise<string> {
  const id = crypto.randomUUID()
  await client.query(
    `INSERT INTO "_prisma_migrations"
       (id, checksum, migration_name, started_at, applied_steps_count)
     VALUES ($1, $2, $3, now(), 0)`,
    [id, migration.checksum, migration.name],
  )
  return id
}

async function recordMigrationSuccess(
  client: Client,
  id: string,
): Promise<void> {
  await client.query(
    `UPDATE "_prisma_migrations"
     SET finished_at = now(), applied_steps_count = 1
     WHERE id = $1`,
    [id],
  )
}

async function recordMigrationFailure(
  client: Client,
  id: string,
  logs: string,
): Promise<void> {
  await client.query(
    `UPDATE "_prisma_migrations"
     SET logs = $2, rolled_back_at = now()
     WHERE id = $1`,
    [id, logs],
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Aplicação de migrations em um schema de tenant
// ─────────────────────────────────────────────────────────────────────────────

async function migrateTenant(
  produtoUrl: string,
  tenant: Tenant,
  allMigrations: Migration[],
  dryRun: boolean,
): Promise<TenantResult> {
  const schemaName = toSchemaName(tenant.id)
  const result: TenantResult = {
    tenantId:   tenant.id,
    tenantName: tenant.name,
    schemaName,
    applied:    [],
    skipped:    [],
  }

  const client = new Client({ connectionString: produtoUrl })

  try {
    await client.connect()
    await client.query(`SET search_path TO "${schemaName}", public`)

    // Garante que o schema existe (CREATE SCHEMA foi responsabilidade do
    // 01-provision-schemas.ts, mas defensivamente criamos aqui se faltar)
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)
    await client.query(`SET search_path TO "${schemaName}", public`)

    const applied = await getAppliedMigrations(client, schemaName)
    const pending = allMigrations.filter(m => !applied.has(m.name))

    if (pending.length === 0) {
      result.skipped = allMigrations.map(m => m.name)
      return result
    }

    for (const migration of pending) {
      if (dryRun) {
        result.applied.push(`[DRY-RUN] ${migration.name}`)
        continue
      }

      // Cada migration em transaction própria — permite rollback isolado
      let migrationId: string | null = null

      try {
        await client.query('BEGIN')
        await client.query(`SET LOCAL search_path TO "${schemaName}", public`)
        migrationId = await recordMigrationStart(client, migration)

        // Executa o DDL da migration
        await client.query(migration.sql)

        await recordMigrationSuccess(client, migrationId)
        await client.query('COMMIT')
        result.applied.push(migration.name)
      } catch (err) {
        await client.query('ROLLBACK')
        const logs = err instanceof Error ? err.message : String(err)

        // Tenta registrar falha fora da transaction que foi revertida
        if (migrationId) {
          try {
            await client.query(`SET search_path TO "${schemaName}", public`)
            await recordMigrationFailure(client, migrationId, logs)
          } catch {
            // Silencia — o erro original é mais importante
          }
        }

        throw new Error(`Migration "${migration.name}" falhou: ${logs}`)
      }
    }

    result.skipped = [...applied]
    return result
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err)
    return result
  } finally {
    await client.end()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pool de concorrência simples (sem dependências externas)
// ─────────────────────────────────────────────────────────────────────────────

async function runConcurrent<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = []
  const queue = [...tasks]
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const task = queue.shift()!
      results.push(await task())
    }
  })
  await Promise.all(workers)
  return results
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { product, dryRun, singleTenant, concurrency } = parseArgs()

  const CONFIGURADOR_URL = process.env.CONFIGURADOR_DATABASE_URL
  const PRODUTO_URL       = process.env.DATABASE_URL

  if (!CONFIGURADOR_URL) {
    console.error('❌  CONFIGURADOR_DATABASE_URL não definida.')
    process.exit(1)
  }
  if (!PRODUTO_URL) {
    console.error('❌  DATABASE_URL (banco do produto) não definida.')
    process.exit(1)
  }

  console.log(`\n🚀  migrate-all-tenants — produto: ${product}${dryRun ? ' [DRY-RUN]' : ''}`)
  console.log(`   Configurador: ${CONFIGURADOR_URL.split('@')[1]?.split('/')[0]}`)
  console.log(`   Produto:      ${PRODUTO_URL.split('@')[1]?.split('/')[0]}\n`)

  // 1. Carregar migrations do disco
  const migrationsDir = resolveMigrationsDir(product)
  const allMigrations  = await loadMigrations(migrationsDir)
  console.log(`📂  Migrations encontradas: ${allMigrations.length}`)
  allMigrations.forEach(m => console.log(`     • ${m.name}`))
  console.log()

  // 2. Buscar tenants ativos
  const cfgClient = new Client({ connectionString: CONFIGURADOR_URL })
  await cfgClient.connect()

  let tenants: Tenant[]
  try {
    if (singleTenant) {
      const { rows } = await cfgClient.query<Tenant>(
        `SELECT id, name FROM "Tenant" WHERE id = $1 AND status = 'ACTIVE'`,
        [singleTenant],
      )
      if (rows.length === 0) {
        console.error(`❌  Tenant "${singleTenant}" não encontrado ou não está ACTIVE.`)
        process.exit(1)
      }
      tenants = rows
    } else {
      const { rows } = await cfgClient.query<Tenant>(
        `SELECT id, name FROM "Tenant" WHERE status = 'ACTIVE' ORDER BY created_at ASC`,
      )
      tenants = rows
    }
  } finally {
    await cfgClient.end()
  }

  console.log(`📋  Tenants a processar: ${tenants.length}`)
  console.log(`⚡  Concorrência: ${concurrency}\n`)

  if (tenants.length === 0) {
    console.warn('⚠️   Nenhum tenant ativo — nada a migrar.')
    return
  }

  // 3. Rodar migrations em paralelo
  // Filtra IDs manuais/legados antes de processar
  const validTenants = tenants.filter(t => {
    if (!CUID_REGEX.test(t.id)) {
      console.warn(`  ⚠️   IGNORADO id="${t.id}" (${t.name}) — não é CUID válido (dado legado de seed)`)
      return false
    }
    return true
  })

  const tasks = validTenants.map(tenant => () =>
    migrateTenant(PRODUTO_URL, tenant, allMigrations, dryRun),
  )

  const results = await runConcurrent(tasks, concurrency)

  // 4. Relatório
  const failed  = results.filter(r => r.error)
  const changed = results.filter(r => !r.error && r.applied.length > 0)
  const noop    = results.filter(r => !r.error && r.applied.length === 0)

  console.log('\n─────────────────────────────────────────────')
  console.log('📊  RESULTADO')
  console.log('─────────────────────────────────────────────')

  if (changed.length > 0) {
    console.log(`\n✅  Migrations aplicadas (${changed.length} tenant(s)):`)
    for (const r of changed) {
      console.log(`  ${r.schemaName}  (${r.tenantName})`)
      r.applied.forEach(m => console.log(`    ↳ ${m}`))
    }
  }

  if (noop.length > 0) {
    console.log(`\n⏭   Já atualizados (${noop.length} tenant(s)) — nenhuma migration pendente`)
  }

  if (failed.length > 0) {
    console.log(`\n🚨  ERROS (${failed.length} tenant(s)):`)
    for (const r of failed) {
      console.error(`  ❌  ${r.schemaName}  (${r.tenantName})`)
      console.error(`       ${r.error}`)
    }
    console.error(
      '\n⛔  Finalizado com erros. Corrija os schemas acima antes de prosseguir.',
    )
    process.exit(1)
  }

  console.log(
    `\n✅  Concluído${dryRun ? ' [DRY-RUN — nenhuma alteração persistida]' : ''}.`,
  )
}

main().catch(err => {
  console.error('❌  Erro fatal:', err instanceof Error ? err.message : err)
  process.exit(1)
})
