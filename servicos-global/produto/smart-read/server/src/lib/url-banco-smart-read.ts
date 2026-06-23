/**
 * URL do Postgres Smart Read (gravity-smart-read-producao / -teste).
 *
 * Em Railway/produção NÃO faz fallback para DATABASE_URL do Configurador —
 * isso gerava queries em banco sem as tabelas do produto (500 "table does not exist").
 */
function urlExplicitaSmartRead(): string | undefined {
  const url = process.env.SMART_READ_DATABASE_URL?.trim()
  return url || undefined
}

function ambienteProducao(): boolean {
  return Boolean(process.env.RAILWAY_ENVIRONMENT) || process.env.NODE_ENV === 'production'
}

export function resolverUrlBancoSmartRead(): string {
  const explicita = urlExplicitaSmartRead()
  const url = explicita ?? (ambienteProducao() ? undefined : process.env.DATABASE_URL)
  if (!url) {
    throw new Error(
      '[SmartRead] SMART_READ_DATABASE_URL ausente — configure no Railway (gravity-smart-read-producao)',
    )
  }
  if (/connect_timeout=/i.test(url)) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}connect_timeout=30`
}

export function bancoSmartReadConfigurado(): boolean {
  if (urlExplicitaSmartRead()) return true
  if (ambienteProducao()) return false
  return Boolean(process.env.DATABASE_URL)
}
