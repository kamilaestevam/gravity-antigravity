// Espelho de scripts/ativamente/lib/nome-schema-organizacao.ts (sem import cross-boundary no runtime).

import { AppError } from './errors.js'

const CUID_ORG_REGEX = /^[a-z][a-z0-9]{22,24}$/
const UUID_ORG_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

const SCHEMA_ORG_REGEX =
  /^tenant_([a-z][a-z0-9]{22,24}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/

export function resolverNomeSchemaOrganizacao(idOrganizacao: string): string {
  if (!CUID_ORG_REGEX.test(idOrganizacao) && !UUID_ORG_REGEX.test(idOrganizacao)) {
    throw new AppError('id_organizacao inválido para schema GABI', 400, 'INVALID_ORGANIZACAO_ID')
  }
  const schemaName = `tenant_${idOrganizacao}`
  if (!SCHEMA_ORG_REGEX.test(schemaName)) {
    throw new AppError('nome de schema inválido para GABI', 400, 'INVALID_ORGANIZACAO_ID')
  }
  return schemaName
}
