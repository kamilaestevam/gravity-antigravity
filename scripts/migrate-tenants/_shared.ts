/**
 * _shared.ts — Utilitários compartilhados para os scripts de migração Schema-per-Tenant.
 * ADR-003: https://github.com/gravity/documentos-tecnicos/adr/ADR-003-migracao-dados-legados.md
 *
 * Uso interno — não importar fora de scripts/migrate-tenants/.
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Pool, type PoolClient } from 'pg'

// ── ANSI ─────────────────────────────────────────────────────────────────────
const R = '\x1b[0m'
export const b     = (s: string) => `\x1b[1m${s}${R}`
export const red   = (s: string) => `\x1b[31m${s}${R}`
export const green = (s: string) => `\x1b[32m${s}${R}`
export const yellow = (s: string) => `\x1b[33m${s}${R}`
export const cyan  = (s: string) => `\x1b[36m${s}${R}`
export const gray  = (s: string) => `\x1b[90m${s}${R}`

export const log = {
  ok:      (msg: string) => console.log(`  ${green('✔')} ${msg}`),
  warn:    (msg: string) => console.log(`  ${yellow('⚠')} ${msg}`),
  info:    (msg: string) => console.log(`  ${cyan('ℹ')} ${msg}`),
  error:   (msg: string) => console.log(`  ${red('✖')} ${msg}`),
  skip:    (msg: string) => console.log(`  ${gray('·')} ${msg}`),
  section: (msg: string) => console.log(`\n${b(cyan(`━━━  ${msg}  ━━━`))}\n`),
  row:     (label: string, value: string) => console.log(`  ${gray(label.padEnd(40))} ${value}`),
}

// ── Env loading ───────────────────────────────────────────────────────────────
export function loadEnv(relPath: string): Record<string, string> {
  try {
    const abs = resolve(process.cwd(), relPath)
    return Object.fromEntries(
      readFileSync(abs, 'utf-8')
        .split('\n')
        .filter((l) => l.includes('=') && !l.startsWith('#'))
        .map((l) => {
          const i = l.indexOf('=')
          return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
        }),
    )
  } catch {
    return {}
  }
}

export function resolveEnvs(): { configuradorUrl: string; sharedUrl: string } {
  const env = {
    ...loadEnv('configurador/.env'),
    ...loadEnv('produto/pedido/server/.env'),
    ...loadEnv('.env.local'),
  }
  const configuradorUrl = env['CONFIGURADOR_DATABASE_URL'] ?? ''
  const sharedUrl       = env['DATABASE_URL'] ?? ''

  if (!configuradorUrl) throw new Error('CONFIGURADOR_DATABASE_URL não encontrado')
  if (!sharedUrl)       throw new Error('DATABASE_URL não encontrado')

  return { configuradorUrl, sharedUrl }
}

// ── Schema name ───────────────────────────────────────────────────────────────
/** Mesmo regex do SDK — defesa contra SQL injection. */
const SCHEMA_NAME_REGEX = /^tenant_c[a-z0-9]{24}$/

export function buildSchemaName(tenantId: string): string {
  const name = `tenant_${tenantId}`
  if (!SCHEMA_NAME_REGEX.test(name)) {
    throw new Error(`ID de tenant inválido para schema: "${tenantId}"`)
  }
  return name
}

