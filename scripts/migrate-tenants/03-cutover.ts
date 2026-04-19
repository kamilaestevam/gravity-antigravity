#!/usr/bin/env tsx
/**
 * FASE 3 — Cutover por Tenant
 * ADR-003 §"Fase 3 — Cutover Por Tenant"
 *
 * Para cada tenant BACKFILLED:
 *   1. Verifica paridade 100%: count(public WHERE tenant_id=X) == count(tenant_X)
 *   2. Se paridade OK → atualiza status para CUTOVER
 *   3. O SDK já roteia via SET LOCAL search_path — nenhuma alteração de código necessária
 *
 * REGRA CRÍTICA (Risco Zero): NENHUM dado é deletado do schema public.
 * A limpeza (Fase 4) ocorrerá separadamente após homologação.
 *
 * O cutover é IMPLÍCITO pelo search_path:
 *   - Sem dados no schema tenant_X → queries caem para public (comportamento atual)
 *   - Com dados no schema tenant_X → queries usam o schema isolado (pós-backfill)
 *
 * Uso:
 *   npx tsx scripts/migrate-tenants/03-cutover.ts           → dry-run (relatório de paridade)
 *   npx tsx scripts/migrate-tenants/03-cutover.ts --execute → marca cutover para tenants com paridade 100%
 */

import {
  resolveEnvs, makePool, getTenants, ensureMigrationStatusTable,
  TABLES_WITH_TENANT_ID, TABLES_WITHOUT_TENANT_ID, FK_DEPS,
  IS_DRY_RUN, b, red, green, yellow, cyan, gray, log,
} from './_shared.js'
import type { PoolClient } from 'pg'

interface ParityResult {
  table: string
  publicCount: number
  schemaCount: number
  parity: boolean
}

async function verifyParity(
  client: PoolClient,
  schemaName: string,
  tenantId: string,
): Promise<{ results: ParityResult[]; totalPublic: number; totalSchema: number; allMatch: boolean }> {
  const results: ParityResult[] = []
  let totalPublic = 0
  let totalSchema = 0

  // Tabelas com tenant_id
  for (const table of TABLES_WITH_TENANT_ID) {
    const pubR = await client.query<{ n: string }>(
      `SELECT COUNT(*) AS n FROM public."${table}" WHERE tenant_id = $1`,
      [tenantId],
    )
    const schR = await client.query<{ n: string }>(
      `SELECT COUNT(*) AS n FROM "${schemaName}"."${table}"`,
    )
    const pubCount = parseInt(pubR.rows[0]?.n ?? '0', 10)
    const schCount = parseInt(schR.rows[0]?.n ?? '0', 10)
    totalPublic += pubCount
    totalSchema += schCount
    results.push({ table, publicCount: pubCount, schemaCount: schCount, parity: pubCount === schCount })
  }

  // Tabelas sem tenant_id (via FK)
  for (const table of TABLES_WITHOUT_TENANT_ID) {
    const dep = FK_DEPS[table]
    if (!dep) continue

    // Conta linhas em public que têm pai com tenant_id = X
    const pubR = await client.query<{ n: string }>(
      `SELECT COUNT(*) AS n FROM public."${table}" child
       WHERE EXISTS (
         SELECT 1 FROM public."${dep.parentTable}" parent
         WHERE parent.id = child."${dep.fkCol}"
           AND parent.tenant_id = $1
       )`,
      [tenantId],
    )
    const schR = await client.query<{ n: string }>(
      `SELECT COUNT(*) AS n FROM "${schemaName}"."${table}"`,
    )
    const pubCount = parseInt(pubR.rows[0]?.n ?? '0', 10)
    const schCount = parseInt(schR.rows[0]?.n ?? '0', 10)
    totalPublic += pubCount
    totalSchema += schCount
    results.push({ table, publicCount: pubCount, schemaCount: schCount, parity: pubCount === schCount })
  }

  const allMatch = results.every(r => r.parity)
  return { results, totalPublic, totalSchema, allMatch }
}

