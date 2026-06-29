/**
 * Aplica migration GABI (gabi_conversa, gabi_mensagem, …) em cada schema tenant_*
 * do banco ORGANIZACAO_DATABASE_URL.
 *
 * migrate deploy só grava em public; o sidecar GABI usa SET search_path no schema da org.
 * Sem este passo, produção retorna 503 GABI_DB_UNAVAILABLE após o hotfix #524.
 */
import { Client } from 'pg'
import {
  aplicarDdlGabiNoSchemaNome,
  MIGRATION_GABI_DDD,
} from '../../servicos-global/servicos-plataforma/gabi/server/lib/aplicar-ddl-gabi-schema.ts'
import {
  nomeSchemaOrganizacao,
  schemaOrganizacaoValido,
} from './lib/nome-schema-organizacao.js'

export const MIGRATION_GABI_DDD_CONVERSA = MIGRATION_GABI_DDD

function mascararUrl(url: string): string {
  const host = url.split('@')[1]?.split('/')[0]
  return host ? `***@${host}` : '(invalida)'
}

async function listarSchemasTenantNoBanco(client: Client): Promise<string[]> {
  const { rows } = await client.query<{ schema_name: string }>(`
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name LIKE 'tenant_%'
    ORDER BY schema_name
  `)
  return rows.map((r) => r.schema_name).filter(schemaOrganizacaoValido)
}

async function listarSchemasOrgsAtivasConfigurador(
  configuradorUrl: string,
): Promise<string[]> {
  const cfg = new Client({ connectionString: configuradorUrl })
  await cfg.connect()
  const schemas: string[] = []
  try {
    const { rows } = await cfg.query<{ id: string }>(
      `SELECT id_organizacao AS id
       FROM organizacao
       WHERE status_organizacao = 'ATIVO'`,
    )
    for (const { id } of rows) {
      const schemaName = nomeSchemaOrganizacao(id)
      if (schemaName) schemas.push(schemaName)
    }
  } finally {
    await cfg.end()
  }
  return schemas
}

export async function aplicarMigrationGabiEmSchemasOrganizacao(
  organizacaoUrl: string,
  configuradorUrl?: string,
): Promise<void> {
  const logPrefix = 'ddl-gabi-organizacao'

  console.log(`[${logPrefix}] Banco: ${mascararUrl(organizacaoUrl)}`)

  const client = new Client({ connectionString: organizacaoUrl })
  await client.connect()

  try {
    const fromDb = await listarSchemasTenantNoBanco(client)
    const fromCfg =
      configuradorUrl && configuradorUrl.length > 0
        ? await listarSchemasOrgsAtivasConfigurador(configuradorUrl)
        : []

    const schemas = [...new Set([...fromDb, ...fromCfg])].sort()
    console.log(`[${logPrefix}] Schemas a processar (${MIGRATION_GABI_DDD_CONVERSA}): ${schemas.length}`)

    if (schemas.length === 0) {
      console.warn(`[${logPrefix}] Nenhum schema tenant_* — tentando orgs ATIVO apenas.`)
    }

    let ok = 0
    let skip = 0
    let repair = 0
    for (const schemaName of schemas) {
      const result = await aplicarDdlGabiNoSchemaNome(organizacaoUrl, schemaName)
      if (result === 'ok') ok++
      else if (result === 'repair') repair++
      else skip++
      if (result !== 'skip') {
        console.log(`[${logPrefix}] ${schemaName} — ${result === 'repair' ? 'DRIFT REPARADO' : 'OK'}`)
      }
    }

    console.log(
      `[${logPrefix}] Concluído: ${ok} aplicada(s), ${repair} drift reparado(s), ${skip} já existente(s).`,
    )
  } finally {
    await client.end()
  }
}

async function main(): Promise<void> {
  const organizacaoUrl = process.env.ORGANIZACAO_DATABASE_URL ?? process.env.DATABASE_URL
  const configuradorUrl = process.env.CONFIGURADOR_DATABASE_URL

  if (!organizacaoUrl) {
    console.error('[ddl-gabi-organizacao] ORGANIZACAO_DATABASE_URL ausente.')
    process.exit(1)
  }

  await aplicarMigrationGabiEmSchemasOrganizacao(organizacaoUrl, configuradorUrl)
}

const isMain =
  process.argv[1]?.replace(/\\/g, '/').endsWith('aplicar-migration-gabi-organizacao.ts') ?? false

if (isMain) {
  main().catch((err) => {
    console.error('[ddl-gabi-organizacao] Erro fatal:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
