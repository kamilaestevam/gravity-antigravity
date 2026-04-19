#!/usr/bin/env tsx
/**
 * OPERAÇÃO CLEAN SLATE — GRAVITY WIPEOUT
 *
 * Deleta todos os dados de teste mantendo APENAS os dados do usuário protegido.
 * Padrão: DRY-RUN (apenas relatório). Use --execute para deleção real.
 *
 * Uso:
 *   npx tsx scripts/wipeout_database.ts             → dry-run (relatório)
 *   npx tsx scripts/wipeout_database.ts --execute   → deleção real (IRREVERSÍVEL)
 *
 * Bases afetadas:
 *   CONFIGURADOR_DATABASE_URL → Tenant, User, Company... (porta 57584)
 *   DATABASE_URL              → serviços tenant + produto Pedido (porta 24197)
 *
 * NOTA: Tabelas no banco usam os nomes PRÉ-migração DDD (ex: "Tenant" não "organizacao").
 */

import { Pool } from 'pg'
import type { PoolClient } from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ── Config ────────────────────────────────────────────────────────────────────
const PROTECTED_EMAIL = 'dmmltda@gmail.com'
const IS_DRY_RUN = !process.argv.includes('--execute')

// ── Env loading ───────────────────────────────────────────────────────────────
function loadEnv(relPath: string): Record<string, string> {
  try {
    const abs = resolve(process.cwd(), relPath)
    return Object.fromEntries(
      readFileSync(abs, 'utf-8')
        .split('\n')
        .filter((l) => l.includes('=') && !l.startsWith('#'))
        .map((l) => {
          const i = l.indexOf('=')
          return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
        })
    )
  } catch {
    return {}
  }
}

const env = {
  ...loadEnv('configurador/.env'),
  ...loadEnv('produto/pedido/server/.env'),
  ...loadEnv('.env.local'),
}

// ── ANSI colors ───────────────────────────────────────────────────────────────
const R = '\x1b[0m'
const b     = (s: string) => `\x1b[1m${s}${R}`
const red   = (s: string) => `\x1b[31m${s}${R}`
const green = (s: string) => `\x1b[32m${s}${R}`
const yellow = (s: string) => `\x1b[33m${s}${R}`
const cyan  = (s: string) => `\x1b[36m${s}${R}`

const log = {
  ok:      (msg: string) => console.log(`  ${green('✔')} ${msg}`),
  warn:    (msg: string) => console.log(`  ${yellow('⚠')} ${msg}`),
  info:    (msg: string) => console.log(`  ${cyan('ℹ')} ${msg}`),
  skip:    (table: string, reason: string) => console.log(`  ${yellow('·')} ${table}: ${reason}`),
  section: (msg: string) => console.log(`\n${b(cyan(`━━━  ${msg}  ━━━`))}\n`),
}

// ── Table specs ───────────────────────────────────────────────────────────────
// NOTA: Tabelas PascalCase precisam de aspas duplas no SQL (nomes pré-migração DDD)

type TableSpec = {
  table: string    // nome real no PostgreSQL (com aspas se PascalCase)
  col?: string     // coluna tenant (default: 'tenant_id')
  nullable?: boolean
}

// Configurador DB — leaf-first; "Tenant" deletado por último (root)
// col padrão = 'tenant_id' exceto "Tenant" que usa 'id'
const CONFIG_TABLES: TableSpec[] = [
  { table: '"UserMembership"' },
  { table: '"UserPermission"' },
  { table: '"Subscription"' },
  { table: '"ProductConfig"' },
  { table: '"CompanyProduct"' },
  { table: '"User"' },
  { table: '"Company"' },
  { table: '"SupplierTenantAccess"' },
  { table: '"SecurityEvent"' },
  { table: '"RateLimitMetric"', nullable: true },
  { table: '"role_audit_log"' },
  { table: '"SpecialNegotiation"' },
  { table: '"TestLog"' },
  { table: '"TestPlan"' },
  { table: '"TestSchedule"' },
  // Root — delete last; protected by 'id', not 'tenant_id'
  { table: '"Tenant"', col: 'id' },
]

// Global Configurador tables — NÃO deletar (sem tenant_id ou são dados globais)
// "Product", "PriceTier", "DeployLog", "ServiceHealth", "TaxaCambio",
// "GravityAdminPermission", "StripeEvent"