async function main(): Promise<void> {
  console.log()
  console.log(b(cyan('══════════════════════════════════════════════')))
  console.log(b('   FASE 3 — CUTOVER E VALIDAÇÃO DE PARIDADE   '))
  console.log(b(cyan('══════════════════════════════════════════════')))
  console.log(IS_DRY_RUN
    ? `\n${b(yellow('MODO: DRY-RUN — apenas relatório de paridade'))}\n`
    : `\n${b(cyan('MODO: EXECUÇÃO — marca CUTOVER para tenants com paridade 100%'))}\n`)
  console.log(`  ${red(b('⚠  DADOS DO SCHEMA PUBLIC NÃO SERÃO DELETADOS (Risco Zero)'))}\n`)

  const { sharedUrl } = resolveEnvs()
  const sharedPool = makePool(sharedUrl)

  try {
    const client = await sharedPool.connect()
    try {
      await ensureMigrationStatusTable(client)

      // Busca tenants elegíveis: BACKFILLED ou já CUTOVER (re-validação)
      const tenants = await getTenants(client, ['BACKFILLED', 'CUTOVER'])

      if (tenants.length === 0) {
        log.warn('Nenhum tenant com status BACKFILLED encontrado.')
        log.info('Execute primeiro: npx tsx scripts/migrate-tenants/02-backfill.ts --execute')
        return
      }

      log.section(`VERIFICAÇÃO DE PARIDADE — ${tenants.length} TENANT(S)`)

      let cutoverCount  = 0
      let pendingCount  = 0
      const report: { id: string; pct: number; status: string; mismatches: number }[] = []

      for (const tenant of tenants) {
        console.log(`\n  ${b(tenant.tenant_id)} ${cyan(`(${tenant.schema_name})`)}`)

        const { results, totalPublic, totalSchema, allMatch } =
          await verifyParity(client, tenant.schema_name, tenant.tenant_id)

        const pct = totalPublic === 0
          ? 100
          : Math.round((totalSchema / totalPublic) * 10000) / 100

        const mismatches = results.filter(r => !r.parity)

        log.row('  Linhas em public:', String(totalPublic))
        log.row('  Linhas no schema:', String(totalSchema))
        log.row('  Paridade:',
          allMatch
            ? green('100% ✔')
            : red(`${pct.toFixed(2)}% — ${mismatches.length} tabela(s) divergindo`))

        if (mismatches.length > 0) {
          for (const m of mismatches) {
            log.row(`    ${m.table}`, `public=${m.publicCount}  schema=${m.schemaCount}  ${red('DIVERGE')}`)
          }
        }

        if (allMatch) {
          if (!IS_DRY_RUN && tenant.status !== 'CUTOVER') {
            await client.query(
              `UPDATE _schema_migration_status
               SET status          = 'CUTOVER',
                   rows_public     = $1,
                   parity_pct      = 100,
                   cutover_at      = NOW(),
                   updated_at      = NOW()
               WHERE tenant_id = $2`,
              [totalPublic, tenant.tenant_id],
            )
            log.ok(`  Status → ${green(b('CUTOVER'))} (paridade 100%)`)
          } else if (IS_DRY_RUN) {
            log.skip(`  (dry-run) seria marcado como CUTOVER`)
          } else {
            log.ok(`  Já está em CUTOVER`)
          }
          cutoverCount++
          report.push({ id: tenant.tenant_id, pct: 100, status: 'CUTOVER', mismatches: 0 })
        } else {
          await client.query(
            `UPDATE _schema_migration_status
             SET rows_public  = $1,
                 rows_copied  = $2,
                 parity_pct   = $3,
                 notes        = $4,
                 updated_at   = NOW()
             WHERE tenant_id = $5`,
            [
              totalPublic,
              totalSchema,
              pct,
              `${mismatches.length} tabela(s) com divergência`,
              tenant.tenant_id,
            ],
          )
          log.warn(`  Paridade incompleta — execute o backfill novamente para este tenant`)
          pendingCount++
          report.push({ id: tenant.tenant_id, pct, status: 'PENDENTE', mismatches: mismatches.length })
        }
      }

      // ── Relatório final ───────────────────────────────────────────────────
      log.section('RELATÓRIO — FASE 3')
      log.row('Tenants verificados:',          String(tenants.length))
      log.row('Cutover concluído (100%):',      green(String(cutoverCount)))
      log.row('Pendentes (paridade < 100%):',   pendingCount > 0 ? yellow(String(pendingCount)) : green('0'))

      console.log()
      for (const r of report) {
        const icon = r.status === 'CUTOVER' ? green('✔') : yellow('⚠')
        log.row(`  ${icon} ${r.id}`, `${r.pct.toFixed(1)}% — ${r.status}`)
      }

      if (cutoverCount > 0) {
        console.log()
        log.info('Tenants em CUTOVER estão operando com isolamento total via schema-per-tenant.')
        log.info('O schema public permanece intacto (backup). Fase 4 (limpeza) após homologação.')
      }

      if (IS_DRY_RUN) {
        console.log(`\n${yellow('  Dry-run concluído. Para executar o cutover:')}`)
        console.log(`${cyan('  npx tsx scripts/migrate-tenants/03-cutover.ts --execute')}\n`)
      }
    } finally {
      client.release()
    }
  } finally {
    await sharedPool.end()
  }
}

main().catch((e: Error) => {
  console.error(`\n${b(red('ERRO FATAL:'))} ${e.message}`)
  process.exit(1)
})
