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
 *   CONFIGURADOR_DATABASE_URL → organizacao, usuario, workspace... (porta 57584)
 *   DATABASE_URL              → serviços tenant + produto Pedido (porta 24197)
 *
 * Nomes pós-migração DDD Tolerância Zero (snake_case, sem aspas necessárias).
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

type TableSpec = {
  table: string       // nome real no PostgreSQL (snake_case pós-DDD)
  col?: string        // coluna tenant (default: 'tenant_id')
  nullable?: boolean
  allRows?: boolean   // sem filtro de tenant — para tabelas sem tenant_id que dependem de FK
}

// Configurador DB — leaf-first; organizacao deletada por último (root)
// col padrão = 'tenant_id' exceto organizacao que usa 'id'
const CONFIG_TABLES: TableSpec[] = [
  { table: 'usuario_workspace' },
  { table: 'usuario_permissao' },
  { table: 'assinatura_produto_gravity' },
  { table: 'config_produto_gravity' },
  { table: 'produto_gravity_workspace' },
  { table: 'usuario', col: 'id_organizacao_usuario' },
  { table: 'workspace' },
  { table: 'fornecedor_organizacao' },
  { table: 'seguranca' },
  { table: 'requisicoes', nullable: true },
  { table: 'metricas_gemini', nullable: true },
  { table: 'negociacao_especial_produto_gravity' },
  { table: 'testes' },
  { table: 'plano_teste' },
  { table: 'agendamento_teste' },
  // Root — delete last; protected by 'id_organizacao', not 'tenant_id'
  { table: 'organizacao', col: 'id_organizacao' },
]

// Global Configurador tables — NÃO deletar (sem tenant_id ou são dados globais)
// produtos_gravity, faixa_preco_produto_gravity, deploy, servicos, cambio,
// permissao_admin_gravity, fatura_produtos_gravity