// Shared DB — Tenant services + Produto Pedido (mesma DATABASE_URL)
// Todas têm coluna 'tenant_id'
const SHARED_TABLES: TableSpec[] = [
  // ── Produto Pedido (snake_case — pré-DDD nomes reais) ─────────────────────
  { table: 'pedido_itens' },
  { table: 'pedido_colunas' },
  { table: 'pedido_status' },
  { table: 'pedido_preferencias_usuario' },
  { table: 'pedido_preferencias_padrao' },
  { table: 'configuracao_pedido' },
  { table: 'mapeamento_import' },
  { table: 'processo_containers' },
  { table: 'processo_faturas' },
  { table: 'processo_itens' },
  { table: 'pedidos_comerciais' },
  { table: 'processos_logisticos' },
  { table: 'atividade_participantes' },
  { table: 'atividade_sessoes_timer' },
  { table: 'atividades' },
  // ── Tenant Services (PascalCase — precisam de aspas) ────────────────────────
  { table: '"AlertNotificationLog"' },
  { table: '"AlertEvent"' },
  { table: '"AlertRule"' },
  { table: '"DashboardAlert"' },
  { table: '"DashboardMetricSnapshot"' },
  { table: '"DashboardShare"' },
  { table: '"DashboardWidget"' },
  { table: '"DashboardConfig"' },
  { table: '"EmailEnviado"' },
  { table: '"FilaEmail"' },
  { table: '"EmailMessage"' },
  { table: '"EmailThread"' },
  { table: '"Template"' },
  { table: '"WhatsAppUsageLog"' },
  { table: '"WhatsAppMessage"' },
  { table: '"WhatsAppConversation"' },
  { table: '"WhatsAppAutomation"' },
  { table: '"ExportResult"' },
  { table: '"ExportJob"' },
  { table: '"ConfigRelatorio"' },
  { table: '"Relatorio"' },
  { table: '"RelatorioTempoCache"' },
  { table: '"HistoryLog"' },
  { table: '"Reserva"' },
  { table: '"Slot"' },
  { table: '"Agenda"' },
  { table: '"DisponibilidadeConfig"' },
  { table: '"GabiMessage"' },
  { table: '"GabiConversation"' },
  { table: '"GabiTokenLog"' },
  { table: '"GabiTokenQuota"' },
  { table: '"GabiUsageLog"' },
  { table: '"UserPreferences"' },
  { table: '"NcmScheduleConfig"' },
  { table: '"NcmSyncLog"' },
  // "NcmItem": OMITIDO — tabela global de referência NCM
  { table: '"Notification"' },
  { table: '"NotificationPreferences"' },
  { table: '"ExternalContact"' },
  { table: '"TenantChannelConfig"' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
async function countRows(pool: Pool, spec: TableSpec, ids: string[]): Promise<number> {
  const col = spec.col ?? 'tenant_id'
  const cond = spec.nullable
    ? `${col} IS NOT NULL AND NOT (${col} = ANY($1::text[]))`
    : `NOT (${col} = ANY($1::text[]))`
  try {
    const r = await pool.query(`SELECT COUNT(*)::int AS n FROM ${spec.table} WHERE ${cond}`, [ids])
    return (r.rows[0].n as number) ?? 0
  } catch {
    return -1
  }
}

async function deleteRows(client: PoolClient, spec: TableSpec, ids: string[]): Promise<number> {
  const col = spec.col ?? 'tenant_id'
  const cond = spec.nullable
    ? `${col} IS NOT NULL AND NOT (${col} = ANY($1::text[]))`
    : `NOT (${col} = ANY($1::text[]))`
  try {
    const r = await client.query(`DELETE FROM ${spec.table} WHERE ${cond}`, [ids])
    return r.rowCount ?? 0
  } catch (e) {
    log.skip(spec.table, (e as Error).message?.split('\n')[0] ?? 'erro')
    return 0
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log()
  console.log(b(red('══════════════════════════════════════════════')))
  console.log(b('   OPERAÇÃO CLEAN SLATE — GRAVITY WIPEOUT     '))
  console.log(b(red('══════════════════════════════════════════════')))
  console.log(IS_DRY_RUN
    ? `\n${b(yellow('MODO: DRY-RUN — nenhum dado será deletado'))}\n`
    : `\n${b(red('⚡ MODO: EXECUÇÃO REAL — DADOS DELETADOS PERMANENTEMENTE ⚡'))}\n`)

  const CONFIGURADOR_URL = env['CONFIGURADOR_DATABASE_URL']
  const SHARED_URL = env['DATABASE_URL']

  if (!CONFIGURADOR_URL) throw new Error('CONFIGURADOR_DATABASE_URL não encontrado. Verifique configurador/.env')
  if (!SHARED_URL) throw new Error('DATABASE_URL não encontrado. Verifique produto/pedido/server/.env')

  const configPool = new Pool({ connectionString: CONFIGURADOR_URL })
  const sharedPool = new Pool({ connectionString: SHARED_URL })

  try {
    // ── FASE 1: Usuário protegido ─────────────────────────────────────────────
    log.section('FASE 1 — USUÁRIO PROTEGIDO')

    const userRes = await configPool.query(
      `SELECT id, email, tenant_id FROM "User" WHERE email = $1 LIMIT 1`,
      [PROTECTED_EMAIL]
    )

    let protectedIds: string[]

    if (userRes.rows.length > 0) {
      const { id, email, tenant_id } = userRes.rows[0] as { id: string; email: string; tenant_id: string }
      log.ok(`Usuário protegido: ${b(id)} (${email})`)
      protectedIds = [tenant_id]
    } else {
      log.warn(`${b(PROTECTED_EMAIL)} NÃO encontrado no Configurador DB`)
      log.info('Fallback: protegendo TODOS os tenants existentes no Configurador')

      const allTenants = await configPool.query(`SELECT id, name, slug FROM "Tenant"`)
      protectedIds = allTenants.rows.map(r => r['id'] as string)

      if (protectedIds.length === 0) {
        log.warn('Nenhum tenant no Configurador — banco vazio')
        protectedIds = ['__none__']
      }
    }

    // ── FASE 2: Entidades protegidas ──────────────────────────────────────────
    log.section('FASE 2 — ENTIDADES PROTEGIDAS')

    const tenantRows = await configPool.query(
      `SELECT id, name, slug FROM "Tenant" WHERE id = ANY($1::text[])`,
      [protectedIds]
    )
    for (const row of tenantRows.rows) {
      log.ok(`Tenant protegido: ${b(row.id)} — "${row.name}" (${row.slug})`)
    }
    if (tenantRows.rows.length === 0) {
      log.info('Nenhum tenant protegido — tudo será deletado')
    }

    // ── FASE 3: Contagem ──────────────────────────────────────────────────────
    log.section('FASE 3 — REGISTROS A DELETAR')

    let total = 0

    console.log(`  ${cyan('─── Configurador DB (porta 57584) ───')}`)
    for (const spec of CONFIG_TABLES) {
      const n = await countRows(configPool, spec, protectedIds)
      if (n > 0) {
        log.warn(`${spec.table}: ${red(b(String(n)))} registros`)
        total += n
      } else if (n === 0) {
        log.ok(`${spec.table}: ${green('0')} — limpo`)
      } else {
        log.skip(spec.table, 'sem coluna tenant ou tabela não encontrada')
      }
    }

    console.log(`\n  ${cyan('─── Shared DB (porta 24197) — Tenant + Pedido ───')}`)
    for (const spec of SHARED_TABLES) {
      const n = await countRows(sharedPool, spec, protectedIds)
      if (n > 0) {
        log.warn(`${spec.table}: ${red(b(String(n)))} registros`)
        total += n
      } else if (n === 0) {
        log.ok(`${spec.table}: ${green('0')} — limpo`)
      } else {
        log.skip(spec.table, 'ignorado')
      }
    }

    console.log()
    console.log(b(`  TOTAL A DELETAR: ${red(String(total))} registros`))

    if (IS_DRY_RUN) {
      console.log(`\n${yellow('  Dry-run concluído. Para executar a deleção real:')}`)
      console.log(`${cyan('  npx tsx scripts/wipeout_database.ts --execute')}\n`)
      return
    }

    // ── FASE 4: Execução real ─────────────────────────────────────────────────
    log.section('FASE 4 — EXECUTANDO DELEÇÃO REAL')

    let deleted = 0

    const sharedClient = await sharedPool.connect()
    try {
      await sharedClient.query('SET session_replication_role = replica')
      for (const spec of SHARED_TABLES) {
        const n = await deleteRows(sharedClient, spec, protectedIds)
        if (n > 0) { log.ok(`[SHARED] ${spec.table}: ${n} linhas deletadas`); deleted += n }
      }
      await sharedClient.query('SET session_replication_role = DEFAULT')
    } finally {
      sharedClient.release()
    }

    const configClient = await configPool.connect()
    try {
      await configClient.query('SET session_replication_role = replica')
      for (const spec of CONFIG_TABLES) {
        const n = await deleteRows(configClient, spec, protectedIds)
        if (n > 0) { log.ok(`[CONFIG] ${spec.table}: ${n} linhas deletadas`); deleted += n }
      }
      await configClient.query('SET session_replication_role = DEFAULT')
    } finally {
      configClient.release()
    }

    log.section('CLEAN SLATE CONCLUÍDO')
    log.ok(`Tenants protegidos: ${protectedIds.join(', ')}`)
    log.ok(`${b(String(deleted))} registros deletados no total`)
    console.log()

  } finally {
    await configPool.end()
    await sharedPool.end()
  }
}

main().catch((e: Error) => {
  console.error(`\n${b(red('ERRO:'))} ${e.message}`)
  process.exit(1)
})
