#!/usr/bin/env tsx
/**
 * FASE 1 — Provisionamento de Schemas por Tenant
 * ADR-003 §"Fase 1 — Provisionamento Paralelo"
 *
 * Para cada tenant ativo no Configurador:
 *   1. CREATE SCHEMA "tenant_<id>" no Shared DB
 *   2. CREATE TABLE ... (LIKE public.<table> INCLUDING ALL) para cada tabela
 *   3. Registra status PROVISIONED em _schema_migration_status
 *
 * Uso:
 *   npx tsx scripts/ativamente/migrate-tenants/01-provision-schemas.ts           → dry-run
 *   npx tsx scripts/ativamente/migrate-tenants/01-provision-schemas.ts --execute → executa
 */

import {
  resolveEnvs, makePool, buildSchemaName,
  ensureMigrationStatusTable,
  TABLES_WITH_TENANT_ID, TABLES_WITHOUT_TENANT_ID,
  IS_DRY_RUN, b, red, green, yellow, cyan, log,
} from './_shared.js'

interface ActiveTenant {
  id_organizacao: string
  nome_organizacao: string
  status_organizacao: string
}

async function main(): Promise<void> {
  console.log()
  console.log(b(cyan('══════════════════════════════════════════════')))
  console.log(b('   FASE 1 — PROVISION SCHEMAS POR TENANT      '))
  console.log(b(cyan('══════════════════════════════════════════════')))
  console.log(IS_DRY_RUN
    ? `\n${b(yellow('MODO: DRY-RUN — nenhuma alteração no banco'))}\n`
    : `\n${b(red('⚡ MODO: EXECUÇÃO REAL'))}\n`)

  const { configuradorUrl, sharedUrl } = resolveEnvs()
  const configPool = makePool(configuradorUrl)
  const sharedPool = makePool(sharedUrl)

  try {
    // ── 1. Buscar tenants ativos no Configurador ───────────────────────────
    log.section('TENANTS ATIVOS NO CONFIGURADOR')

    const configClient = await configPool.connect()
    let tenants: ActiveTenant[] = []
    try {
      const r = await configClient.query<ActiveTenant>(
        `SELECT id_organizacao, nome_organizacao, status_organizacao::text
         FROM organizacao
         WHERE status_organizacao = 'ACTIVE'
         ORDER BY data_criacao_organizacao`,
      )
      tenants = r.rows
    } finally {
      configClient.release()
    }

    if (tenants.length === 0) {
      log.warn('Nenhum tenant ACTIVE encontrado no Configurador.')
      log.info('Fase 1 concluída sem schemas criados — banco vazio, pronto para receber novos tenants.')
      return
    }

    log.ok(`${tenants.length} tenant(s) encontrado(s):`)
    for (const t of tenants) {
      log.row(t.id_organizacao, `"${t.nome_organizacao}" [${t.status_organizacao}]`)
    }

    // ── 2. Preparar Shared DB ─────────────────────────────────────────────
    log.section('PREPARAÇÃO DO SHARED DB')

    const sharedClient = await sharedPool.connect()
    try {
      if (!IS_DRY_RUN) {
        await ensureMigrationStatusTable(sharedClient)
        log.ok('Tabela _schema_migration_status garantida')
      } else {
        log.skip('(dry-run) _schema_migration_status não será criada')
      }

      // Lista todas as tabelas que devem existir em cada schema
      const allTables = [...TABLES_WITH_TENANT_ID, ...TABLES_WITHOUT_TENANT_ID]

      // ── 3. Provisionar cada tenant ────────────────────────────────────────
      log.section('PROVISIONANDO SCHEMAS')

      let schemasCreated = 0
      let schemasSkipped = 0
      const errors: { tenantId: string; error: string }[] = []

      for (const tenant of tenants) {
        let schemaName: string
        try {
          schemaName = buildSchemaName(tenant.id_organizacao)
        } catch (e) {
          log.error(`${tenant.id_organizacao}: ID inválido para schema — ${(e as Error).message}`)
          errors.push({ tenantId: tenant.id_organizacao, error: (e as Error).message })
          continue
        }

        console.log(`\n  ${b(tenant.nome_organizacao)} ${cyan(`(${schemaName})`)}`)

        if (IS_DRY_RUN) {
          log.skip(`(dry-run) CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)
          for (const table of allTables) {
            log.skip(`(dry-run) CREATE TABLE "${schemaName}"."${table}" (LIKE public."${table}" INCLUDING ALL)`)
          }
          schemasCreated++
          continue
        }

        // Verificar se schema já existe
        const existsR = await sharedClient.query<{ exists: boolean }>(
          `SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = $1) AS exists`,
          [schemaName],
        )
        const alreadyExists = existsR.rows[0]?.exists ?? false

        if (alreadyExists) {
          log.skip(`Schema "${schemaName}" já existe — verificando tabelas`)
          schemasSkipped++
        } else {
          await sharedClient.query(`CREATE SCHEMA "${schemaName}"`)
          log.ok(`CREATE SCHEMA "${schemaName}"`)
          schemasCreated++
        }

        // Criar tabelas dentro do schema usando LIKE INCLUDING ALL
        // Isso copia: definição de colunas, NOT NULL, DEFAULT, CHECK, índices
        let tablesCreated = 0
        for (const table of allTables) {
          // Verifica se tabela existe em public antes de criar LIKE
          const tableExistsR = await sharedClient.query<{ exists: boolean }>(
            `SELECT EXISTS(
               SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = $1
             ) AS exists`,
            [table],
          )
          if (!tableExistsR.rows[0]?.exists) {
            log.skip(`    tabela public."${table}" não existe — pulando`)
            continue
          }

          await sharedClient.query(
            `CREATE TABLE IF NOT EXISTS "${schemaName}"."${table}"
             (LIKE public."${table}" INCLUDING ALL)`,
          )
          tablesCreated++
        }
        log.ok(`  ${tablesCreated} tabela(s) criada(s) no schema`)

        // Registrar status PROVISIONED
        await sharedClient.query(
          `INSERT INTO _schema_migration_status
             (tenant_id, schema_name, status, tables_provisioned)
           VALUES ($1, $2, 'PROVISIONED', $3)
           ON CONFLICT (tenant_id) DO UPDATE
             SET schema_name        = EXCLUDED.schema_name,
                 status             = CASE
                   WHEN _schema_migration_status.status = 'PROVISIONED' THEN 'PROVISIONED'
                   ELSE _schema_migration_status.status
                 END,
                 tables_provisioned = EXCLUDED.tables_provisioned,
                 updated_at         = NOW()`,
          [tenant.id_organizacao, schemaName, tablesCreated],
        )
      }

      // ── 4. Relatório final ────────────────────────────────────────────────
      log.section('RELATÓRIO — FASE 1')
      log.row('Tenants processados:', String(tenants.length))
      log.row('Schemas criados:',     green(String(schemasCreated)))
      log.row('Schemas já existiam:', yellow(String(schemasSkipped)))
      log.row('Erros:',               errors.length > 0 ? red(String(errors.length)) : green('0'))

      if (errors.length > 0) {
        console.log()
        for (const e of errors) {
          log.error(`${e.tenantId}: ${e.error}`)
        }
      }

      if (IS_DRY_RUN) {
        console.log(`\n${yellow('  Dry-run concluído. Para executar:')}`)
        console.log(`${cyan('  npx tsx scripts/ativamente/migrate-tenants/01-provision-schemas.ts --execute')}\n`)
      } else {
        log.ok('Fase 1 concluída. Execute a Fase 2 para iniciar o backfill:')
        console.log(`${cyan('  npx tsx scripts/ativamente/migrate-tenants/02-backfill.ts --execute')}\n`)
      }
    } finally {
      sharedClient.release()
    }
  } finally {
    await configPool.end()
    await sharedPool.end()
  }
}

main().catch((e: Error) => {
  console.error(`\n${b(red('ERRO FATAL:'))} ${e.message}`)
  process.exit(1)
})
