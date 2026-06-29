// DDL idempotente da migration GABI no schema tenant_* (fallback se boot não rodou migrate-all-tenants).

import { AppError } from './errors.js'
import { aplicarDdlGabiNoSchemaNome } from './aplicar-ddl-gabi-schema.js'
import { resolverNomeSchemaOrganizacao } from './nome-schema-organizacao.js'

const schemasComDdlAplicado = new Set<string>()

/** Aplica migration GABI no schema da org (no máximo 1× por processo/schema). */
export async function garantirDdlGabiNoSchema(idOrganizacao: string): Promise<void> {
  const schemaName = resolverNomeSchemaOrganizacao(idOrganizacao)
  if (schemasComDdlAplicado.has(schemaName)) return

  const url = process.env.ORGANIZACAO_DATABASE_URL
  if (!url) {
    throw new AppError(
      'ORGANIZACAO_DATABASE_URL ausente — DDL GABI indisponível',
      503,
      'GABI_DB_UNAVAILABLE',
    )
  }

  const result = await aplicarDdlGabiNoSchemaNome(url, schemaName)
  schemasComDdlAplicado.add(schemaName)
  console.log(
    `[GABI/DDL] Tabelas garantidas no schema ${schemaName} (${result === 'skip' ? 'já existiam' : 'aplicadas'})`,
  )
}
