/**
 * URL do Postgres Smart Read (gravity-smart-read-producao / -teste).
 */
export function resolverUrlBancoSmartRead(): string {
  const url = process.env.SMART_READ_DATABASE_URL ?? process.env.DATABASE_URL
  if (!url) {
    throw new Error('[SmartRead] SMART_READ_DATABASE_URL ou DATABASE_URL ausente')
  }
  if (/connect_timeout=/i.test(url)) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}connect_timeout=30`
}

export function bancoSmartReadConfigurado(): boolean {
  return Boolean(process.env.SMART_READ_DATABASE_URL ?? process.env.DATABASE_URL)
}
