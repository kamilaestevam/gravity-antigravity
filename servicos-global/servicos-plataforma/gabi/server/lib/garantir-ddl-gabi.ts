// DDL idempotente da migration GABI no schema tenant_* (fallback se boot não rodou migrate-all-tenants).

import { Client } from 'pg'
import { AppError } from './errors.js'
import {
  aplicarDdlGabiNoSchemaNome,
  gabiConversaExisteNoSchema,
} from './aplicar-ddl-gabi-schema.js'
import { aplicarDdlGabiMinimoQualificado } from './gabi-ddl-minimo-qualificado.js'
import { resolverNomeSchemaOrganizacao } from './nome-schema-organizacao.js'
import prisma from './prisma.js'
import {
  resolverUrlOrganizacaoGabi,
  sincronizarEnvOrganizacaoGabi,
} from './resolver-url-organizacao-gabi.js'

const schemasComDdlAplicado = new Set<string>()

async function verificarGabiConversaViaPrisma(idOrganizacao: string): Promise<void> {
  const schemaName = resolverNomeSchemaOrganizacao(idOrganizacao)
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)
    await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
    await tx.$queryRawUnsafe(`SELECT 1 FROM gabi_conversa LIMIT 1`)
  })
}

/** Aplica migration GABI no schema da org (no máximo 1× por processo/schema após Prisma OK). */
export async function garantirDdlGabiNoSchema(idOrganizacao: string): Promise<void> {
  sincronizarEnvOrganizacaoGabi()
  const schemaName = resolverNomeSchemaOrganizacao(idOrganizacao)
  const url = resolverUrlOrganizacaoGabi()

  if (!url) {
    throw new AppError(
      'URL do banco organização ausente — DDL GABI indisponível',
      503,
      'GABI_DB_UNAVAILABLE',
    )
  }

  if (schemasComDdlAplicado.has(schemaName)) {
    try {
      await verificarGabiConversaViaPrisma(idOrganizacao)
      return
    } catch {
      schemasComDdlAplicado.delete(schemaName)
      console.warn(`[GABI/DDL] Cache invalidado para ${schemaName} — Prisma não vê gabi_conversa`)
    }
  }

  const result = await aplicarDdlGabiNoSchemaNome(url, schemaName)

  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    const existe = await gabiConversaExisteNoSchema(client, schemaName)
    if (!existe) {
      console.warn(`[GABI/DDL] migration não criou gabi_conversa em ${schemaName} — DDL mínimo qualificado`)
      await aplicarDdlGabiMinimoQualificado(client, schemaName)
      const existeAposMinimo = await gabiConversaExisteNoSchema(client, schemaName)
      if (!existeAposMinimo) {
        throw new AppError(
          'DDL GABI concluiu mas gabi_conversa ausente no schema da org',
          503,
          'GABI_DB_UNAVAILABLE',
        )
      }
    }
  } finally {
    await client.end()
  }

  try {
    await verificarGabiConversaViaPrisma(idOrganizacao)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new AppError(
      `Prisma não acessa gabi_conversa após DDL (${msg})`,
      503,
      'GABI_DB_UNAVAILABLE',
    )
  }

  schemasComDdlAplicado.add(schemaName)
  const rotulo =
    result === 'skip' ? 'já existiam' : result === 'repair' ? 'drift reparado' : 'aplicadas'
  console.log(`[GABI/DDL] Tabelas garantidas no schema ${schemaName} (${rotulo})`)
}
