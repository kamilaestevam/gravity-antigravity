/**
 * Classifica erros Prisma do banco ORGANIZACAO — evita 500 genérico em drift de schema.
 */

const CODIGOS_SCHEMA_DRIFT = new Set(['P2021', 'P2022', 'P2010', 'P2011', 'P2019'])

export function isErroPrismaSchemaOrganizacao(err: unknown): boolean {
  if (err == null || typeof err !== 'object') return false
  const code = 'code' in err ? String((err as { code: unknown }).code) : ''
  if (CODIGOS_SCHEMA_DRIFT.has(code)) return true
  const message = err instanceof Error ? err.message : String(err)
  return (
    message.includes('does not exist') ||
    message.includes('não existe') ||
    message.includes('column') && message.includes('historico_log')
  )
}

export function isErroTabelaHistoricoAusente(err: unknown): boolean {
  return (
    err != null &&
    typeof err === 'object' &&
    'code' in err &&
    (err as { code: string }).code === 'P2021'
  )
}
