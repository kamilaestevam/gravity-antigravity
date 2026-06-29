/**
 * Resolve ORGANIZACAO_DATABASE_URL a partir de aliases Railway e evita
 * fallback silencioso para o banco do configurador em produção.
 */

function emProducao(): boolean {
  return process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT)
}

export function resolverUrlOrganizacao(opcoes?: {
  permitirFallbackConfigurador?: boolean
}): string | undefined {
  const direta = process.env.ORGANIZACAO_DATABASE_URL?.trim()
  if (direta) return direta

  const alias =
    process.env.SERVICOS_PLATAFORMA_DATABASE_URL?.trim() ??
    process.env.TENANT_DATABASE_URL?.trim()
  if (alias) return alias

  const permitirFallback =
    opcoes?.permitirFallbackConfigurador ?? !emProducao()
  if (permitirFallback) {
    const configurador =
      process.env.CONFIGURADOR_DATABASE_URL?.trim() ??
      process.env.DATABASE_URL?.trim()
    if (configurador) return configurador
  }

  return undefined
}

/** Grava ORGANIZACAO_DATABASE_URL em process.env quando resolvida. */
export function sincronizarEnvOrganizacao(permitirFallbackConfigurador?: boolean): string | undefined {
  const url = resolverUrlOrganizacao({ permitirFallbackConfigurador })
  if (url) {
    process.env.ORGANIZACAO_DATABASE_URL = url
  }
  return url
}

export function urlsOrganizacaoECconfiguradorCoincidem(): boolean {
  const org = process.env.ORGANIZACAO_DATABASE_URL?.trim()
  const cfg =
    process.env.CONFIGURADOR_DATABASE_URL?.trim() ??
    process.env.DATABASE_URL?.trim()
  return Boolean(org && cfg && org === cfg)
}
