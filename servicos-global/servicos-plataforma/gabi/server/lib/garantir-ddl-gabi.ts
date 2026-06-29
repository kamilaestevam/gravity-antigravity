// DDL idempotente da migration GABI no schema tenant_* (fallback se boot não rodou migrate-all-tenants).

import { Client } from 'pg'
import { AppError } from './errors.js'
import {
  aplicarDdlGabiNoSchemaNome,
  gabiConversaExisteNoSchema,
} from './aplicar-ddl-gabi-schema.js'
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

  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    const existe = await gabiConversaExisteNoSchema(client, schemaName)
    if (!existe) {
      throw new AppError(
        'DDL GABI concluiu mas gabi_conversa ausente no schema da org',
        503,
        'GABI_DB_UNAVAILABLE',
      )
    }
  } finally {
    await client.end()
  }

  schemasComDdlAplicado.add(schemaName)
  const rotulo =
    result === 'skip' ? 'já existiam' : result === 'repair' ? 'drift reparado' : 'aplicadas'
  console.log(`[GABI/DDL] Tabelas garantidas no schema ${schemaName} (${rotulo})`)
}
