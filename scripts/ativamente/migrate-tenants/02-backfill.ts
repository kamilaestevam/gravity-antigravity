#!/usr/bin/env tsx
/**
 * FASE 2 — Backfill de Dados (public → schemas isolados)
 * ADR-003 §"Fase 2 — Backfill de Dados"
 *
 * Para cada tenant PROVISIONED:
 *   - Copia linhas de public.<tabela> WHERE tenant_id = X para tenant_X.<tabela>
 *   - Batches de 1.000 linhas com ON CONFLICT DO NOTHING (idempotente)
 *   - Tabelas sem tenant_id (FK-dependentes) copiadas após suas raízes
 *   - Atualiza status para BACKFILLED ao concluir
 *
 * REGRA CRÍTICA (Risco Zero): os dados originais em public NÃO são deletados.
 *
 * Uso:
 *   npx tsx scripts/ativamente/migrate-tenants/02-backfill.ts           → dry-run
 *   npx tsx scripts/ativamente/migrate-tenants/02-backfill.ts --execute → executa
 */

import {
  resolveEnvs, makePool, getTenants, ensureMigrationStatusTable,
  TABLES_WITH_TENANT_ID, TABLES_WITHOUT_TENANT_ID, FK_DEPS,
  IS_DRY_RUN, b, red, green, yellow, cyan, gray, log,
} from './_shared.js'
import type { PoolClient } from 'pg'

const BATCH_SIZE = 1_000

async function getPrimaryKeyColumn(client: PoolClient, table: string): Promise<string> {
  const r = await client.query<{ column_name: string }>(
    `SELECT kcu.column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
     WHERE tc.table_schema = 'public'
       AND tc.table_name   = $1
       AND tc.constraint_type = 'PRIMARY KEY'
     LIMIT 1`,
    [table],
  )
  return r.rows[0]?.column_name ?? 'id'
}

async function copyTableForTenant(
  client: PoolClient,
  schemaName: string,
  tenantId: string,
  table: string,
  pkCol: string,
): Promise<number> {
  // Conta quantos já existem no schema destino (checkpoint)
  const existingR = await client.query<{ n: string }>(
    `SELECT COUNT(*) AS n FROM "${schemaName}"."${table}"`,
  )
  const alreadyCopied = parseInt(existingR.rows[0]?.n ?? '0', 10)

  // Total de linhas para este tenant em public
  const totalR = await client.query<{ n: string }>(
    `SELECT COUNT(*) AS n FROM public."${table}" WHERE tenant_id = $1`,
    [tenantId],
  )
  const total = parseInt(totalR.rows[0]?.n ?? '0', 10)

  if (total === 0) return 0
  if (alreadyCopied >= total) return alreadyCopied  // já completo

  let offset = alreadyCopied
  let copied = alreadyCopied

  while (offset < total) {
    const r = await client.query<{ inserted: string }>(
      `WITH batch AS (
         SELECT * FROM public."${table}"
         WHERE tenant_id = $1
         ORDER BY "${pkCol}"
         LIMIT $2 OFFSET $3
       )
       INSERT INTO "${schemaName}"."${table}"
       SELECT * FROM batch
       ON CONFLICT ("${pkCol}") DO NOTHING
       RETURNING 1`,
      [tenantId, BATCH_SIZE, offset],
    )
    copied += r.rowCount ?? 0
    offset += BATCH_SIZE
  }

  return copied
}

async function copyFkTableForTenant(
  client: PoolClient,
  schemaName: string,
  table: string,
  fkCol: string,
  parentTable: string,
  parentPkCol: string,
  pkCol: string,
): Promise<number> {
  // Copia linhas cujos pais já estão no schema do tenant
  const r = await client.query<{ inserted: string }>(
    `INSERT INTO "${schemaName}"."${table}"
     SELECT child.* FROM public."${table}" child
     WHERE EXISTS (
       SELECT 1 FROM "${schemaName}"."${parentTable}" parent
       WHERE parent."${parentPkCol}" = child."${fkCol}"
     )
     ON CONFLICT ("${pkCol}") DO NOTHING
     RETURNING 1`,
  )
  return r.rowCount ?? 0
}

