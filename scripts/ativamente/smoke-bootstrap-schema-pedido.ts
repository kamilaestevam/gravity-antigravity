/**
 * smoke-bootstrap-schema-pedido.ts — Provisiona tenant local para smoke-kit-integracao-sap.
 *
 * - Schema: organizacao_smoketest (DDL completo do Pedido + coluna custom)
 * - Org configurador: SMOKE_ID_ORGANIZACAO (CUID fixo)
 * - Kit OAuth no ORGANIZACAO_DATABASE_URL
 *
 * Env:
 *   SMOKE_DATABASE_URL — banco Pedido (alternativa a DATABASE_URL)
 *   SMOKE_SKIP_BOOTSTRAP=1 — pula criacao do schema (banco ja provisionado)
 *   SMOKE_KEEP_SCHEMA=1 — nao faz DROP no teardown
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'
import {
  aplicarTodasMigrationsPedidoEmSchema,
  droparSchemaSeExistir,
} from './aplicar-migration-ddl-schemas-pedido.js'

const REPO = resolve(fileURLToPath(import.meta.url), '../../..')

/** Nome fisico do schema de smoke (legado organizacao_*). */
export const SMOKE_SCHEMA_PEDIDO = 'organizacao_smoketest'

/** CUID fixo (25 chars) — prefixo csmoketest para bypass S2S local. */
export const SMOKE_ID_ORGANIZACAO_PADRAO = 'csmoketest000000000000001'

export const SMOKE_SUBDOMINIO_ORGANIZACAO = 'smoketest-local'

/** Header repassado pelo proxy api-cockpit → pedido (sem reiniciar o servico). */
export const SMOKE_HEADER_SCHEMA_PEDIDO = 'x-gravity-smoke-schema-pedido'

export interface SmokeBootstrapContext {
  pedidoDatabaseUrl: string
  orgDatabaseUrl: string
  configuradorDatabaseUrl: string | undefined
  idOrganizacao: string
  schemaPedido: string
  bootstrapAplicado: boolean
}

export function isIdOrganizacaoSmoke(idOrganizacao: string): boolean {
  return idOrganizacao.startsWith('csmoketest')
}

export function montarHeadersProxySmoke(schemaPedido: string): Record<string, string> {
  return { [SMOKE_HEADER_SCHEMA_PEDIDO]: schemaPedido }
}

export function resolverUrlBancoSmokePedido(): string {
  const url =
    process.env.SMOKE_DATABASE_URL?.trim() ||
    process.env.PEDIDO_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim()
  if (!url) {
    throw new Error('[smoke-bootstrap] SMOKE_DATABASE_URL / PEDIDO_DATABASE_URL / DATABASE_URL ausente')
  }
  return url
}

export function resolverUrlBancoSmokeOrg(): string {
  const url = process.env.ORGANIZACAO_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim()
  if (!url) {
    throw new Error('[smoke-bootstrap] ORGANIZACAO_DATABASE_URL ausente para kit OAuth')
  }
  return url
}

export function resolverIdOrganizacaoSmoke(): string {
  return process.env.SMOKE_ID_ORGANIZACAO?.trim() || SMOKE_ID_ORGANIZACAO_PADRAO
}

export function devePularBootstrapSmoke(): boolean {
  return process.env.SMOKE_SKIP_BOOTSTRAP === '1'
}

export function deveManterSchemaSmoke(): boolean {
  return process.env.SMOKE_KEEP_SCHEMA === '1'
}

async function schemaTemTabelaPedido(pedidoUrl: string, schemaName: string): Promise<boolean> {
  const client = new Client({ connectionString: pedidoUrl })
  await client.connect()
  try {
    const { rows } = await client.query<{ ok: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM pg_namespace n
        INNER JOIN pg_class c ON c.relnamespace = n.oid
        WHERE n.nspname = $1 AND c.relname = 'pedido' AND c.relkind IN ('r', 'p')
      ) AS ok`,
      [schemaName],
    )
    return rows[0]?.ok === true
  } finally {
    await client.end()
  }
}

async function colunaCustomExiste(pedidoUrl: string, schemaName: string): Promise<boolean> {
  const client = new Client({ connectionString: pedidoUrl })
  await client.connect()
  try {
    const { rows } = await client.query<{ ok: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = 'pedido' AND column_name = 'custom'
      ) AS ok`,
      [schemaName],
    )
    return rows[0]?.ok === true
  } finally {
    await client.end()
  }
}

