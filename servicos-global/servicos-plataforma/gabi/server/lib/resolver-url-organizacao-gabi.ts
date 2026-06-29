/** URL do banco servicos-plataforma (tenant_*). Prisma e DDL usam a mesma fonte. */
export function resolverUrlOrganizacaoGabi(): string | undefined {
  return (
    process.env.ORGANIZACAO_DATABASE_URL ??
    process.env.SERVICOS_PLATAFORMA_DATABASE_URL ??
    process.env.TENANT_DATABASE_URL ??
    process.env.DATABASE_URL
  )
}

/** Garante ORGANIZACAO_DATABASE_URL no processo antes do PrismaClient / DDL. */
export function sincronizarEnvOrganizacaoGabi(): void {
  const url = resolverUrlOrganizacaoGabi()
  if (!url) return
  if (!process.env.ORGANIZACAO_DATABASE_URL) {
    process.env.ORGANIZACAO_DATABASE_URL = url
  }
}