async function main(): Promise<void> {
  console.log()
  console.log(b(cyan('══════════════════════════════════════════════')))
  console.log(b('   FASE 2 — BACKFILL DE DADOS POR TENANT      '))
  console.log(b(cyan('══════════════════════════════════════════════')))
  console.log(IS_DRY_RUN
    ? `\n${b(yellow('MODO: DRY-RUN — nenhuma alteração no banco'))}\n`
    : `\n${b(red('⚡ MODO: EXECUÇÃO REAL — copiando dados'))}\n`)

  const { sharedUrl } = resolveEnvs()
  const sharedPool = makePool(sharedUrl)

  try {
    const client = await sharedPool.connect()
    try {
      await ensureMigrationStatusTable(client)

      // Busca tenants elegíveis para backfill
      const tenants = await getTenants(client, ['PROVISIONED', 'BACKFILL_PARTIAL'])

      if (tenants.length === 0) {
        log.warn('Nenhum tenant com status PROVISIONED ou BACKFILL_PARTIAL encontrado.')
        log.info('Execute primeiro: npx tsx scripts/ativamente/migrate-tenants/01-provision-schemas.ts --execute')
        return
      }

      log.section(`BACKFILL — ${tenants.length} TENANT(S)`)

      let totalRowsCopied = 0
      const summary: { tenantId: string; rows: number; status: string }[] = []

      for (const tenant of tenants) {
        console.log(`\n  ${b(tenant.tenant_id)} ${cyan(`→ ${tenant.schema_name}`)}`)

        if (IS_DRY_RUN) {
          // Apenas contar o que seria copiado
          let wouldCopy = 0
          for (const table of TABLES_WITH_TENANT_ID) {
            const r = await client.query<{ n: string }>(
              `SELECT COUNT(*) AS n FROM public."${table}" WHERE tenant_id = $1`,
              [tenant.tenant_id],
            )
            wouldCopy += parseInt(r.rows[0]?.n ?? '0', 10)
          }
          log.skip(`(dry-run) ${wouldCopy} linhas seriam copiadas de ${TABLES_WITH_TENANT_ID.length} tabelas`)
          summary.push({ tenantId: tenant.tenant_id, rows: wouldCopy, status: 'dry-run' })
          continue
        }

        // Backfill tabelas com tenant_id
        let tenantRows = 0
        for (const table of TABLES_WITH_TENANT_ID) {
          const pkCol = await getPrimaryKeyColumn(client, table)
          const n = await copyTableForTenant(client, tenant.schema_name, tenant.tenant_id, table, pkCol)
          if (n > 0) {
            log.ok(`    ${table}: ${green(String(n))} linhas`)
            tenantRows += n
          }
        }

        // Backfill tabelas sem tenant_id (via FK)
        for (const table of TABLES_WITHOUT_TENANT_ID) {
          const dep = FK_DEPS[table]
          if (!dep) {
            log.skip(`    ${table}: sem mapeamento FK — pulando`)
            continue
          }
          const pkCol = await getPrimaryKeyColumn(client, table)
          const n = await copyFkTableForTenant(
            client,
            tenant.schema_name,
            table,
            dep.fkCol,
            dep.parentTable,
            dep.parentPkCol,
            pkCol,
          )
          if (n > 0) {
            log.ok(`    ${table} (via FK): ${green(String(n))} linhas`)
            tenantRows += n
          }
        }

        totalRowsCopied += tenantRows

        // Atualizar status
        await client.query(
          `UPDATE _schema_migration_status
           SET status      = 'BACKFILLED',
               rows_copied = $1,
               updated_at  = NOW()
           WHERE tenant_id = $2`,
          [tenantRows, tenant.tenant_id],
        )
        log.ok(`  ${b(String(tenantRows))} linhas copiadas → status BACKFILLED`)
        summary.push({ tenantId: tenant.tenant_id, rows: tenantRows, status: 'BACKFILLED' })
      }

      // ── Relatório ─────────────────────────────────────────────────────────
      log.section('RELATÓRIO — FASE 2')
      log.row('Tenants processados:', String(tenants.length))
      log.row('Total de linhas copiadas:', IS_DRY_RUN ? yellow('(dry-run)') : green(String(totalRowsCopied)))

      for (const s of summary) {
        log.row(`  ${s.tenantId}`, `${s.rows} linhas → ${s.status}`)
      }

      if (IS_DRY_RUN) {
        console.log(`\n${yellow('  Dry-run concluído. Para executar:')}`)
        console.log(`${cyan('  npx tsx scripts/ativamente/migrate-tenants/02-backfill.ts --execute')}\n`)
      } else {
        log.ok('Fase 2 concluída. Execute a Fase 3 para verificar paridade e ativar cutover:')
        console.log(`${cyan('  npx tsx scripts/ativamente/migrate-tenants/03-cutover.ts --execute')}\n`)
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