/** Garante tabelas do kit integracao SAP no banco org (public). */
export async function garantirKitIntegracaoOrg(orgUrl: string): Promise<void> {
  const migrationOrg = join(
    REPO,
    'servicos-global/servicos-plataforma/prisma/migrations/20260714180100_kit_integracao_sap_api_cockpit/migration.sql',
  )
  const migrationRename = join(
    REPO,
    'servicos-global/servicos-plataforma/prisma/migrations/20260714180200_rename_kit_integracao_ddd/migration.sql',
  )

  const client = new Client({ connectionString: orgUrl })
  await client.connect()
  try {
    const renameSql = readFileSync(migrationRename, 'utf-8')
    await client.query(renameSql).catch(() => undefined)

    const kitSql = readFileSync(migrationOrg, 'utf-8')
    try {
      await client.query(kitSql)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (!msg.includes('already exists')) throw err
    }
    console.log('[smoke-bootstrap] Kit integracao org OK (api_credencial_oauth + fila webhooks)')
  } finally {
    await client.end()
  }
}

/** Upsert organizacao ATIVO no Configurador para resolveOrganizacaoById. */
export async function garantirOrganizacaoConfigurador(
  configuradorUrl: string | undefined,
  idOrganizacao: string,
): Promise<void> {
  if (!configuradorUrl) {
    console.warn('[smoke-bootstrap] CONFIGURADOR_DATABASE_URL ausente — pulando upsert organizacao')
    return
  }

  const client = new Client({ connectionString: configuradorUrl })
  await client.connect()
  try {
    const subdominio = `${SMOKE_SUBDOMINIO_ORGANIZACAO}-${idOrganizacao.slice(0, 8)}`
    await client.query(
      `INSERT INTO organizacao (
        id_organizacao, nome_organizacao, subdominio_organizacao, status_organizacao,
        data_criacao_organizacao, data_atualizacao_organizacao
      ) VALUES ($1, $2, $3, 'ATIVO', NOW(), NOW())
      ON CONFLICT (id_organizacao) DO UPDATE SET
        status_organizacao = 'ATIVO',
        data_atualizacao_organizacao = NOW()`,
      [idOrganizacao, 'Smoke Test Integracao SAP', subdominio],
    )
    console.log(`[smoke-bootstrap] Organizacao ${idOrganizacao} ATIVO no Configurador`)
  } finally {
    await client.end()
  }
}

/** Provisiona schema organizacao_smoketest com todas as migrations do Pedido. */
export async function provisionarSchemaSmokePedido(
  pedidoUrl: string,
  schemaName = SMOKE_SCHEMA_PEDIDO,
): Promise<void> {
  const jaTemPedido = await schemaTemTabelaPedido(pedidoUrl, schemaName)
  const jaTemCustom = jaTemPedido ? await colunaCustomExiste(pedidoUrl, schemaName) : false

  if (jaTemPedido && jaTemCustom) {
    console.log(`[smoke-bootstrap] Schema "${schemaName}" ja provisionado (pedido + custom)`)
    return
  }

  if (jaTemPedido && !jaTemCustom) {
    console.log(`[smoke-bootstrap] Schema "${schemaName}" existe sem custom — aplicando migrations pendentes`)
  } else {
    console.log(`[smoke-bootstrap] Criando schema "${schemaName}"`)
  }

  await aplicarTodasMigrationsPedidoEmSchema(pedidoUrl, schemaName)
}