// Shared DB — Tenant services + Produto Pedido (mesma DATABASE_URL)
// Todas têm coluna 'tenant_id'
const SHARED_TABLES: TableSpec[] = [
  // ── Produto Pedido ────────────────────────────────────────────────────────
  { table: 'tracking_items_transferidos' },
  { table: 'valor_coluna_usuario_pedido' },
  { table: 'coluna_usuario_pedido' },
  { table: 'pedido_itens' },
  { table: 'pedido_colunas' },
  { table: 'status_pedido' },
  { table: 'preferencia_coluna_pedido' },
  { table: 'preferencia_padrao_pedido' },
  { table: 'pedido_casas_decimais' },
  { table: 'pedido_saldo_formula' },
  { table: 'aprendizado_importacao_dados' },
  { table: 'container_processo' },
  { table: 'fatura_processo' },
  { table: 'tabela_processos' },
  { table: 'pedido_produto_gravity' },
  { table: 'logistica_processo' },
  { table: 'atividades_participantes', allRows: true }, // sem tenant_id — depende de atividades_dados via FK
  { table: 'atividades_tempo', allRows: true },         // sem tenant_id — depende de atividades_dados via FK
  { table: 'atividades_timer' },
  { table: 'atividades_dados' },
  { table: 'atividades_cronometro' },
  { table: 'anexo_pedido' },
  { table: 'dashboard_painel' },
  { table: 'dashboard_preferencias' },
  { table: 'kanban_preferencias' },
  { table: 'template_pedido_pdf' },
  // ── Tenant Services ───────────────────────────────────────────────────────
  { table: 'alerta_registro', allRows: true }, // sem tenant_id — depende de alerta_data via FK
  { table: 'alerta_data' },
  { table: 'alerta_regra' },
  { table: 'dashboard_alertas' },
  { table: 'dashboard_metricas' },
  { table: 'dashboard_compartilhar' },
  { table: 'dashboard_criar' },
  { table: 'dashboard_configuracao' },
  { table: 'email_registro_envio' },
  { table: 'email_fila_envio' },
  { table: 'email_mensagem' },
  { table: 'email_assuntos_participantes' },
  { table: 'template_email' },
  { table: 'whatsapp_log' },
  { table: 'whatsapp_mensagem' },
  { table: 'whatsapp_conversa' },
  { table: 'whatsapp_regra' },
  { table: 'exportar_resultado' },
  { table: 'exportar_job' },
  { table: 'relatorios_configuracao' },
  { table: 'relatorios_salvos' },
  { table: 'tempo_criacao_relatorio' },
  { table: 'historico_log' },
  { table: 'reserva_agenda' },
  { table: 'horario_disponivel' },
  { table: 'agenda_usuario' },
  { table: 'config_disponibilidade_agenda' },
  { table: 'mensagem_individual_gabiai' },
  { table: 'conversa_completa_gabi' },
  { table: 'gabiai_token_consumidos' },
  { table: 'gabiai_token_workspace' },
  { table: 'gabiai_log_uso' },
  { table: 'personalizacao_organizacao_gabiai' },
  { table: 'preferencia_workspace' },
  { table: 'ncm_agendamento' },
  { table: 'ncm_log' },
  // ncm_item: OMITIDO — tabela global de referência NCM
  { table: 'notificacoes_titulo_corpo' },
  { table: 'contato_externo' },
  { table: 'configuracao_canal_tenant' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
async function countRows(pool: Pool, spec: TableSpec, ids: string[]): Promise<number> {
  try {
    if (spec.allRows) {
      const r = await pool.query(`SELECT COUNT(*)::int AS n FROM ${spec.table}`)
      return (r.rows[0].n as number) ?? 0
    }
    const col = spec.col ?? 'tenant_id'
    const cond = spec.nullable
      ? `${col} IS NOT NULL AND NOT (${col} = ANY($1::text[]))`
      : `NOT (${col} = ANY($1::text[]))`
    const r = await pool.query(`SELECT COUNT(*)::int AS n FROM ${spec.table} WHERE ${cond}`, [ids])
    return (r.rows[0].n as number) ?? 0
  } catch {
    return -1
  }
}

async function deleteRows(client: PoolClient, spec: TableSpec, ids: string[]): Promise<number> {
  try {
    if (spec.allRows) {
      const r = await client.query(`DELETE FROM ${spec.table}`)
      return r.rowCount ?? 0
    }
    const col = spec.col ?? 'tenant_id'
    const cond = spec.nullable
      ? `${col} IS NOT NULL AND NOT (${col} = ANY($1::text[]))`
      : `NOT (${col} = ANY($1::text[]))`
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
      `SELECT id_usuario, email_usuario, id_organizacao_usuario FROM usuario WHERE email_usuario = $1 LIMIT 1`,
      [PROTECTED_EMAIL]
    )

    let protectedIds: string[]

    if (userRes.rows.length > 0) {
      const { id_usuario, email_usuario, id_organizacao_usuario } = userRes.rows[0] as { id_usuario: string; email_usuario: string; id_organizacao_usuario: string }
      log.ok(`Usuário protegido: ${b(id_usuario)} (${email_usuario})`)
      protectedIds = [id_organizacao_usuario]
    } else {
      log.warn(`${b(PROTECTED_EMAIL)} NÃO encontrado no Configurador DB`)
      log.info('Fallback: protegendo TODOS os tenants existentes no Configurador')

      const allTenants = await configPool.query(`SELECT id_organizacao FROM organizacao`)
      protectedIds = allTenants.rows.map(r => r['id_organizacao'] as string)

      if (protectedIds.length === 0) {
        log.warn('Nenhum tenant no Configurador — banco vazio')
        protectedIds = ['__none__']
      }
    }

    // ── FASE 2: Entidades protegidas ──────────────────────────────────────────
    log.section('FASE 2 — ENTIDADES PROTEGIDAS')

    const tenantRows = await configPool.query(
      `SELECT id_organizacao, nome_organizacao, subdominio_organizacao FROM organizacao WHERE id_organizacao = ANY($1::text[])`,
      [protectedIds]
    )
    for (const row of tenantRows.rows) {
      log.ok(`Tenant protegido: ${b(row.id_organizacao)} — "${row.nome_organizacao}" (${row.subdominio_organizacao})`)
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