// ── Tabelas do Shared DB ──────────────────────────────────────────────────────
/** Tabelas com tenant_id — backfill direto por tenant. Ordem leaf-first. */
export const TABLES_WITH_TENANT_ID: readonly string[] = [
  // Pedido — folhas primeiro
  'tracking_items_transferidos',
  'valor_coluna_usuario_pedido',
  'coluna_usuario_pedido',
  'pedido_itens',
  'pedido_colunas',
  'status_pedido',
  'preferencia_coluna_pedido',
  'preferencia_padrao_pedido',
  'pedido_casas_decimais',
  'pedido_saldo_formula',
  'aprendizado_importacao_dados',
  'container_processo',
  'fatura_processo',
  'tabela_processos',
  'pedido_produto_gravity',
  'logistica_processo',
  'atividades_dados',
  'atividades_timer',
  'atividades_cronometro',
  'anexo_pedido',
  'dashboard_painel',
  'dashboard_preferencias',
  'kanban_preferencias',
  'template_pedido_pdf',
  // Tenant services
  'alerta_data',
  'alerta_regra',
  'dashboard_alertas',
  'dashboard_metricas',
  'dashboard_compartilhar',
  'dashboard_criar',
  'dashboard_configuracao',
  'email_registro_envio',
  'email_fila_envio',
  'email_mensagem',
  'email_assuntos_participantes',
  'template_email',
  'whatsapp_log',
  'whatsapp_mensagem',
  'whatsapp_conversa',
  'whatsapp_regra',
  'exportar_resultado',
  'exportar_job',
  'relatorios_configuracao',
  'relatorios_salvos',
  'tempo_criacao_relatorio',
  'historico_log',
  'reserva_agenda',
  'horario_disponivel',
  'agenda_usuario',
  'config_disponibilidade_agenda',
  'mensagem_individual_gabiai',
  'conversa_completa_gabi',
  'gabiai_token_consumidos',
  'gabiai_token_workspace',
  'gabiai_log_uso',
  'personalizacao_organizacao_gabiai',
  'preferencia_workspace',
  'ncm_agendamento',
  'ncm_log',
  'ncm_item',        // tem tenant_id (dados por tenant)
  'notificacoes_titulo_corpo',
  'contato_externo',
  'configuracao_canal_tenant',
] as const

/** Tabelas SEM tenant_id — backfill via FK a partir de tabelas pai. */
export const TABLES_WITHOUT_TENANT_ID: readonly string[] = [
  'atividades_participantes', // FK → atividades_dados
  'atividades_tempo',         // FK → atividades_dados
  'alerta_registro',          // FK → alerta_data
] as const

/** Tabelas que ficam APENAS no public (referência global ou infra). */
export const TABLES_GLOBAL_ONLY: readonly string[] = [
  '_prisma_migrations',
  '_schema_migration_status',
] as const

/** Mapeamento FK: tabela sem tenant_id → { coluna FK, tabela pai } */
export const FK_DEPS: Record<string, { fkCol: string; parentTable: string; parentPkCol: string }> = {
  atividades_participantes: { fkCol: 'atividade_id',    parentTable: 'atividades_dados', parentPkCol: 'id' },
  atividades_tempo:         { fkCol: 'atividade_id',    parentTable: 'atividades_dados', parentPkCol: 'id' },
  alerta_registro:          { fkCol: 'alert_event_id',  parentTable: 'alerta_data',      parentPkCol: 'id' },
}

// ── _schema_migration_status ──────────────────────────────────────────────────
export type MigrationStatus =
  | 'PROVISIONED'
  | 'BACKFILL_PARTIAL'
  | 'BACKFILLED'
  | 'CUTOVER'

export async function ensureMigrationStatusTable(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _schema_migration_status (
      tenant_id           TEXT        NOT NULL PRIMARY KEY,
      schema_name         TEXT        NOT NULL,
      status              TEXT        NOT NULL DEFAULT 'PROVISIONED',
      tables_provisioned  INTEGER     NOT NULL DEFAULT 0,
      rows_copied         BIGINT      NOT NULL DEFAULT 0,
      rows_public         BIGINT      NOT NULL DEFAULT 0,
      parity_pct          NUMERIC(5,2),
      cutover_at          TIMESTAMPTZ,
      notes               TEXT,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

export interface TenantRow {
  tenant_id: string
  schema_name: string
  status: MigrationStatus
  tables_provisioned: number
  rows_copied: bigint
  rows_public: bigint
  parity_pct: string | null
}

export async function getTenants(
  client: PoolClient,
  statusFilter?: MigrationStatus[],
): Promise<TenantRow[]> {
  const where = statusFilter && statusFilter.length > 0
    ? `WHERE status = ANY($1::text[])`
    : ''
  const params = statusFilter && statusFilter.length > 0 ? [statusFilter] : []
  const r = await client.query<TenantRow>(
    `SELECT tenant_id, schema_name, status, tables_provisioned, rows_copied, rows_public, parity_pct
     FROM _schema_migration_status ${where}
     ORDER BY created_at`,
    params,
  )
  return r.rows
}

export function makePool(url: string): Pool {
  return new Pool({ connectionString: url, max: 5 })
}

export const IS_DRY_RUN = !process.argv.includes('--execute')