export async function provisionarSmokeTenantLocal(): Promise<SmokeBootstrapContext> {
  const pedidoDatabaseUrl = resolverUrlBancoSmokePedido()
  const orgDatabaseUrl = resolverUrlBancoSmokeOrg()
  const configuradorDatabaseUrl = process.env.CONFIGURADOR_DATABASE_URL?.trim()
  const idOrganizacao = resolverIdOrganizacaoSmoke()
  const schemaPedido = SMOKE_SCHEMA_PEDIDO

  await garantirKitIntegracaoOrg(orgDatabaseUrl)
  await garantirOrganizacaoConfigurador(configuradorDatabaseUrl, idOrganizacao)

  let bootstrapAplicado = false

  if (!devePularBootstrapSmoke()) {
    const jaTemPedido = await schemaTemTabelaPedido(pedidoDatabaseUrl, schemaPedido)
    const jaTemCustom = jaTemPedido ? await colunaCustomExiste(pedidoDatabaseUrl, schemaPedido) : false

    if (!jaTemPedido || !jaTemCustom) {
      if (jaTemPedido) {
        console.log(`[smoke-bootstrap] Removendo schema parcial "${schemaPedido}" antes do replay`)
        await droparSchemaSeExistir(pedidoDatabaseUrl, schemaPedido)
      }
      await provisionarSchemaSmokePedido(pedidoDatabaseUrl, schemaPedido)
      bootstrapAplicado = true
    } else {
      console.log(`[smoke-bootstrap] Schema "${schemaPedido}" ja provisionado — reutilizando`)
    }
  } else {
    console.log('[smoke-bootstrap] SMOKE_SKIP_BOOTSTRAP=1 — sem DDL')
  }

  await garantirStatusRascunhoSmoke(pedidoDatabaseUrl, schemaPedido, idOrganizacao)

  return {
    pedidoDatabaseUrl,
    orgDatabaseUrl,
    configuradorDatabaseUrl,
    idOrganizacao,
    schemaPedido,
    bootstrapAplicado,
  }
}

export async function teardownSmokeTenantLocal(ctx: SmokeBootstrapContext): Promise<void> {
  if (deveManterSchemaSmoke()) {
    console.log(`[smoke-bootstrap] SMOKE_KEEP_SCHEMA=1 — mantendo schema "${ctx.schemaPedido}"`)
    return
  }
  if (!ctx.bootstrapAplicado) {
    console.log('[smoke-bootstrap] Bootstrap nao aplicado nesta execucao — teardown ignorado')
    return
  }
  await droparSchemaSeExistir(ctx.pedidoDatabaseUrl, ctx.schemaPedido)
  console.log(`[smoke-bootstrap] Schema "${ctx.schemaPedido}" removido`)
}

/** Seed minimo de status_pedido para POST /pedidos no schema de smoke. */
export async function garantirStatusRascunhoSmoke(
  pedidoUrl: string,
  schemaName: string,
  idOrganizacao: string,
): Promise<void> {
  const client = new Client({ connectionString: pedidoUrl })
  await client.connect()
  try {
    await client.query(`SET search_path TO "${schemaName}", public`)
    const { rows } = await client.query<{ id_pedido_status: string }>(
      `SELECT id_pedido_status FROM status_pedido
       WHERE id_organizacao = $1 AND nome_pedido_status = 'rascunho' LIMIT 1`,
      [idOrganizacao],
    )
    if (rows.length > 0) return

    const idStatus = `psts${createHash('sha256').update(`${idOrganizacao}:rascunho`).digest('hex').slice(0, 20)}`
    await client.query(
      `INSERT INTO status_pedido (
        id_pedido_status, id_organizacao, nome_pedido_status, rotulo_pedido_status,
        cor_pedido_status, ordem_pedido_status, padrao_pedido_status, gerenciado_sistema_pedido_status,
        data_criacao_pedido_status, data_atualizacao_pedido_status
      ) VALUES ($1, $2, 'rascunho', 'Rascunho', '#64748b', 0, true, true, NOW(), NOW())
      ON CONFLICT (id_organizacao, nome_pedido_status) DO NOTHING`,
      [idStatus, idOrganizacao],
    )
    console.log(`[smoke-bootstrap] status rascunho garantido em ${schemaName}`)
  } finally {
    await client.end()
  }
}
