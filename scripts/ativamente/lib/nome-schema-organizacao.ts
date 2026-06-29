/**
 * Nome físico do schema PostgreSQL — espelha packages/resolver-organizacao/src/schema-name.ts
 * e scripts/ativamente/aplicar-migration-ddl-schemas-pedido.ts (CUID + UUID).
 */

const CUID_ORG_REGEX = /^[a-z][a-z0-9]{22,24}$/
const UUID_ORG_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export const SCHEMA_ORG_REGEX =
  /^tenant_([a-z][a-z0-9]{22,24}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/

export function nomeSchemaOrganizacao(idOrganizacao: string): string | null {
  if (!CUID_ORG_REGEX.test(idOrganizacao) && !UUID_ORG_REGEX.test(idOrganizacao)) {
    return null
  }
  const schemaName = `tenant_${idOrganizacao}`
  return SCHEMA_ORG_REGEX.test(schemaName) ? schemaName : null
}

export function idOrganizacaoDeNomeSchema(schemaName: string): string | null {
  const m = schemaName.match(/^tenant_(.+)$/)
  if (!m) return null
  const id = m[1]
  return nomeSchemaOrganizacao(id) ? id : null
}

export function schemaOrganizacaoValido(schemaName: string): boolean {
  return SCHEMA_ORG_REGEX.test(schemaName)
}
